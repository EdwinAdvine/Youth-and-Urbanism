"""
Staff Content Studio API Endpoints

Provides REST endpoints for content creation and management:
- CRUD operations on content items with pagination and filters
- Content publishing workflow
- Version history and rollback capabilities
- Collaborative editing session management

All endpoints require staff or admin role access.
"""

import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.utils.permissions import verify_staff_or_admin_access

from app.services.staff.content_studio_service import ContentStudioService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Staff Content Studio"])


# ------------------------------------------------------------------
# Pydantic request models
# ------------------------------------------------------------------
class CreateContentRequest(BaseModel):
    """Payload for creating a new content item."""
    title: str
    body: str
    content_type: str  # 'lesson' | 'resource' | 'guide' | 'activity'
    grade_level: Optional[str] = None
    subject: Optional[str] = None
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None


class UpdateContentRequest(BaseModel):
    """Payload for updating a content item."""
    title: Optional[str] = None
    body: Optional[str] = None
    content_type: Optional[str] = None
    grade_level: Optional[str] = None
    subject: Optional[str] = None
    tags: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None


# ------------------------------------------------------------------
# GET /items
# ------------------------------------------------------------------
@router.get("/items")
async def list_content_items(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    content_type: Optional[str] = Query(None),
    author: Optional[str] = Query(None),
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Paginated list of content items.

    Supports filtering by status (draft/published/archived),
    content_type, and author.
    """
    try:
        data = await ContentStudioService.list_items(
            db,
            page=page,
            page_size=page_size,
            status_filter=status_filter,
            content_type=content_type,
            author=author,
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to list content items")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list content items.",
        ) from exc


# ------------------------------------------------------------------
# GET /items/{content_id}
# ------------------------------------------------------------------
@router.get("/items/{content_id}")
async def get_content_item(
    content_id: str,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Retrieve a single content item with its version history."""
    try:
        data = await ContentStudioService.get_item(db, content_id=content_id)
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Content item not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to fetch content item %s", content_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch content item.",
        ) from exc


# ------------------------------------------------------------------
# POST /items
# ------------------------------------------------------------------
@router.post("/items", status_code=status.HTTP_201_CREATED)
async def create_content_item(
    body: CreateContentRequest,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Create a new content item (initially in draft status)."""
    try:
        author_id = current_user.get("id") or current_user.get("user_id")
        data = await ContentStudioService.create_item(
            db,
            author_id=author_id,
            title=body.title,
            body=body.body,
            content_type=body.content_type,
            grade_level=body.grade_level,
            subject=body.subject,
            tags=body.tags,
            metadata=body.metadata,
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to create content item")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create content item.",
        ) from exc


# ------------------------------------------------------------------
# PATCH /items/{content_id}
# ------------------------------------------------------------------
@router.patch("/items/{content_id}")
async def update_content_item(
    content_id: str,
    body: UpdateContentRequest,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Update an existing content item (creates a new version)."""
    try:
        editor_id = current_user.get("id") or current_user.get("user_id")
        updates = body.model_dump(exclude_unset=True)
        data = await ContentStudioService.update_item(
            db, content_id=content_id, editor_id=editor_id, updates=updates
        )
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Content item not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to update content item %s", content_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update content item.",
        ) from exc


# ------------------------------------------------------------------
# POST /items/{content_id}/publish
# ------------------------------------------------------------------
@router.post("/items/{content_id}/publish")
async def publish_content(
    content_id: str,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Publish a content item, making it visible to learners."""
    try:
        publisher_id = current_user.get("id") or current_user.get("user_id")
        data = await ContentStudioService.publish_item(
            db, content_id=content_id, publisher_id=publisher_id
        )
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Content item not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to publish content item %s", content_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to publish content item.",
        ) from exc


# ------------------------------------------------------------------
# GET /items/{content_id}/versions
# ------------------------------------------------------------------
@router.get("/items/{content_id}/versions")
async def get_version_history(
    content_id: str,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Retrieve the complete version history for a content item."""
    try:
        data = await ContentStudioService.get_versions(
            db, content_id=content_id
        )
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Content item not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to fetch versions for content %s", content_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch version history.",
        ) from exc


# ------------------------------------------------------------------
# POST /items/{content_id}/rollback/{version_number}
# ------------------------------------------------------------------
@router.post("/items/{content_id}/rollback/{version_number}")
async def rollback_content(
    content_id: str,
    version_number: int,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Rollback a content item to a previous version.

    Creates a new version that mirrors the specified historical version.
    """
    try:
        editor_id = current_user.get("id") or current_user.get("user_id")
        data = await ContentStudioService.rollback_to_version(
            db,
            content_id=content_id,
            version_number=version_number,
            editor_id=editor_id,
        )
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Content item or version not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception(
            "Failed to rollback content %s to version %s",
            content_id, version_number,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to rollback content item.",
        ) from exc


# ------------------------------------------------------------------
# POST /collab/start/{content_id}
# ------------------------------------------------------------------
@router.post("/collab/start/{content_id}")
async def start_collab_session(
    content_id: str,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Start a collaborative editing session for a content item.

    Returns a session token and WebSocket URL for real-time editing.
    """
    try:
        user_id = current_user.get("id") or current_user.get("user_id")
        data = await ContentStudioService.start_collab_session(
            db, content_id=content_id, user_id=user_id
        )
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Content item not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception(
            "Failed to start collab session for content %s", content_id
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to start collaborative editing session.",
        ) from exc
