"""
Audit Logging Middleware

Automatically logs all mutating admin API requests (POST/PUT/PATCH/DELETE).
Captures actor, IP, user agent, endpoint, and response status.
"""

import json
import logging
import uuid
from datetime import datetime
from typing import Optional

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

from app.database import AsyncSessionLocal
from app.models.admin.audit_log import AuditLog

logger = logging.getLogger(__name__)

# HTTP methods that represent mutations
MUTATING_METHODS = {"POST", "PUT", "PATCH", "DELETE"}

# API prefixes to monitor
ADMIN_PREFIX = "/api/v1/admin"
STAFF_PREFIX = "/api/v1/staff"
MONITORED_PREFIXES = (ADMIN_PREFIX, STAFF_PREFIX)

# Paths to exclude from audit logging (health checks, etc.)
EXCLUDED_PATHS = {
    "/api/v1/admin/pulse/health",
    "/api/v1/admin/dashboard/overview",
    "/api/v1/staff/dashboard/overview",
}


def _extract_action(method: str, path: str) -> str:
    """Derive a human-readable action from the HTTP method and path."""
    # Remove prefix and leading slash
    relative = path
    for prefix in MONITORED_PREFIXES:
        relative = relative.replace(prefix, "")
    relative = relative.strip("/")
    parts = relative.split("/")

    # Build action string: resource.verb
    resource = parts[0] if parts else "unknown"

    verb_map = {
        "POST": "create",
        "PUT": "update",
        "PATCH": "update",
        "DELETE": "delete",
    }
    verb = verb_map.get(method, method.lower())

    # If there's a specific sub-action in the path, use it
    # e.g., /admin/users/{id}/deactivate -> users.deactivate
    if len(parts) >= 3 and not _is_uuid(parts[-1]):
        return f"{resource}.{parts[-1]}"
    elif len(parts) >= 2 and not _is_uuid(parts[-1]):
        return f"{resource}.{parts[-1]}"

    return f"{resource}.{verb}"


def _is_uuid(value: str) -> bool:
    """Check if a string looks like a UUID."""
    try:
        uuid.UUID(value)
        return True
    except (ValueError, AttributeError):
        return False


def _extract_resource_id(path: str) -> Optional[str]:
    """Extract resource ID (UUID) from the path if present."""
    cleaned = path
    for prefix in MONITORED_PREFIXES:
        cleaned = cleaned.replace(prefix, "")
    parts = cleaned.strip("/").split("/")
    for part in parts:
        if _is_uuid(part):
            return part
    return None


def _extract_resource_type(path: str) -> str:
    """Extract resource type from the path."""
    cleaned = path
    for prefix in MONITORED_PREFIXES:
        cleaned = cleaned.replace(prefix, "")
    parts = cleaned.strip("/").split("/")
    return parts[0] if parts else "unknown"


def _get_client_ip(request: Request) -> str:
    """Get client IP, checking for proxy headers."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    return request.client.host if request.client else "unknown"


class AuditMiddleware(BaseHTTPMiddleware):
    """Middleware that logs all mutating admin API requests to the audit_logs table."""

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        # Only audit admin/staff API mutation requests
        if not any(request.url.path.startswith(prefix) for prefix in MONITORED_PREFIXES):
            return await call_next(request)

        if request.method not in MUTATING_METHODS:
            return await call_next(request)

        if request.url.path in EXCLUDED_PATHS:
            return await call_next(request)

        # Capture request details before processing
        path = request.url.path
        method = request.method
        client_ip = _get_client_ip(request)
        user_agent = request.headers.get("User-Agent", "unknown")

        # Try to read request body for details (for POST/PUT/PATCH)
        request_body = None
        if method in {"POST", "PUT", "PATCH"}:
            try:
                body_bytes = await request.body()
                if body_bytes:
                    request_body = json.loads(body_bytes)
                    # Sanitize sensitive fields
                    for field in ("password", "secret", "token", "api_key", "secret_key"):
                        if field in request_body:
                            request_body[field] = "***REDACTED***"
            except (json.JSONDecodeError, Exception):
                request_body = None

        # Process the request
        response = await call_next(request)

        # Extract actor info from request state (set by auth middleware)
        actor_id = getattr(request.state, "user_id", None) if hasattr(request, "state") else None
        actor_email = getattr(request.state, "user_email", None) if hasattr(request, "state") else None
        actor_role = getattr(request.state, "user_role", None) if hasattr(request, "state") else None

        # Determine success/failure
        status = "success" if 200 <= response.status_code < 400 else "failure"

        # Log asynchronously (don't block the response)
        try:
            async with AsyncSessionLocal() as session:
                audit_entry = AuditLog(
                    actor_id=actor_id,
                    actor_email=actor_email or "unknown",
                    actor_role=actor_role or "unknown",
                    action=_extract_action(method, path),
                    resource_type=_extract_resource_type(path),
                    resource_id=_extract_resource_id(path),
                    details={
                        "method": method,
                        "path": path,
                        "status_code": response.status_code,
                        "request_body": request_body,
                        "query_params": dict(request.query_params) if request.query_params else None,
                    },
                    ip_address=client_ip,
                    user_agent=user_agent[:500],  # Truncate long user agents
                    status=status,
                )
                session.add(audit_entry)
                await session.commit()
        except Exception as e:
            # Never let audit logging break the actual request
            logger.error(f"Failed to write audit log: {e}")

        return response
