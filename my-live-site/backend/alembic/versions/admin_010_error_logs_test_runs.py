"""Add error_logs and test_runs tables for System Health dashboard

Revision ID: admin_010_health
Revises: admin_009_ops
Create Date: 2026-02-15

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

revision = 'admin_010_health'
down_revision = 'admin_009_ops'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. error_logs
    op.create_table(
        'error_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('level', sa.String(20), nullable=False, index=True),
        sa.Column('source', sa.String(20), nullable=False, index=True),
        sa.Column('error_type', sa.String(255), nullable=False, index=True),
        sa.Column('message', sa.Text, nullable=False),
        sa.Column('stack_trace', sa.Text, nullable=True),
        sa.Column('endpoint', sa.String(500), nullable=True, index=True),
        sa.Column('method', sa.String(10), nullable=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True, index=True),
        sa.Column('user_role', sa.String(50), nullable=True),
        sa.Column('request_data', postgresql.JSONB, nullable=True),
        sa.Column('context', postgresql.JSONB, nullable=True),
        sa.Column('ai_diagnosis', sa.Text, nullable=True),
        sa.Column('ai_diagnosed_at', sa.DateTime, nullable=True),
        sa.Column('is_resolved', sa.Boolean, server_default='false', nullable=False, index=True),
        sa.Column('resolved_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('resolved_at', sa.DateTime, nullable=True),
        sa.Column('resolution_notes', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now(), nullable=False, index=True),
    )

    # Composite indexes for common query patterns
    op.create_index('ix_error_level_created', 'error_logs', ['level', 'created_at'])
    op.create_index('ix_error_source_created', 'error_logs', ['source', 'created_at'])
    op.create_index('ix_error_type_created', 'error_logs', ['error_type', 'created_at'])
    op.create_index('ix_error_resolved_created', 'error_logs', ['is_resolved', 'created_at'])
    op.create_index('ix_error_endpoint_created', 'error_logs', ['endpoint', 'created_at'])

    # 2. test_runs
    op.create_table(
        'test_runs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('run_type', sa.String(20), nullable=False, index=True),
        sa.Column('status', sa.String(20), nullable=False, server_default='pending', index=True),
        sa.Column('output', sa.Text, nullable=True),
        sa.Column('summary', postgresql.JSONB, nullable=True),
        sa.Column('triggered_by', postgresql.UUID(as_uuid=True), nullable=False, index=True),
        sa.Column('started_at', sa.DateTime, server_default=sa.func.now(), nullable=False, index=True),
        sa.Column('completed_at', sa.DateTime, nullable=True),
        sa.Column('duration_seconds', sa.String(20), nullable=True),
    )

    op.create_index('ix_testrun_type_started', 'test_runs', ['run_type', 'started_at'])
    op.create_index('ix_testrun_status_started', 'test_runs', ['status', 'started_at'])


def downgrade() -> None:
    op.drop_table('test_runs')
    op.drop_table('error_logs')
