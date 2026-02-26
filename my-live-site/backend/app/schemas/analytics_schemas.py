"""
Analytics Pydantic Schemas for Urban Home School

Request and response schemas for payment and revenue analytics dashboard.
"""

from datetime import datetime, date
from decimal import Decimal
from typing import Optional, List, Dict, Any
from uuid import UUID
from enum import Enum

from pydantic import BaseModel, Field, ConfigDict


# Enums

class PeriodType(str, Enum):
    """Analytics period types"""
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"


class MetricType(str, Enum):
    """Types of metrics"""
    REVENUE = "revenue"
    TRANSACTIONS = "transactions"
    SUBSCRIPTIONS = "subscriptions"
    REFUNDS = "refunds"
    PAYMENTS = "payments"


# ========== REVENUE METRICS SCHEMAS ==========

class RevenueMetricsResponse(BaseModel):
    """Schema for revenue metrics response"""
    id: UUID
    metric_date: date
    period_type: str
    currency: str

    # Revenue
    total_revenue: Decimal
    net_revenue: Decimal
    refund_amount: Decimal

    # Counts
    transaction_count: int
    successful_count: int
    failed_count: int
    refund_count: int

    # Calculated
    average_transaction_value: Decimal
    refund_rate: Decimal
    success_rate: Decimal

    # Breakdowns
    gateway_breakdown: Dict[str, Any]
    payment_method_breakdown: Dict[str, Any]

    # Revenue types
    course_revenue: Decimal
    subscription_revenue: Decimal

    metadata: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RevenueMetricsListResponse(BaseModel):
    """Schema for paginated revenue metrics list"""
    metrics: List[RevenueMetricsResponse]
    total: int = Field(..., ge=0)
    page: int = Field(..., ge=1)
    page_size: int = Field(..., ge=1, le=100)
    total_pages: int = Field(..., ge=0)


class RevenueSummary(BaseModel):
    """Schema for revenue summary"""
    period_start: date
    period_end: date
    period_type: str

    # Totals
    total_revenue: Decimal
    net_revenue: Decimal
    refund_amount: Decimal

    # Growth
    revenue_growth: Decimal = Field(..., description="% change from previous period")
    transaction_growth: Decimal = Field(..., description="% change in transactions")

    # Rates
    refund_rate: Decimal
    success_rate: Decimal
    average_transaction_value: Decimal

    # Top performers
    top_gateway: str
    top_course: Optional[Dict[str, Any]] = None

    # Trend data
    daily_revenue: List[Dict[str, Any]] = Field(..., description="Daily breakdown")


# ========== PAYMENT ANALYTICS SCHEMAS ==========

class PaymentAnalyticsResponse(BaseModel):
    """Schema for payment analytics response"""
    id: UUID
    metric_date: date
    period_type: str

    # Subscription metrics
    active_subscriptions: int
    new_subscriptions: int
    cancelled_subscriptions: int
    churned_subscriptions: int

    # Revenue metrics
    mrr: Decimal
    arr: Decimal
    churn_rate: Decimal

    # Computed
    net_new_subscriptions: int
    subscription_growth_rate: Decimal

    # Statistics
    payment_method_stats: Dict[str, Any]
    gateway_performance: Dict[str, Any]
    failed_payment_stats: Dict[str, Any]

    metadata: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaymentAnalyticsListResponse(BaseModel):
    """Schema for paginated payment analytics list"""
    analytics: List[PaymentAnalyticsResponse]
    total: int = Field(..., ge=0)
    page: int = Field(..., ge=1)
    page_size: int = Field(..., ge=1, le=100)
    total_pages: int = Field(..., ge=0)


class SubscriptionMetricsSummary(BaseModel):
    """Schema for subscription metrics summary"""
    period_start: date
    period_end: date

    # Current state
    active_subscriptions: int
    trialing_subscriptions: int
    past_due_subscriptions: int

    # Period activity
    new_subscriptions: int
    cancelled_subscriptions: int
    churned_subscriptions: int
    net_new_subscriptions: int

    # Revenue
    mrr: Decimal = Field(..., description="Monthly Recurring Revenue")
    arr: Decimal = Field(..., description="Annual Recurring Revenue")

    # Rates
    churn_rate: Decimal = Field(..., description="Monthly churn %")
    growth_rate: Decimal = Field(..., description="Subscription growth %")
    retention_rate: Decimal = Field(..., description="Customer retention %")

    # Lifetime value
    average_ltv: Decimal = Field(..., description="Average customer LTV")
    average_subscription_length_days: int

    # Plan breakdown
    subscriptions_by_plan: Dict[str, int]
    revenue_by_plan: Dict[str, Decimal]


# ========== DASHBOARD ANALYTICS ==========

class DashboardOverview(BaseModel):
    """Schema for admin dashboard overview"""
    # Today's metrics
    today_revenue: Decimal
    today_transactions: int
    today_new_subscriptions: int

    # This month
    month_revenue: Decimal
    month_transactions: int
    month_new_subscriptions: int
    month_refunds: Decimal

    # Growth rates
    revenue_growth: Decimal = Field(..., description="% vs last month")
    transaction_growth: Decimal
    subscription_growth: Decimal

    # Current state
    active_subscriptions: int
    total_users: int
    mrr: Decimal
    arr: Decimal

    # Top performers
    top_courses: List[Dict[str, Any]] = Field(max_items=5)
    top_instructors: List[Dict[str, Any]] = Field(max_items=5)

    # Recent activity
    recent_transactions: List[Dict[str, Any]] = Field(max_items=10)
    pending_refunds: int


