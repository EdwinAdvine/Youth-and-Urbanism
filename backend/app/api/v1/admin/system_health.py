"""
Admin System Health API Endpoints

Provides error log viewing, AI-powered error diagnosis, test runner,
and system health overview for the admin dashboard. Admin-only access.
"""

import logging
from typing import Any, Dict, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db, check_db_connection
from app.utils.security import get_current_active_user
from app.services.admin import error_logging_service, test_runner_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/system-health", tags=["Admin - System Health"])


def _require_admin(current_user: dict):
    """Strict admin-only check (not staff)."""
    role = current_user.get("role", "")
    if role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin role required.",
        )
    return current_user


# ------------------------------------------------------------------
# GET /system-health/overview
# ------------------------------------------------------------------
@router.get("/overview")
async def get_system_health_overview(
    current_user: dict = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    System health overview: DB status, error stats, latest test run.
    """
    _require_admin(current_user)

    try:
        # Database health
        db_healthy = await check_db_connection()

        # Error stats (last 24h)
        error_stats = await error_logging_service.get_error_stats(db, hours=24)

        # Latest test run
        test_runs = await test_runner_service.get_test_runs(db, page=1, page_size=1)
        latest_run = None
        if test_runs["items"]:
            run = test_runs["items"][0]
            latest_run = {
                "id": str(run.id),
                "type": run.run_type,
                "status": run.status,
                "summary": run.summary,
                "started_at": run.started_at.isoformat() if run.started_at else None,
                "completed_at": run.completed_at.isoformat() if run.completed_at else None,
                "duration": run.duration_seconds,
            }

        # Test run active?
        run_active = await test_runner_service.is_run_active()

        return {
            "status": "success",
            "data": {
                "database": {"healthy": db_healthy, "status": "connected" if db_healthy else "disconnected"},
                "errors": error_stats,
                "latest_test_run": latest_run,
                "test_run_active": run_active,
            },
        }
    except Exception as exc:
        logger.exception("Failed to fetch system health overview")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch system health overview.",
        ) from exc


# ------------------------------------------------------------------
# GET /system-health/errors
# ------------------------------------------------------------------
@router.get("/errors")
async def get_error_logs(
    current_user: dict = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
    level: Optional[str] = Query(None, description="Filter by level: ERROR, WARNING, CRITICAL"),
    source: Optional[str] = Query(None, description="Filter by source: backend, frontend, test"),
    is_resolved: Optional[bool] = Query(None, description="Filter by resolution status"),
    endpoint: Optional[str] = Query(None, description="Filter by endpoint (partial match)"),
    error_type: Optional[str] = Query(None, description="Filter by error type (partial match)"),
    hours: Optional[int] = Query(None, description="Only errors from last N hours"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
) -> Dict[str, Any]:
    """Paginated, filterable error log list."""
    _require_admin(current_user)

    try:
        result = await error_logging_service.get_errors(
            db,
            level=level,
            source=source,
            is_resolved=is_resolved,
            endpoint=endpoint,
            error_type=error_type,
            hours=hours,
            page=page,
            page_size=page_size,
        )

        items = [
            {
                "id": str(e.id),
                "level": e.level,
                "source": e.source,
                "error_type": e.error_type,
                "message": e.message[:200],
                "endpoint": e.endpoint,
                "method": e.method,
                "user_role": e.user_role,
                "is_resolved": e.is_resolved,
                "has_diagnosis": e.ai_diagnosis is not None,
                "created_at": e.created_at.isoformat(),
            }
            for e in result["items"]
        ]

        return {
            "status": "success",
            "data": {
                "items": items,
                "total": result["total"],
                "page": result["page"],
                "page_size": result["page_size"],
                "pages": result["pages"],
            },
        }
    except Exception as exc:
        logger.exception("Failed to fetch error logs")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch error logs.",
        ) from exc


# ------------------------------------------------------------------
# GET /system-health/errors/{error_id}
# ------------------------------------------------------------------
@router.get("/errors/{error_id}")
async def get_error_detail(
    error_id: UUID,
    current_user: dict = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Get full error detail including stack trace and diagnosis."""
    _require_admin(current_user)

    error = await error_logging_service.get_error_by_id(db, error_id)
    if not error:
        raise HTTPException(status_code=404, detail="Error log not found")

    return {
        "status": "success",
        "data": {
            "id": str(error.id),
            "level": error.level,
            "source": error.source,
            "error_type": error.error_type,
            "message": error.message,
            "stack_trace": error.stack_trace,
            "endpoint": error.endpoint,
            "method": error.method,
            "user_id": str(error.user_id) if error.user_id else None,
            "user_role": error.user_role,
            "request_data": error.request_data,
            "context": error.context,
            "ai_diagnosis": error.ai_diagnosis,
            "ai_diagnosed_at": error.ai_diagnosed_at.isoformat() if error.ai_diagnosed_at else None,
            "is_resolved": error.is_resolved,
            "resolved_by": str(error.resolved_by) if error.resolved_by else None,
            "resolved_at": error.resolved_at.isoformat() if error.resolved_at else None,
            "resolution_notes": error.resolution_notes,
            "created_at": error.created_at.isoformat(),
        },
    }


# ------------------------------------------------------------------
# POST /system-health/errors/{error_id}/diagnose
# ------------------------------------------------------------------
@router.post("/errors/{error_id}/diagnose")
async def diagnose_error(
    error_id: UUID,
    current_user: dict = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Trigger AI diagnosis for an error."""
    _require_admin(current_user)

    result = await error_logging_service.diagnose_with_ai(db, error_id)
    if not result:
        raise HTTPException(status_code=404, detail="Error log not found")

    return {"status": "success", "data": result}


# ------------------------------------------------------------------
# PATCH /system-health/errors/{error_id}/resolve
# ------------------------------------------------------------------
@router.patch("/errors/{error_id}/resolve")
async def resolve_error(
    error_id: UUID,
    current_user: dict = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
    notes: Optional[str] = Query(None, description="Resolution notes"),
) -> Dict[str, Any]:
    """Mark an error as resolved."""
    _require_admin(current_user)

    user_id = current_user.get("id") or current_user.get("user_id")
    error = await error_logging_service.mark_resolved(db, error_id, UUID(user_id), notes)
    if not error:
        raise HTTPException(status_code=404, detail="Error log not found")

    return {
        "status": "success",
        "data": {
            "id": str(error.id),
            "is_resolved": error.is_resolved,
            "resolved_at": error.resolved_at.isoformat() if error.resolved_at else None,
        },
    }


# ------------------------------------------------------------------
# POST /system-health/errors/report  (for frontend error reporting)
# ------------------------------------------------------------------
@router.post("/errors/report")
async def report_frontend_error(
    payload: dict,
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Receive error reports from the frontend error reporter.
    No auth required for error reporting (errors can happen pre-auth).
    """
    try:
        await error_logging_service.log_error(
            db,
            level=payload.get("level", "ERROR"),
            source="frontend",
            error_type=payload.get("error_type", "FrontendError"),
            message=payload.get("message", "Unknown frontend error"),
            stack_trace=payload.get("stack_trace"),
            endpoint=payload.get("url"),
            user_role=payload.get("user_role"),
            context=payload.get("context"),
        )
        return {"status": "success"}
    except Exception as exc:
        logger.error(f"Failed to store frontend error report: {exc}")
        return {"status": "error", "detail": "Failed to store error report"}


# ------------------------------------------------------------------
# POST /system-health/tests/run
# ------------------------------------------------------------------
@router.post("/tests/run")
async def run_tests(
    current_user: dict = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
    run_type: str = Query("all", description="Test type: backend, frontend, or all"),
) -> Dict[str, Any]:
    """
    Trigger a test suite execution. Only one run can be active at a time.
    """
    _require_admin(current_user)

    if run_type not in ("backend", "frontend", "all"):
        raise HTTPException(status_code=400, detail="run_type must be 'backend', 'frontend', or 'all'")

    if await test_runner_service.is_run_active():
        raise HTTPException(status_code=409, detail="A test run is already in progress")

    user_id = current_user.get("id") or current_user.get("user_id")

    try:
        test_run = await test_runner_service.run_tests(
            db, run_type=run_type, triggered_by=UUID(user_id)
        )

        return {
            "status": "success",
            "data": {
                "id": str(test_run.id),
                "type": test_run.run_type,
                "status": test_run.status,
                "summary": test_run.summary,
                "duration": test_run.duration_seconds,
                "started_at": test_run.started_at.isoformat() if test_run.started_at else None,
                "completed_at": test_run.completed_at.isoformat() if test_run.completed_at else None,
            },
        }
    except RuntimeError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as exc:
        logger.exception("Test run failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Test run failed: {str(exc)}",
        ) from exc


# ------------------------------------------------------------------
# GET /system-health/tests/results
# ------------------------------------------------------------------
@router.get("/tests/results")
async def get_test_results(
    current_user: dict = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
    run_type: Optional[str] = Query(None, description="Filter by type: backend, frontend, all"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
) -> Dict[str, Any]:
    """Get paginated test run history."""
    _require_admin(current_user)

    result = await test_runner_service.get_test_runs(
        db, run_type=run_type, page=page, page_size=page_size
    )

    items = [
        {
            "id": str(r.id),
            "type": r.run_type,
            "status": r.status,
            "summary": r.summary,
            "triggered_by": str(r.triggered_by),
            "started_at": r.started_at.isoformat() if r.started_at else None,
            "completed_at": r.completed_at.isoformat() if r.completed_at else None,
            "duration": r.duration_seconds,
        }
        for r in result["items"]
    ]

    return {
        "status": "success",
        "data": {
            "items": items,
            "total": result["total"],
            "page": result["page"],
            "page_size": result["page_size"],
        },
    }


# ------------------------------------------------------------------
# GET /system-health/tests/results/{run_id}
# ------------------------------------------------------------------
@router.get("/tests/results/{run_id}")
async def get_test_run_detail(
    run_id: UUID,
    current_user: dict = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """Get full test run detail including output."""
    _require_admin(current_user)

    run = await test_runner_service.get_test_run_by_id(db, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Test run not found")

    return {
        "status": "success",
        "data": {
            "id": str(run.id),
            "type": run.run_type,
            "status": run.status,
            "output": run.output,
            "summary": run.summary,
            "triggered_by": str(run.triggered_by),
            "started_at": run.started_at.isoformat() if run.started_at else None,
            "completed_at": run.completed_at.isoformat() if run.completed_at else None,
            "duration": run.duration_seconds,
        },
    }
