"""
Urban Home School - FastAPI Main Application

This is the entry point for the FastAPI backend application.
It configures the FastAPI app with CORS, middleware, database connections,
and API routes.

The application provides:
- Multi-role educational platform (students, parents, instructors, admins, partners, staff)
- CBC-aligned curriculum content
- AI-powered tutoring with multi-AI orchestration
- Payment integration (M-Pesa, Stripe, PayPal)
- Real-time chat and collaboration features
"""

import asyncio
import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import settings
from app.database import init_db, close_db, check_db_connection

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        # Add file handler if log_file is configured
        *([logging.FileHandler(settings.log_file)] if settings.log_file else [])
    ]
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    """
    Application lifespan manager for startup and shutdown events.

    This replaces the deprecated @app.on_event("startup") and @app.on_event("shutdown")
    decorators with the new lifespan context manager pattern.

    Startup tasks:
    - Initialize database connection
    - Check database connectivity
    - Log application configuration

    Shutdown tasks:
    - Close database connections
    - Clean up resources
    """
    # Startup
    logger.info("=" * 70)
    logger.info(f"Starting {settings.app_name} v{settings.app_version}")
    logger.info("=" * 70)
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"Debug Mode: {settings.debug}")
    logger.info(f"API Documentation: http://localhost:8000/docs")
    logger.info(f"CORS Origins: {', '.join(settings.cors_origins_list)}")
    logger.info("-" * 70)

    try:
        # Initialize database connection
        logger.info("Initializing database connection...")
        await init_db()

        # Check database health
        db_healthy = await check_db_connection()
        if db_healthy:
            logger.info("Database connection: HEALTHY")
        else:
            logger.warning("Database connection: UNHEALTHY - Some features may not work")

        logger.info("-" * 70)
        logger.info("Application startup complete")
        logger.info("=" * 70)

        # Start SLA background monitor
        async def sla_monitor_loop():
            """Periodically check for SLA breaches every 60 seconds."""
            from app.database import AsyncSessionLocal
            from app.services.staff.sla_engine import check_sla_breaches
            while True:
                try:
                    await asyncio.sleep(60)
                    if AsyncSessionLocal is not None:
                        async with AsyncSessionLocal() as db:
                            result = await check_sla_breaches(db)
                            if result.get("breaches_detected", 0) > 0:
                                logger.info(
                                    f"SLA monitor: {result['breaches_detected']} breaches detected, "
                                    f"{result.get('escalations_triggered', 0)} escalations triggered"
                                )
                except asyncio.CancelledError:
                    break
                except Exception as e:
                    logger.error(f"SLA monitor error: {str(e)}")
                    await asyncio.sleep(10)

        sla_task = asyncio.create_task(sla_monitor_loop())
        logger.info("SLA background monitor started (60s interval)")

    except Exception as e:
        logger.error(f"Failed to start application: {str(e)}")
        raise

    yield

    # Shutdown
    sla_task.cancel()
    try:
        await sla_task
    except asyncio.CancelledError:
        pass
    logger.info("SLA background monitor stopped")
    logger.info("=" * 70)
    logger.info("Shutting down application...")
    logger.info("-" * 70)

    try:
        # Close database connections
        await close_db()
        logger.info("Database connections closed")

    except Exception as e:
        logger.error(f"Error during shutdown: {str(e)}")

    logger.info("-" * 70)
    logger.info("Application shutdown complete")
    logger.info("=" * 70)


# Create FastAPI application instance
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
    # Additional metadata
    contact={
        "name": "Urban Home School Support",
        "email": "support@urbanhomeschool.ke",
    },
    license_info={
        "name": "Proprietary",
        "url": "https://urbanhomeschool.ke/license",
    },
)


