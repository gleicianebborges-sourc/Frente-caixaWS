from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.sale import SaleCreate, SaleResponse
from app.controllers.sale_controller import SaleController

router = APIRouter(prefix="/sales", tags=["Vendas / Sales"])

@router.post("", response_model=SaleResponse, status_code=201)
def create_sale(payload: SaleCreate, db: Session = Depends(get_db)):
    """
    Registra uma venda com cálculo de troco e aprendizado automático do catálogo de roupas.
    """
    return SaleController.create_sale(db, payload)

@router.get("", response_model=list[SaleResponse])
def list_sales(
    register_id: int | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """Lista histórico de vendas recentes."""
    return SaleController.list_sales(db, register_id=register_id, limit=limit)
