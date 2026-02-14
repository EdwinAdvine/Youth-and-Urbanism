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
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, UUID
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
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)

    # Role-based access control
    # Roles: 'student', 'parent', 'instructor', 'admin', 'partner', 'staff'
    role = Column(String(50), nullable=False, index=True)

    # Status flags
    is_active = Column(Boolean, default=True, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False, index=True)
    is_verified = Column(Boolean, default=False, nullable=False)

    # Profile data (flexible JSONB for role-specific fields)
    profile_data = Column(JSONB, default={}, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_login = Column(DateTime, nullable=True)

    # Soft delete tracking
    deleted_at = Column(DateTime, nullable=True)

    # Relationships
    subscriptions = relationship("Subscription", back_populates="user", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    payment_methods = relationship("PaymentMethod", back_populates="user", cascade="all, delete-orphan")
    wallet = relationship("Wallet", back_populates="user", uselist=False, cascade="all, delete-orphan")
    instructor_profile = relationship("InstructorProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")

    def __repr__(self) -> str:
        """String representation of User for debugging."""
        return f"<User(id={self.id}, email='{self.email}', role='{self.role}', is_active={self.is_active})>"

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
