from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from models import User
from schemas import DeleteAccountRequest
from routers.deps import get_current_user

router = APIRouter(prefix="/account", tags=["account"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/delete")
def delete_account(payload: DeleteAccountRequest, db: Session = Depends(get_db), current = Depends(get_current_user)):
    target_id = current["user"].id
    if current["user"].is_admin and payload.user_id:
        target_id = payload.user_id
    u = db.query(User).filter(User.id == target_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="not_found")
    db.delete(u)
    db.commit()
    return {"ok": True}
