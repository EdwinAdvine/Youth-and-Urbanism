"""
Parent-Student Linking API Endpoints

Allows parents to link to students, view their children's progress,
courses, and manage the parent-student relationship.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.utils.security import get_current_user
from app.services import parent_service
from app.schemas.parent_schemas import (
    LinkStudentRequest,
    ChildSummary,
    ChildProgressResponse,
    ParentChildrenResponse,
)


router = APIRouter(prefix="/parents", tags=["Parents"])


def _require_parent(user: User) -> None:
    """Raise 403 if user is not a parent."""
    if user.role != "parent":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This endpoint is only accessible to parents",
        )


@router.post(
    "/link-student",
    response_model=ChildSummary,
    status_code=status.HTTP_200_OK,
    summary="Link a student to this parent",
    description="Link a student account to the current parent using the student's admission number.",
)
async def link_student(
    data: LinkStudentRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ChildSummary:
    _require_parent(current_user)

    student = await parent_service.link_student_to_parent(
        parent_id=current_user.id,
        admission_number=data.admission_number,
        db=db,
    )

    # Build response
    from sqlalchemy import select
    from app.models.user import User as UserModel
    user_result = await db.execute(
        select(UserModel).where(UserModel.id == student.user_id)
    )
    user = user_result.scalars().first()
    full_name = (user.profile_data or {}).get("full_name") if user else None

    return ChildSummary(
        student_id=student.id,
        user_id=student.user_id,
        admission_number=student.admission_number,
        full_name=full_name,
        grade_level=student.grade_level,
        is_active=student.is_active,
        enrollment_date=student.enrollment_date,
    )


@router.delete(
    "/unlink-student/{student_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Unlink a student from this parent",
)
async def unlink_student(
    student_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    _require_parent(current_user)

    await parent_service.unlink_student_from_parent(
        parent_id=current_user.id,
        student_id=student_id,
        db=db,
    )


@router.get(
    "/children",
    response_model=ParentChildrenResponse,
    status_code=status.HTTP_200_OK,
    summary="List linked children",
    description="Get all students linked to the current parent.",
)
async def list_children(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ParentChildrenResponse:
    _require_parent(current_user)

    children = await parent_service.get_children(
        parent_id=current_user.id,
        db=db,
    )

    return ParentChildrenResponse(
        children=[ChildSummary(**c) for c in children],
        total=len(children),
    )


@router.get(
    "/children/{student_id}/progress",
    response_model=ChildProgressResponse,
    status_code=status.HTTP_200_OK,
    summary="Get child's learning progress",
    description="Get detailed learning progress, competencies, and course enrollment for a linked child.",
)
async def get_child_progress(
    student_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ChildProgressResponse:
    _require_parent(current_user)

    progress = await parent_service.get_child_progress(
        parent_id=current_user.id,
        student_id=student_id,
        db=db,
    )

    return ChildProgressResponse(**progress)
