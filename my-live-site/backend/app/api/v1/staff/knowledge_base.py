"""
Staff Knowledge Base API Endpoints

Provides REST endpoints for the internal knowledge base:
- CRUD operations on articles
- Category management
- Vector similarity search across the KB
- AI-suggested articles based on ticket context

All endpoints require staff or admin role access.
"""

import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.utils.permissions import verify_staff_or_admin_access

from app.services.staff.knowledge_base_service import KnowledgeBaseService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Staff Knowledge Base"])


# ------------------------------------------------------------------
# Pydantic request models
# ------------------------------------------------------------------
class CreateArticleRequest(BaseModel):
    """Payload for creating a knowledge-base article."""
    title: str
    content: str
    category_id: Optional[str] = None
    tags: Optional[List[str]] = None
    is_published: bool = False


class UpdateArticleRequest(BaseModel):
    """Payload for updating a knowledge-base article."""
    title: Optional[str] = None
    content: Optional[str] = None
    category_id: Optional[str] = None
    tags: Optional[List[str]] = None
    is_published: Optional[bool] = None


class CreateCategoryRequest(BaseModel):
    """Payload for creating a KB category."""
    name: str
    description: Optional[str] = None
    parent_id: Optional[str] = None


class SearchRequest(BaseModel):
    """Payload for vector similarity search."""
    query: str
    top_k: int = 10
    category_id: Optional[str] = None


class SuggestionRequest(BaseModel):
    """Payload for AI-suggested articles based on ticket context."""
    ticket_id: str
    additional_context: Optional[str] = None


# ------------------------------------------------------------------
# GET /articles
# ------------------------------------------------------------------
@router.get("/articles")
async def list_articles(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    is_published: Optional[bool] = Query(None),
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Paginated list of knowledge-base articles.

    Supports filtering by category, publication status, and text search.
    """
    try:
        data = await KnowledgeBaseService.list_articles(
            db,
            page=page,
            page_size=page_size,
            category_id=category_id,
            search=search,
            is_published=is_published,
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to list KB articles")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list KB articles.",
        ) from exc


# ------------------------------------------------------------------
# GET /articles/{article_id}
# ------------------------------------------------------------------
@router.get("/articles/{article_id}")
async def get_article(
    article_id: str,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Retrieve a single knowledge-base article by ID."""
    try:
        data = await KnowledgeBaseService.get_article(db, article_id=article_id)
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Article not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to fetch article %s", article_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch article.",
        ) from exc


# ------------------------------------------------------------------
# POST /articles
# ------------------------------------------------------------------
@router.post("/articles", status_code=status.HTTP_201_CREATED)
async def create_article(
    body: CreateArticleRequest,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Create a new knowledge-base article."""
    try:
        author_id = current_user.get("id") or current_user.get("user_id")
        data = await KnowledgeBaseService.create_article(
            db,
            author_id=author_id,
            title=body.title,
            content=body.content,
            category_id=body.category_id,
            tags=body.tags,
            is_published=body.is_published,
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to create KB article")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create article.",
        ) from exc


# ------------------------------------------------------------------
# PATCH /articles/{article_id}
# ------------------------------------------------------------------
@router.patch("/articles/{article_id}")
async def update_article(
    article_id: str,
    body: UpdateArticleRequest,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Update an existing knowledge-base article."""
    try:
        updates = body.model_dump(exclude_unset=True)
        data = await KnowledgeBaseService.update_article(
            db, article_id=article_id, updates=updates
        )
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Article not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to update article %s", article_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update article.",
        ) from exc


# ------------------------------------------------------------------
# DELETE /articles/{article_id}
# ------------------------------------------------------------------
@router.delete("/articles/{article_id}")
async def delete_article(
    article_id: str,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Delete (soft-delete) a knowledge-base article."""
    try:
        success = await KnowledgeBaseService.delete_article(
            db, article_id=article_id
        )
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Article not found.",
            )
        return {"status": "success", "message": "Article deleted."}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to delete article %s", article_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete article.",
        ) from exc


# ------------------------------------------------------------------
# GET /categories
# ------------------------------------------------------------------
@router.get("/categories")
async def list_categories(
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """List all knowledge-base categories."""
    try:
        data = await KnowledgeBaseService.list_categories(db)
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to list KB categories")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list categories.",
        ) from exc


# ------------------------------------------------------------------
# POST /categories
# ------------------------------------------------------------------
@router.post("/categories", status_code=status.HTTP_201_CREATED)
async def create_category(
    body: CreateCategoryRequest,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Create a new knowledge-base category."""
    try:
        data = await KnowledgeBaseService.create_category(
            db,
            name=body.name,
            description=body.description,
            parent_id=body.parent_id,
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to create KB category")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create category.",
        ) from exc


# ------------------------------------------------------------------
# POST /search
# ------------------------------------------------------------------
@router.post("/search")
async def vector_search(
    body: SearchRequest,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Vector similarity search across the knowledge base.

    Returns the top-k most relevant articles matching the query
    along with relevance scores.
    """
    try:
        data = await KnowledgeBaseService.vector_search(
            db,
            query=body.query,
            top_k=body.top_k,
            category_id=body.category_id,
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to perform KB search")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to perform knowledge base search.",
        ) from exc


# ------------------------------------------------------------------
# POST /suggestions
# ------------------------------------------------------------------
@router.post("/suggestions")
async def get_article_suggestions(
    body: SuggestionRequest,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    AI-suggested articles based on ticket context.

    Analyses the ticket's conversation history and returns the most
    relevant KB articles that may help resolve the issue.
    """
    try:
        data = await KnowledgeBaseService.get_suggestions(
            db,
            ticket_id=body.ticket_id,
            additional_context=body.additional_context,
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to generate KB suggestions")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate article suggestions.",
        ) from exc
