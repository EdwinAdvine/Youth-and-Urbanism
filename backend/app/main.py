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

    except Exception as e:
        logger.error(f"Failed to start application: {str(e)}")
        raise

    yield

    # Shutdown
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


# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=settings.cors_allow_credentials,
    allow_methods=settings.cors_allow_methods,
    allow_headers=settings.cors_allow_headers,
    expose_headers=["Content-Range", "X-Total-Count"],
)


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

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "status_code": exc.status_code,
            "path": str(request.url.path),
        },
    )


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

    return JSONResponse(
        status_code=422,
        content={
            "detail": "Validation error",
            "status_code": 422,
            "path": str(request.url.path),
            "errors": exc.errors(),
        },
    )


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

    # Don't expose internal error details in production
    detail = str(exc) if settings.debug else "Internal server error"

    return JSONResponse(
        status_code=500,
        content={
            "detail": detail,
            "status_code": 500,
            "path": str(request.url.path),
        },
    )


# API Router inclusion (Phase 2 - AI Orchestration Layer)
from app.api.v1 import auth, ai_tutor, courses, payments, assessments, users, parents, notifications, forum, categories, store
from app.api.v1 import contact, certificates, instructor_applications
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

# WebSocket endpoint for admin real-time updates
from app.websocket.connection_manager import ws_manager
from app.utils.security import verify_token


@app.websocket("/ws/admin/{token}")
async def admin_websocket(websocket: WebSocket, token: str):
    """WebSocket endpoint for admin real-time updates."""
    import json as _json

    # Verify JWT token (verify_token raises HTTPException on failure)
    try:
        payload = verify_token(token)
    except Exception:
        await websocket.accept()
        await websocket.close(code=4001, reason="Invalid token")
        return

    user_id = payload.get("sub") or payload.get("user_id")
    user_role = payload.get("role", "")

    if user_role not in ("admin", "staff"):
        await websocket.accept()
        await websocket.close(code=4003, reason="Admin access required")
        return

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

# Staff real-time updates WebSocket
@app.websocket("/ws/staff/{token}")
async def staff_websocket(websocket: WebSocket, token: str):
    """WebSocket endpoint for staff real-time updates (counters, notifications, SLA warnings)."""
    import json as _json

    try:
        payload = verify_token(token)
    except Exception:
        await websocket.accept()
        await websocket.close(code=4001, reason="Invalid token")
        return

    user_id = payload.get("sub") or payload.get("user_id")
    user_role = payload.get("role", "")

    if user_role not in ("staff", "admin"):
        await websocket.accept()
        await websocket.close(code=4003, reason="Staff access required")
        return

    # Use the same ws_manager for staff connections
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
@app.websocket("/ws/yjs/{doc_id}/{token}")
async def yjs_websocket(websocket: WebSocket, doc_id: str, token: str):
    """WebSocket endpoint for Yjs CRDT collaborative document editing."""
    try:
        payload = verify_token(token)
    except Exception:
        await websocket.accept()
        await websocket.close(code=4001, reason="Invalid token")
        return

    user_id = payload.get("sub") or payload.get("user_id")
    user_role = payload.get("role", "")

    if user_role not in ("staff", "admin"):
        await websocket.accept()
        await websocket.close(code=4003, reason="Staff access required")
        return

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
@app.websocket("/ws/support-chat/{ticket_id}/{token}")
async def support_chat_websocket(websocket: WebSocket, ticket_id: str, token: str):
    """WebSocket endpoint for real-time support chat on tickets."""
    import json as _json

    try:
        payload = verify_token(token)
    except Exception:
        await websocket.accept()
        await websocket.close(code=4001, reason="Invalid token")
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


logger.info("FastAPI application configured successfully")
logger.info(
    "Routers registered: auth, ai-tutor, courses, payments, parents, notifications, forum, "
    "categories, store, admin/*, staff/dashboard, staff/moderation, staff/support, "
    "staff/live-support, staff/students, staff/kb, staff/content, staff/assessments, "
    "staff/sessions, staff/insights, staff/reports, staff/progress, staff/team, "
    "staff/account, staff/notifications, contact, certificates, instructor-applications"
)
