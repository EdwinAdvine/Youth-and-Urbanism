"""Custom exception handlers for the FastAPI application."""

import logging

from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import settings

logger = logging.getLogger(__name__)


async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handle HTTP exceptions with custom JSON response."""
    logger.warning(f"HTTP {exc.status_code} error on {request.url.path}: {exc.detail}")

    content = {
        "detail": exc.detail,
        "status_code": exc.status_code,
    }
    if settings.debug:
        content["path"] = str(request.url.path)

    return JSONResponse(status_code=exc.status_code, content=content)


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle request validation errors with detailed error information."""
    logger.warning(f"Validation error on {request.url.path}: {exc.errors()}")

    content = {
        "detail": "Validation error",
        "status_code": 422,
        "errors": exc.errors(),
    }
    if settings.debug:
        content["path"] = str(request.url.path)

    return JSONResponse(status_code=422, content=content)


async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions with generic error response."""
    logger.error(f"Unhandled exception on {request.url.path}: {str(exc)}", exc_info=True)

    # Never expose internal error details in production
    content = {
        "detail": "Internal server error",
        "status_code": 500,
    }
    if settings.debug:
        content["detail"] = str(exc)
        content["path"] = str(request.url.path)

    return JSONResponse(status_code=500, content=content)
