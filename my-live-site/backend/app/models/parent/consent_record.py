"""
ConsentRecord Model

Granular consent matrix for parent data sharing control.
Per-child, per-data-type, per-recipient consent tracking with GDPR/DPA compliance.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, UUID, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


class ConsentRecord(Base):
    """
    ConsentRecord model for granular parental consent tracking.

    Enables fine-grained control over what data is collected and shared
    about each child, for compliance with privacy regulations (GDPR/DPA).

    Examples:
    - data_type: 'learning_analytics', 'ai_conversations', 'assessment_scores', 'behavioral', 'health'
    - recipient_type: 'platform', 'instructors', 'ai_system', 'third_party', 'research'
    """

    __tablename__ = "parent_consent_records"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Foreign keys
    parent_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    child_id = Column(UUID(as_uuid=True), ForeignKey('students.id', ondelete='CASCADE'), nullable=False, index=True)

    # Consent dimensions
    data_type = Column(String(100), nullable=False, index=True)  # What data
    recipient_type = Column(String(100), nullable=False, index=True)  # Who receives it

    # Consent status
    consent_given = Column(Boolean, nullable=False, index=True)
    granted_at = Column(DateTime, nullable=True)
    revoked_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)  # Optional expiration for time-limited consent
    reason = Column(Text, nullable=True)  # Reason for revocation or special notes

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    parent = relationship("User", foreign_keys=[parent_id], backref="parent_consent_records")
    child = relationship("Student", foreign_keys=[child_id], backref="parent_consent_records")

    def __repr__(self):
        status = "granted" if self.consent_given else "revoked"
        return f"<ConsentRecord(id={self.id}, child={self.child_id}, {self.data_type} → {self.recipient_type}: {status})>"
