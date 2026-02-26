"""Add system_health_snapshots table for Platform Pulse monitoring

Revision ID: admin_003_health
Revises: 002_admin_infrastructure
Create Date: 2026-02-14

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

# revision identifiers, used by Alembic.
revision = 'admin_003_health'
down_revision = '002_admin_infrastructure'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create system_health_snapshots table."""

    op.create_table(
        'system_health_snapshots',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('service_name', sa.String(100), nullable=False, index=True),
        sa.Column('status', sa.String(20), nullable=False, server_default='healthy'),
        sa.Column('response_time_ms', sa.Float, nullable=True),
        sa.Column('error_rate', sa.Float, nullable=True, server_default='0.0'),
        sa.Column('details', postgresql.JSONB, server_default='{}'),
        sa.Column('checked_at', sa.DateTime, nullable=False, server_default=sa.func.now(), index=True),
    )

    # Composite indexes for common query patterns
    op.create_index(
        'ix_health_service_checked',
        'system_health_snapshots',
        ['service_name', 'checked_at'],
    )
    op.create_index(
        'ix_health_status_checked',
        'system_health_snapshots',
        ['status', 'checked_at'],
    )


def downgrade() -> None:
    """Drop system_health_snapshots table."""
    op.drop_index('ix_health_status_checked', table_name='system_health_snapshots')
    op.drop_index('ix_health_service_checked', table_name='system_health_snapshots')
    op.drop_table('system_health_snapshots')
