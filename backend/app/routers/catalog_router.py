from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.catalog import CatalogItemCreate, CatalogItemResponse
from app.controllers.catalog_controller import CatalogController

router = APIRouter(prefix="/catalog", tags=["Catálogo de Peças / Catalog"])

@router.get("/popular", response_model=list[CatalogItemResponse])
def get_popular_items(limit: int = Query(default=30, ge=1, le=100), db: Session = Depends(get_db)):
    """Retorna os itens mais vendidos / frequentes para a grade de atalhos rápidos."""
    return CatalogController.list_popular(db, limit=limit)

@router.get("/search", response_model=list[CatalogItemResponse])
def search_items(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    """Busca dinâmica por nome de peça de vestuário."""
    return CatalogController.search(db, query=q)

@router.post("/upsert", response_model=CatalogItemResponse)
def upsert_catalog_item(payload: CatalogItemCreate, db: Session = Depends(get_db)):
    """Cadastra ou atualiza manualmente uma mercadoria no catálogo."""
    return CatalogController.upsert_item(db, payload)
