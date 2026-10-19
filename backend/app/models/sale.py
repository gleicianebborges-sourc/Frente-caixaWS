from datetime import datetime
from decimal import Decimal
from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    register_id = Column(Integer, ForeignKey("registers.id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    payment_method = Column(String(30), nullable=False)  # PIX, MONEY, CREDIT_CARD, DEBIT_CARD
    subtotal = Column(Numeric(10, 2), nullable=False, default=Decimal("0.00"))
    discount = Column(Numeric(10, 2), nullable=False, default=Decimal("0.00"))
    total = Column(Numeric(10, 2), nullable=False, default=Decimal("0.00"))
    amount_paid = Column(Numeric(10, 2), nullable=False, default=Decimal("0.00"))
    change_amount = Column(Numeric(10, 2), nullable=False, default=Decimal("0.00"))

    register = relationship("Register", back_populates="sales")
    items = relationship("SaleItem", back_populates="sale", cascade="all, delete-orphan")

class SaleItem(Base):
    __tablename__ = "sale_items"

    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=False, index=True)
    product_name = Column(String(150), nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    subtotal = Column(Numeric(10, 2), nullable=False)

    sale = relationship("Sale", back_populates="items")
