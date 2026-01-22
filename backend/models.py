from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship, Mapped, mapped_column
from database import Base

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    nick: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    dob: Mapped[str] = mapped_column(String(20), nullable=False)  # keep as TEXT for compatibility
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    cards: Mapped[list["UserCard"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )

class UserCard(Base):
    __tablename__ = "user_cards"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    card_id: Mapped[str] = mapped_column(String(100), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    set_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    multiverseid: Mapped[int | None] = mapped_column(Integer, nullable=True)
    quantity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    user: Mapped[User] = relationship(back_populates="cards")

    __table_args__ = (
        UniqueConstraint("user_id", "card_id", name="uq_user_card"),
    )
