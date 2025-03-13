from pydantic import BaseModel, EmailStr, Field
from datetime import datetime


class UserCreate(BaseModel):
    login: str = Field(..., min_length=3, max_length=50, description="Логин должен быть от 3 до 50 символов")
    username: str = Field(..., min_length=3, max_length=50, description="Имя пользователя должно быть от 3 до 50 символов")
    email: EmailStr
    password: str = Field(..., min_length=6, description="Пароль должен быть не менее 6 символов")

class UserResponse(BaseModel):
    id: int
    login: str  # Добавлено
    username: str
    email: str
    is_admin: bool

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class CategoryCreate(BaseModel):
    name: str


class CategoryResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category_id: int
    stock: int
    image_url: str


class ProductResponse(BaseModel):
    id: int
    name: str
    description: str
    price: float
    category_id: int
    stock: int
    image_url: str

    class Config:
        from_attributes = True


class CartItemCreate(BaseModel):
    product_id: int
    quantity: int


class CartItemResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    quantity: int

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: int
    total_price: float
    status: str
    created_at: datetime


class UserUpdateUsername(BaseModel):
    new_username: str = Field(..., min_length=3, max_length=50, description="Имя пользователя должно быть от 3 до 50 символов")


class UserUpdatePassword(BaseModel):
    current_password: str
    new_password: str


class UserLogin(BaseModel):
    username: str
    password: str