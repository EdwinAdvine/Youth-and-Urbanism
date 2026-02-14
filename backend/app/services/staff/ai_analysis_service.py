"""
AI Analysis Service

Centralised AI-powered analysis functions used across the staff dashboard:
risk scoring, performance prediction, content quality analysis, workload
balancing, feedback drafting, and FAQ update suggestions.

All functions route through the existing AIOrchestrator.
"""

import json
import logging
from typing import Any, Dict, List, Optional

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.staff.student_journey import StudentJourney
from app.models.staff.ticket import StaffTicket
from app.models.enrollment import Enrollment
from app.services.ai_orchestrator import AIOrchestrator

logger = logging.getLogger(__name__)


async def analyze_risk(
    text: str,
    context: Optional[Dict[str, Any]] = None,
    db: Optional[AsyncSession] = None,
) -> Dict[str, Any]:
    """
    AI risk scoring for content safety and moderation.

    Returns a risk score (0-1), risk categories, and a human-readable
    explanation of the detected risks.
    """
    try:
        context = context or {}

        prompt = (
            "Analyse the following text for content safety risks in an educational "
            "platform for Kenyan children. Score the risk from 0.0 (safe) to 1.0 "
            "(dangerous). Identify risk categories from: harassment, inappropriate, "
            "misinformation, privacy, violence, hate_speech, other. "
            "Return JSON with: risk_score (float), categories (list of strings), "
            "explanation (string), flagged_phrases (list of strings). "
            f"\n\nText to analyse:\n{text[:3000]}"
        )

        if db:
            orchestrator = AIOrchestrator(db)
            await orchestrator.load_providers()
            result = await orchestrator.route_query(
                query=prompt,
                context={"task": "risk_analysis", **context},
                response_mode="text",
            )

            ai_message = result.get("message", "")
            parsed = _parse_json_response(ai_message)
            if parsed:
                return {
                    "risk_score": float(parsed.get("risk_score", 0.0)),
                    "categories": parsed.get("categories", []),
                    "explanation": parsed.get("explanation", ""),
                    "flagged_phrases": parsed.get("flagged_phrases", []),
                    "provider_used": result.get("provider_used", ""),
                }

        # Fallback: basic keyword-based risk scoring
        return _keyword_risk_analysis(text)

    except Exception as e:
        logger.error(f"Error in risk analysis: {e}")
        return _keyword_risk_analysis(text)


