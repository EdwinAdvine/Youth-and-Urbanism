"""
Student Learning API Routes - Courses, Enrollments, Live Sessions
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, List, Optional
from uuid import UUID
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User
from app.services.student.learning_service import LearningService
from app.utils.security import get_current_user


router = APIRouter(prefix="/student/learning", tags=["Student Learning"])


# Pydantic schemas
class WishlistRequest(BaseModel):
    course_id: str


# API Endpoints
@router.get("/courses/enrolled")
async def get_enrolled_courses(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict]:
    """
    Get student's enrolled courses with progress
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )

    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    service = LearningService(db)

    try:
        courses = await service.get_enrolled_courses(current_user.student_id)
        return courses
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch enrolled courses: {str(e)}"
        )


@router.get("/courses/recommended")
async def get_ai_recommended_courses(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict]:
    """
    Get AI-recommended courses based on student profile

    Query params:
    - limit: Number of recommendations (default: 10)
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )

    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    service = LearningService(db)

    try:
        courses = await service.get_ai_recommended_courses(
            student_id=current_user.student_id,
            limit=limit
        )
        return courses
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get recommendations: {str(e)}"
        )


@router.get("/browse")
async def browse_courses(
    search: Optional[str] = None,
    grade_level: Optional[int] = None,
    subject: Optional[str] = None,
    sort_by: str = "popular",
    limit: int = 20,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Browse course marketplace with filters

    Query params:
    - search: Search query
    - grade_level: Filter by grade level
    - subject: Filter by subject/learning area
    - sort_by: Sort method (popular, rating, newest, price_low, price_high)
    - limit: Results per page (default: 20)
    - offset: Pagination offset (default: 0)
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )

    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    if sort_by not in ["popular", "rating", "newest", "price_low", "price_high"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid sort_by parameter"
        )

    service = LearningService(db)

    try:
        result = await service.browse_courses(
            student_id=current_user.student_id,
            search=search,
            grade_level=grade_level,
            subject=subject,
            sort_by=sort_by,
            limit=limit,
            offset=offset
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to browse courses: {str(e)}"
        )


@router.get("/course/{course_id}/preview")
async def get_course_preview(
    course_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Get detailed course preview
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )

    service = LearningService(db)

    try:
        course_uuid = UUID(course_id)
        preview = await service.get_course_preview(course_uuid)
        return preview
    except ValueError as e:
        if "badly formed hexadecimal UUID string" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid course ID format"
            )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get course preview: {str(e)}"
        )


@router.get("/wishlist")
async def get_wishlist(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict]:
    """
    Get student's course wishlist
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )

    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    service = LearningService(db)

    try:
        wishlist = await service.get_wishlist(current_user.student_id)
        return wishlist
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch wishlist: {str(e)}"
        )


@router.post("/wishlist")
async def add_to_wishlist(
    request: WishlistRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Add course to wishlist

    Body:
    - course_id: Course UUID
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can add to wishlist"
        )

    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    service = LearningService(db)

    try:
        course_uuid = UUID(request.course_id)
        wishlist_item = await service.add_to_wishlist(
            student_id=current_user.student_id,
            course_id=course_uuid
        )

        return {
            "id": str(wishlist_item.id),
            "course_id": str(wishlist_item.course_id),
            "added_at": wishlist_item.added_at,
            "message": "Course added to wishlist"
        }
    except ValueError as e:
        if "badly formed hexadecimal UUID string" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid course ID format"
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add to wishlist: {str(e)}"
        )


@router.delete("/wishlist/{course_id}")
async def remove_from_wishlist(
    course_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Remove course from wishlist
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can modify wishlist"
        )

    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    service = LearningService(db)

    try:
        course_uuid = UUID(course_id)
        removed = await service.remove_from_wishlist(
            student_id=current_user.student_id,
            course_id=course_uuid
        )

        if not removed:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found in wishlist"
            )

        return {"message": "Course removed from wishlist"}
    except ValueError as e:
        if "badly formed hexadecimal UUID string" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid course ID format"
            )
        raise
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to remove from wishlist: {str(e)}"
        )


@router.get("/live-sessions/upcoming")
async def get_upcoming_live_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict]:
    """
    Get student's upcoming live sessions
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )

    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    service = LearningService(db)

    try:
        sessions = await service.get_upcoming_live_sessions(current_user.student_id)
        return sessions
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch live sessions: {str(e)}"
        )


@router.get("/session/{session_id}/prep")
async def get_session_prep(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Get AI-generated session preparation tips
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access this endpoint"
        )

    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    service = LearningService(db)

    try:
        session_uuid = UUID(session_id)
        prep = await service.generate_session_prep(
            student_id=current_user.student_id,
            session_id=session_uuid
        )

        return {
            "id": str(prep.id),
            "session_id": str(prep.session_id),
            "tips": prep.tips,
            "engagement_prediction": prep.engagement_prediction,
            "created_at": prep.created_at
        }
    except ValueError as e:
        if "badly formed hexadecimal UUID string" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid session ID format"
            )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate session prep: {str(e)}"
        )
