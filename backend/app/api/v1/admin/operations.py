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
from datetime import datetime, timedelta
from typing import Any, Dict, Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.utils.permissions import verify_admin_access
from app.services.admin.audit_service import AuditService

logger = logging.getLogger(__name__)

router = APIRouter()


# ------------------------------------------------------------------
# Mock data helpers
# ------------------------------------------------------------------

def _mock_tickets() -> list:
    """Generate mock support ticket data."""
    now = datetime.utcnow()
    return [
        {
            "id": "TKT-001",
            "subject": "Unable to access Grade 5 Mathematics course",
            "description": "My child's account shows the course as enrolled but clicking on it returns a 403 error.",
            "category": "access_issue",
            "priority": "high",
            "status": "open",
            "reporter_name": "Mary Njeri",
            "reporter_email": "mary.njeri@example.com",
            "reporter_role": "parent",
            "assigned_to": None,
            "created_at": (now - timedelta(hours=3)).isoformat(),
            "updated_at": (now - timedelta(hours=3)).isoformat(),
        },
        {
            "id": "TKT-002",
            "subject": "AI Tutor giving incorrect Kiswahili translations",
            "description": "The AI tutor translated 'nyumba' as 'car' instead of 'house' during a Grade 3 lesson.",
            "category": "ai_quality",
            "priority": "medium",
            "status": "in_progress",
            "reporter_name": "John Kamau",
            "reporter_email": "john.kamau@example.com",
            "reporter_role": "instructor",
            "assigned_to": "staff_001",
            "created_at": (now - timedelta(hours=8)).isoformat(),
            "updated_at": (now - timedelta(hours=2)).isoformat(),
        },
        {
            "id": "TKT-003",
            "subject": "M-Pesa payment deducted but subscription not activated",
            "description": "Payment of KES 3,500 was deducted via M-Pesa (ref: SHK92341XYZ) but Family Plan still shows as expired.",
            "category": "billing",
            "priority": "critical",
            "status": "escalated",
            "reporter_name": "Fatuma Ali",
            "reporter_email": "fatuma.ali@example.com",
            "reporter_role": "parent",
            "assigned_to": "staff_002",
            "created_at": (now - timedelta(days=1)).isoformat(),
            "updated_at": (now - timedelta(hours=1)).isoformat(),
        },
        {
            "id": "TKT-004",
            "subject": "Request to reset student progress data",
            "description": "Parent requesting full reset of Grade 4 progress for transfer student joining mid-term.",
            "category": "data_request",
            "priority": "low",
            "status": "open",
            "reporter_name": "David Omondi",
            "reporter_email": "david.omondi@example.com",
            "reporter_role": "parent",
            "assigned_to": None,
            "created_at": (now - timedelta(days=2)).isoformat(),
            "updated_at": (now - timedelta(days=2)).isoformat(),
        },
        {
            "id": "TKT-005",
            "subject": "Course video not loading on mobile browser",
            "description": "Science Grade 6 - Lesson 3 video plays on desktop but shows black screen on Safari mobile.",
            "category": "technical",
            "priority": "medium",
            "status": "resolved",
            "reporter_name": "Lucy Wambui",
            "reporter_email": "lucy.wambui@example.com",
            "reporter_role": "parent",
            "assigned_to": "staff_001",
            "created_at": (now - timedelta(days=3)).isoformat(),
            "updated_at": (now - timedelta(days=1)).isoformat(),
            "resolved_at": (now - timedelta(days=1)).isoformat(),
        },
    ]


def _mock_ticket_detail(ticket_id: str) -> Optional[Dict[str, Any]]:
    """Get a mock ticket by ID with conversation thread."""
    tickets = _mock_tickets()
    ticket = next((t for t in tickets if t["id"] == ticket_id), None)

    if not ticket:
        return None

    now = datetime.utcnow()
    ticket["messages"] = [
        {
            "id": str(uuid4()),
            "sender_name": ticket["reporter_name"],
            "sender_role": ticket["reporter_role"],
            "content": ticket["description"],
            "created_at": ticket["created_at"],
        },
        {
            "id": str(uuid4()),
            "sender_name": "Support Team",
            "sender_role": "staff",
            "content": "Thank you for reporting this issue. We are looking into it and will get back to you shortly.",
            "created_at": (datetime.fromisoformat(ticket["created_at"]) + timedelta(hours=1)).isoformat(),
        },
    ]

    return ticket


def _mock_moderation_queue() -> list:
    """Generate mock content moderation queue."""
    now = datetime.utcnow()
    return [
        {
            "id": str(uuid4()),
            "content_type": "forum_post",
            "content_preview": "This math problem is so stupid, I hate...",
            "author_name": "Student_45",
            "author_role": "student",
            "flag_reason": "inappropriate_language",
            "flagged_by": "ai_filter",
            "severity": "medium",
            "status": "pending_review",
            "created_at": (now - timedelta(hours=1)).isoformat(),
        },
        {
            "id": str(uuid4()),
            "content_type": "chat_message",
            "content_preview": "Can you help me find answers to the exam questions for tomorrow...",
            "author_name": "Student_112",
            "author_role": "student",
            "flag_reason": "academic_integrity",
            "flagged_by": "ai_filter",
            "severity": "high",
            "status": "pending_review",
            "created_at": (now - timedelta(hours=2)).isoformat(),
        },
        {
            "id": str(uuid4()),
            "content_type": "profile_image",
            "content_preview": "[Image upload - flagged for review]",
            "author_name": "Student_78",
            "author_role": "student",
            "flag_reason": "inappropriate_content",
            "flagged_by": "ai_filter",
            "severity": "critical",
            "status": "pending_review",
            "created_at": (now - timedelta(hours=4)).isoformat(),
        },
        {
            "id": str(uuid4()),
            "content_type": "course_review",
            "content_preview": "This instructor does not know what they are teaching...",
            "author_name": "Parent_22",
            "author_role": "parent",
            "flag_reason": "reported_by_user",
            "flagged_by": "user_report",
            "severity": "low",
            "status": "pending_review",
            "created_at": (now - timedelta(hours=6)).isoformat(),
        },
    ]


