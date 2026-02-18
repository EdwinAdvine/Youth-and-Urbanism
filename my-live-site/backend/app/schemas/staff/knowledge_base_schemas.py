"""
Knowledge Base Schemas

Request/response schemas for KB articles, categories, and vector search.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


# ── Categories ──────────────────────────────────────────────

class KBCategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    slug: str = Field(..., min_length=1, max_length=200)
    parent_id: Optional[str] = None
    sort_order: int = 0


class KBCategoryCreate(KBCategoryBase):
    pass


class KBCategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    parent_id: Optional[str] = None
    sort_order: Optional[int] = None


class KBCategoryResponse(KBCategoryBase):
    id: str
    article_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Articles ────────────────────────────────────────────────

class KBArticleBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    slug: str = Field(..., min_length=1, max_length=500)
    body: str = Field(..., min_length=1)
    category_id: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    is_internal: bool = False


class KBArticleCreate(KBArticleBase):
    pass


class KBArticleUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    body: Optional[str] = None
    category_id: Optional[str] = None
    tags: Optional[List[str]] = None
    status: Optional[str] = None
    is_internal: Optional[bool] = None


class KBArticleResponse(KBArticleBase):
    id: str
    status: str = "draft"
    author_id: str
    author_name: Optional[str] = None
    view_count: int = 0
    helpful_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class KBArticleListResponse(BaseModel):
    items: List[KBArticleResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


# ── Vector Search ───────────────────────────────────────────

class KBSearchQuery(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000)
    category_id: Optional[str] = None
    is_internal: Optional[bool] = None
    limit: int = Field(default=5, ge=1, le=20)


class KBSearchResult(BaseModel):
    article_id: str
    title: str
    slug: str
    snippet: str
    similarity_score: float
    category_name: Optional[str] = None
    tags: List[str] = Field(default_factory=list)


class KBSearchResponse(BaseModel):
    results: List[KBSearchResult]
    query: str
    total_results: int


# ── AI Suggestions ──────────────────────────────────────────

class KBSuggestionRequest(BaseModel):
    """Request AI-suggested KB articles based on ticket content."""
    ticket_id: str
    ticket_text: str
    limit: int = Field(default=5, ge=1, le=10)


class KBSuggestionResponse(BaseModel):
    suggestions: List[KBSearchResult]
    ai_summary: Optional[str] = None
