"""
Admin Restrictions API Endpoints

Provides REST endpoints for managing user restrictions and appeals:
- Active restriction listing
- Create new restrictions (suspensions, bans, feature locks)
- Appeals queue management
- Appeal processing (approve/deny)
- Watch list for at-risk accounts

All endpoints require admin or staff role access.
"""

import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.utils.permissions import verify_admin_access

logger = logging.getLogger(__name__)

router = APIRouter()


# ------------------------------------------------------------------
# Pydantic request models
# ------------------------------------------------------------------

class CreateRestrictionRequest(BaseModel):
    """Request body for creating a new restriction."""
    user_id: str
    restriction_type: str  # 'suspension' | 'ban' | 'feature_lock' | 'warning'
    reason: str
    duration_days: Optional[int] = None  # None means permanent
    affected_features: Optional[List[str]] = None


class ProcessAppealRequest(BaseModel):
    """Request body for processing an appeal."""
    decision: str  # 'approved' | 'denied'
    admin_notes: Optional[str] = None


# ------------------------------------------------------------------
# Mock data helpers
# ------------------------------------------------------------------

def _mock_active_restrictions() -> list:
    """Generate mock active restriction data."""
    now = datetime.utcnow()
    return [
        {
            "id": str(uuid4()),
            "user_id": str(uuid4()),
            "user_name": "Student_112",
            "user_email": "student112@example.com",
            "user_role": "student",
            "restriction_type": "feature_lock",
            "reason": "Attempted to use AI tutor to generate exam answers. Detected by content filter.",
            "affected_features": ["ai_tutor", "chat"],
            "status": "active",
            "created_by": "admin@urbanhomeschool.co.ke",
            "created_at": (now - timedelta(days=3)).isoformat(),
            "expires_at": (now + timedelta(days=4)).isoformat(),
            "is_permanent": False,
        },
        {
            "id": str(uuid4()),
            "user_id": str(uuid4()),
            "user_name": "Parent_88",
            "user_email": "parent88@example.com",
            "user_role": "parent",
            "restriction_type": "suspension",
            "reason": "Abusive language directed at instructor in course review. Multiple offences.",
            "affected_features": None,
            "status": "active",
            "created_by": "admin@urbanhomeschool.co.ke",
            "created_at": (now - timedelta(days=5)).isoformat(),
            "expires_at": (now + timedelta(days=9)).isoformat(),
            "is_permanent": False,
        },
        {
            "id": str(uuid4()),
            "user_id": str(uuid4()),
            "user_name": "Instructor_15",
            "user_email": "instructor15@example.com",
            "user_role": "instructor",
            "restriction_type": "warning",
            "reason": "Course content did not meet CBC alignment standards. First warning issued.",
            "affected_features": ["course_publishing"],
            "status": "active",
            "created_by": "staff@urbanhomeschool.co.ke",
            "created_at": (now - timedelta(days=1)).isoformat(),
            "expires_at": (now + timedelta(days=29)).isoformat(),
            "is_permanent": False,
        },
        {
            "id": str(uuid4()),
            "user_id": str(uuid4()),
            "user_name": "User_203",
            "user_email": "user203@example.com",
            "user_role": "student",
            "restriction_type": "ban",
            "reason": "Shared account credentials with non-registered users. Terms of service violation.",
            "affected_features": None,
            "status": "active",
            "created_by": "admin@urbanhomeschool.co.ke",
            "created_at": (now - timedelta(days=10)).isoformat(),
            "expires_at": None,
            "is_permanent": True,
        },
    ]


