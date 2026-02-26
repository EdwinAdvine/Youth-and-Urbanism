"""
User Model

This module defines the User model for the Urban Home School platform.
The User model supports multi-role authentication and authorization with
role-based access control (RBAC) for students, parents, instructors,
administrators, partners, and staff members.

Features:
- UUID primary keys for enhanced security
- Flexible profile data storage using JSONB
- Soft delete capability for data recovery
- Email verification support
- Timestamp tracking for auditing
- Role-based property helpers
"""

import uuid
from datetime import date, datetime, timezone
from sqlalchemy import Column, String, Boolean, Date, DateTime, UUID
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    """
    User model representing all users in the Urban Home School platform.

    Supports six distinct roles:
    - student: Enrolled learners
    - parent: Parent/guardian accounts
    - instructor: External educators/content creators
    - admin: Platform administrators
    - partner: External partners and organizations
    - staff: Internal staff members

    The profile_data JSONB field allows role-specific data storage without
    schema migrations, enabling flexible profile customization per role.
    """

    __tablename__ = "users"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Authentication
    email = Column(String(255), unique=True, nullable=True, index=True)
    username = Column(String(50), unique=True, nullable=True, index=True)
    password_hash = Column(String(255), nullable=False)

    # Role-based access control
    # Roles: 'student', 'parent', 'instructor', 'admin', 'partner', 'staff'
    role = Column(String(50), nullable=False, index=True)

    # Super admin flag (only meaningful when role == 'admin')
    is_super_admin = Column(Boolean, default=False, nullable=False)

    # Status flags
    is_active = Column(Boolean, default=True, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False, index=True)
    is_verified = Column(Boolean, default=False, nullable=False)

    # Password change enforcement (for staff accounts created by admins)
    must_change_password = Column(Boolean, default=False, nullable=False)
    password_change_deadline = Column(DateTime(timezone=True), nullable=True)

    # Date of birth (for age verification and child/adult distinction)
    date_of_birth = Column(Date, nullable=True)

    # Profile data (flexible JSONB for role-specific fields)
    profile_data = Column(JSONB, default=dict, nullable=False)

    # Timestamps
    # CRITICAL FIX (M-05): Replace deprecated datetime.utcnow with datetime.now(timezone.utc)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    last_login = Column(DateTime(timezone=True), nullable=True)

    # Soft delete tracking
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    subscriptions = relationship("Subscription", back_populates="user", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    payment_methods = relationship("PaymentMethod", back_populates="user", cascade="all, delete-orphan")
    wallet = relationship("Wallet", back_populates="user", uselist=False, cascade="all, delete-orphan")
    # CRITICAL FIX (H-19): Added missing student_profile relationship
    # foreign_keys required because Student has two FKs to users (user_id + parent_id)
    student_profile = relationship("Student", back_populates="user", uselist=False, cascade="all, delete-orphan", foreign_keys="[Student.user_id]")
    instructor_profile = relationship("InstructorProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    partner_profile = relationship("PartnerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")

    def __repr__(self) -> str:
        """String representation of User for debugging."""
        return f"<User(id={self.id}, email='{self.email}', role='{self.role}', is_active={self.is_active})>"

    @property
    def student_id(self):
        """Return the linked Student record's ID (None if not loaded or not a student)."""
        if self.student_profile is not None:
            return self.student_profile.id
        return None

    @property
    def is_student(self) -> bool:
        """Check if the user has the student role."""
        return self.role == 'student'

    @property
    def is_admin(self) -> bool:
        """Check if the user has the admin role."""
        return self.role == 'admin'

    @property
    def is_parent(self) -> bool:
        """Check if the user has the parent role."""
        return self.role == 'parent'

    @property
    def is_instructor(self) -> bool:
        """Check if the user has the instructor role."""
        return self.role == 'instructor'

    @property
    def is_partner(self) -> bool:
        """Check if the user has the partner role."""
        return self.role == 'partner'

    @property
    def is_staff(self) -> bool:
        """Check if the user has the staff role."""
        return self.role == 'staff'

    @property
    def is_super(self) -> bool:
        """Check if user is a super admin (admin role + is_super_admin flag)."""
        return self.role == 'admin' and self.is_super_admin

    @property
    def is_child(self) -> bool:
        """Check if user is an under-18 student based on date_of_birth."""
        if self.role != 'student' or self.date_of_birth is None:
            return False
        today = date.today()
        age = today.year - self.date_of_birth.year - (
            (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
        )
        return age < 18
