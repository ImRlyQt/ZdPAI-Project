from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import httpx

from database import SessionLocal
from models import UserCard, User
from schemas import CardSearchOut, AddCardRequest, UserCardOut, RemoveCardRequest
from routers.deps import get_current_user

router = APIRouter(prefix="/cards", tags=["cards"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/search")
def search_cards(q: str = ""):
    q = (q or "").strip()
    if not q:
        return []
    url = "https://api.magicthegathering.io/v1/cards"
    params = {"name": q, "pageSize": 10}
    try:
        with httpx.Client(timeout=8.0) as client:
            r = client.get(url, params=params, headers={"Accept": "application/json"})
            r.raise_for_status()
            data = r.json()
    except Exception:
        return []
    cards = data.get("cards", [])
    out = []
    for c in cards:
        img = c.get("imageUrl")
        mvid = c.get("multiverseid")
        if not img and mvid:
            img = f"https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid={int(mvid)}&type=card"
        out.append({
            "id": c.get("id"),
            "name": c.get("name", "Unknown"),
            "setName": c.get("setName") or c.get("set"),
            "multiverseid": mvid,
            "image": img,
        })
    return out

@router.get("")
def list_user_cards(user_id: int | None = None, db: Session = Depends(get_db), current = Depends(get_current_user)):
    target_id = current["user"].id if user_id is None else (
        user_id if current["user"].is_admin else current["user"].id
    )
    rows = db.query(UserCard).filter(UserCard.user_id == target_id).order_by(UserCard.id.desc()).all()
    return [UserCardOut(
        id=r.id, card_id=r.card_id, name=r.name, image_url=r.image_url, set_name=r.set_name,
        multiverseid=r.multiverseid, quantity=r.quantity
    ).model_dump() for r in rows]

@router.post("/add")
def add_card(payload: AddCardRequest, db: Session = Depends(get_db), current = Depends(get_current_user)):
    target_id = current["user"].id
    if current["user"].is_admin and payload.user_id:
        target_id = payload.user_id
    if not payload.id or not payload.name:
        raise HTTPException(status_code=400, detail="missing_fields")
    # upsert-like: increment if exists, else insert
    row = db.query(UserCard).filter(UserCard.user_id == target_id, UserCard.card_id == payload.id).first()
    if row:
        row.quantity = (row.quantity or 1) + 1
        db.commit()
        return {"ok": True}
    row = UserCard(
        user_id=target_id,
        card_id=payload.id,
        name=payload.name,
        image_url=payload.image or None,
        set_name=payload.setName or None,
        multiverseid=payload.multiverseid,
        quantity=1,
    )
    db.add(row)
    db.commit()
    return {"ok": True}

@router.post("/remove")
def remove_card(payload: RemoveCardRequest, db: Session = Depends(get_db), current = Depends(get_current_user)):
    if not payload.card_id:
        raise HTTPException(status_code=400, detail="missing_card_id")
    target_id = current["user"].id
    if current["user"].is_admin and payload.user_id:
        target_id = payload.user_id
    row = db.query(UserCard).filter(UserCard.user_id == target_id, UserCard.card_id == payload.card_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="not_found")
    if row.quantity and row.quantity > 1:
        row.quantity -= 1
        db.commit()
        return {"ok": True, "quantity": row.quantity}
    db.delete(row)
    db.commit()
    return {"ok": True, "deleted": True}
