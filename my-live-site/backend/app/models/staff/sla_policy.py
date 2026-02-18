"""
SLA Policy Models

Service-level agreement definitions and escalation tracking. SLAPolicy
specifies response and resolution time targets per priority/category,
while SLAEscalation records the escalation chain when tickets breach
their SLA thresholds.
"""

import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, DateTime, UUID, Index, Boolean, Integer, Text, ForeignKey,
)
from sqlalchemy.dialects.postgresql import JSONB
from app.database import Base


class SLAPolicy(Base):
    """
    Service-level agreement definition.

    Sets first-response and resolution time targets (in minutes) for a
    given priority and optional category. The escalation_chain JSONB
    defines the ordered list of escalation levels and their thresholds.
    """

    __tablename__ = "sla_policies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    priority = Column(String(20), nullable=False)
    category = Column(String(50), nullable=True)
    first_response_minutes = Column(Integer, nullable=False)
    resolution_minutes = Column(Integer, nullable=False)
    escalation_chain = Column(JSONB, nullable=False)
    breach_notification = Column(JSONB, default={})
    is_active = Column(Boolean, default=True, nullable=False)
    created_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return (
            f"<SLAPolicy(name='{self.name}', priority='{self.priority}', "
            f"response={self.first_response_minutes}m, "
            f"resolution={self.resolution_minutes}m)>"
        )


class SLAEscalation(Base):
    """
    Record of an SLA escalation event for a ticket.

    Each row represents one escalation level triggered for a ticket,
    including who it was escalated to, the reason, and acknowledgement
    timestamps.
    """

    __tablename__ = "sla_escalations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticket_id = Column(
        UUID(as_uuid=True),
        ForeignKey("staff_tickets.id", ondelete="CASCADE"),
        nullable=False,
    )
    level = Column(Integer, nullable=False)
    escalated_to = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    reason = Column(Text, nullable=False)
    escalated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    acknowledged_at = Column(DateTime, nullable=True)

    __table_args__ = (
        Index("ix_sla_escalations_ticket_id", "ticket_id"),
    )

    def __repr__(self) -> str:
        return (
            f"<SLAEscalation(ticket_id={self.ticket_id}, "
            f"level={self.level})>"
        )
