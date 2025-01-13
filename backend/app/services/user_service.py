from sqlalchemy.orm import Session
from typing import Optional

from ..models import User
from ..schemas import user as user_schemas
from . import auth_service

def get_user(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: user_schemas.UserCreate) -> User:
    hashed_password = auth_service.get_password_hash(user.password)
    db_user = User(
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: user_schemas.UserUpdate) -> User:
    db_user = get_user(db, user_id)
    if user_update.password:
        db_user.hashed_password = auth_service.get_password_hash(user_update.password)
    if user_update.email:
        db_user.email = user_update.email
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int) -> bool:
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
        return True
    return False
