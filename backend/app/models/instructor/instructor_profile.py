"""
Instructor Profile Model

Extended profile information for instructors including public profile settings,
portfolio, qualifications, and availability configuration.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Text, Boolean, Integer, DateTime, UUID, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.database import Base


class InstructorProfile(Base):
    """Extended profile for instructors with public page and portfolio support"""

    __tablename__ = "instructor_profiles"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # User relationship (one-to-one)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    # Basic information
    display_name = Column(String(200), nullable=True)
    bio = Column(Text, nullable=True)
    tagline = Column(String(300), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    banner_url = Column(String(500), nullable=True)

    # Professional information
    specializations = Column(JSONB, nullable=True, default=list)  # ["Mathematics", "Science"]
    qualifications = Column(JSONB, nullable=True, default=list)  # [{"degree": "BSc Math", "institution": "...", "year": 2020}]
    experience_years = Column(Integer, nullable=True)
    subjects = Column(JSONB, nullable=True, default=list)  # ["Algebra", "Geometry"]
    languages = Column(JSONB, nullable=True, default=list)  # ["English", "Swahili"]
    teaching_style = Column(String(100), nullable=True)

    # AI configuration
    ai_personality_config = Column(JSONB, nullable=True)  # AI assistant personality preferences

    # Public profile settings
    public_profile_enabled = Column(Boolean, default=False)
    public_slug = Column(String(100), unique=True, nullable=True, index=True)
    seo_meta = Column(JSONB, nullable=True)  # {"title": "...", "description": "...", "keywords": [...]}

    # Availability and preferences
    availability_config = Column(JSONB, nullable=True)  # Calendar rules, booking windows, quiet hours
    social_links = Column(JSONB, nullable=True, default=list)  # [{"platform": "linkedin", "url": "..."}]
    portfolio_items = Column(JSONB, nullable=True, default=list)  # [{"type": "video", "url": "...", "title": "..."}]

    # Onboarding status
    onboarding_completed = Column(Boolean, default=False)
    onboarding_step = Column(String(50), nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="instructor_profile")
