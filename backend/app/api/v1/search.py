"""
Global Search API - Searches across multiple entity types
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func

from app.database import get_db
from app.utils.security import get_current_user

router = APIRouter()


class SearchResult(BaseModel):
    """A single search result item with type, title, description, and link."""
    type: str
    title: str
    description: str
    url: str
    score: float = 1.0
    metadata: dict = {}


class SearchResponse(BaseModel):
    """Aggregated search response containing results grouped by category."""
    query: str
    total: int
    results: List[SearchResult]
    categories: dict = {}


@router.get("/search", response_model=SearchResponse)
async def global_search(
    q: str = Query(..., min_length=1, max_length=200, description="Search query"),
    types: Optional[str] = Query(None, description="Comma-separated types: users,courses,notifications"),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Search across multiple entity types.
    Results are filtered by user role permissions.
    """
    query_lower = q.lower().strip()
    allowed_types = types.split(",") if types else ["users", "courses", "notifications"]
    results: List[SearchResult] = []
    categories: dict = {}

    # Search Users (admin/staff only)
    if "users" in allowed_types and current_user.role in ("admin", "staff"):
        try:
            from app.models.user import User
            stmt = (
                select(User)
                .where(
                    or_(
                        func.lower(User.name).contains(query_lower),
                        func.lower(User.email).contains(query_lower),
                    ),
                    User.is_active == True,
                )
                .limit(limit)
            )
            result = await db.execute(stmt)
            users = result.scalars().all()
            user_results = []
            for u in users:
                user_results.append(SearchResult(
                    type="user",
                    title=u.name or u.email,
                    description=f"{u.role.capitalize()} - {u.email}",
                    url=f"/dashboard/admin/users/{u.id}",
                    metadata={"role": u.role, "id": str(u.id)},
                ))
            results.extend(user_results)
            categories["users"] = len(user_results)
        except Exception:
            categories["users"] = 0

    # Search Courses (all roles)
    if "courses" in allowed_types:
        try:
            from app.models.course import Course
            stmt = (
                select(Course)
                .where(
                    or_(
                        func.lower(Course.title).contains(query_lower),
                        func.lower(Course.description).contains(query_lower),
                    )
                )
                .limit(limit)
            )
            result = await db.execute(stmt)
            courses = result.scalars().all()
            course_results = []
            for c in courses:
                course_results.append(SearchResult(
                    type="course",
                    title=c.title,
                    description=c.description[:150] if c.description else "No description",
                    url=f"/courses/{c.id}",
                    metadata={"id": str(c.id)},
                ))
            results.extend(course_results)
            categories["courses"] = len(course_results)
        except Exception:
            categories["courses"] = 0

    # Search Notifications (current user only)
    if "notifications" in allowed_types:
        try:
            from app.models.notification import Notification
            stmt = (
                select(Notification)
                .where(
                    Notification.user_id == current_user.id,
                    or_(
                        func.lower(Notification.title).contains(query_lower),
                        func.lower(Notification.message).contains(query_lower),
                    ),
                )
                .order_by(Notification.created_at.desc())
                .limit(limit)
            )
            result = await db.execute(stmt)
            notifs = result.scalars().all()
            notif_results = []
            for n in notifs:
                role_path = current_user.role or "student"
                notif_results.append(SearchResult(
                    type="notification",
                    title=n.title,
                    description=n.message[:150] if n.message else "",
                    url=f"/dashboard/{role_path}/notifications",
                    metadata={"id": str(n.id), "is_read": n.is_read},
                ))
            results.extend(notif_results)
            categories["notifications"] = len(notif_results)
        except Exception:
            categories["notifications"] = 0

    return SearchResponse(
        query=q,
        total=len(results),
        results=results[:limit],
        categories=categories,
    )
