from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from auth import decode_token
from database import SessionLocal
from models import User

bearer = HTTPBearer(auto_error=True)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(creds: HTTPAuthorizationCredentials = Depends(bearer), db: Session = Depends(get_db)):
    token = creds.credentials
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="invalid_token")
    user_id = int(payload.get("sub", "0"))
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="user_not_found")
    return {"user": user, "payload": payload}
