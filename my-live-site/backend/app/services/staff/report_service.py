"""
Report Service

Bridge module that wraps the report_builder_service functions in a class-based
interface expected by the API route layer (reports.py).

Each static method translates the keyword-argument call signature used by
the route into the dict-based signatures of the underlying builder functions.
"""

import logging
from typing import Any, Dict, List, Optional

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.staff import report_builder_service as builder
from app.models.staff.custom_report import ReportSchedule

logger = logging.getLogger(__name__)


class ReportService:
    """Static facade over report_builder_service functions."""

    # ------------------------------------------------------------------
    # Reports
    # ------------------------------------------------------------------

    @staticmethod
    async def list_reports(
        db: AsyncSession,
        *,
        page: int = 1,
        page_size: int = 20,
        report_type: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Paginated list of reports.

        The underlying builder.list_reports requires a user_id for ownership
        filtering. Since the route does not pass a user_id, we use a
        permissive query (staff/admin callers see all reports).
        """
        # The underlying function requires user_id; pass a sentinel that
        # matches the broadest set. In a future iteration this can be
        # refined to pass the actual caller's id for ownership scoping.
        # For now, we do a lightweight direct query when report_type is
        # provided, or delegate when it is not.
        #
        # To keep things simple and avoid modifying the underlying function,
        # we perform a direct query here that mirrors the builder logic but
        # without the user_id ownership filter (staff/admin see everything).

        from sqlalchemy import and_
        from app.models.staff.custom_report import ReportDefinition

        try:
            conditions = []
            if report_type:
                conditions.append(ReportDefinition.report_type == report_type)

            where_clause = and_(*conditions) if conditions else True

            total_q = select(func.count(ReportDefinition.id)).where(where_clause)
            total_result = await db.execute(total_q)
            total: int = total_result.scalar() or 0

            offset = (page - 1) * page_size
            items_q = (
                select(ReportDefinition)
                .where(where_clause)
                .order_by(ReportDefinition.updated_at.desc())
                .offset(offset)
                .limit(page_size)
            )
            items_result = await db.execute(items_q)
            reports = items_result.scalars().all()

            item_list = [
                {
                    "id": str(r.id),
                    "name": r.name,
                    "description": r.description,
                    "report_type": r.report_type,
                    "config": r.config,
                    "filters": r.filters or {},
                    "created_by": str(r.created_by),
                    "is_template": r.is_template,
                    "is_shared": r.is_shared,
                    "created_at": r.created_at.isoformat(),
                    "updated_at": r.updated_at.isoformat() if r.updated_at else None,
                }
                for r in reports
            ]

            return {
                "items": item_list,
                "total": total,
                "page": page,
                "page_size": page_size,
            }

        except Exception as exc:
            logger.error("Error listing reports: %s", exc)
            raise

    @staticmethod
    async def get_report(
        db: AsyncSession,
        *,
        report_id: str,
    ) -> Optional[Dict[str, Any]]:
        """Retrieve a single report definition with its schedules."""
        return await builder.get_report(db, report_id=report_id)

    @staticmethod
    async def create_report(
        db: AsyncSession,
        *,
        creator_id: str,
        name: str,
        description: Optional[str] = None,
        report_type: str = "custom",
        filters: Optional[Dict[str, Any]] = None,
        columns: Optional[List[str]] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Create a new report definition."""
        report_data: Dict[str, Any] = {
            "name": name,
            "report_type": report_type,
        }
        if description is not None:
            report_data["description"] = description
        if filters is not None:
            report_data["filters"] = filters

        # Store columns and metadata inside the config blob
        config: Dict[str, Any] = {}
        if columns is not None:
            config["columns"] = columns
        if metadata is not None:
            config.update(metadata)
        if config:
            report_data["config"] = config

        return await builder.create_report(
            db, user_id=creator_id, report_data=report_data
        )

    @staticmethod
    async def update_report(
        db: AsyncSession,
        *,
        report_id: str,
        updates: Dict[str, Any],
    ) -> Optional[Dict[str, Any]]:
        """Update an existing report definition."""
        return await builder.update_report(
            db, report_id=report_id, data=updates
        )

    @staticmethod
    async def delete_report(
        db: AsyncSession,
        *,
        report_id: str,
    ) -> bool:
        """Delete a report definition and its schedules."""
        return await builder.delete_report(db, report_id=report_id)

    # ------------------------------------------------------------------
    # Export
    # ------------------------------------------------------------------

    @staticmethod
    async def export_report(
        db: AsyncSession,
        *,
        report_id: str,
        requester_id: str,
        export_format: str = "csv",
        date_from: Optional[str] = None,
        date_to: Optional[str] = None,
        filters: Optional[Dict[str, Any]] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Export a report in the specified format.

        Delegates to builder.export_report, passing date range and extra
        filters through the filters dict.
        """
        merged_filters: Dict[str, Any] = dict(filters or {})
        if date_from:
            merged_filters["date_from"] = date_from
        if date_to:
            merged_filters["date_to"] = date_to

        result = await builder.export_report(
            db,
            report_id=report_id,
            format=export_format,
            filters=merged_filters if merged_filters else None,
        )

        if result and result.get("error"):
            return None

        # Attach requester info for audit trail
        if result:
            result["requested_by"] = requester_id

        return result

    # ------------------------------------------------------------------
    # Schedules
    # ------------------------------------------------------------------

    @staticmethod
    async def list_schedules(
        db: AsyncSession,
        *,
        page: int = 1,
        page_size: int = 20,
    ) -> Dict[str, Any]:
        """
        Paginated list of report schedules.

        Stub -- the report_builder_service does not expose a list_schedules
        function, so we query directly.
        """
        try:
            total_q = select(func.count(ReportSchedule.id))
            total_result = await db.execute(total_q)
            total: int = total_result.scalar() or 0

            offset = (page - 1) * page_size
            items_q = (
                select(ReportSchedule)
                .order_by(ReportSchedule.created_at.desc())
                .offset(offset)
                .limit(page_size)
            )
            items_result = await db.execute(items_q)
            schedules = items_result.scalars().all()

            item_list = [
                {
                    "id": str(s.id),
                    "report_id": str(s.report_id),
                    "schedule_cron": s.schedule_cron,
                    "format": s.format,
                    "recipients": s.recipients,
                    "is_active": s.is_active,
                    "last_run_at": s.last_run_at.isoformat() if s.last_run_at else None,
                    "next_run_at": s.next_run_at.isoformat() if s.next_run_at else None,
                    "created_at": s.created_at.isoformat(),
                }
                for s in schedules
            ]

            return {
                "items": item_list,
                "total": total,
                "page": page,
                "page_size": page_size,
            }

        except Exception as exc:
            logger.error("Error listing report schedules: %s", exc)
            raise

    @staticmethod
    async def create_schedule(
        db: AsyncSession,
        *,
        creator_id: str,
        report_id: str,
        frequency: str,
        delivery_method: str,
        recipients: Optional[List[str]] = None,
        export_format: str = "pdf",
        is_active: bool = True,
    ) -> Dict[str, Any]:
        """Create a new report schedule."""
        # Map the route's frequency value to a cron expression
        cron_map = {
            "daily": "0 6 * * *",
            "weekly": "0 6 * * 1",
            "monthly": "0 6 1 * *",
        }
        schedule_cron = cron_map.get(frequency, frequency)

        schedule_data: Dict[str, Any] = {
            "report_id": report_id,
            "schedule_cron": schedule_cron,
            "format": export_format,
            "recipients": [{"email": r} for r in (recipients or [])],
            "is_active": is_active,
            "created_by": creator_id,
        }

        result = await builder.create_schedule(db, schedule_data=schedule_data)

        # Attach delivery_method for informational purposes
        result["delivery_method"] = delivery_method
        return result

    @staticmethod
    async def update_schedule(
        db: AsyncSession,
        *,
        schedule_id: str,
        updates: Dict[str, Any],
    ) -> Optional[Dict[str, Any]]:
        """Update an existing report schedule."""
        # Translate route-facing fields to builder-facing fields
        builder_data: Dict[str, Any] = {}

        if "frequency" in updates:
            cron_map = {
                "daily": "0 6 * * *",
                "weekly": "0 6 * * 1",
                "monthly": "0 6 1 * *",
            }
            builder_data["schedule_cron"] = cron_map.get(
                updates["frequency"], updates["frequency"]
            )

        if "export_format" in updates:
            builder_data["format"] = updates["export_format"]

        if "recipients" in updates:
            builder_data["recipients"] = [
                {"email": r} for r in (updates["recipients"] or [])
            ]

        if "is_active" in updates:
            builder_data["is_active"] = updates["is_active"]

        return await builder.update_schedule(
            db, schedule_id=schedule_id, data=builder_data
        )

    @staticmethod
    async def delete_schedule(
        db: AsyncSession,
        *,
        schedule_id: str,
    ) -> bool:
        """
        Delete a report schedule.

        Stub -- the report_builder_service does not expose a delete_schedule
        function, so we perform a direct delete.
        """
        try:
            q = select(ReportSchedule).where(ReportSchedule.id == schedule_id)
            result = await db.execute(q)
            schedule = result.scalar_one_or_none()

            if not schedule:
                return False

            await db.delete(schedule)
            await db.flush()

            logger.info("Schedule %s deleted via report service", schedule_id)
            return True

        except Exception as exc:
            logger.error("Error deleting schedule %s: %s", schedule_id, exc)
            raise
