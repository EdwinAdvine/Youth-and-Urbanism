"""
TwoFactorAuth Model

Two-factor authentication configuration for all users (cross-cutting).
Supports TOTP (authenticator apps), SMS, and email verification.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, UUID, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.database import Base


class TwoFactorAuth(Base):
    """
    TwoFactorAuth model for 2FA configuration across all roles.

    Supports three 2FA methods:
    - TOTP: Time-based One-Time Password (Google Authenticator, Authy, etc.)
    - SMS: Verification codes sent via SMS
    - Email: Verification codes sent via email

    Each user can enable multiple methods. Backup codes provide recovery access.
    """

    __tablename__ = "user_two_factor_auth"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Foreign key (one-to-one with User)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False, index=True)

    # TOTP (Authenticator app) configuration
    totp_secret = Column(String(255), nullable=True)  # Encrypted TOTP secret key
    totp_enabled = Column(Boolean, default=False, nullable=False)

    # SMS configuration
    sms_enabled = Column(Boolean, default=False, nullable=False)
    sms_phone = Column(String(20), nullable=True)  # Phone number for SMS

    # Email configuration
    email_enabled = Column(Boolean, default=False, nullable=False)
    email_address = Column(String(255), nullable=True)  # May differ from primary email

    # Backup codes
    backup_codes = Column(JSONB, nullable=True)  # Array of hashed backup codes

    # Recovery
    recovery_email = Column(String(255), nullable=True)  # Fallback email for account recovery

    # Usage tracking
    last_used_at = Column(DateTime, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", backref="two_factor_auth", uselist=False)

    @property
    def has_any_2fa_enabled(self):
        """Check if any 2FA method is enabled."""
        return self.totp_enabled or self.sms_enabled or self.email_enabled

    def __repr__(self):
        methods = []
        if self.totp_enabled: methods.append("TOTP")
        if self.sms_enabled: methods.append("SMS")
        if self.email_enabled: methods.append("Email")
        return f"<TwoFactorAuth(user_id={self.user_id}, methods={methods})>"
