from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from backend.models import Category, User
from backend.schemas import CategoryCreate, CategoryResponse, CategoryUpdate
from backend.crud import create_category, get_categories, update_category, delete_category
from backend.auth import get_current_user

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("/", response_model=list[CategoryResponse])
def read_categories(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return get_categories(db, skip=skip, limit=limit)


@router.post("/", response_model=CategoryResponse)
def create_new_category(
    category: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can add categories")

    return create_category(db, category)

@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.put("/{category_id}", response_model=CategoryResponse)
def update_category_endpoint(
    category_id: int,
    category: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can update categories")
    return update_category(db, category_id, category.dict())

@router.delete("/{category_id}")
def delete_category_endpoint(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can delete categories")
    return delete_category(db, category_id)