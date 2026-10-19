from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.register import Register
from app.models.sale import Sale, SaleItem
from app.models.catalog import ClothingCatalog
from app.schemas.sale import SaleCreate
from app.utils.normalization import normalize_canonical_name, format_title_name

def round_money(val: Decimal) -> Decimal:
    return val.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

class SaleController:
    @staticmethod
    def create_sale(db: Session, payload: SaleCreate) -> Sale:
        # 1. Valida se há um caixa aberto no momento
        active_register = db.query(Register).filter(Register.status == "OPEN").first()
        if not active_register:
            raise HTTPException(
                status_code=400,
                detail="Operação não permitida: Nenhum caixa aberto no momento. Abra o caixa antes de registrar vendas."
            )

        if not payload.items:
            raise HTTPException(status_code=400, detail="A venda deve conter pelo menos um item.")

        # 2. Calcula subtotal e valida itens com precisão monetária Decimal
        subtotal = Decimal("0.00")
        sale_items: list[SaleItem] = []

        for item_in in payload.items:
            clean_name = item_in.product_name.strip()
            if not clean_name:
                raise HTTPException(status_code=400, detail="O nome do produto não pode ser vazio.")
            
            unit_price = round_money(item_in.unit_price)
            if unit_price <= 0:
                raise HTTPException(status_code=400, detail=f"O preço do item '{clean_name}' deve ser maior que zero.")
            
            item_subtotal = round_money(unit_price * Decimal(item_in.quantity))
            subtotal += item_subtotal

            sale_items.append(
                SaleItem(
                    product_name=clean_name,
                    unit_price=unit_price,
                    quantity=item_in.quantity,
                    subtotal=item_subtotal
                )
            )

        subtotal = round_money(subtotal)
        discount = round_money(payload.discount or Decimal("0.00"))
        
        if discount > subtotal:
            raise HTTPException(status_code=400, detail="O desconto não pode ser superior ao subtotal da venda.")

        total = round_money(subtotal - discount)

        # 3. Validação de pagamento e cálculo de troco
        payment_method = payload.payment_method.upper().strip()
        valid_methods = {"PIX", "MONEY", "CREDIT_CARD", "DEBIT_CARD"}
        if payment_method not in valid_methods:
            raise HTTPException(
                status_code=400,
                detail=f"Forma de pagamento inválida. Opções aceitas: {', '.join(valid_methods)}"
            )

        amount_paid = round_money(payload.amount_paid or total)
        change_amount = Decimal("0.00")

        if payment_method == "MONEY":
            if amount_paid < total:
                raise HTTPException(
                    status_code=400,
                    detail=f"Valor recebido em dinheiro (R$ {amount_paid}) é menor que o total da venda (R$ {total})."
                )
            change_amount = round_money(amount_paid - total)
        else:
            amount_paid = total
            change_amount = Decimal("0.00")

        # 4. Criação da Venda no Caixa Ativo
        new_sale = Sale(
            register_id=active_register.id,
            timestamp=datetime.utcnow(),
            payment_method=payment_method,
            subtotal=subtotal,
            discount=discount,
            total=total,
            amount_paid=amount_paid,
            change_amount=change_amount,
            items=sale_items
        )

        db.add(new_sale)

        # Atualiza o saldo do caixa (se pagamento em dinheiro)
        if payment_method == "MONEY":
            active_register.current_balance = round_money(active_register.current_balance + total)

        # 5. AUTO-ALIMENTAÇÃO ATÔMICA DO CATÁLOGO (Learning from Sales)
        # Sempre que uma peça for vendida, aprende ou atualiza o catálogo
        SaleController._learn_catalog_from_items(db, payload.items)

        db.commit()
        db.refresh(new_sale)
        return new_sale

    @staticmethod
    def _learn_catalog_from_items(db: Session, items: list) -> None:
        """
        Rotina inteligente de auto-aprendizado e desduplicação (Anti-Repetição):
        1. Normalização prévia (chave canônica sem acentos, lowercase, sem espaços extras).
        2. Pesquisa por canonical_name:
           - SE JÁ EXISTE: Não duplica! Incrementa times_sold (+ item.quantity), atualiza default_price e last_sold_at.
           - SE NÃO EXISTE: Insere novo registro com canonical_name, display name formatado (Title Case), default_price e times_sold inicial.
        """
        for item in items:
            raw_name = item.product_name
            canonical_key = normalize_canonical_name(raw_name)
            if not canonical_key:
                continue

            unit_price = round_money(item.unit_price)

            existing_catalog_item = (
                db.query(ClothingCatalog)
                .filter(ClothingCatalog.canonical_name == canonical_key)
                .first()
            )

            now = datetime.utcnow()
            if existing_catalog_item:
                existing_catalog_item.times_sold += item.quantity
                existing_catalog_item.default_price = unit_price
                existing_catalog_item.last_sold_at = now
            else:
                formatted_name = format_title_name(raw_name)
                new_catalog_entry = ClothingCatalog(
                    canonical_name=canonical_key,
                    name=formatted_name,
                    default_price=unit_price,
                    times_sold=item.quantity,
                    category="Geral",
                    last_sold_at=now
                )
                db.add(new_catalog_entry)

    @staticmethod
    def list_sales(db: Session, register_id: int | None = None, limit: int = 100) -> list[Sale]:
        query = db.query(Sale)
        if register_id:
            query = query.filter(Sale.register_id == register_id)
        return query.order_by(Sale.timestamp.desc()).limit(limit).all()
