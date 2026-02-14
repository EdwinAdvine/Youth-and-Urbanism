"""
Staff Ticket Models

Support ticket system for staff-managed issue tracking. StaffTicket stores
the full lifecycle of a support request (creation, assignment, escalation,
SLA tracking, resolution, and CSAT scoring). StaffTicketMessage holds the
threaded conversation within each ticket.
"""

import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, DateTime, UUID, Index, Boolean, Integer, Text, ForeignKey,
)
from sqlalchemy.dialects.postgresql import JSONB
from app.database import Base


class StaffTicket(Base):
    """
    Support ticket with full lifecycle tracking.

    Tracks priority, status, SLA compliance, assignment chain, resolution
    details, and customer-satisfaction scoring. Composite indexes support
    the most common dashboard filters.
    """

    __tablename__ = "staff_tickets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticket_number = Column(String(20), unique=True, nullable=False)
    subject = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False)
    priority = Column(String(20), default="medium", nullable=False)
    status = Column(String(20), default="open", nullable=False)

    # People
    reporter_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    assigned_to = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    escalated_to = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    # SLA tracking
    sla_policy_id = Column(
        UUID(as_uuid=True),
        ForeignKey("sla_policies.id", ondelete="SET NULL"),
        nullable=True,
    )
    sla_deadline = Column(DateTime, nullable=True)
    sla_breached = Column(Boolean, default=False, nullable=False)

    # Resolution
    resolution = Column(Text, nullable=True)
    csat_score = Column(Integer, nullable=True)

    # Flexible data
    tags = Column(JSONB, default=[])
    metadata = Column(JSONB, default={})

    # Timestamps
    first_response_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    closed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    __table_args__ = (
        Index("ix_staff_tickets_priority_status", "priority", "status"),
        Index("ix_staff_tickets_assigned_to", "assigned_to"),
        Index("ix_staff_tickets_status", "status"),
        Index("ix_staff_tickets_created_at", "created_at"),
        Index(
            "ix_staff_tickets_sla_deadline_active",
            "sla_deadline",
            postgresql_where=(sla_breached == False),  # noqa: E712
        ),
    )

    def __repr__(self) -> str:
        return (
            f"<StaffTicket(number='{self.ticket_number}', "
            f"status='{self.status}', priority='{self.priority}')>"
        )


class StaffTicketMessage(Base):
    """
    Individual message within a ticket conversation thread.

    Supports both public replies and internal (staff-only) notes.
    Attachments are stored as JSONB references to external file storage.
    """

    __tablename__ = "staff_ticket_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticket_id = Column(
        UUID(as_uuid=True),
        ForeignKey("staff_tickets.id", ondelete="CASCADE"),
        nullable=False,
    )
    author_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    content = Column(Text, nullable=False)
    is_internal = Column(Boolean, default=False, nullable=False)
    attachments = Column(JSONB, default=[])
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("ix_staff_ticket_messages_ticket_id", "ticket_id"),
    )

    def __repr__(self) -> str:
        return (
            f"<StaffTicketMessage(ticket_id={self.ticket_id}, "
            f"internal={self.is_internal})>"
        )
