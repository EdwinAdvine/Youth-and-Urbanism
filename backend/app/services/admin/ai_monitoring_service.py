"""
AI Monitoring Service - Phase 5 (AI Systems)

Provides data for AI monitoring dashboards by querying real models:
- AIConversationFlag for flagged conversations
- AIContentReview for AI-generated content review queue
- AIPerformanceMetric for provider performance metrics

Methods cover:
- Flagged AI conversations (safety, bias, quality, hallucination)
- AI-generated content review queue
- Personalization & adaptation audit data
- AI provider performance metrics
- Prompt drift analysis
- Safety incident dashboard
"""

import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from sqlalchemy import select, func, and_, or_, desc, case
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.admin.ai_monitoring import (
    AIConversationFlag,
    AIContentReview,
    AIPerformanceMetric,
)
from app.models.student import Student
from app.models.user import User

logger = logging.getLogger(__name__)


class AIMonitoringService:
    """Service for AI monitoring, safety, and performance dashboards."""

    # ------------------------------------------------------------------
    # Conversation Flags
    # ------------------------------------------------------------------
    @staticmethod
    async def get_conversation_flags(
        db: AsyncSession,
        page: int = 1,
        page_size: int = 10,
        severity_filter: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Return flagged AI conversations from AIConversationFlag model."""
        now = datetime.utcnow()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

        conditions = []
        if severity_filter:
            conditions.append(AIConversationFlag.severity == severity_filter)

        where_clause = and_(*conditions) if conditions else True

        # Total count
        count_q = select(func.count(AIConversationFlag.id)).where(where_clause)
        count_result = await db.execute(count_q)
        total: int = count_result.scalar() or 0

        # Paginated items
        offset = (page - 1) * page_size
        q = (
            select(AIConversationFlag)
            .where(where_clause)
            .order_by(AIConversationFlag.flagged_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        result = await db.execute(q)
        flags = result.scalars().all()

        # Resolve student names via Student model
        student_ids = list({f.student_id for f in flags if f.student_id})
        student_names: Dict[str, Dict[str, str]] = {}
        if student_ids:
            sq = select(Student.id, Student.admission_number, Student.grade_level, Student.user_id).where(
                Student.id.in_(student_ids)
            )
            sresult = await db.execute(sq)
            student_rows = sresult.all()
            user_ids = [r.user_id for r in student_rows if r.user_id]
            user_name_map: Dict[str, str] = {}
            if user_ids:
                uq = select(User.id, User.first_name, User.last_name).where(User.id.in_(user_ids))
                uresult = await db.execute(uq)
                for row in uresult:
                    user_name_map[str(row.id)] = f"{row.first_name} {row.last_name}"
            for srow in student_rows:
                student_names[str(srow.id)] = {
                    "name": user_name_map.get(str(srow.user_id), "Unknown"),
                    "grade": srow.grade_level or "",
                }

        items: List[Dict[str, Any]] = []
        for f in flags:
            sinfo = student_names.get(str(f.student_id), {"name": "Unknown", "grade": ""})
            items.append({
                "id": str(f.id),
                "student_name": sinfo["name"],
                "student_grade": sinfo["grade"],
                "flag_type": f.flag_type,
                "severity": f.severity,
                "snippet": f.snippet,
                "model_used": f.model_used,
                "status": f.status,
                "flagged_at": f.flagged_at.isoformat() if f.flagged_at else None,
                "conversation_id": str(f.conversation_id) if f.conversation_id else None,
            })

        # Summary counts for today
        today_cond = AIConversationFlag.flagged_at >= today_start

        summary_q = select(
            func.count(AIConversationFlag.id).label("total_today"),
            func.count(case((AIConversationFlag.severity == "critical", 1))).label("critical"),
            func.count(case((AIConversationFlag.severity == "high", 1))).label("high"),
            func.count(case((AIConversationFlag.severity == "medium", 1))).label("medium"),
            func.count(case((AIConversationFlag.severity == "low", 1))).label("low"),
            func.count(case((AIConversationFlag.status == "pending_review", 1))).label("pending_review"),
            func.count(case((AIConversationFlag.flag_type == "safety", 1))).label("safety_incidents"),
        ).where(today_cond)
        summary_result = await db.execute(summary_q)
        srow = summary_result.one()

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": max(1, (total + page_size - 1) // page_size),
            "summary": {
                "total_flags_today": srow.total_today,
                "critical": srow.critical,
                "high": srow.high,
                "medium": srow.medium,
                "low": srow.low,
                "pending_review": srow.pending_review,
                "safety_incidents": srow.safety_incidents,
                "avg_quality_score": 0,
                "total_conversations_today": 0,
            },
        }

    # ------------------------------------------------------------------
    # Content Review Queue
    # ------------------------------------------------------------------
    @staticmethod
    async def get_content_review_queue(
        db: AsyncSession,
        page: int = 1,
        page_size: int = 10,
    ) -> Dict[str, Any]:
        """Return AI-generated content awaiting human review from AIContentReview."""
        now = datetime.utcnow()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

        count_q = select(func.count(AIContentReview.id))
        count_result = await db.execute(count_q)
        total: int = count_result.scalar() or 0

        offset = (page - 1) * page_size
        q = (
            select(AIContentReview)
            .order_by(AIContentReview.created_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        result = await db.execute(q)
        reviews = result.scalars().all()

        # Resolve reviewer names
        reviewer_ids = list({r.reviewed_by for r in reviews if r.reviewed_by})
        names: Dict[str, str] = {}
        if reviewer_ids:
            uq = select(User.id, User.first_name, User.last_name).where(User.id.in_(reviewer_ids))
            uresult = await db.execute(uq)
            for row in uresult:
                names[str(row.id)] = f"{row.first_name} {row.last_name}"

        items: List[Dict[str, Any]] = []
        for r in reviews:
            items.append({
                "id": str(r.id),
                "content_type": r.content_type,
                "model_used": r.model_used,
                "original_content": (r.original_content[:200] + "...") if r.original_content and len(r.original_content) > 200 else r.original_content,
                "flagged_issues": r.flagged_issues or [],
                "status": r.status,
                "reviewed_by": names.get(str(r.reviewed_by)) if r.reviewed_by else None,
                "reviewed_at": r.reviewed_at.isoformat() if r.reviewed_at else None,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            })

        # Summary
        today_cond = AIContentReview.created_at >= today_start
        pending_q = select(func.count(AIContentReview.id)).where(AIContentReview.status == "pending")
        approved_q = select(func.count(AIContentReview.id)).where(
            and_(AIContentReview.status == "approved", today_cond)
        )
        rejected_q = select(func.count(AIContentReview.id)).where(
            and_(AIContentReview.status == "rejected", today_cond)
        )
        edited_q = select(func.count(AIContentReview.id)).where(
            and_(AIContentReview.status == "edited", today_cond)
        )

        pending_r = await db.execute(pending_q)
        approved_r = await db.execute(approved_q)
        rejected_r = await db.execute(rejected_q)
        edited_r = await db.execute(edited_q)

        pending_count = pending_r.scalar() or 0
        approved_count = approved_r.scalar() or 0
        rejected_count = rejected_r.scalar() or 0
        edited_count = edited_r.scalar() or 0
        total_today = approved_count + rejected_count + edited_count
        approval_rate = round(approved_count / total_today, 2) if total_today > 0 else 0

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": max(1, (total + page_size - 1) // page_size),
            "summary": {
                "pending_review": pending_count,
                "approved_today": approved_count,
                "rejected_today": rejected_count,
                "overridden_today": edited_count,
                "approval_rate": approval_rate,
                "override_rate": round(edited_count / total_today, 2) if total_today > 0 else 0,
                "avg_accuracy_score": 0,
            },
        }

    # ------------------------------------------------------------------
    # Personalization Audits
    # ------------------------------------------------------------------
    @staticmethod
    async def get_personalization_audits(
        db: AsyncSession,
    ) -> Dict[str, Any]:
        """
        Return learning path audit data. This aggregates from
        AIPerformanceMetric where metric_type='accuracy' to
        understand personalization effectiveness by subject.
        """
        # Query accuracy metrics grouped by metadata.subject
        q = select(AIPerformanceMetric).where(
            AIPerformanceMetric.metric_type == "accuracy"
        ).order_by(AIPerformanceMetric.recorded_at.desc()).limit(100)
        result = await db.execute(q)
        metrics = result.scalars().all()

        # Aggregate by subject from metadata
        subject_data: Dict[str, Dict[str, Any]] = {}
        for m in metrics:
            meta = m.extra_data if isinstance(getattr(m, 'extra_data', None), dict) else {}
            if not isinstance(meta, dict):
                meta = {}
            subject = meta.get("subject", "General")
            if subject not in subject_data:
                subject_data[subject] = {"values": [], "count": 0}
            subject_data[subject]["values"].append(m.value or 0)
            subject_data[subject]["count"] += 1

        learning_path_diversity = []
        for subj, data in subject_data.items():
            avg_val = sum(data["values"]) / len(data["values"]) if data["values"] else 0
            learning_path_diversity.append({
                "subject": subj,
                "unique_paths": data["count"],
                "students": data["count"],
                "avg_adaptation": round(avg_val, 2),
            })

        return {
            "learning_path_diversity": learning_path_diversity,
            "bias_metrics": {
                "gender": {},
                "grade_level": {},
                "location": {},
            },
            "adaptation_timeline": [],
            "over_customization_flags": [],
            "summary": {
                "students_with_personalized_paths": sum(d["count"] for d in subject_data.values()),
                "avg_adaptation_score": 0,
                "over_customization_count": 0,
                "total_unique_paths": len(subject_data),
                "paths_updated_today": 0,
            },
        }

    # ------------------------------------------------------------------
    # Performance Overview
    # ------------------------------------------------------------------
    @staticmethod
    async def get_performance_overview(
        db: AsyncSession,
    ) -> Dict[str, Any]:
        """Return AI provider performance metrics from AIPerformanceMetric."""
        now = datetime.utcnow()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

        # Get recent metrics grouped by model
        q = (
            select(
                AIPerformanceMetric.model_name,
                AIPerformanceMetric.metric_type,
                func.avg(AIPerformanceMetric.value).label("avg_value"),
                func.count(AIPerformanceMetric.id).label("count"),
            )
            .where(AIPerformanceMetric.recorded_at >= today_start)
            .group_by(AIPerformanceMetric.model_name, AIPerformanceMetric.metric_type)
        )
        result = await db.execute(q)
        rows = result.all()

        # Aggregate by provider
        provider_data: Dict[str, Dict[str, Any]] = {}
        for row in rows:
            name = row.model_name or "unknown"
            if name not in provider_data:
                provider_data[name] = {
                    "name": name,
                    "latency": 0,
                    "accuracy": 0,
                    "cost": 0,
                    "throughput": 0,
                    "total_requests": 0,
                }
            if row.metric_type == "latency":
                provider_data[name]["latency"] = round(float(row.avg_value or 0), 1)
                provider_data[name]["total_requests"] += row.count
            elif row.metric_type == "accuracy":
                provider_data[name]["accuracy"] = round(float(row.avg_value or 0), 3)
            elif row.metric_type == "cost":
                provider_data[name]["cost"] = round(float(row.avg_value or 0), 2)
            elif row.metric_type == "throughput":
                provider_data[name]["throughput"] = round(float(row.avg_value or 0), 1)

        providers = []
        total_requests = 0
        total_cost = 0
        latencies = []

        for name, data in provider_data.items():
            error_rate = 0
            status = "healthy"
            if data["accuracy"] > 0 and data["accuracy"] < 0.9:
                status = "degraded"

            providers.append({
                "id": name,
                "name": name,
                "provider": name.split("-")[0] if "-" in name else name,
                "avg_response_time_ms": data["latency"],
                "p50_latency_ms": data["latency"],
                "p95_latency_ms": int(data["latency"] * 1.5),
                "p99_latency_ms": int(data["latency"] * 2),
                "error_rate": error_rate,
                "satisfaction_score": round(data["accuracy"] * 5, 1) if data["accuracy"] else 0,
                "total_requests_today": data["total_requests"],
                "successful_requests": data["total_requests"],
                "failed_requests": 0,
                "status": status,
                "last_error": None,
                "cost_today_kes": data["cost"],
            })
            total_requests += data["total_requests"]
            total_cost += data["cost"]
            if data["latency"] > 0:
                latencies.append(data["latency"])

        avg_latency = round(sum(latencies) / len(latencies), 1) if latencies else 0
        degraded = sum(1 for p in providers if p["status"] == "degraded")

        return {
            "providers": providers,
            "response_time_trends": [],
            "error_patterns": [],
            "summary": {
                "total_requests_today": total_requests,
                "avg_response_time_ms": avg_latency,
                "overall_error_rate": 0,
                "avg_satisfaction": 0,
                "total_cost_today_kes": total_cost,
                "active_providers": len(providers),
                "degraded_providers": degraded,
            },
        }

    # ------------------------------------------------------------------
    # Drift Analysis
    # ------------------------------------------------------------------
    @staticmethod
    async def get_drift_analysis(
        db: AsyncSession,
    ) -> Dict[str, Any]:
        """
        Return prompt drift analysis by comparing accuracy metrics
        across time periods per model.
        """
        now = datetime.utcnow()

        # Get weekly accuracy averages for the last 8 weeks
        weeks: List[Dict[str, Any]] = []
        for week_offset in range(8):
            week_end = now - timedelta(weeks=week_offset)
            week_start = week_end - timedelta(weeks=1)

            q = (
                select(
                    AIPerformanceMetric.model_name,
                    func.avg(AIPerformanceMetric.value).label("avg_accuracy"),
                )
                .where(
                    and_(
                        AIPerformanceMetric.metric_type == "accuracy",
                        AIPerformanceMetric.recorded_at >= week_start,
                        AIPerformanceMetric.recorded_at < week_end,
                    )
                )
                .group_by(AIPerformanceMetric.model_name)
            )
            result = await db.execute(q)
            rows = result.all()

            week_data: Dict[str, float] = {"week": f"Week {8 - week_offset}"}
            for row in rows:
                # Drift score = 1 - accuracy (lower accuracy = higher drift)
                drift = round(1 - float(row.avg_accuracy or 1), 3)
                week_data[row.model_name] = max(0, drift)
            weeks.append(week_data)

        weeks.reverse()

        return {
            "drift_scores": weeks,
            "alerts": [],
            "generated_at": now.isoformat(),
        }

    # ------------------------------------------------------------------
    # Safety Dashboard
    # ------------------------------------------------------------------
    @staticmethod
    async def get_safety_dashboard(
        db: AsyncSession,
    ) -> Dict[str, Any]:
        """
        Return safety incident summary from AIConversationFlag where
        flag_type='safety'.
        """
        now = datetime.utcnow()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

        # Today's safety incidents
        q = (
            select(AIConversationFlag)
            .where(
                and_(
                    AIConversationFlag.flag_type == "safety",
                    AIConversationFlag.flagged_at >= today_start,
                )
            )
            .order_by(AIConversationFlag.flagged_at.desc())
        )
        result = await db.execute(q)
        flags = result.scalars().all()

        incidents_today: List[Dict[str, Any]] = []
        for f in flags:
            incidents_today.append({
                "id": str(f.id),
                "type": "content_safety",
                "severity": f.severity,
                "title": f"Safety flag: {f.severity}",
                "description": f.snippet or "",
                "model": f.model_used or "",
                "action_taken": f.status,
                "reported_at": f.flagged_at.isoformat() if f.flagged_at else None,
                "resolved": f.status in ("approved", "dismissed"),
            })

        # Weekly trends
        safety_trends: List[Dict[str, Any]] = []
        for day_offset in range(7):
            day = now - timedelta(days=6 - day_offset)
            day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)

            day_q = select(
                func.count(AIConversationFlag.id).label("incidents"),
                func.count(case((AIConversationFlag.status == "dismissed", 1))).label("blocked"),
                func.count(case((AIConversationFlag.status.in_(["approved", "dismissed"]), 1))).label("reviewed"),
            ).where(
                and_(
                    AIConversationFlag.flag_type == "safety",
                    AIConversationFlag.flagged_at >= day_start,
                    AIConversationFlag.flagged_at < day_end,
                )
            )
            day_result = await db.execute(day_q)
            drow = day_result.one()
            safety_trends.append({
                "date": day_start.strftime("%b %d"),
                "incidents": drow.incidents,
                "blocked": drow.blocked,
                "reviewed": drow.reviewed,
            })

        # Summary
        total_today = len(incidents_today)
        resolved_today = sum(1 for i in incidents_today if i["resolved"])
        resolution_rate = round(resolved_today / total_today, 2) if total_today > 0 else 0

        return {
            "incidents_today": incidents_today,
            "safety_trends": safety_trends,
            "summary": {
                "total_incidents_today": total_today,
                "total_blocked_today": sum(1 for i in incidents_today if i["action_taken"] == "dismissed"),
                "total_reviewed_today": resolved_today,
                "resolution_rate": resolution_rate,
                "avg_resolution_time_minutes": 0,
                "safety_score": round((1 - total_today / max(1, total_today + 100)) * 100, 1),
            },
            "generated_at": now.isoformat(),
        }
