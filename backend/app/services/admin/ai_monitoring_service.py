"""
AI Monitoring Service - Phase 5 (AI Systems)

Provides mock data for AI monitoring dashboards until dedicated
monitoring tables are created in the database.

Methods cover:
- Flagged AI conversations (safety, bias, quality, hallucination)
- AI-generated content review queue
- Personalization & adaptation audit data
- AI provider performance metrics
- Prompt drift analysis
- Safety incident dashboard
"""

import logging
import uuid
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from sqlalchemy.ext.asyncio import AsyncSession

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
        """
        Return flagged AI conversations with safety/bias/quality issues.

        Uses mock data until the ai_conversation_flags table is created.
        """
        now = datetime.utcnow()

        all_flags: List[Dict[str, Any]] = [
            {
                "id": str(uuid.uuid4()),
                "student_name": "Wanjiku Kamau",
                "student_grade": "Grade 5",
                "subject": "Science",
                "flag_type": "safety",
                "severity": "critical",
                "snippet": "The AI response included information about chemical reactions that could be dangerous for young learners without proper safety context.",
                "model_used": "gemini-pro",
                "status": "pending_review",
                "flagged_at": (now - timedelta(minutes=12)).isoformat(),
                "conversation_id": str(uuid.uuid4()),
            },
            {
                "id": str(uuid.uuid4()),
                "student_name": "Otieno Odhiambo",
                "student_grade": "Grade 7",
                "subject": "Social Studies",
                "flag_type": "bias",
                "severity": "high",
                "snippet": "Response showed potential regional bias when discussing Kenyan community governance structures, favouring urban perspectives.",
                "model_used": "claude-3.5-sonnet",
                "status": "pending_review",
                "flagged_at": (now - timedelta(minutes=34)).isoformat(),
                "conversation_id": str(uuid.uuid4()),
            },
            {
                "id": str(uuid.uuid4()),
                "student_name": "Amina Hassan",
                "student_grade": "Grade 4",
                "subject": "Mathematics",
                "flag_type": "hallucination",
                "severity": "high",
                "snippet": "AI tutor provided an incorrect multiplication table for 7x8, stating it equals 54 instead of 56.",
                "model_used": "gpt-4",
                "status": "under_review",
                "flagged_at": (now - timedelta(hours=1, minutes=15)).isoformat(),
                "conversation_id": str(uuid.uuid4()),
            },
            {
                "id": str(uuid.uuid4()),
                "student_name": "Brian Kipkoech",
                "student_grade": "Grade 8",
                "subject": "English",
                "flag_type": "quality",
                "severity": "medium",
                "snippet": "Response to creative writing prompt was generic and did not align with CBC competency-based assessment criteria for Grade 8.",
                "model_used": "gemini-pro",
                "status": "pending_review",
                "flagged_at": (now - timedelta(hours=2)).isoformat(),
                "conversation_id": str(uuid.uuid4()),
            },
            {
                "id": str(uuid.uuid4()),
                "student_name": "Fatma Ali",
                "student_grade": "Grade 3",
                "subject": "Kiswahili",
                "flag_type": "safety",
                "severity": "medium",
                "snippet": "AI tutor used vocabulary that may be too advanced for Grade 3 learners in the Kiswahili conversation exercise.",
                "model_used": "claude-3.5-sonnet",
                "status": "dismissed",
                "flagged_at": (now - timedelta(hours=3, minutes=20)).isoformat(),
                "conversation_id": str(uuid.uuid4()),
            },
            {
                "id": str(uuid.uuid4()),
                "student_name": "Dennis Mwangi",
                "student_grade": "Grade 6",
                "subject": "Science",
                "flag_type": "hallucination",
                "severity": "critical",
                "snippet": "AI stated that the Tana River is the shortest river in Kenya. Tana River is actually the longest river in Kenya at 1,014 km.",
                "model_used": "grok",
                "status": "pending_review",
                "flagged_at": (now - timedelta(minutes=45)).isoformat(),
                "conversation_id": str(uuid.uuid4()),
            },
            {
                "id": str(uuid.uuid4()),
                "student_name": "Grace Wambui",
                "student_grade": "Grade 5",
                "subject": "CRE",
                "flag_type": "bias",
                "severity": "low",
                "snippet": "Response on moral values lesson slightly favoured one religious perspective over others in a multi-faith context.",
                "model_used": "gemini-pro",
                "status": "reviewed",
                "flagged_at": (now - timedelta(hours=5)).isoformat(),
                "conversation_id": str(uuid.uuid4()),
            },
            {
                "id": str(uuid.uuid4()),
                "student_name": "Hassan Abdi",
                "student_grade": "Grade 7",
                "subject": "Mathematics",
                "flag_type": "quality",
                "severity": "low",
                "snippet": "Explanation of algebraic expressions was technically correct but used non-CBC terminology that may confuse the student.",
                "model_used": "gpt-4",
                "status": "dismissed",
                "flagged_at": (now - timedelta(hours=6)).isoformat(),
                "conversation_id": str(uuid.uuid4()),
            },
            {
                "id": str(uuid.uuid4()),
                "student_name": "Joy Akinyi",
                "student_grade": "Grade 4",
                "subject": "Environmental Activities",
                "flag_type": "safety",
                "severity": "high",
                "snippet": "AI recommended a field activity near water bodies without including safety warnings appropriate for Grade 4 learners.",
                "model_used": "claude-3.5-sonnet",
                "status": "pending_review",
                "flagged_at": (now - timedelta(hours=1, minutes=50)).isoformat(),
                "conversation_id": str(uuid.uuid4()),
            },
            {
                "id": str(uuid.uuid4()),
                "student_name": "Kevin Njoroge",
                "student_grade": "Grade 8",
                "subject": "History",
                "flag_type": "bias",
                "severity": "medium",
                "snippet": "Discussion of pre-colonial Kenya lacked balanced representation of multiple ethnic communities' contributions.",
                "model_used": "gemini-pro",
                "status": "under_review",
                "flagged_at": (now - timedelta(hours=4, minutes=10)).isoformat(),
                "conversation_id": str(uuid.uuid4()),
            },
            {
                "id": str(uuid.uuid4()),
                "student_name": "Linda Chebet",
                "student_grade": "Grade 6",
                "subject": "Agriculture",
                "flag_type": "quality",
                "severity": "medium",
                "snippet": "AI tutor's response about crop rotation did not reference Kenyan agricultural practices as required by CBC learning outcomes.",
                "model_used": "gpt-4",
                "status": "pending_review",
                "flagged_at": (now - timedelta(hours=2, minutes=30)).isoformat(),
                "conversation_id": str(uuid.uuid4()),
            },
            {
                "id": str(uuid.uuid4()),
                "student_name": "Moses Ouma",
                "student_grade": "Grade 3",
                "subject": "Mathematics",
                "flag_type": "hallucination",
                "severity": "medium",
                "snippet": "AI confused the concept of 'place value' with 'face value' when teaching number systems to a Grade 3 learner.",
                "model_used": "grok",
                "status": "reviewed",
                "flagged_at": (now - timedelta(hours=7)).isoformat(),
                "conversation_id": str(uuid.uuid4()),
            },
        ]

        # Apply severity filter
        if severity_filter:
            all_flags = [f for f in all_flags if f["severity"] == severity_filter]

        total = len(all_flags)
        start = (page - 1) * page_size
        end = start + page_size
        items = all_flags[start:end]

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": max(1, (total + page_size - 1) // page_size),
            "summary": {
                "total_flags_today": 12,
                "critical": 2,
                "high": 3,
                "medium": 4,
                "low": 3,
                "pending_review": 6,
                "safety_incidents": 3,
                "avg_quality_score": 8.2,
                "total_conversations_today": 1847,
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
        """
        Return AI-generated content awaiting human review.

        Uses mock data until the content_review table is created.
        """
        now = datetime.utcnow()

        all_items: List[Dict[str, Any]] = [
            {
                "id": str(uuid.uuid4()),
                "content_type": "lesson_summary",
                "subject": "Science - Grade 5",
                "title": "Properties of Matter: Solids, Liquids and Gases",
                "generated_text": "Matter exists in three main states: solid, liquid and gas. In Kenya, we can observe all three states in our daily lives. Ice on Mount Kenya (solid), water in Lake Victoria (liquid), and steam from a jiko (gas). Each state has unique properties...",
                "model_used": "gemini-pro",
                "accuracy_score": 0.94,
                "status": "pending",
                "generated_at": (now - timedelta(minutes=20)).isoformat(),
                "reviewed_by": None,
            },
            {
                "id": str(uuid.uuid4()),
                "content_type": "quiz_question",
                "subject": "Mathematics - Grade 7",
                "title": "Algebraic Expressions Quiz Bank",
                "generated_text": "Simplify the expression: 3x + 5y - 2x + 7y. Options: A) x + 12y  B) 5x + 12y  C) x + 2y  D) 5x + 2y. Correct answer: A) x + 12y",
                "model_used": "claude-3.5-sonnet",
                "accuracy_score": 1.0,
                "status": "pending",
                "generated_at": (now - timedelta(minutes=35)).isoformat(),
                "reviewed_by": None,
            },
            {
                "id": str(uuid.uuid4()),
                "content_type": "learning_activity",
                "subject": "Kiswahili - Grade 4",
                "title": "Vitendawili (Riddles) Interactive Exercise",
                "generated_text": "Kitendawili: Kitu kimoja kinachoweza kuzunguka dunia bila kutoka nyumbani ni nini? Jibu: Stempu (Stamp). This activity helps learners develop critical thinking through traditional Swahili riddles...",
                "model_used": "gemini-pro",
                "accuracy_score": 0.88,
                "status": "pending",
                "generated_at": (now - timedelta(hours=1)).isoformat(),
                "reviewed_by": None,
            },
            {
                "id": str(uuid.uuid4()),
                "content_type": "assessment_rubric",
                "subject": "English - Grade 6",
                "title": "Creative Writing Assessment Criteria",
                "generated_text": "CBC-Aligned Rubric: Exceeding Expectation (4) - Student demonstrates original ideas with rich vocabulary, proper grammar, and clear paragraph structure. Meets Expectation (3) - Student shows adequate creativity...",
                "model_used": "claude-3.5-sonnet",
                "accuracy_score": 0.91,
                "status": "approved",
                "generated_at": (now - timedelta(hours=2)).isoformat(),
                "reviewed_by": "Admin Njeri",
            },
            {
                "id": str(uuid.uuid4()),
                "content_type": "lesson_summary",
                "subject": "Social Studies - Grade 8",
                "title": "The Constitution of Kenya 2010",
                "generated_text": "The Constitution of Kenya was promulgated on 27th August 2010. It established a devolved system of government with 47 counties. Key features include the Bill of Rights, separation of powers, and provisions for public participation...",
                "model_used": "gpt-4",
                "accuracy_score": 0.96,
                "status": "approved",
                "generated_at": (now - timedelta(hours=3)).isoformat(),
                "reviewed_by": "Admin Ochieng",
            },
            {
                "id": str(uuid.uuid4()),
                "content_type": "quiz_question",
                "subject": "Science - Grade 3",
                "title": "Living and Non-Living Things",
                "generated_text": "Which of these is a living thing? A) A stone  B) A maize plant  C) A pencil  D) Water. Correct: B. Explanation: A maize plant grows, breathes, and reproduces, making it a living thing.",
                "model_used": "gemini-pro",
                "accuracy_score": 1.0,
                "status": "pending",
                "generated_at": (now - timedelta(minutes=50)).isoformat(),
                "reviewed_by": None,
            },
            {
                "id": str(uuid.uuid4()),
                "content_type": "learning_activity",
                "subject": "Art & Craft - Grade 4",
                "title": "Traditional Kenyan Beadwork Patterns",
                "generated_text": "Activity: Create a beadwork pattern inspired by Maasai cultural designs. Materials needed: coloured beads, string, pattern template. Step 1: Choose your colour combination...",
                "model_used": "claude-3.5-sonnet",
                "accuracy_score": 0.85,
                "status": "override",
                "generated_at": (now - timedelta(hours=4)).isoformat(),
                "reviewed_by": "Admin Wanjiru",
            },
            {
                "id": str(uuid.uuid4()),
                "content_type": "lesson_summary",
                "subject": "Agriculture - Grade 6",
                "title": "Soil Conservation Methods in Kenya",
                "generated_text": "Kenya faces significant soil erosion challenges. Methods of soil conservation include terracing (common in Murang'a and Meru), contour ploughing, mulching, and planting cover crops...",
                "model_used": "gpt-4",
                "accuracy_score": 0.72,
                "status": "rejected",
                "generated_at": (now - timedelta(hours=5)).isoformat(),
                "reviewed_by": "Admin Kipchoge",
            },
        ]

        total = len(all_items)
        start = (page - 1) * page_size
        end = start + page_size
        items = all_items[start:end]

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": max(1, (total + page_size - 1) // page_size),
            "summary": {
                "pending_review": 4,
                "approved_today": 12,
                "rejected_today": 2,
                "overridden_today": 1,
                "approval_rate": 0.80,
                "override_rate": 0.07,
                "avg_accuracy_score": 0.91,
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
        Return learning path audit data and bias metrics.

        Uses mock data until the personalization tracking tables exist.
        """
        return {
            "learning_path_diversity": [
                {"subject": "Mathematics", "unique_paths": 42, "students": 156, "avg_adaptation": 0.82},
                {"subject": "English", "unique_paths": 38, "students": 148, "avg_adaptation": 0.78},
                {"subject": "Kiswahili", "unique_paths": 31, "students": 134, "avg_adaptation": 0.75},
                {"subject": "Science", "unique_paths": 45, "students": 162, "avg_adaptation": 0.85},
                {"subject": "Social Studies", "unique_paths": 28, "students": 127, "avg_adaptation": 0.71},
                {"subject": "CRE/IRE", "unique_paths": 22, "students": 98, "avg_adaptation": 0.68},
                {"subject": "Agriculture", "unique_paths": 19, "students": 87, "avg_adaptation": 0.73},
                {"subject": "Art & Craft", "unique_paths": 15, "students": 76, "avg_adaptation": 0.65},
            ],
            "bias_metrics": {
                "gender": {
                    "male_avg_score": 72.4,
                    "female_avg_score": 74.1,
                    "male_engagement": 0.78,
                    "female_engagement": 0.81,
                    "male_path_variety": 3.2,
                    "female_path_variety": 3.4,
                },
                "grade_level": {
                    "lower_primary": {"avg_score": 78.2, "engagement": 0.85, "path_variety": 2.8},
                    "upper_primary": {"avg_score": 71.5, "engagement": 0.76, "path_variety": 3.5},
                    "junior_secondary": {"avg_score": 68.3, "engagement": 0.72, "path_variety": 4.1},
                },
                "location": {
                    "urban": {"avg_score": 75.1, "engagement": 0.82, "students": 423},
                    "peri_urban": {"avg_score": 72.8, "engagement": 0.77, "students": 287},
                    "rural": {"avg_score": 69.4, "engagement": 0.71, "students": 156},
                },
            },
            "adaptation_timeline": [
                {"week": "Week 1", "effectiveness": 0.62, "students_adapted": 120},
                {"week": "Week 2", "effectiveness": 0.68, "students_adapted": 245},
                {"week": "Week 3", "effectiveness": 0.74, "students_adapted": 389},
                {"week": "Week 4", "effectiveness": 0.79, "students_adapted": 512},
                {"week": "Week 5", "effectiveness": 0.82, "students_adapted": 598},
                {"week": "Week 6", "effectiveness": 0.84, "students_adapted": 654},
                {"week": "Week 7", "effectiveness": 0.85, "students_adapted": 701},
                {"week": "Week 8", "effectiveness": 0.87, "students_adapted": 738},
            ],
            "over_customization_flags": [
                {
                    "id": str(uuid.uuid4()),
                    "student_name": "Peter Mwangi",
                    "grade": "Grade 6",
                    "issue": "Learning path for Mathematics is overly narrowed. Student only receives addition and subtraction problems despite being ready for multiplication.",
                    "severity": "medium",
                    "detected_at": (datetime.utcnow() - timedelta(hours=2)).isoformat(),
                },
                {
                    "id": str(uuid.uuid4()),
                    "student_name": "Sarah Nyambura",
                    "grade": "Grade 5",
                    "issue": "AI tutor has been repeating the same English vocabulary set for 3 weeks. No progression to new competency levels detected.",
                    "severity": "high",
                    "detected_at": (datetime.utcnow() - timedelta(hours=5)).isoformat(),
                },
                {
                    "id": str(uuid.uuid4()),
                    "student_name": "Ali Mohamed",
                    "grade": "Grade 7",
                    "issue": "Science learning path completely avoids practical experiment suggestions. May be due to incorrect learner profile classification.",
                    "severity": "low",
                    "detected_at": (datetime.utcnow() - timedelta(hours=8)).isoformat(),
                },
            ],
            "summary": {
                "students_with_personalized_paths": 738,
                "avg_adaptation_score": 0.79,
                "over_customization_count": 3,
                "total_unique_paths": 240,
                "paths_updated_today": 47,
            },
        }

    # ------------------------------------------------------------------
    # Performance Overview
    # ------------------------------------------------------------------
    @staticmethod
    async def get_performance_overview(
        db: AsyncSession,
    ) -> Dict[str, Any]:
        """
        Return AI provider performance metrics.

        Uses mock data until the ai_performance_logs table exists.
        """
        now = datetime.utcnow()

        providers = [
            {
                "id": str(uuid.uuid4()),
                "name": "Gemini Pro",
                "provider": "google",
                "avg_response_time_ms": 320,
                "p50_latency_ms": 280,
                "p95_latency_ms": 520,
                "p99_latency_ms": 890,
                "error_rate": 0.012,
                "satisfaction_score": 4.3,
                "total_requests_today": 4521,
                "successful_requests": 4467,
                "failed_requests": 54,
                "status": "healthy",
                "last_error": None,
                "cost_today_kes": 12450,
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Claude 3.5 Sonnet",
                "provider": "anthropic",
                "avg_response_time_ms": 450,
                "p50_latency_ms": 390,
                "p95_latency_ms": 720,
                "p99_latency_ms": 1100,
                "error_rate": 0.008,
                "satisfaction_score": 4.6,
                "total_requests_today": 2870,
                "successful_requests": 2847,
                "failed_requests": 23,
                "status": "healthy",
                "last_error": None,
                "cost_today_kes": 18200,
            },
            {
                "id": str(uuid.uuid4()),
                "name": "GPT-4",
                "provider": "openai",
                "avg_response_time_ms": 580,
                "p50_latency_ms": 510,
                "p95_latency_ms": 950,
                "p99_latency_ms": 1450,
                "error_rate": 0.023,
                "satisfaction_score": 4.1,
                "total_requests_today": 1245,
                "successful_requests": 1216,
                "failed_requests": 29,
                "status": "degraded",
                "last_error": "Rate limit exceeded at 14:23 EAT",
                "cost_today_kes": 22800,
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Grok",
                "provider": "xai",
                "avg_response_time_ms": 410,
                "p50_latency_ms": 350,
                "p95_latency_ms": 680,
                "p99_latency_ms": 1020,
                "error_rate": 0.035,
                "satisfaction_score": 3.9,
                "total_requests_today": 834,
                "successful_requests": 805,
                "failed_requests": 29,
                "status": "healthy",
                "last_error": "Timeout on research query at 11:05 EAT",
                "cost_today_kes": 8900,
            },
        ]

        # Response time trends (hourly for today)
        response_time_trends = []
        for hour_offset in range(12):
            hour = now - timedelta(hours=11 - hour_offset)
            response_time_trends.append({
                "time": hour.strftime("%H:00"),
                "gemini_pro": 280 + (hour_offset * 5) + (15 if hour_offset > 8 else 0),
                "claude_35": 400 + (hour_offset * 7) + (30 if hour_offset > 9 else 0),
                "gpt_4": 500 + (hour_offset * 10) + (80 if hour_offset > 7 else 0),
                "grok": 370 + (hour_offset * 4) + (20 if hour_offset > 10 else 0),
            })

        # Error patterns
        error_patterns = [
            {
                "type": "rate_limit",
                "count": 18,
                "affected_provider": "GPT-4",
                "trend": "increasing",
                "first_seen": (now - timedelta(hours=4)).isoformat(),
                "last_seen": (now - timedelta(minutes=15)).isoformat(),
            },
            {
                "type": "timeout",
                "count": 7,
                "affected_provider": "Grok",
                "trend": "stable",
                "first_seen": (now - timedelta(hours=8)).isoformat(),
                "last_seen": (now - timedelta(hours=1)).isoformat(),
            },
            {
                "type": "malformed_response",
                "count": 3,
                "affected_provider": "Gemini Pro",
                "trend": "decreasing",
                "first_seen": (now - timedelta(hours=6)).isoformat(),
                "last_seen": (now - timedelta(hours=3)).isoformat(),
            },
            {
                "type": "authentication_failure",
                "count": 1,
                "affected_provider": "Claude 3.5 Sonnet",
                "trend": "stable",
                "first_seen": (now - timedelta(hours=2)).isoformat(),
                "last_seen": (now - timedelta(hours=2)).isoformat(),
            },
        ]

        return {
            "providers": providers,
            "response_time_trends": response_time_trends,
            "error_patterns": error_patterns,
            "summary": {
                "total_requests_today": 9470,
                "avg_response_time_ms": 415,
                "overall_error_rate": 0.014,
                "avg_satisfaction": 4.23,
                "total_cost_today_kes": 62350,
                "active_providers": 4,
                "degraded_providers": 1,
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
        Return prompt drift analysis data.

        Tracks how AI responses change over time for the same types
        of educational queries.
        """
        now = datetime.utcnow()

        return {
            "drift_scores": [
                {"week": "Week 1", "gemini": 0.02, "claude": 0.01, "gpt4": 0.03, "grok": 0.02},
                {"week": "Week 2", "gemini": 0.03, "claude": 0.02, "gpt4": 0.04, "grok": 0.03},
                {"week": "Week 3", "gemini": 0.04, "claude": 0.02, "gpt4": 0.06, "grok": 0.05},
                {"week": "Week 4", "gemini": 0.05, "claude": 0.03, "gpt4": 0.08, "grok": 0.06},
                {"week": "Week 5", "gemini": 0.04, "claude": 0.03, "gpt4": 0.11, "grok": 0.07},
                {"week": "Week 6", "gemini": 0.06, "claude": 0.04, "gpt4": 0.13, "grok": 0.08},
            ],
            "alerts": [
                {
                    "id": str(uuid.uuid4()),
                    "provider": "GPT-4",
                    "drift_score": 0.13,
                    "threshold": 0.10,
                    "subject_area": "Mathematics",
                    "detected_at": (now - timedelta(hours=3)).isoformat(),
                    "description": "GPT-4 responses to Grade 6 maths problems show significant drift from baseline. Response style and explanation depth have changed.",
                },
                {
                    "id": str(uuid.uuid4()),
                    "provider": "Grok",
                    "drift_score": 0.08,
                    "threshold": 0.10,
                    "subject_area": "Science",
                    "detected_at": (now - timedelta(hours=12)).isoformat(),
                    "description": "Grok responses approaching drift threshold for Science topics. Monitoring closely.",
                },
            ],
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
        Return safety incident summary and trends.

        Covers content safety, data privacy, and harmful content detection.
        """
        now = datetime.utcnow()

        return {
            "incidents_today": [
                {
                    "id": str(uuid.uuid4()),
                    "type": "content_safety",
                    "severity": "critical",
                    "title": "Age-inappropriate content detected",
                    "description": "AI generated content with themes not suitable for Grade 3 learners in an English lesson about community helpers.",
                    "model": "gpt-4",
                    "action_taken": "Response blocked, prompt quarantined",
                    "reported_at": (now - timedelta(minutes=18)).isoformat(),
                    "resolved": False,
                },
                {
                    "id": str(uuid.uuid4()),
                    "type": "data_privacy",
                    "severity": "high",
                    "title": "PII leakage attempt detected",
                    "description": "Student tried to share personal address through AI chat. System correctly blocked the message.",
                    "model": "gemini-pro",
                    "action_taken": "Message blocked, parent notified",
                    "reported_at": (now - timedelta(hours=1, minutes=30)).isoformat(),
                    "resolved": True,
                },
                {
                    "id": str(uuid.uuid4()),
                    "type": "harmful_content",
                    "severity": "medium",
                    "title": "Mildly inappropriate language in response",
                    "description": "AI tutor used colloquial language that could be misinterpreted in a Kiswahili lesson context.",
                    "model": "claude-3.5-sonnet",
                    "action_taken": "Response flagged for review",
                    "reported_at": (now - timedelta(hours=3)).isoformat(),
                    "resolved": True,
                },
            ],
            "safety_trends": [
                {"date": (now - timedelta(days=6)).strftime("%b %d"), "incidents": 2, "blocked": 5, "reviewed": 8},
                {"date": (now - timedelta(days=5)).strftime("%b %d"), "incidents": 1, "blocked": 3, "reviewed": 6},
                {"date": (now - timedelta(days=4)).strftime("%b %d"), "incidents": 3, "blocked": 7, "reviewed": 12},
                {"date": (now - timedelta(days=3)).strftime("%b %d"), "incidents": 0, "blocked": 2, "reviewed": 5},
                {"date": (now - timedelta(days=2)).strftime("%b %d"), "incidents": 2, "blocked": 4, "reviewed": 9},
                {"date": (now - timedelta(days=1)).strftime("%b %d"), "incidents": 1, "blocked": 6, "reviewed": 7},
                {"date": now.strftime("%b %d"), "incidents": 3, "blocked": 8, "reviewed": 11},
            ],
            "summary": {
                "total_incidents_today": 3,
                "total_blocked_today": 8,
                "total_reviewed_today": 11,
                "resolution_rate": 0.67,
                "avg_resolution_time_minutes": 42,
                "safety_score": 96.2,
            },
            "generated_at": now.isoformat(),
        }
