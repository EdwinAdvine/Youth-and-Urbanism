"""Create withdrawal_requests table

Revision ID: fin_002
Revises: fin_001
Create Date: 2026-02-22
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB


revision = "fin_002"
down_revision = "fin_001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create enum types
    withdrawal_method_enum = sa.Enum(
        "mpesa_b2c", "bank_transfer", "paypal",
        name="withdrawal_method_enum",
    )
    withdrawal_status_enum = sa.Enum(
        "requested", "approved", "processing", "completed", "failed", "rejected",
        name="withdrawal_status_enum",
    )

    withdrawal_method_enum.create(op.get_bind(), checkfirst=True)
    withdrawal_status_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "withdrawal_requests",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("currency", sa.String(3), server_default="KES", nullable=False),
        sa.Column("payout_method", withdrawal_method_enum, nullable=False),
        sa.Column("payout_details", JSONB, nullable=False),
        sa.Column("status", withdrawal_status_enum, server_default="requested", nullable=False, index=True),
        sa.Column("reviewed_by", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("reviewed_at", sa.DateTime, nullable=True),
        sa.Column("rejection_reason", sa.Text, nullable=True),
        sa.Column("transaction_reference", sa.String(200), nullable=True),
        sa.Column("processed_at", sa.DateTime, nullable=True),
        sa.Column("failure_reason", sa.Text, nullable=True),
        sa.Column("extra_data", JSONB, nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False, index=True),
        sa.Column("updated_at", sa.DateTime, nullable=False),
    )

    op.create_index(
        "ix_withdrawal_requests_status_created",
        "withdrawal_requests",
        ["status", "created_at"],
    )


def downgrade() -> None:
    op.drop_table("withdrawal_requests")
    op.execute("DROP TYPE IF EXISTS withdrawal_status_enum")
    op.execute("DROP TYPE IF EXISTS withdrawal_method_enum")
