"""
Partner AI Service

Hybrid AI-powered insights, impact reports, forecasting, and content generation
for partners.

Architecture:
  - Base layer: Real data aggregation from the database (always works)
  - AI enhancement layer: Optional enrichment via the AI orchestrator when API
    keys are available, with graceful fallback to data-only responses
"""

import logging
import uuid
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Any, Dict, List, Optional

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.partner.sponsorship import (
    SponsorshipProgram,
    SponsoredChild,
    SponsoredChildStatus,
    ProgramStatus,
)
from app.models.partner.partner_subscription import (
    PartnerPayment,
    PartnerPaymentStatus,
    PartnerSubscription,
    PartnerSubscriptionStatus,
)
from app.models.partner.partner_impact import PartnerImpactReport, ReportType
from app.models.partner.partner_ticket import PartnerTicket
from app.models.partner.partner_profile import PartnerProfile

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# AI Enhancement Helper
# ---------------------------------------------------------------------------

async def _try_ai_enhance(db: AsyncSession, prompt: str, fallback: Any) -> Any:
    """Try to enhance data with AI, gracefully fallback if unavailable."""
    try:
        from app.services.ai_orchestrator import AIOrchestrator
        orchestrator = AIOrchestrator(db)
        await orchestrator.load_providers()
        response = await orchestrator.route_query(prompt)
        return response.get("message", fallback)
    except Exception as e:
        logger.debug(f"AI enhancement unavailable, using data-only: {e}")
        return fallback


def _decimal_to_float(value: Any) -> float:
    """Safely convert a Decimal or None to float."""
    if value is None:
        return 0.0
    if isinstance(value, Decimal):
        return float(value)
    return float(value)


# ---------------------------------------------------------------------------
# PartnerAIService class (facade)
# ---------------------------------------------------------------------------

