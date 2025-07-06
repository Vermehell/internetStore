from datetime import timedelta, datetime
from fastapi.security import OAuth2PasswordBearer
from jwt import PyJWTError, encode, decode
from fastapi import Depends, HTTPException
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from starlette import status
from fastapi import Request
import secrets

from backend.models import User
from .database import SessionLocal, get_db

SECRET_KEY = "30f5c2d98f13dd1014d247564fdfbafe05d2ebe4d7b84e39"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 14

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")


def get_user_service(db: Session, login: str):
    return db.query(User).filter(User.login == login).first()


def get_password_hash(password: str):
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict):
    expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    expire = datetime.utcnow() + expires_delta
    data.update({"exp": expire})
    return encode(data, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(request: Request, db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Not authenticated",
    )

    # Сначала пробуем получить токен из cookies
    token = request.cookies.get("access_token")
    
    # Если нет в cookies, пробуем из заголовка Authorization
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.replace("Bearer ", "")
    
    if not token:
        raise credentials_exception

    try:
        # Убираем "Bearer " если он есть в токене из cookies
        if token.startswith("Bearer "):
            token = token.replace("Bearer ", "")
            
        payload = decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        login = payload.get("sub")
        if not login:
            raise credentials_exception
    except PyJWTError:
        raise credentials_exception

    user = get_user_service(db, login=login)
    if not user:
        raise credentials_exception
    return user


def create_refresh_token_value():
    return secrets.token_urlsafe(64)


def get_refresh_token_expiry():
    return datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)