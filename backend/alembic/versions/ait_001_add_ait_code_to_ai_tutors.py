"""ait: add ait_code column to ai_tutors

Revision ID: ait_001
Revises: feat_001
Create Date: 2026-02-26 10:00:00.000000

Adds a unique AI Tutor identifier code (ait_code) to the ai_tutors table.
Format: UHS/{year}/G{grade}/{seq}-AIT{seq}
Example: UHS/2026/G3/001-AIT001

The column is nullable to support existing rows — the application layer
generates and backfills codes on first access.
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = 'ait_001'
down_revision: Union[str, None] = 'feat_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'ai_tutors',
        sa.Column('ait_code', sa.String(length=50), nullable=True)
    )
    op.create_index(
        op.f('ix_ai_tutors_ait_code'),
        'ai_tutors',
        ['ait_code'],
        unique=True
    )


def downgrade() -> None:
    op.drop_index(op.f('ix_ai_tutors_ait_code'), table_name='ai_tutors')
    op.drop_column('ai_tutors', 'ait_code')
