"""
Audit Log Service

Provides search, export, and manual logging capabilities for the audit system.
"""

import csv
import io
import uuid
import logging
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any

from sqlalchemy import select, func, and_, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.admin.audit_log import AuditLog

logger = logging.getLogger(__name__)


class AuditService:
    """Service for querying and managing audit logs."""

    @staticmethod
    async def log_action(
        db: AsyncSession,
        *,
        actor_id: Optional[str],
        actor_email: str,
        actor_role: str,
        action: str,
        resource_type: str,
        resource_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        ip_address: str = "system",
        user_agent: str = "system",
        status: str = "success",
    ) -> AuditLog:
        """Manually log an audit action (for use outside middleware)."""
        entry = AuditLog(
            actor_id=actor_id,
            actor_email=actor_email,
            actor_role=actor_role,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            details=details or {},
            ip_address=ip_address,
            user_agent=user_agent,
            status=status,
        )
        db.add(entry)
        await db.commit()
        await db.refresh(entry)
        return entry

    @staticmethod
    async def search_logs(
        db: AsyncSession,
        *,
        actor_id: Optional[str] = None,
        actor_email: Optional[str] = None,
        action: Optional[str] = None,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        status: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        search: Optional[str] = None,
        page: int = 1,
        page_size: int = 50,
    ) -> Dict[str, Any]:
        """Search audit logs with filtering and pagination."""
        query = select(AuditLog)
        count_query = select(func.count(AuditLog.id))

        conditions = []

        if actor_id:
            conditions.append(AuditLog.actor_id == actor_id)
        if actor_email:
            conditions.append(AuditLog.actor_email.ilike(f"%{actor_email}%"))
        if action:
            conditions.append(AuditLog.action.ilike(f"%{action}%"))
        if resource_type:
            conditions.append(AuditLog.resource_type == resource_type)
        if resource_id:
            conditions.append(AuditLog.resource_id == resource_id)
        if status:
            conditions.append(AuditLog.status == status)
        if date_from:
            conditions.append(AuditLog.created_at >= date_from)
        if date_to:
            conditions.append(AuditLog.created_at <= date_to)
        if search:
            conditions.append(
                AuditLog.actor_email.ilike(f"%{search}%")
                | AuditLog.action.ilike(f"%{search}%")
                | AuditLog.resource_type.ilike(f"%{search}%")
            )

        if conditions:
            query = query.where(and_(*conditions))
            count_query = count_query.where(and_(*conditions))

        # Get total count
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        # Apply pagination and ordering
        offset = (page - 1) * page_size
        query = query.order_by(desc(AuditLog.created_at)).offset(offset).limit(page_size)

        result = await db.execute(query)
        logs = result.scalars().all()

        return {
            "items": [_log_to_dict(log) for log in logs],
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size,
        }

    @staticmethod
    async def get_user_activity_timeline(
        db: AsyncSession,
        user_id: str,
        *,
        days: int = 30,
        limit: int = 100,
    ) -> List[Dict[str, Any]]:
        """Get activity timeline for a specific user."""
        since = datetime.utcnow() - timedelta(days=days)

        query = (
            select(AuditLog)
            .where(
                and_(
                    AuditLog.actor_id == user_id,
                    AuditLog.created_at >= since,
                )
            )
            .order_by(desc(AuditLog.created_at))
            .limit(limit)
        )

        result = await db.execute(query)
        logs = result.scalars().all()

        return [_log_to_dict(log) for log in logs]

    @staticmethod
    async def get_action_summary(
        db: AsyncSession,
        *,
        days: int = 7,
    ) -> List[Dict[str, Any]]:
        """Get summary of actions grouped by action type over a period."""
        since = datetime.utcnow() - timedelta(days=days)

        query = (
            select(
                AuditLog.action,
                func.count(AuditLog.id).label("count"),
                func.count(func.nullif(AuditLog.status, "success")).label("failures"),
            )
            .where(AuditLog.created_at >= since)
            .group_by(AuditLog.action)
            .order_by(desc(func.count(AuditLog.id)))
        )

        result = await db.execute(query)
        rows = result.all()

        return [
            {
                "action": row.action,
                "count": row.count,
                "failures": row.failures,
            }
            for row in rows
        ]

    @staticmethod
    async def export_logs_csv(
        db: AsyncSession,
        *,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        resource_type: Optional[str] = None,
    ) -> str:
        """Export audit logs to CSV format."""
        query = select(AuditLog)
        conditions = []

        if date_from:
            conditions.append(AuditLog.created_at >= date_from)
        if date_to:
            conditions.append(AuditLog.created_at <= date_to)
        if resource_type:
            conditions.append(AuditLog.resource_type == resource_type)

        if conditions:
            query = query.where(and_(*conditions))

        query = query.order_by(desc(AuditLog.created_at)).limit(10000)

        result = await db.execute(query)
        logs = result.scalars().all()

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "Timestamp", "Actor Email", "Actor Role", "Action",
            "Resource Type", "Resource ID", "Status", "IP Address",
        ])

        for log in logs:
            writer.writerow([
                log.created_at.isoformat() if log.created_at else "",
                log.actor_email,
                log.actor_role,
                log.action,
                log.resource_type,
                log.resource_id or "",
                log.status,
                log.ip_address,
            ])

        return output.getvalue()


def _log_to_dict(log: AuditLog) -> Dict[str, Any]:
    """Convert an AuditLog model to a dictionary."""
    return {
        "id": str(log.id),
        "actor_id": str(log.actor_id) if log.actor_id else None,
        "actor_email": log.actor_email,
        "actor_role": log.actor_role,
        "action": log.action,
        "resource_type": log.resource_type,
        "resource_id": str(log.resource_id) if log.resource_id else None,
        "details": log.details,
        "ip_address": log.ip_address,
        "user_agent": log.user_agent,
        "status": log.status,
        "created_at": log.created_at.isoformat() if log.created_at else None,
    }


# Singleton
audit_service = AuditService()
