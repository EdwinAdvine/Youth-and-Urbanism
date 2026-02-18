"""rename hashed_password to password_hash in users table

Revision ID: a1b2c3d4e5f6
Revises: 8a68867dba8c
Create Date: 2026-02-18 08:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '8a68867dba8c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # The initial schema (000_initial_schema.py) created the column as
    # 'hashed_password', but the ORM model (app/models/user.py) maps the
    # attribute 'password_hash' to a DB column of the same name.
    # This migration renames the column to align the DB with the ORM model.
    _conn = op.get_bind()
    _inspector = sa.inspect(_conn)
    _columns = [col['name'] for col in _inspector.get_columns('users')]

    if 'hashed_password' in _columns and 'password_hash' not in _columns:
        op.execute('ALTER TABLE users RENAME COLUMN hashed_password TO password_hash')
    # If the column is already named password_hash (e.g. re-run), do nothing.


def downgrade() -> None:
    _conn = op.get_bind()
    _inspector = sa.inspect(_conn)
    _columns = [col['name'] for col in _inspector.get_columns('users')]

    if 'password_hash' in _columns and 'hashed_password' not in _columns:
        op.execute('ALTER TABLE users RENAME COLUMN password_hash TO hashed_password')
