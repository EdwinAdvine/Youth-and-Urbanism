"""
Instructor AI Insight Service

AI daily insights generation (batch job), CBC alignment analysis.
"""

import json
import logging
from typing import Dict, Any, List
from datetime import datetime, date, timedelta
from decimal import Decimal

from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.instructor.instructor_ai_insight import InstructorDailyInsight, InstructorCBCAnalysis
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.staff.live_session import LiveSession
from app.models.assessment import Assessment, AssessmentSubmission
from app.models.instructor.instructor_earnings import InstructorEarning
from app.services.ai_orchestrator import AIOrchestrator

logger = logging.getLogger(__name__)

# Kenya CBC Competency Framework reference data used for AI prompts
_CBC_FRAMEWORK = """
Kenya Competency-Based Curriculum (CBC) Framework:

Grade Levels:
- Pre-Primary 1 & 2 (PP1, PP2): Ages 4-5
- Lower Primary (Grade 1-3): Ages 6-8
- Upper Primary (Grade 4-6): Ages 9-11
- Junior Secondary (Grade 7-9): Ages 12-14
- Senior Secondary (Grade 10-12): Ages 15-17

Learning Areas by Level:

Lower Primary (Grade 1-3):
  - Literacy Activities (English & Kiswahili)
  - Mathematical Activities
  - Environmental Activities
  - Hygiene and Nutrition Activities
  - Religious Education Activities
  - Creative Activities (Art, Music, Movement)

Upper Primary (Grade 4-6):
  - English
  - Kiswahili / KSL
  - Home Science
  - Agriculture
  - Science and Technology
  - Mathematics
  - Religious Education (CRE/IRE/HRE)
  - Creative Arts
  - Physical and Health Education
  - Social Studies

Junior Secondary (Grade 7-9):
  - English
  - Kiswahili
  - Mathematics
  - Integrated Science
  - Health Education
  - Pre-Technical and Pre-Career Education
  - Social Studies
  - Religious Education
  - Business Studies
  - Agriculture
  - Life Skills Education
  - Sports and Physical Education
  - Optional: Foreign Languages, Kenya Sign Language, Indigenous Languages

Senior Secondary (Grade 10-12):
  Three Pathways: STEM, Arts and Sports Science, Social Sciences
  Core Subjects: Mathematics, English, Kiswahili
  Each pathway has specialized elective subjects.

Core Competencies (all levels):
  1. Communication and Collaboration
  2. Critical Thinking and Problem Solving
  3. Creativity and Imagination
  4. Citizenship
  5. Digital Literacy
  6. Learning to Learn
  7. Self-Efficacy

Assessment Framework:
  - Formative assessment (ongoing, portfolio-based)
  - Summative assessment (end of level)
  - Emphasis on competency demonstration over rote memorization
  - Rubric-based scoring aligned to competency indicators

Pertinent and Contemporary Issues (PCIs):
  - Environmental education
  - Health and safety
  - Life skills and values
  - Financial literacy
  - Community service learning
"""


