"""
Age Transition Service

Handles the lifecycle when students turn 18/19:
- Notifying parents and students about upcoming delinking
- Processing delinking requests
- Managing account independence transitions
"""

import logging
from datetime import date, datetime, timedelta
from uuid import UUID
from typing import Optional

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.student import Student
from app.models.account_delinking_request import AccountDelinkingRequest

logger = logging.getLogger(__name__)


async def find_students_turning_19(db: AsyncSession) -> list[dict]:
    """Find students who turned 19 recently and still have a parent_id set."""
    today = date.today()
    # Students who turned 19 within the last 30 days
    cutoff_date = today - timedelta(days=30)
    nineteenth_birthday_start = date(today.year - 19, cutoff_date.month, cutoff_date.day)
    nineteenth_birthday_end = date(today.year - 19, today.month, today.day)

    query = (
        select(Student, User)
        .join(User, User.id == Student.user_id)
        .where(
            and_(
                Student.parent_id.isnot(None),
                User.date_of_birth.isnot(None),
                User.date_of_birth >= nineteenth_birthday_start,
                User.date_of_birth <= nineteenth_birthday_end,
            )
        )
    )

    result = await db.execute(query)
    rows = result.all()

    return [
        {
            "student_id": str(student.id),
            "user_id": str(user.id),
            "student_name": user.profile_data.get("full_name", ""),
            "parent_id": str(student.parent_id),
            "date_of_birth": user.date_of_birth.isoformat(),
        }
        for student, user in rows
    ]


async def request_delinking(
    db: AsyncSession,
    student_user_id: str,
) -> AccountDelinkingRequest:
    """Student requests to be delinked from their parent account."""
    # Find the student record
    result = await db.execute(
        select(Student).join(User, User.id == Student.user_id).where(
            Student.user_id == UUID(student_user_id)
        )
    )
    student = result.scalar_one_or_none()

    if not student:
        raise ValueError("Student record not found.")

    if not student.parent_id:
        raise ValueError("Student is not linked to a parent account.")

    # Check for existing pending request
    existing = await db.execute(
        select(AccountDelinkingRequest).where(
            and_(
                AccountDelinkingRequest.student_user_id == UUID(student_user_id),
                AccountDelinkingRequest.status == "pending",
            )
        )
    )
    if existing.scalar_one_or_none():
        raise ValueError("A delinking request is already pending.")

    # Get parent user_id from Student.parent_id (which is the student table ID)
    parent_student = await db.execute(
        select(Student.user_id).where(Student.id == student.parent_id)
    )
    # Actually parent_id on Student refers to the parent User's ID
    # Let's query properly
    parent_result = await db.execute(
        select(User.id).where(User.id == student.parent_id)
    )
    parent_user_id = parent_result.scalar_one_or_none()

    if not parent_user_id:
        raise ValueError("Parent account not found.")

    delink_request = AccountDelinkingRequest(
        student_user_id=UUID(student_user_id),
        parent_user_id=parent_user_id,
        status="pending",
    )
    db.add(delink_request)
    await db.commit()
    await db.refresh(delink_request)

    return delink_request


async def respond_to_delinking(
    db: AsyncSession,
    request_id: str,
    parent_user_id: str,
    approve: bool,
    response_note: Optional[str] = None,
) -> AccountDelinkingRequest:
    """Parent approves or denies a delinking request."""
    result = await db.execute(
        select(AccountDelinkingRequest).where(
            and_(
                AccountDelinkingRequest.id == UUID(request_id),
                AccountDelinkingRequest.parent_user_id == UUID(parent_user_id),
                AccountDelinkingRequest.status == "pending",
            )
        )
    )
    delink_request = result.scalar_one_or_none()

    if not delink_request:
        raise ValueError("Delinking request not found or already processed.")

    delink_request.status = "approved" if approve else "denied"
    delink_request.responded_at = datetime.utcnow()
    delink_request.response_note = response_note

    if approve:
        # Clear the parent_id on the Student record
        student_result = await db.execute(
            select(Student).join(User, User.id == Student.user_id).where(
                Student.user_id == delink_request.student_user_id
            )
        )
        student = student_result.scalar_one_or_none()
        if student:
            student.parent_id = None

    await db.commit()
    await db.refresh(delink_request)

    return delink_request


async def get_delinking_requests_for_parent(
    db: AsyncSession,
    parent_user_id: str,
) -> list[AccountDelinkingRequest]:
    """Get all delinking requests for a parent."""
    result = await db.execute(
        select(AccountDelinkingRequest).where(
            AccountDelinkingRequest.parent_user_id == UUID(parent_user_id)
        )
    )
    return list(result.scalars().all())


async def get_delinking_requests_for_student(
    db: AsyncSession,
    student_user_id: str,
) -> list[AccountDelinkingRequest]:
    """Get all delinking requests for a student."""
    result = await db.execute(
        select(AccountDelinkingRequest).where(
            AccountDelinkingRequest.student_user_id == UUID(student_user_id)
        )
    )
    return list(result.scalars().all())
