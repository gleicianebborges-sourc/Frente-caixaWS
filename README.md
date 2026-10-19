# Frente de Caixa WS - Loja de Roupas & Gestão Diária (PDV)

Sistema completo de **Frente de Caixa (PDV)** e **Gestão Diária** desenvolvido para lojas de roupas e vestuário, construído com padrão **MVC**, backend em **Python (FastAPI + SQLAlchemy)** e frontend em **React / Next.js (App Router + Tailwind CSS)**.

---

## 🎯 Diferenciais e Regras de Negócio
1. **Sem Bloqueio por Estoque Rígido:** Operações ágeis de caixa sem travas ou interrupções de venda.
2. **Auto-Alimentação de Catálogo (*Learning from Sales*):** 
   - Ao lançar e concluir uma venda com um produto qualquer (ex: `"Short social"` a `R$ 20,00`), o sistema aprende o item automaticamente.
   - Se a peça não existia no catálogo, ela é cadastrada e um chip/atalho de acesso rápido é criado imediatamente na tela do operador.
   - Se já existia, incrementa o contador de frequência de venda e atualiza o preço padrão sugerido.
3. **Lançamento Ágil:** Suporte a atalhos de teclado (Enter para lançar) e clique direto nos botões do catálogo.
4. **Precisão Monetária com `Decimal`:** Todos os cálculos de subtotais, descontos, totalizadores e troco utilizam tipos decimais exatos para evitar imprecisões de ponto flutuante.
5. **Ciclo de Caixa Diário:** Guardião de abertura de caixa (fundo de troco obrigatório para iniciar), auditoria de gaveta e conferência física com cálculo automático de quebra/sobra e exportação de vendas para CSV.

---

## 📂 Estrutura de Arquitetos (Padrão MVC)

```text
c:/Ws Moda/
├── backend/
│   ├── app/
│   │   ├── database.py              # Conexão de banco (SQLite ou PostgreSQL/Supabase)
│   │   ├── models/                  # Modelos ORM (Register, Sale, SaleItem, ClothingCatalog, Closure)
│   │   ├── schemas/                 # Schemas de validação Pydantic v2
│   │   ├── controllers/             # Camada Controller / Regras de negócio
│   │   │   ├── register_controller.py
│   │   │   ├── sale_controller.py   # Lógica atômica de aprendizado de peças
│   │   │   ├── catalog_controller.py
│   │   │   └── closure_controller.py
│   │   ├── routers/                 # Rotas da API REST (OpenAPI / Docs)
│   │   └── main.py                  # Inicialização do FastAPI e CORS
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # Tela principal PDV com integração em tempo real
│   │   └── globals.css
│   ├── components/
│   │   ├── RegisterGuardBanner.tsx  # Bloqueador de vendas com caixa fechado
│   │   ├── QuickClothingCatalog.tsx # Grade com chips inteligentes das roupas aprendidas
│   │   ├── CartPanel.tsx            # Lançamento rápido e totalizador do carrinho
│   │   ├── PaymentPanel.tsx         # Formas de pagamento e cálculo dinâmico de troco
│   │   └── HistoryAndClosureView.tsx# Auditoria, métricas e conferência diária
│   ├── hooks/                       # Controllers de estado no React
│   │   ├── useRegister.ts
│   │   ├── useCart.ts
│   │   ├── useCatalog.ts
│   │   └── useSales.ts
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
├── .gitignore
└── README.md
```

---

## 🚀 Como Executar o Projeto

### 1. Backend (Python + FastAPI)
Em um terminal:
```bash
cd backend
python -m venv venv
# No Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Instale as dependências:
pip install -r requirements.txt
# Inicie o servidor:
uvicorn app.main:app --reload --port 8000
```
- A documentação interativa Swagger estará disponível em: `http://localhost:8000/docs`

### 2. Frontend (Next.js + Tailwind CSS)
Em outro terminal:
```bash
cd frontend
npm install
npm run dev
```
- Acesse o PDV em: `http://localhost:3000`

---

## 🔌 Extensibilidade com PostgreSQL / Supabase
Por padrão, o backend utiliza SQLite local (`frente_caixa.db`). Para conectar a um banco de dados em nuvem como o Supabase ou PostgreSQL de produção:
1. Instale o driver: `pip install psycopg2-binary`
2. Configure a variável de ambiente no arquivo `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:[SUA_SENHA]@db.[SEU_PROJETO].supabase.co:5432/postgres
```
O SQLAlchemy cuidará da criação de tabelas e compatibilidade automaticamente.
