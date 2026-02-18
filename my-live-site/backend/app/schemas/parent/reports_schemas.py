"""
Parent Reports Schemas

Schemas for reports, transcripts, and portfolio exports.
"""

from pydantic import BaseModel
from typing import Optional, List, Dict
from uuid import UUID
from datetime import datetime, date


class ReportSummary(BaseModel):
    """Report summary for list view"""
    id: UUID
    child_id: UUID
    child_name: str
    report_type: str  # weekly, monthly, term, transcript, portfolio
    title: str
    period_start: date
    period_end: date
    status: str  # generating, ready, archived
    pdf_url: Optional[str] = None
    created_at: datetime


class ReportsListResponse(BaseModel):
    """List of reports"""
    reports: List[ReportSummary]
    total_count: int


class GenerateReportRequest(BaseModel):
    """Generate new report request"""
    child_id: UUID
    report_type: str
    period_start: date
    period_end: date
    include_ai_summary: bool = True


class ReportDetailResponse(BaseModel):
    """Detailed report data"""
    id: UUID
    child_id: UUID
    child_name: str
    report_type: str
    title: str
    period_start: date
    period_end: date
    data: Dict  # Report-specific data
    ai_summary: Optional[str] = None
    ai_projections: Optional[Dict] = None
    pdf_url: Optional[str] = None
    status: str
    created_at: datetime


class TermSummaryResponse(BaseModel):
    """Term progress summary"""
    child_id: UUID
    child_name: str
    term: str
    academic_year: str
    subjects: List[Dict]  # Subject progress
    cbc_competencies: List[Dict]
    attendance_rate: float
    overall_grade: float
    teacher_comment: Optional[str] = None
    ai_analysis: Optional[str] = None


class TranscriptResponse(BaseModel):
    """Official transcript"""
    student_id: UUID
    student_name: str
    admission_number: str
    grade_level: str
    academic_records: List[Dict]  # Historical grades
    certificates: List[Dict]
    total_credits: int
    gpa: float
    generated_at: datetime
    pdf_url: str


class PortfolioExportRequest(BaseModel):
    """Export portfolio request"""
    child_id: UUID
    include_certificates: bool = True
    include_projects: bool = True
    include_assessments: bool = True
    period_start: Optional[date] = None
    period_end: Optional[date] = None


class PortfolioExportResponse(BaseModel):
    """Portfolio export status"""
    job_id: str
    status: str  # pending, processing, completed, failed
    progress_percentage: int = 0
    download_url: Optional[str] = None
    created_at: datetime
