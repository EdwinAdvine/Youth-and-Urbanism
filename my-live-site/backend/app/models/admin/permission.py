"""
Permission Models

Custom permission matrix with field-level granularity for admin access control.
Supports role-based permissions, per-user overrides, and temporary access.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, UUID, ForeignKey, Text
from sqlalchemy.dialects.postgresql import JSONB
from app.database import Base


class Permission(Base):
    """
    A named permission granting access to a specific resource and action.

    Each permission is scoped to one resource (e.g. 'users', 'courses') and
    one action (e.g. 'read', 'write', 'delete'). Optional field_restrictions
    (JSONB) limit which columns a holder may view or edit, enabling field-level
    access control beyond simple CRUD.
    """

    __tablename__ = "permissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(String(500), nullable=True)
    resource = Column(String(100), nullable=False, index=True)
    action = Column(String(50), nullable=False)
    field_restrictions = Column(JSONB, default={})
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<Permission(name='{self.name}', resource='{self.resource}', action='{self.action}')>"


class RolePermission(Base):
    """
    Maps a user role to a permission, optionally with an expiry date.

    When a role (e.g. 'admin', 'staff') is linked here, every user with that
    role inherits the permission. The granted_by field tracks which admin
    created the mapping. An optional expires_at allows temporary elevations.
    """

    __tablename__ = "role_permissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    role = Column(String(50), nullable=False, index=True)
    permission_id = Column(UUID(as_uuid=True), ForeignKey("permissions.id", ondelete="CASCADE"), nullable=False)
    granted_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    granted_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=True)

    def __repr__(self) -> str:
        return f"<RolePermission(role='{self.role}', permission_id={self.permission_id})>"


class UserPermissionOverride(Base):
    """
    Per-user permission grant or denial that overrides the role-based defaults.

    Used when a specific user needs an extra permission their role does not
    include (granted=True) or should be blocked from a permission their role
    normally provides (granted=False). Includes a reason for audit purposes
    and an optional expires_at for time-limited overrides.
    """

    __tablename__ = "user_permission_overrides"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    permission_id = Column(UUID(as_uuid=True), ForeignKey("permissions.id", ondelete="CASCADE"), nullable=False)
    granted = Column(Boolean, default=True, nullable=False)
    granted_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    reason = Column(Text, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<UserPermissionOverride(user_id={self.user_id}, granted={self.granted})>"