def _mock_system_configs() -> list:
    """Generate mock system configuration entries."""
    return [
        {
            "key": "maintenance_mode",
            "value": False,
            "description": "Enable platform-wide maintenance mode",
            "category": "system",
            "editable": True,
            "last_modified": "2026-01-15T10:00:00",
            "modified_by": "admin@urbanhomeschool.co.ke",
        },
        {
            "key": "max_ai_chats_per_hour",
            "value": 50,
            "description": "Maximum AI tutor chat messages per student per hour",
            "category": "ai_limits",
            "editable": True,
            "last_modified": "2026-01-20T14:30:00",
            "modified_by": "admin@urbanhomeschool.co.ke",
        },
        {
            "key": "signup_enabled",
            "value": True,
            "description": "Allow new user registrations",
            "category": "auth",
            "editable": True,
            "last_modified": "2026-01-10T09:00:00",
            "modified_by": "admin@urbanhomeschool.co.ke",
        },
        {
            "key": "mpesa_sandbox_mode",
            "value": True,
            "description": "Use M-Pesa sandbox environment for payment testing",
            "category": "payments",
            "editable": True,
            "last_modified": "2026-02-01T11:00:00",
            "modified_by": "admin@urbanhomeschool.co.ke",
        },
        {
            "key": "content_moderation_auto",
            "value": True,
            "description": "Enable AI-powered automatic content moderation",
            "category": "safety",
            "editable": True,
            "last_modified": "2026-01-25T16:00:00",
            "modified_by": "admin@urbanhomeschool.co.ke",
        },
        {
            "key": "default_ai_model",
            "value": "gemini-pro",
            "description": "Default AI model for tutoring sessions",
            "category": "ai_limits",
            "editable": True,
            "last_modified": "2026-02-05T08:45:00",
            "modified_by": "admin@urbanhomeschool.co.ke",
        },
        {
            "key": "session_timeout_minutes",
            "value": 30,
            "description": "User session timeout in minutes",
            "category": "auth",
            "editable": True,
            "last_modified": "2026-01-12T10:30:00",
            "modified_by": "admin@urbanhomeschool.co.ke",
        },
    ]


# ------------------------------------------------------------------
# GET /operations/tickets - list support tickets
# ------------------------------------------------------------------
@router.get("/operations/tickets")
async def list_tickets(
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
        tickets = _mock_tickets()

        if status_filter:
            tickets = [t for t in tickets if t["status"] == status_filter]
        if priority:
            tickets = [t for t in tickets if t["priority"] == priority]
        if category:
            tickets = [t for t in tickets if t["category"] == category]

        return {
            "status": "success",
            "data": {
                "items": tickets,
                "total": len(tickets),
                "summary": {
                    "open": sum(1 for t in _mock_tickets() if t["status"] == "open"),
                    "in_progress": sum(1 for t in _mock_tickets() if t["status"] == "in_progress"),
                    "escalated": sum(1 for t in _mock_tickets() if t["status"] == "escalated"),
                    "resolved": sum(1 for t in _mock_tickets() if t["status"] == "resolved"),
                },
            },
        }
    except Exception as exc:
        logger.exception("Failed to list tickets")
        return {"status": "error", "detail": "Failed to list tickets."}


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
        ticket = _mock_ticket_detail(ticket_id)
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
        items = _mock_moderation_queue()

        if severity:
            items = [m for m in items if m["severity"] == severity]
        if content_type:
            items = [m for m in items if m["content_type"] == content_type]

        return {
            "status": "success",
            "data": {
                "items": items,
                "total": len(items),
                "severity_counts": {
                    "critical": sum(1 for m in _mock_moderation_queue() if m["severity"] == "critical"),
                    "high": sum(1 for m in _mock_moderation_queue() if m["severity"] == "high"),
                    "medium": sum(1 for m in _mock_moderation_queue() if m["severity"] == "medium"),
                    "low": sum(1 for m in _mock_moderation_queue() if m["severity"] == "low"),
                },
            },
        }
    except Exception as exc:
        logger.exception("Failed to list moderation queue")
        return {"status": "error", "detail": "Failed to list moderation queue."}


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
        configs = _mock_system_configs()

        if category:
            configs = [c for c in configs if c["category"] == category]

        return {
            "status": "success",
            "data": {
                "items": configs,
                "total": len(configs),
                "categories": list({c["category"] for c in _mock_system_configs()}),
            },
        }
    except Exception as exc:
        logger.exception("Failed to list system configs")
        return {"status": "error", "detail": "Failed to list system configs."}


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
