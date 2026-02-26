"""
LoginHistory Model

Login audit trail for all users (cross-cutting).
Tracks successful and failed login attempts with device and location information.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, UUID, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.database import Base


class LoginHistory(Base):
    """
    LoginHistory model for tracking all login attempts.

    Records both successful and failed login attempts for security auditing.
    Captures device, browser, IP, and location information.

    This enables:
    - Security monitoring (unusual login patterns)
    - User account history viewing
    - Breach detection
    - Compliance with security audit requirements
    """

    __tablename__ = "user_login_history"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Foreign key
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)

    # Request metadata
    ip_address = Column(String(45), nullable=True)  # IPv4 or IPv6
    user_agent = Column(Text, nullable=True)  # Raw user agent string
    device_info = Column(JSONB, nullable=True)  # Parsed: device, browser, OS

    # Location (optional, from IP geolocation)
    location = Column(String(200), nullable=True)  # e.g., "Nairobi, Kenya"

    # Login details
    login_at = Column(DateTime, nullable=False, index=True)
    success = Column(Boolean, nullable=False, index=True)
    failure_reason = Column(String(100), nullable=True)  # e.g., "invalid_password", "account_locked", "2fa_failed"

    # Relationships
    user = relationship("User", foreign_keys=[user_id], backref="login_history")

    def __repr__(self):
        status = "SUCCESS" if self.success else f"FAILED ({self.failure_reason})"
        return f"<LoginHistory(user_id={self.user_id}, {status}, ip={self.ip_address}, at={self.login_at})>"
