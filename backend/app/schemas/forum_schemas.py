"""
Forum Pydantic schemas for request/response validation.
"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


# --- Request Schemas ---

class ForumPostCreate(BaseModel):
    """Create a new forum post."""
    title: str = Field(..., min_length=3, max_length=255)
    content: str = Field(..., min_length=10)
    category: str = Field(
        ...,
        pattern="^(general|mathematics|science|languages|social-studies|technology|help-support)$",
    )
    tags: List[str] = Field(default_factory=list)
    is_public: bool = True


class ForumPostUpdate(BaseModel):
    """Update an existing forum post."""
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    content: Optional[str] = Field(None, min_length=10)
    category: Optional[str] = Field(
        None,
        pattern="^(general|mathematics|science|languages|social-studies|technology|help-support)$",
    )
    tags: Optional[List[str]] = None
    is_public: Optional[bool] = None


class ForumReplyCreate(BaseModel):
    """Create a reply to a forum post."""
    content: str = Field(..., min_length=1)


class ForumReplyUpdate(BaseModel):
    """Edit a reply."""
    content: str = Field(..., min_length=1)


# --- Response Schemas ---

class AuthorInfo(BaseModel):
    """Author info embedded in post/reply responses."""
    id: UUID
    name: Optional[str] = None
    role: str
    avatar: Optional[str] = None


class ForumReplyResponse(BaseModel):
    """Single reply in API response."""
    id: UUID
    post_id: UUID
    content: str
    author: AuthorInfo
    is_solution: bool = False
    likes: int = 0
    liked_by_me: bool = False
    created_at: datetime
    updated_at: datetime


class ForumPostStats(BaseModel):
    """Post statistics."""
    views: int = 0
    replies: int = 0
    likes: int = 0


class ForumPostResponse(BaseModel):
    """Single forum post in API response."""
    id: UUID
    title: str
    content: str
    excerpt: Optional[str] = None
    category: str
    tags: List[str] = Field(default_factory=list)
    author: AuthorInfo
    stats: ForumPostStats
    is_public: bool = True
    is_pinned: bool = False
    is_solved: bool = False
    liked_by_me: bool = False
    created_at: datetime
    updated_at: datetime
    last_activity_at: datetime


class ForumPostListResponse(BaseModel):
    """Paginated list of forum posts."""
    posts: List[ForumPostResponse]
    total: int
    page: int = 1
    limit: int = 20


class ForumPostDetailResponse(ForumPostResponse):
    """Single post with its replies."""
    replies: List[ForumReplyResponse] = Field(default_factory=list)
