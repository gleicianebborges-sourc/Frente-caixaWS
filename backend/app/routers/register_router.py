from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.register import RegisterOpen, RegisterResponse, RegisterSummary
from app.controllers.register_controller import RegisterController

router = APIRouter(prefix="/register", tags=["Caixa / Register"])

@router.get("/active", response_model=RegisterResponse | None)
def get_active_register(db: Session = Depends(get_db)):
    """Retorna o caixa atualmente aberto, ou null se estiver fechado."""
    return RegisterController.get_active_register(db)

@router.post("/open", response_model=RegisterResponse, status_code=201)
def open_register(payload: RegisterOpen, db: Session = Depends(get_db)):
    """Abre o caixa do dia informando o saldo inicial em gaveta."""
    return RegisterController.open_register(db, payload)

@router.get("/{register_id}/summary", response_model=RegisterSummary)
def get_register_summary(register_id: int, db: Session = Depends(get_db)):
    """Obtém resumo financeiro consolidado do caixa."""
    return RegisterController.get_summary(db, register_id)
