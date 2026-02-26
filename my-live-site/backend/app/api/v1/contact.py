"""
Contact Form API Endpoints

Public contact form submission and admin management of contact messages.
Supports listing, reading, and replying to messages.
"""

from typing import Optional
from uuid import UUID
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.contact import ContactMessage
from app.utils.security import get_current_user
from app.schemas.contact_schemas import (
    ContactCreate,
    ContactReply,
    ContactResponse,
    ContactListResponse,
)


router = APIRouter(prefix="/contact", tags=["Contact"])


# ============================================================================
# Public Endpoints
# ============================================================================

@router.post(
    "",
    response_model=ContactResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit contact form",
    description="Public endpoint to submit a contact form message. No authentication required.",
)
async def submit_contact_message(
    data: ContactCreate,
    db: AsyncSession = Depends(get_db),
) -> ContactResponse:
    """Submit a contact form message (public, no auth required)."""
    contact_message = ContactMessage(
        name=data.name,
        email=data.email,
        subject=data.subject,
        message=data.message,
    )

    db.add(contact_message)
    await db.flush()
    await db.refresh(contact_message)

    return ContactResponse.model_validate(contact_message)


# ============================================================================
# Admin Endpoints
# ============================================================================

@router.get(
    "",
    response_model=ContactListResponse,
    status_code=status.HTTP_200_OK,
    summary="List contact messages",
    description="Admin-only endpoint to list all contact form messages with optional filtering.",
)
async def list_contact_messages(
    is_read: Optional[bool] = Query(None, description="Filter by read status"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Number of records to return"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ContactListResponse:
    """List all contact messages (admin only)."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    # Build query
    query = select(ContactMessage)
    count_query = select(func.count(ContactMessage.id))

    if is_read is not None:
        query = query.where(ContactMessage.is_read == is_read)
        count_query = count_query.where(ContactMessage.is_read == is_read)

    # Get total count
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    # Get paginated results
    query = query.order_by(ContactMessage.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    messages = result.scalars().all()

    return ContactListResponse(
        messages=[ContactResponse.model_validate(m) for m in messages],
        total=total,
    )


@router.get(
    "/{message_id}",
    response_model=ContactResponse,
    status_code=status.HTTP_200_OK,
    summary="Get contact message",
    description="Admin-only endpoint to get a single contact message by ID.",
)
async def get_contact_message(
    message_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ContactResponse:
    """Get a single contact message (admin only)."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    result = await db.execute(
        select(ContactMessage).where(ContactMessage.id == message_id)
    )
    message = result.scalar_one_or_none()

    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact message not found",
        )

    return ContactResponse.model_validate(message)


@router.put(
    "/{message_id}/read",
    response_model=ContactResponse,
    status_code=status.HTTP_200_OK,
    summary="Mark message as read",
    description="Admin-only endpoint to mark a contact message as read.",
)
async def mark_message_as_read(
    message_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ContactResponse:
    """Mark a contact message as read (admin only)."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    result = await db.execute(
        select(ContactMessage).where(ContactMessage.id == message_id)
    )
    message = result.scalar_one_or_none()

    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact message not found",
        )

    message.is_read = True
    message.read_at = datetime.utcnow()
    await db.flush()
    await db.refresh(message)

    return ContactResponse.model_validate(message)


@router.put(
    "/{message_id}/reply",
    response_model=ContactResponse,
    status_code=status.HTTP_200_OK,
    summary="Reply to message",
    description="Admin-only endpoint to reply to a contact message.",
)
async def reply_to_message(
    message_id: UUID,
    data: ContactReply,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ContactResponse:
    """Reply to a contact message (admin only)."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    result = await db.execute(
        select(ContactMessage).where(ContactMessage.id == message_id)
    )
    message = result.scalar_one_or_none()

    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact message not found",
        )

    message.reply_message = data.reply_message
    message.replied_at = datetime.utcnow()

    # Also mark as read if not already
    if not message.is_read:
        message.is_read = True
        message.read_at = datetime.utcnow()

    await db.flush()
    await db.refresh(message)

    return ContactResponse.model_validate(message)
