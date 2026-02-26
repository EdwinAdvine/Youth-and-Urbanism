"""
AIAlert Model

AI-generated warnings, insights, and milestone notifications for parents.
Full alert system with severity levels and action recommendations.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, UUID, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.database import Base


class AIAlert(Base):
    """
    AIAlert model for AI-generated parent notifications.

    The AI system monitors student engagement, performance, and behavior
    to generate actionable alerts for parents.

    Alert types:
    - engagement_drop: Significant decrease in learning activity
    - performance_decline: Grades or assessment scores dropping
    - milestone_reached: Achievement or goal completion
    - schedule_deviation: Irregular learning patterns
    - content_concern: Inappropriate content interaction flagged

    Severity levels trigger different notification channels based on
    parent preferences (info, warning, critical).
    """

    __tablename__ = "parent_ai_alerts"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Foreign keys
    parent_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    child_id = Column(UUID(as_uuid=True), ForeignKey('students.id', ondelete='CASCADE'), nullable=False, index=True)

    # Alert classification
    alert_type = Column(String(50), nullable=False, index=True)
    severity = Column(String(20), nullable=False, index=True)  # 'info', 'warning', 'critical'

    # Alert content
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    ai_recommendation = Column(Text, nullable=True)  # AI-suggested action steps

    # Status tracking
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    is_dismissed = Column(Boolean, default=False, nullable=False)

    # Action link
    action_url = Column(String(500), nullable=True)  # Deep link to relevant dashboard section

    # Additional data
    metadata_ = Column(JSONB, nullable=True)  # Thresholds, data points, trend data

    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    parent = relationship("User", foreign_keys=[parent_id], backref="ai_alerts")
    child = relationship("Student", foreign_keys=[child_id], backref="ai_alerts")

    def __repr__(self):
        status = "dismissed" if self.is_dismissed else ("read" if self.is_read else "unread")
        return f"<AIAlert(id={self.id}, type={self.alert_type}, severity={self.severity}, child={self.child_id}, status={status})>"
