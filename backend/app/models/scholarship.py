"""
Scholarship Application Model for Urban Home School

Stores scholarship applications from students and parent/guardians
targeting underprivileged children in informal urban settlements in Kenya.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class ScholarshipApplication(Base):
    """
    Scholarship application record.

    Attributes:
        id: Unique identifier (UUID)
        applicant_type: 'student' or 'parent'
        full_name: Applicant's full name
        email: Applicant's email address
        phone: Applicant's phone number
        student_name: Name of the child (if applicant is parent)
        student_age: Age of the child
        school_name: Name of child's school
        grade: Current grade/class
        settlement: Name of the settlement/location
        county: County in Kenya
        reason: Why they need the scholarship
        supporting_info: Additional supporting information
        status: Application status (pending/approved/rejected)
        reviewed_by: Admin who reviewed it
        reviewed_at: When it was reviewed
        review_notes: Admin notes
        created_at: Submission time
        updated_at: Last modification time
    """

    __tablename__ = "scholarship_applications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Who is applying
    applicant_type = Column(String(20), nullable=False)  # 'student' or 'parent'
    full_name = Column(String(200), nullable=False)
    email = Column(String(200), nullable=False, index=True)
    phone = Column(String(50), nullable=True)

    # Child details
    student_name = Column(String(200), nullable=True)  # if parent is applying
    student_age = Column(String(10), nullable=True)
    school_name = Column(String(200), nullable=True)
    grade = Column(String(50), nullable=True)

    # Location
    settlement = Column(String(200), nullable=True)
    county = Column(String(100), nullable=True)

    # Application content
    reason = Column(Text, nullable=False)
    supporting_info = Column(Text, nullable=True)

    # Status: pending, approved, rejected
    status = Column(String(20), default="pending", nullable=False, index=True)

    # Review
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
            f"<ScholarshipApplication(id={self.id}, name='{self.full_name}', "
            f"status='{self.status}')>"
        )