class PartnerAIService:
    """Facade used by partner dashboard and sponsorship routes."""

    @staticmethod
    async def get_daily_highlights(
        db: AsyncSession,
        user_id: str,
    ) -> Dict[str, Any]:
        """
        Build daily highlights from real database activity, optionally
        enriched with an AI-generated natural-language summary.
        """
        now = datetime.utcnow()
        yesterday = now - timedelta(hours=24)
        highlights: List[Dict[str, Any]] = []
        recommendations: List[str] = []

        # --- 1. New children added in the last 24 hours ----------------------
        new_children_result = await db.execute(
            select(func.count(SponsoredChild.id)).where(
                and_(
                    SponsoredChild.partner_id == user_id,
                    SponsoredChild.created_at >= yesterday,
                )
            )
        )
        new_children_count = new_children_result.scalar() or 0
        if new_children_count > 0:
            highlights.append({
                "type": "new_children",
                "count": new_children_count,
                "message": (
                    f"{new_children_count} new "
                    f"{'child was' if new_children_count == 1 else 'children were'} "
                    f"added to your programs in the last 24 hours."
                ),
            })

        # --- 2. Recent payments received ------------------------------------
        recent_payments_result = await db.execute(
            select(
                func.count(PartnerPayment.id),
                func.coalesce(func.sum(PartnerPayment.amount), 0),
            ).where(
                and_(
                    PartnerPayment.partner_id == user_id,
                    PartnerPayment.status == PartnerPaymentStatus.COMPLETED,
                    PartnerPayment.paid_at >= yesterday,
                )
            )
        )
        row = recent_payments_result.one()
        payment_count, payment_total = row[0] or 0, _decimal_to_float(row[1])
        if payment_count > 0:
            highlights.append({
                "type": "payments_received",
                "count": payment_count,
                "total_amount": payment_total,
                "message": (
                    f"{payment_count} payment(s) totalling "
                    f"KES {payment_total:,.2f} were received."
                ),
            })

        # --- 3. Programs approaching their end date -------------------------
        one_week_from_now = now + timedelta(days=7)
        approaching_result = await db.execute(
            select(SponsorshipProgram).where(
                and_(
                    SponsorshipProgram.partner_id == user_id,
                    SponsorshipProgram.status == ProgramStatus.ACTIVE,
                    SponsorshipProgram.end_date != None,  # noqa: E711
                    SponsorshipProgram.end_date <= one_week_from_now.date(),
                )
            )
        )
        approaching_programs = approaching_result.scalars().all()
        for program in approaching_programs:
            highlights.append({
                "type": "program_deadline",
                "program_id": str(program.id),
                "program_name": program.name,
                "end_date": program.end_date.isoformat() if program.end_date else None,
                "message": (
                    f"Program \"{program.name}\" ends on "
                    f"{program.end_date.isoformat()}."
                ),
            })

        # --- 4. Build basic recommendations from data -----------------------
        if new_children_count == 0:
            recommendations.append(
                "Consider expanding your programs to sponsor more children."
            )
        if approaching_programs:
            recommendations.append(
                "Review programs approaching their deadlines and plan renewals."
            )
        if payment_count == 0:
            recommendations.append(
                "No recent payments recorded. Verify that billing is up to date."
            )

        # --- 5. Try AI enhancement for a polished summary -------------------
        data_summary = "; ".join(h["message"] for h in highlights) or "No recent activity."
        ai_prompt = (
            "You are an assistant for a partner sponsorship dashboard. "
            "Summarise the following daily activity highlights in 2-3 friendly, "
            "concise sentences suitable for a dashboard greeting card. "
            f"Activity data: {data_summary}"
        )
        ai_summary = await _try_ai_enhance(db, ai_prompt, None)
        if ai_summary:
            highlights.insert(0, {
                "type": "ai_summary",
                "message": ai_summary,
            })

        return {
            "highlights": highlights,
            "recommendations": recommendations,
            "generated_at": now.isoformat(),
        }

    @staticmethod
    async def get_child_insights(
        db: AsyncSession,
        partner_id: str,
        child_id: str,
    ) -> Dict[str, Any]:
        """Delegate to the module-level helper."""
        return await get_child_ai_insights(db, child_id)


# ---------------------------------------------------------------------------
# Module-level functions
# ---------------------------------------------------------------------------

