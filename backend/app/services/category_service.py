"""
Category business logic service.
"""

import logging
from typing import List, Optional
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category

logger = logging.getLogger(__name__)


async def create_category(db: AsyncSession, data: dict) -> Category:
    category = Category(**data)
    db.add(category)
    await db.commit()
    await db.refresh(category)
    logger.info(f"Created category: {category.name} ({category.slug})")
    return category


async def get_category_by_id(db: AsyncSession, category_id: UUID) -> Optional[Category]:
    result = await db.execute(select(Category).where(Category.id == category_id))
    return result.scalar_one_or_none()


async def get_category_by_slug(db: AsyncSession, slug: str) -> Optional[Category]:
    result = await db.execute(select(Category).where(Category.slug == slug))
    return result.scalar_one_or_none()


async def list_categories(db: AsyncSession, active_only: bool = True) -> List[Category]:
    query = select(Category).order_by(Category.display_order, Category.name)
    if active_only:
        query = query.where(Category.is_active == True)
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_category_tree(db: AsyncSession) -> List[dict]:
    """Return categories as a nested tree structure for mega-menu."""
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
    category = await get_category_by_id(db, category_id)
    if not category:
        return False
    category.is_active = False
    await db.commit()
    return True


async def count_categories(db: AsyncSession, active_only: bool = True) -> int:
    query = select(func.count()).select_from(Category)
    if active_only:
        query = query.where(Category.is_active == True)
    result = await db.execute(query)
    return result.scalar() or 0
