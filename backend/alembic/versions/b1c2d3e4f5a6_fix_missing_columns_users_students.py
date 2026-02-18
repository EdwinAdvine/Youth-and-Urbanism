"""fix missing columns in users and students tables

Adds deleted_at to users; renames competency_tracking -> competencies and
adds enrollment_date + overall_performance to students.
All operations are idempotent.

Revision ID: b1c2d3e4f5a6
Revises: a1b2c3d4e5f6
Create Date: 2026-02-18 09:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'b1c2d3e4f5a6'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    _conn = op.get_bind()
    _inspector = sa.inspect(_conn)

    # ── users ──────────────────────────────────────────────────────────────
    _user_cols = {col['name'] for col in _inspector.get_columns('users')}

    if 'deleted_at' not in _user_cols:
        op.add_column('users', sa.Column('deleted_at', sa.DateTime(), nullable=True))

    # ── students ───────────────────────────────────────────────────────────
    _student_cols = {col['name'] for col in _inspector.get_columns('students')}

    # Rename competency_tracking -> competencies (initial schema had wrong name)
    if 'competency_tracking' in _student_cols and 'competencies' not in _student_cols:
        op.execute('ALTER TABLE students RENAME COLUMN competency_tracking TO competencies')
    elif 'competencies' not in _student_cols:
        op.add_column(
            'students',
            sa.Column(
                'competencies',
                postgresql.JSONB(),
                server_default=sa.text("'{}'::jsonb"),
                nullable=False,
            ),
        )

    # Refresh column list after potential rename
    _student_cols = {col['name'] for col in sa.inspect(_conn).get_columns('students')}

    if 'enrollment_date' not in _student_cols:
        op.add_column(
            'students',
            sa.Column(
                'enrollment_date',
                sa.Date(),
                server_default=sa.func.current_date(),
                nullable=False,
            ),
        )

    if 'overall_performance' not in _student_cols:
        op.add_column(
            'students',
            sa.Column(
                'overall_performance',
                postgresql.JSONB(),
                server_default=sa.text("'{}'::jsonb"),
                nullable=False,
            ),
        )


def downgrade() -> None:
    pass
