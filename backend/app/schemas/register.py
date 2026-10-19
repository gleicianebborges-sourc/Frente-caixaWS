from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

class RegisterOpen(BaseModel):
    opening_balance: Decimal = Field(default=Decimal("0.00"), ge=0, description="Saldo inicial de abertura em dinheiro")

class RegisterResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    date: str
    opening_balance: Decimal
    current_balance: Decimal
    status: str
    opened_at: datetime
    closed_at: Optional[datetime] = None

class RegisterSummary(BaseModel):
    register_id: int
    date: str
    status: str
    opening_balance: Decimal
    total_sales_count: int
    total_sales_amount: Decimal
    total_money: Decimal
    total_pix: Decimal
    total_card: Decimal
    current_cash_in_drawer: Decimal
