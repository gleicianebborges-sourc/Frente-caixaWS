from datetime import datetime
from decimal import Decimal
from sqlalchemy import Column, Integer, String, Numeric, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class Register(Base):
    __tablename__ = "registers"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String(10), nullable=False, index=True)  # YYYY-MM-DD
    opening_balance = Column(Numeric(10, 2), nullable=False, default=Decimal("0.00"))
    current_balance = Column(Numeric(10, 2), nullable=False, default=Decimal("0.00"))
    status = Column(String(20), nullable=False, default="OPEN")  # OPEN / CLOSED
    opened_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    closed_at = Column(DateTime, nullable=True)

    sales = relationship("Sale", back_populates="register", cascade="all, delete-orphan")
    closure = relationship("Closure", back_populates="register", uselist=False)
