"""Create purchase approval tables

Revision ID: fin_003
Revises: fin_002
Create Date: 2026-02-22
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB


revision = "fin_003"
down_revision = "fin_002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create enum types
    purchase_approval_mode_enum = sa.Enum(
        "realtime", "spending_limit",
        name="purchase_approval_mode_enum",
    )
    approval_status_enum = sa.Enum(
        "pending", "approved", "rejected", "expired", "auto_approved",
        name="approval_status_enum",
    )

    purchase_approval_mode_enum.create(op.get_bind(), checkfirst=True)
    approval_status_enum.create(op.get_bind(), checkfirst=True)

    # Purchase approval settings
    op.create_table(
        "purchase_approval_settings",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("parent_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("child_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("mode", purchase_approval_mode_enum, server_default="realtime", nullable=False),
        sa.Column("daily_limit", sa.Numeric(10, 2), nullable=True),
        sa.Column("monthly_limit", sa.Numeric(10, 2), nullable=True),
        sa.Column("per_purchase_limit", sa.Numeric(10, 2), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
    )

    op.create_index(
        "ix_purchase_approval_settings_parent_child",
        "purchase_approval_settings",
        ["parent_id", "child_id"],
        unique=True,
    )

    # Purchase approval requests
    op.create_table(
        "purchase_approval_requests",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("child_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("parent_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("purchase_type", sa.String(50), nullable=False),
        sa.Column("item_id", UUID(as_uuid=True), nullable=True),
        sa.Column("item_name", sa.String(200), nullable=False),
        sa.Column("amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("currency", sa.String(3), server_default="KES", nullable=False),
        sa.Column("status", approval_status_enum, server_default="pending", nullable=False, index=True),
        sa.Column("decision_at", sa.DateTime, nullable=True),
        sa.Column("rejection_reason", sa.Text, nullable=True),
        sa.Column("expires_at", sa.DateTime, nullable=False),
        sa.Column("extra_data", JSONB, nullable=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
    )

    op.create_index(
        "ix_purchase_approval_requests_status_parent",
        "purchase_approval_requests",
        ["status", "parent_id"],
    )


def downgrade() -> None:
    op.drop_table("purchase_approval_requests")
    op.drop_table("purchase_approval_settings")
    op.execute("DROP TYPE IF EXISTS approval_status_enum")
    op.execute("DROP TYPE IF EXISTS purchase_approval_mode_enum")
