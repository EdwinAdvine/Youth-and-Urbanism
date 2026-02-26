"""
Instructor Earnings Models

Models for tracking instructor earnings, payouts, and configurable revenue splits.
"""

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import Column, String, Text, DateTime, UUID, ForeignKey, Numeric, Enum as SQLEnum, Date
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
import enum

from app.database import Base


class EarningType(str, enum.Enum):
    """Types of instructor earnings"""
    COURSE_SALE = "course_sale"
    SESSION_FEE = "session_fee"
    BONUS = "bonus"
    REFERRAL = "referral"


class EarningStatus(str, enum.Enum):
    """Status of an earning record"""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PAID = "paid"
    REVERSED = "reversed"


class PayoutMethod(str, enum.Enum):
    """Payout methods for instructor withdrawals"""
    MPESA_B2C = "mpesa_b2c"
    BANK_TRANSFER = "bank_transfer"
    PAYPAL = "paypal"


class PayoutStatus(str, enum.Enum):
    """Status of payout requests"""
    REQUESTED = "requested"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REVERSED = "reversed"


class InstructorEarning(Base):
    """
    A single earning event for an instructor.

    Records the gross amount, platform and partner fee percentages, and
    the resulting net amount the instructor receives. Earning types include
    course sales, session fees, bonuses, and referrals. Status transitions
    through pending -> confirmed -> paid/reversed. Linked to the source
    course or session for traceability.
    """

    __tablename__ = "instructor_earnings"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Instructor
    instructor_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Source (course or session)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="SET NULL"), nullable=True, index=True)
    session_id = Column(UUID(as_uuid=True), nullable=True, index=True)  # FK to live_sessions

    # Earning details
    earning_type = Column(SQLEnum(EarningType), nullable=False)
    gross_amount = Column(Numeric(10, 2), nullable=False)
    platform_fee_pct = Column(Numeric(5, 2), nullable=False)  # Percentage (e.g., 30.00)
    partner_fee_pct = Column(Numeric(5, 2), nullable=False)   # Percentage (e.g., 10.00)
    net_amount = Column(Numeric(10, 2), nullable=False)       # Amount instructor receives
    currency = Column(String(3), default="KES", nullable=False)

    # Status
    status = Column(SQLEnum(EarningStatus), default=EarningStatus.PENDING, nullable=False, index=True)

    # Period
    period_start = Column(Date, nullable=True)
    period_end = Column(Date, nullable=True)

    # Additional context
    extra_data = Column(JSONB, nullable=True)  # Additional context (enrollment_id, transaction_id, etc.)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    instructor = relationship("User", foreign_keys=[instructor_id])
    course = relationship("Course", foreign_keys=[course_id])


class InstructorPayout(Base):
    """Payout/withdrawal requests from instructors"""

    __tablename__ = "instructor_payouts"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Instructor
    instructor_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Amount
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="KES", nullable=False)

    # Payout method and details
    payout_method = Column(SQLEnum(PayoutMethod), nullable=False)
    payout_details = Column(JSONB, nullable=False)  # {"phone": "254...", "bank_account": "...", "paypal_email": "..."}

    # Status
    status = Column(SQLEnum(PayoutStatus), default=PayoutStatus.REQUESTED, nullable=False, index=True)
    transaction_reference = Column(String(200), nullable=True)
    processed_at = Column(DateTime, nullable=True)
    failure_reason = Column(Text, nullable=True)

    # Additional data
    extra_data = Column(JSONB, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    instructor = relationship("User", foreign_keys=[instructor_id])


class InstructorRevenueSplit(Base):
    """Configurable revenue split per instructor or per course"""

    __tablename__ = "instructor_revenue_splits"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Instructor (and optionally specific course)
    instructor_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), nullable=True, index=True)

    # Revenue split percentages
    instructor_pct = Column(Numeric(5, 2), default=Decimal("60.00"), nullable=False)
    platform_pct = Column(Numeric(5, 2), default=Decimal("30.00"), nullable=False)
    partner_pct = Column(Numeric(5, 2), default=Decimal("10.00"), nullable=False)

    # Set by (admin who configured this split)
    set_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Effective period
    effective_from = Column(Date, nullable=True)
    effective_until = Column(Date, nullable=True)

    # Notes
    notes = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    instructor = relationship("User", foreign_keys=[instructor_id])
    course = relationship("Course", foreign_keys=[course_id])
    admin = relationship("User", foreign_keys=[set_by])
