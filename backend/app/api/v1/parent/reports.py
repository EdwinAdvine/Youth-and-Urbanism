"""
Parent Reports Router

API endpoints for reports and portfolio exports.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from uuid import UUID

from app.database import get_db
from app.models import User
from app.utils.security import get_current_user
from app.schemas.parent.reports_schemas import (
    ReportsListResponse, GenerateReportRequest, ReportDetailResponse,
    TermSummaryResponse, TranscriptResponse, PortfolioExportRequest,
    PortfolioExportResponse
)
from app.services.parent.reports_service import parent_reports_service

router = APIRouter(prefix="/parent/reports", tags=["parent-reports"])


def require_parent_role(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to ensure user has parent role."""
    if current_user.role != "parent":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Parent role required"
        )
    return current_user


@router.get("", response_model=ReportsListResponse)
async def get_reports(
    child_id: Optional[UUID] = Query(None),
    report_type: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """Get list of generated reports."""
    return await parent_reports_service.get_reports_list(
        db=db,
        parent_id=current_user.id,
        child_id=child_id,
        report_type=report_type
    )


@router.post("/generate", response_model=ReportDetailResponse)
async def generate_report(
    request: GenerateReportRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """Generate a new report."""
    try:
        return await parent_reports_service.generate_report(
            db=db,
            parent_id=current_user.id,
            request=request
        )
    except NotImplementedError:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Report generation not yet implemented"
        )


@router.get("/{report_id}", response_model=ReportDetailResponse)
async def get_report_detail(
    report_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """Get detailed report data."""
    try:
        return await parent_reports_service.get_report_detail(
            db=db,
            parent_id=current_user.id,
            report_id=report_id
        )
    except NotImplementedError:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Report detail not yet implemented"
        )


@router.get("/term-summary/{child_id}", response_model=TermSummaryResponse)
async def get_term_summary(
    child_id: UUID,
    term: str = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """Get term progress summary."""
    try:
        return await parent_reports_service.get_term_summary(
            db=db,
            parent_id=current_user.id,
            child_id=child_id,
            term=term
        )
    except NotImplementedError:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Term summary not yet implemented"
        )


@router.get("/transcript/{child_id}", response_model=TranscriptResponse)
async def get_transcript(
    child_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """Get official transcript."""
    try:
        return await parent_reports_service.get_transcript(
            db=db,
            parent_id=current_user.id,
            child_id=child_id
        )
    except NotImplementedError:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Transcript not yet implemented"
        )


@router.post("/portfolio/export", response_model=PortfolioExportResponse)
async def export_portfolio(
    request: PortfolioExportRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """Export child portfolio as ZIP."""
    return await parent_reports_service.export_portfolio(
        db=db,
        parent_id=current_user.id,
        request=request
    )


@router.get("/portfolio/status/{job_id}", response_model=PortfolioExportResponse)
async def get_export_status(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_parent_role)
):
    """Check portfolio export status."""
    return await parent_reports_service.get_export_status(
        db=db,
        parent_id=current_user.id,
        job_id=job_id
    )
