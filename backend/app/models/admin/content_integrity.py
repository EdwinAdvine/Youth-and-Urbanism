"""
Content Integrity Models — Phase 4

Tables for content versioning, CBC competency mapping, grade overrides,
certificate templates, and the resource library.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Integer, Float, DateTime, Text, UUID, ForeignKey, Index
from sqlalchemy.dialects.postgresql import JSONB
from app.database import Base


class ContentVersion(Base):
    __tablename__ = "content_versions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    version_number = Column(Integer, nullable=False)
    changes = Column(JSONB, default={})
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index('ix_cv_course_version', 'course_id', 'version_number'),
    )

    def __repr__(self) -> str:
        return f"<ContentVersion(course_id={self.course_id}, v{self.version_number})>"


class CompetencyTag(Base):
    __tablename__ = "competency_tags"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False, index=True)
    strand = Column(String(100), nullable=False)
    sub_strand = Column(String(100), nullable=True)
    grade_level = Column(String(20), nullable=True, index=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<CompetencyTag(name='{self.name}', strand='{self.strand}')>"


class CourseCompetencyMapping(Base):
    __tablename__ = "course_competency_mappings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    competency_tag_id = Column(UUID(as_uuid=True), ForeignKey("competency_tags.id", ondelete="CASCADE"), nullable=False, index=True)
    coverage_level = Column(String(20), default="full")  # full | partial
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index('ix_ccm_course_comp', 'course_id', 'competency_tag_id', unique=True),
    )


class GradeOverride(Base):
    __tablename__ = "grade_overrides"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assessment_id = Column(UUID(as_uuid=True), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    original_score = Column(Float, nullable=False)
    override_score = Column(Float, nullable=False)
    reason = Column(Text, nullable=False)
    requested_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status = Column(String(20), default="pending", index=True)  # pending | approved | rejected
    decided_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    decided_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<GradeOverride(assessment={self.assessment_id}, {self.original_score}->{self.override_score})>"


class CertificateTemplate(Base):
    __tablename__ = "certificate_templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    template_data = Column(JSONB, default={})
    is_active = Column(Boolean, default=True, nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<CertificateTemplate(name='{self.name}', active={self.is_active})>"


class ResourceItem(Base):
    __tablename__ = "resource_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(300), nullable=False, index=True)
    file_url = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size_bytes = Column(Integer, nullable=True)
    category = Column(String(100), nullable=True, index=True)
    tags = Column(JSONB, default=[])
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    moderation_status = Column(String(20), default="pending", index=True)  # approved | pending | flagged
    usage_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<ResourceItem(title='{self.title}', status='{self.moderation_status}')>"
