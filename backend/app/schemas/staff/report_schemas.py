"""
Report Builder Schemas

Request/response schemas for custom report definitions, scheduling, and export.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


# ── Report Widget ───────────────────────────────────────────

class ReportWidget(BaseModel):
    """A single widget in a report canvas."""
    id: str
    widget_type: str = Field(..., description="metric_card | line_chart | bar_chart | pie_chart | data_table | text_block")
    title: str = ""
    data_source: Optional[str] = None
    filters: Dict[str, Any] = Field(default_factory=dict)
    position: Dict[str, int] = Field(default_factory=dict, description="grid position: {x, y, w, h}")
    config: Dict[str, Any] = Field(default_factory=dict, description="Widget-specific configuration")


class ReportConfigSchema(BaseModel):
    """Full report configuration (stored as JSONB)."""
    widgets: List[ReportWidget] = Field(default_factory=list)
    layout_columns: int = Field(default=12, ge=1, le=24)
    date_range: Optional[Dict[str, str]] = None
    global_filters: Dict[str, Any] = Field(default_factory=dict)


# ── Report Definition ──────────────────────────────────────

class ReportDefinitionCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    report_type: str = Field(default="custom", description="custom | template")
    config: ReportConfigSchema
    filters: Dict[str, Any] = Field(default_factory=dict)
    is_template: bool = False
    is_shared: bool = False


class ReportDefinitionUpdate(BaseModel):
    name: Optional[str] = None
    config: Optional[ReportConfigSchema] = None
    filters: Optional[Dict[str, Any]] = None
    is_template: Optional[bool] = None
    is_shared: Optional[bool] = None


class ReportDefinitionResponse(BaseModel):
    id: str
    name: str
    report_type: str
    config: ReportConfigSchema
    filters: Dict[str, Any]
    created_by: str
    creator_name: Optional[str] = None
    is_template: bool
    is_shared: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ReportDefinitionListResponse(BaseModel):
    items: List[ReportDefinitionResponse]
    total: int
    page: int
    page_size: int


# ── Report Schedule ────────────────────────────────────────

class ScheduleCreate(BaseModel):
    report_id: str
    schedule_cron: str = Field(..., description="Cron expression e.g. '0 8 * * 1' for Monday 8am")
    format: str = Field(default="pdf", description="csv | excel | pdf")
    recipients: List[Dict[str, str]] = Field(default_factory=list, description="[{email, name}]")
    is_active: bool = True


class ScheduleUpdate(BaseModel):
    schedule_cron: Optional[str] = None
    format: Optional[str] = None
    recipients: Optional[List[Dict[str, str]]] = None
    is_active: Optional[bool] = None


class ScheduleResponse(BaseModel):
    id: str
    report_id: str
    report_name: Optional[str] = None
    schedule_cron: str
    format: str
    recipients: List[Dict[str, str]]
    is_active: bool
    next_run_at: Optional[datetime] = None
    last_run_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ── Export ──────────────────────────────────────────────────

class ExportRequest(BaseModel):
    report_id: str
    format: str = Field(default="pdf", description="csv | excel | pdf")
    date_range: Optional[Dict[str, str]] = None
    filters: Dict[str, Any] = Field(default_factory=dict)


class ExportResponse(BaseModel):
    export_id: str
    status: str = "processing"
    download_url: Optional[str] = None
    format: str
    created_at: datetime
