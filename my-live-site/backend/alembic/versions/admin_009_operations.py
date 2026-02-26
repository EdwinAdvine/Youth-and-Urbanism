"""Add operations tables: support_tickets, moderation_items, system_configs, system_config_change_requests, keyword_filters

Revision ID: admin_009_ops
Revises: admin_008_finance
Create Date: 2026-02-14

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

revision = 'admin_009_ops'
down_revision = 'admin_008_finance'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. support_tickets
    op.create_table(
        'support_tickets',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('ticket_number', sa.String(20), unique=True, nullable=False, index=True),
        sa.Column('subject', sa.String(300), nullable=False),
        sa.Column('description', sa.Text, nullable=False),
        sa.Column('category', sa.String(50), nullable=True, index=True),
        sa.Column('priority', sa.String(20), server_default='medium', index=True),
        sa.Column('status', sa.String(20), server_default='open', index=True),
        sa.Column('reporter_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id'), nullable=False, index=True),
        sa.Column('assigned_to', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id'), nullable=True),
        sa.Column('sla_deadline', sa.DateTime, nullable=True),
        sa.Column('resolved_at', sa.DateTime, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_ticket_status_priority', 'support_tickets', ['status', 'priority'])
    op.create_index('ix_ticket_reporter', 'support_tickets', ['reporter_id', 'created_at'])

    # 2. moderation_items
    op.create_table(
        'moderation_items',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('content_type', sa.String(50), nullable=False, index=True),
        sa.Column('content_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('content_preview', sa.Text, nullable=True),
        sa.Column('author_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id'), nullable=True),
        sa.Column('flag_reason', sa.String(100), nullable=False),
        sa.Column('flagged_by', sa.String(50), server_default='ai_filter'),
        sa.Column('severity', sa.String(20), server_default='medium', index=True),
        sa.Column('status', sa.String(30), server_default='pending_review', index=True),
        sa.Column('reviewed_by', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id'), nullable=True),
        sa.Column('reviewed_at', sa.DateTime, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_mod_status_severity', 'moderation_items', ['status', 'severity'])

    # 3. system_configs
    op.create_table(
        'system_configs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('key', sa.String(100), unique=True, nullable=False, index=True),
        sa.Column('value', postgresql.JSONB, server_default='{}'),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('category', sa.String(50), nullable=True, index=True),
        sa.Column('editable', sa.Boolean, server_default=sa.text('true')),
        sa.Column('last_modified_by', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id'), nullable=True),
        sa.Column('last_modified_at', sa.DateTime, server_default=sa.func.now()),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
    )

    # 4. system_config_change_requests
    op.create_table(
        'system_config_change_requests',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('config_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('system_configs.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('requested_value', postgresql.JSONB, nullable=False),
        sa.Column('reason', sa.Text, nullable=True),
        sa.Column('requested_by', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id'), nullable=False),
        sa.Column('status', sa.String(20), server_default='pending', index=True),
        sa.Column('decided_by', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id'), nullable=True),
        sa.Column('decided_at', sa.DateTime, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
    )

    # 5. keyword_filters
    op.create_table(
        'keyword_filters',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('keyword', sa.String(200), nullable=False, index=True),
        sa.Column('category', sa.String(50), nullable=False, index=True),
        sa.Column('severity', sa.String(20), server_default='medium'),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default=sa.text('true')),
        sa.Column('created_by', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id'), nullable=False),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table('keyword_filters')
    op.drop_table('system_config_change_requests')
    op.drop_table('system_configs')
    op.drop_index('ix_mod_status_severity', table_name='moderation_items')
    op.drop_table('moderation_items')
    op.drop_index('ix_ticket_reporter', table_name='support_tickets')
    op.drop_index('ix_ticket_status_priority', table_name='support_tickets')
    op.drop_table('support_tickets')
