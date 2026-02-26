"""
Content Studio Service

Content authoring lifecycle: creation, editing, version snapshots,
publishing workflow, and version rollback.
"""

import logging
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.staff.content_item import (
    StaffContentItem,
    StaffContentVersion,
)

logger = logging.getLogger(__name__)


class ContentStudioService:
    """Facade exposing content studio functions as static methods."""

    @staticmethod
    async def list_items(db, *, page=1, page_size=20, status_filter=None, content_type=None, author=None):
        filters = {}
        if status_filter: filters["status"] = status_filter
        if content_type: filters["content_type"] = content_type
        if author: filters["author_id"] = author
        return await list_content(db, filters=filters, page=page, page_size=page_size)

    @staticmethod
    async def get_item(db, *, content_id):
        return await get_content(db, content_id=content_id)

    @staticmethod
    async def create_item(db, *, author_id, title, body, content_type, grade_level=None, subject=None, tags=None, metadata=None):
        content_data = {"title": title, "content_type": content_type, "body": body, "grade_levels": [grade_level] if grade_level else [], "learning_area": subject, "cbc_tags": tags or []}
        return await create_content(db, author_id=author_id, content_data=content_data)

    @staticmethod
    async def update_item(db, *, content_id, editor_id, updates):
        updates["updated_by"] = editor_id
        return await update_content(db, content_id=content_id, update_data=updates)

    @staticmethod
    async def publish_item(db, *, content_id, publisher_id):
        return await publish_content(db, content_id=content_id, publisher_id=publisher_id)

    @staticmethod
    async def get_versions(db, *, content_id):
        return await get_version_history(db, content_id=content_id)

    @staticmethod
    async def rollback_to_version(db, *, content_id, version_number, editor_id=None):
        return await rollback_version(db, content_id=content_id, version_number=version_number)

    @staticmethod
    async def start_collab_session(db, *, content_id, user_id):
        import uuid as _uuid
        return {"session_id": str(_uuid.uuid4()), "content_id": content_id, "user_id": user_id, "ws_url": f"/ws/collab/{content_id}"}


