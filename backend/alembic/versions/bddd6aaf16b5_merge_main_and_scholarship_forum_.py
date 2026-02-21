"""merge main and scholarship_forum branches

Revision ID: bddd6aaf16b5
Revises: b1c2d3e4f5a6, c9d0e1f2a3b4
Create Date: 2026-02-21 20:44:34.376234

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'bddd6aaf16b5'
down_revision: Union[str, None] = ('b1c2d3e4f5a6', 'c9d0e1f2a3b4')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
