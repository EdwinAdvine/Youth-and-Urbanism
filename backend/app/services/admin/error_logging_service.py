"""
Error Logging Service

Business logic for querying, managing, and AI-diagnosing platform errors.
Used by the admin System Health API endpoints.
"""

import logging
from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID

from sqlalchemy import select, func, desc, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.admin.error_log import ErrorLog

logger = logging.getLogger(__name__)


async def log_error(
    db: AsyncSession,
    level: str,
    source: str,
    error_type: str,
    message: str,
    stack_trace: Optional[str] = None,
    endpoint: Optional[str] = None,
    method: Optional[str] = None,
    user_id: Optional[UUID] = None,
    user_role: Optional[str] = None,
    request_data: Optional[dict] = None,
    context: Optional[dict] = None,
) -> ErrorLog:
    """Write an error log entry to the database."""
    entry = ErrorLog(
        level=level,
        source=source,
        error_type=error_type,
        message=message[:2000],
        stack_trace=stack_trace,
        endpoint=endpoint,
        method=method,
        user_id=user_id,
        user_role=user_role,
        request_data=request_data,
        context=context,
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return entry


async def get_errors(
    db: AsyncSession,
    level: Optional[str] = None,
    source: Optional[str] = None,
    is_resolved: Optional[bool] = None,
    endpoint: Optional[str] = None,
    error_type: Optional[str] = None,
    hours: Optional[int] = None,
    page: int = 1,
    page_size: int = 50,
) -> dict:
    """
    Query error logs with filters and pagination.

    Returns dict with 'items', 'total', 'page', 'page_size'.
    """
    conditions = []

    if level:
        conditions.append(ErrorLog.level == level)
    if source:
        conditions.append(ErrorLog.source == source)
    if is_resolved is not None:
        conditions.append(ErrorLog.is_resolved == is_resolved)
    if endpoint:
        conditions.append(ErrorLog.endpoint.ilike(f"%{endpoint}%"))
    if error_type:
        conditions.append(ErrorLog.error_type.ilike(f"%{error_type}%"))
    if hours:
        cutoff = datetime.utcnow() - timedelta(hours=hours)
        conditions.append(ErrorLog.created_at >= cutoff)

    where_clause = and_(*conditions) if conditions else True

    # Count total
    count_q = select(func.count(ErrorLog.id)).where(where_clause)
    total_result = await db.execute(count_q)
    total = total_result.scalar() or 0

    # Fetch page
    offset = (page - 1) * page_size
    items_q = (
        select(ErrorLog)
        .where(where_clause)
        .order_by(desc(ErrorLog.created_at))
        .offset(offset)
        .limit(page_size)
    )
    items_result = await db.execute(items_q)
    items = items_result.scalars().all()

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": (total + page_size - 1) // page_size if page_size > 0 else 0,
    }


async def get_error_by_id(db: AsyncSession, error_id: UUID) -> Optional[ErrorLog]:
    """Get a single error log entry by ID."""
    result = await db.execute(select(ErrorLog).where(ErrorLog.id == error_id))
    return result.scalar_one_or_none()


async def get_error_stats(
    db: AsyncSession,
    hours: int = 24,
) -> dict:
    """
    Get aggregated error statistics.

    Returns counts by level, source, top error types, and trend data.
    """
    cutoff = datetime.utcnow() - timedelta(hours=hours)
    base_filter = ErrorLog.created_at >= cutoff

    # Total errors in period
    total_q = select(func.count(ErrorLog.id)).where(base_filter)
    total_result = await db.execute(total_q)
    total = total_result.scalar() or 0

    # Unresolved errors
    unresolved_q = select(func.count(ErrorLog.id)).where(
        and_(base_filter, ErrorLog.is_resolved == False)
    )
    unresolved_result = await db.execute(unresolved_q)
    unresolved = unresolved_result.scalar() or 0

    # Count by level
    level_q = (
        select(ErrorLog.level, func.count(ErrorLog.id))
        .where(base_filter)
        .group_by(ErrorLog.level)
    )
    level_result = await db.execute(level_q)
    by_level = {row[0]: row[1] for row in level_result.all()}

    # Count by source
    source_q = (
        select(ErrorLog.source, func.count(ErrorLog.id))
        .where(base_filter)
        .group_by(ErrorLog.source)
    )
    source_result = await db.execute(source_q)
    by_source = {row[0]: row[1] for row in source_result.all()}

    # Top 10 error types
    type_q = (
        select(ErrorLog.error_type, func.count(ErrorLog.id).label("count"))
        .where(base_filter)
        .group_by(ErrorLog.error_type)
        .order_by(desc("count"))
        .limit(10)
    )
    type_result = await db.execute(type_q)
    top_types = [{"type": row[0], "count": row[1]} for row in type_result.all()]

    # Top 10 failing endpoints
    endpoint_q = (
        select(ErrorLog.endpoint, func.count(ErrorLog.id).label("count"))
        .where(and_(base_filter, ErrorLog.endpoint.isnot(None)))
        .group_by(ErrorLog.endpoint)
        .order_by(desc("count"))
        .limit(10)
    )
    endpoint_result = await db.execute(endpoint_q)
    top_endpoints = [{"endpoint": row[0], "count": row[1]} for row in endpoint_result.all()]

    return {
        "period_hours": hours,
        "total": total,
        "unresolved": unresolved,
        "by_level": by_level,
        "by_source": by_source,
        "top_error_types": top_types,
        "top_failing_endpoints": top_endpoints,
    }


