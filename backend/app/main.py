"""
Urban Home School - FastAPI Main Application

Composition root: creates the FastAPI app, attaches middleware, registers routes.
Business logic lives in services/; route handlers in api/; middleware in middleware/.
"""

import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.staticfiles import StaticFiles

from app.config import settings
from app.database import check_db_connection
from app.lifespan import lifespan

# Configure logging (supports JSON format for production observability)
def _setup_logging():
    handler = logging.StreamHandler()

    if settings.log_format == "json":
        from pythonjsonlogger import jsonlogger
        formatter = jsonlogger.JsonFormatter(
            "%(asctime)s %(name)s %(levelname)s %(message)s",
            rename_fields={"asctime": "timestamp", "levelname": "level"},
        )
    else:
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )

    handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, settings.log_level))
    root_logger.handlers = [handler]

    if settings.log_file:
        file_handler = logging.FileHandler(settings.log_file)
        file_handler.setFormatter(formatter)
        root_logger.addHandler(file_handler)

_setup_logging()

logger = logging.getLogger(__name__)

# ── Create FastAPI application ──────────────────────────────────────

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="""
    **Urban Home School (The Bird AI)** - AI-powered educational platform for Kenyan students

    ## Features

    * **Multi-Role System**: Students, Parents, Instructors, Admins, Partners, Staff
    * **CBC-Aligned Curriculum**: Complete Kenyan Competency-Based Curriculum coverage
    * **AI Tutoring**: Multi-AI orchestration with Gemini, Claude, GPT-4, and Grok
    * **Interactive Learning**: Quizzes, assignments, projects, and assessments
    * **Payment Integration**: M-Pesa, Stripe, and PayPal support
    * **Real-Time Chat**: Instant messaging and AI CoPilot assistance
    * **Progress Tracking**: Comprehensive analytics and performance monitoring
    * **Content Creation**: Instructor-created courses and materials
    * **Parent Dashboard**: Monitor child progress and engagement

    ## Authentication

    All protected endpoints require JWT authentication via Bearer token:
    ```
    Authorization: Bearer <your-jwt-token>
    ```

    ## API Versioning

    Current API version: v1 (prefix: `/api/v1`)
    """,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
    contact={
        "name": "Urban Home School Support",
        "email": "support@urbanhomeschool.ke",
    },
    license_info={
        "name": "Proprietary",
        "url": "https://urbanhomeschool.ke/license",
    },
)

# ── Middleware (order matters: last added = first executed) ──────────

from app.middleware.security_headers import SecurityHeadersMiddleware
from app.middleware.cookie_auth import CookieAuthMiddleware
from app.middleware.csrf import CSRFMiddleware
from app.middleware.rate_limit import RateLimitMiddleware

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(CookieAuthMiddleware)
app.add_middleware(CSRFMiddleware)
app.add_middleware(RateLimitMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=settings.cors_allow_credentials,
    allow_methods=settings.cors_allow_methods,
    allow_headers=settings.cors_allow_headers,
    expose_headers=["Content-Range", "X-Total-Count"],
)

from app.middleware.error_logging_middleware import ErrorLoggingMiddleware
app.add_middleware(ErrorLoggingMiddleware)

from app.middleware.audit_middleware import AuditMiddleware
app.add_middleware(AuditMiddleware)

# ── Exception handlers ──────────────────────────────────────────────

from app.exception_handlers import (
    http_exception_handler,
    validation_exception_handler,
    general_exception_handler,
)

app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# ── Root & health endpoints ─────────────────────────────────────────


@app.get("/", tags=["Root"], summary="Root endpoint")
async def root():
    """Returns basic application information and status."""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "status": "running",
        "environment": settings.environment,
        "docs": "/docs",
        "redoc": "/redoc",
        "api": settings.api_v1_prefix,
    }


@app.get("/health", tags=["Health"], summary="Health check")
async def health_check():
    """Health check endpoint for monitoring and load balancers."""
    db_healthy = await check_db_connection()
    return {
        "status": "healthy" if db_healthy else "degraded",
        "version": settings.app_version,
        "environment": settings.environment,
        "database": {
            "status": "connected" if db_healthy else "disconnected",
            "healthy": db_healthy,
        },
    }


# ── Register all API + WebSocket routes ─────────────────────────────

from app.routers import register_all_routers
from app.websocket.routes import ws_router

register_all_routers(app)
app.include_router(ws_router)

# ── Prometheus metrics ─────────────────────────────────────────────────
from app.metrics import setup_metrics
setup_metrics(app)

# ── Static file serving for generated media (TTS audio, etc.) ───────
_media_dir = os.path.join(os.getcwd(), "media")
os.makedirs(os.path.join(_media_dir, "audio"), exist_ok=True)
app.mount("/media", StaticFiles(directory=_media_dir), name="media")

logger.info("FastAPI application configured successfully")
