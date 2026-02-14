"""
Instructor Discussion Schemas

Pydantic v2 schemas for instructor forum posts, replies, and community interactions.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal


# Forum Post Schemas
class ForumPostCreate(BaseModel):
    forum_id: Optional[str] = None
    title: str = Field(..., min_length=3, max_length=200)
    content: str = Field(..., min_length=10)
    post_type: str = Field(default="discussion")  # discussion, announcement, question


class ForumPostUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    content: Optional[str] = Field(None, min_length=10)
    is_pinned: Optional[bool] = None


class InstructorForumPostResponse(BaseModel):
    id: str
    instructor_id: str
    instructor_name: str
    instructor_avatar: Optional[str] = None
    forum_id: Optional[str] = None
    title: str
    content: str
    post_type: str
    is_pinned: bool
    is_moderated: bool
    sentiment_score: Optional[Decimal] = None
    replies_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Forum Reply Schemas
class ForumReplyCreate(BaseModel):
    post_id: str
    content: str = Field(..., min_length=10)


class ForumReplyUpdate(BaseModel):
    content: str = Field(..., min_length=10)


class InstructorForumReplyResponse(BaseModel):
    id: str
    post_id: str
    author_id: str
    author_name: str
    author_avatar: Optional[str] = None
    content: str
    sentiment_score: Optional[Decimal] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Moderation Schemas
class ModerationAction(BaseModel):
    post_id: str
    action: str  # approve, flag, delete
    reason: Optional[str] = None


class SentimentAnalysisResponse(BaseModel):
    post_id: str
    sentiment_score: Decimal  # -1 to 1
    sentiment_label: str  # negative, neutral, positive
    confidence: Decimal
    ai_model_used: str


# Query Schemas
class ForumPostQueryParams(BaseModel):
    forum_id: Optional[str] = None
    post_type: Optional[str] = None
    is_pinned: Optional[bool] = None
    is_moderated: Optional[bool] = None
    search: Optional[str] = None
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)
    sort_by: str = Field(default="created_at")
    sort_order: str = Field(default="desc", pattern="^(asc|desc)$")


class ForumReplyQueryParams(BaseModel):
    post_id: str
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=50, ge=1, le=100)
