"""
Purchase Approval Models

Supports two modes for child purchase management:
1. Real-time approval: Parent must approve each purchase
2. Spending limit: Auto-approve within configured limits
"""

import enum
import uuid
from datetime import datetime, timedelta
from decimal import Decimal

from sqlalchemy import (
    Column, String, Boolean, DateTime, Text, Numeric,
    ForeignKey, Enum as SQLEnum, UUID, Index,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.database import Base


class PurchaseApprovalMode(str, enum.Enum):
    REALTIME = "realtime"
    SPENDING_LIMIT = "spending_limit"


class ApprovalStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXPIRED = "expired"
    AUTO_APPROVED = "auto_approved"


class PurchaseApprovalSetting(Base):
    """
    Per-child purchase approval configuration set by the parent.

    Parents choose one of:
    - REALTIME: every purchase requires explicit approval
    - SPENDING_LIMIT: purchases within limits auto-approve
    """

    __tablename__ = "purchase_approval_settings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    parent_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    child_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    mode = Column(
        SQLEnum(PurchaseApprovalMode, name="purchase_approval_mode_enum", create_type=False),
        default=PurchaseApprovalMode.REALTIME,
        nullable=False,
    )

    # Spending limits (only used when mode = SPENDING_LIMIT)
    daily_limit = Column(Numeric(10, 2), nullable=True)
    monthly_limit = Column(Numeric(10, 2), nullable=True)
    per_purchase_limit = Column(Numeric(10, 2), nullable=True)

    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    parent = relationship("User", foreign_keys=[parent_id])
    child = relationship("User", foreign_keys=[child_id])

    __table_args__ = (
        Index("ix_purchase_approval_settings_parent_child", "parent_id", "child_id", unique=True),
    )


class PurchaseApprovalRequest(Base):
    """
    A child's pending purchase awaiting parent approval.

    Created when a child attempts a purchase and their approval
    settings require real-time approval or the purchase exceeds limits.
    """

    __tablename__ = "purchase_approval_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    child_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    parent_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # What is being purchased
    purchase_type = Column(String(50), nullable=False)  # course, store_item, subscription
    item_id = Column(UUID(as_uuid=True), nullable=True)
    item_name = Column(String(200), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="KES", nullable=False)

    # Status
    status = Column(
        SQLEnum(ApprovalStatus, name="approval_status_enum", create_type=False),
        default=ApprovalStatus.PENDING,
        nullable=False,
        index=True,
    )
    decision_at = Column(DateTime, nullable=True)
    rejection_reason = Column(Text, nullable=True)

    # Auto-expiry (24h by default)
    expires_at = Column(DateTime, nullable=False)

    extra_data = Column(JSONB, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    child = relationship("User", foreign_keys=[child_id])
    parent = relationship("User", foreign_keys=[parent_id])

    __table_args__ = (
        Index("ix_purchase_approval_requests_status_parent", "status", "parent_id"),
    )

    @classmethod
    def create_with_expiry(cls, **kwargs):
        """Create a request with a 24-hour expiry."""
        kwargs.setdefault("expires_at", datetime.utcnow() + timedelta(hours=24))
        return cls(**kwargs)
