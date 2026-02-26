"""Add wallet tracking fields and universal wallet creation

Revision ID: fin_001
Revises: acct_001
Create Date: 2026-02-22

Adds total_credited, total_debited, total_withdrawn, and is_withdrawal_blocked
columns to the wallets table. Also backfills wallets for users who don't have one.
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers
revision = "fin_001"
down_revision = "acct_001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add tracking columns to wallets table
    op.add_column(
        "wallets",
        sa.Column(
            "total_credited",
            sa.Numeric(12, 2),
            server_default="0.00",
            nullable=False,
        ),
    )
    op.add_column(
        "wallets",
        sa.Column(
            "total_debited",
            sa.Numeric(12, 2),
            server_default="0.00",
            nullable=False,
        ),
    )
    op.add_column(
        "wallets",
        sa.Column(
            "total_withdrawn",
            sa.Numeric(12, 2),
            server_default="0.00",
            nullable=False,
        ),
    )
    op.add_column(
        "wallets",
        sa.Column(
            "is_withdrawal_blocked",
            sa.Boolean(),
            server_default="false",
            nullable=False,
        ),
    )

    # Backfill: create wallets for all users who don't have one
    op.execute(
        """
        INSERT INTO wallets (id, user_id, balance, currency, total_credited, total_debited, total_withdrawn, is_withdrawal_blocked, created_at, updated_at)
        SELECT
            gen_random_uuid(),
            u.id,
            0.00,
            'KES',
            0.00,
            0.00,
            0.00,
            CASE WHEN u.role = 'student' THEN true ELSE false END,
            NOW(),
            NOW()
        FROM users u
        LEFT JOIN wallets w ON w.user_id = u.id
        WHERE w.id IS NULL AND u.is_deleted = false
        """
    )


def downgrade() -> None:
    op.drop_column("wallets", "is_withdrawal_blocked")
    op.drop_column("wallets", "total_withdrawn")
    op.drop_column("wallets", "total_debited")
    op.drop_column("wallets", "total_credited")