# ── Security Headers Middleware ────────────────────────────────────────
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to every HTTP response."""

    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        # Content Security Policy — applied to API JSON responses.
        # The frontend SPA's CSP should be set by the web server (Nginx/Vite).
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: https:; "
            "connect-src 'self' https://api.stripe.com https://api-m.paypal.com https://api-m.sandbox.paypal.com wss:; "
            "frame-ancestors 'none'; "
            "base-uri 'self'; "
            "form-action 'self';"
        )
        if not settings.debug:
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains; preload"
            )
        return response


app.add_middleware(SecurityHeadersMiddleware)


# ── Cookie-to-Header Auth Middleware ──────────────────────────────────
class CookieAuthMiddleware(BaseHTTPMiddleware):
    """
    Read access_token from httpOnly cookie and inject as Authorization header.

    This allows the existing HTTPBearer dependency to work unchanged while tokens
    are stored in secure httpOnly cookies instead of localStorage.
    If an Authorization header is already present (e.g. mobile apps), it takes precedence.

    Also populates request.state with user identity for audit logging.
    """

    async def dispatch(self, request: Request, call_next):
        token = None

        # Check for token in Authorization header first (mobile/API clients)
        auth_header = request.headers.get("authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]  # Strip "Bearer " prefix
        elif "authorization" not in request.headers:
            # Fall back to cookie-based auth (browser clients)
            token = request.cookies.get("access_token")
            if token:
                # Inject as Authorization header (scope headers are list of byte tuples)
                request.scope["headers"] = [
                    *request.scope["headers"],
                    (b"authorization", f"Bearer {token}".encode()),
                ]

        # Populate request.state for audit logging (all auth types)
        if token:
            try:
                from app.utils.security import decode_token
                payload = decode_token(token)
                request.state.user_id = payload.get("sub")
                request.state.user_email = payload.get("email")
                request.state.user_role = payload.get("role")
            except Exception:
                # If token decode fails, don't block the request
                # (let the auth dependency handle validation)
                pass

        return await call_next(request)


app.add_middleware(CookieAuthMiddleware)


# ── CSRF Origin Validation Middleware ──────────────────────────────────
class CSRFMiddleware(BaseHTTPMiddleware):
    """
    Prevent cross-site request forgery on cookie-authenticated mutating requests.

    For POST/PUT/PATCH/DELETE requests that carry an access_token cookie,
    the Origin (or Referer) header must match one of the allowed CORS origins.
    Requests with an explicit Authorization header (API/mobile clients) are exempt
    because they don't rely on ambient cookie credentials.
    """

    MUTATING_METHODS = {"POST", "PUT", "PATCH", "DELETE"}

    async def dispatch(self, request: Request, call_next):
        if request.method in self.MUTATING_METHODS:
            has_cookie = "access_token" in request.cookies
            has_auth_header = "authorization" in request.headers

            # Only enforce for cookie-based auth (browser clients)
            if has_cookie and not has_auth_header:
                origin = request.headers.get("origin") or ""
                referer = request.headers.get("referer") or ""

                allowed = settings.cors_origins_list
                origin_ok = any(origin == o for o in allowed) if origin else False
                referer_ok = any(referer.startswith(o) for o in allowed) if referer else False

                if not origin_ok and not referer_ok:
                    return JSONResponse(
                        status_code=403,
                        content={"detail": "CSRF validation failed: origin not allowed"},
                    )

        return await call_next(request)


app.add_middleware(CSRFMiddleware)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=settings.cors_allow_credentials,
    allow_methods=settings.cors_allow_methods,
    allow_headers=settings.cors_allow_headers,
    expose_headers=["Content-Range", "X-Total-Count"],
)

# Error logging middleware — captures unhandled exceptions and 5xx to error_logs table
from app.middleware.error_logging_middleware import ErrorLoggingMiddleware
app.add_middleware(ErrorLoggingMiddleware)

# Audit logging middleware — auto-logs all POST/PUT/PATCH/DELETE to admin/staff endpoints
from app.middleware.audit_middleware import AuditMiddleware
app.add_middleware(AuditMiddleware)


# Root endpoint
@app.get(
    "/",
    tags=["Root"],
    summary="Root endpoint",
    description="Returns basic application information and status"
)
async def root():
    """
    Root endpoint providing application metadata and health status.

    Returns:
        dict: Application name, version, status, environment, and documentation links
    """
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "status": "running",
        "environment": settings.environment,
        "docs": "/docs",
        "redoc": "/redoc",
        "api": settings.api_v1_prefix,
    }


# Health check endpoint
@app.get(
    "/health",
    tags=["Health"],
    summary="Health check",
    description="Check application and database health status"
)
async def health_check():
    """
    Health check endpoint for monitoring and load balancers.

    Checks:
    - Application status
    - Database connectivity

    Returns:
        dict: Health status with database connectivity information
    """
    # Check database connection
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


# Custom exception handlers

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """
    Handle HTTP exceptions with custom JSON response.

    Args:
        request: The incoming request
        exc: The HTTP exception

    Returns:
        JSONResponse with error details
    """
    logger.warning(f"HTTP {exc.status_code} error on {request.url.path}: {exc.detail}")

    content = {
        "detail": exc.detail,
        "status_code": exc.status_code,
    }
    if settings.debug:
        content["path"] = str(request.url.path)

    return JSONResponse(status_code=exc.status_code, content=content)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Handle request validation errors with detailed error information.

    Args:
        request: The incoming request
        exc: The validation error

    Returns:
        JSONResponse with validation error details
    """
    logger.warning(f"Validation error on {request.url.path}: {exc.errors()}")

    content = {
        "detail": "Validation error",
        "status_code": 422,
        "errors": exc.errors(),
    }
    if settings.debug:
        content["path"] = str(request.url.path)

    return JSONResponse(status_code=422, content=content)


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """
    Handle unexpected exceptions with generic error response.

    Args:
        request: The incoming request
        exc: The exception

    Returns:
        JSONResponse with error message
    """
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


