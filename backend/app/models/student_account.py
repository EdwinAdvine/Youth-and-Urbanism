"""
Student Account and Privacy Models

Models for COPPA-compliant consent tracking and student-controlled teacher
access permissions. These tables ensure the platform meets child data
protection requirements by recording explicit parental consent for each
data-use category and allowing students to control what information their
teachers can see.
"""
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from ..database import Base


class ConsentType(str, enum.Enum):
    """COPPA consent type"""
    PARENTAL_CONSENT = "parental_consent"
    DATA_COLLECTION = "data_collection"
    AI_INTERACTION = "ai_interaction"
    COMMUNITY_FEATURES = "community_features"
    LOCATION_TRACKING = "location_tracking"
    THIRD_PARTY_SHARING = "third_party_sharing"


class StudentConsentRecord(Base):
    """
    A COPPA-compliant parental consent record for a specific data-use category.

    Each row represents a parent's consent decision (granted or denied) for
    one category of data processing (e.g. AI interaction, community features,
    third-party sharing). The IP address and user agent are captured at the
    time of consent for legal audit purposes. Consents can optionally expire.
    """
    __tablename__ = "student_consent_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)

    consent_type = Column(SQLEnum(ConsentType), nullable=False)
    is_granted = Column(Boolean, default=False, nullable=False)

    granted_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)  # Some consents may expire

    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(500), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)

    # Relationships
    student = relationship("Student", backref="consent_records")
    parent = relationship("User", backref="child_consents_granted")

    def __repr__(self):
        return f"<StudentConsentRecord {self.student_id} - {self.consent_type} ({'Granted' if self.is_granted else 'Denied'})>"


class StudentTeacherAccess(Base):
    """
    Fine-grained permissions a student grants to a specific teacher.

    Each row defines what one teacher can see or do for one student:
    view progress, view mood data, view AI chat transcripts, view journal
    entries, send messages, and view community activity. Students can
    toggle individual permissions at any time from their privacy settings.
    """
    __tablename__ = "student_teacher_access"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # Access permissions
    can_view_progress = Column(Boolean, default=True)
    can_view_mood = Column(Boolean, default=True)
    can_view_ai_chats = Column(Boolean, default=False)
    can_view_journal = Column(Boolean, default=False)
    can_message = Column(Boolean, default=True)
    can_view_community_activity = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)

    # Relationships
    student = relationship("Student", backref="teacher_access_controls")
    teacher = relationship("User", backref="student_access_permissions")

    def __repr__(self):
        return f"<StudentTeacherAccess {self.student_id} - {self.teacher_id}>"
