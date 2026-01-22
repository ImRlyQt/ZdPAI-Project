from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from database import engine, Base
from routers import auth as auth_router
from routers import profiles as profiles_router
from routers import cards as cards_router
from routers import account as account_router

app = FastAPI(title="DeckHeaven API", version="1.0.0")

# CORS: allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables on startup
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    # Ensure helpful indexes exist (SQLite creates from models)
    with engine.begin() as conn:
        # no-op sample to ensure DB file exists
        conn.execute(text("SELECT 1"))

# Routers
app.include_router(auth_router.router)
app.include_router(profiles_router.router)
app.include_router(cards_router.router)
app.include_router(account_router.router)
