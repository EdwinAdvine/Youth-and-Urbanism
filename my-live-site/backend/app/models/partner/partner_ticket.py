"""
Partner Ticket Model

Support ticket system for partner-specific queries with AI triage capabilities.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Text, DateTime, UUID, ForeignKey, Enum as SQLEnum, Index
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
import enum

from app.database import Base


class TicketPriority(str, enum.Enum):
    """Priority levels for partner tickets"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class TicketStatus(str, enum.Enum):
    """Lifecycle statuses for partner tickets"""
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    WAITING_ON_PARTNER = "waiting_on_partner"
    RESOLVED = "resolved"
    CLOSED = "closed"


class TicketCategory(str, enum.Enum):
    """Categories for partner tickets"""
    SPONSORSHIP = "sponsorship"
    BILLING = "billing"
    TECHNICAL = "technical"
    CONTENT = "content"
    REPORTING = "reporting"
    CONSENT = "consent"
    GENERAL = "general"


class PartnerTicket(Base):
    """Support tickets submitted by partners with AI triage"""

    __tablename__ = "partner_tickets"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Partner
    partner_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Ticket details
    subject = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(SQLEnum(TicketCategory), default=TicketCategory.GENERAL, nullable=False)
    priority = Column(SQLEnum(TicketPriority), default=TicketPriority.MEDIUM, nullable=False)

    # Status
    status = Column(SQLEnum(TicketStatus), default=TicketStatus.OPEN, nullable=False, index=True)

    # AI triage
    ai_triage_category = Column(String(100), nullable=True)  # AI-suggested category
    ai_triage_priority = Column(String(50), nullable=True)  # AI-suggested priority
    ai_summary = Column(Text, nullable=True)  # AI-generated summary

    # Assignment
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    # Attachments
    attachments = Column(JSONB, nullable=True, default=list)  # [{"name": "...", "url": "...", "type": "..."}]

    # Resolution
    resolution = Column(Text, nullable=True)
    resolved_at = Column(DateTime, nullable=True)

    # Related sponsorship (optional)
    program_id = Column(UUID(as_uuid=True), ForeignKey("sponsorship_programs.id", ondelete="SET NULL"), nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    partner = relationship("User", foreign_keys=[partner_id])
    assignee = relationship("User", foreign_keys=[assigned_to])
    program = relationship("SponsorshipProgram", foreign_keys=[program_id])

    # Indexes
    __table_args__ = (
        Index("ix_partner_tickets_partner_status", "partner_id", "status"),
        Index("ix_partner_tickets_assigned_status", "assigned_to", "status"),
    )
