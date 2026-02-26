"""
Student Journey Models

Student risk tracking, family case management, and case notes.
StudentJourney provides AI-driven risk assessment and learning insights
for individual students. FamilyCase groups related students under a
family umbrella for holistic support. CaseNote stores timestamped notes
linked to either a student journey or family case via a polymorphic
(case_type + case_ref_id) pattern.
"""

import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, DateTime, UUID, Index, Boolean, Integer, Text, ForeignKey,
)
from sqlalchemy.dialects.postgresql import JSONB
from app.database import Base


class StudentJourney(Base):
    """
    AI-powered student risk and learning profile.

    Aggregates risk factors, AI-generated insights, learning style
    assessment, strengths, and improvement areas for a single student.
    Updated periodically by background analysis jobs.
    """

    __tablename__ = "student_journeys"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    risk_level = Column(String(20), default="low", nullable=False)
    risk_factors = Column(JSONB, default=[])
    ai_insights = Column(JSONB, default={})
    learning_style = Column(String(50), nullable=True)
    strengths = Column(JSONB, default=[])
    areas_for_improvement = Column(JSONB, default=[])
    last_assessed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    __table_args__ = (
        Index("ix_student_journeys_student_id", "student_id"),
        Index("ix_student_journeys_risk_level", "risk_level"),
    )

    def __repr__(self) -> str:
        return (
            f"<StudentJourney(student_id={self.student_id}, "
            f"risk='{self.risk_level}')>"
        )


class FamilyCase(Base):
    """
    Family-level support case grouping related students.

    Enables holistic tracking of a family's engagement, priority, and
    assigned staff member. Students are stored as JSONB array of user IDs
    for flexible family composition.
    """

    __tablename__ = "family_cases"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    family_name = Column(String(255), nullable=False)
    primary_contact_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    students = Column(JSONB, default=[])
    case_status = Column(String(30), default="active", nullable=False)
    priority = Column(String(20), default="medium", nullable=False)
    notes_count = Column(Integer, default=0, nullable=False)
    assigned_to = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    __table_args__ = (
        Index("ix_family_cases_assigned_to", "assigned_to"),
        Index("ix_family_cases_case_status", "case_status"),
    )

    def __repr__(self) -> str:
        return (
            f"<FamilyCase(family='{self.family_name}', "
            f"status='{self.case_status}', priority='{self.priority}')>"
        )


class CaseNote(Base):
    """
    Timestamped note attached to a student journey or family case.

    Uses a polymorphic pattern with case_type ('student_journey' or
    'family_case') and case_ref_id to reference either a StudentJourney
    or FamilyCase row. Notes can be marked private (staff-only).
    """

    __tablename__ = "case_notes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_type = Column(String(30), nullable=False)  # 'student_journey' | 'family_case'
    case_ref_id = Column(UUID(as_uuid=True), nullable=False)
    author_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    content = Column(Text, nullable=False)
    is_private = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("ix_case_notes_type_ref", "case_type", "case_ref_id"),
    )

    def __repr__(self) -> str:
        return (
            f"<CaseNote(case_type='{self.case_type}', "
            f"case_ref_id={self.case_ref_id}, private={self.is_private})>"
        )
