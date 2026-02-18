"""
ConsentAuditLog Model

Audit trail for all consent changes.
Records every grant, revocation, and update for compliance and transparency.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, UUID, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


class ConsentAuditLog(Base):
    """
    ConsentAuditLog model for tracking all consent changes.

    Every change to a consent record is logged with:
    - What changed (old/new values)
    - Who made the change
    - When it happened
    - From where (IP, user agent)

    This provides a complete audit trail for regulatory compliance.
    """

    __tablename__ = "parent_consent_audit_log"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Foreign keys
    consent_record_id = Column(UUID(as_uuid=True), ForeignKey('parent_consent_records.id', ondelete='CASCADE'), nullable=False, index=True)
    performed_by = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='SET NULL'), nullable=False)

    # Action details
    action = Column(String(20), nullable=False)  # 'granted', 'revoked', 'updated', 'expired'
    old_value = Column(Boolean, nullable=True)  # Previous consent status
    new_value = Column(Boolean, nullable=False)  # New consent status

    # Audit metadata
    ip_address = Column(String(45), nullable=True)  # IPv4 or IPv6
    user_agent = Column(Text, nullable=True)  # Browser/device information

    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    consent_record = relationship("ConsentRecord", foreign_keys=[consent_record_id], backref="audit_logs")
    performer = relationship("User", foreign_keys=[performed_by])

    def __repr__(self):
        return f"<ConsentAuditLog(id={self.id}, action={self.action}, {self.old_value} → {self.new_value}, at={self.created_at})>"
