"""
Partner Analytics Service

ROI metrics, custom reports, and data export for partner analytics.
Uses async SQLAlchemy queries against sponsorship, payment, and impact report models.
"""

import logging
import math
import uuid
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from sqlalchemy import select, func, and_, case
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.partner.sponsorship import (
    SponsorshipProgram,
    SponsoredChild,
    SponsoredChildStatus,
    ProgramStatus,
)
from app.models.partner.partner_subscription import (
    PartnerPayment,
    PartnerPaymentStatus,
)
from app.models.partner.partner_impact import (
    PartnerImpactReport,
    ExportFormat,
)

logger = logging.getLogger(__name__)


# ------------------------------------------------------------------
# 1. ROI Metrics
# ------------------------------------------------------------------

async def get_roi_metrics(
    db: AsyncSession,
    partner_id: str,
    period: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Calculate return-on-investment metrics for a partner's sponsorships.

    Aggregates across all programs owned by the partner:
    - total sponsored children with ACTIVE status
    - total completed payments (sum of amount)
    - cost per student (total invested / students supported)
    - completion rate (completed programs / total programs)
    - engagement rate (active children / total non-removed children)

    Args:
        db: Async database session.
        partner_id: UUID string of the partner user.
        period: Optional time period filter ('month', 'quarter', 'year').
                When provided, payments are filtered to the window.

    Returns:
        Dictionary shaped like ROIMetrics.
    """
    try:
        pid = uuid.UUID(partner_id)

        # ----------------------------------------------------------
        # Determine optional date boundary for payment filtering
        # ----------------------------------------------------------
        date_cutoff: Optional[datetime] = None
        if period == "month":
            date_cutoff = datetime.utcnow() - timedelta(days=30)
        elif period == "quarter":
            date_cutoff = datetime.utcnow() - timedelta(days=90)
        elif period == "year":
            date_cutoff = datetime.utcnow() - timedelta(days=365)

        # ----------------------------------------------------------
        # Total active sponsored children
        # ----------------------------------------------------------
        active_children_q = select(func.count(SponsoredChild.id)).where(
            and_(
                SponsoredChild.partner_id == pid,
                SponsoredChild.status == SponsoredChildStatus.ACTIVE,
            )
        )
        active_children_result = await db.execute(active_children_q)
        students_supported: int = active_children_result.scalar() or 0

        # ----------------------------------------------------------
        # Total non-removed children (for engagement rate denominator)
        # ----------------------------------------------------------
        total_children_q = select(func.count(SponsoredChild.id)).where(
            and_(
                SponsoredChild.partner_id == pid,
                SponsoredChild.status != SponsoredChildStatus.REMOVED,
            )
        )
        total_children_result = await db.execute(total_children_q)
        total_children: int = total_children_result.scalar() or 0

        # ----------------------------------------------------------
        # Total completed payments
        # ----------------------------------------------------------
        payment_filters = [
            PartnerPayment.partner_id == pid,
            PartnerPayment.status == PartnerPaymentStatus.COMPLETED,
        ]
        if date_cutoff is not None:
            payment_filters.append(PartnerPayment.paid_at >= date_cutoff)

        total_invested_q = select(
            func.coalesce(func.sum(PartnerPayment.amount), 0)
        ).where(and_(*payment_filters))
        total_invested_result = await db.execute(total_invested_q)
        total_invested: float = float(total_invested_result.scalar() or 0)

        # ----------------------------------------------------------
        # Cost per student
        # ----------------------------------------------------------
        cost_per_student: float = 0.0
        if students_supported > 0:
            cost_per_student = round(total_invested / students_supported, 2)

        # ----------------------------------------------------------
        # Program completion rate
        # ----------------------------------------------------------
        program_counts_q = select(
            func.count(SponsorshipProgram.id).label("total"),
            func.count(
                case(
                    (SponsorshipProgram.status == ProgramStatus.COMPLETED, SponsorshipProgram.id),
                )
            ).label("completed"),
        ).where(SponsorshipProgram.partner_id == pid)
        program_counts_result = await db.execute(program_counts_q)
        program_row = program_counts_result.one()
        total_programs: int = program_row.total or 0
        completed_programs: int = program_row.completed or 0

        completion_rate: float = 0.0
        if total_programs > 0:
            completion_rate = round(completed_programs / total_programs, 4)

        # ----------------------------------------------------------
        # Engagement rate (active / total non-removed)
        # ----------------------------------------------------------
        engagement_rate: float = 0.0
        if total_children > 0:
            engagement_rate = round(students_supported / total_children, 4)

        # ----------------------------------------------------------
        # ROI percentage: a simplified metric
        # (students_supported * avg_cost - total_invested) / total_invested
        # When no meaningful calculation is possible, default to 0.
        # ----------------------------------------------------------
        roi_percentage: float = 0.0
        if total_invested > 0 and students_supported > 0:
            # Simple value proxy: each actively engaged student represents
            # value. We express ROI as engagement-weighted return.
            roi_percentage = round(engagement_rate * 100, 2)

        return {
            "partner_id": partner_id,
            "period": period or "all_time",
            "total_investment": total_invested,
            "students_supported": students_supported,
            "total_children": total_children,
            "cost_per_student": cost_per_student,
            "completion_rate": completion_rate,
            "engagement_rate": engagement_rate,
            "total_programs": total_programs,
            "completed_programs": completed_programs,
            "roi_percentage": roi_percentage,
        }

    except Exception as e:
        logger.error(
            f"Error calculating ROI metrics for partner {partner_id}: {e}",
            exc_info=True,
        )
        raise


# ------------------------------------------------------------------
# 2. Custom Reports
# ------------------------------------------------------------------

async def get_custom_report(
    db: AsyncSession,
    partner_id: str,
    report_params: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Query existing PartnerImpactReport records for a partner,
    with optional filtering and pagination.

    Args:
        db: Async database session.
        partner_id: UUID string of the partner user.
        report_params: Dictionary that may contain:
            - report_type (str): Filter by ReportType value.
            - page (int): 1-based page number (default 1).
            - limit (int): Items per page (default 20).

    Returns:
        Paginated dictionary with items, total, page, and pages.
    """
    try:
        pid = uuid.UUID(partner_id)

        page: int = max(1, int(report_params.get("page", 1)))
        limit: int = max(1, min(100, int(report_params.get("limit", 20))))

        # Base filter: reports belonging to this partner
        filters = [PartnerImpactReport.partner_id == pid]

        # Optional report_type filter
        report_type = report_params.get("report_type")
        if report_type:
            filters.append(PartnerImpactReport.report_type == report_type)

        # ----------------------------------------------------------
        # Total count
        # ----------------------------------------------------------
        count_q = select(func.count(PartnerImpactReport.id)).where(and_(*filters))
        count_result = await db.execute(count_q)
        total: int = count_result.scalar() or 0

        # ----------------------------------------------------------
        # Paginated items
        # ----------------------------------------------------------
        offset = (page - 1) * limit
        items_q = (
            select(PartnerImpactReport)
            .where(and_(*filters))
            .order_by(PartnerImpactReport.generated_at.desc())
            .offset(offset)
            .limit(limit)
        )
        items_result = await db.execute(items_q)
        reports = items_result.scalars().all()

        items = [_impact_report_to_dict(r) for r in reports]
        total_pages = max(1, math.ceil(total / limit))

        return {
            "items": items,
            "total": total,
            "page": page,
            "pages": total_pages,
        }

    except Exception as e:
        logger.error(
            f"Error fetching custom reports for partner {partner_id}: {e}",
            exc_info=True,
        )
        raise


# ------------------------------------------------------------------
# 3. Export Report
# ------------------------------------------------------------------

async def export_report(
    db: AsyncSession,
    partner_id: str,
    report_id: str,
    format: str = "pdf",
) -> Dict[str, Any]:
    """
    Initiate an export of an impact report in the requested format.

    Validates partner ownership, updates the export_format field on the
    report record, and returns a pending response. Actual file generation
    is deferred to a background task / worker.

    Args:
        db: Async database session.
        partner_id: UUID string of the partner user.
        report_id: UUID string of the PartnerImpactReport.
        format: Export format ('pdf', 'csv', 'xlsx'). Defaults to 'pdf'.

    Returns:
        Dictionary with url (None until generated), filename, and status.

    Raises:
        ValueError: If the report is not found or not owned by the partner.
    """
    try:
        pid = uuid.UUID(partner_id)
        rid = uuid.UUID(report_id)

        # ----------------------------------------------------------
        # Find the report and verify ownership
        # ----------------------------------------------------------
        query = select(PartnerImpactReport).where(
            and_(
                PartnerImpactReport.id == rid,
                PartnerImpactReport.partner_id == pid,
            )
        )
        result = await db.execute(query)
        report = result.scalar_one_or_none()

        if not report:
            raise ValueError(
                f"Report {report_id} not found or not owned by partner {partner_id}"
            )

        # ----------------------------------------------------------
        # Map format string to ExportFormat enum
        # ----------------------------------------------------------
        format_lower = format.lower()
        format_map = {
            "pdf": ExportFormat.PDF,
            "csv": ExportFormat.CSV,
            "xlsx": ExportFormat.XLSX,
        }
        export_fmt = format_map.get(format_lower, ExportFormat.PDF)

        # ----------------------------------------------------------
        # Update the report record
        # ----------------------------------------------------------
        report.export_format = export_fmt
        report.exported_at = datetime.utcnow()
        await db.flush()

        filename = f"report_{report_id}.{format_lower}"

        logger.info(
            f"Export requested for report {report_id} "
            f"(partner {partner_id}, format={format_lower})"
        )

        return {
            "url": None,
            "filename": filename,
            "status": "pending",
        }

    except ValueError:
        raise
    except Exception as e:
        logger.error(
            f"Error exporting report {report_id} for partner {partner_id}: {e}",
            exc_info=True,
        )
        raise


# ------------------------------------------------------------------
# 4. Student AI Insights
# ------------------------------------------------------------------

async def get_student_ai_insights(
    db: AsyncSession,
    partner_id: str,
    student_id: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """
    Retrieve AI-generated insights for sponsored children.

    Pulls from the ai_milestones and partner_goals JSONB columns on
    SponsoredChild records.

    Args:
        db: Async database session.
        partner_id: UUID string of the partner user.
        student_id: Optional UUID string to filter to a single student.

    Returns:
        List of insight dictionaries, one per sponsored child.
    """
    try:
        pid = uuid.UUID(partner_id)

        # ----------------------------------------------------------
        # Build query for sponsored children
        # ----------------------------------------------------------
        filters = [
            SponsoredChild.partner_id == pid,
            SponsoredChild.status != SponsoredChildStatus.REMOVED,
        ]

        if student_id:
            sid = uuid.UUID(student_id)
            filters.append(SponsoredChild.student_id == sid)

        children_q = (
            select(SponsoredChild)
            .where(and_(*filters))
            .order_by(SponsoredChild.created_at.desc())
        )
        children_result = await db.execute(children_q)
        children = children_result.scalars().all()

        # ----------------------------------------------------------
        # Build insight dict for each child
        # ----------------------------------------------------------
        insights: List[Dict[str, Any]] = []

        for child in children:
            milestones = child.ai_milestones or []
            goals = child.partner_goals or []

            # Derive summary statistics from milestones
            total_milestones = len(milestones)
            completed_milestones = sum(
                1 for m in milestones
                if isinstance(m, dict) and m.get("completed", False)
            )

            # Derive goal progress
            total_goals = len(goals)
            goals_on_track = sum(
                1 for g in goals
                if isinstance(g, dict) and g.get("progress", 0) >= 50
            )

            insight = {
                "sponsored_child_id": str(child.id),
                "student_id": str(child.student_id),
                "program_id": str(child.program_id),
                "status": (
                    child.status.value
                    if hasattr(child.status, "value")
                    else str(child.status)
                ),
                "milestones": {
                    "total": total_milestones,
                    "completed": completed_milestones,
                    "items": milestones,
                },
                "goals": {
                    "total": total_goals,
                    "on_track": goals_on_track,
                    "items": goals,
                },
                "enrolled_at": (
                    child.enrolled_at.isoformat() if child.enrolled_at else None
                ),
                "notes": child.notes,
            }

            insights.append(insight)

        return insights

    except Exception as e:
        logger.error(
            f"Error fetching student AI insights for partner {partner_id}: {e}",
            exc_info=True,
        )
        raise


# ------------------------------------------------------------------
# Private helpers
# ------------------------------------------------------------------

def _impact_report_to_dict(report: PartnerImpactReport) -> Dict[str, Any]:
    """Convert a PartnerImpactReport model instance to a dictionary."""
    return {
        "id": str(report.id),
        "partner_id": str(report.partner_id),
        "program_id": str(report.program_id) if report.program_id else None,
        "report_type": (
            report.report_type.value
            if hasattr(report.report_type, "value")
            else str(report.report_type)
        ),
        "title": report.title,
        "summary": report.summary,
        "metrics": report.metrics or {},
        "ai_insights": report.ai_insights or {},
        "cbc_progress": report.cbc_progress or {},
        "period_start": (
            report.period_start.isoformat() if report.period_start else None
        ),
        "period_end": (
            report.period_end.isoformat() if report.period_end else None
        ),
        "export_format": (
            report.export_format.value
            if report.export_format and hasattr(report.export_format, "value")
            else str(report.export_format) if report.export_format else None
        ),
        "export_url": report.export_url,
        "generated_at": (
            report.generated_at.isoformat() if report.generated_at else None
        ),
        "created_at": (
            report.created_at.isoformat() if report.created_at else None
        ),
    }
