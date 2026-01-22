from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import SessionLocal
from models import User

router = APIRouter(prefix="/profiles", tags=["profiles"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/search")
def search_profiles(q: str = "", db: Session = Depends(get_db)):
    q = (q or "").strip().lower()
    if not q:
        return []
    rows = db.query(User).filter(User.nick.ilike(f"%{q}%")).limit(10).all()
    return [{"id": u.id, "nick": u.nick} for u in rows]
