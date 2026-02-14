"""
Student Community Models - Friends, Study Groups, Shoutouts, Teacher Q&A
"""
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from ..database import Base


class FriendshipStatus(str, enum.Enum):
    """Friendship status enum"""
    PENDING = "pending"
    ACCEPTED = "accepted"
    BLOCKED = "blocked"


class StudentFriendship(Base):
    """Student friendships and friend requests"""
    __tablename__ = "student_friendships"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    friend_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    status = Column(SQLEnum(FriendshipStatus), default=FriendshipStatus.PENDING, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)

    # Relationships
    student = relationship("Student", foreign_keys=[student_id], backref="friendships_initiated")
    friend = relationship("Student", foreign_keys=[friend_id], backref="friendships_received")

    def __repr__(self):
        return f"<StudentFriendship {self.student_id} - {self.friend_id} ({self.status})>"


class StudentStudyGroup(Base):
    """Study groups created by students"""
    __tablename__ = "student_study_groups"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    subject = Column(String(100), nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    max_members = Column(Integer, default=10)
    members = Column(JSONB, default=list)  # Array of student IDs as UUIDs (stored as strings in JSONB)
    is_public = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)

    # Relationships
    creator = relationship("Student", foreign_keys=[created_by], backref="created_study_groups")

    def __repr__(self):
        return f"<StudentStudyGroup {self.name} - {len(self.members or [])} members>"


class ShoutoutCategory(str, enum.Enum):
    """Shoutout category enum"""
    ENCOURAGEMENT = "encouragement"
    HELP = "help"
    ACHIEVEMENT = "achievement"
    THANKS = "thanks"
    OTHER = "other"


class StudentShoutout(Base):
    """Student-to-student shoutouts and encouragement"""
    __tablename__ = "student_shoutouts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    from_student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    to_student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    message = Column(Text, nullable=False)
    category = Column(SQLEnum(ShoutoutCategory), default=ShoutoutCategory.ENCOURAGEMENT, nullable=False)
    is_anonymous = Column(Boolean, default=False)
    is_public = Column(Boolean, default=True)  # Show on class wall

    created_at = Column(DateTime, default=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)

    # Relationships
    from_student = relationship("Student", foreign_keys=[from_student_id], backref="shoutouts_given")
    to_student = relationship("Student", foreign_keys=[to_student_id], backref="shoutouts_received")

    def __repr__(self):
        return f"<StudentShoutout {self.from_student_id} -> {self.to_student_id} ({self.category})>"


class StudentTeacherQA(Base):
    """Student questions to teachers with AI summaries"""
    __tablename__ = "student_teacher_qa"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    question = Column(Text, nullable=False)
    ai_summary = Column(Text, nullable=True)  # AI-generated summary of the question
    answer = Column(Text, nullable=True)

    is_moderated = Column(Boolean, default=False)
    is_answered = Column(Boolean, default=False)
    is_public = Column(Boolean, default=False)  # Can other students see this Q&A

    created_at = Column(DateTime, default=datetime.utcnow)
    answered_at = Column(DateTime, nullable=True)
    is_deleted = Column(Boolean, default=False)

    # Relationships
    student = relationship("Student", backref="teacher_questions")
    teacher = relationship("User", backref="student_questions_answered")

    def __repr__(self):
        return f"<StudentTeacherQA {self.student_id} - {'Answered' if self.is_answered else 'Pending'}>"
