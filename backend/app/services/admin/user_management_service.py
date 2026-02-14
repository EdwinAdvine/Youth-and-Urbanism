"""
User Management Service - Phase 3 (People & Access)

Provides CRUD operations and business logic for admin user management:
- Paginated user listing with search, filter, and sort
- User detail retrieval with related data
- Activate / deactivate (soft status toggle)
- Bulk actions (deactivate / reactivate multiple users)
- Activity timeline via audit logs
- CSV export
"""

import csv
import io
import logging
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from sqlalchemy import select, func, and_, or_, desc, asc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.admin.audit_log import AuditLog

logger = logging.getLogger(__name__)


def _user_to_dict(user: User) -> Dict[str, Any]:
    """Convert a User model instance to a JSON-serialisable dictionary."""
    return {
        "id": str(user.id),
        "email": user.email,
        "full_name": (user.profile_data or {}).get("full_name", ""),
        "role": user.role,
        "is_active": user.is_active,
        "is_deleted": user.is_deleted,
        "is_verified": user.is_verified,
        "profile_data": user.profile_data or {},
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "updated_at": user.updated_at.isoformat() if user.updated_at else None,
        "last_login": user.last_login.isoformat() if user.last_login else None,
    }


class UserManagementService:
    """Service for admin user management operations."""

    # ------------------------------------------------------------------
    # List users (paginated, searchable, filterable, sortable)
    # ------------------------------------------------------------------
    @staticmethod
    async def list_users(
        db: AsyncSession,
        *,
        page: int = 1,
        page_size: int = 20,
        search: Optional[str] = None,
        role_filter: Optional[str] = None,
        status_filter: Optional[str] = None,
        sort_by: str = "created_at",
        sort_dir: str = "desc",
    ) -> Dict[str, Any]:
        """
        Return a paginated list of users with optional filters.

        Parameters
        ----------
        search : str, optional
            Free-text search across email and profile_data->full_name.
        role_filter : str, optional
            One of 'student', 'parent', 'instructor', 'admin', 'partner', 'staff'.
        status_filter : str, optional
            'active', 'inactive', or 'deleted'.
        sort_by : str
            Column to sort by. Supports 'created_at', 'email', 'role', 'last_login'.
        sort_dir : str
            'asc' or 'desc'.
        """
        query = select(User)
        count_query = select(func.count(User.id))

        conditions: List[Any] = []

        # Exclude permanently deleted by default unless specifically filtering
        if status_filter == "deleted":
            conditions.append(User.is_deleted == True)
        else:
            conditions.append(User.is_deleted == False)

            if status_filter == "active":
                conditions.append(User.is_active == True)
            elif status_filter == "inactive":
                conditions.append(User.is_active == False)

        if role_filter:
            conditions.append(User.role == role_filter)

        if search:
            search_term = f"%{search}%"
            conditions.append(
                or_(
                    User.email.ilike(search_term),
                    User.profile_data["full_name"].astext.ilike(search_term),
                )
            )

        if conditions:
            query = query.where(and_(*conditions))
            count_query = count_query.where(and_(*conditions))

        # Total count
        total_result = await db.execute(count_query)
        total: int = total_result.scalar() or 0

        # Sorting
        sort_column_map = {
            "created_at": User.created_at,
            "email": User.email,
            "role": User.role,
            "last_login": User.last_login,
        }
        sort_col = sort_column_map.get(sort_by, User.created_at)
        order_fn = desc if sort_dir == "desc" else asc
        query = query.order_by(order_fn(sort_col))

        # Pagination
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)

        result = await db.execute(query)
        users = result.scalars().all()

        return {
            "items": [_user_to_dict(u) for u in users],
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": max(1, (total + page_size - 1) // page_size),
        }

    # ------------------------------------------------------------------
    # Get user detail
    # ------------------------------------------------------------------
    @staticmethod
    async def get_user_detail(
        db: AsyncSession,
        user_id: str,
    ) -> Optional[Dict[str, Any]]:
        """Return full user profile by ID, or None if not found."""
        query = select(User).where(User.id == user_id)
        result = await db.execute(query)
        user = result.scalar_one_or_none()

        if user is None:
            return None

        return _user_to_dict(user)

    # ------------------------------------------------------------------
    # Deactivate / Reactivate
    # ------------------------------------------------------------------
    @staticmethod
    async def deactivate_user(
        db: AsyncSession,
        user_id: str,
    ) -> Optional[Dict[str, Any]]:
        """Set is_active = False for the given user."""
        query = select(User).where(and_(User.id == user_id, User.is_deleted == False))
        result = await db.execute(query)
        user = result.scalar_one_or_none()

        if user is None:
            return None

        user.is_active = False
        user.updated_at = datetime.utcnow()
        await db.flush()

        return _user_to_dict(user)

    @staticmethod
    async def reactivate_user(
        db: AsyncSession,
        user_id: str,
    ) -> Optional[Dict[str, Any]]:
        """Set is_active = True for the given user."""
        query = select(User).where(and_(User.id == user_id, User.is_deleted == False))
        result = await db.execute(query)
        user = result.scalar_one_or_none()

        if user is None:
            return None

        user.is_active = True
        user.updated_at = datetime.utcnow()
        await db.flush()

        return _user_to_dict(user)

    # ------------------------------------------------------------------
    # Update user role
    # ------------------------------------------------------------------
    @staticmethod
    async def update_user_role(
        db: AsyncSession,
        user_id: str,
        new_role: str,
    ) -> Optional[Dict[str, Any]]:
        """Change the role for the given user."""
        valid_roles = {"student", "parent", "instructor", "admin", "partner", "staff"}
        if new_role not in valid_roles:
            return None

        query = select(User).where(and_(User.id == user_id, User.is_deleted == False))
        result = await db.execute(query)
        user = result.scalar_one_or_none()

        if user is None:
            return None

        user.role = new_role
        user.updated_at = datetime.utcnow()
        await db.flush()

        return _user_to_dict(user)

    # ------------------------------------------------------------------
    # Activity timeline (from audit logs)
    # ------------------------------------------------------------------
    @staticmethod
    async def get_user_activity(
        db: AsyncSession,
        user_id: str,
        *,
        limit: int = 50,
    ) -> List[Dict[str, Any]]:
        """Return recent audit-log entries for a specific user."""
        query = (
            select(AuditLog)
            .where(AuditLog.actor_id == user_id)
            .order_by(desc(AuditLog.created_at))
            .limit(limit)
        )

        result = await db.execute(query)
        logs = result.scalars().all()

        return [
            {
                "id": str(log.id),
                "action": log.action,
                "resource_type": log.resource_type,
                "resource_id": str(log.resource_id) if log.resource_id else None,
                "details": log.details,
                "ip_address": log.ip_address,
                "status": log.status,
                "created_at": log.created_at.isoformat() if log.created_at else None,
            }
            for log in logs
        ]

    # ------------------------------------------------------------------
    # Bulk actions
    # ------------------------------------------------------------------
    @staticmethod
    async def bulk_action(
        db: AsyncSession,
        user_ids: List[str],
        action: str,
    ) -> Dict[str, Any]:
        """
        Perform a bulk action on multiple users.

        Supported actions: 'deactivate', 'reactivate'.
        """
        if action not in ("deactivate", "reactivate"):
            return {"success": False, "message": f"Unknown action: {action}", "affected": 0}

        query = select(User).where(
            and_(
                User.id.in_(user_ids),
                User.is_deleted == False,
            )
        )
        result = await db.execute(query)
        users = result.scalars().all()

        affected = 0
        for user in users:
            if action == "deactivate" and user.is_active:
                user.is_active = False
                user.updated_at = datetime.utcnow()
                affected += 1
            elif action == "reactivate" and not user.is_active:
                user.is_active = True
                user.updated_at = datetime.utcnow()
                affected += 1

        await db.flush()

        return {
            "success": True,
            "action": action,
            "affected": affected,
            "total_requested": len(user_ids),
        }

    # ------------------------------------------------------------------
    # Export users to CSV
    # ------------------------------------------------------------------
    @staticmethod
    async def export_users(
        db: AsyncSession,
        *,
        role_filter: Optional[str] = None,
        status_filter: Optional[str] = None,
        search: Optional[str] = None,
        format: str = "csv",
    ) -> str:
        """Generate a CSV string of users matching the given filters."""
        query = select(User).where(User.is_deleted == False)
        conditions: List[Any] = [User.is_deleted == False]

        if role_filter:
            conditions.append(User.role == role_filter)
        if status_filter == "active":
            conditions.append(User.is_active == True)
        elif status_filter == "inactive":
            conditions.append(User.is_active == False)
        if search:
            search_term = f"%{search}%"
            conditions.append(
                or_(
                    User.email.ilike(search_term),
                    User.profile_data["full_name"].astext.ilike(search_term),
                )
            )

        query = select(User).where(and_(*conditions)).order_by(desc(User.created_at)).limit(10000)

        result = await db.execute(query)
        users = result.scalars().all()

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "ID", "Email", "Full Name", "Role", "Active", "Verified",
            "Created At", "Last Login",
        ])

        for user in users:
            writer.writerow([
                str(user.id),
                user.email,
                (user.profile_data or {}).get("full_name", ""),
                user.role,
                "Yes" if user.is_active else "No",
                "Yes" if user.is_verified else "No",
                user.created_at.isoformat() if user.created_at else "",
                user.last_login.isoformat() if user.last_login else "",
            ])

        return output.getvalue()


# Singleton instance
user_management_service = UserManagementService()