async def generate_impact_report(
    db: AsyncSession,
    partner_id: str,
    params: Optional[Dict] = None,
) -> Dict[str, Any]:
    """
    Generate an impact report backed by real database metrics.
    A ``PartnerImpactReport`` row is persisted for audit/export.
    """
    params = params or {}
    now = datetime.utcnow()

    # --- Total and active children ------------------------------------------
    total_children_result = await db.execute(
        select(func.count(SponsoredChild.id)).where(
            SponsoredChild.partner_id == partner_id,
        )
    )
    total_children = total_children_result.scalar() or 0

    active_children_result = await db.execute(
        select(func.count(SponsoredChild.id)).where(
            and_(
                SponsoredChild.partner_id == partner_id,
                SponsoredChild.status == SponsoredChildStatus.ACTIVE,
            )
        )
    )
    active_children = active_children_result.scalar() or 0

    # --- Programs -----------------------------------------------------------
    programs_result = await db.execute(
        select(func.count(SponsorshipProgram.id)).where(
            SponsorshipProgram.partner_id == partner_id,
        )
    )
    total_programs = programs_result.scalar() or 0

    # --- Total payments (completed) -----------------------------------------
    payments_result = await db.execute(
        select(func.coalesce(func.sum(PartnerPayment.amount), 0)).where(
            and_(
                PartnerPayment.partner_id == partner_id,
                PartnerPayment.status == PartnerPaymentStatus.COMPLETED,
            )
        )
    )
    total_spend = _decimal_to_float(payments_result.scalar())

    # --- Average progress from ai_milestones --------------------------------
    children_result = await db.execute(
        select(SponsoredChild.ai_milestones).where(
            and_(
                SponsoredChild.partner_id == partner_id,
                SponsoredChild.status == SponsoredChildStatus.ACTIVE,
            )
        )
    )
    milestone_rows = children_result.scalars().all()

    progress_values: List[float] = []
    for milestones in milestone_rows:
        if not milestones or not isinstance(milestones, list):
            continue
        for m in milestones:
            if isinstance(m, dict) and "progress" in m:
                try:
                    progress_values.append(float(m["progress"]))
                except (ValueError, TypeError):
                    continue

    avg_progress = (
        round(sum(progress_values) / len(progress_values), 2)
        if progress_values
        else 0.0
    )

    # --- Build metrics dict -------------------------------------------------
    metrics: Dict[str, Any] = {
        "total_children": total_children,
        "active_children": active_children,
        "total_programs": total_programs,
        "total_spend": total_spend,
        "avg_progress": avg_progress,
        "completion_rate": (
            round(active_children / total_children, 2)
            if total_children > 0
            else 0.0
        ),
    }

    report_type_str = params.get("report_type", "custom")
    try:
        report_type_enum = ReportType(report_type_str)
    except ValueError:
        report_type_enum = ReportType.CUSTOM

    title = params.get(
        "title",
        f"Impact Report - {now.strftime('%B %Y')}",
    )

    # --- Try AI-enhanced summary --------------------------------------------
    summary_prompt = (
        "Write a two-paragraph executive summary for a partner impact report. "
        f"Key metrics: {total_children} total children sponsored, "
        f"{active_children} currently active, {total_programs} programs, "
        f"KES {total_spend:,.2f} total investment, "
        f"{avg_progress}% average learning progress."
    )
    ai_summary = await _try_ai_enhance(
        db,
        summary_prompt,
        (
            f"This report covers {total_programs} sponsorship program(s) "
            f"supporting {total_children} children ({active_children} active). "
            f"Total investment to date is KES {total_spend:,.2f} with an "
            f"average learning progress of {avg_progress}%."
        ),
    )

    # --- Persist report record ----------------------------------------------
    report = PartnerImpactReport(
        id=uuid.uuid4(),
        partner_id=partner_id,
        report_type=report_type_enum,
        title=title,
        summary=ai_summary if isinstance(ai_summary, str) else str(ai_summary),
        metrics=metrics,
        generated_at=now,
    )
    db.add(report)
    await db.flush()

    return {
        "partner_id": partner_id,
        "report_id": str(report.id),
        "report_type": report_type_enum.value,
        "title": title,
        "summary": ai_summary,
        "metrics": metrics,
        "generated_at": now.isoformat(),
    }


