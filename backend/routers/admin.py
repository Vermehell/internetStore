from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from backend.models import User
from backend.schemas import UserResponse
from backend.auth import get_current_user

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/make_admin/{user_id}", response_model=UserResponse)
def make_admin(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can perform this action")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_admin = True
    db.commit()
    db.refresh(user)
    return user