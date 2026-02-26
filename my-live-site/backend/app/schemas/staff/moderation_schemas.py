"""
Moderation & Quality Schemas

Request/response schemas for content moderation queue, review decisions,
CBC alignment, and safety/policy management.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


# ── Moderation Queue ────────────────────────────────────────

class ModerationItemResponse(BaseModel):
    id: str
    content_type: str = Field(..., description="lesson | quiz | comment | forum_post | profile | media")
    content_id: str
    content_title: Optional[str] = None
    content_snippet: Optional[str] = None
    author_id: str
    author_name: Optional[str] = None
    flag_reason: Optional[str] = None
    flag_source: str = Field(default="ai", description="ai | user_report | system")
    ai_risk_score: Optional[float] = Field(None, ge=0, le=1)
    ai_categories: List[str] = Field(default_factory=list)
    priority: str = Field(default="medium", description="critical | high | medium | low")
    status: str = Field(default="pending", description="pending | in_review | approved | rejected | escalated")
    assigned_to: Optional[str] = None
    assigned_name: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ModerationItemListResponse(BaseModel):
    items: List[ModerationItemResponse]
    total: int
    page: int
    page_size: int
    pending_count: int = 0
    critical_count: int = 0


class ModerationFilters(BaseModel):
    content_type: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    flag_source: Optional[str] = None
    assigned_to: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None


# ── Review Decisions ────────────────────────────────────────

class ReviewDecisionCreate(BaseModel):
    moderation_item_id: str
    decision: str = Field(..., description="approve | reject | escalate | request_changes")
    reason: Optional[str] = Field(None, max_length=2000)
    feedback_to_author: Optional[str] = Field(None, max_length=2000)
    cbc_tags: List[str] = Field(default_factory=list)
    internal_notes: Optional[str] = None


class ReviewDecisionResponse(BaseModel):
    id: str
    moderation_item_id: str
    reviewer_id: str
    reviewer_name: Optional[str] = None
    decision: str
    reason: Optional[str] = None
    feedback_to_author: Optional[str] = None
    cbc_tags: List[str] = Field(default_factory=list)
    created_at: datetime

    class Config:
        from_attributes = True


# ── Bulk Actions ────────────────────────────────────────────

class BulkModerationAction(BaseModel):
    item_ids: List[str] = Field(..., min_length=1, max_length=50)
    action: str = Field(..., description="approve | reject | assign | escalate")
    reason: Optional[str] = None
    assign_to: Optional[str] = None


class BulkActionResult(BaseModel):
    total: int
    successful: int
    failed: int
    errors: List[Dict[str, str]] = Field(default_factory=list)


# ── CBC Alignment ───────────────────────────────────────────

class CBCAlignmentCheck(BaseModel):
    content_id: str
    content_text: str
    expected_competencies: List[str] = Field(default_factory=list)


class CBCAlignmentResult(BaseModel):
    content_id: str
    aligned_competencies: List[Dict[str, Any]] = Field(default_factory=list)
    missing_competencies: List[str] = Field(default_factory=list)
    alignment_score: float = Field(default=0.0, ge=0, le=1)
    suggestions: List[str] = Field(default_factory=list)


# ── Safety & Policy ─────────────────────────────────────────

class SafetyFlag(BaseModel):
    id: str
    content_type: str
    content_id: str
    risk_type: str = Field(..., description="harassment | inappropriate | misinformation | privacy | violence | other")
    risk_score: float = Field(..., ge=0, le=1)
    description: str
    reporter_type: str = Field(default="ai", description="ai | user | system")
    reporter_id: Optional[str] = None
    status: str = "open"
    created_at: datetime


class SafetyFlagListResponse(BaseModel):
    items: List[SafetyFlag]
    total: int
    page: int
    page_size: int
    high_risk_count: int = 0
