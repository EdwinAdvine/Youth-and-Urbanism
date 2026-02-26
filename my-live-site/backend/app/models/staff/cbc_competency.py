"""
CBC Competency Model

Reference table for Kenya's Competency-Based Curriculum (CBC) competencies.
Each row represents a single competency within a learning area, strand, and
grade level. Used for tagging content, assessments, and student progress
against national curriculum standards.
"""

import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, DateTime, UUID, Index, Boolean, Integer, Text,
)
from sqlalchemy.dialects.postgresql import JSONB
from app.database import Base


class CBCCompetency(Base):
    """
    CBC competency reference entry.

    Maps a competency code to its full descriptor hierarchy: learning area,
    strand, sub-strand, and grade level. Keywords JSONB enables full-text
    search for curriculum alignment tooling.
    """

    __tablename__ = "cbc_competencies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(50), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    learning_area = Column(String(100), nullable=False)
    strand = Column(String(100), nullable=False)
    sub_strand = Column(String(100), nullable=True)
    grade_level = Column(String(20), nullable=False)
    level = Column(String(50), nullable=True)
    keywords = Column(JSONB, default=[])
    is_active = Column(Boolean, default=True, nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index(
            "ix_cbc_competencies_area_grade",
            "learning_area",
            "grade_level",
        ),
        Index("ix_cbc_competencies_strand", "strand"),
    )

    def __repr__(self) -> str:
        return (
            f"<CBCCompetency(code='{self.code}', name='{self.name}', "
            f"area='{self.learning_area}', grade='{self.grade_level}')>"
        )
