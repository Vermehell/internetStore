from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Product, Category, User, ProductSpecification
from schemas import ProductCreate, ProductResponse, ProductSpecificationResponse
from crud import get_products, create_product, get_product_by_id
from auth import get_current_user
from typing import Optional
from fastapi import Query

router = APIRouter(prefix="/products", tags=["products"])

@router.get("/", response_model=list[ProductResponse])
def read_products(
    skip: int = 0,
    limit: int = 10,
    category_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    return get_products(db, skip=skip, limit=limit, category_id=category_id)

@router.get("/{product_id}", response_model=ProductResponse)
def read_product(product_id: int, db: Session = Depends(get_db)):
    product = get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/", response_model=ProductResponse)
def create_new_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can add products")
    category = db.query(Category).filter(Category.id == product.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return create_product(db, product)

@router.get("/{product_id}/specs", response_model=list[ProductSpecificationResponse])
def get_product_specifications(product_id: int, db: Session = Depends(get_db)):
    specs = db.query(ProductSpecification).filter(ProductSpecification.product_id == product_id).all()
    if not specs:
        raise HTTPException(status_code=404, detail="Характеристики не найдены")
    return specs