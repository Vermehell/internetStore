from datetime import timedelta, datetime
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from fastapi import Depends, HTTPException
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from starlette import status
from fastapi import Request

from database import SessionLocal, get_db

SECRET_KEY = "30f5c2d98f13dd1014d247564fdfbafe05d2ebe4d7b84e39"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")


def get_user_service(db: Session, username: str):
    from crud import get_user_by_username
    return get_user_by_username(db, username)


def get_password_hash(password: str):
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict):
    expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    expire = datetime.now() + expires_delta
    data.update({"exp": expire}) 
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(request: Request, db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Not authenticated",
    )

    token = request.cookies.get("access_token")
    if not token:
        raise credentials_exception

    try:
        token = token.replace("Bearer ", "")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if not username:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = get_user_service(db, username=username)
    if not user:
        raise credentials_exception
    return user