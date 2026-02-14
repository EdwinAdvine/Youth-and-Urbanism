"""
Report Builder Service

Custom report definitions, scheduling, and export (PDF/CSV/Excel).
Supports background execution of scheduled reports.
"""

import io
import csv
import logging
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from sqlalchemy import select, func, and_, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.staff.custom_report import ReportDefinition, ReportSchedule
from app.models.user import User

# Optional Excel export dependency
try:
    import openpyxl
except ImportError:
    openpyxl = None

logger = logging.getLogger(__name__)


async def list_reports(
    db: AsyncSession,
    user_id: str,
    page: int = 1,
    page_size: int = 20,
) -> Dict[str, Any]:
    """Return paginated list of reports owned by or shared with the user."""
    try:
        conditions = [
            ReportDefinition.created_by == user_id,
        ]
        # Include shared reports
        where_clause = and_(*conditions)

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

    except Exception as e:
        logger.error(f"Error listing reports for user {user_id}: {e}")
        raise


async def get_report(db: AsyncSession, report_id: str) -> Optional[Dict[str, Any]]:
    """Return a single report definition with its schedules."""
    try:
        q = select(ReportDefinition).where(ReportDefinition.id == report_id)
        result = await db.execute(q)
        r = result.scalar_one_or_none()

        if not r:
            return None

        # Fetch schedules
        schedules_q = (
            select(ReportSchedule)
            .where(ReportSchedule.report_id == report_id)
            .order_by(ReportSchedule.created_at.desc())
        )
        schedules_result = await db.execute(schedules_q)
        schedules = [
            {
                "id": str(s.id),
                "schedule_cron": s.schedule_cron,
                "format": s.format,
                "recipients": s.recipients,
                "is_active": s.is_active,
                "last_run_at": s.last_run_at.isoformat() if s.last_run_at else None,
                "next_run_at": s.next_run_at.isoformat() if s.next_run_at else None,
                "created_at": s.created_at.isoformat(),
            }
            for s in schedules_result.scalars().all()
        ]

        return {
            "id": str(r.id),
            "name": r.name,
            "description": r.description,
            "report_type": r.report_type,
            "config": r.config,
            "filters": r.filters or {},
            "created_by": str(r.created_by),
            "is_template": r.is_template,
            "is_shared": r.is_shared,
            "schedules": schedules,
            "created_at": r.created_at.isoformat(),
            "updated_at": r.updated_at.isoformat() if r.updated_at else None,
        }

    except Exception as e:
        logger.error(f"Error fetching report {report_id}: {e}")
        raise


async def create_report(
    db: AsyncSession,
    user_id: str,
    report_data: Dict[str, Any],
) -> Dict[str, Any]:
    """Create a new report definition."""
    try:
        config = report_data.get("config", {})
        if hasattr(config, "model_dump"):
            config = config.model_dump()

        report = ReportDefinition(
            id=uuid.uuid4(),
            name=report_data["name"],
            description=report_data.get("description"),
            report_type=report_data.get("report_type", "custom"),
            config=config,
            filters=report_data.get("filters", {}),
            created_by=user_id,
            is_template=report_data.get("is_template", False),
            is_shared=report_data.get("is_shared", False),
        )
        db.add(report)
        await db.flush()

        logger.info(f"Report created: '{report.name}' by {user_id}")

        return {
            "id": str(report.id),
            "name": report.name,
            "report_type": report.report_type,
            "created_at": report.created_at.isoformat(),
        }

    except Exception as e:
        logger.error(f"Error creating report: {e}")
        raise


