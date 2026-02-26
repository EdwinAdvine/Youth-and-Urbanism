"""Add staff ticket and SLA tables: sla_policies, staff_tickets, staff_ticket_messages, sla_escalations

Revision ID: 004_staff_tickets_sla
Revises: 003_staff_core_tables
Create Date: 2026-02-13

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

# revision identifiers, used by Alembic.
revision = '004_staff_tickets_sla'
down_revision = '003_staff_core_tables'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create staff ticket and SLA tables."""

    # 1. Create sla_policies table
    op.create_table(
        'sla_policies',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('priority', sa.String(20), nullable=False),
        sa.Column('category', sa.String(50), nullable=True),
        sa.Column('first_response_minutes', sa.Integer, nullable=False),
        sa.Column('resolution_minutes', sa.Integer, nullable=False),
        sa.Column('escalation_chain', postgresql.JSONB, nullable=False),
        sa.Column('breach_notification', postgresql.JSONB, server_default='{}'),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default=sa.text('true')),
        sa.Column('created_by', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text("now()")),
    )

    # 2. Create staff_tickets table
    op.create_table(
        'staff_tickets',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column('ticket_number', sa.String(20), unique=True, nullable=False),
        sa.Column('subject', sa.String(255), nullable=False),
        sa.Column('description', sa.Text, nullable=False),
        sa.Column('category', sa.String(50), nullable=False),
        sa.Column('priority', sa.String(20), nullable=False, server_default='medium'),
        sa.Column('status', sa.String(20), nullable=False, server_default='open'),
        sa.Column('reporter_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('assigned_to', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('escalated_to', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('sla_policy_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('sla_policies.id', ondelete='SET NULL'), nullable=True),
        sa.Column('sla_deadline', sa.DateTime, nullable=True),
        sa.Column('sla_breached', sa.Boolean, nullable=False, server_default=sa.text('false')),
        sa.Column('resolution', sa.Text, nullable=True),
        sa.Column('csat_score', sa.Integer, nullable=True),
        sa.Column('tags', postgresql.JSONB, server_default='[]'),
        sa.Column('metadata', postgresql.JSONB, server_default='{}'),
        sa.Column('first_response_at', sa.DateTime, nullable=True),
        sa.Column('resolved_at', sa.DateTime, nullable=True),
        sa.Column('closed_at', sa.DateTime, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text("now()")),
        sa.Column('updated_at', sa.DateTime, nullable=True, server_default=sa.text("now()")),
    )

    # 3. Create staff_ticket_messages table
    op.create_table(
        'staff_ticket_messages',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column('ticket_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('staff_tickets.id', ondelete='CASCADE'), nullable=False),
        sa.Column('author_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('content', sa.Text, nullable=False),
        sa.Column('is_internal', sa.Boolean, nullable=False, server_default=sa.text('false')),
        sa.Column('attachments', postgresql.JSONB, server_default='[]'),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text("now()")),
    )

    # 4. Create sla_escalations table
    op.create_table(
        'sla_escalations',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column('ticket_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('staff_tickets.id', ondelete='CASCADE'), nullable=False),
        sa.Column('level', sa.Integer, nullable=False),
        sa.Column('escalated_to', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('reason', sa.Text, nullable=False),
        sa.Column('escalated_at', sa.DateTime, nullable=False, server_default=sa.text("now()")),
        sa.Column('acknowledged_at', sa.DateTime, nullable=True),
    )

    # 5. Create indexes
    op.create_index('ix_staff_tickets_assigned', 'staff_tickets', ['assigned_to'])
    op.create_index('ix_staff_tickets_status', 'staff_tickets', ['status'])
    op.create_index('ix_staff_tickets_priority_status', 'staff_tickets', ['priority', 'status'])
    op.create_index('ix_staff_tickets_created', 'staff_tickets', ['created_at'])
    op.create_index('ix_staff_tickets_sla_deadline', 'staff_tickets', ['sla_deadline'])
    op.create_index('ix_ticket_messages_ticket', 'staff_ticket_messages', ['ticket_id'])
    op.create_index('ix_escalations_ticket', 'sla_escalations', ['ticket_id'])


def downgrade() -> None:
    """Remove staff ticket and SLA tables."""
    op.drop_index('ix_escalations_ticket', table_name='sla_escalations')
    op.drop_index('ix_ticket_messages_ticket', table_name='staff_ticket_messages')
    op.drop_index('ix_staff_tickets_sla_deadline', table_name='staff_tickets')
    op.drop_index('ix_staff_tickets_created', table_name='staff_tickets')
    op.drop_index('ix_staff_tickets_priority_status', table_name='staff_tickets')
    op.drop_index('ix_staff_tickets_status', table_name='staff_tickets')
    op.drop_index('ix_staff_tickets_assigned', table_name='staff_tickets')
    op.drop_table('sla_escalations')
    op.drop_table('staff_ticket_messages')
    op.drop_table('staff_tickets')
    op.drop_table('sla_policies')
