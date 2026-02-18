"""
Instructor AI Insight Models

Models for AI-generated daily insights and CBC alignment analysis.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Text, DateTime, UUID, ForeignKey, Numeric, Date
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.database import Base


class InstructorDailyInsight(Base):
    """AI-generated daily insights for instructors (batch-generated nightly)"""

    __tablename__ = "instructor_daily_insights"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Instructor
    instructor_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Date
    insight_date = Column(Date, nullable=False, index=True)

    # Insights (array of insight objects)
    insights = Column(JSONB, nullable=False)
    # Format: [
    #   {
    #     "priority": "high",
    #     "category": "submissions",
    #     "title": "3 assignments need grading",
    #     "description": "Students are waiting for feedback...",
    #     "action_url": "/dashboard/instructor/submissions",
    #     "ai_rationale": "These have been pending for >48h..."
    #   },
    #   ...
    # ]

    # Generation metadata
    generated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    ai_model_used = Column(String(100), nullable=True)  # "gemini-pro", "claude-3-5-sonnet", etc.
    extra_data = Column(JSONB, nullable=True)  # Additional AI response metadata

    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    instructor = relationship("User", foreign_keys=[instructor_id])


class InstructorCBCAnalysis(Base):
    """AI-powered CBC (Competency-Based Curriculum) alignment analysis for courses"""

    __tablename__ = "instructor_cbc_analyses"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Course and instructor
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    instructor_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Analysis results
    alignment_score = Column(Numeric(5, 2), nullable=False)  # 0-100 score
    competencies_covered = Column(JSONB, nullable=False, default=list)
    # Format: [{"strand": "Numbers", "sub_strand": "Whole numbers", "competency": "...", "lesson_references": [...]}]

    competencies_missing = Column(JSONB, nullable=False, default=list)
    # Format: [{"strand": "Measurement", "sub_strand": "Length", "competency": "...", "importance": "high"}]

    suggestions = Column(JSONB, nullable=False, default=list)
    # Format: [{"type": "add_content", "competency": "...", "rationale": "...", "priority": "medium"}]

    # AI metadata
    ai_model_used = Column(String(100), nullable=True)
    analysis_data = Column(JSONB, nullable=True)  # Full AI response, intermediate calculations

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    course = relationship("Course", foreign_keys=[course_id])
    instructor = relationship("User", foreign_keys=[instructor_id])
