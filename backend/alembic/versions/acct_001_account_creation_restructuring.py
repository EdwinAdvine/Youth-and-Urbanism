"""account_creation_restructuring

Adds super admin, username, DOB, password enforcement fields to users table.
Creates staff_account_requests, partner_applications, and account_delinking_requests tables.

Revision ID: acct_001
Revises: birdy_001
Create Date: 2026-02-22 22:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'acct_001'
down_revision: Union[str, None] = 'birdy_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # -- Users table: add new columns --
    op.add_column('users', sa.Column('username', sa.String(50), nullable=True))
    op.add_column('users', sa.Column('is_super_admin', sa.Boolean(), nullable=False, server_default=sa.text('false')))
    op.add_column('users', sa.Column('date_of_birth', sa.Date(), nullable=True))
    op.add_column('users', sa.Column('must_change_password', sa.Boolean(), nullable=False, server_default=sa.text('false')))
    op.add_column('users', sa.Column('password_change_deadline', sa.DateTime(timezone=True), nullable=True))

    # Make email nullable (children don't have email, they use username)
    op.alter_column('users', 'email', nullable=True)

    # Create unique index on username (partial — only non-null)
    op.create_index('ix_users_username', 'users', ['username'], unique=True, postgresql_where=sa.text('username IS NOT NULL'))

    # -- Staff account requests table --
    op.create_table(
        'staff_account_requests',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('email', sa.String(255), nullable=False, index=True),
        sa.Column('full_name', sa.String(200), nullable=False),
        sa.Column('phone', sa.String(50), nullable=True),
        sa.Column('department', sa.String(100), nullable=True),
        sa.Column('requested_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True, index=True),
        sa.Column('requested_by_is_super', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('status', sa.String(20), nullable=False, server_default='pending', index=True),
        sa.Column('approved_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('approved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('rejection_reason', sa.Text(), nullable=True),
        sa.Column('invite_token', sa.String(500), nullable=True, unique=True),
        sa.Column('invite_expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
    )

    # -- Partner applications table --
    op.create_table(
        'partner_applications',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True, index=True),
        sa.Column('organization_name', sa.String(300), nullable=False),
        sa.Column('organization_type', sa.String(50), nullable=False),
        sa.Column('contact_person', sa.String(200), nullable=False),
        sa.Column('email', sa.String(255), nullable=False, index=True),
        sa.Column('phone', sa.String(50), nullable=True),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('partnership_goals', sa.Text(), nullable=True),
        sa.Column('website', sa.String(500), nullable=True),
        sa.Column('status', sa.String(20), nullable=False, server_default='pending', index=True),
        sa.Column('invite_token', sa.String(500), nullable=True, unique=True),
        sa.Column('invite_expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('reviewed_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('review_notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
    )

    # -- Account delinking requests table --
    op.create_table(
        'account_delinking_requests',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('student_user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('parent_user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('status', sa.String(20), nullable=False, server_default='pending', index=True),
        sa.Column('requested_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('responded_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('response_note', sa.Text(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table('account_delinking_requests')
    op.drop_table('partner_applications')
    op.drop_table('staff_account_requests')

    op.drop_index('ix_users_username', table_name='users')
    op.alter_column('users', 'email', nullable=False)
    op.drop_column('users', 'password_change_deadline')
    op.drop_column('users', 'must_change_password')
    op.drop_column('users', 'date_of_birth')
    op.drop_column('users', 'is_super_admin')
    op.drop_column('users', 'username')
