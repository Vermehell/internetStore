from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime
from typing import Optional, List


class UserCreate(BaseModel):
    login: str = Field(..., min_length=3, max_length=50, description="Логин должен быть от 3 до 50 символов")
    username: str = Field(..., min_length=3, max_length=50, description="Имя пользователя должно быть от 3 до 50 символов")
    email: EmailStr
    password: str = Field(..., min_length=6, description="Пароль должен быть не менее 6 символов")

    @validator('email')
    def validate_email(cls, value):
        if not value.count('@') == 1:
            raise ValueError('Email должен содержать ровно один символ "@"')
        
        domain_part = value.split('@')[1]
        if domain_part.count('.') != 1:
            raise ValueError('Email должен содержать ровно одну точку после "@"')
        
        return value

class UserResponse(BaseModel):
    id: int
    login: str
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
    image_url: str

class CategoryResponse(BaseModel):
    id: int
    name: str
    image_url: str

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


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int
    price: float


class OrderItemResponse(BaseModel):
    id: int
    order_id: int
    product_id: int
    quantity: int
    price: float
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    items: list[OrderItemCreate]
    delivery_address: str = Field(..., description="Адрес доставки")
    delivery_phone: str = Field(..., description="Телефон для доставки")
    delivery_method: str = Field(default="courier", description="Способ доставки: courier, pickup, post")
    payment_method: str = Field(default="cash", description="Способ оплаты: cash, card, online")
    notes: Optional[str] = Field(None, description="Дополнительные заметки")


class OrderUpdate(BaseModel):
    status: Optional[str] = None
    delivery_address: Optional[str] = None
    delivery_phone: Optional[str] = None
    delivery_method: Optional[str] = None
    payment_method: Optional[str] = None
    notes: Optional[str] = None


class OrderResponse(BaseModel):
    id: int
    order_number: str
    total_price: float
    status: str
    delivery_address: str
    delivery_phone: str
    delivery_method: str
    payment_method: str
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True


class OrderListResponse(BaseModel):
    id: int
    order_number: str
    total_price: float
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OrderStatistics(BaseModel):
    total_orders: int
    pending_orders: int
    confirmed_orders: int
    processing_orders: int
    shipped_orders: int
    delivered_orders: int
    cancelled_orders: int
    total_revenue: float

    class Config:
        from_attributes = True


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
    order: int

    class Config:
        from_attributes = True


class CartItemUpdate(BaseModel):
    quantity: int 

class CategoryResponse(BaseModel):
    id: int
    name: str
    image_url: str

    class Config:
        from_attributes = True

class ProductSpecificationCreate(BaseModel):
    spec_name: str
    spec_value: str
    order: int = 0

class ProductSpecificationUpdate(BaseModel):
    id: int | None = None
    spec_name: str
    spec_value: str
    order: int = 0

class ProductCreateWithSpecs(ProductCreate):
    specs: list[ProductSpecificationCreate] = []

class ProductUpdateWithSpecs(BaseModel):
    name: str
    description: str
    price: float
    category_id: int
    stock: int
    image_url: str
    specs: list[ProductSpecificationUpdate] = []

class CategoryUpdate(BaseModel):
    name: str
    image_url: str

class UserRoleUpdate(BaseModel):
    is_admin: bool

class RefreshTokenCreate(BaseModel):
    user_id: int
    token: str
    expires_at: datetime

class RefreshTokenResponse(BaseModel):
    id: int
    user_id: int
    token: str
    expires_at: datetime
    created_at: datetime
    class Config:
        from_attributes = True