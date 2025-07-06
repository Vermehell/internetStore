from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Product, Category, User, ProductSpecification
from backend.schemas import ProductCreate, ProductResponse, ProductSpecificationResponse, ProductCreateWithSpecs, ProductSpecificationCreate, ProductUpdateWithSpecs
from backend.crud import get_products, create_product, get_product_by_id, update_product, delete_product, create_product_with_specs, update_product_with_specs
from backend.auth import get_current_user
from typing import Optional
from fastapi import Query
import logging

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

@router.post("/with-specs", response_model=ProductResponse)
def create_new_product_with_specs(
    product: ProductCreateWithSpecs,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can add products")
    category = db.query(Category).filter(Category.id == product.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return create_product_with_specs(db, product.dict(exclude={"specs"}), [spec.dict() for spec in product.specs])

@router.get("/{product_id}/specs", response_model=list[ProductSpecificationResponse])
def get_product_specifications(product_id: int, db: Session = Depends(get_db)):
    specs = db.query(ProductSpecification).filter(ProductSpecification.product_id == product_id).order_by(ProductSpecification.order).all()
    if not specs:
        raise HTTPException(status_code=404, detail="Характеристики не найдены")
    return specs

@router.put("/{product_id}", response_model=ProductResponse)
def update_existing_product(
    product_id: int,
    product: ProductCreate = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can update products")
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return update_product(db, product_id, product.dict())

@router.delete("/{product_id}")
def delete_existing_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can delete products")
    return delete_product(db, product_id)

@router.post("/{product_id}/specs", response_model=ProductSpecificationResponse)
def create_product_specification(product_id: int, spec: ProductSpecificationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can add specifications")
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    db_spec = ProductSpecification(product_id=product_id, spec_name=spec.spec_name, spec_value=spec.spec_value)
    db.add(db_spec)
    db.commit()
    db.refresh(db_spec)
    return db_spec

@router.delete("/specs/{spec_id}")
def delete_product_specification(spec_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can delete specifications")
    db_spec = db.query(ProductSpecification).filter(ProductSpecification.id == spec_id).first()
    if not db_spec:
        logging.warning(f"Specification with id {spec_id} not found for deletion.")
        raise HTTPException(status_code=404, detail="Specification not found")
    logging.info(f"Deleting specification with id {spec_id}")
    db.delete(db_spec)
    db.commit()
    logging.info(f"Deleted specification with id {spec_id} and committed.")
    return {"message": "Specification deleted"}

@router.put("/{product_id}/with-specs", response_model=ProductResponse)
def update_product_with_specs_endpoint(
    product_id: int,
    product: ProductUpdateWithSpecs = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can update products")
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return update_product_with_specs(db, product_id, product.dict(exclude={"specs"}), [spec.dict() for spec in product.specs])