"""
Admin Grade Assignments API

Allows admins to assign class teachers to grade levels and subject
department heads to learning areas. These assignments determine which
teachers appear in the student Teacher Collaboration dropdown.
"""
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import Dict, List, Optional
from uuid import UUID
from pydantic import BaseModel

logger = logging.getLogger(__name__)

from app.database import get_db
from app.models.user import User
from app.models.grade_assignments import GradeClassTeacher, SubjectDepartmentHead
from app.utils.security import get_current_user

router = APIRouter(prefix="/admin/grade-assignments", tags=["Admin - Grade Assignments"])


# ── Pydantic schemas ──────────────────────────────────────────────────────────

class GradeTeacherCreateRequest(BaseModel):
    grade_level: str           # e.g. "Grade 5"
    staff_user_id: str         # UUID of the staff/instructor user
    academic_year: str = "2026"


class SubjectHeadCreateRequest(BaseModel):
    learning_area: str         # e.g. "Mathematics"
    staff_user_id: str
    academic_year: str = "2026"


# ── Helper ────────────────────────────────────────────────────────────────────

def _require_admin(current_user: User) -> None:
    if current_user.role not in ("admin", "staff"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin or Staff access required"
        )


async def _get_user_name(db: AsyncSession, user_id: UUID) -> str:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        return "Unknown"
    if user.profile_data:
        return user.profile_data.get("full_name", user.email)
    return user.email


# ── Grade Class Teacher endpoints ─────────────────────────────────────────────

@router.get("/grade-teachers")
async def list_grade_teachers(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict]:
    """List all active grade class teacher assignments."""
    _require_admin(current_user)
    result = await db.execute(
        select(GradeClassTeacher).where(GradeClassTeacher.is_active == True)
        .order_by(GradeClassTeacher.grade_level)
    )
    items = result.scalars().all()

    output = []
    for item in items:
        name = await _get_user_name(db, item.staff_user_id)
        output.append({
            "id": str(item.id),
            "grade_level": item.grade_level,
            "staff_user_id": str(item.staff_user_id),
            "staff_name": name,
            "academic_year": item.academic_year,
            "is_active": item.is_active,
            "created_at": item.created_at,
        })
    return output


@router.post("/grade-teachers")
async def assign_grade_teacher(
    request: GradeTeacherCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """Assign a staff member as class teacher for a grade level."""
    _require_admin(current_user)

    try:
        staff_id = UUID(request.staff_user_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid staff_user_id")

    # Deactivate any existing assignment for this grade + year
    existing = await db.execute(
        select(GradeClassTeacher).where(
            and_(
                GradeClassTeacher.grade_level == request.grade_level,
                GradeClassTeacher.academic_year == request.academic_year,
                GradeClassTeacher.is_active == True
            )
        )
    )
    for item in existing.scalars().all():
        item.is_active = False

    assignment = GradeClassTeacher(
        grade_level=request.grade_level,
        staff_user_id=staff_id,
        academic_year=request.academic_year,
        is_active=True
    )
    db.add(assignment)
    await db.commit()
    await db.refresh(assignment)

    name = await _get_user_name(db, staff_id)
    return {
        "id": str(assignment.id),
        "grade_level": assignment.grade_level,
        "staff_user_id": str(assignment.staff_user_id),
        "staff_name": name,
        "academic_year": assignment.academic_year,
        "message": "Grade class teacher assigned successfully"
    }


@router.delete("/grade-teachers/{assignment_id}")
async def remove_grade_teacher(
    assignment_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """Deactivate a grade class teacher assignment."""
    _require_admin(current_user)

    try:
        aid = UUID(assignment_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid assignment ID")

    result = await db.execute(select(GradeClassTeacher).where(GradeClassTeacher.id == aid))
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")

    assignment.is_active = False
    await db.commit()
    return {"message": "Assignment removed"}


# ── Subject Department Head endpoints ─────────────────────────────────────────

@router.get("/subject-heads")
async def list_subject_heads(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict]:
    """List all active subject department head assignments."""
    _require_admin(current_user)
    result = await db.execute(
        select(SubjectDepartmentHead).where(SubjectDepartmentHead.is_active == True)
        .order_by(SubjectDepartmentHead.learning_area)
    )
    items = result.scalars().all()

    output = []
    for item in items:
        name = await _get_user_name(db, item.staff_user_id)
        output.append({
            "id": str(item.id),
            "learning_area": item.learning_area,
            "staff_user_id": str(item.staff_user_id),
            "staff_name": name,
            "academic_year": item.academic_year,
            "is_active": item.is_active,
            "created_at": item.created_at,
        })
    return output


@router.post("/subject-heads")
async def assign_subject_head(
    request: SubjectHeadCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """Assign a staff member as department head for a subject area."""
    _require_admin(current_user)

    try:
        staff_id = UUID(request.staff_user_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid staff_user_id")

    # Deactivate any existing assignment for this area + year
    existing = await db.execute(
        select(SubjectDepartmentHead).where(
            and_(
                SubjectDepartmentHead.learning_area == request.learning_area,
                SubjectDepartmentHead.academic_year == request.academic_year,
                SubjectDepartmentHead.is_active == True
            )
        )
    )
    for item in existing.scalars().all():
        item.is_active = False

    assignment = SubjectDepartmentHead(
        learning_area=request.learning_area,
        staff_user_id=staff_id,
        academic_year=request.academic_year,
        is_active=True
    )
    db.add(assignment)
    await db.commit()
    await db.refresh(assignment)

    name = await _get_user_name(db, staff_id)
    return {
        "id": str(assignment.id),
        "learning_area": assignment.learning_area,
        "staff_user_id": str(assignment.staff_user_id),
        "staff_name": name,
        "academic_year": assignment.academic_year,
        "message": "Subject department head assigned successfully"
    }


@router.delete("/subject-heads/{assignment_id}")
async def remove_subject_head(
    assignment_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """Deactivate a subject department head assignment."""
    _require_admin(current_user)

    try:
        aid = UUID(assignment_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid assignment ID")

    result = await db.execute(select(SubjectDepartmentHead).where(SubjectDepartmentHead.id == aid))
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")

    assignment.is_active = False
    await db.commit()
    return {"message": "Assignment removed"}


@router.get("/staff-users")
async def list_assignable_staff(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict]:
    """
    List staff and instructor users available for assignment.
    Used to populate the staff dropdown in the admin assignment UI.
    """
    _require_admin(current_user)
    result = await db.execute(
        select(User).where(User.role.in_(["staff", "instructor"]))
        .order_by(User.email)
    )
    users = result.scalars().all()

    return [
        {
            "id": str(u.id),
            "name": u.profile_data.get("full_name", u.email) if u.profile_data else u.email,
            "email": u.email,
            "role": u.role,
        }
        for u in users
    ]
