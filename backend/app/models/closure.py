from datetime import datetime
from decimal import Decimal
from sqlalchemy import Column, Integer, Numeric, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Closure(Base):
    __tablename__ = "closures"

    id = Column(Integer, primary_key=True, index=True)
    register_id = Column(Integer, ForeignKey("registers.id"), nullable=False, unique=True)
    closed_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expected_cash = Column(Numeric(10, 2), nullable=False, default=Decimal("0.00"))
    reported_cash = Column(Numeric(10, 2), nullable=False, default=Decimal("0.00"))
    difference = Column(Numeric(10, 2), nullable=False, default=Decimal("0.00"))
    total_sales = Column(Numeric(10, 2), nullable=False, default=Decimal("0.00"))
    total_money = Column(Numeric(10, 2), nullable=False, default=Decimal("0.00"))
    total_pix = Column(Numeric(10, 2), nullable=False, default=Decimal("0.00"))
    total_card = Column(Numeric(10, 2), nullable=False, default=Decimal("0.00"))
    notes = Column(Text, nullable=True)

    register = relationship("Register", back_populates="closure")
