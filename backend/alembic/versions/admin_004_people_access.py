"""Add user_restrictions and api_tokens tables for People & Access management

Revision ID: admin_004_people
Revises: admin_003_health
Create Date: 2026-02-14

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

# revision identifiers, used by Alembic.
revision = 'admin_004_people'
down_revision = 'admin_003_health'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create user_restrictions and api_tokens tables."""

    # 1. user_restrictions
    op.create_table(
        'user_restrictions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('user_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('restriction_type', sa.String(50), nullable=False, index=True),
        sa.Column('reason', sa.Text, nullable=False),
        sa.Column('created_by', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id'), nullable=False),
        sa.Column('duration_days', sa.Integer, nullable=True),
        sa.Column('expires_at', sa.DateTime, nullable=True),
        sa.Column('affected_features', postgresql.JSONB, server_default='[]'),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default=sa.text('true'), index=True),
        sa.Column('appealed', sa.Boolean, nullable=False, server_default=sa.text('false')),
        sa.Column('appeal_text', sa.Text, nullable=True),
        sa.Column('appeal_decision', sa.String(20), nullable=True),
        sa.Column('appeal_decided_by', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id'), nullable=True),
        sa.Column('appeal_decided_at', sa.DateTime, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
    )

    op.create_index('ix_restriction_user_active', 'user_restrictions', ['user_id', 'is_active'])
    op.create_index('ix_restriction_type_active', 'user_restrictions', ['restriction_type', 'is_active'])

    # 2. api_tokens
    op.create_table(
        'api_tokens',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('user_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('token_hash', sa.String(255), unique=True, nullable=False, index=True),
        sa.Column('scopes', postgresql.JSONB, server_default='[]'),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default=sa.text('true'), index=True),
        sa.Column('last_used_at', sa.DateTime, nullable=True),
        sa.Column('expires_at', sa.DateTime, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.Column('created_by', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id'), nullable=True),
    )


def downgrade() -> None:
    """Drop user_restrictions and api_tokens tables."""
    op.drop_table('api_tokens')
    op.drop_index('ix_restriction_type_active', table_name='user_restrictions')
    op.drop_index('ix_restriction_user_active', table_name='user_restrictions')
    op.drop_table('user_restrictions')
