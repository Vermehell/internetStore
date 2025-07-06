from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.sql import func
from .database import Base
import datetime


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    login = Column(String(50), unique=True, index=True) 
    username = Column(String(50), index=True)
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(255))
    is_admin = Column(Boolean, default=False)


class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True)
    image_url = Column(String)


class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    description = Column(String)
    price = Column(Float)
    category_id = Column(Integer, ForeignKey("categories.id"))
    stock = Column(Integer)
    image_url = Column(String)


class ProductSpecification(Base):
    __tablename__ = "product_specifications"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    spec_name = Column(String(100))
    spec_value = Column(String(100))
    order = Column(Integer, nullable=False, default=0)


class Cart(Base):
    __tablename__ = "cart"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, default=1)


class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    order_number = Column(String(20), unique=True, index=True, nullable=False)  # Уникальный номер заказа
    total_price = Column(Float, nullable=False)
    status = Column(String(50), default="pending", nullable=False)  # pending, confirmed, processing, shipped, delivered, cancelled
    delivery_address = Column(Text, nullable=False)  # Адрес доставки
    delivery_phone = Column(String(20), nullable=False)  # Телефон для доставки
    delivery_method = Column(String(50), default="courier", nullable=False)  # courier, pickup, post
    payment_method = Column(String(50), default="cash", nullable=False)  # cash, card, online
    notes = Column(Text)  # Дополнительные заметки
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)


class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token = Column(String(255), unique=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)