# API Router inclusion (Phase 2 - AI Orchestration Layer)
from app.api.v1 import auth, ai_tutor, courses, payments, assessments, users, parents, notifications, forum, categories, store
from app.api.v1 import contact, certificates, instructor_applications
from app.api.v1 import search as global_search
from app.api.v1 import ai_agent_profile
from app.api.v1.admin import ai_providers, analytics as admin_analytics
from app.api.v1.admin import dashboard as admin_dashboard
from app.api.v1.admin import permissions_api as admin_permissions
from app.api.v1.admin import pulse as admin_pulse
from app.api.v1.admin import users as admin_users
from app.api.v1.admin import content as admin_content
from app.api.v1.admin import ai_monitoring as admin_ai_monitoring
from app.api.v1.admin import advanced_analytics as admin_advanced_analytics
from app.api.v1.admin import finance as admin_finance
from app.api.v1.admin import operations as admin_operations
from app.api.v1.admin import account as admin_account
from app.api.v1.admin import families as admin_families
from app.api.v1.admin import restrictions as admin_restrictions
from app.api.v1.admin import system_health as admin_system_health

# Staff Dashboard routes
from app.api.v1.staff import dashboard as staff_dashboard
from app.api.v1.staff import moderation as staff_moderation
from app.api.v1.staff import support as staff_support
from app.api.v1.staff import live_support as staff_live_support
from app.api.v1.staff import student_journeys as staff_student_journeys
from app.api.v1.staff import knowledge_base as staff_knowledge_base
from app.api.v1.staff import content_studio as staff_content_studio
from app.api.v1.staff import assessment_builder as staff_assessment_builder
from app.api.v1.staff import sessions as staff_sessions
from app.api.v1.staff import insights as staff_insights
from app.api.v1.staff import reports as staff_reports
from app.api.v1.staff import student_progress as staff_student_progress
from app.api.v1.staff import team as staff_team
from app.api.v1.staff import account as staff_account
from app.api.v1.staff import notifications as staff_notifications

# Instructor Dashboard routes
from app.api.v1.instructor import dashboard_router as instructor_dashboard
from app.api.v1.instructor import account_router as instructor_account
from app.api.v1.instructor import earnings_router as instructor_earnings
from app.api.v1.instructor import courses_router as instructor_courses
from app.api.v1.instructor import assessments_router as instructor_assessments
from app.api.v1.instructor import sessions_router as instructor_sessions
from app.api.v1.instructor import interactions_router as instructor_interactions
from app.api.v1.instructor import impact_router as instructor_impact
from app.api.v1.instructor import hub_router as instructor_hub
from app.api.v1.instructor import resources_router as instructor_resources
from app.api.v1.instructor import insights_router as instructor_insights

# Student Dashboard routes
from app.api.v1.student import dashboard as student_dashboard
from app.api.v1.student import ai_tutor as student_ai_tutor
from app.api.v1.student import progress as student_progress
from app.api.v1.student import learning as student_learning
from app.api.v1.student import community as student_community
from app.api.v1.student import wallet as student_wallet
from app.api.v1.student import support as student_support
from app.api.v1.student import account as student_account

# Partner Dashboard routes
from app.api.v1.partner import dashboard as partner_dashboard
from app.api.v1.partner import sponsorships as partner_sponsorships
from app.api.v1.partner import finance as partner_finance
from app.api.v1.partner import analytics as partner_analytics
from app.api.v1.partner import content as partner_content
from app.api.v1.partner import support as partner_support
from app.api.v1.partner import account as partner_account
from app.api.v1.partner import collaboration as partner_collaboration

# Authentication endpoints (with auto-create AI tutor for students)
app.include_router(
    auth.router,
    prefix=settings.api_v1_prefix,
    tags=["Authentication"]
)

# AI Tutor endpoints (CORE FEATURE - multi-modal chat)
app.include_router(
    ai_tutor.router,
    prefix=settings.api_v1_prefix,
    tags=["AI Tutor"]
)

# Course Management endpoints (Content Foundation)
app.include_router(
    courses.router,
    prefix=settings.api_v1_prefix,
    tags=["Courses"]
)

# Payment Processing endpoints (M-Pesa, PayPal, Stripe)
app.include_router(
    payments.router,
    prefix=settings.api_v1_prefix,
    tags=["Payments"]
)

# Assessment endpoints (quizzes, assignments, exams)
app.include_router(
    assessments.router,
    prefix=settings.api_v1_prefix,
    tags=["Assessments"]
)

# User profile management endpoints
app.include_router(
    users.router,
    prefix=settings.api_v1_prefix,
    tags=["Users"]
)

# Parent-Student Linking endpoints
app.include_router(
    parents.router,
    prefix=settings.api_v1_prefix,
    tags=["Parents"]
)

# Parent Dashboard endpoints
from app.api.v1.parent import dashboard_router as parent_dashboard
from app.api.v1.parent import children_router as parent_children
from app.api.v1.parent import ai_insights_router as parent_ai_insights
from app.api.v1.parent import communications_router as parent_communications
from app.api.v1.parent import finance_router as parent_finance
from app.api.v1.parent import mpesa_router as parent_mpesa
from app.api.v1.parent import reports_router as parent_reports
from app.api.v1.parent import settings_router as parent_settings

app.include_router(
    parent_dashboard,
    prefix=settings.api_v1_prefix,
    tags=["Parent - Dashboard"]
)

