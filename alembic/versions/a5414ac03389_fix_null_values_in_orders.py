"""fix_null_values_in_orders

Revision ID: a5414ac03389
Revises: 3b6378c5e891
Create Date: 2025-07-05 22:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a5414ac03389'
down_revision: Union[str, None] = '3b6378c5e891'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Получаем соединение с базой данных
    connection = op.get_bind()
    
    # Исправляем NULL значения в обязательных полях
    connection.execute(sa.text("""
        UPDATE orders 
        SET delivery_address = COALESCE(delivery_address, 'Адрес не указан'),
            delivery_phone = COALESCE(delivery_phone, 'Телефон не указан'),
            delivery_method = COALESCE(delivery_method, 'courier'),
            payment_method = COALESCE(payment_method, 'cash'),
            status = COALESCE(status, 'pending')
        WHERE delivery_address IS NULL 
           OR delivery_phone IS NULL 
           OR delivery_method IS NULL 
           OR payment_method IS NULL 
           OR status IS NULL
    """))
    
    # Убеждаемся, что все заказы имеют номера
    connection.execute(sa.text("""
        UPDATE orders 
        SET order_number = 'ORDER' || LPAD(id::text, 6, '0')
        WHERE order_number IS NULL
    """))
    
    # Делаем поля обязательными
    op.alter_column('orders', 'delivery_address',
                    existing_type=sa.Text(),
                    nullable=False)
    op.alter_column('orders', 'delivery_phone',
                    existing_type=sa.String(length=20),
                    nullable=False)
    op.alter_column('orders', 'delivery_method',
                    existing_type=sa.String(length=50),
                    nullable=False)
    op.alter_column('orders', 'payment_method',
                    existing_type=sa.String(length=50),
                    nullable=False)
    op.alter_column('orders', 'status',
                    existing_type=sa.String(length=50),
                    nullable=False)


def downgrade() -> None:
    """Downgrade schema."""
    # Возвращаем поля как nullable
    op.alter_column('orders', 'delivery_address',
                    existing_type=sa.Text(),
                    nullable=True)
    op.alter_column('orders', 'delivery_phone',
                    existing_type=sa.String(length=20),
                    nullable=True)
    op.alter_column('orders', 'delivery_method',
                    existing_type=sa.String(length=50),
                    nullable=True)
    op.alter_column('orders', 'payment_method',
                    existing_type=sa.String(length=50),
                    nullable=True)
    op.alter_column('orders', 'status',
                    existing_type=sa.String(length=50),
                    nullable=True)