async def predict_student_performance(
    db: AsyncSession,
    student_id: str,
) -> Dict[str, Any]:
    """
    AI-powered student performance prediction.

    Aggregates the student's journey data, enrollment history, and AI tutor
    interactions, then asks the AI to predict performance trends and
    recommend interventions.
    """
    try:
        # Gather student data
        journey_q = select(StudentJourney).where(
            StudentJourney.student_id == student_id
        )
        journey_result = await db.execute(journey_q)
        journey = journey_result.scalar_one_or_none()

        enrollments_q = select(func.count(Enrollment.id)).where(
            and_(
                Enrollment.student_id == student_id,
                Enrollment.is_deleted == False,  # noqa: E712
            )
        )
        enrollment_result = await db.execute(enrollments_q)
        enrollment_count: int = enrollment_result.scalar() or 0

        # Build context for AI
        context_parts = [
            f"Student ID: {student_id}",
            f"Enrollments: {enrollment_count}",
        ]
        if journey:
            context_parts.extend([
                f"Risk level: {journey.risk_level}",
                f"Risk factors: {json.dumps(journey.risk_factors or [])}",
                f"Learning style: {journey.learning_style or 'unknown'}",
                f"Strengths: {json.dumps(journey.strengths or [])}",
                f"Areas for improvement: {json.dumps(journey.areas_for_improvement or [])}",
            ])

        context_text = ". ".join(context_parts)

        prompt = (
            "Based on this student's profile, predict their academic performance "
            "for the next term. Include: predicted_performance (improving/stable/declining), "
            "confidence (0-1), risk_factors (list), recommendations (list of "
            "specific interventions), key_strengths (list). Return as JSON. "
            f"\n\nStudent data: {context_text}"
        )

        orchestrator = AIOrchestrator(db)
        await orchestrator.load_providers()
        result = await orchestrator.route_query(
            query=prompt,
            context={"task": "performance_prediction", "student_id": student_id},
            response_mode="text",
        )

        ai_message = result.get("message", "")
        parsed = _parse_json_response(ai_message)

        if parsed:
            return {
                "student_id": student_id,
                "predicted_performance": parsed.get("predicted_performance", "stable"),
                "confidence": float(parsed.get("confidence", 0.5)),
                "risk_factors": parsed.get("risk_factors", []),
                "recommendations": parsed.get("recommendations", []),
                "key_strengths": parsed.get("key_strengths", []),
                "raw_analysis": ai_message,
            }

        return {
            "student_id": student_id,
            "predicted_performance": "stable",
            "confidence": 0.3,
            "risk_factors": journey.risk_factors if journey else [],
            "recommendations": ["Insufficient data for AI prediction. Continue monitoring."],
            "key_strengths": journey.strengths if journey else [],
            "raw_analysis": ai_message,
        }

    except Exception as e:
        logger.error(f"Error predicting student performance for {student_id}: {e}")
        return {
            "student_id": student_id,
            "predicted_performance": "unknown",
            "confidence": 0.0,
            "risk_factors": [],
            "recommendations": ["Performance prediction unavailable."],
            "key_strengths": [],
            "raw_analysis": "",
        }


async def analyze_content_quality(
    content_text: str,
    cbc_tags: Optional[List[str]] = None,
    db: Optional[AsyncSession] = None,
) -> Dict[str, Any]:
    """
    AI content quality analysis.

    Evaluates educational content for clarity, accuracy, engagement,
    CBC alignment, and grade-level appropriateness.
    """
    try:
        cbc_tags = cbc_tags or []
        cbc_context = f"Expected CBC competencies: {', '.join(cbc_tags)}" if cbc_tags else ""

        prompt = (
            "Evaluate this educational content for quality. Score each dimension "
            "from 0.0 to 1.0: clarity, accuracy, engagement, cbc_alignment, "
            "grade_appropriateness. Also provide: overall_score (0-1), "
            "strengths (list), improvements (list), suggested_edits (list). "
            f"Return as JSON. {cbc_context}"
            f"\n\nContent:\n{content_text[:4000]}"
        )

        if db:
            orchestrator = AIOrchestrator(db)
            await orchestrator.load_providers()
            result = await orchestrator.route_query(
                query=prompt,
                context={"task": "content_quality"},
                response_mode="text",
            )

            ai_message = result.get("message", "")
            parsed = _parse_json_response(ai_message)

            if parsed:
                return {
                    "overall_score": float(parsed.get("overall_score", 0.5)),
                    "dimensions": {
                        "clarity": float(parsed.get("clarity", 0.5)),
                        "accuracy": float(parsed.get("accuracy", 0.5)),
                        "engagement": float(parsed.get("engagement", 0.5)),
                        "cbc_alignment": float(parsed.get("cbc_alignment", 0.5)),
                        "grade_appropriateness": float(parsed.get("grade_appropriateness", 0.5)),
                    },
                    "strengths": parsed.get("strengths", []),
                    "improvements": parsed.get("improvements", []),
                    "suggested_edits": parsed.get("suggested_edits", []),
                }

        # Fallback
        return {
            "overall_score": 0.5,
            "dimensions": {
                "clarity": 0.5,
                "accuracy": 0.5,
                "engagement": 0.5,
                "cbc_alignment": 0.5,
                "grade_appropriateness": 0.5,
            },
            "strengths": [],
            "improvements": ["AI quality analysis unavailable."],
            "suggested_edits": [],
        }

    except Exception as e:
        logger.error(f"Error analysing content quality: {e}")
        return {
            "overall_score": 0.0,
            "dimensions": {},
            "strengths": [],
            "improvements": ["Analysis failed."],
            "suggested_edits": [],
        }


