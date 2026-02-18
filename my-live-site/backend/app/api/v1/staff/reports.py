"""
Staff Reports API Endpoints

Provides REST endpoints for report generation and scheduling:
- CRUD operations on report definitions
- Report export (CSV, Excel, PDF)
- Scheduled report management (create, update, delete schedules)

All endpoints require staff or admin role access.
"""

import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.utils.permissions import verify_staff_or_admin_access

from app.services.staff.report_service import ReportService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Staff Reports"])


# ------------------------------------------------------------------
# Pydantic request models
# ------------------------------------------------------------------
class CreateReportRequest(BaseModel):
    """Payload for creating a report definition."""
    name: str
    description: Optional[str] = None
    report_type: str  # 'student_progress' | 'engagement' | 'financial' | 'custom'
    filters: Optional[Dict[str, Any]] = None
    columns: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None


class UpdateReportRequest(BaseModel):
    """Payload for updating a report definition."""
    name: Optional[str] = None
    description: Optional[str] = None
    report_type: Optional[str] = None
    filters: Optional[Dict[str, Any]] = None
    columns: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None


class ExportReportRequest(BaseModel):
    """Payload for exporting a report."""
    format: str  # 'csv' | 'excel' | 'pdf'
    date_from: Optional[str] = None
    date_to: Optional[str] = None
    filters: Optional[Dict[str, Any]] = None


class CreateScheduleRequest(BaseModel):
    """Payload for creating a report schedule."""
    report_id: str
    frequency: str  # 'daily' | 'weekly' | 'monthly'
    delivery_method: str  # 'email' | 'download' | 'dashboard'
    recipients: Optional[List[str]] = None
    export_format: str = "pdf"
    is_active: bool = True


class UpdateScheduleRequest(BaseModel):
    """Payload for updating a report schedule."""
    frequency: Optional[str] = None
    delivery_method: Optional[str] = None
    recipients: Optional[List[str]] = None
    export_format: Optional[str] = None
    is_active: Optional[bool] = None


# ------------------------------------------------------------------
# GET /
# ------------------------------------------------------------------
@router.get("/")
async def list_reports(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    report_type: Optional[str] = Query(None),
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Paginated list of report definitions.

    Supports filtering by report_type.
    """
    try:
        data = await ReportService.list_reports(
            db, page=page, page_size=page_size, report_type=report_type
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to list reports")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list reports.",
        ) from exc


# ------------------------------------------------------------------
# GET /{report_id}
# ------------------------------------------------------------------
@router.get("/{report_id}")
async def get_report(
    report_id: str,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Retrieve a single report definition."""
    try:
        data = await ReportService.get_report(db, report_id=report_id)
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Report not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to fetch report %s", report_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch report.",
        ) from exc


# ------------------------------------------------------------------
# POST /
# ------------------------------------------------------------------
@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_report(
    body: CreateReportRequest,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Create a new report definition."""
    try:
        creator_id = current_user.get("id") or current_user.get("user_id")
        data = await ReportService.create_report(
            db,
            creator_id=creator_id,
            name=body.name,
            description=body.description,
            report_type=body.report_type,
            filters=body.filters,
            columns=body.columns,
            metadata=body.metadata,
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to create report")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create report.",
        ) from exc


# ------------------------------------------------------------------
# PATCH /{report_id}
# ------------------------------------------------------------------
@router.patch("/{report_id}")
async def update_report(
    report_id: str,
    body: UpdateReportRequest,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Update an existing report definition."""
    try:
        updates = body.model_dump(exclude_unset=True)
        data = await ReportService.update_report(
            db, report_id=report_id, updates=updates
        )
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Report not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to update report %s", report_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update report.",
        ) from exc


# ------------------------------------------------------------------
# DELETE /{report_id}
# ------------------------------------------------------------------
@router.delete("/{report_id}")
async def delete_report(
    report_id: str,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Delete a report definition."""
    try:
        success = await ReportService.delete_report(db, report_id=report_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Report not found.",
            )
        return {"status": "success", "message": "Report deleted."}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to delete report %s", report_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete report.",
        ) from exc


# ------------------------------------------------------------------
# POST /{report_id}/export
# ------------------------------------------------------------------
@router.post("/{report_id}/export")
async def export_report(
    report_id: str,
    body: ExportReportRequest,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Export a report in the specified format.

    Supported formats: csv, excel, pdf.
    Returns a download URL for the generated file.
    """
    try:
        requester_id = current_user.get("id") or current_user.get("user_id")
        data = await ReportService.export_report(
            db,
            report_id=report_id,
            requester_id=requester_id,
            export_format=body.format,
            date_from=body.date_from,
            date_to=body.date_to,
            filters=body.filters,
        )
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Report not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to export report %s", report_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to export report.",
        ) from exc


# ------------------------------------------------------------------
# GET /schedules
# ------------------------------------------------------------------
@router.get("/schedules")
async def list_schedules(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """List all report schedules."""
    try:
        data = await ReportService.list_schedules(
            db, page=page, page_size=page_size
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to list report schedules")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list report schedules.",
        ) from exc


# ------------------------------------------------------------------
# POST /schedules
# ------------------------------------------------------------------
@router.post("/schedules", status_code=status.HTTP_201_CREATED)
async def create_schedule(
    body: CreateScheduleRequest,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Create a new report schedule."""
    try:
        creator_id = current_user.get("id") or current_user.get("user_id")
        data = await ReportService.create_schedule(
            db,
            creator_id=creator_id,
            report_id=body.report_id,
            frequency=body.frequency,
            delivery_method=body.delivery_method,
            recipients=body.recipients,
            export_format=body.export_format,
            is_active=body.is_active,
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to create report schedule")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create report schedule.",
        ) from exc


# ------------------------------------------------------------------
# PATCH /schedules/{schedule_id}
# ------------------------------------------------------------------
@router.patch("/schedules/{schedule_id}")
async def update_schedule(
    schedule_id: str,
    body: UpdateScheduleRequest,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Update an existing report schedule."""
    try:
        updates = body.model_dump(exclude_unset=True)
        data = await ReportService.update_schedule(
            db, schedule_id=schedule_id, updates=updates
        )
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Schedule not found.",
            )
        return {"status": "success", "data": data}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to update schedule %s", schedule_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update report schedule.",
        ) from exc


# ------------------------------------------------------------------
# DELETE /schedules/{schedule_id}
# ------------------------------------------------------------------
@router.delete("/schedules/{schedule_id}")
async def delete_schedule(
    schedule_id: str,
    current_user: dict = Depends(verify_staff_or_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Delete a report schedule."""
    try:
        success = await ReportService.delete_schedule(
            db, schedule_id=schedule_id
        )
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Schedule not found.",
            )
        return {"status": "success", "message": "Schedule deleted."}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to delete schedule %s", schedule_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete report schedule.",
        ) from exc
