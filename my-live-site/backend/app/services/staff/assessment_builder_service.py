"""
Assessment Builder Service

Bridge module that wraps the assessment_engine functions in a class-based
interface expected by the API route layer (assessment_builder.py).

Each static method translates the keyword-argument call signature used by
the route into the dict-based signatures of the underlying engine functions.
"""

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.staff import assessment_engine as engine
from app.models.staff.assessment import AdaptiveAssessment, AssessmentQuestion

logger = logging.getLogger(__name__)


class AssessmentBuilderService:
    """Static facade over assessment_engine functions."""

    # ------------------------------------------------------------------
    # Assessments
    # ------------------------------------------------------------------

    @staticmethod
    async def list_assessments(
        db: AsyncSession,
        *,
        page: int = 1,
        page_size: int = 20,
        assessment_type: Optional[str] = None,
        grade_level: Optional[str] = None,
        subject: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Paginated list of assessments with optional filters."""
        filters: Dict[str, Any] = {}
        if assessment_type:
            filters["assessment_type"] = assessment_type
        if grade_level:
            filters["grade_level"] = grade_level
        if subject:
            filters["learning_area"] = subject
        return await engine.list_assessments(
            db, filters=filters, page=page, page_size=page_size
        )

    @staticmethod
    async def get_assessment(
        db: AsyncSession,
        *,
        assessment_id: str,
    ) -> Optional[Dict[str, Any]]:
        """Retrieve a single assessment with its questions."""
        return await engine.get_assessment(db, assessment_id=assessment_id)

    @staticmethod
    async def create_assessment(
        db: AsyncSession,
        *,
        creator_id: str,
        title: str,
        description: Optional[str] = None,
        assessment_type: str = "quiz",
        grade_level: Optional[str] = None,
        subject: Optional[str] = None,
        time_limit_minutes: Optional[int] = None,
        passing_score: Optional[float] = None,
        is_adaptive: bool = False,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Create a new assessment."""
        data: Dict[str, Any] = {
            "title": title,
            "assessment_type": assessment_type,
        }
        if description is not None:
            data["description"] = description
        if grade_level is not None:
            data["grade_level"] = grade_level
        if subject is not None:
            data["learning_area"] = subject
        if time_limit_minutes is not None:
            data["time_limit_minutes"] = time_limit_minutes
        if passing_score is not None:
            data["passing_score"] = passing_score
        if is_adaptive:
            data["adaptive_config"] = {
                "initial_difficulty": 3,
                "step_up_threshold": 0.8,
                "step_down_threshold": 0.4,
            }
        if metadata is not None:
            data["metadata"] = metadata

        return await engine.create_assessment(db, creator_id=creator_id, data=data)

    @staticmethod
    async def update_assessment(
        db: AsyncSession,
        *,
        assessment_id: str,
        updates: Dict[str, Any],
    ) -> Optional[Dict[str, Any]]:
        """
        Update an existing assessment.

        Stub -- the assessment_engine does not yet expose an update function,
        so we perform a minimal update directly on the model.
        """
        try:
            q = select(AdaptiveAssessment).where(
                AdaptiveAssessment.id == assessment_id
            )
            result = await db.execute(q)
            assessment = result.scalar_one_or_none()

            if not assessment:
                return None

            # Map 'subject' from the route to the model's 'learning_area'
            if "subject" in updates:
                updates["learning_area"] = updates.pop("subject")

            for key, value in updates.items():
                if value is not None and hasattr(assessment, key):
                    setattr(assessment, key, value)

            assessment.updated_at = datetime.utcnow()
            await db.flush()

            logger.info("Assessment %s updated via builder service", assessment_id)

            return {
                "id": str(assessment.id),
                "title": assessment.title,
                "assessment_type": assessment.assessment_type,
                "updated_at": assessment.updated_at.isoformat(),
            }

        except Exception as exc:
            logger.error("Error updating assessment %s: %s", assessment_id, exc)
            raise

    @staticmethod
    async def delete_assessment(
        db: AsyncSession,
        *,
        assessment_id: str,
    ) -> bool:
        """
        Delete an assessment and its questions.

        Stub -- not yet in the assessment_engine; performs a direct delete.
        """
        try:
            # Delete associated questions first
            from sqlalchemy import delete as sa_delete

            await db.execute(
                sa_delete(AssessmentQuestion).where(
                    AssessmentQuestion.assessment_id == assessment_id
                )
            )

            q = select(AdaptiveAssessment).where(
                AdaptiveAssessment.id == assessment_id
            )
            result = await db.execute(q)
            assessment = result.scalar_one_or_none()

            if not assessment:
                return False

            await db.delete(assessment)
            await db.flush()

            logger.info("Assessment %s deleted via builder service", assessment_id)
            return True

        except Exception as exc:
            logger.error("Error deleting assessment %s: %s", assessment_id, exc)
            raise

    # ------------------------------------------------------------------
    # Questions
    # ------------------------------------------------------------------

    @staticmethod
    async def add_question(
        db: AsyncSession,
        *,
        assessment_id: str,
        question_text: str,
        question_type: str,
        options: Optional[List[Dict[str, Any]]] = None,
        correct_answer: Optional[str] = None,
        points: float = 1.0,
        difficulty: Optional[str] = "medium",
        explanation: Optional[str] = None,
        tags: Optional[List[str]] = None,
    ) -> Optional[Dict[str, Any]]:
        """Add a question to an assessment."""
        # Map string difficulty to numeric scale expected by the engine
        difficulty_map = {
            "very_easy": 1,
            "easy": 2,
            "medium": 3,
            "hard": 4,
            "very_hard": 5,
        }
        numeric_difficulty = difficulty_map.get(difficulty or "medium", 3)

        # Determine order_index from existing questions
        from sqlalchemy import func

        count_q = select(func.count(AssessmentQuestion.id)).where(
            AssessmentQuestion.assessment_id == assessment_id
        )
        count_result = await db.execute(count_q)
        current_count = count_result.scalar() or 0

        question_data: Dict[str, Any] = {
            "question_text": question_text,
            "question_type": question_type,
            "difficulty": numeric_difficulty,
            "points": points,
            "order_index": current_count + 1,
        }
        if options is not None:
            question_data["options"] = options
        if correct_answer is not None:
            question_data["correct_answer"] = correct_answer
        if explanation is not None:
            question_data["explanation"] = explanation
        if tags is not None:
            question_data["cbc_competency"] = ", ".join(tags)

        return await engine.add_question(
            db, assessment_id=assessment_id, question_data=question_data
        )

    @staticmethod
    async def update_question(
        db: AsyncSession,
        *,
        question_id: str,
        updates: Dict[str, Any],
    ) -> Optional[Dict[str, Any]]:
        """Update an existing question."""
        return await engine.update_question(db, question_id=question_id, data=updates)

    @staticmethod
    async def delete_question(
        db: AsyncSession,
        *,
        question_id: str,
    ) -> bool:
        """
        Delete a question from an assessment.

        Stub -- not yet in the assessment_engine; performs a direct delete
        and decrements the parent assessment's total_questions count.
        """
        try:
            q = select(AssessmentQuestion).where(
                AssessmentQuestion.id == question_id
            )
            result = await db.execute(q)
            question = result.scalar_one_or_none()

            if not question:
                return False

            assessment_id = question.assessment_id

            await db.delete(question)

            # Decrement total_questions on the parent assessment
            assessment_q = select(AdaptiveAssessment).where(
                AdaptiveAssessment.id == assessment_id
            )
            assessment_result = await db.execute(assessment_q)
            assessment = assessment_result.scalar_one_or_none()
            if assessment and assessment.total_questions > 0:
                assessment.total_questions -= 1
                assessment.updated_at = datetime.utcnow()

            await db.flush()

            logger.info("Question %s deleted via builder service", question_id)
            return True

        except Exception as exc:
            logger.error("Error deleting question %s: %s", question_id, exc)
            raise

    # ------------------------------------------------------------------
    # Adaptive & Grading
    # ------------------------------------------------------------------

    @staticmethod
    async def get_next_adaptive_question(
        db: AsyncSession,
        *,
        assessment_id: str,
        student_id: str,
        answers_so_far: Optional[List[Dict[str, Any]]] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Select the next adaptive question for a student.

        Builds the session_state dict expected by engine.select_next_question.
        """
        answers = answers_so_far or []
        correct_count = sum(
            1 for a in answers if a.get("is_correct") or a.get("correct")
        )

        session_state: Dict[str, Any] = {
            "assessment_id": assessment_id,
            "student_id": student_id,
            "questions_answered": len(answers),
            "correct_count": correct_count,
            "current_difficulty": 3,
            "path_history": answers,
        }

        return await engine.select_next_question(db, session_state=session_state)

    @staticmethod
    async def grade_response(
        db: AsyncSession,
        *,
        question_id: str,
        student_id: str,
        response_text: str,
        rubric: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Grade a student's response to a question.

        Fetches the question record and delegates to engine.grade_response.
        """
        q = select(AssessmentQuestion).where(AssessmentQuestion.id == question_id)
        result = await db.execute(q)
        question = result.scalar_one_or_none()

        if not question:
            return None

        question_dict: Dict[str, Any] = {
            "id": str(question.id),
            "question_text": question.question_text,
            "question_type": question.question_type,
            "options": question.options,
            "correct_answer": question.correct_answer,
            "points": question.points,
            "explanation": question.explanation,
            "ai_grading_prompt": question.ai_grading_prompt,
        }

        if rubric:
            question_dict["ai_grading_prompt"] = rubric

        grading_result = await engine.grade_response(
            db, question=question_dict, answer=response_text
        )

        # Attach student_id for downstream tracking
        grading_result["student_id"] = student_id
        return grading_result
