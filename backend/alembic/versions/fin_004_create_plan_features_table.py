"""Create plan_features table

Revision ID: fin_004
Revises: fin_003
Create Date: 2026-02-22
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB


revision = "fin_004"
down_revision = "fin_003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "plan_features",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "plan_id",
            UUID(as_uuid=True),
            sa.ForeignKey("subscription_plans.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column("feature_key", sa.String(100), nullable=False, index=True),
        sa.Column("feature_name", sa.String(200), nullable=False),
        sa.Column("is_enabled", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("config", JSONB, nullable=True),
        sa.Column("display_order", sa.Integer(), server_default="0", nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )

    # Unique constraint: one feature_key per plan
    op.create_unique_constraint(
        "uq_plan_features_plan_key",
        "plan_features",
        ["plan_id", "feature_key"],
    )


def downgrade() -> None:
    op.drop_table("plan_features")