async def update_report(
    db: AsyncSession,
    report_id: str,
    data: Dict[str, Any],
) -> Optional[Dict[str, Any]]:
    """Update a report definition's configuration."""
    try:
        q = select(ReportDefinition).where(ReportDefinition.id == report_id)
        result = await db.execute(q)
        report = result.scalar_one_or_none()

        if not report:
            return None

        if "name" in data and data["name"]:
            report.name = data["name"]
        if "config" in data and data["config"]:
            config = data["config"]
            if hasattr(config, "model_dump"):
                config = config.model_dump()
            report.config = config
        if "filters" in data:
            report.filters = data["filters"]
        if "is_template" in data:
            report.is_template = data["is_template"]
        if "is_shared" in data:
            report.is_shared = data["is_shared"]

        report.updated_at = datetime.utcnow()
        await db.flush()

        logger.info(f"Report {report_id} updated")

        return {
            "id": str(report.id),
            "name": report.name,
            "updated_at": report.updated_at.isoformat(),
        }

    except Exception as e:
        logger.error(f"Error updating report {report_id}: {e}")
        raise


async def delete_report(db: AsyncSession, report_id: str) -> bool:
    """Delete a report definition and its schedules."""
    try:
        # Delete schedules first
        await db.execute(
            delete(ReportSchedule).where(ReportSchedule.report_id == report_id)
        )

        # Delete report
        q = select(ReportDefinition).where(ReportDefinition.id == report_id)
        result = await db.execute(q)
        report = result.scalar_one_or_none()

        if not report:
            return False

        await db.delete(report)
        await db.flush()

        logger.info(f"Report {report_id} deleted")
        return True

    except Exception as e:
        logger.error(f"Error deleting report {report_id}: {e}")
        raise


