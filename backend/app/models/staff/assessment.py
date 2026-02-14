"""
Adaptive Assessment Models

AI-powered adaptive assessments with configurable difficulty ranges and
question routing. AdaptiveAssessment defines the overall assessment
structure and grading strategy. AssessmentQuestion holds individual
questions with difficulty ratings, CBC competency mapping, and optional
AI grading prompts.
"""

import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, DateTime, UUID, Index, Boolean, Integer, Text,
    SmallInteger, ForeignKey,
)
from sqlalchemy.dialects.postgresql import JSONB
from app.database import Base


class AdaptiveAssessment(Base):
    """
    Adaptive assessment definition.

    Configures difficulty range, time limits, AI grading, and rubric for
    an assessment tied to a course or learning area. The adaptive_config
    JSONB stores algorithm parameters (e.g., IRT model settings).
    """

    __tablename__ = "adaptive_assessments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    assessment_type = Column(String(50), nullable=False)

    # Curriculum alignment
    course_id = Column(UUID(as_uuid=True), nullable=True)
    grade_level = Column(String(20), nullable=True)
    learning_area = Column(String(100), nullable=True)
    cbc_tags = Column(JSONB, default=[])

    # Adaptive configuration
    difficulty_range = Column(JSONB, default={"min": 1, "max": 5})
    adaptive_config = Column(JSONB, default={})

    # Assessment settings
    time_limit_minutes = Column(Integer, nullable=True)
    is_ai_graded = Column(Boolean, default=False, nullable=False)
    rubric = Column(JSONB, nullable=True)

    # Status and authorship
    status = Column(String(30), default="draft", nullable=False)
    author_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    total_questions = Column(Integer, default=0, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    __table_args__ = (
        Index("ix_adaptive_assessments_author_id", "author_id"),
        Index("ix_adaptive_assessments_course_id", "course_id"),
    )

    def __repr__(self) -> str:
        return (
            f"<AdaptiveAssessment(title='{self.title}', "
            f"type='{self.assessment_type}', status='{self.status}')>"
        )


class AssessmentQuestion(Base):
    """
    Individual question within an adaptive assessment.

    Each question has a difficulty rating (1-5), point value, optional
    media, and adaptive routing paths that determine the next question
    based on the student's answer correctness.
    """

    __tablename__ = "assessment_questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assessment_id = Column(
        UUID(as_uuid=True),
        ForeignKey("adaptive_assessments.id", ondelete="CASCADE"),
        nullable=False,
    )
    question_text = Column(Text, nullable=False)
    question_type = Column(String(30), nullable=False)
    options = Column(JSONB, nullable=True)
    correct_answer = Column(Text, nullable=True)
    explanation = Column(Text, nullable=True)
    difficulty = Column(SmallInteger, nullable=False)
    points = Column(Integer, default=1, nullable=False)

    # CBC alignment
    cbc_competency = Column(String(255), nullable=True)

    # Media
    media_url = Column(String(500), nullable=True)

    # Ordering and adaptive routing
    order_index = Column(Integer, nullable=False)
    adaptive_paths = Column(JSONB, default=[])

    # AI grading
    ai_grading_prompt = Column(Text, nullable=True)

    # Metadata
    metadata = Column(JSONB, default={})
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("ix_assessment_questions_assessment_id", "assessment_id"),
        Index("ix_assessment_questions_difficulty", "difficulty"),
    )

    def __repr__(self) -> str:
        return (
            f"<AssessmentQuestion(assessment_id={self.assessment_id}, "
            f"type='{self.question_type}', difficulty={self.difficulty})>"
        )
