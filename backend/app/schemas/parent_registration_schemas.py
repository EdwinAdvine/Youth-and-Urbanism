"""Schemas for parent multi-step registration with children."""

from __future__ import annotations

import re
from datetime import date
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator


class ChildRegistrationData(BaseModel):
    """Data for registering a single child during parent registration."""
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    date_of_birth: date = Field(..., description="Child must be under 18")
    grade_level: str = Field(..., description="e.g. 'Grade 1', 'ECD 1'")
    preferred_username: Optional[str] = Field(None, max_length=50, description="Parent can override generated username")

    @field_validator('date_of_birth')
    @classmethod
    def validate_child_age(cls, v: date) -> date:
        today = date.today()
        age = today.year - v.year - ((today.month, today.day) < (v.month, v.day))
        if age >= 18:
            raise ValueError('Child must be under 18 years old')
        if age < 0:
            raise ValueError('Date of birth cannot be in the future')
        return v


class ParentRegistrationWithChildren(BaseModel):
    """Schema for parent registration with mandatory child adding."""
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    full_name: str = Field(..., min_length=2, max_length=200)
    phone_number: Optional[str] = None
    children: list[ChildRegistrationData] = Field(..., min_length=1, max_length=5)

    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/;\'`~]', v):
            raise ValueError('Password must contain at least one special character')
        return v

    @field_validator('children')
    @classmethod
    def validate_children_count(cls, v):
        if len(v) < 1:
            raise ValueError('At least one child is required for parent registration')
        if len(v) > 5:
            raise ValueError('Maximum 5 children allowed per parent')
        return v


class UsernameGenerationRequest(BaseModel):
    """Request schema for generating username suggestions."""
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)


class UsernameGenerationResponse(BaseModel):
    """Response schema for username suggestions."""
    suggestions: list[str]


class ChildSummary(BaseModel):
    """Summary of a created child account."""
    full_name: str
    username: str
    grade_level: str
    admission_number: str
    setup_link: str


class ParentRegistrationResponse(BaseModel):
    """Response after successful parent registration."""
    parent_id: str
    parent_email: str
    children: list[ChildSummary]
    message: str
