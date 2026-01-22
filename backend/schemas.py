from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    nick: str
    email: EmailStr
    dob: str
    password: str

class UserOut(BaseModel):
    id: int
    nick: str
    email: EmailStr
    dob: str
    is_admin: bool

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class CardSearchOut(BaseModel):
    id: Optional[str]
    name: str
    setName: Optional[str] = None
    multiverseid: Optional[int] = None
    image: Optional[str] = None

class UserCardOut(BaseModel):
    id: int
    card_id: str
    name: str
    image_url: Optional[str]
    set_name: Optional[str]
    multiverseid: Optional[int]
    quantity: int

class AddCardRequest(BaseModel):
    id: str
    name: str
    image: Optional[str] = None
    setName: Optional[str] = None
    multiverseid: Optional[int] = None
    user_id: Optional[int] = None  # admin-only

class RemoveCardRequest(BaseModel):
    card_id: str
    user_id: Optional[int] = None  # admin-only

class DeleteAccountRequest(BaseModel):
    user_id: Optional[int] = None  # admin-only
