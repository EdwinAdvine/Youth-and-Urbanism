"""
Student Account & Privacy Models - COPPA Consent, Teacher Access
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
    """COPPA-compliant consent records"""
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
    """Student control over teacher access to their data"""
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
