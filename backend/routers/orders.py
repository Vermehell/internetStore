from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from backend.models import User
from backend.schemas import OrderCreate, OrderResponse, OrderListResponse, OrderUpdate, OrderStatistics
from backend.crud import (
    create_order, get_user_orders, get_order_by_id, get_all_orders,
    update_order_status, update_order, get_order_statistics
)
from backend.auth import get_current_user

router = APIRouter(prefix="/orders", tags=["orders"])

@router.post("/", response_model=OrderResponse)
def create_new_order(
    order: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Создает новый заказ"""
    if not order.items:
        raise HTTPException(status_code=400, detail="Заказ должен содержать хотя бы один товар")
    
    order_data = order.dict()
    return create_order(db, current_user.id, order_data)


@router.get("/my", response_model=List[OrderListResponse])
def get_my_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Получает заказы текущего пользователя"""
    return get_user_orders(db, current_user.id, skip, limit)


@router.get("/my/{order_id}", response_model=OrderResponse)
def get_my_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Получает конкретный заказ пользователя"""
    order = get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    
    if order['user_id'] != current_user.id:
        raise HTTPException(status_code=403, detail="Нет доступа к этому заказу")
    
    return order


@router.get("/admin", response_model=List[OrderListResponse])
def get_all_orders_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Получает все заказы (только для админов)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Требуются права администратора")
    
    return get_all_orders(db, skip, limit, status)


@router.get("/admin/statistics", response_model=OrderStatistics)
def get_order_statistics_admin(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Получает статистику по заказам (только для админов)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Требуются права администратора")
    
    return get_order_statistics(db)


@router.get("/admin/{order_id}", response_model=OrderResponse)
def get_order_admin(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Получает заказ по ID (только для админов)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Требуются права администратора")
    
    order = get_order_by_id(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    
    return order


@router.put("/admin/{order_id}/status")
def update_order_status_admin(
    order_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Обновляет статус заказа (только для админов)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Требуются права администратора")
    
    return update_order_status(db, order_id, status)


@router.put("/admin/{order_id}", response_model=OrderResponse)
def update_order_admin(
    order_id: int,
    order_update: OrderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Обновляет информацию о заказе (только для админов)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Требуются права администратора")
    
    order_data = order_update.dict(exclude_unset=True)
    return update_order(db, order_id, order_data)


