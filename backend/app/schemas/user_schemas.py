"""
User Pydantic schemas for request/response validation.

This module defines all Pydantic models used for user authentication,
registration, profile management, and API responses.
"""

import re
from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator


class UserBase(BaseModel):
    """
    Base user schema with common fields.

    Used as a parent class for other user-related schemas.
    """
    email: EmailStr = Field(..., description="User's email address")
    role: str = Field(
        ...,
        description="User role in the system"
    )


class UserCreate(UserBase):
    """
    Schema for user registration.

    Includes password field with strength validation and optional profile data.
    Only allows self-registration for student, parent, and instructor roles.
    """
    password: str = Field(
        ...,
        min_length=8,
        max_length=100,
        description="User password (min 8 characters, must include uppercase, lowercase, digit, and special character)"
    )
    profile_data: dict = Field(
        default_factory=dict,
        description="Additional profile information stored as JSON"
    )

    @field_validator('role')
    @classmethod
    def validate_role(cls, v: str) -> str:
        """
        Validate that only allowed roles can self-register.

        Allowed roles: student, parent, instructor
        Restricted roles: admin, staff, partner (must be created by existing admin)

        Args:
            v: Role string to validate

        Returns:
            The validated role string

        Raises:
            ValueError: If role is not in the allowed whitelist
        """
        allowed_roles = ['student', 'parent']
        if v not in allowed_roles:
            raise ValueError(
                f'Invalid role for self-registration. Allowed roles: {", ".join(allowed_roles)}. '
                f'Instructors must apply at /become-instructor. Partners must apply at /become-partner. '
                f'Contact an administrator to create admin or staff accounts.'
            )
        return v

    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """
        Validate password strength requirements.

        Password must contain:
        - At least one uppercase letter
        - At least one lowercase letter
        - At least one digit
        - At least one special character

        Args:
            v: Password string to validate

        Returns:
            The validated password string

        Raises:
            ValueError: If password doesn't meet strength requirements
        """
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')

        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')

        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')

        if not re.search(r'[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/;\'`~]', v):
            raise ValueError('Password must contain at least one special character')

        return v


class UserLogin(BaseModel):
    """
    Schema for user login requests.

    Accepts email address or username for authentication.
    Children (under 18) use usernames; all other users use email.
    """
    identifier: str = Field(..., description="Email address or username")
    password: str = Field(..., description="User's password")


class TokenResponse(BaseModel):
    """
    Schema for JWT token response after successful authentication.

    Returns access token, refresh token, and expiration information.
    """
    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token for obtaining new access tokens")
    token_type: str = Field(default="bearer", description="Token type (always 'bearer')")
    expires_in: int = Field(..., description="Token expiration time in seconds")


class UserResponse(BaseModel):
    """
    Schema for returning user data in API responses.

    Excludes sensitive information like password hash.
    Configured to work with SQLAlchemy ORM models.
    """
    id: UUID = Field(..., description="Unique user identifier")
    email: Optional[str] = Field(None, description="User's email address")
    username: Optional[str] = Field(None, description="Username (used by children for login)")
    role: str = Field(..., description="User role in the system")
    full_name: Optional[str] = Field(None, description="User's full name")
    is_active: bool = Field(..., description="Whether the user account is active")
    is_verified: bool = Field(..., description="Whether the user's email has been verified")
    is_super_admin: bool = Field(default=False, description="Whether the user is a super admin")
    must_change_password: bool = Field(default=False, description="Whether user must change password")
    date_of_birth: Optional[date] = Field(None, description="User's date of birth")
    profile_data: dict = Field(default_factory=dict, description="Additional profile information")
    created_at: datetime = Field(..., description="Account creation timestamp")
    last_login: Optional[datetime] = Field(None, description="Last login timestamp")

    @model_validator(mode='after')
    def extract_full_name(self) -> 'UserResponse':
        """Extract full_name from profile_data if not set at model level."""
        if not self.full_name and self.profile_data:
            self.full_name = self.profile_data.get('full_name')
        return self

    class Config:
        """Pydantic configuration."""
        from_attributes = True  # Enable ORM mode for SQLAlchemy models (Pydantic v2)


class UserUpdate(BaseModel):
    """
    Schema for updating user profile information.

    All fields are optional to support partial updates.
    """
    email: Optional[EmailStr] = Field(None, description="Updated email address")
    profile_data: Optional[dict] = Field(None, description="Updated profile information")
    is_active: Optional[bool] = Field(None, description="Updated active status")


class PasswordChange(BaseModel):
    """
    Schema for password change requests.

    Requires current password for verification and validates new password strength.
    """
    current_password: str = Field(..., description="Current password for verification")
    new_password: str = Field(
        ...,
        min_length=8,
        max_length=100,
        description="New password (min 8 characters, must include uppercase, lowercase, digit, and special character)"
    )

    @field_validator('new_password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """
        Validate new password strength requirements.

        Password must contain:
        - At least one uppercase letter
        - At least one lowercase letter
        - At least one digit
        - At least one special character

        Args:
            v: Password string to validate

        Returns:
            The validated password string

        Raises:
            ValueError: If password doesn't meet strength requirements
        """
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')

        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')

        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')

        if not re.search(r'[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/;\'`~]', v):
            raise ValueError('Password must contain at least one special character')

        return v


class PasswordReset(BaseModel):
    """
    Schema for password reset requests (forgot password flow).

    Used to initiate password reset by sending reset link to email.
    """
    email: EmailStr = Field(..., description="Email address to send password reset link")


class PasswordResetConfirm(BaseModel):
    """
    Schema for confirming password reset with token.

    Used to complete password reset after clicking reset link.
    """
    token: str = Field(..., description="Password reset token from email")
    new_password: str = Field(
        ...,
        min_length=8,
        max_length=100,
        description="New password (min 8 characters, must include uppercase, lowercase, digit, and special character)"
    )

    @field_validator('new_password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """
        Validate new password strength requirements.

        Password must contain:
        - At least one uppercase letter
        - At least one lowercase letter
        - At least one digit
        - At least one special character

        Args:
            v: Password string to validate

        Returns:
            The validated password string

        Raises:
            ValueError: If password doesn't meet strength requirements
        """
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')

        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')

        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')

        if not re.search(r'[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/;\'`~]', v):
            raise ValueError('Password must contain at least one special character')

        return v


class EmailVerification(BaseModel):
    """
    Schema for email verification with token.

    Used to verify user's email address after registration.
    """
    token: str = Field(..., description="Email verification token")


class RefreshTokenRequest(BaseModel):
    """
    Schema for refresh token requests.

    Used to obtain new access token using refresh token.
    """
    refresh_token: str = Field(..., description="Valid refresh token")
