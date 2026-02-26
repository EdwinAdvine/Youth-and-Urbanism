"""add scholarship_applications table

Revision ID: b7c8d9e0f1a2
Revises: fa3b9c2d1e0a
Create Date: 2026-02-21 12:00:00.000000

"""
from typing import Union
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'b7c8d9e0f1a2'
down_revision: Union[str, None] = 'fa3b9c2d1e0a'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'scholarship_applications',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('applicant_type', sa.String(20), nullable=False),
        sa.Column('full_name', sa.String(200), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('phone', sa.String(30), nullable=True),
        sa.Column('student_name', sa.String(200), nullable=True),
        sa.Column('student_age', sa.String(10), nullable=True),
        sa.Column('school_name', sa.String(300), nullable=True),
        sa.Column('grade', sa.String(50), nullable=True),
        sa.Column('settlement', sa.String(200), nullable=True),
        sa.Column('county', sa.String(100), nullable=True),
        sa.Column('reason', sa.Text(), nullable=False),
        sa.Column('supporting_info', sa.Text(), nullable=True),
        sa.Column('status', sa.String(20), nullable=False, server_default='pending'),
        sa.Column('reviewed_by', sa.UUID(), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(), nullable=True),
        sa.Column('review_notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_scholarship_applications_email', 'scholarship_applications', ['email'])
    op.create_index('ix_scholarship_applications_status', 'scholarship_applications', ['status'])


def downgrade() -> None:
    op.drop_index('ix_scholarship_applications_status', table_name='scholarship_applications')
    op.drop_index('ix_scholarship_applications_email', table_name='scholarship_applications')
    op.drop_table('scholarship_applications')
