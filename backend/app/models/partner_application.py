"""
PartnerApplication Model for Urban Home School

Stores partner/sponsor applications for review and approval.
Mirrors the InstructorApplication workflow pattern.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class PartnerApplication(Base):
    """
    Partner application record for the partner onboarding workflow.

    Organizations or individuals submit applications to become partners.
    Admins review, approve, or reject applications with notes.
    On approval, an invite token is generated and emailed.

    Attributes:
        id: Unique identifier (UUID)
        user_id: Optional reference to existing user account
        organization_name: Name of the partner organization
        organization_type: Type (NGO, Corporate, Government, Foundation, Individual)
        contact_person: Primary contact person name
        email: Contact email address
        phone: Contact phone number
        description: Description of the organization and its goals
        partnership_goals: What the partner hopes to achieve
        website: Organization website URL
        status: Application status (pending/approved/rejected/setup_complete)
        invite_token: One-time setup token (set on approval)
        invite_expires_at: Token expiry time
        reviewed_by: Admin who reviewed the application
        reviewed_at: When the application was reviewed
        review_notes: Admin notes about the review decision
        created_at: When the application was submitted
        updated_at: When the application was last modified
    """

    __tablename__ = "partner_applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Link to existing user (optional)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Organization information
    organization_name = Column(String(300), nullable=False)
    organization_type = Column(String(50), nullable=False)  # NGO, Corporate, Government, Foundation, Individual
    contact_person = Column(String(200), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    phone = Column(String(50), nullable=True)
    description = Column(Text, nullable=False)
    partnership_goals = Column(Text, nullable=True)
    website = Column(String(500), nullable=True)

    # Application status: pending, approved, rejected, setup_complete
    status = Column(String(20), default="pending", nullable=False, index=True)

    # Invite token fields (set on approval)
    invite_token = Column(String(500), nullable=True, unique=True)
    invite_expires_at = Column(DateTime(timezone=True), nullable=True)

    # Review information
    reviewed_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    review_notes = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    def __repr__(self) -> str:
        return (
            f"<PartnerApplication(id={self.id}, organization_name='{self.organization_name}', "
            f"email='{self.email}', status='{self.status}')>"
        )
