"""
Assessment Engine

Adaptive assessment management with IRT-inspired question selection,
AI-powered essay grading, and weighted score calculation.
"""

import logging
import math
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.staff.assessment import AdaptiveAssessment, AssessmentQuestion
from app.services.ai_orchestrator import AIOrchestrator

logger = logging.getLogger(__name__)

# Difficulty weight multipliers (d1=1x, d2=1.5x, d3=2x, d4=2.5x, d5=3x)
DIFFICULTY_WEIGHTS = {1: 1.0, 2: 1.5, 3: 2.0, 4: 2.5, 5: 3.0}


async def list_assessments(
    db: AsyncSession,
    filters: Optional[Dict[str, Any]] = None,
    page: int = 1,
    page_size: int = 20,
) -> Dict[str, Any]:
    """Return a paginated list of adaptive assessments."""
    try:
        filters = filters or {}
        conditions = []

        if filters.get("status"):
            conditions.append(AdaptiveAssessment.status == filters["status"])
        if filters.get("assessment_type"):
            conditions.append(
                AdaptiveAssessment.assessment_type == filters["assessment_type"]
            )
        if filters.get("author_id"):
            conditions.append(AdaptiveAssessment.author_id == filters["author_id"])
        if filters.get("grade_level"):
            conditions.append(AdaptiveAssessment.grade_level == filters["grade_level"])
        if filters.get("learning_area"):
            conditions.append(
                AdaptiveAssessment.learning_area == filters["learning_area"]
            )
        if filters.get("course_id"):
            conditions.append(AdaptiveAssessment.course_id == filters["course_id"])

        where_clause = and_(*conditions) if conditions else True

        total_q = select(func.count(AdaptiveAssessment.id)).where(where_clause)
        total_result = await db.execute(total_q)
        total: int = total_result.scalar() or 0

        offset = (page - 1) * page_size
        items_q = (
            select(AdaptiveAssessment)
            .where(where_clause)
            .order_by(AdaptiveAssessment.updated_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        items_result = await db.execute(items_q)
        assessments = items_result.scalars().all()

        item_list = [
            {
                "id": str(a.id),
                "title": a.title,
                "description": a.description,
                "assessment_type": a.assessment_type,
                "course_id": str(a.course_id) if a.course_id else None,
                "grade_level": a.grade_level,
                "learning_area": a.learning_area,
                "status": a.status,
                "total_questions": a.total_questions,
                "is_ai_graded": a.is_ai_graded,
                "time_limit_minutes": a.time_limit_minutes,
                "author_id": str(a.author_id),
                "created_at": a.created_at.isoformat(),
                "updated_at": a.updated_at.isoformat() if a.updated_at else None,
            }
            for a in assessments
        ]

        return {
            "items": item_list,
            "total": total,
            "page": page,
            "page_size": page_size,
        }

    except Exception as e:
        logger.error(f"Error listing assessments: {e}")
        raise


async def get_assessment(
    db: AsyncSession,
    assessment_id: str,
) -> Optional[Dict[str, Any]]:
    """Return a single assessment with its questions."""
    try:
        q = select(AdaptiveAssessment).where(AdaptiveAssessment.id == assessment_id)
        result = await db.execute(q)
        a = result.scalar_one_or_none()

        if not a:
            return None

        # Fetch questions
        questions_q = (
            select(AssessmentQuestion)
            .where(AssessmentQuestion.assessment_id == assessment_id)
            .order_by(AssessmentQuestion.order_index.asc())
        )
        questions_result = await db.execute(questions_q)
        questions = [
            {
                "id": str(qq.id),
                "question_text": qq.question_text,
                "question_type": qq.question_type,
                "options": qq.options,
                "correct_answer": qq.correct_answer,
                "explanation": qq.explanation,
                "difficulty": qq.difficulty,
                "points": qq.points,
                "cbc_competency": qq.cbc_competency,
                "media_url": qq.media_url,
                "order_index": qq.order_index,
                "adaptive_paths": qq.adaptive_paths or [],
                "ai_grading_prompt": qq.ai_grading_prompt,
            }
            for qq in questions_result.scalars().all()
        ]

        return {
            "id": str(a.id),
            "title": a.title,
            "description": a.description,
            "assessment_type": a.assessment_type,
            "course_id": str(a.course_id) if a.course_id else None,
            "grade_level": a.grade_level,
            "learning_area": a.learning_area,
            "cbc_tags": a.cbc_tags or [],
            "difficulty_range": a.difficulty_range,
            "adaptive_config": a.adaptive_config,
            "time_limit_minutes": a.time_limit_minutes,
            "is_ai_graded": a.is_ai_graded,
            "rubric": a.rubric,
            "status": a.status,
            "total_questions": a.total_questions,
            "author_id": str(a.author_id),
            "questions": questions,
            "created_at": a.created_at.isoformat(),
            "updated_at": a.updated_at.isoformat() if a.updated_at else None,
        }

    except Exception as e:
        logger.error(f"Error fetching assessment {assessment_id}: {e}")
        raise


async def create_assessment(
    db: AsyncSession,
    creator_id: str,
    data: Dict[str, Any],
) -> Dict[str, Any]:
    """Create a new adaptive assessment."""
    try:
        assessment = AdaptiveAssessment(
            id=uuid.uuid4(),
            title=data["title"],
            description=data.get("description"),
            assessment_type=data["assessment_type"],
            course_id=data.get("course_id"),
            grade_level=data.get("grade_level"),
            learning_area=data.get("learning_area"),
            cbc_tags=data.get("cbc_tags", []),
            difficulty_range=data.get("difficulty_range", {"min": 1, "max": 5}),
            adaptive_config=data.get(
                "adaptive_config",
                {"initial_difficulty": 3, "step_up_threshold": 0.8, "step_down_threshold": 0.4},
            ),
            time_limit_minutes=data.get("time_limit_minutes"),
            is_ai_graded=data.get("is_ai_graded", False),
            rubric=data.get("rubric"),
            status="draft",
            author_id=creator_id,
        )
        db.add(assessment)
        await db.flush()

        logger.info(f"Assessment created: '{assessment.title}' by {creator_id}")

        return {
            "id": str(assessment.id),
            "title": assessment.title,
            "assessment_type": assessment.assessment_type,
            "status": assessment.status,
            "created_at": assessment.created_at.isoformat(),
        }

    except Exception as e:
        logger.error(f"Error creating assessment: {e}")
        raise


async def add_question(
    db: AsyncSession,
    assessment_id: str,
    question_data: Dict[str, Any],
) -> Dict[str, Any]:
    """Add a question to an assessment and increment the total count."""
    try:
        question = AssessmentQuestion(
            id=uuid.uuid4(),
            assessment_id=assessment_id,
            question_text=question_data["question_text"],
            question_type=question_data["question_type"],
            options=question_data.get("options"),
            correct_answer=question_data.get("correct_answer"),
            explanation=question_data.get("explanation"),
            difficulty=question_data["difficulty"],
            points=question_data.get("points", 1),
            cbc_competency=question_data.get("cbc_competency"),
            media_url=question_data.get("media_url"),
            order_index=question_data["order_index"],
            adaptive_paths=question_data.get("adaptive_paths", []),
            ai_grading_prompt=question_data.get("ai_grading_prompt"),
        )
        db.add(question)

        # Increment total questions count on the assessment
        assessment_q = select(AdaptiveAssessment).where(
            AdaptiveAssessment.id == assessment_id
        )
        assessment_result = await db.execute(assessment_q)
        assessment = assessment_result.scalar_one_or_none()
        if assessment:
            assessment.total_questions += 1
            assessment.updated_at = datetime.utcnow()

        await db.flush()

        logger.info(f"Question added to assessment {assessment_id}")

        return {
            "id": str(question.id),
            "assessment_id": str(assessment_id),
            "question_type": question.question_type,
            "difficulty": question.difficulty,
            "order_index": question.order_index,
        }

    except Exception as e:
        logger.error(f"Error adding question to assessment {assessment_id}: {e}")
        raise


async def update_question(
    db: AsyncSession,
    question_id: str,
    data: Dict[str, Any],
) -> Optional[Dict[str, Any]]:
    """Update an existing assessment question."""
    try:
        q = select(AssessmentQuestion).where(AssessmentQuestion.id == question_id)
        result = await db.execute(q)
        question = result.scalar_one_or_none()

        if not question:
            return None

        for key, value in data.items():
            if value is not None and hasattr(question, key):
                setattr(question, key, value)

        await db.flush()

        logger.info(f"Question {question_id} updated")

        return {
            "id": str(question.id),
            "assessment_id": str(question.assessment_id),
            "question_type": question.question_type,
            "difficulty": question.difficulty,
        }

    except Exception as e:
        logger.error(f"Error updating question {question_id}: {e}")
        raise


async def select_next_question(
    db: AsyncSession,
    session_state: Dict[str, Any],
) -> Optional[Dict[str, Any]]:
    """
    Adaptive IRT-inspired question selection.

    Selects the next question based on the student's current estimated
    ability level, which adjusts dynamically based on correct/incorrect
    answers. Uses the adaptive_config thresholds to step difficulty
    up or down.
    """
    try:
        assessment_id = session_state["assessment_id"]
        current_difficulty = session_state.get("current_difficulty", 3)
        questions_answered = session_state.get("questions_answered", 0)
        correct_count = session_state.get("correct_count", 0)
        path_history = session_state.get("path_history", [])

        # Get answered question IDs
        answered_ids = [p.get("question_id") for p in path_history if p.get("question_id")]

        # Determine target difficulty based on performance
        if questions_answered > 0:
            accuracy = correct_count / questions_answered

            # Load adaptive config
            assessment_q = select(AdaptiveAssessment).where(
                AdaptiveAssessment.id == assessment_id
            )
            assessment_result = await db.execute(assessment_q)
            assessment = assessment_result.scalar_one_or_none()

            config = (assessment.adaptive_config if assessment else {}) or {}
            step_up = config.get("step_up_threshold", 0.8)
            step_down = config.get("step_down_threshold", 0.4)
            diff_range = (assessment.difficulty_range if assessment else {}) or {}
            min_diff = diff_range.get("min", 1)
            max_diff = diff_range.get("max", 5)

            if accuracy >= step_up and current_difficulty < max_diff:
                current_difficulty += 1
            elif accuracy <= step_down and current_difficulty > min_diff:
                current_difficulty -= 1

        # Find next question at target difficulty (not yet answered)
        conditions = [
            AssessmentQuestion.assessment_id == assessment_id,
            AssessmentQuestion.difficulty == current_difficulty,
        ]
        if answered_ids:
            conditions.append(AssessmentQuestion.id.notin_(answered_ids))

        question_q = (
            select(AssessmentQuestion)
            .where(and_(*conditions))
            .order_by(AssessmentQuestion.order_index.asc())
            .limit(1)
        )
        result = await db.execute(question_q)
        question = result.scalar_one_or_none()

        # If no question at target difficulty, try adjacent difficulties
        if not question:
            for offset in [1, -1, 2, -2]:
                alt_diff = current_difficulty + offset
                if alt_diff < 1 or alt_diff > 5:
                    continue

                alt_conditions = [
                    AssessmentQuestion.assessment_id == assessment_id,
                    AssessmentQuestion.difficulty == alt_diff,
                ]
                if answered_ids:
                    alt_conditions.append(AssessmentQuestion.id.notin_(answered_ids))

                alt_q = (
                    select(AssessmentQuestion)
                    .where(and_(*alt_conditions))
                    .order_by(AssessmentQuestion.order_index.asc())
                    .limit(1)
                )
                alt_result = await db.execute(alt_q)
                question = alt_result.scalar_one_or_none()
                if question:
                    break

        if not question:
            return None  # No more questions available

        return {
            "question_id": str(question.id),
            "question_text": question.question_text,
            "question_type": question.question_type,
            "options": question.options,
            "difficulty": question.difficulty,
            "points": question.points,
            "media_url": question.media_url,
            "current_difficulty": current_difficulty,
        }

    except Exception as e:
        logger.error(f"Error selecting next question: {e}")
        raise


async def grade_response(
    db: AsyncSession,
    question: Dict[str, Any],
    answer: str,
) -> Dict[str, Any]:
    """
    Grade a student's response.

    For MCQ and fill-in-the-blank: exact match against correct_answer.
    For essay and short_answer: AI grading using the question's grading prompt
    or a default rubric.
    """
    try:
        question_type = question.get("question_type", "mcq")
        correct_answer = question.get("correct_answer")
        max_points = question.get("points", 1)

        # Objective question types: exact match
        if question_type in ("mcq", "fill_blank"):
            is_correct = answer.strip().lower() == (correct_answer or "").strip().lower()
            score = float(max_points) if is_correct else 0.0

            return {
                "question_id": question.get("id", ""),
                "student_answer": answer,
                "score": score,
                "max_score": float(max_points),
                "feedback": question.get("explanation", "")
                if is_correct
                else f"Incorrect. The correct answer is: {correct_answer}",
                "competency_met": is_correct,
                "confidence": 1.0,
            }

        # Subjective question types: AI grading
        grading_prompt = question.get("ai_grading_prompt") or (
            f"Grade the following student answer on a scale of 0 to {max_points}. "
            f"Question: {question.get('question_text', '')} "
            f"Expected answer guidance: {correct_answer or 'Use your judgment'} "
            f"Student answer: {answer} "
            "Provide: score (number), feedback (string), "
            "competency_met (boolean), confidence (0-1 float). "
            "Return as JSON."
        )

        try:
            orchestrator = AIOrchestrator(db)
            await orchestrator.load_providers()
            ai_result = await orchestrator.route_query(
                query=grading_prompt,
                context={"task": "grading"},
                response_mode="text",
            )

            ai_message = ai_result.get("message", "")

            # Attempt to parse structured response
            import json

            start_idx = ai_message.find("{")
            end_idx = ai_message.rfind("}") + 1
            if start_idx != -1 and end_idx > start_idx:
                parsed = json.loads(ai_message[start_idx:end_idx])
                return {
                    "question_id": question.get("id", ""),
                    "student_answer": answer,
                    "score": min(float(parsed.get("score", 0)), float(max_points)),
                    "max_score": float(max_points),
                    "feedback": parsed.get("feedback", ""),
                    "competency_met": parsed.get("competency_met", False),
                    "confidence": float(parsed.get("confidence", 0.5)),
                }

        except Exception as ai_error:
            logger.warning(f"AI grading failed: {ai_error}")

        # Fallback: partial credit based on length heuristic
        min_length = 20
        score = float(max_points) * 0.5 if len(answer.strip()) >= min_length else 0.0

        return {
            "question_id": question.get("id", ""),
            "student_answer": answer,
            "score": score,
            "max_score": float(max_points),
            "feedback": "AI grading temporarily unavailable. Partial credit assigned pending manual review.",
            "competency_met": False,
            "confidence": 0.3,
        }

    except Exception as e:
        logger.error(f"Error grading response: {e}")
        raise


def calculate_final_score(session_state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate the weighted final score for an assessment session.

    Weights by difficulty: d1=1x, d2=1.5x, d3=2x, d4=2.5x, d5=3x.
    """
    try:
        path_history = session_state.get("path_history", [])

        if not path_history:
            return {
                "raw_score": 0.0,
                "weighted_score": 0.0,
                "max_weighted_score": 0.0,
                "percentage": 0.0,
                "questions_answered": 0,
                "correct_count": 0,
            }

        total_weighted = 0.0
        max_weighted = 0.0
        raw_score = 0.0
        max_raw = 0.0
        correct_count = 0

        for entry in path_history:
            difficulty = entry.get("difficulty", 3)
            weight = DIFFICULTY_WEIGHTS.get(difficulty, 2.0)
            points = entry.get("points", 1)
            score = entry.get("score", 0.0)
            max_points = entry.get("max_score", float(points))

            weighted_score = score * weight
            weighted_max = max_points * weight

            total_weighted += weighted_score
            max_weighted += weighted_max
            raw_score += score
            max_raw += max_points

            if score >= max_points * 0.7:
                correct_count += 1

        percentage = (total_weighted / max_weighted * 100) if max_weighted > 0 else 0.0

        return {
            "raw_score": round(raw_score, 2),
            "weighted_score": round(total_weighted, 2),
            "max_weighted_score": round(max_weighted, 2),
            "percentage": round(percentage, 1),
            "questions_answered": len(path_history),
            "correct_count": correct_count,
        }

    except Exception as e:
        logger.error(f"Error calculating final score: {e}")
        return {
            "raw_score": 0.0,
            "weighted_score": 0.0,
            "max_weighted_score": 0.0,
            "percentage": 0.0,
            "questions_answered": 0,
            "correct_count": 0,
        }
