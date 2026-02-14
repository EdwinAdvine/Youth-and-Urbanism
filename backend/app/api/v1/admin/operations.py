"""
Admin Operations API Endpoints

Provides REST endpoints for the admin operations dashboard:
- Support ticket listing and detail
- Content moderation queue
- System configuration management
- Audit log search and CSV export

All endpoints require admin or staff role access.
"""

import io
import logging
from datetime import datetime
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.utils.permissions import verify_admin_access
from app.services.admin.audit_service import AuditService
from app.services.admin.ticket_service import TicketService
from app.services.admin.moderation_service import ModerationService
from app.services.admin.config_service import ConfigService

logger = logging.getLogger(__name__)

router = APIRouter()


# ------------------------------------------------------------------
# GET /operations/tickets - list support tickets
# ------------------------------------------------------------------
@router.get("/operations/tickets")
async def list_tickets(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    priority: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    List support tickets with optional filters.

    Supports filtering by status, priority, category, and free-text search.
    """
    try:
        data = await TicketService.list_tickets(
            db,
            page=page,
            page_size=page_size,
            status_filter=status_filter,
            priority=priority,
            category=category,
            search=search,
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to list tickets")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list tickets.",
        ) from exc


# ------------------------------------------------------------------
# GET /operations/tickets/{ticket_id} - ticket detail
# ------------------------------------------------------------------
@router.get("/operations/tickets/{ticket_id}")
async def get_ticket_detail(
    ticket_id: str,
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Get detailed information for a specific support ticket.

    Includes the full conversation thread and ticket metadata.
    """
    try:
        ticket = await TicketService.get_ticket(db, ticket_id)
        if ticket is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Ticket not found.",
            )
        return {"status": "success", "data": ticket}
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to get ticket detail")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get ticket detail.",
        ) from exc


# ------------------------------------------------------------------
# GET /operations/moderation - content moderation queue
# ------------------------------------------------------------------
@router.get("/operations/moderation")
async def list_moderation_queue(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    severity: Optional[str] = Query(None),
    content_type: Optional[str] = Query(None),
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    List flagged content awaiting moderation review.

    Returns items flagged by AI filters or user reports, sorted by severity.
    """
    try:
        data = await ModerationService.list_queue(
            db,
            page=page,
            page_size=page_size,
            severity=severity,
            content_type=content_type,
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to list moderation queue")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list moderation queue.",
        ) from exc


# ------------------------------------------------------------------
# GET /operations/config - system configuration
# ------------------------------------------------------------------
@router.get("/operations/config")
async def list_system_configs(
    category: Optional[str] = Query(None),
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    List system configuration entries.

    Returns all editable platform settings grouped by category.
    """
    try:
        data = await ConfigService.list_configs(db, category=category)
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to list system configs")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list system configs.",
        ) from exc


# ------------------------------------------------------------------
# GET /operations/audit-logs - search audit logs
# ------------------------------------------------------------------
@router.get("/operations/audit-logs")
async def search_audit_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    actor_email: Optional[str] = Query(None),
    action: Optional[str] = Query(None),
    resource_type: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Search audit logs with filtering and pagination.

    Powered by AuditService for querying the audit_logs table.
    Supports filtering by actor, action, resource type, status, and date range.
    """
    try:
        parsed_from = datetime.fromisoformat(date_from) if date_from else None
        parsed_to = datetime.fromisoformat(date_to) if date_to else None

        data = await AuditService.search_logs(
            db,
            actor_email=actor_email,
            action=action,
            resource_type=resource_type,
            status=status_filter,
            search=search,
            date_from=parsed_from,
            date_to=parsed_to,
            page=page,
            page_size=page_size,
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to search audit logs")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to search audit logs.",
        ) from exc


# ------------------------------------------------------------------
# GET /operations/audit-logs/export - export audit logs as CSV
# ------------------------------------------------------------------
@router.get("/operations/audit-logs/export")
async def export_audit_logs(
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    resource_type: Optional[str] = Query(None),
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
):
    """
    Export audit logs as a CSV file download.

    Supports filtering by date range and resource type before export.
    """
    try:
        parsed_from = datetime.fromisoformat(date_from) if date_from else None
        parsed_to = datetime.fromisoformat(date_to) if date_to else None

        csv_string = await AuditService.export_logs_csv(
            db,
            date_from=parsed_from,
            date_to=parsed_to,
            resource_type=resource_type,
        )

        buffer = io.BytesIO(csv_string.encode("utf-8"))
        return StreamingResponse(
            buffer,
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=audit_logs_export.csv"},
        )
    except Exception as exc:
        logger.exception("Failed to export audit logs")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to export audit logs.",
        ) from exc
