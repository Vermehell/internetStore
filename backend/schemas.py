from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime


class UserCreate(BaseModel):
    login: str = Field(..., min_length=3, max_length=50, description="Логин должен быть от 3 до 50 символов")
    username: str = Field(..., min_length=3, max_length=50, description="Имя пользователя должно быть от 3 до 50 символов")
    email: EmailStr
    password: str = Field(..., min_length=6, description="Пароль должен быть не менее 6 символов")

    @validator('email')
    def validate_email(cls, value):
        # Проверяем, что email содержит ровно один символ "@" и ровно одну точку после "@"
        if not value.count('@') == 1:
            raise ValueError('Email должен содержать ровно один символ "@"')
        
        domain_part = value.split('@')[1]  # Часть после "@"
        if domain_part.count('.') != 1:
            raise ValueError('Email должен содержать ровно одну точку после "@"')
        
        return value

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

class ProductSpecificationResponse(BaseModel):
    id: int
    product_id: int
    spec_name: str
    spec_value: str

    class Config:
        from_attributes = True  # Ранее называлось orm_mode


class CartItemUpdate(BaseModel):
    quantity: int  # Поле quantity должно быть целым числом