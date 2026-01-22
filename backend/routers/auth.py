from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from models import User
from schemas import UserCreate, LoginRequest, TokenOut, UserOut
from auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", response_model=dict)
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        # mimic Postgres unique violation behavior
        raise HTTPException(status_code=409, detail="email_exists")
    u = User(
        nick=user.nick,
        email=user.email.lower(),
        password=hash_password(user.password),
        dob=user.dob,
        is_admin=False,
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    return {"ok": True}

@router.post("/login", response_model=TokenOut)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    email = req.email.lower()
    # Bootstrap admin if special credentials (admin@gmail.com / 123)
    if email == "admin@gmail.com" and req.password == "123":
        admin = db.query(User).filter(User.email == email).first()
        if not admin:
            admin = User(nick="Admin", email=email, password=hash_password("123"), dob="1970-01-01", is_admin=True)
            db.add(admin)
            db.commit()
            db.refresh(admin)
        else:
            admin.is_admin = True
            admin.password = hash_password("123")
            db.commit()
        token = create_access_token({"sub": str(admin.id), "nick": admin.nick, "is_admin": admin.is_admin})
        return TokenOut(access_token=token, user=UserOut(id=admin.id, nick=admin.nick, email=admin.email, dob=admin.dob, is_admin=admin.is_admin))

    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(req.password, user.password):
        raise HTTPException(status_code=401, detail="invalid_credentials")
    # Promote admin on login if email is admin@gmail.com
    if email == "admin@gmail.com" and not user.is_admin:
        user.is_admin = True
        db.commit()
    token = create_access_token({"sub": str(user.id), "nick": user.nick, "is_admin": user.is_admin})
    return TokenOut(access_token=token, user=UserOut(id=user.id, nick=user.nick, email=user.email, dob=user.dob, is_admin=user.is_admin))
