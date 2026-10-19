from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

class CatalogItemCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=150, description="Nome da peça ou vestuário")
    default_price: Decimal = Field(..., gt=0, description="Preço padrão da peça")
    category: Optional[str] = Field(default="Geral", max_length=80)

class CatalogItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    default_price: Decimal
    times_sold: int
    category: str
    last_sold_at: datetime