app.include_router(
    parent_children,
    prefix=settings.api_v1_prefix,
    tags=["Parent - Children"]
)

app.include_router(
    parent_ai_insights,
    prefix=settings.api_v1_prefix,
    tags=["Parent - AI Insights"]
)

app.include_router(
    parent_communications,
    prefix=settings.api_v1_prefix,
    tags=["Parent - Communications"]
)

app.include_router(
    parent_finance,
    prefix=settings.api_v1_prefix,
    tags=["Parent - Finance"]
)

app.include_router(
    parent_mpesa,
    prefix=settings.api_v1_prefix,
    tags=["Parent - M-Pesa"]
)

app.include_router(
    parent_reports,
    prefix=settings.api_v1_prefix,
    tags=["Parent - Reports"]
)

app.include_router(
    parent_settings,
    prefix=settings.api_v1_prefix,
    tags=["Parent - Settings"]
)

# Student Dashboard endpoints
app.include_router(
    student_dashboard.router,
    prefix=settings.api_v1_prefix,
    tags=["Student - Dashboard"]
)

# Student AI Tutor endpoints
app.include_router(
    student_ai_tutor.router,
    prefix=settings.api_v1_prefix,
    tags=["Student - AI Tutor"]
)

# Student Progress & Gamification endpoints
app.include_router(
    student_progress.router,
    prefix=settings.api_v1_prefix,
    tags=["Student - Progress"]
)

# Student Learning endpoints (courses, enrollments, live sessions)
app.include_router(
    student_learning.router,
    prefix=settings.api_v1_prefix,
    tags=["Student - Learning"]
)

# Student Community endpoints (friends, study groups, shoutouts)
app.include_router(
    student_community.router,
    prefix=settings.api_v1_prefix,
    tags=["Student - Community"]
)

# Student Wallet & Payments endpoints (Paystack integration)
app.include_router(
    student_wallet.router,
    prefix=settings.api_v1_prefix,
    tags=["Student - Wallet"]
)

# Student Support endpoints (help, guides, tickets)
app.include_router(
    student_support.router,
    prefix=settings.api_v1_prefix,
    tags=["Student - Support"]
)

# Student Account endpoints (notifications, profile, preferences, privacy)
app.include_router(
    student_account.router,
    prefix=settings.api_v1_prefix,
    tags=["Student - Account"]
)

# Notification endpoints
app.include_router(
    notifications.router,
    prefix=settings.api_v1_prefix,
    tags=["Notifications"]
)

# Forum endpoints
app.include_router(
    forum.router,
    prefix=settings.api_v1_prefix,
    tags=["Forum"]
)

# Category management endpoints (CBC categories)
app.include_router(
    categories.router,
    prefix=settings.api_v1_prefix,
    tags=["Categories"]
)

# Store endpoints (e-commerce)
app.include_router(
    store.router,
    prefix=settings.api_v1_prefix,
    tags=["Store"]
)

# Admin AI Provider Management (flexible AI system)
app.include_router(
    ai_providers.router,
    prefix=f"{settings.api_v1_prefix}/admin",
    tags=["Admin - AI Providers"]
)

# Admin Analytics endpoints
app.include_router(
    admin_analytics.router,
    prefix=f"{settings.api_v1_prefix}/admin",
    tags=["Admin - Analytics"]
)

# Admin Dashboard endpoints
app.include_router(
    admin_dashboard.router,
    prefix=f"{settings.api_v1_prefix}/admin",
    tags=["Admin - Dashboard"]
)

# Admin Permissions endpoints
app.include_router(
    admin_permissions.router,
    prefix=f"{settings.api_v1_prefix}/admin",
    tags=["Admin - Permissions"]
)

# Admin Platform Pulse endpoints (real-time monitoring)
app.include_router(
    admin_pulse.router,
    prefix=f"{settings.api_v1_prefix}/admin",
    tags=["Admin - Platform Pulse"]
)

# Admin User Management endpoints
app.include_router(
    admin_users.router,
    prefix=f"{settings.api_v1_prefix}/admin",
    tags=["Admin - Users"]
)

# Admin Content Management endpoints
app.include_router(
    admin_content.router,
    prefix=f"{settings.api_v1_prefix}/admin",
    tags=["Admin - Content"]
)

# Admin AI Monitoring endpoints
app.include_router(
    admin_ai_monitoring.router,
    prefix=f"{settings.api_v1_prefix}/admin",
    tags=["Admin - AI Monitoring"]
)

# Admin Advanced Analytics endpoints
app.include_router(
    admin_advanced_analytics.router,
    prefix=f"{settings.api_v1_prefix}/admin",
    tags=["Admin - Advanced Analytics"]
)

# Admin Finance endpoints
app.include_router(
    admin_finance.router,
    prefix=f"{settings.api_v1_prefix}/admin",
    tags=["Admin - Finance"]
)

# Admin Operations endpoints (tickets, moderation, config)
app.include_router(
    admin_operations.router,
    prefix=f"{settings.api_v1_prefix}/admin",
    tags=["Admin - Operations"]
)

