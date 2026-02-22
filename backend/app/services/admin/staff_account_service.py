"""Staff account creation and approval service."""

import logging
from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.staff_account_request import StaffAccountRequest
from app.utils.security import create_access_token, get_password_hash
from app.config import settings

logger = logging.getLogger(__name__)


async def create_staff_request(
    db: AsyncSession,
    email: str,
    full_name: str,
    phone: str | None,
    department: str | None,
    requesting_user_id: str,
    is_super_admin: bool,
) -> StaffAccountRequest:
    """Create a staff account request. Auto-approves if from super admin."""
    # Check email not already registered
    existing = await db.execute(select(User).where(User.email == email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered.")

    # Check no pending request for this email
    pending = await db.execute(
        select(StaffAccountRequest).where(
            StaffAccountRequest.email == email,
            StaffAccountRequest.status == "pending",
        )
    )
    if pending.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="A pending request for this email already exists.")

    request = StaffAccountRequest(
        email=email,
        full_name=full_name,
        phone=phone,
        department=department,
        requested_by=UUID(requesting_user_id),
        requested_by_is_super=is_super_admin,
    )

    if is_super_admin:
        # Auto-approve: generate invite token immediately
        request.status = "approved"
        request.approved_by = UUID(requesting_user_id)
        request.approved_at = datetime.now(timezone.utc)

        invite_token = create_access_token(
            data={"sub": str(request.id), "type": "staff_invite", "email": email},
            expires_delta=timedelta(hours=72),
        )
        request.invite_token = invite_token
        request.invite_expires_at = datetime.now(timezone.utc) + timedelta(hours=72)

    db.add(request)
    await db.commit()
    await db.refresh(request)

    return request


async def approve_staff_request(
    db: AsyncSession,
    request_id: str,
    approver_id: str,
) -> StaffAccountRequest:
    """Super admin approves a pending staff account request."""
    result = await db.execute(
        select(StaffAccountRequest).where(StaffAccountRequest.id == UUID(request_id))
    )
    request = result.scalar_one_or_none()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found.")
    if request.status != "pending":
        raise HTTPException(status_code=400, detail=f"Request is already {request.status}.")

    # Check email still not taken
    existing = await db.execute(select(User).where(User.email == request.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email has been registered since the request was created.")

    request.status = "approved"
    request.approved_by = UUID(approver_id)
    request.approved_at = datetime.now(timezone.utc)

    invite_token = create_access_token(
        data={"sub": str(request.id), "type": "staff_invite", "email": request.email},
        expires_delta=timedelta(hours=72),
    )
    request.invite_token = invite_token
    request.invite_expires_at = datetime.now(timezone.utc) + timedelta(hours=72)

    await db.commit()
    await db.refresh(request)
    return request


async def reject_staff_request(
    db: AsyncSession,
    request_id: str,
    rejector_id: str,
    reason: str | None = None,
) -> StaffAccountRequest:
    """Super admin rejects a pending staff account request."""
    result = await db.execute(
        select(StaffAccountRequest).where(StaffAccountRequest.id == UUID(request_id))
    )
    request = result.scalar_one_or_none()
    if not request:
        raise HTTPException(status_code=404, detail="Request not found.")
    if request.status != "pending":
        raise HTTPException(status_code=400, detail=f"Request is already {request.status}.")

    request.status = "rejected"
    request.approved_by = UUID(rejector_id)
    request.approved_at = datetime.now(timezone.utc)
    request.rejection_reason = reason

    await db.commit()
    await db.refresh(request)
    return request


async def list_staff_requests(
    db: AsyncSession,
    status_filter: str | None = None,
    requesting_user_id: str | None = None,
) -> list[StaffAccountRequest]:
    """List staff account requests with optional filtering."""
    query = select(StaffAccountRequest).order_by(StaffAccountRequest.created_at.desc())
    if status_filter:
        query = query.where(StaffAccountRequest.status == status_filter)
    if requesting_user_id:
        query = query.where(StaffAccountRequest.requested_by == UUID(requesting_user_id))
    result = await db.execute(query)
    return list(result.scalars().all())
