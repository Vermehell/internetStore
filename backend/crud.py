from fastapi import HTTPException
from sqlalchemy.orm import Session
import random
import string
from sqlalchemy import func

from backend.auth import get_password_hash, verify_password
from backend.models import User, Category, Product, Cart, ProductSpecification, OrderItem, RefreshToken, Order
from .database import SessionLocal
from backend.schemas import UserCreate, CategoryCreate, ProductCreate, CartItemCreate
from typing import Optional


def create_user(db: Session, user: UserCreate):
    existing_user_by_login = db.query(User).filter(User.login == user.login).first()
    if existing_user_by_login:
        raise HTTPException(status_code=400, detail="Login already exists")

    existing_user_by_email = db.query(User).filter(User.email == user.email).first()
    if existing_user_by_email:
        raise HTTPException(status_code=400, detail="Email already exists")

    hashed_password = get_password_hash(user.password)
    db_user = User(
        login=user.login,
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_by_login(db: Session, login: str):
    return db.query(User).filter(User.login == login).first()


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


def get_products(db: Session, skip: int = 0, limit: int = 100, category_id: Optional[int] = None):
    query = db.query(Product)
    if category_id is not None:
        query = query.filter(Product.category_id == category_id)
    return query.offset(skip).limit(limit).all()


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
    
    # Обновляем имя пользователя
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


def update_product(db: Session, product_id: int, product_data: dict):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    for key, value in product_data.items():
        setattr(db_product, key, value)
    db.commit()
    db.refresh(db_product)
    return db_product


def delete_product(db: Session, product_id: int):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    # Удаляем связанные характеристики
    db.query(ProductSpecification).filter(ProductSpecification.product_id == product_id).delete()
    # Удаляем связанные позиции в корзине
    db.query(Cart).filter(Cart.product_id == product_id).delete()
    # Удаляем связанные позиции в заказах
    db.query(OrderItem).filter(OrderItem.product_id == product_id).delete()
    db.delete(db_product)
    db.commit()
    return {"message": "Product deleted"}


def create_product_with_specs(db: Session, product_data, specs_data):
    db_product = Product(**product_data)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    for spec in specs_data:
        db_spec = ProductSpecification(product_id=db_product.id, **spec)
        db.add(db_spec)
    db.commit()
    return db_product


def update_product_with_specs(db: Session, product_id: int, product_data: dict, specs_data: list[dict]):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    # Обновляем поля товара
    for key, value in product_data.items():
        setattr(db_product, key, value)
    # Получаем текущие характеристики
    current_specs = db.query(ProductSpecification).filter(ProductSpecification.product_id == product_id).all()
    current_specs_dict = {spec.id: spec for spec in current_specs}
    # id всех новых характеристик
    incoming_ids = set()
    for spec in specs_data:
        spec_id = spec.get("id")
        order = spec.get("order", 0)
        if spec_id is not None and spec_id in current_specs_dict:
            # Обновляем существующую характеристику
            db_spec = current_specs_dict[spec_id]
            db_spec.spec_name = spec["spec_name"]
            db_spec.spec_value = spec["spec_value"]
            db_spec.order = order
            incoming_ids.add(spec_id)
        else:
            # Добавляем новую характеристику
            db_spec = ProductSpecification(product_id=product_id, spec_name=spec["spec_name"], spec_value=spec["spec_value"], order=order)
            db.add(db_spec)
    # Удаляем отсутствующие характеристики
    for spec_id, db_spec in current_specs_dict.items():
        if spec_id not in incoming_ids:
            db.delete(db_spec)
    db.commit()
    db.refresh(db_product)
    return db_product


def update_category(db: Session, category_id: int, category_data: dict):
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    for key, value in category_data.items():
        setattr(db_category, key, value)
    db.commit()
    db.refresh(db_category)
    return db_category


def delete_category(db: Session, category_id: int):
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(db_category)
    db.commit()
    return {"message": "Category deleted"}


def get_all_users(db: Session):
    return db.query(User).all()


def update_user_role(db: Session, user_id: int, is_admin: bool):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    db_user.is_admin = is_admin
    db.commit()
    db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: int):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(db_user)
    db.commit()
    return {"message": "User deleted"}


def create_refresh_token(db: Session, user_id: int, token: str, expires_at):
    db_token = RefreshToken(user_id=user_id, token=token, expires_at=expires_at)
    db.add(db_token)
    db.commit()
    db.refresh(db_token)
    return db_token


def get_refresh_token(db: Session, token: str):
    return db.query(RefreshToken).filter(RefreshToken.token == token).first()


def delete_refresh_token(db: Session, token: str):
    db_token = db.query(RefreshToken).filter(RefreshToken.token == token).first()
    if db_token:
        db.delete(db_token)
        db.commit()


