"""add course_code to courses

Revision ID: 9c79a8d107ea
Revises: fin_004
Create Date: 2026-02-25 17:31:40.467063

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = '9c79a8d107ea'
down_revision: Union[str, None] = 'fin_004'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('courses', sa.Column('course_code', sa.String(length=50), nullable=True))
    op.create_index(op.f('ix_courses_course_code'), 'courses', ['course_code'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_courses_course_code'), table_name='courses')
    op.drop_column('courses', 'course_code')
