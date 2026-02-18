"""merge migration heads

Revision ID: ec100aed5306
Revises: 1f30eb399741, admin_010_health
Create Date: 2026-02-18 03:52:52.375214

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ec100aed5306'
down_revision: Union[str, None] = ('1f30eb399741', 'admin_010_health')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