# Admin Account endpoints (profile, preferences)
app.include_router(
    admin_account.router,
    prefix=f"{settings.api_v1_prefix}/admin",
    tags=["Admin - Account"]
)

# Admin Families & Enrollments endpoints
app.include_router(
    admin_families.router,
    prefix=f"{settings.api_v1_prefix}/admin",
    tags=["Admin - Families"]
)

# Admin Restrictions endpoints (user restrictions & appeals)
app.include_router(
    admin_restrictions.router,
    prefix=f"{settings.api_v1_prefix}/admin",
    tags=["Admin - Restrictions"]
)

# Admin System Health endpoints (error logs, test runner, AI diagnosis)
app.include_router(
    admin_system_health.router,
    prefix=f"{settings.api_v1_prefix}/admin",
    tags=["Admin - System Health"]
)

# ── Staff Dashboard Routes ──────────────────────────────────────────

# Staff Dashboard
app.include_router(
    staff_dashboard.router,
    prefix=f"{settings.api_v1_prefix}/staff/dashboard",
    tags=["Staff - Dashboard"]
)

# Staff Moderation & Quality
app.include_router(
    staff_moderation.router,
    prefix=f"{settings.api_v1_prefix}/staff/moderation",
    tags=["Staff - Moderation"]
)

# Staff Support & Care
app.include_router(
    staff_support.router,
    prefix=f"{settings.api_v1_prefix}/staff/support",
    tags=["Staff - Support"]
)

# Staff Live Support
app.include_router(
    staff_live_support.router,
    prefix=f"{settings.api_v1_prefix}/staff/live-support",
    tags=["Staff - Live Support"]
)

# Staff Student Journeys
app.include_router(
    staff_student_journeys.router,
    prefix=f"{settings.api_v1_prefix}/staff/students",
    tags=["Staff - Student Journeys"]
)

# Staff Knowledge Base
app.include_router(
    staff_knowledge_base.router,
    prefix=f"{settings.api_v1_prefix}/staff/kb",
    tags=["Staff - Knowledge Base"]
)

# Staff Content Studio
app.include_router(
    staff_content_studio.router,
    prefix=f"{settings.api_v1_prefix}/staff/content",
    tags=["Staff - Content Studio"]
)

# Staff Assessment Builder
app.include_router(
    staff_assessment_builder.router,
    prefix=f"{settings.api_v1_prefix}/staff/assessments",
    tags=["Staff - Assessments"]
)

# Staff Sessions & Live Delivery
app.include_router(
    staff_sessions.router,
    prefix=f"{settings.api_v1_prefix}/staff/sessions",
    tags=["Staff - Sessions"]
)

# Staff Insights & Impact
app.include_router(
    staff_insights.router,
    prefix=f"{settings.api_v1_prefix}/staff/insights",
    tags=["Staff - Insights"]
)

# Staff Custom Reports
app.include_router(
    staff_reports.router,
    prefix=f"{settings.api_v1_prefix}/staff/reports",
    tags=["Staff - Reports"]
)

# Staff Student Progress
app.include_router(
    staff_student_progress.router,
    prefix=f"{settings.api_v1_prefix}/staff/progress",
    tags=["Staff - Student Progress"]
)

# Staff Team & Growth
app.include_router(
    staff_team.router,
    prefix=f"{settings.api_v1_prefix}/staff/team",
    tags=["Staff - Team"]
)

# Staff Account
app.include_router(
    staff_account.router,
    prefix=f"{settings.api_v1_prefix}/staff/account",
    tags=["Staff - Account"]
)

# Staff Notifications
app.include_router(
    staff_notifications.router,
    prefix=f"{settings.api_v1_prefix}/staff/notifications",
    tags=["Staff - Notifications"]
)

# Instructor Dashboard routes
app.include_router(
    instructor_dashboard,
    prefix=f"{settings.api_v1_prefix}/instructor",
    tags=["Instructor - Dashboard"]
)

app.include_router(
    instructor_account,
    prefix=f"{settings.api_v1_prefix}/instructor",
    tags=["Instructor - Account"]
)

app.include_router(
    instructor_earnings,
    prefix=f"{settings.api_v1_prefix}/instructor",
    tags=["Instructor - Earnings"]
)

app.include_router(
    instructor_courses,
    prefix=f"{settings.api_v1_prefix}/instructor",
    tags=["Instructor - Courses"]
)

app.include_router(
    instructor_assessments,
    prefix=f"{settings.api_v1_prefix}/instructor",
    tags=["Instructor - Assessments"]
)

app.include_router(
    instructor_sessions,
    prefix=f"{settings.api_v1_prefix}/instructor",
    tags=["Instructor - Sessions"]
)

app.include_router(
    instructor_interactions,
    prefix=f"{settings.api_v1_prefix}/instructor",
    tags=["Instructor - Interactions"]
)

app.include_router(
    instructor_impact,
    prefix=f"{settings.api_v1_prefix}/instructor",
    tags=["Instructor - Impact & Recognition"]
)

