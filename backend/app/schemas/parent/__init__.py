"""
Parent Schemas Package

Pydantic schemas for parent dashboard API requests/responses.
"""

from app.schemas.parent.dashboard_schemas import (
    ChildStatusCard,
    FamilyOverviewResponse,
    TodayHighlight,
    TodayHighlightsResponse,
    UrgentItem,
    UrgentItemsResponse,
    MoodEntryCreate,
    MoodEntryResponse,
    MoodHistoryQuery,
    MoodHistoryResponse,
    AIFamilyInsight,
    AIFamilySummaryResponse,
    DashboardStatsResponse,
)

__all__ = [
    "ChildStatusCard",
    "FamilyOverviewResponse",
    "TodayHighlight",
    "TodayHighlightsResponse",
    "UrgentItem",
    "UrgentItemsResponse",
    "MoodEntryCreate",
    "MoodEntryResponse",
    "MoodHistoryQuery",
    "MoodHistoryResponse",
    "AIFamilyInsight",
    "AIFamilySummaryResponse",
    "DashboardStatsResponse",
]
