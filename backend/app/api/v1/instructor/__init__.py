"""
Instructor API Routes

All instructor dashboard API endpoints.
"""

from .dashboard import router as dashboard_router
from .account import router as account_router
from .earnings import router as earnings_router
from .courses import router as courses_router
from .assessments import router as assessments_router
from .sessions import router as sessions_router
from .interactions import router as interactions_router
from .impact import router as impact_router
from .hub import router as hub_router
from .resources import router as resources_router
from .insights import router as insights_router

__all__ = [
    "dashboard_router",
    "account_router",
    "earnings_router",
    "courses_router",
    "assessments_router",
    "sessions_router",
    "interactions_router",
    "impact_router",
    "hub_router",
    "resources_router",
    "insights_router",
]
