from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from models import User, UserCard
from schemas import UserCardOut

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

@router.get("/{id}")
def get_profile(id: int, db: Session = Depends(get_db)):
    u = db.query(User).filter(User.id == id).first()
    if not u:
        raise HTTPException(status_code=404, detail="not_found")
    return {"id": u.id, "nick": u.nick}

@router.get("/{id}/cards")
def get_profile_cards(id: int, db: Session = Depends(get_db)):
    rows = db.query(UserCard).filter(UserCard.user_id == id).order_by(UserCard.id.desc()).all()
    return [UserCardOut(
        id=r.id,
        card_id=r.card_id,
        name=r.name,
        image_url=r.image_url,
        set_name=r.set_name,
        multiverseid=r.multiverseid,
        quantity=r.quantity
    ).model_dump() for r in rows]
