from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field

class SaleItemCreate(BaseModel):
    product_name: str = Field(..., min_length=1, max_length=150)
    unit_price: Decimal = Field(..., gt=0)
    quantity: int = Field(default=1, gt=0)

class SaleItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_name: str
    unit_price: Decimal
    quantity: int
    subtotal: Decimal

class SaleCreate(BaseModel):
    payment_method: str = Field(..., description="PIX, MONEY, CREDIT_CARD, DEBIT_CARD")
    discount: Decimal = Field(default=Decimal("0.00"), ge=0)
    amount_paid: Optional[Decimal] = Field(default=None, ge=0, description="Obrigatório ou calculado se dinheiro")
    items: List[SaleItemCreate] = Field(..., min_length=1)

class SaleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    register_id: int
    timestamp: datetime
    payment_method: str
    subtotal: Decimal
    discount: Decimal
    total: Decimal
    amount_paid: Decimal
    change_amount: Decimal
    items: List[SaleItemResponse]