def _mock_appeals() -> list:
    """Generate mock appeals queue."""
    now = datetime.utcnow()
    return [
        {
            "id": "APL-001",
            "restriction_id": str(uuid4()),
            "user_id": str(uuid4()),
            "user_name": "Student_112",
            "user_email": "student112@example.com",
            "restriction_type": "feature_lock",
            "original_reason": "Attempted to use AI tutor to generate exam answers.",
            "appeal_message": "I was only asking the AI tutor to explain how to solve the problem, not to give me answers. I understand the rules now and it will not happen again.",
            "status": "pending",
            "submitted_at": (now - timedelta(days=1)).isoformat(),
            "reviewed_by": None,
            "reviewed_at": None,
            "admin_notes": None,
        },
        {
            "id": "APL-002",
            "restriction_id": str(uuid4()),
            "user_id": str(uuid4()),
            "user_name": "Parent_88",
            "user_email": "parent88@example.com",
            "restriction_type": "suspension",
            "original_reason": "Abusive language directed at instructor in course review.",
            "appeal_message": "I apologize for my language in the review. I was frustrated because my child's grades were not updating correctly. I have since resolved the issue with support.",
            "status": "pending",
            "submitted_at": (now - timedelta(days=2)).isoformat(),
            "reviewed_by": None,
            "reviewed_at": None,
            "admin_notes": None,
        },
        {
            "id": "APL-003",
            "restriction_id": str(uuid4()),
            "user_id": str(uuid4()),
            "user_name": "User_203",
            "user_email": "user203@example.com",
            "restriction_type": "ban",
            "original_reason": "Shared account credentials with non-registered users.",
            "appeal_message": "My younger sibling used my account without my knowledge. I have changed my password and this will not happen again. Please reconsider the permanent ban.",
            "status": "denied",
            "submitted_at": (now - timedelta(days=8)).isoformat(),
            "reviewed_by": "admin@urbanhomeschool.co.ke",
            "reviewed_at": (now - timedelta(days=6)).isoformat(),
            "admin_notes": "Account sharing verified through IP analysis. Multiple unique devices confirmed. Ban upheld.",
        },
    ]


def _mock_watch_list() -> list:
    """Generate mock watch list of flagged accounts."""
    now = datetime.utcnow()
    return [
        {
            "id": str(uuid4()),
            "user_id": str(uuid4()),
            "user_name": "Student_67",
            "user_email": "student67@example.com",
            "user_role": "student",
            "watch_reason": "Multiple AI tutor conversations flagged by content filter in the past week.",
            "severity": "medium",
            "flags_count": 4,
            "last_flag_at": (now - timedelta(hours=6)).isoformat(),
            "added_at": (now - timedelta(days=5)).isoformat(),
            "added_by": "ai_system",
        },
        {
            "id": str(uuid4()),
            "user_id": str(uuid4()),
            "user_name": "Student_145",
            "user_email": "student145@example.com",
            "user_role": "student",
            "watch_reason": "Unusual login pattern detected: 15 login attempts from 8 different IP addresses in 24 hours.",
            "severity": "high",
            "flags_count": 2,
            "last_flag_at": (now - timedelta(hours=12)).isoformat(),
            "added_at": (now - timedelta(days=2)).isoformat(),
            "added_by": "security_system",
        },
        {
            "id": str(uuid4()),
            "user_id": str(uuid4()),
            "user_name": "Parent_56",
            "user_email": "parent56@example.com",
            "user_role": "parent",
            "watch_reason": "Submitted 3 refund requests in the past month. Possible refund abuse pattern.",
            "severity": "low",
            "flags_count": 3,
            "last_flag_at": (now - timedelta(days=3)).isoformat(),
            "added_at": (now - timedelta(days=10)).isoformat(),
            "added_by": "finance_system",
        },
        {
            "id": str(uuid4()),
            "user_id": str(uuid4()),
            "user_name": "Instructor_22",
            "user_email": "instructor22@example.com",
            "user_role": "instructor",
            "watch_reason": "3 student complaints about course quality and unresponsive communication.",
            "severity": "medium",
            "flags_count": 3,
            "last_flag_at": (now - timedelta(days=1)).isoformat(),
            "added_at": (now - timedelta(days=7)).isoformat(),
            "added_by": "support_team",
        },
    ]


