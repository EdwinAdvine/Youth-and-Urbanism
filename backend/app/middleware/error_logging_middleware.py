"""
Error Logging Middleware

Captures unhandled exceptions and 5xx responses, writing structured
error logs to the database. Follows the same async pattern as
audit_middleware.py - never blocks the response.
"""

from __future__ import annotations

import json
import logging
import traceback
import uuid
from datetime import datetime

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

from app.database import AsyncSessionLocal

logger = logging.getLogger(__name__)

# Sensitive fields to redact from request data
SENSITIVE_FIELDS = frozenset({
    "password", "password_hash", "secret", "token", "api_key",
    "secret_key", "access_token", "refresh_token", "authorization",
    "credit_card", "card_number", "cvv", "ssn",
})

# Paths to skip (health checks, static files)
SKIP_PATHS = frozenset({
    "/health",
    "/docs",
    "/redoc",
    "/openapi.json",
    "/favicon.ico",
})


def _sanitize_data(data: dict) -> dict:
    """Recursively redact sensitive fields from a dictionary."""
    if not isinstance(data, dict):
        return data
    sanitized = {}
    for key, value in data.items():
        if key.lower() in SENSITIVE_FIELDS:
            sanitized[key] = "***REDACTED***"
        elif isinstance(value, dict):
            sanitized[key] = _sanitize_data(value)
        else:
            sanitized[key] = value
    return sanitized


def _get_client_ip(request: Request) -> str:
    """Extract client IP, checking proxy headers."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    return request.client.host if request.client else "unknown"


class ErrorLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware that captures unhandled exceptions and logs them to the
    error_logs database table for admin monitoring and AI diagnosis.
    """

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        # Skip non-API paths
        if request.url.path in SKIP_PATHS:
            return await call_next(request)

        # Capture request metadata before processing
        path = request.url.path
        method = request.method
        client_ip = _get_client_ip(request)
        user_agent = request.headers.get("User-Agent", "unknown")

        try:
            response = await call_next(request)

            # Log 5xx server errors (not client errors)
            if response.status_code >= 500:
                # Try to get cached body (if route handler already read it)
                request_body = None
                if hasattr(request, "_body"):
                    try:
                        request_body = _sanitize_data(json.loads(request._body))
                    except (json.JSONDecodeError, Exception):
                        pass
                await self._log_error(
                    level="ERROR",
                    error_type="HTTPServerError",
                    message=f"HTTP {response.status_code} on {method} {path}",
                    stack_trace=None,
                    endpoint=path,
                    method=method,
                    request=request,
                    request_body=request_body,
                    client_ip=client_ip,
                    user_agent=user_agent,
                )

            return response

        except Exception as exc:
            # Capture the full exception with traceback
            tb = traceback.format_exc()
            # Try to get cached body (if route handler already read it)
            request_body = None
            if hasattr(request, "_body"):
                try:
                    request_body = _sanitize_data(json.loads(request._body))
                except (json.JSONDecodeError, Exception):
                    pass
            await self._log_error(
                level="CRITICAL",
                error_type=type(exc).__name__,
                message=str(exc),
                stack_trace=tb,
                endpoint=path,
                method=method,
                request=request,
                request_body=request_body,
                client_ip=client_ip,
                user_agent=user_agent,
            )
            # Re-raise so FastAPI's exception handlers can process it
            raise

    async def _log_error(
        self,
        level: str,
        error_type: str,
        message: str,
        stack_trace: str | None,
        endpoint: str,
        method: str,
        request: Request,
        request_body: dict | None,
        client_ip: str,
        user_agent: str,
    ) -> None:
        """Write error log entry to database asynchronously."""
        try:
            # Import here to avoid circular imports
            from app.models.admin.error_log import ErrorLog

            # Extract user info from request state (set by auth middleware)
            user_id = getattr(request.state, "user_id", None) if hasattr(request, "state") else None
            user_role = getattr(request.state, "user_role", None) if hasattr(request, "state") else None

            if AsyncSessionLocal is None:
                logger.warning("Cannot log error: database not initialized")
                return

            async with AsyncSessionLocal() as session:
                error_entry = ErrorLog(
                    level=level,
                    source="backend",
                    error_type=error_type,
                    message=message[:2000],  # Truncate very long messages
                    stack_trace=stack_trace,
                    endpoint=endpoint,
                    method=method,
                    user_id=user_id,
                    user_role=user_role,
                    request_data=request_body,
                    context={
                        "ip_address": client_ip,
                        "user_agent": user_agent[:500],
                        "query_params": dict(request.query_params) if request.query_params else None,
                    },
                )
                session.add(error_entry)
                await session.commit()

        except Exception as e:
            # Never let error logging break the actual request
            logger.error(f"Failed to write error log: {e}")