app.include_router(
    instructor_hub,
    prefix=f"{settings.api_v1_prefix}/instructor",
    tags=["Instructor - Hub & Community"]
)

app.include_router(
    instructor_resources,
    prefix=f"{settings.api_v1_prefix}/instructor",
    tags=["Instructor - Resources"]
)

app.include_router(
    instructor_insights,
    prefix=f"{settings.api_v1_prefix}/instructor",
    tags=["Instructor - AI Insights"]
)

# ── Partner Dashboard Routes ──────────────────────────────────────────

# Partner Dashboard
app.include_router(
    partner_dashboard.router,
    prefix=f"{settings.api_v1_prefix}/partner/dashboard",
    tags=["Partner - Dashboard"]
)

# Partner Sponsorships
app.include_router(
    partner_sponsorships.router,
    prefix=f"{settings.api_v1_prefix}/partner/sponsorships",
    tags=["Partner - Sponsorships"]
)

# Partner Finance
app.include_router(
    partner_finance.router,
    prefix=f"{settings.api_v1_prefix}/partner/finance",
    tags=["Partner - Finance"]
)

# Partner Analytics
app.include_router(
    partner_analytics.router,
    prefix=f"{settings.api_v1_prefix}/partner/analytics",
    tags=["Partner - Analytics"]
)

# Partner Content
app.include_router(
    partner_content.router,
    prefix=f"{settings.api_v1_prefix}/partner/content",
    tags=["Partner - Content"]
)

# Partner Support
app.include_router(
    partner_support.router,
    prefix=f"{settings.api_v1_prefix}/partner/support",
    tags=["Partner - Support"]
)

# Partner Account
app.include_router(
    partner_account.router,
    prefix=f"{settings.api_v1_prefix}/partner/account",
    tags=["Partner - Account"]
)

# Partner Collaboration
app.include_router(
    partner_collaboration.router,
    prefix=f"{settings.api_v1_prefix}/partner/collaboration",
    tags=["Partner - Collaboration"]
)

# Phase 8 - Supporting APIs

# Contact form endpoints (public + admin management)
app.include_router(
    contact.router,
    prefix=settings.api_v1_prefix,
    tags=["Contact"]
)

# Certificate validation and management endpoints
app.include_router(
    certificates.router,
    prefix=settings.api_v1_prefix,
    tags=["Certificates"]
)

# Instructor application endpoints (public + admin review)
app.include_router(
    instructor_applications.router,
    prefix=settings.api_v1_prefix,
    tags=["Instructor Applications"]
)

# Global Search endpoint
app.include_router(
    global_search.router,
    prefix=settings.api_v1_prefix,
    tags=["Search"]
)

# AI Agent Profile endpoints (per-user AI customization)
app.include_router(
    ai_agent_profile.router,
    prefix=settings.api_v1_prefix,
    tags=["AI Agent Profile"]
)

# WebSocket endpoint for admin real-time updates
from app.websocket.connection_manager import ws_manager
from app.utils.security import verify_token


# ── WebSocket Helper ──────────────────────────────────────────────────
from fastapi import Query
from app.api.v1.auth import is_token_blacklisted as _is_token_blacklisted


def _ws_extract_token(websocket: WebSocket, token_path: str = "", token_query: str = "") -> str:
    """
    Extract token from (in priority order):
    1. Query parameter ?token= (preferred for new clients)
    2. URL path /{token} (legacy, deprecated — will be removed)
    3. httpOnly cookie (automatic for browser clients)
    """
    return token_query or token_path or websocket.cookies.get("access_token", "")


async def _ws_authenticate(
    websocket: WebSocket,
    token_path: str = "",
    token_query: str = "",
    allowed_roles: tuple[str, ...] | None = None,
) -> dict | None:
    """
    Authenticate a WebSocket connection:
    1. Extract token (query param / path / cookie)
    2. Verify JWT signature and claims
    3. Check token blacklist (logout invalidation)
    4. Optionally enforce role-based access

    Returns the JWT payload dict on success, or None after closing the socket on failure.
    """
    auth_token = _ws_extract_token(websocket, token_path, token_query)

    if not auth_token:
        await websocket.close(code=4001, reason="Token required")
        return None

    try:
        payload = verify_token(auth_token)
    except Exception:
        await websocket.accept()
        await websocket.close(code=4001, reason="Invalid token")
        return None

    # Check blacklist — reject logged-out tokens
    if await _is_token_blacklisted(auth_token):
        await websocket.accept()
        await websocket.close(code=4001, reason="Token revoked")
        return None

    if allowed_roles:
        user_role = payload.get("role", "")
        if user_role not in allowed_roles:
            await websocket.accept()
            await websocket.close(code=4003, reason="Insufficient permissions")
            return None

    return payload


