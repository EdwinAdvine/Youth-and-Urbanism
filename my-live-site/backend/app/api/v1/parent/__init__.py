"""
Parent API Package

Parent dashboard API routers.
"""

from app.api.v1.parent.dashboard import router as dashboard_router
from app.api.v1.parent.children import router as children_router
from app.api.v1.parent.ai_insights import router as ai_insights_router
from app.api.v1.parent.communications import router as communications_router
from app.api.v1.parent.finance import router as finance_router
from app.api.v1.parent.mpesa import router as mpesa_router
from app.api.v1.parent.reports import router as reports_router
from app.api.v1.parent.settings import router as settings_router

__all__ = ["dashboard_router", "children_router", "ai_insights_router", "communications_router", "finance_router", "mpesa_router", "reports_router", "settings_router"]
