"""
Audit Log Model

Immutable audit trail of all admin actions for compliance and accountability.
Every POST/PUT/PATCH/DELETE to admin endpoints is automatically logged.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, UUID, Index
from sqlalchemy.dialects.postgresql import JSONB
from app.database import Base


class AuditLog(Base):
    """
    Immutable record of a single admin action.

    Every POST, PUT, PATCH, or DELETE request to an admin endpoint creates
    one row here. Stores the actor's identity, the target resource, request
    metadata (IP, user-agent), and a JSONB details blob for before/after diffs.
    Rows are never updated or deleted -- they form a permanent compliance trail.
    """

    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    actor_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    actor_email = Column(String(255), nullable=False)
    actor_role = Column(String(50), nullable=False)

    # Action details
    action = Column(String(100), nullable=False, index=True)
    resource_type = Column(String(100), nullable=False, index=True)
    resource_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    details = Column(JSONB, default={})

    # Request metadata
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    status = Column(String(20), default="success")

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Composite indexes for common query patterns
    __table_args__ = (
        Index('ix_audit_actor_created', 'actor_id', 'created_at'),
        Index('ix_audit_resource', 'resource_type', 'resource_id'),
        Index('ix_audit_action_created', 'action', 'created_at'),
    )

    def __repr__(self) -> str:
        return f"<AuditLog(action='{self.action}', actor='{self.actor_email}', resource='{self.resource_type}')>"
