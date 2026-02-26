"""
Plan Feature Model

Normalized mapping of features to subscription plans, replacing
reliance on the SubscriptionPlan.features JSONB array. Each record
ties a feature_key to a plan, with an is_enabled flag and optional
config JSONB for numeric limits or metadata.
"""

import uuid
from datetime import datetime

from sqlalchemy import (
    Column, String, Boolean, Integer, DateTime, ForeignKey, Text,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.database import Base


class PlanFeature(Base):
    """A single feature toggle for a subscription plan."""

    __tablename__ = "plan_features"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    plan_id = Column(
        UUID(as_uuid=True),
        ForeignKey("subscription_plans.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Machine-readable key, e.g. "ai_tutor", "live_sessions", "store_access"
    feature_key = Column(String(100), nullable=False, index=True)

    # Human-readable label shown in the admin UI
    feature_name = Column(String(200), nullable=False)

    is_enabled = Column(Boolean, default=True, nullable=False)

    # Optional limits/config, e.g. {"max_sessions": 10, "max_courses": 5}
    config = Column(JSONB, nullable=True)

    # Display ordering inside a plan
    display_order = Column(Integer, default=0, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    plan = relationship("SubscriptionPlan", foreign_keys=[plan_id])
