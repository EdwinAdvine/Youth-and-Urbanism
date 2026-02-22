"""
Student Mastery Service

Manages topic-level mastery tracking with SM-2 spaced repetition. Gates
advancement: students must score >= 80% on 3 consecutive attempts before
a topic is marked as mastered. Computes optimal review dates using the
SM-2 algorithm to maximize long-term retention.
"""
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from uuid import UUID

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.student_mastery import StudentMasteryRecord


class StudentMasteryService:
    """Service for managing student topic mastery and spaced repetition."""

    # Mastery gate: require this score on this many consecutive attempts
    MASTERY_THRESHOLD = 0.8
    MASTERY_CONSECUTIVE_REQUIRED = 3

    def __init__(self, db: AsyncSession):
        self.db = db

    async def record_attempt(
        self,
        student_id: UUID,
        topic_name: str,
        subject: str,
        grade_level: str,
        score: float,
        time_spent_seconds: int = 0,
    ) -> StudentMasteryRecord:
        """
        Record a mastery attempt and update the SM-2 spaced repetition schedule.

        Args:
            student_id: Student UUID
            topic_name: Topic being assessed
            subject: Subject area
            grade_level: Student's grade level
            score: Score from 0.0 to 1.0
            time_spent_seconds: Time taken for the attempt

        Returns:
            Updated StudentMasteryRecord
        """
        # Get or create mastery record
        stmt = select(StudentMasteryRecord).where(
            and_(
                StudentMasteryRecord.student_id == student_id,
                StudentMasteryRecord.topic_name == topic_name,
                StudentMasteryRecord.is_deleted == False,
            )
        )
        result = await self.db.execute(stmt)
        record = result.scalar_one_or_none()

        if not record:
            record = StudentMasteryRecord(
                student_id=student_id,
                topic_name=topic_name,
                subject=subject,
                grade_level=grade_level,
            )
            self.db.add(record)

        # Update attempt tracking
        record.attempt_count += 1
        record.mastery_level = score

        # Track consecutive correct for mastery gating
        if score >= self.MASTERY_THRESHOLD:
            record.consecutive_correct += 1
        else:
            record.consecutive_correct = 0

        # Check mastery gate
        if (
            record.consecutive_correct >= self.MASTERY_CONSECUTIVE_REQUIRED
            and score >= self.MASTERY_THRESHOLD
        ):
            record.is_mastered = True

        # Append to attempt history
        history = record.attempt_history or []
        history.append({
            "date": datetime.utcnow().isoformat(),
            "score": score,
            "time_spent_seconds": time_spent_seconds,
        })
        record.attempt_history = history

        # Update SM-2 spaced repetition schedule
        self._update_sm2(record, score)

        record.updated_at = datetime.utcnow()
        await self.db.commit()
        await self.db.refresh(record)
        return record

    def _update_sm2(self, record: StudentMasteryRecord, score: float) -> None:
        """
        Apply the SM-2 spaced repetition algorithm to compute next review date.

        SM-2 Algorithm:
        - Quality (q) mapped from score: 0.0->0, 0.5->2, 0.8->4, 1.0->5
        - If q < 3: reset interval to 1 day
        - If q >= 3: interval = previous_interval * EF
        - EF = max(1.3, EF + 0.1 - (5-q) * (0.08 + (5-q) * 0.02))
        """
        # Map 0-1 score to SM-2 quality (0-5)
        quality = round(score * 5)

        ef = record.easiness_factor

        if quality < 3:
            # Failed review: reset interval
            record.review_interval_days = 1
        else:
            if record.attempt_count <= 1:
                record.review_interval_days = 1
            elif record.attempt_count == 2:
                record.review_interval_days = 6
            else:
                record.review_interval_days = round(record.review_interval_days * ef)

        # Update easiness factor
        ef = ef + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
        record.easiness_factor = max(1.3, ef)

        # Compute next review date
        record.next_review_date = datetime.utcnow() + timedelta(days=record.review_interval_days)

    async def get_mastery_status(
        self,
        student_id: UUID,
        subject: Optional[str] = None,
    ) -> List[Dict]:
        """Get mastery records for a student, optionally filtered by subject."""
        stmt = select(StudentMasteryRecord).where(
            and_(
                StudentMasteryRecord.student_id == student_id,
                StudentMasteryRecord.is_deleted == False,
            )
        )
        if subject:
            stmt = stmt.where(StudentMasteryRecord.subject == subject)

        stmt = stmt.order_by(StudentMasteryRecord.subject, StudentMasteryRecord.topic_name)
        result = await self.db.execute(stmt)
        records = result.scalars().all()

        return [
            {
                "id": str(r.id),
                "topic_name": r.topic_name,
                "subject": r.subject,
                "grade_level": r.grade_level,
                "mastery_level": r.mastery_level,
                "attempt_count": r.attempt_count,
                "consecutive_correct": r.consecutive_correct,
                "is_mastered": r.is_mastered,
                "next_review_date": r.next_review_date.isoformat() if r.next_review_date else None,
                "review_interval_days": r.review_interval_days,
            }
            for r in records
        ]

    async def get_due_reviews(self, student_id: UUID) -> List[Dict]:
        """Get topics due for spaced repetition review (next_review_date <= now)."""
        stmt = (
            select(StudentMasteryRecord)
            .where(
                and_(
                    StudentMasteryRecord.student_id == student_id,
                    StudentMasteryRecord.is_deleted == False,
                    StudentMasteryRecord.next_review_date <= datetime.utcnow(),
                )
            )
            .order_by(StudentMasteryRecord.next_review_date.asc())
        )
        result = await self.db.execute(stmt)
        records = result.scalars().all()

        return [
            {
                "id": str(r.id),
                "topic_name": r.topic_name,
                "subject": r.subject,
                "mastery_level": r.mastery_level,
                "is_mastered": r.is_mastered,
                "last_reviewed": r.updated_at.isoformat() if r.updated_at else None,
                "days_overdue": (datetime.utcnow() - r.next_review_date).days if r.next_review_date else 0,
            }
            for r in records
        ]

    async def check_mastery_gate(self, student_id: UUID, topic_name: str) -> Dict:
        """Check if a student has mastered a topic and can advance."""
        stmt = select(StudentMasteryRecord).where(
            and_(
                StudentMasteryRecord.student_id == student_id,
                StudentMasteryRecord.topic_name == topic_name,
                StudentMasteryRecord.is_deleted == False,
            )
        )
        result = await self.db.execute(stmt)
        record = result.scalar_one_or_none()

        if not record:
            return {
                "topic": topic_name,
                "can_advance": False,
                "reason": "No attempts recorded yet",
                "mastery_level": 0.0,
                "attempts_needed": self.MASTERY_CONSECUTIVE_REQUIRED,
            }

        return {
            "topic": topic_name,
            "can_advance": record.is_mastered,
            "reason": "Mastered!" if record.is_mastered else (
                f"Need {self.MASTERY_CONSECUTIVE_REQUIRED - record.consecutive_correct} "
                f"more consecutive scores >= {self.MASTERY_THRESHOLD:.0%}"
            ),
            "mastery_level": record.mastery_level,
            "consecutive_correct": record.consecutive_correct,
            "attempt_count": record.attempt_count,
        }
