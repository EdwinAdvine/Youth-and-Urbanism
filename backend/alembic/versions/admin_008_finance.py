"""Add finance tables: partner_contracts, invoices, payout_queue

Revision ID: admin_008_finance
Revises: admin_007_analytics
Create Date: 2026-02-14

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

revision = 'admin_008_finance'
down_revision = 'admin_007_analytics'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. partner_contracts
    op.create_table(
        'partner_contracts',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('partner_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('contract_type', sa.String(50), nullable=False),
        sa.Column('terms', postgresql.JSONB, server_default='{}'),
        sa.Column('start_date', sa.DateTime, nullable=True),
        sa.Column('end_date', sa.DateTime, nullable=True),
        sa.Column('status', sa.String(20), server_default='pending', index=True),
        sa.Column('auto_renew', sa.Boolean, server_default=sa.text('false')),
        sa.Column('total_value', sa.Numeric(12, 2), nullable=True),
        sa.Column('currency', sa.String(5), server_default='KES'),
        sa.Column('signed_at', sa.DateTime, nullable=True),
        sa.Column('created_by', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id'), nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
    )
    op.create_index('ix_pc_partner_status', 'partner_contracts', ['partner_id', 'status'])

    # 2. invoices
    op.create_table(
        'invoices',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('invoice_number', sa.String(50), unique=True, nullable=False, index=True),
        sa.Column('partner_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id'), nullable=True, index=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id'), nullable=True, index=True),
        sa.Column('amount', sa.Numeric(12, 2), nullable=False),
        sa.Column('currency', sa.String(5), server_default='KES'),
        sa.Column('status', sa.String(20), server_default='draft', index=True),
        sa.Column('due_date', sa.DateTime, nullable=True),
        sa.Column('paid_at', sa.DateTime, nullable=True),
        sa.Column('items', postgresql.JSONB, server_default='[]'),
        sa.Column('notes', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
    )

    # 3. payout_queue
    op.create_table(
        'payout_queue',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('recipient_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('amount', sa.Numeric(12, 2), nullable=False),
        sa.Column('currency', sa.String(5), server_default='KES'),
        sa.Column('payment_method', sa.String(50), nullable=False),
        sa.Column('status', sa.String(20), server_default='pending', index=True),
        sa.Column('reference', sa.String(100), nullable=True),
        sa.Column('processed_at', sa.DateTime, nullable=True),
        sa.Column('failure_reason', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table('payout_queue')
    op.drop_table('invoices')
    op.drop_index('ix_pc_partner_status', table_name='partner_contracts')
    op.drop_table('partner_contracts')
