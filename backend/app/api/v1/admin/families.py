"""
Admin Families API Endpoints

Provides REST endpoints for managing families and student enrollments:
- Family listing with parent-student relationships
- Pending enrollment approval queue
- Enrollment approval and rejection
- Parental consent queue management

All endpoints require admin or staff role access.
"""

import logging
from datetime import datetime, timedelta
from typing import Any, Dict, Optional
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

class EnrollmentDecisionRequest(BaseModel):
    """Request body for enrollment approval or rejection."""
    reason: Optional[str] = None


# ------------------------------------------------------------------
# Mock data helpers
# ------------------------------------------------------------------

def _mock_families() -> list:
    """Generate mock family data with parent-student relationships."""
    now = datetime.utcnow()
    return [
        {
            "id": str(uuid4()),
            "parent": {
                "id": str(uuid4()),
                "name": "Mary Njeri Kamau",
                "email": "mary.njeri@example.com",
                "phone": "+254712345678",
                "is_active": True,
            },
            "students": [
                {
                    "id": str(uuid4()),
                    "name": "Brian Kamau",
                    "admission_number": "UHS-2026-0012",
                    "grade_level": 5,
                    "is_active": True,
                    "enrolled_courses": 4,
                    "ai_tutor_enabled": True,
                },
                {
                    "id": str(uuid4()),
                    "name": "Faith Kamau",
                    "admission_number": "UHS-2026-0013",
                    "grade_level": 3,
                    "is_active": True,
                    "enrolled_courses": 3,
                    "ai_tutor_enabled": True,
                },
            ],
            "subscription": {
                "plan": "Family Plan",
                "status": "active",
                "expires_at": (now + timedelta(days=22)).isoformat(),
            },
            "created_at": "2025-09-01T10:00:00",
        },
        {
            "id": str(uuid4()),
            "parent": {
                "id": str(uuid4()),
                "name": "Peter Ochieng Otieno",
                "email": "peter.ochieng@example.com",
                "phone": "+254723456789",
                "is_active": True,
            },
            "students": [
                {
                    "id": str(uuid4()),
                    "name": "Dennis Ochieng",
                    "admission_number": "UHS-2026-0034",
                    "grade_level": 7,
                    "is_active": True,
                    "enrolled_courses": 6,
                    "ai_tutor_enabled": True,
                },
            ],
            "subscription": {
                "plan": "Individual Student",
                "status": "active",
                "expires_at": (now + timedelta(days=15)).isoformat(),
            },
            "created_at": "2025-10-15T14:30:00",
        },
        {
            "id": str(uuid4()),
            "parent": {
                "id": str(uuid4()),
                "name": "Fatuma Ali Hassan",
                "email": "fatuma.ali@example.com",
                "phone": "+254734567890",
                "is_active": True,
            },
            "students": [
                {
                    "id": str(uuid4()),
                    "name": "Yusuf Ali",
                    "admission_number": "UHS-2026-0056",
                    "grade_level": 4,
                    "is_active": True,
                    "enrolled_courses": 5,
                    "ai_tutor_enabled": True,
                },
                {
                    "id": str(uuid4()),
                    "name": "Halima Ali",
                    "admission_number": "UHS-2026-0057",
                    "grade_level": 2,
                    "is_active": True,
                    "enrolled_courses": 3,
                    "ai_tutor_enabled": False,
                },
                {
                    "id": str(uuid4()),
                    "name": "Omar Ali",
                    "admission_number": "UHS-2026-0058",
                    "grade_level": 6,
                    "is_active": True,
                    "enrolled_courses": 5,
                    "ai_tutor_enabled": True,
                },
            ],
            "subscription": {
                "plan": "Family Plan",
                "status": "active",
                "expires_at": (now + timedelta(days=45)).isoformat(),
            },
            "created_at": "2025-08-20T08:15:00",
        },
        {
            "id": str(uuid4()),
            "parent": {
                "id": str(uuid4()),
                "name": "Lucy Wambui Maina",
                "email": "lucy.wambui@example.com",
                "phone": "+254745678901",
                "is_active": True,
            },
            "students": [
                {
                    "id": str(uuid4()),
                    "name": "Kevin Maina",
                    "admission_number": "UHS-2026-0089",
                    "grade_level": 8,
                    "is_active": False,
                    "enrolled_courses": 0,
                    "ai_tutor_enabled": False,
                },
            ],
            "subscription": {
                "plan": "Individual Student",
                "status": "expired",
                "expires_at": (now - timedelta(days=10)).isoformat(),
            },
            "created_at": "2025-11-05T11:00:00",
        },
    ]


