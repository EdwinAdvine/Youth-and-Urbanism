"""
Staff Profile Models

Staff team organization and individual staff member profiles. StaffTeam groups
staff into departments with designated leads, while StaffProfile stores each
staff member's role details, specializations, dashboard preferences, and
team assignment.
"""

import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, DateTime, UUID, Index, Boolean, Text, Date, ForeignKey,
)
from sqlalchemy.dialects.postgresql import JSONB
from app.database import Base


class StaffTeam(Base):
    """
    Organizational team grouping for staff members.

    Teams belong to departments and can have a designated lead.
    Used for ticket routing, workload balancing, and reporting hierarchies.
    """

    __tablename__ = "staff_teams"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    department = Column(String(100), nullable=False)
    lead_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    description = Column(Text, nullable=True)
    metadata = Column(JSONB, default={})
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<StaffTeam(name='{self.name}', department='{self.department}')>"


class StaffProfile(Base):
    """
    Extended profile for a staff user.

    Stores department, position, specializations, dashboard layout
    preferences, team membership, and hire date. One-to-one with users.
    """

    __tablename__ = "staff_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    department = Column(String(100), default="General", nullable=False)
    position = Column(String(100), nullable=True)
    employee_id = Column(String(50), unique=True, nullable=True)
    specializations = Column(JSONB, default=[])
    view_mode = Column(String(30), default="teacher_focus", nullable=False)
    custom_layout = Column(JSONB, default={})
    availability = Column(JSONB, default={})
    team_id = Column(
        UUID(as_uuid=True),
        ForeignKey("staff_teams.id", ondelete="SET NULL"),
        nullable=True,
    )
    is_department_lead = Column(Boolean, default=False, nullable=False)
    hired_at = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    __table_args__ = (
        Index("ix_staff_profiles_user_id", "user_id"),
        Index("ix_staff_profiles_department", "department"),
        Index("ix_staff_profiles_team_id", "team_id"),
    )

    def __repr__(self) -> str:
        return (
            f"<StaffProfile(user_id={self.user_id}, "
            f"department='{self.department}', position='{self.position}')>"
        )
