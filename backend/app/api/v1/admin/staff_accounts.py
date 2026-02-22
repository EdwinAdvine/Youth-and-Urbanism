"""Staff Account Management API — Admin/Super Admin endpoints for creating staff accounts."""

import logging
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.utils.security import get_current_active_user
from app.utils.permissions import require_super_admin
from app.services.admin import staff_account_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/staff-accounts", tags=["Admin - Staff Accounts"])


class StaffAccountCreateRequest(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=200)
    phone: Optional[str] = None
    department: Optional[str] = None


class StaffAccountReviewRequest(BaseModel):
    rejection_reason: Optional[str] = None


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_staff_account(
    data: StaffAccountCreateRequest,
    background_tasks: BackgroundTasks,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new staff account request. Super admins auto-approve; admins need super admin approval."""
    role = current_user.get("role", "")
    if role not in ("admin", "staff"):
        raise HTTPException(status_code=403, detail="Admin access required.")

    is_super = current_user.get("is_super_admin", False)
    # Need to check DB for is_super_admin flag
    if role == "admin" and not is_super:
        from sqlalchemy import select
        from app.models.user import User
        result = await db.execute(
            select(User.is_super_admin).where(User.id == UUID(current_user["id"]))
        )
        is_super = result.scalar_one_or_none() or False

    request = await staff_account_service.create_staff_request(
        db=db,
        email=data.email,
        full_name=data.full_name,
        phone=data.phone,
        department=data.department,
        requesting_user_id=current_user["id"],
        is_super_admin=is_super,
    )

    # Send invite email if auto-approved (super admin)
    if request.status == "approved" and request.invite_token:
        from app.services.email_service import send_staff_invite_email
        background_tasks.add_task(
            send_staff_invite_email, request.email, request.full_name, request.invite_token
        )

    return {
        "id": str(request.id),
        "email": request.email,
        "full_name": request.full_name,
        "status": request.status,
        "message": "Staff account created and invite sent." if request.status == "approved"
                   else "Staff account request submitted. Awaiting super admin approval.",
    }


@router.get("")
async def list_staff_accounts(
    status_filter: Optional[str] = None,
    current_user=Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """List staff account requests. Super admins see all; admins see their own."""
    role = current_user.get("role", "")
    if role not in ("admin", "staff"):
        raise HTTPException(status_code=403, detail="Admin access required.")

    # Check if super admin
    from sqlalchemy import select
    from app.models.user import User
    result = await db.execute(
        select(User.is_super_admin).where(User.id == UUID(current_user["id"]))
    )
    is_super = result.scalar_one_or_none() or False

    requesting_user_id = None if is_super else current_user["id"]

    requests = await staff_account_service.list_staff_requests(
        db=db,
        status_filter=status_filter,
        requesting_user_id=requesting_user_id,
    )

    return [
        {
            "id": str(r.id),
            "email": r.email,
            "full_name": r.full_name,
            "phone": r.phone,
            "department": r.department,
            "status": r.status,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "rejection_reason": r.rejection_reason,
        }
        for r in requests
    ]


@router.put("/{request_id}/approve", status_code=status.HTTP_200_OK)
async def approve_staff_account(
    request_id: str,
    background_tasks: BackgroundTasks,
    current_user=Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
):
    """Super admin approves a pending staff account request."""
    request = await staff_account_service.approve_staff_request(
        db=db,
        request_id=request_id,
        approver_id=current_user["id"],
    )

    if request.invite_token:
        from app.services.email_service import send_staff_invite_email
        background_tasks.add_task(
            send_staff_invite_email, request.email, request.full_name, request.invite_token
        )

    return {
        "id": str(request.id),
        "status": request.status,
        "message": "Staff account approved. Invite email sent.",
    }


@router.put("/{request_id}/reject", status_code=status.HTTP_200_OK)
async def reject_staff_account(
    request_id: str,
    data: StaffAccountReviewRequest,
    current_user=Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
):
    """Super admin rejects a pending staff account request."""
    request = await staff_account_service.reject_staff_request(
        db=db,
        request_id=request_id,
        rejector_id=current_user["id"],
        reason=data.rejection_reason,
    )

    return {
        "id": str(request.id),
        "status": request.status,
        "message": "Staff account request rejected.",
    }
