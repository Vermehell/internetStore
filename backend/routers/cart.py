from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from backend.models import Cart, Product, User
from backend.schemas import CartItemCreate, CartItemResponse, CartItemUpdate
from backend.auth import get_current_user

router = APIRouter(prefix="/cart", tags=["cart"])

@router.get("/{product_id}")
def read_product(
    product_id: int,
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/")
def add_to_cart(
    item: CartItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cart_item = db.query(Cart).filter(
        Cart.user_id == current_user.id,
        Cart.product_id == item.product_id,
    ).first()
    if cart_item:
        cart_item.quantity += item.quantity
    else:
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
    current_user: User = Depends(get_current_user),
):
    return db.query(Cart).filter(Cart.user_id == current_user.id).all()

@router.delete("/{cart_item_id}")
def delete_cart_item(
    cart_item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cart_item = db.query(Cart).filter(
        Cart.id == cart_item_id,
        Cart.user_id == current_user.id,
    ).first()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    db.delete(cart_item)
    db.commit()
    return {"message": "Cart item deleted"}

@router.put("/{cart_item_id}")
def update_cart_item(
    cart_item_id: int,
    item: CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cart_item = db.query(Cart).filter(
        Cart.id == cart_item_id,
        Cart.user_id == current_user.id,
    ).first()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    cart_item.quantity = item.quantity
    db.commit()
    db.refresh(cart_item)
    return cart_item