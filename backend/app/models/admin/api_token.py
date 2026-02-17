"""
API Token Model

Manages developer API tokens for external integrations.
Tokens are hashed and support scoped permissions with expiry.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, UUID, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from app.database import Base


class APIToken(Base):
    """
    A developer API token for external integrations.

    Tokens are stored as bcrypt hashes (token_hash) so the plaintext is only
    shown once at creation time. Each token is scoped to a set of permissions
    (JSONB array), can be deactivated, and optionally expires. The last_used_at
    timestamp helps admins identify stale tokens.
    """

    __tablename__ = "api_tokens"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    token_hash = Column(String(255), unique=True, nullable=False, index=True)
    scopes = Column(JSONB, default=[])
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    last_used_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    def __repr__(self) -> str:
        return f"<APIToken(name='{self.name}', user_id={self.user_id}, active={self.is_active})>"
