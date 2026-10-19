from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

class ClosureCreate(BaseModel):
    reported_cash: Decimal = Field(..., ge=0, description="Total em dinheiro contado fisicamente na gaveta")
    notes: Optional[str] = Field(default=None, description="Observações ou justificativas de diferença")

class ClosureResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    register_id: int
    closed_at: datetime
    expected_cash: Decimal
    reported_cash: Decimal
    difference: Decimal
    total_sales: Decimal
    total_money: Decimal
    total_pix: Decimal
    total_card: Decimal
    notes: Optional[str]
