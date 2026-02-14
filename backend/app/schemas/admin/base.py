"""
Shared Pydantic schemas for all admin API endpoints.

Provides standard pagination, response wrappers, and common types
used across every admin phase.
"""

from datetime import datetime
from typing import Generic, List, Optional, TypeVar
from uuid import UUID

from pydantic import BaseModel, Field

T = TypeVar("T")


# ---------------------------------------------------------------------------
# Pagination
# ---------------------------------------------------------------------------

class PaginationParams(BaseModel):
    """Standard query parameters for paginated endpoints."""
    page: int = Field(1, ge=1, description="Page number (1-indexed)")
    page_size: int = Field(20, ge=1, le=100, description="Items per page")
    search: Optional[str] = Field(None, description="Free-text search filter")
    sort_by: Optional[str] = Field(None, description="Column to sort by")
    sort_dir: Optional[str] = Field("desc", description="Sort direction: asc | desc")


class PaginatedResponse(BaseModel, Generic[T]):
    """Wrapper for paginated list responses."""
    items: List[T] = []  # type: ignore[assignment]
    total: int = 0
    page: int = 1
    page_size: int = 20
    total_pages: int = 0


# ---------------------------------------------------------------------------
# Standard response wrappers
# ---------------------------------------------------------------------------

class SuccessResponse(BaseModel):
    """Generic success envelope."""
    success: bool = True
    message: str = "OK"
    data: Optional[dict] = None


class ErrorResponse(BaseModel):
    """Generic error envelope."""
    success: bool = False
    message: str
    detail: Optional[str] = None


# ---------------------------------------------------------------------------
# Common embedded types
# ---------------------------------------------------------------------------

class AuditLogEntry(BaseModel):
    """Read-only representation of an audit log row."""
    id: UUID
    actor_id: UUID
    actor_email: str
    actor_role: str
    action: str
    resource_type: str
    resource_id: Optional[UUID] = None
    details: Optional[dict] = None
    ip_address: Optional[str] = None
    status: str = "success"
    created_at: datetime

    class Config:
        from_attributes = True


class BulkActionResult(BaseModel):
    """Result of a bulk operation (deactivate, delete, etc.)."""
    success: bool
    action: str
    affected: int
    total_requested: int
    errors: List[str] = []


class ExportConfig(BaseModel):
    """Configuration for data exports."""
    format: str = Field("csv", description="csv | excel | pdf")
    filters: Optional[dict] = None
    columns: Optional[List[str]] = None
