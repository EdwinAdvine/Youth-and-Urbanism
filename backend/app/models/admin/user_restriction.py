"""
User Restriction Model

Manages bans, suspensions, feature locks, and warnings applied to users.
Includes appeal workflow for users to contest restrictions.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text, Integer, UUID, ForeignKey, Index
from sqlalchemy.dialects.postgresql import JSONB
from app.database import Base


class UserRestriction(Base):
    __tablename__ = "user_restrictions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Restriction details
    restriction_type = Column(String(50), nullable=False, index=True)  # suspension | ban | feature_lock | warning
    reason = Column(Text, nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    duration_days = Column(Integer, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    affected_features = Column(JSONB, default=[])
    is_active = Column(Boolean, default=True, nullable=False, index=True)

    # Appeal workflow
    appealed = Column(Boolean, default=False, nullable=False)
    appeal_text = Column(Text, nullable=True)
    appeal_decision = Column(String(20), nullable=True)  # approved | rejected | pending
    appeal_decided_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    appeal_decided_at = Column(DateTime, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index('ix_restriction_user_active', 'user_id', 'is_active'),
        Index('ix_restriction_type_active', 'restriction_type', 'is_active'),
    )

    def __repr__(self) -> str:
        return f"<UserRestriction(user_id={self.user_id}, type='{self.restriction_type}', active={self.is_active})>"