def delete_user_refresh_tokens(db: Session, user_id: int):
    db.query(RefreshToken).filter(RefreshToken.user_id == user_id).delete()
    db.commit()


def generate_order_number():
    """Генерирует уникальный номер заказа"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))


def create_order(db: Session, user_id: int, order_data: dict):
    """Создает новый заказ с уникальным номером"""
    # Генерируем уникальный номер заказа
    order_number = generate_order_number()
    while db.query(Order).filter(Order.order_number == order_number).first():
        order_number = generate_order_number()
    
    # Вычисляем общую стоимость
    total_price = sum(item['price'] * item['quantity'] for item in order_data['items'])
    
    # Создаем заказ
    order = Order(
        user_id=user_id,
        order_number=order_number,
        total_price=total_price,
        delivery_address=order_data['delivery_address'],
        delivery_phone=order_data['delivery_phone'],
        delivery_method=order_data.get('delivery_method', 'courier'),
        payment_method=order_data.get('payment_method', 'cash'),
        notes=order_data.get('notes')
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    
    # Создаем элементы заказа
    for item in order_data['items']:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item['product_id'],
            quantity=item['quantity'],
            price=item['price']
        )
        db.add(order_item)
    
    db.commit()
    return order


def get_user_orders(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    """Получает все заказы пользователя"""
    return db.query(Order).filter(Order.user_id == user_id).offset(skip).limit(limit).all()


def get_order_by_id(db: Session, order_id: int):
    """Получает заказ по ID с элементами заказа и информацией о товарах"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        return None
    
    # Получаем элементы заказа с информацией о товарах
    order_items = db.query(OrderItem).filter(OrderItem.order_id == order_id).all()
    items_with_products = []
    
    for item in order_items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        items_with_products.append({
            'id': item.id,
            'order_id': item.order_id,
            'product_id': item.product_id,
            'quantity': item.quantity,
            'price': item.price,
            'product': product
        })
    
    # Создаем словарь с данными заказа
    order_dict = {
        'id': order.id,
        'user_id': order.user_id,
        'order_number': order.order_number,
        'total_price': order.total_price,
        'status': order.status,
        'delivery_address': order.delivery_address,
        'delivery_phone': order.delivery_phone,
        'delivery_method': order.delivery_method,
        'payment_method': order.payment_method,
        'notes': order.notes,
        'created_at': order.created_at,
        'updated_at': order.updated_at,
        'items': items_with_products
    }
    
    return order_dict


def get_all_orders(db: Session, skip: int = 0, limit: int = 100, status: str = None):
    """Получает все заказы для админки с возможностью фильтрации по статусу"""
    query = db.query(Order)
    if status:
        query = query.filter(Order.status == status)
    return query.offset(skip).limit(limit).all()


def update_order_status(db: Session, order_id: int, status: str):
    """Обновляет статус заказа"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    
    valid_statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Неверный статус заказа")
    
    order.status = status
    db.commit()
    db.refresh(order)
    return order


def update_order(db: Session, order_id: int, order_data: dict):
    """Обновляет информацию о заказе"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    
    for key, value in order_data.items():
        if value is not None:
            setattr(order, key, value)
    
    db.commit()
    db.refresh(order)
    return order


def get_orders_by_status(db: Session, status: str, skip: int = 0, limit: int = 100):
    """Получает заказы по статусу"""
    return db.query(Order).filter(Order.status == status).offset(skip).limit(limit).all()


def get_order_statistics(db: Session):
    """Получает статистику по заказам"""
    total_orders = db.query(Order).count()
    pending_orders = db.query(Order).filter(Order.status == 'pending').count()
    confirmed_orders = db.query(Order).filter(Order.status == 'confirmed').count()
    processing_orders = db.query(Order).filter(Order.status == 'processing').count()
    shipped_orders = db.query(Order).filter(Order.status == 'shipped').count()
    delivered_orders = db.query(Order).filter(Order.status == 'delivered').count()
    cancelled_orders = db.query(Order).filter(Order.status == 'cancelled').count()
    
    total_revenue = db.query(Order).filter(Order.status.in_(['delivered', 'shipped'])).with_entities(
        func.sum(Order.total_price)
    ).scalar() or 0
    
    # Создаем объект, совместимый с Pydantic
    from backend.schemas import OrderStatistics
    return OrderStatistics(
        total_orders=total_orders,
        pending_orders=pending_orders,
        confirmed_orders=confirmed_orders,
        processing_orders=processing_orders,
        shipped_orders=shipped_orders,
        delivered_orders=delivered_orders,
        cancelled_orders=cancelled_orders,
        total_revenue=float(total_revenue)
    )