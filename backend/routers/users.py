from fastapi import APIRouter, Depends, HTTPException, status, Response, Request, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime

from ..database import get_db
from backend.models import User
from backend import schemas
from backend.crud import create_user, update_user_username, update_user_password, \
    get_user_by_login, get_all_users, update_user_role, delete_user, create_refresh_token, get_refresh_token, delete_refresh_token, delete_user_refresh_tokens
from backend.auth import get_password_hash, create_access_token, get_current_user, verify_password, create_refresh_token_value, get_refresh_token_expiry
from backend.schemas import UserResponse, UserRoleUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/register", response_model=schemas.Token)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user_by_login = db.query(User).filter(User.login == user.login).first()
    if existing_user_by_login:
        raise HTTPException(status_code=400, detail="Login already exists")

    existing_user_by_email = db.query(User).filter(User.email == user.email).first()
    if existing_user_by_email:
        raise HTTPException(status_code=400, detail="Email already exists")

    db_user = create_user(db, user)

    access_token = create_access_token({"sub": db_user.login}) 
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login", response_model=schemas.Token)
async def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = get_user_by_login(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect login or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token({"sub": user.login})
    refresh_token_value = create_refresh_token_value()
    expires_at = get_refresh_token_expiry()
    create_refresh_token(db, user.id, refresh_token_value, expires_at)
    
    # Устанавливаем cookies
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        max_age=1800,  # 30 минут
        httponly=True,
        secure=False,  # Установите True для HTTPS
        samesite="lax",
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token_value,
        max_age=60*60*24*14,  # 14 дней
        httponly=True,
        secure=False,  # Установите True для HTTPS
        samesite="lax",
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
):
    if not current_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return current_user

@router.put("/{user_id}/username", response_model=schemas.UserResponse)
def update_username(
    user_id: int,
    username_data: schemas.UserUpdateUsername,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own username or need admin rights"
        )
    
    updated_user = update_user_username(db, user_id, username_data.new_username)
    return updated_user

@router.put("/{user_id}/password", response_model=schemas.UserResponse)
def update_password(
        user_id: int,
        password_data: schemas.UserUpdatePassword,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
):
    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="You can only update your own password or need admin rights")

    return update_user_password(db, user_id, password_data.current_password, password_data.new_password)


@router.post("/logout")
async def logout(response: Response, request: Request, db: Session = Depends(get_db)):
    # Удаляем cookies
    response.delete_cookie("access_token")
    
    # Удаляем refresh token из БД
    refresh_token = request.cookies.get("refresh_token")
    if refresh_token:
        delete_refresh_token(db, refresh_token)
        response.delete_cookie("refresh_token")
    
    return {"message": "Logged out"}

@router.get("/", response_model=list[UserResponse])
def get_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can view users")
    return get_all_users(db)

@router.put("/{user_id}/role", response_model=UserResponse)
def change_user_role(user_id: int, data: UserRoleUpdate = Body(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can change roles")
    if current_user.id == user_id and not data.is_admin:
        raise HTTPException(status_code=400, detail="Нельзя снять роль админа с самого себя")
    return update_user_role(db, user_id, data.is_admin)

@router.delete("/{user_id}")
def remove_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can delete users")
    return delete_user(db, user_id)

@router.post("/refresh", response_model=schemas.Token)
def refresh_token_endpoint(response: Response, request: Request, db: Session = Depends(get_db)):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No refresh token")
    
    db_token = get_refresh_token(db, refresh_token)
    if not db_token or db_token.expires_at < datetime.utcnow():
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
    
    user = db.query(User).filter(User.id == db_token.user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    access_token = create_access_token({"sub": user.login})
    
    # Обновляем cookie с новым access token
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        max_age=1800,
        httponly=True,
        secure=False,
        samesite="lax",
    )
    
    return {"access_token": access_token, "token_type": "bearer"}