async def mark_resolved(
    db: AsyncSession,
    error_id: UUID,
    resolved_by: UUID,
    notes: Optional[str] = None,
) -> Optional[ErrorLog]:
    """Mark an error as resolved."""
    error = await get_error_by_id(db, error_id)
    if not error:
        return None

    error.is_resolved = True
    error.resolved_by = resolved_by
    error.resolved_at = datetime.utcnow()
    error.resolution_notes = notes
    await db.commit()
    await db.refresh(error)
    return error


async def diagnose_with_ai(
    db: AsyncSession,
    error_id: UUID,
) -> Optional[dict]:
    """
    Use the AI Orchestrator to analyze an error and suggest fixes.

    Returns the AI diagnosis text and updates the error record.
    """
    error = await get_error_by_id(db, error_id)
    if not error:
        return None

    # Build context for AI analysis
    error_context = (
        f"Platform: Urban Home School (FastAPI + React)\n"
        f"Error Level: {error.level}\n"
        f"Error Type: {error.error_type}\n"
        f"Source: {error.source}\n"
        f"Message: {error.message}\n"
        f"Endpoint: {error.endpoint or 'N/A'}\n"
        f"Method: {error.method or 'N/A'}\n"
        f"Timestamp: {error.created_at.isoformat()}\n"
    )

    if error.stack_trace:
        error_context += f"\nStack Trace:\n{error.stack_trace[:3000]}\n"

    if error.request_data:
        import json
        error_context += f"\nRequest Data:\n{json.dumps(error.request_data, indent=2)[:1000]}\n"

    if error.context:
        import json
        error_context += f"\nContext:\n{json.dumps(error.context, indent=2)[:1000]}\n"

    system_prompt = (
        "You are a senior software engineer analyzing errors in a FastAPI + React educational platform. "
        "Analyze the following error and provide:\n"
        "1. **Root Cause**: What likely caused this error\n"
        "2. **Severity**: Critical / High / Medium / Low\n"
        "3. **Suggested Fix**: Specific code changes or configuration fixes\n"
        "4. **Prevention**: How to prevent this error in the future\n"
        "5. **Affected Components**: Which files/services are likely involved\n"
        "Be concise and actionable. Focus on practical fixes."
    )

    try:
        # Use the AI Orchestrator for diagnosis
        from app.services.ai_orchestrator import AIOrchestrator

        orchestrator = AIOrchestrator(db)
        await orchestrator.initialize()

        diagnosis = await orchestrator.generate_response(
            message=error_context,
            system_prompt=system_prompt,
            task_type="reasoning",
        )

        diagnosis_text = diagnosis.get("response", "AI diagnosis unavailable")

        # Save diagnosis to error record
        error.ai_diagnosis = diagnosis_text
        error.ai_diagnosed_at = datetime.utcnow()
        await db.commit()
        await db.refresh(error)

        return {
            "error_id": str(error.id),
            "diagnosis": diagnosis_text,
            "diagnosed_at": error.ai_diagnosed_at.isoformat(),
            "model_used": diagnosis.get("model", "unknown"),
        }

    except Exception as e:
        logger.error(f"AI diagnosis failed for error {error_id}: {e}")
        # Return a fallback analysis based on the error type
        fallback = (
            f"AI diagnosis temporarily unavailable. Error summary:\n"
            f"- Type: {error.error_type}\n"
            f"- Message: {error.message}\n"
            f"- Check the stack trace for the originating file and line number.\n"
            f"- Error: {str(e)}"
        )
        error.ai_diagnosis = fallback
        error.ai_diagnosed_at = datetime.utcnow()
        await db.commit()
        return {
            "error_id": str(error.id),
            "diagnosis": fallback,
            "diagnosed_at": error.ai_diagnosed_at.isoformat(),
            "model_used": "fallback",
        }