# ------------------------------------------------------------------
# GET /restrictions/ - list active restrictions
# ------------------------------------------------------------------
@router.get("/restrictions/")
async def list_restrictions(
    restriction_type: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    List active user restrictions.

    Returns all current suspensions, bans, feature locks, and warnings
    with optional filtering by type and status.
    """
    try:
        restrictions = _mock_active_restrictions()

        if restriction_type:
            restrictions = [
                r for r in restrictions if r["restriction_type"] == restriction_type
            ]
        if status_filter:
            restrictions = [
                r for r in restrictions if r["status"] == status_filter
            ]

        all_restrictions = _mock_active_restrictions()
        return {
            "status": "success",
            "data": {
                "items": restrictions,
                "total": len(restrictions),
                "summary": {
                    "active": sum(1 for r in all_restrictions if r["status"] == "active"),
                    "suspensions": sum(1 for r in all_restrictions if r["restriction_type"] == "suspension"),
                    "bans": sum(1 for r in all_restrictions if r["restriction_type"] == "ban"),
                    "feature_locks": sum(1 for r in all_restrictions if r["restriction_type"] == "feature_lock"),
                    "warnings": sum(1 for r in all_restrictions if r["restriction_type"] == "warning"),
                },
            },
        }
    except Exception as exc:
        logger.exception("Failed to list restrictions")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list restrictions.",
        ) from exc


# ------------------------------------------------------------------
# POST /restrictions/ - create restriction
# ------------------------------------------------------------------
@router.post("/restrictions/")
async def create_restriction(
    body: CreateRestrictionRequest,
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Create a new user restriction.

    Supports suspension, ban, feature lock, and warning types.
    Optionally specify duration in days (None for permanent) and affected features.
    """
    try:
        now = datetime.utcnow()
        expires_at = None
        is_permanent = body.duration_days is None

        if body.duration_days is not None:
            expires_at = (now + timedelta(days=body.duration_days)).isoformat()

        restriction = {
            "id": str(uuid4()),
            "user_id": body.user_id,
            "restriction_type": body.restriction_type,
            "reason": body.reason,
            "affected_features": body.affected_features,
            "status": "active",
            "created_by": current_user.get("email", "admin"),
            "created_at": now.isoformat(),
            "expires_at": expires_at,
            "is_permanent": is_permanent,
        }

        return {"status": "success", "data": restriction}
    except Exception as exc:
        logger.exception("Failed to create restriction")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create restriction.",
        ) from exc


# ------------------------------------------------------------------
# GET /restrictions/appeals - appeals queue
# ------------------------------------------------------------------
@router.get("/restrictions/appeals")
async def list_appeals(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    List restriction appeals.

    Returns all submitted appeals with optional filter by review status
    (pending, approved, denied).
    """
    try:
        appeals = _mock_appeals()

        if status_filter:
            appeals = [a for a in appeals if a["status"] == status_filter]

        all_appeals = _mock_appeals()
        return {
            "status": "success",
            "data": {
                "items": appeals,
                "total": len(appeals),
                "pending_count": sum(1 for a in all_appeals if a["status"] == "pending"),
            },
        }
    except Exception as exc:
        logger.exception("Failed to list appeals")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list appeals.",
        ) from exc


# ------------------------------------------------------------------
# PUT /restrictions/appeals/{appeal_id} - process an appeal
# ------------------------------------------------------------------
@router.put("/restrictions/appeals/{appeal_id}")
async def process_appeal(
    appeal_id: str,
    body: ProcessAppealRequest,
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Process a restriction appeal.

    Approve or deny the appeal with optional admin notes.
    Approved appeals lift the associated restriction.
    """
    try:
        appeals = _mock_appeals()
        appeal = next((a for a in appeals if a["id"] == appeal_id), None)

        if appeal is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Appeal not found.",
            )

        if appeal["status"] != "pending":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Appeal has already been processed with status: {appeal['status']}.",
            )

        if body.decision not in ("approved", "denied"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Decision must be 'approved' or 'denied'.",
            )

        now = datetime.utcnow()
        return {
            "status": "success",
            "data": {
                "appeal_id": appeal_id,
                "decision": body.decision,
                "reviewed_by": current_user.get("email", "admin"),
                "reviewed_at": now.isoformat(),
                "admin_notes": body.admin_notes,
                "restriction_lifted": body.decision == "approved",
                "user_name": appeal["user_name"],
                "restriction_type": appeal["restriction_type"],
            },
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to process appeal")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process appeal.",
        ) from exc


# ------------------------------------------------------------------
# GET /restrictions/watch-list - flagged accounts watch list
# ------------------------------------------------------------------
@router.get("/restrictions/watch-list")
async def list_watch_list(
    severity: Optional[str] = Query(None),
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    List accounts on the watch list.

    Returns flagged accounts being monitored for potential policy violations,
    with optional filtering by severity level.
    """
    try:
        items = _mock_watch_list()

        if severity:
            items = [w for w in items if w["severity"] == severity]

        all_items = _mock_watch_list()
        return {
            "status": "success",
            "data": {
                "items": items,
                "total": len(items),
                "severity_counts": {
                    "high": sum(1 for w in all_items if w["severity"] == "high"),
                    "medium": sum(1 for w in all_items if w["severity"] == "medium"),
                    "low": sum(1 for w in all_items if w["severity"] == "low"),
                },
            },
        }
    except Exception as exc:
        logger.exception("Failed to list watch list")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list watch list.",
        ) from exc
