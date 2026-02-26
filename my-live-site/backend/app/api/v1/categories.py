"""
Category API Endpoints for Urban Home School

Public endpoints for category browsing and mega-menu.
Admin endpoints for category CRUD.
"""

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.category_schemas import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
    CategoryListResponse,
    CategoryTreeResponse,
)
from app.services.category_service import (
    create_category,
    get_category_by_id,
    get_category_by_slug,
    list_categories,
    get_category_tree,
    update_category,
    delete_category,
    count_categories,
)
from app.utils.security import get_current_user

router = APIRouter(prefix="/categories", tags=["Categories"])


# ========================
# Public Endpoints
# ========================

@router.get("", response_model=CategoryListResponse)
async def get_categories(
    active_only: bool = True,
    db: AsyncSession = Depends(get_db),
):
    """List all categories (public)."""
    categories = await list_categories(db, active_only=active_only)
    total = await count_categories(db, active_only=active_only)
    return CategoryListResponse(
        categories=[CategoryResponse.model_validate(c) for c in categories],
        total=total,
    )


@router.get("/tree")
async def get_categories_tree(
    db: AsyncSession = Depends(get_db),
):
    """Get nested category tree for mega-menu display (public)."""
    tree = await get_category_tree(db)
    return {"categories": tree}


@router.get("/{slug}", response_model=CategoryResponse)
async def get_category(
    slug: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a single category by slug (public)."""
    category = await get_category_by_slug(db, slug)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return CategoryResponse.model_validate(category)


# ========================
# Admin Endpoints
# ========================

@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def admin_create_category(
    data: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Create a new category (admin only)."""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    existing = await get_category_by_slug(db, data.slug)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Category with this slug already exists")

    category = await create_category(db, data.model_dump())
    return CategoryResponse.model_validate(category)


@router.put("/{category_id}", response_model=CategoryResponse)
async def admin_update_category(
    category_id: UUID,
    data: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Update a category (admin only)."""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    updated = await update_category(db, category_id, data.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return CategoryResponse.model_validate(updated)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_category(
    category_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Soft-delete a category (admin only)."""
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    deleted = await delete_category(db, category_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
