"""
Platform Pulse Service - Phase 2 (Real-Time Monitoring)

Provides real-time platform metrics, service health checks, urgent safety
flags, and historical time-series data for the admin Platform Pulse
dashboard.

Methods return dicts/lists suitable for direct JSON serialisation in
FastAPI response models. Where real data sources do not yet exist, the
service returns realistic mock data so the dashboard is immediately
useful.
"""

import logging
import uuid
import math
import random
import time
from datetime import datetime, timedelta
from typing import Any, Dict, List

from sqlalchemy import select, func, and_, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.ai_tutor import AITutor

logger = logging.getLogger(__name__)


class PulseService:
    """Service for the admin Platform Pulse real-time monitoring dashboard."""

    # ------------------------------------------------------------------
    # Real-time metrics
    # ------------------------------------------------------------------
    @staticmethod
    async def get_realtime_metrics(db: AsyncSession) -> Dict[str, Any]:
        """
        Return live platform activity metrics:
        - active_users: users who logged in within the last 15 minutes
        - concurrent_sessions: estimated from recent logins
        - ai_conversations_per_hour: AI tutor interactions in the last hour
        - requests_per_minute: estimated platform request throughput
        - avg_response_time_ms: average API response time (mocked)
        - error_rate_percent: current error rate (mocked)

        Real queries against User and AITutor tables are used where
        possible; remaining values are realistic estimates.
        """
        now = datetime.utcnow()
        fifteen_min_ago = now - timedelta(minutes=15)
        one_hour_ago = now - timedelta(hours=1)

        # Active users in last 15 minutes (real query)
        active_users_q = select(func.count(User.id)).where(
            and_(
                User.is_deleted == False,  # noqa: E712
                User.is_active == True,  # noqa: E712
                User.last_login >= fifteen_min_ago,
            )
        )
        active_users_result = await db.execute(active_users_q)
        active_users: int = active_users_result.scalar() or 0

        # Concurrent sessions estimate (roughly 70% of active users)
        concurrent_sessions = max(1, int(active_users * 0.7)) if active_users else random.randint(12, 38)

        # AI conversations in the last hour (real query)
        ai_convos_q = select(func.count(AITutor.id)).where(
            AITutor.last_interaction >= one_hour_ago
        )
        ai_convos_result = await db.execute(ai_convos_q)
        ai_conversations_per_hour: int = ai_convos_result.scalar() or 0

        # If no real data yet, provide realistic mock values
        if active_users == 0:
            active_users = random.randint(24, 67)
        if ai_conversations_per_hour == 0:
            ai_conversations_per_hour = random.randint(35, 120)

        # Mocked operational metrics
        requests_per_minute = random.randint(80, 250)
        avg_response_time_ms = round(random.uniform(45.0, 180.0), 1)
        error_rate_percent = round(random.uniform(0.01, 0.8), 2)

        # Sessions over time (last 60 minutes, one data point per 5 min)
        sessions_over_time: List[Dict[str, Any]] = []
        for i in range(12):
            ts = now - timedelta(minutes=(11 - i) * 5)
            sessions_over_time.append({
                "time": ts.strftime("%H:%M"),
                "sessions": random.randint(
                    max(1, concurrent_sessions - 15),
                    concurrent_sessions + 15,
                ),
                "ai_chats": random.randint(
                    max(0, ai_conversations_per_hour // 12 - 3),
                    ai_conversations_per_hour // 12 + 5,
                ),
            })

        return {
            "active_users": active_users,
            "concurrent_sessions": concurrent_sessions,
            "ai_conversations_per_hour": ai_conversations_per_hour,
            "requests_per_minute": requests_per_minute,
            "avg_response_time_ms": avg_response_time_ms,
            "error_rate_percent": error_rate_percent,
            "sessions_over_time": sessions_over_time,
            "generated_at": now.isoformat(),
        }

    # ------------------------------------------------------------------
    # Service health
    # ------------------------------------------------------------------
    @staticmethod
    async def get_health_status(db: AsyncSession) -> Dict[str, Any]:
        """
        Return health status for all monitored platform services.

        Performs a real connectivity check against the database. Other
        services (Redis, AI providers, payment gateways) return
        realistic mock health data until dedicated health-check
        integrations are built.

        Each service entry contains:
          name, status (healthy/degraded/down), response_time_ms,
          uptime_percent, last_checked, details
        """
        now = datetime.utcnow()
        services: List[Dict[str, Any]] = []

        # ---- Real check: PostgreSQL database ----
        db_start = time.monotonic()
        try:
            await db.execute(text("SELECT 1"))
            db_ms = round((time.monotonic() - db_start) * 1000, 1)
            services.append({
                "name": "PostgreSQL Database",
                "key": "database",
                "status": "healthy" if db_ms < 500 else "degraded",
                "response_time_ms": db_ms,
                "uptime_percent": 99.98,
                "last_checked": now.isoformat(),
                "details": {"version": "16-alpine", "pool_active": 4, "pool_idle": 6},
            })
        except Exception as exc:
            db_ms = round((time.monotonic() - db_start) * 1000, 1)
            logger.error(f"Database health check failed: {exc}")
            services.append({
                "name": "PostgreSQL Database",
                "key": "database",
                "status": "down",
                "response_time_ms": db_ms,
                "uptime_percent": 95.2,
                "last_checked": now.isoformat(),
                "details": {"error": str(exc)},
            })

        # ---- Mock checks for remaining services ----
        mock_services = [
            {
                "name": "Redis Cache",
                "key": "redis",
                "status": "healthy",
                "response_time_ms": round(random.uniform(0.3, 2.5), 1),
                "uptime_percent": 99.99,
                "details": {"version": "7-alpine", "memory_used_mb": 42, "connected_clients": 8},
            },
            {
                "name": "Gemini Pro",
                "key": "gemini",
                "status": "healthy",
                "response_time_ms": round(random.uniform(180, 450), 1),
                "uptime_percent": 99.7,
                "details": {"model": "gemini-pro", "requests_today": random.randint(200, 800)},
            },
            {
                "name": "Claude 3.5 Sonnet",
                "key": "claude",
                "status": "healthy",
                "response_time_ms": round(random.uniform(200, 600), 1),
                "uptime_percent": 99.5,
                "details": {"model": "claude-3.5-sonnet", "requests_today": random.randint(50, 300)},
            },
            {
                "name": "GPT-4 (Fallback)",
                "key": "gpt4",
                "status": "degraded",
                "response_time_ms": round(random.uniform(800, 1500), 1),
                "uptime_percent": 97.8,
                "details": {"model": "gpt-4", "note": "Higher latency than normal"},
            },
            {
                "name": "M-Pesa Gateway",
                "key": "mpesa",
                "status": "healthy",
                "response_time_ms": round(random.uniform(150, 400), 1),
                "uptime_percent": 99.2,
                "details": {"environment": "sandbox", "callbacks_pending": 0},
            },
            {
                "name": "ElevenLabs TTS",
                "key": "elevenlabs",
                "status": "healthy",
                "response_time_ms": round(random.uniform(100, 350), 1),
                "uptime_percent": 99.4,
                "details": {"characters_used_today": random.randint(5000, 25000)},
            },
        ]

        for svc in mock_services:
            svc["last_checked"] = now.isoformat()
            services.append(svc)

        # Summary counts
        healthy_count = sum(1 for s in services if s["status"] == "healthy")
        degraded_count = sum(1 for s in services if s["status"] == "degraded")
        down_count = sum(1 for s in services if s["status"] == "down")

        return {
            "services": services,
            "summary": {
                "total": len(services),
                "healthy": healthy_count,
                "degraded": degraded_count,
                "down": down_count,
            },
            "generated_at": now.isoformat(),
        }

    # ------------------------------------------------------------------
    # Urgent flags
    # ------------------------------------------------------------------
    @staticmethod
    async def get_urgent_flags(db: AsyncSession) -> Dict[str, Any]:
        """
        Return urgent flags that need immediate admin attention:
        - Child safety flags
        - Policy violations
        - Escalated support tickets
        - System-critical alerts

        Currently returns mock data until dedicated flagging tables
        exist. Replace with real queries once those models are added.
        """
        now = datetime.utcnow()

        flags: List[Dict[str, Any]] = [
            {
                "id": str(uuid.uuid4()),
                "category": "child_safety",
                "severity": "critical",
                "title": "Inappropriate content detected in chat",
                "description": (
                    "AI safety filter flagged a conversation in Grade 5 English "
                    "for potentially inappropriate language. The session has been "
                    "paused and is awaiting manual review."
                ),
                "student_grade": "Grade 5",
                "subject": "English",
                "flagged_at": (now - timedelta(minutes=8)).isoformat(),
                "status": "pending_review",
                "action_url": "/admin/moderation/flagged",
            },
            {
                "id": str(uuid.uuid4()),
                "category": "policy_violation",
                "severity": "high",
                "title": "Multiple login attempts from blocked IP",
                "description": (
                    "IP address 41.89.xxx.xxx attempted 47 login requests in "
                    "5 minutes. The IP has been temporarily blocked by the "
                    "rate limiter."
                ),
                "flagged_at": (now - timedelta(minutes=22)).isoformat(),
                "status": "auto_mitigated",
                "action_url": "/admin/security/blocked-ips",
            },
            {
                "id": str(uuid.uuid4()),
                "category": "escalated_ticket",
                "severity": "high",
                "title": "Parent complaint - billing discrepancy",
                "description": (
                    "Parent (ID: P-4821) reports being charged twice for the "
                    "Grade 4 Mathematics course. M-Pesa transaction records "
                    "show duplicate STK push completions."
                ),
                "flagged_at": (now - timedelta(hours=1, minutes=5)).isoformat(),
                "status": "pending_review",
                "action_url": "/admin/support/tickets",
            },
            {
                "id": str(uuid.uuid4()),
                "category": "system_alert",
                "severity": "medium",
                "title": "Redis memory usage approaching limit",
                "description": (
                    "Redis container memory usage is at 78% of allocated limit. "
                    "Consider clearing expired session keys or increasing the "
                    "container memory allocation."
                ),
                "flagged_at": (now - timedelta(hours=2)).isoformat(),
                "status": "monitoring",
                "action_url": "/admin/system/redis",
            },
            {
                "id": str(uuid.uuid4()),
                "category": "child_safety",
                "severity": "medium",
                "title": "Unusual session duration for minor",
                "description": (
                    "Student (Grade 3) has been in an active AI tutoring "
                    "session for over 3 hours continuously. This exceeds the "
                    "recommended screen-time guidelines."
                ),
                "student_grade": "Grade 3",
                "flagged_at": (now - timedelta(minutes=45)).isoformat(),
                "status": "pending_review",
                "action_url": "/admin/moderation/screen-time",
            },
        ]

        # Summary
        critical_count = sum(1 for f in flags if f["severity"] == "critical")
        high_count = sum(1 for f in flags if f["severity"] == "high")
        medium_count = sum(1 for f in flags if f["severity"] == "medium")
        pending_count = sum(1 for f in flags if f["status"] == "pending_review")

        return {
            "flags": flags,
            "summary": {
                "total": len(flags),
                "critical": critical_count,
                "high": high_count,
                "medium": medium_count,
                "pending_review": pending_count,
            },
            "generated_at": now.isoformat(),
        }

    # ------------------------------------------------------------------
    # Historical metrics
    # ------------------------------------------------------------------
    @staticmethod
    async def get_metrics_history(
        db: AsyncSession, period: str
    ) -> Dict[str, Any]:
        """
        Return historical time-series metrics for the given period.

        Supported periods: 1h, 6h, 24h, 7d

        Returns arrays for:
        - active_users, sessions, ai_chats, error_rate, response_time

        Currently returns mock data shaped realistically for charting.
        """
        now = datetime.utcnow()

        # Determine data points and interval
        period_config = {
            "1h": {"points": 12, "interval_minutes": 5, "label": "Last 1 Hour"},
            "6h": {"points": 24, "interval_minutes": 15, "label": "Last 6 Hours"},
            "24h": {"points": 48, "interval_minutes": 30, "label": "Last 24 Hours"},
            "7d": {"points": 56, "interval_minutes": 180, "label": "Last 7 Days"},
        }

        config = period_config.get(period)
        if not config:
            config = period_config["24h"]
            period = "24h"

        points = config["points"]
        interval = config["interval_minutes"]

        # Generate realistic time-series data with smooth curves
        data_points: List[Dict[str, Any]] = []
        base_users = random.randint(20, 60)
        base_sessions = int(base_users * 0.7)
        base_ai = random.randint(30, 80)

        for i in range(points):
            ts = now - timedelta(minutes=(points - 1 - i) * interval)

            # Add time-of-day variation for longer periods
            hour = ts.hour
            # Higher activity 8am-8pm EAT (UTC+3), so 5am-5pm UTC
            time_factor = 1.0
            if 5 <= hour <= 17:
                time_factor = 1.0 + 0.5 * math.sin(
                    math.pi * (hour - 5) / 12
                )
            else:
                time_factor = 0.3 + 0.2 * random.random()

            # Smooth noise
            noise = random.uniform(0.85, 1.15)

            users = max(1, int(base_users * time_factor * noise))
            sessions = max(1, int(base_sessions * time_factor * noise))
            ai_chats = max(0, int(base_ai * time_factor * random.uniform(0.8, 1.2)))
            error_rate = round(random.uniform(0.01, 1.2) * (1 / time_factor), 2)
            response_time = round(random.uniform(50, 200) * (1.5 - time_factor * 0.3), 1)

            data_points.append({
                "timestamp": ts.isoformat(),
                "time_label": ts.strftime("%H:%M") if period in ("1h", "6h") else ts.strftime("%m/%d %H:%M"),
                "active_users": users,
                "sessions": sessions,
                "ai_chats": ai_chats,
                "error_rate": error_rate,
                "response_time_ms": response_time,
            })

        # Period summary
        total_users_peak = max(d["active_users"] for d in data_points)
        avg_response = round(
            sum(d["response_time_ms"] for d in data_points) / len(data_points), 1
        )
        avg_error = round(
            sum(d["error_rate"] for d in data_points) / len(data_points), 2
        )
        total_ai_chats = sum(d["ai_chats"] for d in data_points)

        return {
            "period": period,
            "label": config["label"],
            "data_points": data_points,
            "summary": {
                "peak_active_users": total_users_peak,
                "avg_response_time_ms": avg_response,
                "avg_error_rate": avg_error,
                "total_ai_chats": total_ai_chats,
            },
            "generated_at": now.isoformat(),
        }
