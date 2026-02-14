"""
Instructor 2FA and Security Models

Models for two-factor authentication (TOTP, SMS, Email) and login history tracking.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Text, Boolean, DateTime, UUID, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.database import Base


class InstructorTwoFactor(Base):
    """Two-factor authentication configuration for instructors"""

    __tablename__ = "instructor_two_factor"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # User (one-to-one)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)

    # TOTP (Time-based One-Time Password - authenticator apps)
    totp_secret = Column(String(200), nullable=True)  # Encrypted secret key
    totp_enabled = Column(Boolean, default=False, nullable=False)

    # SMS OTP
    sms_enabled = Column(Boolean, default=False, nullable=False)
    sms_phone = Column(String(20), nullable=True)  # E.164 format: +254...

    # Email OTP
    email_otp_enabled = Column(Boolean, default=False, nullable=False)

    # Backup codes (encrypted)
    backup_codes = Column(JSONB, nullable=True)  # ["CODE1", "CODE2", ...] (hashed)

    # Last verified
    last_verified_at = Column(DateTime, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])


class LoginHistory(Base):
    """Login attempt history for all users (security audit trail)"""

    __tablename__ = "login_history"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # User
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Request details
    ip_address = Column(String(45), nullable=False)  # IPv4 or IPv6
    user_agent = Column(String(500), nullable=True)
    location = Column(String(200), nullable=True)  # Geo-IP lookup result

    # Login result
    success = Column(Boolean, nullable=False, index=True)
    failure_reason = Column(String(200), nullable=True)

    # 2FA method used (if applicable)
    two_factor_method = Column(String(20), nullable=True)  # "totp", "sms", "email"

    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