async def suggest_workload_balance(
    db: AsyncSession,
    department: str,
) -> Dict[str, Any]:
    """
    AI-powered workload balancing suggestions for a department.

    Delegates to the team_service for data aggregation, then enhances
    with AI recommendations.
    """
    try:
        from app.services.staff.team_service import get_workload_suggestions

        return await get_workload_suggestions(db, department)

    except Exception as e:
        logger.error(f"Error suggesting workload balance: {e}")
        return {"suggestions": [], "current_imbalance": 0.0, "projected_imbalance": 0.0, "affected_staff_count": 0}


async def draft_feedback(
    submission_text: str,
    rubric: Optional[Dict[str, Any]] = None,
    db: Optional[AsyncSession] = None,
) -> Dict[str, Any]:
    """
    AI-drafted feedback for a student submission.

    Uses the provided rubric (if any) to generate structured,
    constructive feedback suitable for the student's level.
    """
    try:
        rubric_context = ""
        if rubric:
            rubric_context = f"Rubric: {json.dumps(rubric)}"

        prompt = (
            "Draft constructive feedback for this student submission. "
            "The student is a child in Kenya's CBC education system. "
            "Be encouraging, specific, and age-appropriate. "
            "Include: overall_feedback (string), strengths (list), "
            "areas_for_improvement (list), action_items (list), "
            "encouragement_note (string). Return as JSON. "
            f"{rubric_context}"
            f"\n\nSubmission:\n{submission_text[:3000]}"
        )

        if db:
            orchestrator = AIOrchestrator(db)
            await orchestrator.load_providers()
            result = await orchestrator.route_query(
                query=prompt,
                context={"task": "feedback_drafting"},
                response_mode="text",
            )

            ai_message = result.get("message", "")
            parsed = _parse_json_response(ai_message)

            if parsed:
                return {
                    "overall_feedback": parsed.get("overall_feedback", ""),
                    "strengths": parsed.get("strengths", []),
                    "areas_for_improvement": parsed.get("areas_for_improvement", []),
                    "action_items": parsed.get("action_items", []),
                    "encouragement_note": parsed.get("encouragement_note", ""),
                    "raw_feedback": ai_message,
                }

        return {
            "overall_feedback": "Feedback generation unavailable at this time.",
            "strengths": [],
            "areas_for_improvement": [],
            "action_items": [],
            "encouragement_note": "Keep up the good work!",
            "raw_feedback": "",
        }

    except Exception as e:
        logger.error(f"Error drafting feedback: {e}")
        return {
            "overall_feedback": "Feedback generation failed.",
            "strengths": [],
            "areas_for_improvement": [],
            "action_items": [],
            "encouragement_note": "",
            "raw_feedback": "",
        }