async def get_ai_forecasts(
    db: AsyncSession,
    partner_id: str,
) -> Dict[str, Any]:
    """
    Generate simple financial forecasts from the last 3 months of payment
    data and current active subscriptions.
    """
    now = datetime.utcnow()
    three_months_ago = now - timedelta(days=90)

    # --- Monthly payment totals over the last 3 months ----------------------
    payments_result = await db.execute(
        select(
            func.date_trunc("month", PartnerPayment.paid_at).label("month"),
            func.sum(PartnerPayment.amount).label("total"),
        ).where(
            and_(
                PartnerPayment.partner_id == partner_id,
                PartnerPayment.status == PartnerPaymentStatus.COMPLETED,
                PartnerPayment.paid_at >= three_months_ago,
                PartnerPayment.paid_at != None,  # noqa: E711
            )
        ).group_by("month").order_by("month")
    )
    monthly_rows = payments_result.all()

    monthly_totals: List[Dict[str, Any]] = []
    for row in monthly_rows:
        monthly_totals.append({
            "month": row.month.isoformat() if row.month else None,
            "total": _decimal_to_float(row.total),
        })

    # --- Calculate trend (simple average monthly spend) ---------------------
    total_amounts = [m["total"] for m in monthly_totals]
    avg_monthly = (
        round(sum(total_amounts) / len(total_amounts), 2)
        if total_amounts
        else 0.0
    )

    # --- Project based on current active subscriptions ----------------------
    subscriptions_result = await db.execute(
        select(
            func.coalesce(func.sum(PartnerSubscription.total_amount), 0)
        ).where(
            and_(
                PartnerSubscription.partner_id == partner_id,
                PartnerSubscription.status == PartnerSubscriptionStatus.ACTIVE,
            )
        )
    )
    active_subscription_total = _decimal_to_float(subscriptions_result.scalar())

    projected_next_month = max(avg_monthly, active_subscription_total)
    projected_next_quarter = projected_next_month * 3

    # --- Determine trend direction ------------------------------------------
    if len(total_amounts) >= 2:
        if total_amounts[-1] > total_amounts[0]:
            trend = "increasing"
        elif total_amounts[-1] < total_amounts[0]:
            trend = "decreasing"
        else:
            trend = "stable"
    else:
        trend = "insufficient_data"

    forecasts: List[Dict[str, Any]] = [
        {
            "period": "next_month",
            "projected_amount": round(projected_next_month, 2),
            "basis": "average of recent payments and active subscriptions",
        },
        {
            "period": "next_quarter",
            "projected_amount": round(projected_next_quarter, 2),
            "basis": "monthly projection extrapolated over 3 months",
        },
    ]

    return {
        "partner_id": partner_id,
        "monthly_history": monthly_totals,
        "trend": trend,
        "avg_monthly_spend": avg_monthly,
        "active_subscription_commitment": active_subscription_total,
        "forecasts": forecasts,
        "confidence": 0.7,
        "generated_at": now.isoformat(),
    }


