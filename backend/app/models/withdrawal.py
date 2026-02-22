"""
Withdrawal Request Model

Generalized withdrawal system for all roles (instructors, partners, etc.).
Withdrawal requests go through a Super Admin approval workflow before
being processed via Paystack or M-Pesa B2C.
"""

import enum
import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    Column, String, Boolean, DateTime, Date, Text, Numeric, ForeignKey,
    Enum as SQLEnum, UUID, Index,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.database import Base


class WithdrawalMethod(str, enum.Enum):
    MPESA_B2C = "mpesa_b2c"
    BANK_TRANSFER = "bank_transfer"
    PAYPAL = "paypal"


class WithdrawalStatus(str, enum.Enum):
    REQUESTED = "requested"
    APPROVED = "approved"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REJECTED = "rejected"


class WithdrawalRequest(Base):
    """
    A user's request to withdraw funds from their platform wallet.

    Workflow:
    1. User submits request → status = REQUESTED
    2. Super Admin reviews → status = APPROVED or REJECTED
    3. System processes payout → status = PROCESSING
    4. Payout confirmed → status = COMPLETED or FAILED
    """

    __tablename__ = "withdrawal_requests"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Requestor
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Amount and currency
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="KES", nullable=False)

    # Payout method and details
    payout_method = Column(
        SQLEnum(WithdrawalMethod, name="withdrawal_method_enum", create_type=False),
        nullable=False,
    )
    payout_details = Column(
        JSONB,
        nullable=False,
        doc="Method-specific details: {phone} for M-Pesa, {bank_code, account_number, account_name} for bank, {paypal_email} for PayPal",
    )

    # Status tracking
    status = Column(
        SQLEnum(WithdrawalStatus, name="withdrawal_status_enum", create_type=False),
        default=WithdrawalStatus.REQUESTED,
        nullable=False,
        index=True,
    )

    # Approval workflow
    reviewed_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    reviewed_at = Column(DateTime, nullable=True)
    rejection_reason = Column(Text, nullable=True)

    # Processing
    transaction_reference = Column(String(200), nullable=True)
    processed_at = Column(DateTime, nullable=True)
    failure_reason = Column(Text, nullable=True)

    # Metadata
    extra_data = Column(JSONB, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", foreign_keys=[user_id], lazy="selectin")
    reviewer = relationship("User", foreign_keys=[reviewed_by], lazy="selectin")

    # Indexes
    __table_args__ = (
        Index("ix_withdrawal_requests_status_created", "status", "created_at"),
    )

    def __repr__(self) -> str:
        return (
            f"<WithdrawalRequest(id={self.id}, user_id={self.user_id}, "
            f"amount={self.amount}, status={self.status})>"
        )

    def approve(self, reviewer_id: uuid.UUID) -> None:
        """Mark as approved by a super admin."""
        self.status = WithdrawalStatus.APPROVED
        self.reviewed_by = reviewer_id
        self.reviewed_at = datetime.utcnow()

    def reject(self, reviewer_id: uuid.UUID, reason: str) -> None:
        """Mark as rejected with a reason."""
        self.status = WithdrawalStatus.REJECTED
        self.reviewed_by = reviewer_id
        self.reviewed_at = datetime.utcnow()
        self.rejection_reason = reason

    def start_processing(self) -> None:
        """Mark as being processed (payout in progress)."""
        self.status = WithdrawalStatus.PROCESSING

    def mark_completed(self, transaction_ref: str) -> None:
        """Mark as successfully completed."""
        self.status = WithdrawalStatus.COMPLETED
        self.transaction_reference = transaction_ref
        self.processed_at = datetime.utcnow()

    def mark_failed(self, reason: str) -> None:
        """Mark as failed with a reason."""
        self.status = WithdrawalStatus.FAILED
        self.failure_reason = reason
        self.processed_at = datetime.utcnow()