@app.websocket("/ws/admin")
@app.websocket("/ws/admin/{token_path}")
async def admin_websocket(
    websocket: WebSocket,
    token_path: str = "",
    token: str = Query("", alias="token"),
):
    """WebSocket endpoint for admin real-time updates. Token via ?token= query param."""
    import json as _json

    payload = await _ws_authenticate(websocket, token_path, token, allowed_roles=("admin", "staff"))
    if payload is None:
        return

    user_id = payload.get("sub") or payload.get("user_id")
    user_role = payload.get("role", "")

    await ws_manager.connect(websocket, user_id, user_role)

    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg = _json.loads(data)
                if msg.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
            except _json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, user_id, user_role)
    except Exception:
        ws_manager.disconnect(websocket, user_id, user_role)


# ── Staff WebSocket Endpoints ───────────────────────────────────────

@app.websocket("/ws/staff")
@app.websocket("/ws/staff/{token_path}")
async def staff_websocket(
    websocket: WebSocket,
    token_path: str = "",
    token: str = Query("", alias="token"),
):
    """WebSocket endpoint for staff real-time updates (counters, notifications, SLA warnings)."""
    import json as _json

    payload = await _ws_authenticate(websocket, token_path, token, allowed_roles=("staff", "admin"))
    if payload is None:
        return

    user_id = payload.get("sub") or payload.get("user_id")
    user_role = payload.get("role", "")

    await ws_manager.connect(websocket, user_id, user_role)

    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg = _json.loads(data)
                if msg.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
            except _json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, user_id, user_role)
    except Exception:
        ws_manager.disconnect(websocket, user_id, user_role)


# Instructor real-time updates WebSocket
@app.websocket("/ws/instructor")
@app.websocket("/ws/instructor/{token_path}")
async def instructor_websocket(
    websocket: WebSocket,
    token_path: str = "",
    token: str = Query("", alias="token"),
):
    """WebSocket endpoint for instructor real-time updates (counters, notifications, badges)."""
    import json as _json
    from app.websocket.instructor_connection_manager import instructor_ws_manager

    payload = await _ws_authenticate(websocket, token_path, token, allowed_roles=("instructor",))
    if payload is None:
        return

    user_id = payload.get("sub") or payload.get("user_id")

    await instructor_ws_manager.connect(websocket, user_id)

    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg = _json.loads(data)
                if msg.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
            except _json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        instructor_ws_manager.disconnect(user_id)
    except Exception:
        instructor_ws_manager.disconnect(user_id)


# Parent real-time updates WebSocket
@app.websocket("/ws/parent")
@app.websocket("/ws/parent/{token_path}")
async def parent_websocket(
    websocket: WebSocket,
    token_path: str = "",
    token: str = Query("", alias="token"),
):
    """WebSocket endpoint for parent real-time updates (messages, alerts, achievements, counters)."""
    import json as _json
    from app.websocket.parent_connection_manager import parent_ws_manager

    payload = await _ws_authenticate(websocket, token_path, token, allowed_roles=("parent",))
    if payload is None:
        return

    user_id = payload.get("sub") or payload.get("user_id")

    await parent_ws_manager.connect(websocket, user_id)

    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg = _json.loads(data)
                if msg.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
            except _json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        parent_ws_manager.disconnect(websocket, user_id)
    except Exception:
        parent_ws_manager.disconnect(websocket, user_id)


# Student real-time updates WebSocket
@app.websocket("/ws/student")
@app.websocket("/ws/student/{token_path}")
async def student_websocket(
    websocket: WebSocket,
    token_path: str = "",
    token: str = Query("", alias="token"),
):
    """WebSocket endpoint for student real-time updates (notifications, progress, achievements)."""
    import json as _json

    payload = await _ws_authenticate(websocket, token_path, token, allowed_roles=("student",))
    if payload is None:
        return

    user_id = payload.get("sub") or payload.get("user_id")
    user_role = payload.get("role", "")

    await ws_manager.connect(websocket, user_id, user_role)

    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg = _json.loads(data)
                if msg.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
            except _json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, user_id, user_role)
    except Exception:
        ws_manager.disconnect(websocket, user_id, user_role)


# Partner real-time updates WebSocket
@app.websocket("/ws/partner")
@app.websocket("/ws/partner/{token_path}")
async def partner_websocket(
    websocket: WebSocket,
    token_path: str = "",
    token: str = Query("", alias="token"),
):
    """WebSocket endpoint for partner real-time updates (notifications, analytics)."""
    import json as _json

    payload = await _ws_authenticate(websocket, token_path, token, allowed_roles=("partner",))
    if payload is None:
        return

    user_id = payload.get("sub") or payload.get("user_id")
    user_role = payload.get("role", "")

    await ws_manager.connect(websocket, user_id, user_role)

    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg = _json.loads(data)
                if msg.get("type") == "ping":
                    await websocket.send_json({"type": "pong"})
            except _json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, user_id, user_role)
    except Exception:
        ws_manager.disconnect(websocket, user_id, user_role)


