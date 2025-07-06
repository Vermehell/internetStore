"""fill_order_numbers_and_make_not_null

Revision ID: 3b6378c5e891
Revises: 254fec74154b
Create Date: 2025-07-05 22:15:00.000000

"""
from typing import Sequence, Union
import random
import string

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3b6378c5e891'
down_revision: Union[str, None] = '254fec74154b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def generate_order_number():
    """Генерирует уникальный номер заказа"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))


def upgrade() -> None:
    """Upgrade schema."""
    # Получаем соединение с базой данных
    connection = op.get_bind()
    
    # Получаем все заказы без номера
    result = connection.execute(sa.text("SELECT id FROM orders WHERE order_number IS NULL"))
    orders_without_number = result.fetchall()
    
    # Генерируем номера для каждого заказа
    for order in orders_without_number:
        order_number = generate_order_number()
        
        # Проверяем, что номер уникален
        while True:
            existing = connection.execute(
                sa.text("SELECT id FROM orders WHERE order_number = :order_number"),
                {"order_number": order_number}
            ).fetchone()
            if not existing:
                break
            order_number = generate_order_number()
        
        # Обновляем заказ
        connection.execute(
            sa.text("UPDATE orders SET order_number = :order_number WHERE id = :id"),
            {"order_number": order_number, "id": order.id}
        )
    
    # Заполняем остальные поля значениями по умолчанию
    connection.execute(sa.text("""
        UPDATE orders 
        SET delivery_address = 'Адрес не указан',
            delivery_phone = 'Телефон не указан',
            delivery_method = 'courier',
            payment_method = 'cash'
        WHERE delivery_address IS NULL
    """))
    
    # Изменяем поле order_number на NOT NULL
    op.alter_column('orders', 'order_number',
                    existing_type=sa.String(length=20),
                    nullable=False)


def downgrade() -> None:
    """Downgrade schema."""
    # Возвращаем поле order_number как nullable
    op.alter_column('orders', 'order_number',
                    existing_type=sa.String(length=20),
                    nullable=True)
