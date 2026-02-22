"""
User Avatar Model

Stores 3D avatar configurations for users. Each user can have multiple avatars
(preset stylized, preset realistic, or custom RPM-generated) with one marked
as active. The active avatar drives the 3D talking tutor panel throughout the
platform.

GLB model files are served from a CDN (presets) or S3/Azure (custom uploads).
"""

import uuid
import enum
from datetime import datetime

from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.database import Base


class AvatarType(str, enum.Enum):
    preset_stylized = "preset_stylized"
    preset_realistic = "preset_realistic"
    custom_rpm = "custom_rpm"


class UserAvatar(Base):
    """
    Per-user 3D avatar record.

    Users can save multiple avatars (from presets or Ready Player Me) and
    activate one at a time. The active avatar is rendered in the floating
    avatar panel, chat messages, and CoPilot sidebar.
    """

    __tablename__ = "user_avatars"

    id = Column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True
    )
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name = Column(String(100), nullable=False)
    avatar_type = Column(SAEnum(AvatarType), nullable=False)
    model_url = Column(String(500), nullable=False)  # GLB file URL
    thumbnail_url = Column(String(500), nullable=True)
    rpm_avatar_id = Column(String(200), nullable=True)  # Ready Player Me ID
    is_active = Column(Boolean, default=False, nullable=False, index=True)
    customization_data = Column(JSONB, default=dict, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    user = relationship("User", backref="avatars")

    def __repr__(self) -> str:
        return (
            f"<UserAvatar(id={self.id}, name='{self.name}', "
            f"type={self.avatar_type}, active={self.is_active})>"
        )
