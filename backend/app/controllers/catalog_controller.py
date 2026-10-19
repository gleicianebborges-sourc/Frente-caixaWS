from datetime import datetime
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.catalog import ClothingCatalog
from app.schemas.catalog import CatalogItemCreate

class CatalogController:
    @staticmethod
    def list_popular(db: Session, limit: int = 50) -> list[ClothingCatalog]:
        return (
            db.query(ClothingCatalog)
            .order_by(ClothingCatalog.times_sold.desc(), ClothingCatalog.last_sold_at.desc())
            .limit(limit)
            .all()
        )

    @staticmethod
    def search(db: Session, query: str) -> list[ClothingCatalog]:
        clean_q = query.strip().lower()
        return (
            db.query(ClothingCatalog)
            .filter(func.lower(ClothingCatalog.name).contains(clean_q))
            .order_by(ClothingCatalog.times_sold.desc())
            .limit(20)
            .all()
        )

    @staticmethod
    def upsert_item(db: Session, payload: CatalogItemCreate) -> ClothingCatalog:
        clean_name = payload.name.strip()
        existing = (
            db.query(ClothingCatalog)
            .filter(func.lower(ClothingCatalog.name) == clean_name.lower())
            .first()
        )

        if existing:
            existing.default_price = payload.default_price
            if payload.category:
                existing.category = payload.category
            db.commit()
            db.refresh(existing)
            return existing

        new_item = ClothingCatalog(
            name=clean_name,
            default_price=payload.default_price,
            times_sold=0,
            category=payload.category or "Geral",
            last_sold_at=datetime.utcnow()
        )
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        return new_item
