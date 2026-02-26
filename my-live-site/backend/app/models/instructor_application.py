"""
InstructorApplication Model for Urban Home School

Stores instructor/educator applications for review and approval.
Supports document uploads, qualification tracking, and admin review workflow.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.database import Base


class InstructorApplication(Base):
    """
    Instructor application record for the educator onboarding workflow.

    Users or visitors can submit applications to become instructors.
    Admins review, approve, or reject applications with notes.

    Attributes:
        id: Unique identifier (UUID)
        user_id: Optional reference to existing user account
        full_name: Applicant's full name
        email: Applicant's email address
        phone: Applicant's phone number
        qualifications: Description of academic/professional qualifications
        experience_years: Years of teaching experience
        subjects: JSONB array of subject strings the applicant can teach
        bio: Short biography or personal statement
        cv_url: URL to uploaded CV/resume document
        id_document_front_url: URL to uploaded ID document (front)
        id_document_back_url: URL to uploaded ID document (back)
        status: Application status (pending/approved/rejected)
        reviewed_by: Admin user who reviewed the application
        reviewed_at: When the application was reviewed
        review_notes: Admin notes about the review decision
        created_at: When the application was submitted
        updated_at: When the application was last modified
    """

    __tablename__ = "instructor_applications"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Link to existing user (optional)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Applicant information
    full_name = Column(String(200), nullable=False)
    email = Column(String(200), nullable=False, index=True)
    phone = Column(String(50), nullable=True)

    # Qualifications
    qualifications = Column(Text, nullable=False)
    experience_years = Column(Integer, default=0, nullable=False)
    subjects = Column(JSONB, nullable=True)  # Array of subject strings
    bio = Column(Text, nullable=True)

    # Document uploads
    cv_url = Column(String(500), nullable=True)
    id_document_front_url = Column(String(500), nullable=True)
    id_document_back_url = Column(String(500), nullable=True)

    # Application status: pending, approved, rejected
    status = Column(String(20), default="pending", nullable=False, index=True)

    # Review information
    reviewed_by = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    reviewed_at = Column(DateTime, nullable=True)
    review_notes = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    def __repr__(self) -> str:
        return (
            f"<InstructorApplication(id={self.id}, full_name='{self.full_name}', "
            f"email='{self.email}', status='{self.status}')>"
        )
