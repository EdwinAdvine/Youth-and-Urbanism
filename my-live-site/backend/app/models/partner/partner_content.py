"""
Partner Content Model

Model for partner-contributed educational resources and branded materials.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Text, Boolean, Integer, DateTime, UUID, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
import enum

from app.database import Base


class ResourceStatus(str, enum.Enum):
    """Approval status for partner resources"""
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    REJECTED = "rejected"


class ResourceType(str, enum.Enum):
    """Types of partner resources"""
    LESSON = "lesson"
    MATERIAL = "material"
    VIDEO = "video"
    DOCUMENT = "document"
    WORKSHEET = "worksheet"
    ASSESSMENT = "assessment"


class PartnerResource(Base):
    """Educational resources contributed by partners"""

    __tablename__ = "partner_resources"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Partner
    partner_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Resource details
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    resource_type = Column(SQLEnum(ResourceType), nullable=False)

    # File information
    file_url = Column(String(500), nullable=True)
    file_size = Column(Integer, nullable=True)  # In bytes
    mime_type = Column(String(100), nullable=True)
    thumbnail_url = Column(String(500), nullable=True)

    # Approval workflow
    status = Column(SQLEnum(ResourceStatus), default=ResourceStatus.PENDING_REVIEW, nullable=False, index=True)
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    review_notes = Column(Text, nullable=True)

    # Branding
    branding_applied = Column(Boolean, default=False)

    # Usage tracking
    usage_count = Column(Integer, default=0)
    target_programs = Column(JSONB, nullable=True, default=list)  # ["program_id_1", "program_id_2"]
    target_grade_levels = Column(JSONB, nullable=True, default=list)  # ["Grade 1", "Grade 2"]

    # Metadata
    tags = Column(JSONB, nullable=True, default=list)  # ["math", "science", "CBC"]
    extra_data = Column(JSONB, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    partner = relationship("User", foreign_keys=[partner_id])
    reviewer = relationship("User", foreign_keys=[reviewed_by])