def _mock_pending_enrollments() -> list:
    """Generate mock pending enrollment requests."""
    now = datetime.utcnow()
    return [
        {
            "id": "ENR-001",
            "student_name": "Grace Muthoni",
            "student_grade": 5,
            "parent_name": "Ann Muthoni",
            "parent_email": "ann.muthoni@example.com",
            "course_name": "CBC Grade 5 Mathematics",
            "course_id": str(uuid4()),
            "status": "pending",
            "requested_at": (now - timedelta(days=1)).isoformat(),
            "notes": "Transfer student from Nairobi Primary School.",
        },
        {
            "id": "ENR-002",
            "student_name": "Samuel Kipchoge",
            "student_grade": 7,
            "parent_name": "Joseph Kipchoge",
            "parent_email": "joseph.kipchoge@example.com",
            "course_name": "CBC Grade 7 Science & Technology",
            "course_id": str(uuid4()),
            "status": "pending",
            "requested_at": (now - timedelta(days=2)).isoformat(),
            "notes": None,
        },
        {
            "id": "ENR-003",
            "student_name": "Amira Bakari",
            "student_grade": 3,
            "parent_name": "Hassan Bakari",
            "parent_email": "hassan.bakari@example.com",
            "course_name": "CBC Grade 3 Kiswahili",
            "course_id": str(uuid4()),
            "status": "pending",
            "requested_at": (now - timedelta(days=3)).isoformat(),
            "notes": "Requested Kiswahili as additional language course.",
        },
        {
            "id": "ENR-004",
            "student_name": "Ian Mwenda",
            "student_grade": 6,
            "parent_name": "Ruth Mwenda",
            "parent_email": "ruth.mwenda@example.com",
            "course_name": "CBC Grade 6 Social Studies",
            "course_id": str(uuid4()),
            "status": "pending",
            "requested_at": (now - timedelta(hours=8)).isoformat(),
            "notes": "Home-schooled student joining mid-term.",
        },
        {
            "id": "ENR-005",
            "student_name": "Diana Chebet",
            "student_grade": 4,
            "parent_name": "Wilson Chebet",
            "parent_email": "wilson.chebet@example.com",
            "course_name": "CBC Grade 4 English Language Arts",
            "course_id": str(uuid4()),
            "status": "pending",
            "requested_at": (now - timedelta(hours=4)).isoformat(),
            "notes": None,
        },
    ]


def _mock_consent_queue() -> list:
    """Generate mock parental consent queue."""
    now = datetime.utcnow()
    return [
        {
            "id": str(uuid4()),
            "student_name": "Brian Kamau",
            "parent_name": "Mary Njeri Kamau",
            "parent_email": "mary.njeri@example.com",
            "consent_type": "ai_tutor_access",
            "description": "Enable AI Tutor premium features including voice interaction.",
            "status": "pending",
            "requested_at": (now - timedelta(days=1)).isoformat(),
        },
        {
            "id": str(uuid4()),
            "student_name": "Yusuf Ali",
            "parent_name": "Fatuma Ali Hassan",
            "parent_email": "fatuma.ali@example.com",
            "consent_type": "data_sharing",
            "description": "Share learning analytics with partnered school for progress tracking.",
            "status": "pending",
            "requested_at": (now - timedelta(days=2)).isoformat(),
        },
        {
            "id": str(uuid4()),
            "student_name": "Dennis Ochieng",
            "parent_name": "Peter Ochieng Otieno",
            "parent_email": "peter.ochieng@example.com",
            "consent_type": "video_recording",
            "description": "Allow recording of live tutoring sessions for review and improvement.",
            "status": "approved",
            "requested_at": (now - timedelta(days=5)).isoformat(),
            "responded_at": (now - timedelta(days=3)).isoformat(),
        },
    ]


