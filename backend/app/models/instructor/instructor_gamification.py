"""
Instructor Gamification Models

Models for badges, points, levels, streaks, and peer recognition.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Text, Boolean, Integer, DateTime, UUID, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
import enum

from app.database import Base


class BadgeTier(str, enum.Enum):
    """Badge tier/rarity levels"""
    BRONZE = "bronze"
    SILVER = "silver"
    GOLD = "gold"
    PLATINUM = "platinum"


class InstructorBadge(Base):
    """Badge definitions (templates for achievements)"""

    __tablename__ = "instructor_badges"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Badge information
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    icon_url = Column(String(500), nullable=True)
    category = Column(String(100), nullable=True)  # "teaching", "engagement", "earnings", etc.

    # Criteria (JSONB for flexibility)
    criteria = Column(JSONB, nullable=False)  # {"type": "course_count", "threshold": 10, ...}
    tier = Column(SQLEnum(BadgeTier), default=BadgeTier.BRONZE, nullable=False)
    points_value = Column(Integer, default=0, nullable=False)

    # Status
    is_active = Column(Boolean, default=True, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class InstructorBadgeAward(Base):
    """Badge awards to specific instructors"""

    __tablename__ = "instructor_badge_awards"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Instructor and badge
    instructor_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    badge_id = Column(UUID(as_uuid=True), ForeignKey("instructor_badges.id", ondelete="CASCADE"), nullable=False, index=True)

    # Award details
    awarded_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    extra_data = Column(JSONB, nullable=True)  # Additional context about the award

    # Relationships
    instructor = relationship("User", foreign_keys=[instructor_id])
    badge = relationship("InstructorBadge", foreign_keys=[badge_id])


class InstructorPoints(Base):
    """Instructor points, level, and streak tracking"""

    __tablename__ = "instructor_points"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Instructor (one-to-one)
    instructor_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    # Points and level
    points = Column(Integer, default=0, nullable=False, index=True)
    level = Column(Integer, default=1, nullable=False)

    # Streak tracking
    streak_days = Column(Integer, default=0, nullable=False)
    longest_streak = Column(Integer, default=0, nullable=False)
    last_activity_at = Column(DateTime, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    instructor = relationship("User", foreign_keys=[instructor_id])


class InstructorPointsLog(Base):
    """Log of all points changes for audit trail"""

    __tablename__ = "instructor_points_logs"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Instructor
    instructor_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Points change
    points_delta = Column(Integer, nullable=False)  # Can be positive or negative
    reason = Column(String(200), nullable=False)
    source = Column(String(100), nullable=False)  # "badge_earned", "manual_adjustment", etc.

    # Additional data
    extra_data = Column(JSONB, nullable=True)

    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    instructor = relationship("User", foreign_keys=[instructor_id])


class PeerKudo(Base):
    """Peer-to-peer recognition between instructors"""

    __tablename__ = "peer_kudos"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # From and to instructors
    from_instructor_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    to_instructor_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Kudo details
    message = Column(Text, nullable=False)
    category = Column(String(100), nullable=True)  # "helpful", "inspiring", "collaborative", etc.
    is_public = Column(Boolean, default=True, nullable=False)

    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    from_instructor = relationship("User", foreign_keys=[from_instructor_id])
    to_instructor = relationship("User", foreign_keys=[to_instructor_id])
