from datetime import datetime
from sqlalchemy import Column, Integer, String, Numeric, DateTime
from app.database import Base

class ClothingCatalog(Base):
    __tablename__ = "clothing_catalog"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), unique=True, nullable=False, index=True)
    default_price = Column(Numeric(10, 2), nullable=False)
    times_sold = Column(Integer, nullable=False, default=1)
    category = Column(String(80), nullable=False, default="Geral")
    last_sold_at = Column(DateTime, default=datetime.utcnow, nullable=False)
