from datetime import datetime, date
from decimal import Decimal
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.register import Register
from app.models.sale import Sale
from app.schemas.register import RegisterOpen, RegisterSummary

class RegisterController:
    @staticmethod
    def get_active_register(db: Session) -> Register | None:
        return db.query(Register).filter(Register.status == "OPEN").first()

    @staticmethod
    def open_register(db: Session, payload: RegisterOpen) -> Register:
        active = RegisterController.get_active_register(db)
        if active:
            raise HTTPException(
                status_code=400,
                detail=f"Já existe um caixa aberto para o dia {active.date} (ID: {active.id}). Feche-o antes de abrir outro."
            )

        today_str = date.today().isoformat()
        new_register = Register(
            date=today_str,
            opening_balance=payload.opening_balance,
            current_balance=payload.opening_balance,
            status="OPEN",
            opened_at=datetime.utcnow()
        )
        db.add(new_register)
        db.commit()
        db.refresh(new_register)
        return new_register

    @staticmethod
    def get_summary(db: Session, register_id: int) -> RegisterSummary:
        register = db.query(Register).filter(Register.id == register_id).first()
        if not register:
            raise HTTPException(status_code=404, detail="Caixa não encontrado.")

        sales = db.query(Sale).filter(Sale.register_id == register.id).all()
        
        total_count = len(sales)
        total_amount = sum((s.total for s in sales), Decimal("0.00"))
        
        total_money = sum((s.total for s in sales if s.payment_method == "MONEY"), Decimal("0.00"))
        total_pix = sum((s.total for s in sales if s.payment_method == "PIX"), Decimal("0.00"))
        total_card = sum((s.total for s in sales if s.payment_method in ("CREDIT_CARD", "DEBIT_CARD")), Decimal("0.00"))
        
        current_cash_in_drawer = register.opening_balance + total_money

        return RegisterSummary(
            register_id=register.id,
            date=register.date,
            status=register.status,
            opening_balance=register.opening_balance,
            total_sales_count=total_count,
            total_sales_amount=total_amount,
            total_money=total_money,
            total_pix=total_pix,
            total_card=total_card,
            current_cash_in_drawer=current_cash_in_drawer
        )
