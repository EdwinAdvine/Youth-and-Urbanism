"""add instructor invite token fields

Revision ID: fa3b9c2d1e0a
Revises: ec100aed5306
Create Date: 2026-02-21 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fa3b9c2d1e0a'
down_revision: Union[str, None] = 'ec100aed5306'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'instructor_applications',
        sa.Column('invite_token', sa.String(500), nullable=True, unique=True),
    )
    op.add_column(
        'instructor_applications',
        sa.Column('invite_expires_at', sa.DateTime(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column('instructor_applications', 'invite_expires_at')
    op.drop_column('instructor_applications', 'invite_token')