async def suggest_faq_updates(
    db: AsyncSession,
    recent_tickets: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    """
    Analyse recent support tickets and suggest FAQ/KB updates.

    If recent_tickets is not provided, fetches the latest 20 resolved
    tickets from the database.
    """
    try:
        if not recent_tickets:
            tickets_q = (
                select(StaffTicket)
                .where(StaffTicket.status.in_(["resolved", "closed"]))
                .order_by(StaffTicket.resolved_at.desc())
                .limit(20)
            )
            result = await db.execute(tickets_q)
            tickets = result.scalars().all()
            recent_tickets = [
                {
                    "subject": t.subject,
                    "description": t.description[:200],
                    "category": t.category,
                    "resolution": t.resolution or "",
                }
                for t in tickets
            ]

        if not recent_tickets:
            return {"suggestions": [], "common_topics": []}

        # Build ticket summary for AI
        ticket_summary = "; ".join(
            f"[{t.get('category', 'general')}] {t.get('subject', '')}: {t.get('resolution', '')[:100]}"
            for t in recent_tickets[:15]
        )

        prompt = (
            "Analyse these recent support tickets and suggest FAQ/knowledge base updates. "
            "Identify common themes and suggest: new_articles (list of title+description), "
            "update_existing (list of article titles needing updates), "
            "common_topics (list of frequently asked topics). Return as JSON. "
            f"\n\nRecent tickets:\n{ticket_summary}"
        )

        orchestrator = AIOrchestrator(db)
        await orchestrator.load_providers()
        result = await orchestrator.route_query(
            query=prompt,
            context={"task": "faq_suggestions"},
            response_mode="text",
        )

        ai_message = result.get("message", "")
        parsed = _parse_json_response(ai_message)

        if parsed:
            return {
                "suggestions": {
                    "new_articles": parsed.get("new_articles", []),
                    "update_existing": parsed.get("update_existing", []),
                },
                "common_topics": parsed.get("common_topics", []),
                "raw_analysis": ai_message,
            }

        return {
            "suggestions": {"new_articles": [], "update_existing": []},
            "common_topics": [],
            "raw_analysis": ai_message,
        }

    except Exception as e:
        logger.error(f"Error suggesting FAQ updates: {e}")
        return {
            "suggestions": {"new_articles": [], "update_existing": []},
            "common_topics": [],
            "raw_analysis": "",
        }


def _parse_json_response(ai_message: str) -> Optional[Dict[str, Any]]:
    """
    Attempt to extract and parse a JSON object from an AI response string.

    Handles cases where JSON is embedded in markdown code blocks or
    surrounded by additional text.
    """
    if not ai_message:
        return None

    try:
        # Try direct parse first
        return json.loads(ai_message)
    except (json.JSONDecodeError, ValueError):
        pass

    # Try to extract JSON object
    try:
        start_idx = ai_message.find("{")
        end_idx = ai_message.rfind("}") + 1
        if start_idx != -1 and end_idx > start_idx:
            return json.loads(ai_message[start_idx:end_idx])
    except (json.JSONDecodeError, ValueError):
        pass

    # Try to extract JSON array
    try:
        start_idx = ai_message.find("[")
        end_idx = ai_message.rfind("]") + 1
        if start_idx != -1 and end_idx > start_idx:
            parsed_list = json.loads(ai_message[start_idx:end_idx])
            return {"items": parsed_list}
    except (json.JSONDecodeError, ValueError):
        pass

    return None


def _keyword_risk_analysis(text: str) -> Dict[str, Any]:
    """Fallback keyword-based risk analysis when AI is unavailable."""
    text_lower = text.lower()

    risk_keywords = {
        "violence": ["kill", "fight", "weapon", "attack", "hurt", "blood"],
        "inappropriate": ["inappropriate", "explicit", "adult", "nsfw"],
        "harassment": ["bully", "harass", "threaten", "abuse", "insult"],
        "hate_speech": ["hate", "racist", "sexist", "discriminat"],
        "misinformation": ["fake", "hoax", "conspiracy"],
    }

    detected_categories = []
    flagged = []
    total_matches = 0

    for category, keywords in risk_keywords.items():
        for keyword in keywords:
            if keyword in text_lower:
                if category not in detected_categories:
                    detected_categories.append(category)
                flagged.append(keyword)
                total_matches += 1

    risk_score = min(total_matches * 0.15, 1.0)

    return {
        "risk_score": round(risk_score, 2),
        "categories": detected_categories,
        "explanation": (
            f"Keyword analysis found {total_matches} potential risk indicator(s)."
            if total_matches > 0
            else "No significant risks detected via keyword analysis."
        ),
        "flagged_phrases": flagged,
        "provider_used": "keyword_fallback",
    }
