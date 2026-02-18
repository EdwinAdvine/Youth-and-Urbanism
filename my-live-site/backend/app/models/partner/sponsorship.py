"""
Sponsorship Models

Core models for sponsorship programs, sponsored children tracking,
and parent e-signature consent management.
"""

import uuid
from datetime import datetime

from sqlalchemy import (
    Column, String, Text, Boolean, Integer, DateTime, UUID,
    ForeignKey, Numeric, Date, UniqueConstraint, Index,
    Enum as SQLEnum,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
import enum

from app.database import Base


class ProgramType(str, enum.Enum):
    """Types of sponsorship programs"""
    DIRECT = "direct"
    COHORT = "cohort"


class ProgramStatus(str, enum.Enum):
    """Lifecycle statuses for sponsorship programs"""
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class SponsoredChildStatus(str, enum.Enum):
    """Status of a sponsored child within a program"""
    PENDING_CONSENT = "pending_consent"
    ACTIVE = "active"
    PAUSED = "paused"
    GRADUATED = "graduated"
    REMOVED = "removed"


class BillingPeriod(str, enum.Enum):
    """Billing periods for sponsorship subscriptions"""
    MONTHLY = "monthly"
    TERMLY = "termly"
    ANNUAL = "annual"


class SponsorshipProgram(Base):
    """Sponsorship program/cohort container linking partners to groups of students"""

    __tablename__ = "sponsorship_programs"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Partner relationship
    partner_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Program details
    name = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    program_type = Column(SQLEnum(ProgramType), nullable=False, default=ProgramType.COHORT)

    # Child constraints
    min_children = Column(Integer, default=10, nullable=False)
    max_children = Column(Integer, nullable=True)

    # Status
    status = Column(SQLEnum(ProgramStatus), default=ProgramStatus.DRAFT, nullable=False, index=True)

    # Billing configuration
    billing_period = Column(SQLEnum(BillingPeriod), nullable=True)
    price_per_child = Column(Numeric(12, 2), nullable=True)
    currency = Column(String(3), default="KES", nullable=False)
    custom_pricing_notes = Column(Text, nullable=True)

    # Duration
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)  # Nullable for open-ended

    # Goals and configuration
    goals = Column(JSONB, nullable=True, default=list)  # [{"goal": "...", "target": "...", "metric": "..."}]
    target_grade_levels = Column(JSONB, nullable=True, default=list)  # ["Grade 1", "Grade 2"]
    target_regions = Column(JSONB, nullable=True, default=list)  # ["Nairobi", "Mombasa"]

    # Approval tracking
    approved_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    rejection_reason = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    partner = relationship("User", foreign_keys=[partner_id])
    approver = relationship("User", foreign_keys=[approved_by])
    partner_profile = relationship("PartnerProfile", primaryjoin="SponsorshipProgram.partner_id == PartnerProfile.user_id", foreign_keys=[partner_id], viewonly=True)
    sponsored_children = relationship("SponsoredChild", back_populates="program", cascade="all, delete-orphan")
    subscriptions = relationship("PartnerSubscription", back_populates="program", cascade="all, delete-orphan")

    # Indexes
    __table_args__ = (
        Index("ix_sponsorship_programs_partner_status", "partner_id", "status"),
    )


class SponsoredChild(Base):
    """Link between a sponsorship program and an individual student"""

    __tablename__ = "sponsored_children"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Relationships
    program_id = Column(UUID(as_uuid=True), ForeignKey("sponsorship_programs.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    partner_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Status
    status = Column(SQLEnum(SponsoredChildStatus), default=SponsoredChildStatus.PENDING_CONSENT, nullable=False, index=True)

    # Dates
    enrolled_at = Column(DateTime, nullable=True)
    removed_at = Column(DateTime, nullable=True)

    # Partner-set goals for this child
    partner_goals = Column(JSONB, nullable=True, default=list)  # [{"goal": "...", "target_date": "...", "progress": 0}]
    ai_milestones = Column(JSONB, nullable=True, default=list)  # AI-suggested milestones
    notes = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    program = relationship("SponsorshipProgram", back_populates="sponsored_children")
    student = relationship("Student", foreign_keys=[student_id])
    partner = relationship("User", foreign_keys=[partner_id])
    consent = relationship("SponsorshipConsent", back_populates="sponsored_child", uselist=False, cascade="all, delete-orphan")

    # Constraints
    __table_args__ = (
        UniqueConstraint("program_id", "student_id", name="uq_program_student"),
        Index("ix_sponsored_children_partner_status", "partner_id", "status"),
    )


class SponsorshipConsent(Base):
    """Parent e-signature consent for sharing child data with a sponsoring partner"""

    __tablename__ = "sponsorship_consents"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # References
    sponsored_child_id = Column(UUID(as_uuid=True), ForeignKey("sponsored_children.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Consent details
    consent_given = Column(Boolean, default=False, nullable=False)
    consent_text = Column(Text, nullable=False)  # The text the parent agreed to

    # Audit trail
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)

    # Timestamps
    consented_at = Column(DateTime, nullable=True)
    revoked_at = Column(DateTime, nullable=True)
    revocation_reason = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    sponsored_child = relationship("SponsoredChild", back_populates="consent")
    parent = relationship("User", foreign_keys=[parent_id])