async def list_content(
    db: AsyncSession,
    filters: Optional[Dict[str, Any]] = None,
    page: int = 1,
    page_size: int = 20,
) -> Dict[str, Any]:
    """Return a paginated list of content items with optional filters."""
    try:
        filters = filters or {}
        conditions = []

        if filters.get("status"):
            conditions.append(StaffContentItem.status == filters["status"])
        if filters.get("content_type"):
            conditions.append(StaffContentItem.content_type == filters["content_type"])
        if filters.get("author_id"):
            conditions.append(StaffContentItem.author_id == filters["author_id"])
        if filters.get("course_id"):
            conditions.append(StaffContentItem.course_id == filters["course_id"])
        if filters.get("learning_area"):
            conditions.append(StaffContentItem.learning_area == filters["learning_area"])
        if filters.get("search"):
            conditions.append(
                StaffContentItem.title.ilike(f"%{filters['search']}%")
            )

        where_clause = and_(*conditions) if conditions else True

        # Total count
        total_q = select(func.count(StaffContentItem.id)).where(where_clause)
        total_result = await db.execute(total_q)
        total: int = total_result.scalar() or 0

        # Paginated items
        offset = (page - 1) * page_size
        items_q = (
            select(StaffContentItem)
            .where(where_clause)
            .order_by(StaffContentItem.updated_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        items_result = await db.execute(items_q)
        items = items_result.scalars().all()

        item_list = [
            {
                "id": str(c.id),
                "title": c.title,
                "content_type": c.content_type,
                "status": c.status,
                "author_id": str(c.author_id),
                "course_id": str(c.course_id) if c.course_id else None,
                "grade_levels": c.grade_levels or [],
                "learning_area": c.learning_area,
                "cbc_tags": c.cbc_tags or [],
                "version": c.version,
                "published_at": c.published_at.isoformat() if c.published_at else None,
                "created_at": c.created_at.isoformat(),
                "updated_at": c.updated_at.isoformat() if c.updated_at else None,
            }
            for c in items
        ]

        return {
            "items": item_list,
            "total": total,
            "page": page,
            "page_size": page_size,
        }

    except Exception as e:
        logger.error(f"Error listing content: {e}")
        raise


async def get_content(db: AsyncSession, content_id: str) -> Optional[Dict[str, Any]]:
    """Return a single content item with its version history."""
    try:
        q = select(StaffContentItem).where(StaffContentItem.id == content_id)
        result = await db.execute(q)
        c = result.scalar_one_or_none()

        if not c:
            return None

        # Fetch version history
        versions_q = (
            select(StaffContentVersion)
            .where(StaffContentVersion.content_id == content_id)
            .order_by(StaffContentVersion.version_number.desc())
            .limit(20)
        )
        versions_result = await db.execute(versions_q)
        versions = [
            {
                "id": str(v.id),
                "version_number": v.version_number,
                "changes_summary": v.changes_summary,
                "created_by": str(v.created_by) if v.created_by else None,
                "created_at": v.created_at.isoformat(),
            }
            for v in versions_result.scalars().all()
        ]

        return {
            "id": str(c.id),
            "title": c.title,
            "content_type": c.content_type,
            "body": c.body,
            "body_json": c.body_json,
            "status": c.status,
            "author_id": str(c.author_id),
            "reviewer_id": str(c.reviewer_id) if c.reviewer_id else None,
            "course_id": str(c.course_id) if c.course_id else None,
            "grade_levels": c.grade_levels or [],
            "learning_area": c.learning_area,
            "cbc_tags": c.cbc_tags or [],
            "version": c.version,
            "metadata": c.metadata or {},
            "version_history": versions,
            "published_at": c.published_at.isoformat() if c.published_at else None,
            "created_at": c.created_at.isoformat(),
            "updated_at": c.updated_at.isoformat() if c.updated_at else None,
        }

    except Exception as e:
        logger.error(f"Error fetching content {content_id}: {e}")
        raise


async def create_content(
    db: AsyncSession,
    author_id: str,
    content_data: Dict[str, Any],
) -> Dict[str, Any]:
    """Create a new draft content item."""
    try:
        content = StaffContentItem(
            id=uuid.uuid4(),
            title=content_data["title"],
            content_type=content_data["content_type"],
            body=content_data.get("body"),
            body_json=content_data.get("body_json"),
            author_id=author_id,
            status="draft",
            course_id=content_data.get("course_id"),
            grade_levels=content_data.get("grade_levels", []),
            learning_area=content_data.get("learning_area"),
            cbc_tags=content_data.get("cbc_tags", []),
            version=1,
        )
        db.add(content)

        # Create initial version snapshot
        version = StaffContentVersion(
            id=uuid.uuid4(),
            content_id=content.id,
            version_number=1,
            body_snapshot={
                "body": content_data.get("body"),
                "body_json": content_data.get("body_json"),
                "title": content_data["title"],
            },
            changes_summary="Initial creation",
            created_by=author_id,
        )
        db.add(version)

        await db.flush()

        logger.info(f"Content created: '{content.title}' by {author_id}")

        return {
            "id": str(content.id),
            "title": content.title,
            "content_type": content.content_type,
            "status": content.status,
            "version": content.version,
            "created_at": content.created_at.isoformat(),
        }

    except Exception as e:
        logger.error(f"Error creating content: {e}")
        raise


async def update_content(
    db: AsyncSession,
    content_id: str,
    update_data: Dict[str, Any],
) -> Optional[Dict[str, Any]]:
    """
    Update a content item and save a version snapshot of the changes.
    """
    try:
        q = select(StaffContentItem).where(StaffContentItem.id == content_id)
        result = await db.execute(q)
        content = result.scalar_one_or_none()

        if not content:
            return None

        # Track changes for summary
        changed_fields = []
        for key, value in update_data.items():
            if value is not None and hasattr(content, key):
                old_value = getattr(content, key)
                if old_value != value:
                    changed_fields.append(key)
                    setattr(content, key, value)

        if not changed_fields:
            return {
                "id": str(content.id),
                "title": content.title,
                "version": content.version,
                "message": "No changes detected",
            }

        # Increment version and save snapshot
        content.version += 1
        content.updated_at = datetime.utcnow()

        version = StaffContentVersion(
            id=uuid.uuid4(),
            content_id=content.id,
            version_number=content.version,
            body_snapshot={
                "body": content.body,
                "body_json": content.body_json,
                "title": content.title,
            },
            changes_summary=f"Updated: {', '.join(changed_fields)}",
            created_by=update_data.get("updated_by"),
        )
        db.add(version)

        await db.flush()

        logger.info(f"Content {content_id} updated to version {content.version}")

        return {
            "id": str(content.id),
            "title": content.title,
            "status": content.status,
            "version": content.version,
            "changed_fields": changed_fields,
            "updated_at": content.updated_at.isoformat(),
        }

    except Exception as e:
        logger.error(f"Error updating content {content_id}: {e}")
        raise


async def publish_content(
    db: AsyncSession,
    content_id: str,
    publisher_id: str,
) -> Optional[Dict[str, Any]]:
    """Transition content from draft/in_review to published."""
    try:
        q = select(StaffContentItem).where(StaffContentItem.id == content_id)
        result = await db.execute(q)
        content = result.scalar_one_or_none()

        if not content:
            return None

        if content.status not in ("draft", "in_review", "approved"):
            return {
                "error": f"Cannot publish content in '{content.status}' status",
                "id": str(content.id),
            }

        now = datetime.utcnow()
        content.status = "published"
        content.published_at = now
        content.reviewer_id = publisher_id
        content.updated_at = now

        # Save publish version snapshot
        content.version += 1
        version = StaffContentVersion(
            id=uuid.uuid4(),
            content_id=content.id,
            version_number=content.version,
            body_snapshot={
                "body": content.body,
                "body_json": content.body_json,
                "title": content.title,
            },
            changes_summary="Published",
            created_by=publisher_id,
        )
        db.add(version)

        await db.flush()

        logger.info(f"Content {content_id} published by {publisher_id}")

        return {
            "id": str(content.id),
            "title": content.title,
            "status": "published",
            "version": content.version,
            "published_at": now.isoformat(),
        }

    except Exception as e:
        logger.error(f"Error publishing content {content_id}: {e}")
        raise


async def get_version_history(
    db: AsyncSession,
    content_id: str,
) -> List[Dict[str, Any]]:
    """Return all versions for a content item."""
    try:
        q = (
            select(StaffContentVersion)
            .where(StaffContentVersion.content_id == content_id)
            .order_by(StaffContentVersion.version_number.desc())
        )
        result = await db.execute(q)
        versions = result.scalars().all()

        return [
            {
                "id": str(v.id),
                "version_number": v.version_number,
                "changes_summary": v.changes_summary,
                "created_by": str(v.created_by) if v.created_by else None,
                "created_at": v.created_at.isoformat(),
            }
            for v in versions
        ]

    except Exception as e:
        logger.error(f"Error fetching version history for content {content_id}: {e}")
        raise


async def rollback_version(
    db: AsyncSession,
    content_id: str,
    version_number: int,
) -> Optional[Dict[str, Any]]:
    """Restore a content item to a previous version."""
    try:
        # Find the target version
        version_q = select(StaffContentVersion).where(
            and_(
                StaffContentVersion.content_id == content_id,
                StaffContentVersion.version_number == version_number,
            )
        )
        version_result = await db.execute(version_q)
        target_version = version_result.scalar_one_or_none()

        if not target_version:
            return None

        # Load the content item
        content_q = select(StaffContentItem).where(StaffContentItem.id == content_id)
        content_result = await db.execute(content_q)
        content = content_result.scalar_one_or_none()

        if not content:
            return None

        # Restore from snapshot
        snapshot = target_version.body_snapshot or {}
        content.body = snapshot.get("body")
        content.body_json = snapshot.get("body_json")
        content.title = snapshot.get("title", content.title)
        content.version += 1
        content.updated_at = datetime.utcnow()

        # Record rollback as a new version
        rollback_v = StaffContentVersion(
            id=uuid.uuid4(),
            content_id=content.id,
            version_number=content.version,
            body_snapshot=snapshot,
            changes_summary=f"Rolled back to version {version_number}",
            created_by=None,
        )
        db.add(rollback_v)

        await db.flush()

        logger.info(
            f"Content {content_id} rolled back to version {version_number} "
            f"(now version {content.version})"
        )

        return {
            "id": str(content.id),
            "title": content.title,
            "version": content.version,
            "rolled_back_from": version_number,
            "updated_at": content.updated_at.isoformat(),
        }

    except Exception as e:
        logger.error(f"Error rolling back content {content_id}: {e}")
        raise
