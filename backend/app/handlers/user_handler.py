from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..services import auth_service, user_service
from ..schemas import user as user_schemas

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

@router.post("/", response_model=user_schemas.User)
async def create_user(
    user: user_schemas.UserCreate,
    db: Session = Depends(get_db)
):
    db_user = user_service.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    return user_service.create_user(db=db, user=user)

@router.get("/me", response_model=user_schemas.User)
async def read_user_me(
    current_user: user_schemas.User = Depends(auth_service.get_current_user)
):
    return current_user

@router.delete("/me")
async def delete_user_me(
    current_user: user_schemas.User = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    user_service.delete_user(db, current_user.id)
    return {"message": "User deleted successfully"}

@router.put("/me", response_model=user_schemas.User)
async def update_user_me(
    user_update: user_schemas.UserUpdate,
    current_user: user_schemas.User = Depends(auth_service.get_current_user),
    db: Session = Depends(get_db)
):
    return user_service.update_user(db, current_user.id, user_update)
