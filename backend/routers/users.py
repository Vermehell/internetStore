from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import OAuth2PasswordRequestForm  # Исправленный импорт
from sqlalchemy.orm import Session

from database import get_db
from models import User
import schemas
from crud import create_user, update_user_username, update_user_password, \
    get_user_by_login
from auth import get_password_hash, create_access_token, get_current_user, verify_password

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/register", response_model=schemas.Token)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Проверка уникальности логина
    existing_user_by_login = db.query(User).filter(User.login == user.login).first()
    if existing_user_by_login:
        raise HTTPException(status_code=400, detail="Login already exists")

    # Проверка уникальности email
    existing_user_by_email = db.query(User).filter(User.email == user.email).first()
    if existing_user_by_email:
        raise HTTPException(status_code=400, detail="Email already exists")

    # Создание пользователя
    db_user = create_user(db, user)

    # Создание токена для автоматического входа
    access_token = create_access_token({"sub": db_user.login})  # Токен привязан к логину
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
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        max_age=1800,
        httponly=True,
        secure=False,
        samesite="lax",
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.UserResponse)
async def get_current_user_profile(
    request: Request,
    current_user: User = Depends(get_current_user),
):
    # Убедитесь, что current_user не None
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
    # Проверяем, что пользователь обновляет свой профиль или является админом
    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own username or need admin rights"
        )
    
    # Обновляем имя пользователя
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
async def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logged out"}