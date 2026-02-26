"""Add analytics tables: compliance_incidents, scheduled_reports

Revision ID: admin_007_analytics
Revises: admin_006_ai
Create Date: 2026-02-14

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

revision = 'admin_007_analytics'
down_revision = 'admin_006_ai'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. compliance_incidents
    op.create_table(
        'compliance_incidents',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('incident_type', sa.String(50), nullable=False, index=True),
        sa.Column('severity', sa.String(20), nullable=False, index=True),
        sa.Column('description', sa.Text, nullable=False),
        sa.Column('affected_users_count', sa.Integer, server_default='0'),
        sa.Column('status', sa.String(20), server_default='open', index=True),
        sa.Column('reported_by', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id'), nullable=True),
        sa.Column('resolved_by', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id'), nullable=True),
        sa.Column('resolved_at', sa.DateTime, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
    )

    # 2. scheduled_reports
    op.create_table(
        'scheduled_reports',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('report_type', sa.String(50), nullable=False),
        sa.Column('schedule_cron', sa.String(100), nullable=False),
        sa.Column('recipients', postgresql.JSONB, server_default='[]'),
        sa.Column('parameters', postgresql.JSONB, server_default='{}'),
        sa.Column('last_run_at', sa.DateTime, nullable=True),
        sa.Column('next_run_at', sa.DateTime, nullable=True),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default=sa.text('true')),
        sa.Column('created_by', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id'), nullable=False),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table('scheduled_reports')
    op.drop_table('compliance_incidents')