async def get_child_ai_insights(
    db: AsyncSession,
    child_id: str,
) -> Dict[str, Any]:
    """
    Return insights for a specific sponsored child by analysing the
    ``ai_milestones`` and ``partner_goals`` stored on the record.
    """
    result = await db.execute(
        select(SponsoredChild).where(SponsoredChild.id == child_id)
    )
    child = result.scalars().first()

    if not child:
        return {
            "child_id": child_id,
            "insights": [],
            "recommendations": [],
            "error": "Sponsored child not found.",
        }

    milestones: List[Dict] = child.ai_milestones or []
    goals: List[Dict] = child.partner_goals or []
    insights: List[Dict[str, Any]] = []
    recommendations: List[str] = []

    # --- Derive insights from milestones ------------------------------------
    completed_milestones = [
        m for m in milestones
        if isinstance(m, dict) and m.get("status") == "completed"
    ]
    in_progress_milestones = [
        m for m in milestones
        if isinstance(m, dict) and m.get("status") == "in_progress"
    ]

    if milestones:
        insights.append({
            "type": "milestone_summary",
            "total": len(milestones),
            "completed": len(completed_milestones),
            "in_progress": len(in_progress_milestones),
            "message": (
                f"{len(completed_milestones)} of {len(milestones)} "
                f"milestones completed."
            ),
        })

    # --- Infer learning style from milestone subjects -----------------------
    subjects: List[str] = []
    for m in milestones:
        if isinstance(m, dict):
            subject = m.get("subject") or m.get("area") or m.get("category")
            if subject:
                subjects.append(str(subject).lower())

    if subjects:
        from collections import Counter
        subject_counts = Counter(subjects)
        top_subject = subject_counts.most_common(1)[0]
        insights.append({
            "type": "learning_style",
            "dominant_area": top_subject[0],
            "frequency": top_subject[1],
            "message": (
                f"Strongest engagement area: {top_subject[0]} "
                f"({top_subject[1]} milestones)."
            ),
        })

    # --- Analyse partner goals progress -------------------------------------
    goal_progress_values: List[float] = []
    overdue_goals: List[Dict] = []
    for goal in goals:
        if not isinstance(goal, dict):
            continue
        progress = goal.get("progress")
        if progress is not None:
            try:
                goal_progress_values.append(float(progress))
            except (ValueError, TypeError):
                pass
        target_date_str = goal.get("target_date")
        if target_date_str:
            try:
                target_date = datetime.fromisoformat(target_date_str)
                if target_date < datetime.utcnow() and (progress or 0) < 100:
                    overdue_goals.append(goal)
            except (ValueError, TypeError):
                pass

    if goal_progress_values:
        avg_goal_progress = round(
            sum(goal_progress_values) / len(goal_progress_values), 2
        )
        insights.append({
            "type": "goal_progress",
            "average_progress": avg_goal_progress,
            "total_goals": len(goals),
            "message": (
                f"Average goal progress is {avg_goal_progress}% "
                f"across {len(goals)} goal(s)."
            ),
        })

    if overdue_goals:
        insights.append({
            "type": "overdue_goals",
            "count": len(overdue_goals),
            "message": (
                f"{len(overdue_goals)} goal(s) are past their target date "
                f"and not yet complete."
            ),
        })
        recommendations.append(
            "Review overdue goals and adjust timelines or provide additional support."
        )

    # --- General recommendations based on data availability -----------------
    if not milestones:
        recommendations.append(
            "No AI milestones recorded yet. Encourage activity to enable "
            "progress tracking."
        )
    if not goals:
        recommendations.append(
            "Set specific goals for this child to measure impact more effectively."
        )
    if completed_milestones and len(completed_milestones) == len(milestones):
        recommendations.append(
            "All current milestones are complete. Consider setting new, "
            "more advanced milestones."
        )

    # --- Optional AI enrichment ---------------------------------------------
    if insights:
        insight_texts = "; ".join(i["message"] for i in insights)
        ai_prompt = (
            "You are an education analytics assistant. Given the following "
            "child progress data, provide 1-2 brief actionable recommendations "
            f"for the sponsoring partner. Data: {insight_texts}"
        )
        ai_recs = await _try_ai_enhance(db, ai_prompt, None)
        if ai_recs and isinstance(ai_recs, str):
            recommendations.append(ai_recs)

    return {
        "child_id": child_id,
        "status": child.status.value if child.status else None,
        "insights": insights,
        "recommendations": recommendations,
        "generated_at": datetime.utcnow().isoformat(),
    }


