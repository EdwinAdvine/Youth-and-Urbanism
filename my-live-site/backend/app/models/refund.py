"""
Refund Models for Payment Refund System - Urban Home School

This module implements a comprehensive refund management system with admin approval workflow:

Models:
- Refund: Refund request tracking with approval workflow and gateway processing

Features:
- Admin approval workflow (pending -> approved/rejected -> processed)
- Full and partial refund support
- Refund policy enforcement (7-day full, 14-day partial)
- Multi-gateway refund processing (M-Pesa B2C, PayPal, Stripe)
- Automatic enrollment status updates
- Refund eligibility checking based on course completion
- Audit trail with timestamps
"""

import uuid
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional

from sqlalchemy import (
    Column,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    Numeric,
    Index,
    Enum as SQLEnum,
    Text,
    CheckConstraint,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import relationship
import enum

from app.database import Base


class RefundStatus(str, enum.Enum):
    """Refund request status lifecycle"""
    PENDING = "pending"  # Awaiting admin review
    APPROVED = "approved"  # Approved by admin, awaiting processing
    REJECTED = "rejected"  # Rejected by admin
    PROCESSING = "processing"  # Being processed by gateway
    COMPLETED = "completed"  # Successfully refunded
    FAILED = "failed"  # Gateway processing failed


class RefundType(str, enum.Enum):
    """Type of refund"""
    FULL = "full"  # Full payment refund
    PARTIAL = "partial"  # Partial payment refund
    PRORATED = "prorated"  # Prorated refund based on usage


class RefundReason(str, enum.Enum):
    """Common refund reasons"""
    ACCIDENTAL_PURCHASE = "accidental_purchase"
    COURSE_NOT_AS_DESCRIBED = "course_not_as_described"
    TECHNICAL_ISSUES = "technical_issues"
    POOR_QUALITY = "poor_quality"
    DUPLICATE_PAYMENT = "duplicate_payment"
    DID_NOT_USE = "did_not_use"
    FINANCIAL_HARDSHIP = "financial_hardship"
    OTHER = "other"


class Refund(AsyncAttrs, Base):
    """
    Refund request and processing tracking.

    Manages the complete refund lifecycle from user request through
    admin approval to gateway processing.

    Refund Policy (configurable in metadata):
        - Full refund: Within 7 days AND less than 10% course completion
        - Partial refund (50%): Within 14 days AND less than 30% completion
        - No refund: After 14 days OR more than 30% completion

    Workflow:
        1. User/Admin creates refund request -> PENDING
        2. Admin reviews -> APPROVED or REJECTED
        3. If approved, system processes -> PROCESSING
        4. Gateway confirms -> COMPLETED or FAILED

    Attributes:
        id: Unique refund identifier (UUID)
        transaction_id: Foreign key to original payment transaction
        enrollment_id: Foreign key to enrollment (if course refund)
        subscription_id: Foreign key to subscription (if subscription refund)
        user_id: User requesting refund (denormalized for queries)
        refund_type: Type of refund (full, partial, prorated)
        refund_reason: Reason category for refund
        refund_amount: Amount to refund (may differ from original payment)
        original_amount: Original payment amount
        currency: ISO 4217 currency code
        status: Current refund status
        requested_by: User who requested refund (user or admin)
        approved_by: Admin who approved/rejected
        processed_by: Admin who processed refund
        gateway: Payment gateway to process refund (mpesa, paypal, stripe)
        gateway_refund_id: Refund ID from payment gateway
        user_reason: Detailed reason provided by user
        admin_notes: Internal notes from admin
        rejection_reason: Reason for rejection (if rejected)
        eligibility_check: JSONB with eligibility criteria results
        metadata: Additional refund data
        requested_at: When refund was requested
        reviewed_at: When admin reviewed request
        processed_at: When refund was processed
        completed_at: When refund completed successfully
        created_at: Record creation timestamp
        updated_at: Last update timestamp
    """

    __tablename__ = "refunds"

    # Primary key
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
        doc="Unique refund identifier",
    )

    # Foreign keys
    transaction_id = Column(
        UUID(as_uuid=True),
        ForeignKey("transactions.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        doc="Original payment transaction",
    )

    enrollment_id = Column(
        UUID(as_uuid=True),
        ForeignKey("enrollments.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        doc="Related enrollment for course refunds",
    )

    subscription_id = Column(
        UUID(as_uuid=True),
        ForeignKey("subscriptions.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        doc="Related subscription for subscription refunds",
    )

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        doc="User requesting refund (denormalized)",
    )

    # Refund details
    refund_type = Column(
        SQLEnum(RefundType),
        nullable=False,
        doc="Type of refund (full, partial, prorated)",
    )

    refund_reason = Column(
        SQLEnum(RefundReason),
        nullable=False,
        index=True,
        doc="Reason category for refund",
    )

    refund_amount = Column(
        Numeric(10, 2),
        nullable=False,
        doc="Amount to refund (may differ from original)",
    )

    original_amount = Column(
        Numeric(10, 2),
        nullable=False,
        doc="Original payment amount",
    )

    currency = Column(
        String(3),
        default="KES",
        nullable=False,
        doc="ISO 4217 currency code",
    )

    # Status and workflow
    status = Column(
        SQLEnum(RefundStatus),
        default=RefundStatus.PENDING,
        nullable=False,
        index=True,
        doc="Current refund status",
    )

    requested_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        doc="User who requested refund (user or admin)",
    )

    approved_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        doc="Admin who approved/rejected",
    )

    processed_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        doc="Admin who processed refund",
    )

    # Gateway information
    gateway = Column(
        SQLEnum("mpesa", "paypal", "stripe", name="refund_gateway_enum"),
        nullable=False,
        doc="Payment gateway for refund",
    )

    gateway_refund_id = Column(
        String(255),
        nullable=True,
        index=True,
        doc="Refund ID from payment gateway",
    )

    # Detailed information
    user_reason = Column(
        Text,
        nullable=False,
        doc="Detailed reason provided by user",
    )

    admin_notes = Column(
        Text,
        nullable=True,
        doc="Internal notes from admin",
    )

    rejection_reason = Column(
        Text,
        nullable=True,
        doc="Reason for rejection if rejected",
    )

    # Eligibility tracking
    eligibility_check = Column(
        JSONB,
        default=dict,
        nullable=False,
        doc="Eligibility criteria check results",
    )

    # Additional metadata
    meta = Column(
        JSONB,
        default=dict,
        nullable=False,
        doc="Additional refund data (policy, calculations, etc.)",
    )

    # Timestamps
    requested_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
        doc="When refund was requested",
    )

    reviewed_at = Column(
        DateTime,
        nullable=True,
        doc="When admin reviewed request",
    )

    processed_at = Column(
        DateTime,
        nullable=True,
        doc="When refund processing started",
    )

    completed_at = Column(
        DateTime,
        nullable=True,
        index=True,
        doc="When refund completed successfully",
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        doc="Record creation timestamp",
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
        doc="Last update timestamp",
    )

    # Relationships
    transaction = relationship("Transaction")
    enrollment = relationship("Enrollment")
    subscription = relationship("Subscription")
    user = relationship("User", foreign_keys=[user_id])

    # Constraints
    __table_args__ = (
        Index("idx_refunds_user_status", "user_id", "status"),
        Index("idx_refunds_transaction", "transaction_id"),
        Index("idx_refunds_status_requested", "status", "requested_at"),
        Index("idx_refunds_gateway_status", "gateway", "status"),
        CheckConstraint(
            "refund_amount > 0",
            name="check_refund_amount_positive"
        ),
        CheckConstraint(
            "refund_amount <= original_amount",
            name="check_refund_not_exceed_original"
        ),
    )

    def __repr__(self) -> str:
        """String representation for debugging."""
        return (
            f"<Refund(id={self.id}, transaction_id={self.transaction_id}, "
            f"amount={self.refund_amount} {self.currency}, "
            f"status={self.status}, type={self.refund_type})>"
        )

    # Status properties
    @property
    def is_pending(self) -> bool:
        """Check if refund is awaiting review."""
        return self.status == RefundStatus.PENDING

    @property
    def is_approved(self) -> bool:
        """Check if refund was approved."""
        return self.status == RefundStatus.APPROVED

    @property
    def is_rejected(self) -> bool:
        """Check if refund was rejected."""
        return self.status == RefundStatus.REJECTED

    @property
    def is_completed(self) -> bool:
        """Check if refund was successfully completed."""
        return self.status == RefundStatus.COMPLETED

    @property
    def is_failed(self) -> bool:
        """Check if refund processing failed."""
        return self.status == RefundStatus.FAILED

    @property
    def needs_review(self) -> bool:
        """Check if refund needs admin review."""
        return self.status == RefundStatus.PENDING

    @property
    def can_be_processed(self) -> bool:
        """Check if refund can be processed."""
        return self.status == RefundStatus.APPROVED

    # Type properties
    @property
    def is_full_refund(self) -> bool:
        """Check if this is a full refund."""
        return self.refund_type == RefundType.FULL

    @property
    def is_partial_refund(self) -> bool:
        """Check if this is a partial refund."""
        return self.refund_type == RefundType.PARTIAL

    @property
    def refund_percentage(self) -> Decimal:
        """
        Calculate refund percentage of original amount.

        Returns:
            Decimal: Percentage of original amount being refunded
        """
        if self.original_amount <= 0:
            return Decimal("0")
        return (self.refund_amount / self.original_amount) * Decimal("100")

    # Workflow methods
    def approve(
        self,
        admin_id: uuid.UUID,
        notes: Optional[str] = None
    ) -> None:
        """
        Approve refund request.

        Args:
            admin_id: UUID of admin approving the refund
            notes: Optional admin notes
        """
        self.status = RefundStatus.APPROVED
        self.approved_by = admin_id
        self.reviewed_at = datetime.utcnow()

        if notes:
            self.admin_notes = notes

        if self.metadata is None:
            self.metadata = {}
        self.metadata["approved_at"] = datetime.utcnow().isoformat()
        self.metadata["approved_by"] = str(admin_id)

        self.updated_at = datetime.utcnow()

    def reject(
        self,
        admin_id: uuid.UUID,
        reason: str,
        notes: Optional[str] = None
    ) -> None:
        """
        Reject refund request.

        Args:
            admin_id: UUID of admin rejecting the refund
            reason: Reason for rejection
            notes: Optional additional admin notes
        """
        self.status = RefundStatus.REJECTED
        self.approved_by = admin_id
        self.reviewed_at = datetime.utcnow()
        self.rejection_reason = reason

        if notes:
            self.admin_notes = notes

        if self.metadata is None:
            self.metadata = {}
        self.metadata["rejected_at"] = datetime.utcnow().isoformat()
        self.metadata["rejected_by"] = str(admin_id)

        self.updated_at = datetime.utcnow()

    def start_processing(
        self,
        admin_id: Optional[uuid.UUID] = None
    ) -> None:
        """
        Mark refund as being processed.

        Args:
            admin_id: Optional UUID of admin processing the refund
        """
        self.status = RefundStatus.PROCESSING
        self.processed_at = datetime.utcnow()

        if admin_id:
            self.processed_by = admin_id

        if self.metadata is None:
            self.metadata = {}
        self.metadata["processing_started"] = datetime.utcnow().isoformat()

        self.updated_at = datetime.utcnow()

    def mark_completed(
        self,
        gateway_refund_id: Optional[str] = None
    ) -> None:
        """
        Mark refund as successfully completed.

        Args:
            gateway_refund_id: Refund ID from payment gateway
        """
        self.status = RefundStatus.COMPLETED
        self.completed_at = datetime.utcnow()

        if gateway_refund_id:
            self.gateway_refund_id = gateway_refund_id

        if self.metadata is None:
            self.metadata = {}
        self.metadata["completed_at"] = datetime.utcnow().isoformat()

        self.updated_at = datetime.utcnow()

    def mark_failed(
        self,
        error_message: str
    ) -> None:
        """
        Mark refund as failed.

        Args:
            error_message: Error message from gateway
        """
        self.status = RefundStatus.FAILED

        if self.metadata is None:
            self.metadata = {}
        self.metadata["failed_at"] = datetime.utcnow().isoformat()
        self.metadata["error_message"] = error_message

        self.updated_at = datetime.utcnow()

    def calculate_refund_amount(
        self,
        payment_amount: Decimal,
        days_since_payment: int,
        completion_percentage: float
    ) -> tuple[Decimal, RefundType]:
        """
        Calculate refund amount based on policy.

        Refund Policy:
            - Full refund (100%): <= 7 days AND < 10% completion
            - Partial refund (50%): <= 14 days AND < 30% completion
            - No refund: > 14 days OR >= 30% completion

        Args:
            payment_amount: Original payment amount
            days_since_payment: Days since payment was made
            completion_percentage: Course completion percentage (0-100)

        Returns:
            tuple: (refund_amount, refund_type)
        """
        # Full refund criteria
        if days_since_payment <= 7 and completion_percentage < 10:
            return payment_amount, RefundType.FULL

        # Partial refund criteria
        elif days_since_payment <= 14 and completion_percentage < 30:
            partial_amount = payment_amount * Decimal("0.50")
            return partial_amount, RefundType.PARTIAL

        # No refund
        else:
            return Decimal("0"), RefundType.PARTIAL

    @staticmethod
    def check_eligibility(
        payment_date: datetime,
        completion_percentage: float,
        current_date: Optional[datetime] = None
    ) -> dict:
        """
        Check refund eligibility based on policy.

        Args:
            payment_date: When payment was made
            completion_percentage: Course completion percentage (0-100)
            current_date: Current date (defaults to now)

        Returns:
            dict: Eligibility check results
        """
        if current_date is None:
            current_date = datetime.utcnow()

        days_since_payment = (current_date - payment_date).days

        # Check eligibility
        full_refund_eligible = (
            days_since_payment <= 7 and completion_percentage < 10
        )
        partial_refund_eligible = (
            days_since_payment <= 14 and completion_percentage < 30
        )

        eligible = full_refund_eligible or partial_refund_eligible

        return {
            "eligible": eligible,
            "full_refund_eligible": full_refund_eligible,
            "partial_refund_eligible": partial_refund_eligible,
            "days_since_payment": days_since_payment,
            "completion_percentage": completion_percentage,
            "policy_window_days": 14,
            "max_completion_for_refund": 30,
            "checked_at": current_date.isoformat(),
        }
