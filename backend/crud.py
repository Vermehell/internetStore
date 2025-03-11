from fastapi import HTTPException
from sqlalchemy.orm import Session

from auth import get_password_hash, verify_password
from models import User, Category, Product, Cart
from database import SessionLocal
from schemas import UserCreate, CategoryCreate, ProductCreate, CartItemCreate


def create_user(db: Session, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()


def create_category(db: Session, category: CategoryCreate):
    db_category = Category(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def get_categories(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Category).offset(skip).limit(limit).all()


def create_product(db: Session, product: ProductCreate):
    db_product = Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


def get_products(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Product).offset(skip).limit(limit).all()


def get_product_by_id(db: Session, product_id: int):
    return db.query(Product).filter(Product.id == product_id).first()


def add_to_cart(db: Session, user_id: int, item: CartItemCreate):
    db_item = Cart(user_id=user_id, **item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def get_cart_items(db: Session, user_id: int):
    return db.query(Cart).filter(Cart.user_id == user_id).all()


def remove_from_cart(db: Session, cart_item_id: int, user_id: int):
    cart_item = db.query(Cart).filter(Cart.id == cart_item_id, Cart.user_id == user_id).first()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    db.delete(cart_item)
    db.commit()
    return {"message": "Item removed from cart"}


def update_user_username(db: Session, user_id: int, new_username: str):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    existing_user = db.query(User).filter(User.username == new_username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    db_user.username = new_username
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user_password(db: Session, user_id: int, current_password: str, new_password: str):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(current_password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    db_user.hashed_password = get_password_hash(new_password)
    db.commit()
    db.refresh(db_user)
    return db_user