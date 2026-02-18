"""
Certificate Model for Urban Home School

Stores issued certificates for course completions with public validation support.
Each certificate has a unique serial number that can be validated publicly.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.database import Base


class Certificate(Base):
    """
    Certificate record for course completion validation.

    Each certificate has a unique serial number (format: UHS-YYYYMMDD-XXXXX)
    that can be verified publicly without authentication. Admins and instructors
    can issue certificates, and admins can revoke them.

    Attributes:
        id: Unique identifier (UUID)
        serial_number: Unique, publicly verifiable serial number
        student_id: Reference to the student user
        student_name: Denormalized student name for display
        course_id: Reference to the completed course
        course_name: Denormalized course name for display
        grade: Achievement grade (e.g., "A", "B+", "Pass")
        completion_date: When the course was completed
        issued_at: When the certificate was issued
        is_valid: Whether the certificate is currently valid
        revoked_at: When the certificate was revoked (if applicable)
        metadata: Flexible JSONB for extra certificate info
    """

    __tablename__ = "certificates"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Serial number for public validation
    serial_number = Column(String(50), unique=True, nullable=False, index=True)

    # Student information
    student_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    student_name = Column(String(200), nullable=False)

    # Course information
    course_id = Column(
        UUID(as_uuid=True),
        ForeignKey("courses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    course_name = Column(String(500), nullable=False)

    # Achievement
    grade = Column(String(10), nullable=True)

    # Dates
    completion_date = Column(DateTime, nullable=False)
    issued_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Validity
    is_valid = Column(Boolean, default=True, nullable=False, index=True)
    revoked_at = Column(DateTime, nullable=True)

    # Extra metadata
    metadata_ = Column("metadata", JSONB, default={}, nullable=True)

    def __repr__(self) -> str:
        return (
            f"<Certificate(id={self.id}, serial_number='{self.serial_number}', "
            f"student_name='{self.student_name}', course_name='{self.course_name}', "
            f"is_valid={self.is_valid})>"
        )
