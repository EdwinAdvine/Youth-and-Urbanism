"""
Instructor API Routes

All instructor dashboard API endpoints.
"""

from .dashboard import router as dashboard_router
from .account import router as account_router
from .earnings import router as earnings_router

__all__ = [
    "dashboard_router",
    "account_router",
    "earnings_router",
]