async def generate_daily_insights(
    db: AsyncSession,
    instructor_id: str,
    insight_date: date = None
) -> InstructorDailyInsight:
    """
    Generate AI-powered daily insights (batch job, runs nightly).
    Gathers real context from the database and uses AI to produce
    prioritised, actionable insight items.
    """
    try:
        if not insight_date:
            insight_date = date.today()

        # ── 1. Pending submissions count ───────────────────────────────
        course_ids_q = select(Course.id).where(Course.instructor_id == instructor_id)
        pending_subs_q = select(func.count()).select_from(AssessmentSubmission).join(
            Assessment, Assessment.id == AssessmentSubmission.assessment_id
        ).where(and_(
            Assessment.course_id.in_(course_ids_q),
            AssessmentSubmission.is_graded == False,
            AssessmentSubmission.is_submitted == True,
        ))
        pending_count = (await db.execute(pending_subs_q)).scalar() or 0

        # ── 2. Upcoming sessions in next 48 hours ─────────────────────
        upcoming_q = select(func.count(LiveSession.id)).where(and_(
            LiveSession.host_id == instructor_id,
            LiveSession.status == "scheduled",
            LiveSession.scheduled_at.between(
                datetime.utcnow(),
                datetime.utcnow() + timedelta(hours=48)
            )
        ))
        upcoming_count = (await db.execute(upcoming_q)).scalar() or 0

        # ── 3. Total students and at-risk students ─────────────────────
        total_students_q = select(
            func.count(func.distinct(Enrollment.student_id))
        ).join(
            Course, Course.id == Enrollment.course_id
        ).where(Course.instructor_id == instructor_id)
        total_students = (await db.execute(total_students_q)).scalar() or 0

        at_risk_q = select(
            func.count(func.distinct(Enrollment.student_id))
        ).join(
            Course, Course.id == Enrollment.course_id
        ).where(and_(
            Course.instructor_id == instructor_id,
            Enrollment.progress_percentage < 20,
            Enrollment.is_deleted == False,
        ))
        at_risk_count = (await db.execute(at_risk_q)).scalar() or 0

        # ── 4. Earnings this month ─────────────────────────────────────
        month_start = datetime.utcnow().replace(
            day=1, hour=0, minute=0, second=0, microsecond=0
        )
        earnings_q = select(
            func.coalesce(func.sum(InstructorEarning.net_amount), 0)
        ).where(and_(
            InstructorEarning.instructor_id == instructor_id,
            InstructorEarning.created_at >= month_start,
        ))
        earnings_month = float((await db.execute(earnings_q)).scalar() or 0)

        # ── 5. Course count ────────────────────────────────────────────
        course_count_q = select(func.count(Course.id)).where(
            Course.instructor_id == instructor_id
        )
        course_count = (await db.execute(course_count_q)).scalar() or 0

        # ── Build context string for AI ────────────────────────────────
        context = f"""
Generate prioritized daily insights for an instructor on {insight_date}.

Real-time data snapshot:
- Pending submissions awaiting grading: {pending_count}
- Upcoming live sessions (next 48h): {upcoming_count}
- Total enrolled students across all courses: {total_students}
- At-risk students (progress < 20%): {at_risk_count}
- Earnings this month (KES): {earnings_month:,.2f}
- Total courses: {course_count}

Produce a JSON array of insight objects. Each object must have:
  "priority": "high" | "medium" | "low",
  "category": one of "submissions", "sessions", "students", "earnings", "courses",
  "title": short actionable title,
  "description": 1-2 sentence explanation,
  "action_url": a relative URL starting with /dashboard/instructor/...,
  "ai_rationale": why this matters right now

Return ONLY the JSON array, no extra text.
"""

        ai_orchestrator = AIOrchestrator()
        result = await ai_orchestrator.process_request(
            task_type="general",
            user_prompt=context,
            conversation_history=[],
            system_prompt=(
                "You are an educational analytics assistant for Urban Home School, "
                "a Kenyan CBC-aligned learning platform. Generate actionable daily "
                "insights for an instructor. Return a JSON array only."
            )
        )

        # ── Parse structured insights from AI response ─────────────────
        ai_response_text = result.get("response", "")
        insights_list: List[Dict[str, Any]] = []

        try:
            # Try to parse the AI response as JSON
            parsed = json.loads(ai_response_text)
            if isinstance(parsed, list):
                insights_list = parsed
        except (json.JSONDecodeError, TypeError):
            logger.warning("Could not parse AI response as JSON, building insights from data")

        # Fallback / supplement: build deterministic insights from gathered data
        if not insights_list:
            if pending_count > 0:
                insights_list.append({
                    "priority": "high" if pending_count > 5 else "medium",
                    "category": "submissions",
                    "title": f"{pending_count} submission{'s' if pending_count != 1 else ''} need grading",
                    "description": (
                        "Students are waiting for feedback on their work. "
                        "Timely grading improves engagement and learning outcomes."
                    ),
                    "action_url": "/dashboard/instructor/submissions",
                    "ai_rationale": (
                        f"{pending_count} ungraded submissions detected. "
                        "Prompt feedback is a key driver of student retention."
                    )
                })

            if upcoming_count > 0:
                insights_list.append({
                    "priority": "medium",
                    "category": "sessions",
                    "title": f"{upcoming_count} session{'s' if upcoming_count != 1 else ''} in the next 48 hours",
                    "description": "Review your upcoming live sessions and ensure materials are ready.",
                    "action_url": "/dashboard/instructor/sessions",
                    "ai_rationale": "Preparation leads to higher-quality sessions and better student outcomes."
                })

            if at_risk_count > 0:
                insights_list.append({
                    "priority": "high",
                    "category": "students",
                    "title": f"{at_risk_count} student{'s' if at_risk_count != 1 else ''} at risk of falling behind",
                    "description": (
                        "These students have less than 20% progress. "
                        "Consider reaching out with encouragement or additional resources."
                    ),
                    "action_url": "/dashboard/instructor/students",
                    "ai_rationale": (
                        "Early intervention for struggling students significantly "
                        "reduces dropout rates."
                    )
                })

            if earnings_month > 0:
                insights_list.append({
                    "priority": "low",
                    "category": "earnings",
                    "title": f"KES {earnings_month:,.0f} earned this month",
                    "description": "Review your earnings breakdown and payout schedule.",
                    "action_url": "/dashboard/instructor/earnings",
                    "ai_rationale": "Keeping track of earnings helps with financial planning."
                })

            if course_count > 0 and total_students == 0:
                insights_list.append({
                    "priority": "medium",
                    "category": "courses",
                    "title": "No students enrolled yet",
                    "description": (
                        "You have courses but no enrolled students. "
                        "Consider promoting your courses or adjusting pricing."
                    ),
                    "action_url": "/dashboard/instructor/courses",
                    "ai_rationale": "Courses without students generate no revenue or impact."
                })

        insight = InstructorDailyInsight(
            instructor_id=instructor_id,
            insight_date=insight_date,
            insights=insights_list,
            generated_at=datetime.utcnow(),
            ai_model_used=result.get("model_used", "unknown"),
            extra_data={
                "pending_submissions": pending_count,
                "upcoming_sessions": upcoming_count,
                "total_students": total_students,
                "at_risk_students": at_risk_count,
                "earnings_month": earnings_month,
                "course_count": course_count,
            }
        )
        db.add(insight)
        await db.commit()
        await db.refresh(insight)

        logger.info(f"Generated daily insights for {instructor_id} on {insight_date}")
        return insight

    except Exception as e:
        logger.error(f"Error generating daily insights: {str(e)}")
        await db.rollback()
        raise


