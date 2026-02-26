"""
Category Business Logic Service for Urban Home School

Handles CRUD operations for course categories, including hierarchical
category trees for navigation menus. Categories support parent-child
nesting, display ordering, icons, and images.

All functions are async and accept an AsyncSession for database operations.
"""

from __future__ import annotations

import logging
from typing import List, Optional
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category

logger = logging.getLogger(__name__)


async def create_category(db: AsyncSession, data: dict) -> Category:
    """
    Create a new category from a data dictionary.

    Accepts any valid Category model fields in the data dict (name, slug,
    description, icon, image_url, parent_id, display_order, is_active).
    Returns the newly created Category instance after committing to the database.
    """
    category = Category(**data)
    db.add(category)
    await db.commit()
    await db.refresh(category)
    logger.info(f"Created category: {category.name} ({category.slug})")
    return category


async def get_category_by_id(db: AsyncSession, category_id: UUID) -> Optional[Category]:
    """
    Look up a category by its UUID. Returns the Category or None if not found.
    """
    result = await db.execute(select(Category).where(Category.id == category_id))
    return result.scalar_one_or_none()


async def get_category_by_slug(db: AsyncSession, slug: str) -> Optional[Category]:
    """
    Look up a category by its URL-friendly slug. Returns the Category or None.
    """
    result = await db.execute(select(Category).where(Category.slug == slug))
    return result.scalar_one_or_none()


async def list_categories(db: AsyncSession, active_only: bool = True) -> List[Category]:
    """
    List all categories ordered by display_order then name.

    When active_only is True (default), only active categories are returned.
    Set active_only to False to include inactive categories (useful for admin).
    Returns a flat list of Category instances.
    """
    query = select(Category).order_by(Category.display_order, Category.name)
    if active_only:
        query = query.where(Category.is_active == True)
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_category_tree(db: AsyncSession) -> List[dict]:
    """
    Return categories as a nested tree structure for mega-menu navigation.

    Builds a hierarchy by grouping categories under their parents. Root
    categories (those with no parent) appear at the top level. Each node
    includes id, name, slug, description, icon, image_url, parent_id,
    display_order, is_active, course_count, timestamps, and a children
    list containing nested subcategories.

    Returns a list of root category dicts with recursively nested children.
    """
    categories = await list_categories(db, active_only=True)

    # Build parent->children map
    by_id = {str(c.id): c for c in categories}
    roots = []
    children_map: dict[str, list] = {}

    for cat in categories:
        parent_key = str(cat.parent_id) if cat.parent_id else None
        if parent_key and parent_key in by_id:
            children_map.setdefault(parent_key, []).append(cat)
        else:
            roots.append(cat)

    def build_tree(cat: Category) -> dict:
        cat_id = str(cat.id)
        kids = children_map.get(cat_id, [])
        return {
            "id": str(cat.id),
            "name": cat.name,
            "slug": cat.slug,
            "description": cat.description,
            "icon": cat.icon,
            "image_url": cat.image_url,
            "parent_id": str(cat.parent_id) if cat.parent_id else None,
            "display_order": cat.display_order,
            "is_active": cat.is_active,
            "course_count": cat.course_count,
            "created_at": cat.created_at.isoformat() if cat.created_at else None,
            "updated_at": cat.updated_at.isoformat() if cat.updated_at else None,
            "children": [build_tree(child) for child in kids],
        }

    return [build_tree(root) for root in roots]


async def update_category(db: AsyncSession, category_id: UUID, data: dict) -> Optional[Category]:
    """
    Update an existing category with values from the data dictionary.

    Only non-None values in the data dict will be applied. Returns the
    updated Category instance, or None if no category matches the given UUID.
    """
    category = await get_category_by_id(db, category_id)
    if not category:
        return None
    for key, value in data.items():
        if value is not None:
            setattr(category, key, value)
    await db.commit()
    await db.refresh(category)
    return category


async def delete_category(db: AsyncSession, category_id: UUID) -> bool:
    """
    Soft-delete a category by setting is_active to False.

    Returns True if the category was deactivated, False if not found.
    """
    category = await get_category_by_id(db, category_id)
    if not category:
        return False
    category.is_active = False
    await db.commit()
    return True


async def count_categories(db: AsyncSession, active_only: bool = True) -> int:
    """
    Count the total number of categories. Filters to active-only by default.

    Returns an integer count.
    """
    query = select(func.count()).select_from(Category)
    if active_only:
        query = query.where(Category.is_active == True)
    result = await db.execute(query)
    return result.scalar() or 0