class RevenueChart(BaseModel):
    """Schema for revenue chart data"""
    period_type: PeriodType
    period_start: date
    period_end: date

    data_points: List[Dict[str, Any]] = Field(
        ...,
        description="List of {date, revenue, transactions, refunds}"
    )

    total_revenue: Decimal
    average_daily_revenue: Decimal
    peak_revenue_date: date
    peak_revenue_amount: Decimal


class GatewayPerformance(BaseModel):
    """Schema for payment gateway performance"""
    gateway: str
    total_transactions: int
    successful_transactions: int
    failed_transactions: int
    success_rate: Decimal
    total_revenue: Decimal
    average_transaction_value: Decimal
    processing_time_avg_seconds: Optional[float] = None


class GatewayPerformanceComparison(BaseModel):
    """Schema for comparing gateway performance"""
    period_start: date
    period_end: date
    gateways: List[GatewayPerformance]
    best_success_rate: str = Field(..., description="Gateway with best success rate")
    highest_volume: str = Field(..., description="Gateway with highest volume")


# ========== ANALYTICS FILTERS ==========

class AnalyticsFilters(BaseModel):
    """Schema for filtering analytics"""
    period_start: date = Field(..., description="Start date for analytics")
    period_end: date = Field(..., description="End date for analytics")
    period_type: Optional[PeriodType] = Field(None, description="Aggregation period")
    currency: Optional[str] = Field(None, description="Filter by currency")
    gateway: Optional[List[str]] = Field(None, description="Filter by gateway")
    course_id: Optional[UUID] = Field(None, description="Filter by course")
    instructor_id: Optional[UUID] = Field(None, description="Filter by instructor")


class AnalyticsExport(BaseModel):
    """Schema for exporting analytics data"""
    filters: AnalyticsFilters
    metrics: List[MetricType] = Field(..., description="Metrics to include")
    format: str = Field(default="csv", description="Export format: csv, xlsx, pdf")
    include_charts: bool = Field(default=False, description="Include charts in export")


# ========== COHORT ANALYSIS ==========

class CohortAnalysis(BaseModel):
    """Schema for cohort analysis"""
    cohort_month: date = Field(..., description="Month cohort started")
    initial_size: int = Field(..., description="Starting cohort size")
    retention_by_month: List[Dict[str, Any]] = Field(
        ...,
        description="Monthly retention rates"
    )
    total_revenue: Decimal = Field(..., description="Total revenue from cohort")
    average_ltv: Decimal = Field(..., description="Average LTV per user")


class CohortAnalysisList(BaseModel):
    """Schema for list of cohort analyses"""
    cohorts: List[CohortAnalysis]
    overall_retention_rate: Decimal
    best_performing_cohort: date
    worst_performing_cohort: date


# ========== FUNNEL ANALYSIS ==========

class FunnelStage(BaseModel):
    """Schema for a funnel stage"""
    stage_name: str
    stage_order: int
    user_count: int
    conversion_rate: Decimal = Field(..., description="% of previous stage")
    drop_off_rate: Decimal = Field(..., description="% lost at this stage")


class FunnelAnalysis(BaseModel):
    """Schema for conversion funnel analysis"""
    funnel_name: str = Field(default="Payment Funnel")
    period_start: date
    period_end: date

    stages: List[FunnelStage] = Field(
        ...,
        description="Funnel stages in order"
    )

    overall_conversion_rate: Decimal = Field(..., description="Start to finish %")
    biggest_drop_off_stage: str
    total_users_entered: int
    total_users_completed: int


# ========== CUSTOM REPORTS ==========

class CustomReportRequest(BaseModel):
    """Schema for requesting a custom report"""
    report_name: str = Field(..., max_length=100)
    filters: AnalyticsFilters
    metrics: List[MetricType]
    grouping: List[str] = Field(
        ...,
        description="Group by: gateway, course, date, etc."
    )
    sort_by: str = Field(default="date", description="Sort field")
    sort_order: str = Field(default="desc", description="Sort order: asc, desc")


class CustomReportResponse(BaseModel):
    """Schema for custom report response"""
    report_id: UUID
    report_name: str
    generated_at: datetime
    filters: Dict[str, Any]
    data: List[Dict[str, Any]]
    total_rows: int
    summary: Dict[str, Any] = Field(..., description="Aggregate summaries")


# ========== REAL-TIME METRICS ==========

class RealTimeMetrics(BaseModel):
    """Schema for real-time dashboard metrics"""
    active_users: int = Field(..., description="Users active in last hour")
    transactions_last_hour: int
    revenue_last_hour: Decimal
    active_checkouts: int = Field(..., description="Users in checkout")
    failed_payments_last_hour: int

    # Trends (last hour vs previous hour)
    transaction_trend: Decimal = Field(..., description="% change")
    revenue_trend: Decimal = Field(..., description="% change")

    timestamp: datetime


class AlertThreshold(BaseModel):
    """Schema for analytics alert thresholds"""
    metric_name: str
    threshold_value: Decimal
    comparison: str = Field(..., description="gt, lt, eq")
    is_triggered: bool
    current_value: Decimal
    message: str
