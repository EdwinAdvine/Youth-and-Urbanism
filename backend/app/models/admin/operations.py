"""
Operations Models — Phase 8

Tables for support tickets, moderation queue, system configuration
(with maker-checker workflow), and keyword filters.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text, UUID, ForeignKey, Index
from sqlalchemy.dialects.postgresql import JSONB
from app.database import Base


class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticket_number = Column(String(20), unique=True, nullable=False, index=True)
    subject = Column(String(300), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=True, index=True)
    priority = Column(String(20), default="medium", index=True)  # critical | high | medium | low
    status = Column(String(20), default="open", index=True)  # open | in_progress | escalated | resolved | closed
    reporter_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    sla_deadline = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index('ix_ticket_status_priority', 'status', 'priority'),
        Index('ix_ticket_reporter', 'reporter_id', 'created_at'),
    )

    def __repr__(self) -> str:
        return f"<SupportTicket(number='{self.ticket_number}', status='{self.status}')>"


class ModerationItem(Base):
    __tablename__ = "moderation_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content_type = Column(String(50), nullable=False, index=True)
    content_id = Column(UUID(as_uuid=True), nullable=True)
    content_preview = Column(Text, nullable=True)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    flag_reason = Column(String(100), nullable=False)
    flagged_by = Column(String(50), default="ai_filter")  # ai_filter | user_report
    severity = Column(String(20), default="medium", index=True)
    status = Column(String(30), default="pending_review", index=True)  # pending_review | approved | removed | escalated
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index('ix_mod_status_severity', 'status', 'severity'),
    )

    def __repr__(self) -> str:
        return f"<ModerationItem(content_type='{self.content_type}', status='{self.status}')>"


class SystemConfig(Base):
    __tablename__ = "system_configs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    key = Column(String(100), unique=True, nullable=False, index=True)
    value = Column(JSONB, default={})
    description = Column(Text, nullable=True)
    category = Column(String(50), nullable=True, index=True)
    editable = Column(Boolean, default=True)
    last_modified_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    last_modified_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<SystemConfig(key='{self.key}')>"


class SystemConfigChangeRequest(Base):
    __tablename__ = "system_config_change_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    config_id = Column(UUID(as_uuid=True), ForeignKey("system_configs.id", ondelete="CASCADE"), nullable=False, index=True)
    requested_value = Column(JSONB, nullable=False)
    reason = Column(Text, nullable=True)
    requested_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status = Column(String(20), default="pending", index=True)  # pending | approved | rejected
    decided_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    decided_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<SystemConfigChangeRequest(config_id={self.config_id}, status='{self.status}')>"


class KeywordFilter(Base):
    __tablename__ = "keyword_filters"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    keyword = Column(String(200), nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)  # profanity | hate_speech | adult | custom
    severity = Column(String(20), default="medium")
    is_active = Column(Boolean, default=True, nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<KeywordFilter(keyword='{self.keyword}', category='{self.category}')>"
