"""Add staff analytics and report tables: staff_report_definitions, staff_report_schedules

Revision ID: 008_staff_analytics_reports
Revises: 007_staff_live_sessions
Create Date: 2026-02-13

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

# revision identifiers, used by Alembic.
revision = '008_staff_analytics_reports'
down_revision = '007_staff_live_sessions'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create staff analytics and report tables."""

    # 1. Create staff_report_definitions table
    op.create_table(
        'staff_report_definitions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('report_type', sa.String(50), nullable=False),
        sa.Column('config', postgresql.JSONB, nullable=False),
        sa.Column('filters', postgresql.JSONB, server_default='{}'),
        sa.Column('created_by', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('is_template', sa.Boolean, nullable=False, server_default=sa.text('false')),
        sa.Column('is_shared', sa.Boolean, nullable=False, server_default=sa.text('false')),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text("now()")),
        sa.Column('updated_at', sa.DateTime, nullable=True, server_default=sa.text("now()")),
    )

    # 2. Create staff_report_schedules table
    op.create_table(
        'staff_report_schedules',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column('report_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('staff_report_definitions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('schedule_cron', sa.String(100), nullable=False),
        sa.Column('format', sa.String(20), nullable=False),
        sa.Column('recipients', postgresql.JSONB, nullable=False),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default=sa.text('true')),
        sa.Column('last_run_at', sa.DateTime, nullable=True),
        sa.Column('next_run_at', sa.DateTime, nullable=True),
        sa.Column('created_by', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text("now()")),
    )


def downgrade() -> None:
    """Remove staff analytics and report tables."""
    op.drop_table('staff_report_schedules')
    op.drop_table('staff_report_definitions')
