from datetime import datetime
from decimal import Decimal
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.register import Register
from app.models.sale import Sale
from app.models.closure import Closure
from app.schemas.closure import ClosureCreate
from app.controllers.sale_controller import round_money

class ClosureController:
    @staticmethod
    def close_register(db: Session, register_id: int, payload: ClosureCreate) -> Closure:
        register = db.query(Register).filter(Register.id == register_id).first()
        if not register:
            raise HTTPException(status_code=404, detail="Caixa não encontrado.")

        if register.status == "CLOSED":
            raise HTTPException(status_code=400, detail="Este caixa já foi fechado.")

        sales = db.query(Sale).filter(Sale.register_id == register.id).all()

        total_sales = sum((s.total for s in sales), Decimal("0.00"))
        total_money = sum((s.total for s in sales if s.payment_method == "MONEY"), Decimal("0.00"))
        total_pix = sum((s.total for s in sales if s.payment_method == "PIX"), Decimal("0.00"))
        total_card = sum((s.total for s in sales if s.payment_method in ("CREDIT_CARD", "DEBIT_CARD")), Decimal("0.00"))

        expected_cash = round_money(register.opening_balance + total_money)
        reported_cash = round_money(payload.reported_cash)
        difference = round_money(reported_cash - expected_cash)

        now = datetime.utcnow()
        register.status = "CLOSED"
        register.closed_at = now

        closure = Closure(
            register_id=register.id,
            closed_at=now,
            expected_cash=expected_cash,
            reported_cash=reported_cash,
            difference=difference,
            total_sales=total_sales,
            total_money=total_money,
            total_pix=total_pix,
            total_card=total_card,
            notes=payload.notes
        )

        db.add(closure)
        db.commit()
        db.refresh(closure)
        return closure
