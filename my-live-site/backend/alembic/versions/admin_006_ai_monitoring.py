"""Add AI monitoring tables: ai_conversation_flags, ai_content_reviews, ai_performance_metrics

Revision ID: admin_006_ai
Revises: admin_005_content
Create Date: 2026-02-14

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

revision = 'admin_006_ai'
down_revision = 'admin_005_content'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. ai_conversation_flags
    op.create_table(
        'ai_conversation_flags',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('conversation_id', postgresql.UUID(as_uuid=True), nullable=True, index=True),
        sa.Column('student_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('students.id', ondelete='SET NULL'), nullable=True, index=True),
        sa.Column('flag_type', sa.String(50), nullable=False, index=True),
        sa.Column('severity', sa.String(20), nullable=False, index=True),
        sa.Column('snippet', sa.Text, nullable=True),
        sa.Column('model_used', sa.String(100), nullable=True),
        sa.Column('status', sa.String(30), server_default='pending_review', index=True),
        sa.Column('reviewed_by', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id'), nullable=True),
        sa.Column('reviewed_at', sa.DateTime, nullable=True),
        sa.Column('admin_notes', sa.Text, nullable=True),
        sa.Column('flagged_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_aicf_type_severity', 'ai_conversation_flags', ['flag_type', 'severity'])
    op.create_index('ix_aicf_status_created', 'ai_conversation_flags', ['status', 'created_at'])

    # 2. ai_content_reviews
    op.create_table(
        'ai_content_reviews',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('content_type', sa.String(50), nullable=False, index=True),
        sa.Column('content_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('model_used', sa.String(100), nullable=True),
        sa.Column('original_content', sa.Text, nullable=True),
        sa.Column('flagged_issues', postgresql.JSONB, server_default='[]'),
        sa.Column('status', sa.String(20), server_default='pending', index=True),
        sa.Column('reviewed_by', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id'), nullable=True),
        sa.Column('reviewed_at', sa.DateTime, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
    )

    # 3. ai_performance_metrics
    op.create_table(
        'ai_performance_metrics',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('model_name', sa.String(100), nullable=False, index=True),
        sa.Column('metric_type', sa.String(50), nullable=False, index=True),
        sa.Column('value', sa.Float, nullable=False),
        sa.Column('unit', sa.String(30), nullable=True),
        sa.Column('period_start', sa.DateTime, nullable=False),
        sa.Column('period_end', sa.DateTime, nullable=False),
        sa.Column('metadata', postgresql.JSONB, server_default='{}'),
        sa.Column('recorded_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_aipm_model_type', 'ai_performance_metrics', ['model_name', 'metric_type'])
    op.create_index('ix_aipm_period', 'ai_performance_metrics', ['period_start', 'period_end'])


def downgrade() -> None:
    op.drop_index('ix_aipm_period', table_name='ai_performance_metrics')
    op.drop_index('ix_aipm_model_type', table_name='ai_performance_metrics')
    op.drop_table('ai_performance_metrics')
    op.drop_table('ai_content_reviews')
    op.drop_index('ix_aicf_status_created', table_name='ai_conversation_flags')
    op.drop_index('ix_aicf_type_severity', table_name='ai_conversation_flags')
    op.drop_table('ai_conversation_flags')
