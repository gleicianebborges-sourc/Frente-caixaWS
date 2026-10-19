from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import register_router, sale_router, catalog_router, closure_router

# Inicializa as tabelas do banco de dados (SQLite por padrão, ou PostgreSQL)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Frente de Caixa WS - Loja de Roupas & Gestão Diária",
    description="Sistema PDV com Auto-Alimentação de Catálogo e Gestão de Caixa Diário",
    version="1.0.0"
)

# Configuração de CORS para permitir requisições do frontend Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registro das rotas na versão v1
app.include_router(register_router, prefix="/api/v1")
app.include_router(sale_router, prefix="/api/v1")
app.include_router(catalog_router, prefix="/api/v1")
app.include_router(closure_router, prefix="/api/v1")

@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "app": "Frente de Caixa WS"}
