"""Pydantic schemas for admin permission management."""

from datetime import datetime
from typing import Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class PermissionResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    resource: str
    action: str
    field_restrictions: Optional[dict] = None
    is_active: bool

    class Config:
        from_attributes = True


class RolePermissionEntry(BaseModel):
    permission_id: UUID
    permission_name: str
    granted: bool
    expires_at: Optional[datetime] = None


class PermissionMatrixResponse(BaseModel):
    """The full matrix: role -> list of granted permissions."""
    roles: Dict[str, List[RolePermissionEntry]]


class RolePermissionUpdate(BaseModel):
    """Grant or revoke a permission for a role."""
    permission_id: UUID
    granted: bool


class UserOverrideRequest(BaseModel):
    permission_id: UUID
    granted: bool
    reason: Optional[str] = None
    expires_in_days: Optional[int] = None
