"""
StaffAccountRequest Model for Urban Home School

Tracks staff account creation requests from admins.
Super admin-created requests are auto-approved; admin-created requests require super admin approval.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class StaffAccountRequest(Base):
    """
    Staff account creation request for the admin-managed onboarding workflow.

    Admins or super admins can request staff account creation.
    Super admin requests are auto-approved. Admin requests need super admin approval.

    Attributes:
        id: Unique identifier (UUID)
        email: Email for the new staff account
        full_name: Staff member's full name
        phone: Staff member's phone number
        department: Department assignment
        requested_by: Admin who requested the creation
        requested_by_is_super: Whether the requester is a super admin
        status: Request status (pending/approved/rejected)
        approved_by: Super admin who approved the request
        approved_at: When the request was approved
        rejection_reason: Reason for rejection (if rejected)
        invite_token: One-time setup token (set on approval)
        invite_expires_at: Token expiry time
        user_id: Created user account (set after staff completes setup)
        created_at: When the request was submitted
        updated_at: When the request was last modified
    """

    __tablename__ = "staff_account_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Staff member info
    email = Column(String(255), nullable=False, index=True)
    full_name = Column(String(200), nullable=False)
    phone = Column(String(50), nullable=True)
    department = Column(String(100), nullable=True)

    # Who requested the creation
    requested_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    requested_by_is_super = Column(Boolean, default=False, nullable=False)

    # Approval tracking
    status = Column(String(20), default="pending", nullable=False, index=True)
    approved_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    approved_at = Column(DateTime(timezone=True), nullable=True)
    rejection_reason = Column(Text, nullable=True)

    # Invite token (set on approval)
    invite_token = Column(String(500), nullable=True, unique=True)
    invite_expires_at = Column(DateTime(timezone=True), nullable=True)

    # Created user account (set after setup)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    def __repr__(self) -> str:
        return (
            f"<StaffAccountRequest(id={self.id}, full_name='{self.full_name}', "
            f"email='{self.email}', status='{self.status}')>"
        )
