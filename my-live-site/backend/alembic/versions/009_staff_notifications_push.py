"""Add staff notification tables: staff_push_subscriptions, staff_notification_preferences

Revision ID: 009_staff_notifications_push
Revises: 008_staff_analytics_reports
Create Date: 2026-02-13

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

# revision identifiers, used by Alembic.
revision = '009_staff_notifications_push'
down_revision = '008_staff_analytics_reports'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create staff notification tables."""

    # 1. Create staff_push_subscriptions table
    op.create_table(
        'staff_push_subscriptions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column('user_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('endpoint', sa.Text, nullable=False),
        sa.Column('p256dh_key', sa.Text, nullable=False),
        sa.Column('auth_key', sa.Text, nullable=False),
        sa.Column('user_agent', sa.String(500), nullable=True),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text("now()")),
    )

    # 2. Create staff_notification_preferences table
    op.create_table(
        'staff_notification_preferences',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column('user_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False),
        sa.Column('channels', postgresql.JSONB,
                  server_default='{"push":true,"email":true,"in_app":true}'),
        sa.Column('digest_frequency', sa.String(20), server_default='daily'),
        sa.Column('quiet_hours', postgresql.JSONB,
                  server_default='{"enabled":false,"start":"22:00","end":"07:00"}'),
        sa.Column('categories', postgresql.JSONB, server_default='{}'),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text("now()")),
        sa.Column('updated_at', sa.DateTime, nullable=True, server_default=sa.text("now()")),
    )


def downgrade() -> None:
    """Remove staff notification tables."""
    op.drop_table('staff_notification_preferences')
    op.drop_table('staff_push_subscriptions')
