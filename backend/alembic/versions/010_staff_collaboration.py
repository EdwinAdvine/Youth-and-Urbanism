"""Add staff collaboration tables: yjs_documents

Revision ID: 010_staff_collaboration
Revises: 009_staff_notifications_push
Create Date: 2026-02-13

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

# revision identifiers, used by Alembic.
revision = '010_staff_collaboration'
down_revision = '009_staff_notifications_push'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create staff collaboration tables."""

    # 1. Create yjs_documents table
    op.create_table(
        'yjs_documents',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column('doc_id', sa.String(100), unique=True, nullable=False),
        sa.Column('content_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('staff_content_items.id', ondelete='SET NULL'), nullable=True),
        sa.Column('doc_state', sa.LargeBinary, nullable=False),
        sa.Column('version', sa.Integer, server_default='0'),
        sa.Column('last_updated_by', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text("now()")),
        sa.Column('updated_at', sa.DateTime, nullable=True, server_default=sa.text("now()")),
    )


def downgrade() -> None:
    """Remove staff collaboration tables."""
    op.drop_table('yjs_documents')
