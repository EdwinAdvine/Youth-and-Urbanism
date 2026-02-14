"""
Student Gamification Models - XP, Levels, Badges, Goals
"""
from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from ..database import Base


class StudentXPEvent(Base):
    """XP earning events"""
    __tablename__ = "student_xp_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    xp_amount = Column(Integer, nullable=False)
    source = Column(String(50), nullable=False)  # assignment, quiz, challenge, streak, login, helping_peer, project
    description = Column(String(255), nullable=False)
    multiplier = Column(Float, default=1.0)
    timestamp = Column(DateTime, default=datetime.utcnow)

    is_deleted = Column(Boolean, default=False)

    # Relationships
    student = relationship("Student", back_populates="xp_events")

    def __repr__(self):
        return f"<StudentXPEvent {self.student_id} - {self.xp_amount} XP>"


class StudentLevel(Base):
    """Student level and XP tracking"""
    __tablename__ = "student_levels"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, unique=True)
    current_level = Column(Integer, default=1)
    total_xp = Column(Integer, default=0)
    next_level_xp = Column(Integer, default=100)  # XP needed for next level

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)

    # Relationships
    student = relationship("Student", back_populates="level")

    def __repr__(self):
        return f"<StudentLevel {self.student_id} - Level {self.current_level}>"


class StudentBadge(Base):
    """Student badges and achievements"""
    __tablename__ = "student_badges"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    badge_type = Column(String(50), nullable=False)  # achievement, milestone, skill, special
    badge_name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(255), nullable=True)  # URL or icon name
    rarity = Column(String(20), default="common")  # common, uncommon, rare, epic, legendary
    earned_at = Column(DateTime, default=datetime.utcnow)
    is_shareable = Column(Boolean, default=True)
    badge_metadata = Column(JSONB, nullable=True)

    is_deleted = Column(Boolean, default=False)

    # Relationships
    student = relationship("Student", back_populates="badges")

    def __repr__(self):
        return f"<StudentBadge {self.badge_name} - {self.student_id}>"


class StudentGoal(Base):
    """Student learning goals"""
    __tablename__ = "student_goals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    target = Column(Integer, nullable=False)
    current = Column(Integer, default=0)
    unit = Column(String(50), default="lessons")  # lessons, hours, assignments, etc.
    deadline = Column(DateTime, nullable=True)
    ai_suggested = Column(Boolean, default=False)
    teacher_assigned = Column(Boolean, default=False)
    status = Column(String(20), default="active")  # active, completed, abandoned

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)

    # Relationships
    student = relationship("Student", back_populates="goals")

    def __repr__(self):
        return f"<StudentGoal {self.title} - {self.student_id}>"


class StudentSkillNode(Base):
    """Skill tree nodes"""
    __tablename__ = "student_skill_nodes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    skill_name = Column(String(100), nullable=False)
    subject = Column(String(100), nullable=False)
    proficiency = Column(Integer, default=0)  # 0-100
    parent_node_id = Column(UUID(as_uuid=True), nullable=True)
    last_practiced = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)

    # Relationships
    student = relationship("Student", back_populates="skill_nodes")

    def __repr__(self):
        return f"<StudentSkillNode {self.skill_name} - {self.proficiency}%>"


class StudentWeeklyReport(Base):
    """AI-generated weekly learning reports"""
    __tablename__ = "student_weekly_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    week_start = Column(DateTime, nullable=False)
    week_end = Column(DateTime, nullable=False)
    ai_story = Column(Text, nullable=False)  # AI-generated narrative
    metrics = Column(JSONB, nullable=False)  # {lessons_completed, avg_score, time_spent, etc.}
    strongest_subject = Column(String(100), nullable=True)
    improvement_area = Column(String(100), nullable=True)
    teacher_highlight = Column(Text, nullable=True)
    shared_with_parent = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)

    # Relationships
    student = relationship("Student", back_populates="weekly_reports")

    def __repr__(self):
        return f"<StudentWeeklyReport {self.student_id} - {self.week_start.date()}>"