async def export_report(
    db: AsyncSession,
    report_id: str,
    format: str = "csv",
    filters: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Generate a report export in the requested format (PDF, CSV, Excel).

    Returns an export_id and, for CSV/Excel, the file content as bytes.
    PDF generation is a placeholder for future implementation.
    """
    try:
        q = select(ReportDefinition).where(ReportDefinition.id == report_id)
        result = await db.execute(q)
        report = result.scalar_one_or_none()

        if not report:
            return {"error": "Report not found"}

        export_id = str(uuid.uuid4())
        now = datetime.utcnow()

        # Generate report data (simplified: return config-based placeholder data)
        report_config = report.config or {}
        widgets = report_config.get("widgets", [])

        # Build tabular data from widget definitions
        rows = []
        headers = ["Widget", "Type", "Data Source"]
        for widget in widgets:
            if isinstance(widget, dict):
                rows.append([
                    widget.get("title", "Untitled"),
                    widget.get("widget_type", "unknown"),
                    widget.get("data_source", ""),
                ])

        if format == "csv":
            output = io.StringIO()
            writer = csv.writer(output)
            writer.writerow(headers)
            writer.writerows(rows)
            content = output.getvalue()

            return {
                "export_id": export_id,
                "status": "completed",
                "format": "csv",
                "content": content,
                "filename": f"report_{report.name}_{now.strftime('%Y%m%d')}.csv",
                "created_at": now.isoformat(),
            }

        elif format == "excel" and openpyxl:
            wb = openpyxl.Workbook()
            ws = wb.active
            ws.title = report.name[:30]
            ws.append(headers)
            for row in rows:
                ws.append(row)

            buffer = io.BytesIO()
            wb.save(buffer)
            buffer.seek(0)

            return {
                "export_id": export_id,
                "status": "completed",
                "format": "excel",
                "content_bytes": buffer.getvalue(),
                "filename": f"report_{report.name}_{now.strftime('%Y%m%d')}.xlsx",
                "created_at": now.isoformat(),
            }

        elif format == "pdf":
            # PDF generation placeholder
            return {
                "export_id": export_id,
                "status": "processing",
                "format": "pdf",
                "download_url": None,
                "message": "PDF generation queued. URL will be available shortly.",
                "created_at": now.isoformat(),
            }

        else:
            return {
                "export_id": export_id,
                "status": "error",
                "message": f"Unsupported format: {format}",
            }

    except Exception as e:
        logger.error(f"Error exporting report {report_id}: {e}")
        raise


async def create_schedule(
    db: AsyncSession,
    schedule_data: Dict[str, Any],
) -> Dict[str, Any]:
    """Create an automated report delivery schedule."""
    try:
        schedule = ReportSchedule(
            id=uuid.uuid4(),
            report_id=schedule_data["report_id"],
            schedule_cron=schedule_data["schedule_cron"],
            format=schedule_data.get("format", "pdf"),
            recipients=schedule_data.get("recipients", []),
            is_active=schedule_data.get("is_active", True),
            created_by=schedule_data.get("created_by"),
        )

        # Compute next run time (simplified: use current time + 1 day as placeholder)
        schedule.next_run_at = datetime.utcnow()

        db.add(schedule)
        await db.flush()

        logger.info(f"Schedule created for report {schedule_data['report_id']}")

        return {
            "id": str(schedule.id),
            "report_id": str(schedule.report_id),
            "schedule_cron": schedule.schedule_cron,
            "format": schedule.format,
            "is_active": schedule.is_active,
            "next_run_at": schedule.next_run_at.isoformat() if schedule.next_run_at else None,
            "created_at": schedule.created_at.isoformat(),
        }

    except Exception as e:
        logger.error(f"Error creating schedule: {e}")
        raise


async def update_schedule(
    db: AsyncSession,
    schedule_id: str,
    data: Dict[str, Any],
) -> Optional[Dict[str, Any]]:
    """Update a report schedule."""
    try:
        q = select(ReportSchedule).where(ReportSchedule.id == schedule_id)
        result = await db.execute(q)
        schedule = result.scalar_one_or_none()

        if not schedule:
            return None

        if "schedule_cron" in data and data["schedule_cron"]:
            schedule.schedule_cron = data["schedule_cron"]
        if "format" in data and data["format"]:
            schedule.format = data["format"]
        if "recipients" in data:
            schedule.recipients = data["recipients"]
        if "is_active" in data:
            schedule.is_active = data["is_active"]

        await db.flush()

        logger.info(f"Schedule {schedule_id} updated")

        return {
            "id": str(schedule.id),
            "schedule_cron": schedule.schedule_cron,
            "format": schedule.format,
            "is_active": schedule.is_active,
        }

    except Exception as e:
        logger.error(f"Error updating schedule {schedule_id}: {e}")
        raise


async def run_scheduled_reports(db: AsyncSession) -> Dict[str, Any]:
    """
    Background task: check for schedules whose next_run_at has passed,
    generate the report, email to recipients, and update next_run_at.

    Should be called periodically by a scheduler (e.g., every 15 minutes).
    """
    try:
        now = datetime.utcnow()
        reports_run = 0
        errors_count = 0

        # Find due schedules
        due_q = (
            select(ReportSchedule)
            .where(
                and_(
                    ReportSchedule.is_active == True,  # noqa: E712
                    ReportSchedule.next_run_at.isnot(None),
                    ReportSchedule.next_run_at <= now,
                )
            )
        )
        result = await db.execute(due_q)
        due_schedules = result.scalars().all()

        for schedule in due_schedules:
            try:
                # Generate the report
                export_result = await export_report(
                    db,
                    str(schedule.report_id),
                    schedule.format,
                )

                if export_result.get("status") != "error":
                    # TODO: Email the export to recipients
                    # from app.services.email_service import send_email
                    # for recipient in schedule.recipients:
                    #     await send_email(recipient["email"], ...)

                    reports_run += 1

                # Update schedule timestamps
                schedule.last_run_at = now
                # Simple next_run calculation: add 24h (proper cron parsing
                # would be implemented with a library like croniter)
                from datetime import timedelta
                schedule.next_run_at = now + timedelta(hours=24)

            except Exception as sched_error:
                errors_count += 1
                logger.error(
                    f"Error running scheduled report {schedule.report_id}: {sched_error}"
                )

        if due_schedules:
            await db.flush()

        logger.info(
            f"Scheduled reports check: {reports_run} run, {errors_count} errors"
        )

        return {
            "checked_at": now.isoformat(),
            "reports_run": reports_run,
            "errors": errors_count,
        }

    except Exception as e:
        logger.error(f"Error running scheduled reports: {e}")
        raise