# Yjs collaborative editing WebSocket
@app.websocket("/ws/yjs/{doc_id}")
@app.websocket("/ws/yjs/{doc_id}/{token_path}")
async def yjs_websocket(
    websocket: WebSocket,
    doc_id: str,
    token_path: str = "",
    token: str = Query("", alias="token"),
):
    """WebSocket endpoint for Yjs CRDT collaborative document editing."""
    payload = await _ws_authenticate(websocket, token_path, token, allowed_roles=("staff", "admin", "instructor"))
    if payload is None:
        return

    user_id = payload.get("sub") or payload.get("user_id")

    try:
        from app.websocket.yjs_handler import yjs_manager
        await yjs_manager.connect(websocket, doc_id, user_id)

        try:
            while True:
                data = await websocket.receive_bytes()
                await yjs_manager.handle_message(websocket, doc_id, user_id, data)
        except WebSocketDisconnect:
            await yjs_manager.disconnect(websocket, doc_id, user_id)
        except Exception:
            await yjs_manager.disconnect(websocket, doc_id, user_id)
    except ImportError:
        await websocket.accept()
        await websocket.send_json({"error": "Yjs handler not available"})
        await websocket.close(code=4500, reason="Yjs handler not configured")


# Live support chat WebSocket
@app.websocket("/ws/support-chat/{ticket_id}")
@app.websocket("/ws/support-chat/{ticket_id}/{token_path}")
async def support_chat_websocket(
    websocket: WebSocket,
    ticket_id: str,
    token_path: str = "",
    token: str = Query("", alias="token"),
):
    """WebSocket endpoint for real-time support chat on tickets."""
    import json as _json

    payload = await _ws_authenticate(websocket, token_path, token)
    if payload is None:
        return

    user_id = payload.get("sub") or payload.get("user_id")

    try:
        from app.websocket.live_chat_handler import live_chat_manager
        await live_chat_manager.connect(websocket, ticket_id, user_id)

        try:
            while True:
                data = await websocket.receive_text()
                try:
                    msg = _json.loads(data)
                    await live_chat_manager.handle_message(ticket_id, user_id, msg)
                except _json.JSONDecodeError:
                    pass
        except WebSocketDisconnect:
            await live_chat_manager.disconnect(websocket, ticket_id, user_id)
        except Exception:
            await live_chat_manager.disconnect(websocket, ticket_id, user_id)
    except ImportError:
        await websocket.accept()
        await websocket.send_json({"error": "Live chat handler not available"})
        await websocket.close(code=4500, reason="Live chat handler not configured")


# WebRTC signaling WebSocket for live video sessions
@app.websocket("/ws/webrtc/{room_id}")
@app.websocket("/ws/webrtc/{room_id}/{token_path}")
async def webrtc_signaling_websocket(
    websocket: WebSocket,
    room_id: str,
    token_path: str = "",
    token: str = Query("", alias="token"),
):
    """WebSocket endpoint for WebRTC signaling (offer/answer/ICE candidates)."""
    payload = await _ws_authenticate(
        websocket, token_path, token,
        allowed_roles=("instructor", "student", "staff", "admin"),
    )
    if payload is None:
        return

    user_id = payload.get("sub") or payload.get("user_id")
    user_role = payload.get("role", "")
    user_name = payload.get("name", payload.get("email", "Unknown"))

    try:
        from app.websocket.webrtc_signaling import webrtc_signaling_manager

        await websocket.accept()

        joined = await webrtc_signaling_manager.join_room(
            room_id,
            user_id,
            websocket,
            {"name": user_name, "role": user_role},
        )

        if not joined:
            await websocket.send_json({"type": "error", "message": "Room is full"})
            await websocket.close(code=4004, reason="Room full")
            return

        try:
            while True:
                data = await websocket.receive_text()
                await webrtc_signaling_manager.handle_message(room_id, user_id, data)
        except WebSocketDisconnect:
            await webrtc_signaling_manager.leave_room(room_id, user_id)
        except Exception:
            await webrtc_signaling_manager.leave_room(room_id, user_id)
    except ImportError:
        await websocket.accept()
        await websocket.send_json({"error": "WebRTC signaling not available"})
        await websocket.close(code=4500, reason="WebRTC signaling not configured")


# ICE configuration endpoint
@app.get("/api/v1/instructor/sessions/{session_id}/ice-config")
async def get_ice_config(session_id: str):
    """Return STUN/TURN server configuration for WebRTC."""
    from app.config import settings

    ice_servers = [{"urls": settings.webrtc_stun_urls}]

    if settings.webrtc_turn_url:
        ice_servers.append({
            "urls": settings.webrtc_turn_url,
            "username": settings.webrtc_turn_username,
            "credential": settings.webrtc_turn_credential,
        })

    return {
        "ice_servers": ice_servers,
        "max_participants": settings.webrtc_max_participants,
    }


logger.info("FastAPI application configured successfully")
logger.info(
    "Routers registered: auth, ai-tutor, courses, payments, parents, notifications, forum, "
    "categories, store, admin/*, staff/dashboard, staff/moderation, staff/support, "
    "staff/live-support, staff/students, staff/kb, staff/content, staff/assessments, "
    "staff/sessions, staff/insights, staff/reports, staff/progress, staff/team, "
    "staff/account, staff/notifications, contact, certificates, instructor-applications, "
    "webrtc-signaling"
)
