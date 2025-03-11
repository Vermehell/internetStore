from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Cart, Product, User
from schemas import CartItemCreate, CartItemResponse
from crud import add_to_cart, get_cart_items, remove_from_cart
from auth import get_current_user

router = APIRouter(prefix="/cart", tags=["cart"])


@router.post("/", response_model=CartItemResponse)
def add_to_cart(
    item: CartItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Проверяем, есть ли уже такой товар в корзине пользователя
    cart_item = db.query(Cart).filter(
        Cart.user_id == current_user.id,
        Cart.product_id == item.product_id,
    ).first()

    if cart_item:
        # Если товар уже есть, увеличиваем количество
        cart_item.quantity += item.quantity
    else:
        # Если товара нет, создаем новую запись
        cart_item = Cart(
            user_id=current_user.id,
            product_id=item.product_id,
            quantity=item.quantity,
        )
        db.add(cart_item)

    db.commit()
    db.refresh(cart_item)
    return cart_item


@router.get("/", response_model=list[CartItemResponse])
def get_cart_items(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),  # Требуем аутентификацию
):
    cart_items = db.query(Cart).filter(Cart.user_id == current_user.id).all()
    return cart_items


@router.delete("/{cart_item_id}", response_model=dict)
def delete_cart_item(
    cart_item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return remove_from_cart(db, cart_item_id, current_user.id)