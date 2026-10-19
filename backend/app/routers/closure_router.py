from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.closure import ClosureCreate, ClosureResponse
from app.controllers.closure_controller import ClosureController

router = APIRouter(prefix="/closure", tags=["Fechamento / Closure"])

@router.post("/{register_id}", response_model=ClosureResponse)
def perform_closure(register_id: int, payload: ClosureCreate, db: Session = Depends(get_db)):
    """
    Executa o fechamento diário do caixa, auditando quebras ou sobras entre dinheiro contado e esperado.
    """
    return ClosureController.close_register(db, register_id, payload)
