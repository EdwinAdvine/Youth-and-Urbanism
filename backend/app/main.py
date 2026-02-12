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

from fastapi import FastAPI, Request
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

logger.info("FastAPI application configured successfully")
logger.info("Routers registered: auth, ai-tutor, courses, payments, parents, notifications, forum, categories, store, admin/ai-providers, admin/analytics, contact, certificates, instructor-applications")