async def analyze_cbc_alignment(
    db: AsyncSession,
    course_id: str,
    instructor_id: str
) -> InstructorCBCAnalysis:
    """
    AI-powered CBC (Competency-Based Curriculum) alignment analysis.
    Uses the Kenya CBC competency framework to evaluate how well a course
    covers the required competencies for its target grade levels and
    learning area.
    """
    try:
        # Get course content
        course_query = select(Course).where(Course.id == course_id)
        course_result = await db.execute(course_query)
        course = course_result.scalar_one()

        # Build detailed prompt with CBC framework context
        context = f"""
Analyze the CBC (Competency-Based Curriculum) alignment for the following course.

== Kenya CBC Competency Framework ==
{_CBC_FRAMEWORK}

== Course Details ==
Title: {course.title}
Description: {course.description}
Grade Levels: {course.grade_levels}
Learning Area: {course.learning_area}
Syllabus / Content: {json.dumps(course.syllabus, default=str) if course.syllabus else "Not provided"}
Existing Competencies Listed: {json.dumps(course.competencies, default=str) if course.competencies else "None"}

== Analysis Instructions ==
Based on the CBC framework above, produce a JSON object with exactly these keys:

1. "alignment_score": a numeric score from 0 to 100 indicating overall CBC alignment.
2. "competencies_covered": array of objects, each with:
   - "strand": the CBC strand name
   - "sub_strand": the CBC sub-strand
   - "competency": description of the competency covered
   - "lesson_references": array of lesson/topic titles from the course that address it
3. "competencies_missing": array of objects, each with:
   - "strand": the CBC strand name
   - "sub_strand": the CBC sub-strand
   - "competency": description of the missing competency
   - "importance": "high" | "medium" | "low"
4. "suggestions": array of objects, each with:
   - "type": "add_content" | "restructure" | "enhance" | "remove"
   - "competency": the competency this suggestion addresses
   - "rationale": why this change is recommended
   - "priority": "high" | "medium" | "low"

Return ONLY the JSON object, no extra text.
"""

        ai_orchestrator = AIOrchestrator()
        result = await ai_orchestrator.process_request(
            task_type="reasoning",
            user_prompt=context,
            conversation_history=[],
            system_prompt=(
                "You are a curriculum alignment specialist for the Kenya "
                "Competency-Based Curriculum (CBC). Analyze course content against "
                "the CBC framework and produce structured alignment data. "
                "Return a valid JSON object only."
            )
        )

        # Parse AI response into structured data
        ai_response_text = result.get("response", "")
        alignment_score = Decimal("0.00")
        competencies_covered: List[Dict[str, Any]] = []
        competencies_missing: List[Dict[str, Any]] = []
        suggestions: List[Dict[str, Any]] = []

        try:
            parsed = json.loads(ai_response_text)
            if isinstance(parsed, dict):
                # Extract alignment score
                raw_score = parsed.get("alignment_score", 0)
                alignment_score = Decimal(str(min(max(float(raw_score), 0), 100)))

                # Extract competencies covered
                raw_covered = parsed.get("competencies_covered", [])
                if isinstance(raw_covered, list):
                    competencies_covered = raw_covered

                # Extract competencies missing
                raw_missing = parsed.get("competencies_missing", [])
                if isinstance(raw_missing, list):
                    competencies_missing = raw_missing

                # Extract suggestions
                raw_suggestions = parsed.get("suggestions", [])
                if isinstance(raw_suggestions, list):
                    suggestions = raw_suggestions
        except (json.JSONDecodeError, TypeError, ValueError) as parse_err:
            logger.warning(f"Could not parse CBC analysis AI response: {parse_err}")
            # Keep defaults; the raw response is still stored in analysis_data

        analysis = InstructorCBCAnalysis(
            course_id=course_id,
            instructor_id=instructor_id,
            alignment_score=alignment_score,
            competencies_covered=competencies_covered,
            competencies_missing=competencies_missing,
            suggestions=suggestions,
            ai_model_used=result.get("model_used", "unknown"),
            analysis_data={"raw_response": ai_response_text}
        )
        db.add(analysis)
        await db.commit()
        await db.refresh(analysis)

        logger.info(f"Generated CBC analysis for course {course_id}")
        return analysis

    except Exception as e:
        logger.error(f"Error analyzing CBC alignment: {str(e)}")
        await db.rollback()
        raise