async def ai_triage_ticket(
    db: AsyncSession,
    ticket_data: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Categorise and prioritise a support ticket using keyword analysis,
    with an optional AI-generated suggested response.
    """
    subject = str(ticket_data.get("subject", "")).lower()
    description = str(ticket_data.get("description", "")).lower()
    combined_text = f"{subject} {description}"

    # --- Keyword-based categorisation ---------------------------------------
    category = "general"
    priority = "medium"

    billing_keywords = ["billing", "payment", "invoice", "charge", "refund", "mpesa", "subscription"]
    technical_keywords = ["error", "bug", "broken", "crash", "not working", "fail", "down", "500", "404"]
    child_keywords = ["child", "student", "progress", "grade", "learning", "milestone"]
    consent_keywords = ["consent", "permission", "data", "privacy", "signature"]

    if any(kw in combined_text for kw in technical_keywords):
        category = "technical"
        priority = "high"
    elif any(kw in combined_text for kw in billing_keywords):
        category = "billing"
        priority = "medium"
    elif any(kw in combined_text for kw in consent_keywords):
        category = "consent"
        priority = "high"
    elif any(kw in combined_text for kw in child_keywords):
        category = "child_concern"
        priority = "medium"

    # Escalate to urgent if explicit urgency signals
    urgency_keywords = ["urgent", "asap", "immediately", "critical", "emergency"]
    if any(kw in combined_text for kw in urgency_keywords):
        priority = "urgent"

    # --- Templated suggested responses by category --------------------------
    suggested_responses = {
        "billing": (
            "Thank you for reaching out about a billing matter. Our finance "
            "team will review your account and respond within 24 hours."
        ),
        "technical": (
            "We are sorry you are experiencing a technical issue. Our "
            "engineering team has been notified and will investigate promptly."
        ),
        "child_concern": (
            "Thank you for your concern about a sponsored child. Our child "
            "welfare team will review and provide an update shortly."
        ),
        "consent": (
            "We take data privacy seriously. A member of our compliance team "
            "will review your request and respond within 24 hours."
        ),
        "general": (
            "Thank you for contacting support. A team member will review "
            "your request and respond as soon as possible."
        ),
    }
    suggested_response = suggested_responses.get(category, suggested_responses["general"])

    # --- Optional AI-enhanced response --------------------------------------
    ai_prompt = (
        "You are a support assistant for an education sponsorship platform. "
        "Draft a brief, empathetic initial response for a support ticket. "
        f"Category: {category}. Priority: {priority}. "
        f"Subject: {ticket_data.get('subject', '')}. "
        f"Description snippet: {description[:300]}"
    )
    ai_response = await _try_ai_enhance(db, ai_prompt, None)
    if ai_response and isinstance(ai_response, str):
        suggested_response = ai_response

    return {
        "priority": priority,
        "category": category,
        "suggested_response": suggested_response,
    }


async def generate_custom_content(
    db: AsyncSession,
    partner_id: str,
    content_params: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Generate templated content for partner communications, optionally
    enhanced with AI.
    """
    now = datetime.utcnow()
    content_type = content_params.get("type", "general")

    # --- Fetch partner profile for context ----------------------------------
    profile_result = await db.execute(
        select(PartnerProfile).where(PartnerProfile.user_id == partner_id)
    )
    profile = profile_result.scalars().first()
    org_name = profile.organization_name if profile else "Partner"

    # --- Fetch summary stats for content ------------------------------------
    children_result = await db.execute(
        select(func.count(SponsoredChild.id)).where(
            and_(
                SponsoredChild.partner_id == partner_id,
                SponsoredChild.status == SponsoredChildStatus.ACTIVE,
            )
        )
    )
    active_children = children_result.scalar() or 0

    programs_result = await db.execute(
        select(func.count(SponsorshipProgram.id)).where(
            and_(
                SponsorshipProgram.partner_id == partner_id,
                SponsorshipProgram.status == ProgramStatus.ACTIVE,
            )
        )
    )
    active_programs = programs_result.scalar() or 0

    # --- Templated content by type ------------------------------------------
    templates: Dict[str, str] = {
        "newsletter": (
            f"{org_name} Sponsorship Update\n\n"
            f"We are pleased to share that {org_name} currently supports "
            f"{active_children} children across {active_programs} active "
            f"program(s). Our commitment to quality education continues to "
            f"make a meaningful impact in the lives of these learners.\n\n"
            f"Stay tuned for detailed progress reports coming soon."
        ),
        "report_summary": (
            f"Report Summary for {org_name}\n\n"
            f"Active Programs: {active_programs}\n"
            f"Active Children: {active_children}\n\n"
            f"This summary provides a snapshot of current sponsorship "
            f"activity. For full metrics, please generate a detailed "
            f"impact report from your dashboard."
        ),
        "parent_update": (
            f"Dear Parents,\n\n"
            f"On behalf of {org_name}, we would like to share a brief "
            f"update on the sponsorship programme. Currently, "
            f"{active_children} children are actively benefiting from "
            f"our support across {active_programs} programme(s). We value "
            f"your partnership and will continue to keep you informed.\n\n"
            f"Warm regards,\n{org_name}"
        ),
    }

    content = templates.get(content_type, templates["newsletter"])

    # --- Try AI enhancement -------------------------------------------------
    custom_topic = content_params.get("topic", "")
    custom_tone = content_params.get("tone", "professional")
    ai_prompt = (
        f"You are a content writer for an education sponsorship platform. "
        f"Write a {content_type} for the organisation '{org_name}'. "
        f"They sponsor {active_children} children in {active_programs} programmes. "
        f"Tone: {custom_tone}. "
    )
    if custom_topic:
        ai_prompt += f"Focus topic: {custom_topic}. "
    ai_prompt += "Keep it under 300 words."

    ai_content = await _try_ai_enhance(db, ai_prompt, None)
    if ai_content and isinstance(ai_content, str):
        content = ai_content

    return {
        "partner_id": partner_id,
        "content": content,
        "type": content_type,
        "generated_at": now.isoformat(),
    }


async def get_cohort_benchmarking(
    db: AsyncSession,
    partner_id: str,
    cohort_params: Optional[Dict] = None,
) -> Dict[str, Any]:
    """
    Compare the partner's programme metrics against platform-wide averages
    (mocked for the platform side until sufficient data is available).
    """
    cohort_params = cohort_params or {}
    now = datetime.utcnow()

    # --- Partner-level metrics ----------------------------------------------
    programs_result = await db.execute(
        select(func.count(SponsorshipProgram.id)).where(
            SponsorshipProgram.partner_id == partner_id,
        )
    )
    partner_programs = programs_result.scalar() or 0

    children_result = await db.execute(
        select(func.count(SponsoredChild.id)).where(
            SponsoredChild.partner_id == partner_id,
        )
    )
    partner_children = children_result.scalar() or 0

    spend_result = await db.execute(
        select(func.coalesce(func.sum(PartnerPayment.amount), 0)).where(
            and_(
                PartnerPayment.partner_id == partner_id,
                PartnerPayment.status == PartnerPaymentStatus.COMPLETED,
            )
        )
    )
    partner_spend = _decimal_to_float(spend_result.scalar())

    avg_children_per_program = (
        round(partner_children / partner_programs, 2)
        if partner_programs > 0
        else 0.0
    )
    avg_spend_per_child = (
        round(partner_spend / partner_children, 2)
        if partner_children > 0
        else 0.0
    )

    # --- Platform averages (mock) -------------------------------------------
    platform_avg_children_per_program = 15.0
    platform_avg_spend_per_child = 2500.0
    platform_avg_programs = 3.0

    benchmarks: List[Dict[str, Any]] = [
        {
            "metric": "children_per_program",
            "partner_value": avg_children_per_program,
            "platform_average": platform_avg_children_per_program,
            "comparison": (
                "above" if avg_children_per_program > platform_avg_children_per_program
                else "below" if avg_children_per_program < platform_avg_children_per_program
                else "equal"
            ),
        },
        {
            "metric": "spend_per_child",
            "partner_value": avg_spend_per_child,
            "platform_average": platform_avg_spend_per_child,
            "comparison": (
                "above" if avg_spend_per_child > platform_avg_spend_per_child
                else "below" if avg_spend_per_child < platform_avg_spend_per_child
                else "equal"
            ),
        },
        {
            "metric": "total_programs",
            "partner_value": float(partner_programs),
            "platform_average": platform_avg_programs,
            "comparison": (
                "above" if partner_programs > platform_avg_programs
                else "below" if partner_programs < platform_avg_programs
                else "equal"
            ),
        },
    ]

    comparison = {
        "partner": {
            "total_programs": partner_programs,
            "total_children": partner_children,
            "total_spend": partner_spend,
            "avg_children_per_program": avg_children_per_program,
            "avg_spend_per_child": avg_spend_per_child,
        },
        "platform_average": {
            "avg_programs": platform_avg_programs,
            "avg_children_per_program": platform_avg_children_per_program,
            "avg_spend_per_child": platform_avg_spend_per_child,
        },
    }

    return {
        "partner_id": partner_id,
        "benchmarks": benchmarks,
        "comparison": comparison,
        "generated_at": now.isoformat(),
    }
