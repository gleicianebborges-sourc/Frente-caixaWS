from datetime import datetime
from decimal import Decimal
from sqlalchemy.orm import Session
from app.models.catalog import ClothingCatalog
from app.schemas.catalog import CatalogItemCreate
from app.utils.normalization import normalize_canonical_name, format_title_name

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
        canonical_q = normalize_canonical_name(query)
        if not canonical_q:
            return []

        return (
            db.query(ClothingCatalog)
            .filter(ClothingCatalog.canonical_name.contains(canonical_q))
            .order_by(ClothingCatalog.times_sold.desc())
            .limit(20)
            .all()
        )

    @staticmethod
    def upsert_item(db: Session, payload: CatalogItemCreate) -> ClothingCatalog:
        raw_name = payload.name
        canonical_key = normalize_canonical_name(raw_name)
        if not canonical_key:
            raise ValueError("O nome da mercadoria é inválido.")

        existing = (
            db.query(ClothingCatalog)
            .filter(ClothingCatalog.canonical_name == canonical_key)
            .first()
        )

        if existing:
            existing.default_price = payload.default_price
            if payload.category:
                existing.category = payload.category
            db.commit()
            db.refresh(existing)
            return existing

        formatted_name = format_title_name(raw_name)
        new_item = ClothingCatalog(
            canonical_name=canonical_key,
            name=formatted_name,
            default_price=payload.default_price,
            times_sold=0,
            category=payload.category or "Geral",
            last_sold_at=datetime.utcnow()
        )
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        return new_item