# ------------------------------------------------------------------
# GET /families/ - list families
# ------------------------------------------------------------------
@router.get("/families/")
async def list_families(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    subscription_status: Optional[str] = Query(None),
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    List families with parent-student relationships.

    Returns parent details, linked students, subscription status, and enrollment summaries.
    Supports search by parent name or email and filter by subscription status.
    """
    try:
        families = _mock_families()

        if subscription_status:
            families = [
                f for f in families
                if f["subscription"]["status"] == subscription_status
            ]

        total_students = sum(len(f["students"]) for f in families)

        return {
            "status": "success",
            "data": {
                "items": families,
                "total": len(families),
                "page": page,
                "page_size": page_size,
                "summary": {
                    "total_families": len(_mock_families()),
                    "total_students": total_students,
                    "active_subscriptions": sum(
                        1 for f in _mock_families()
                        if f["subscription"]["status"] == "active"
                    ),
                },
            },
        }
    except Exception as exc:
        logger.exception("Failed to list families")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list families.",
        ) from exc


# ------------------------------------------------------------------
# GET /families/enrollments/pending - pending enrollment queue
# ------------------------------------------------------------------
@router.get("/families/enrollments/pending")
async def list_pending_enrollments(
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    List pending enrollment requests awaiting admin approval.

    Returns student and course details with parent information for each request.
    """
    try:
        enrollments = _mock_pending_enrollments()
        return {
            "status": "success",
            "data": {
                "items": enrollments,
                "total": len(enrollments),
            },
        }
    except Exception as exc:
        logger.exception("Failed to list pending enrollments")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list pending enrollments.",
        ) from exc


# ------------------------------------------------------------------
# POST /families/enrollments/{enrollment_id}/approve - approve enrollment
# ------------------------------------------------------------------
@router.post("/families/enrollments/{enrollment_id}/approve")
async def approve_enrollment(
    enrollment_id: str,
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Approve a pending enrollment request.

    Activates the student's access to the requested course and notifies the parent.
    """
    try:
        # Verify enrollment exists in mock data
        enrollments = _mock_pending_enrollments()
        enrollment = next(
            (e for e in enrollments if e["id"] == enrollment_id), None
        )

        if enrollment is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Enrollment request not found.",
            )

        return {
            "status": "success",
            "data": {
                "enrollment_id": enrollment_id,
                "status": "approved",
                "approved_by": current_user.get("email", "admin"),
                "approved_at": datetime.utcnow().isoformat(),
                "student_name": enrollment["student_name"],
                "course_name": enrollment["course_name"],
            },
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to approve enrollment")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to approve enrollment.",
        ) from exc


# ------------------------------------------------------------------
# POST /families/enrollments/{enrollment_id}/reject - reject enrollment
# ------------------------------------------------------------------
@router.post("/families/enrollments/{enrollment_id}/reject")
async def reject_enrollment(
    enrollment_id: str,
    body: EnrollmentDecisionRequest,
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Reject a pending enrollment request.

    Notifies the parent with the provided reason for rejection.
    """
    try:
        enrollments = _mock_pending_enrollments()
        enrollment = next(
            (e for e in enrollments if e["id"] == enrollment_id), None
        )

        if enrollment is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Enrollment request not found.",
            )

        return {
            "status": "success",
            "data": {
                "enrollment_id": enrollment_id,
                "status": "rejected",
                "rejected_by": current_user.get("email", "admin"),
                "rejected_at": datetime.utcnow().isoformat(),
                "reason": body.reason or "No reason provided.",
                "student_name": enrollment["student_name"],
                "course_name": enrollment["course_name"],
            },
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Failed to reject enrollment")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reject enrollment.",
        ) from exc


# ------------------------------------------------------------------
# GET /families/consent-queue - parental consent queue
# ------------------------------------------------------------------
@router.get("/families/consent-queue")
async def list_consent_queue(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: dict = Depends(verify_admin_access()),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    List parental consent requests.

    Returns consent requests for features requiring explicit parental approval,
    such as AI tutor access, data sharing, and recording permissions.
    """
    try:
        items = _mock_consent_queue()

        if status_filter:
            items = [c for c in items if c["status"] == status_filter]

        return {
            "status": "success",
            "data": {
                "items": items,
                "total": len(items),
                "pending_count": sum(
                    1 for c in _mock_consent_queue() if c["status"] == "pending"
                ),
            },
        }
    except Exception as exc:
        logger.exception("Failed to list consent queue")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list consent queue.",
        ) from exc
