"""Partner API v1 Routes Package."""

from .dashboard import router as dashboard_router
from .sponsorships import router as sponsorships_router
from .finance import router as finance_router
from .analytics import router as analytics_router
from .content import router as content_router
from .support import router as support_router
from .account import router as account_router
from .collaboration import router as collaboration_router

__all__ = [
    "dashboard_router",
    "sponsorships_router",
    "finance_router",
    "analytics_router",
    "content_router",
    "support_router",
    "account_router",
    "collaboration_router",
]
