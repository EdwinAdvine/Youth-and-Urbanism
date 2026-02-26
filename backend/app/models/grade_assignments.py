"""
Grade Assignment Models

Supports the teacher collaboration and class teacher system:
- GradeClassTeacher: one staff member assigned as class teacher per grade per year
- SubjectDepartmentHead: one staff member as subject lead per learning area per year
- TeacherQuestion: student Q&A threads directed to specific teachers
"""

import uuid
import enum
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.database import Base


class GradeClassTeacher(Base):
    """
    Assigns a staff member as class teacher for a specific grade level.

    Each grade can have one active class teacher per academic year.
    Used to populate the teacher dropdown in the student Teacher Collaboration page.
    """
    __tablename__ = "grade_class_teachers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    grade_level = Column(String(20), nullable=False, index=True)  # e.g. "Grade 5"
    staff_user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    academic_year = Column(String(10), nullable=False, default="2026")  # e.g. "2026"
    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    staff_user = relationship("User", foreign_keys=[staff_user_id])

    def __repr__(self):
        return f"<GradeClassTeacher grade={self.grade_level} year={self.academic_year}>"


class SubjectDepartmentHead(Base):
    """
    Assigns a staff member as department head / lead teacher for a subject area.

    Used to populate the teacher dropdown in the student Teacher Collaboration page
    for subjects the student is enrolled in.
    """
    __tablename__ = "subject_department_heads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    learning_area = Column(String(100), nullable=False, index=True)  # e.g. "Mathematics"
    staff_user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    academic_year = Column(String(10), nullable=False, default="2026")
    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    staff_user = relationship("User", foreign_keys=[staff_user_id])

    def __repr__(self):
        return f"<SubjectDepartmentHead area={self.learning_area} year={self.academic_year}>"


class TeacherQuestionStatus(str, enum.Enum):
    pending = "pending"
    answered = "answered"
    closed = "closed"


class TeacherQuestion(Base):
    """
    A question submitted by a student to a specific teacher (class teacher or subject head).

    The AI summarises the question before delivery so teachers see concise context.
    """
    __tablename__ = "teacher_questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    student_id = Column(
        UUID(as_uuid=True),
        ForeignKey("students.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    staff_user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    subject = Column(String(100), nullable=True)          # Subject context (optional)
    question = Column(Text, nullable=False)               # Full student question
    ai_summary = Column(Text, nullable=True)              # AI-generated concise summary
    answer = Column(Text, nullable=True)                  # Teacher's answer
    status = Column(
        String(20),
        default=TeacherQuestionStatus.pending,
        nullable=False,
        index=True,
    )

    # Soft delete
    is_deleted = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    answered_at = Column(DateTime, nullable=True)

    # Relationships
    student = relationship("Student", foreign_keys=[student_id])
    staff_user = relationship("User", foreign_keys=[staff_user_id])

    def __repr__(self):
        return f"<TeacherQuestion id={self.id} status={self.status}>"
