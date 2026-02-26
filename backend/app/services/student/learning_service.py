"""
Student Learning Service - Courses, Enrollments, Live Sessions, Browse

Provides student-facing learning operations including:
- Enrolled course listing with progress tracking
- AI-powered course recommendations based on grade level
- Course marketplace browsing with search, filtering, and sorting
- Wishlist management (add, remove, list)
- Upcoming live session retrieval
- AI-generated session preparation tips
- Detailed course preview data

All methods are async and use the student UUID for personalization.
"""
from datetime import datetime
from typing import Dict, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc
from uuid import UUID

from app.models.user import User
from app.models.student import Student
from app.models.course import Course
from app.models.enrollment import Enrollment, EnrollmentStatus
from app.models.student_dashboard import StudentWishlist, StudentSessionPrep
from app.services.ai_orchestrator import AIOrchestrator


class LearningService:
    """Service for student learning activities"""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.ai_orchestrator = AIOrchestrator()

    async def _get_instructor_name(self, instructor_id) -> str:
        """Resolve instructor UUID to display name from User profile_data"""
        if not instructor_id:
            return "Urban Home School"
        result = await self.db.execute(
            select(User).where(User.id == instructor_id)
        )
        user = result.scalar_one_or_none()
        if user and user.profile_data:
            return user.profile_data.get("full_name", user.email)
        return "Unknown Instructor"

    async def get_enrolled_courses(self, student_id: UUID) -> List[Dict]:
        """Get student's enrolled courses with progress"""
        result = await self.db.execute(
            select(Enrollment, Course)
            .join(Course, Enrollment.course_id == Course.id)
            .where(
                and_(
                    Enrollment.student_id == student_id,
                    Enrollment.is_deleted == False,
                    Course.is_deleted == False
                )
            )
            .order_by(desc(Enrollment.enrollment_date))
        )
        enrollments = result.all()

        courses_data = []
        for enrollment, course in enrollments:
            instructor_name = await self._get_instructor_name(course.instructor_id)
            courses_data.append({
                "enrollment_id": str(enrollment.id),
                "course_id": str(course.id),
                "course_title": course.title,
                "course_description": course.description,
                "instructor_name": instructor_name,
                "progress_percentage": enrollment.progress_percentage,
                "completed": enrollment.completed,
                "enrollment_date": enrollment.enrollment_date,
                "completion_date": enrollment.completion_date,
                "grade_levels": course.grade_levels,
                "learning_area": course.learning_area,
                "thumbnail_url": course.thumbnail_url
            })

        return courses_data

    async def get_ai_recommended_courses(self, student_id: UUID, limit: int = 10) -> List[Dict]:
        """Get AI-recommended courses based on student profile"""
        # Get student info
        student_result = await self.db.execute(
            select(Student).where(Student.id == student_id)
        )
        student = student_result.scalar_one_or_none()

        if not student:
            raise ValueError("Student not found")

        # Get student's current enrollments to exclude
        enrolled_result = await self.db.execute(
            select(Enrollment.course_id)
            .where(
                and_(
                    Enrollment.student_id == student_id,
                    Enrollment.is_deleted == False
                )
            )
        )
        enrolled_course_ids = [row[0] for row in enrolled_result.all()]

        # Get courses matching student's grade level (not enrolled)
        query = select(Course).where(
            and_(
                Course.is_deleted == False,
                Course.is_published == True,
                Course.grade_levels.contains([student.grade_level])
            )
        )

        # Exclude already enrolled courses
        if enrolled_course_ids:
            query = query.where(Course.id.notin_(enrolled_course_ids))

        result = await self.db.execute(query.limit(limit))
        courses = result.scalars().all()

        # Format courses
        recommended = []
        for course in courses:
            instructor_name = await self._get_instructor_name(course.instructor_id)
            recommended.append({
                "course_id": str(course.id),
                "title": course.title,
                "description": course.description,
                "instructor_name": instructor_name,
                "grade_levels": course.grade_levels,
                "learning_area": course.learning_area,
                "average_rating": float(course.average_rating),
                "enrollment_count": course.enrollment_count,
                "thumbnail_url": course.thumbnail_url,
                "price": float(course.price) if course.price else 0.0,
                "ai_match_score": 85  # Placeholder - would use ML model
            })

        return recommended

    async def browse_courses(
        self,
        student_id: UUID,
        search: Optional[str] = None,
        subject: Optional[str] = None,
        sort_by: str = "popular",
        limit: int = 20,
        offset: int = 0
    ) -> Dict:
        """Browse course marketplace filtered to student's grade level"""
        # Fetch student to get their grade level
        student_result = await self.db.execute(
            select(Student).where(Student.id == student_id)
        )
        student = student_result.scalar_one_or_none()
        if not student:
            raise ValueError("Student not found")

        # Base query: published, not deleted, matches student's grade
        query = select(Course).where(
            and_(
                Course.is_deleted == False,
                Course.is_published == True,
                Course.grade_levels.contains([student.grade_level])
            )
        )

        # Exclude teacher/instructor-only courses (Teacher's Guide, Diploma)
        teacher_labels = ["Teacher's Guide", "Diploma"]
        for label in teacher_labels:
            query = query.where(~Course.grade_levels.any(label))

        # Search filter
        if search:
            query = query.where(
                or_(
                    Course.title.ilike(f"%{search}%"),
                    Course.description.ilike(f"%{search}%")
                )
            )

        # Subject filter
        if subject:
            query = query.where(Course.learning_area == subject)

        # Sorting
        if sort_by == "popular":
            query = query.order_by(desc(Course.enrollment_count))
        elif sort_by == "rating":
            query = query.order_by(desc(Course.average_rating))
        elif sort_by == "newest":
            query = query.order_by(desc(Course.created_at))
        elif sort_by == "price_low":
            query = query.order_by(Course.price.asc())
        elif sort_by == "price_high":
            query = query.order_by(Course.price.desc())

        # Total count before pagination
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total_courses = total_result.scalar()

        # Paginate
        query = query.limit(limit).offset(offset)
        result = await self.db.execute(query)
        courses = result.scalars().all()

        courses_list = []
        for course in courses:
            instructor_name = await self._get_instructor_name(course.instructor_id)
            courses_list.append({
                "course_id": str(course.id),
                "title": course.title,
                "description": course.description,
                "instructor_name": instructor_name,
                "grade_levels": course.grade_levels,
                "learning_area": course.learning_area,
                "average_rating": float(course.average_rating),
                "enrollment_count": course.enrollment_count,
                "thumbnail_url": course.thumbnail_url,
                "price": float(course.price) if course.price else 0.0
            })

        return {
            "courses": courses_list,
            "total": total_courses,
            "limit": limit,
            "offset": offset,
            "student_grade": student.grade_level
        }

    async def get_wishlist_ids(self, student_id: UUID) -> list:
        """Get just the course UUIDs in the student's wishlist (for fast heart icon state)"""
        result = await self.db.execute(
            select(StudentWishlist.course_id)
            .where(StudentWishlist.student_id == student_id)
        )
        return [str(row[0]) for row in result.all()]

    async def add_to_wishlist(self, student_id: UUID, course_id: UUID) -> StudentWishlist:
        """Add course to student's wishlist — only if the course matches the student's grade"""
        # Fetch student to validate grade
        student_result = await self.db.execute(
            select(Student).where(Student.id == student_id)
        )
        student = student_result.scalar_one_or_none()
        if not student:
            raise ValueError("Student not found")

        # Fetch course to validate grade match
        course_result = await self.db.execute(
            select(Course).where(Course.id == course_id)
        )
        course = course_result.scalar_one_or_none()
        if not course:
            raise ValueError("Course not found")

        if student.grade_level not in (course.grade_levels or []):
            raise ValueError(
                f"This course is not available for your grade ({student.grade_level}). "
                "You can only add courses from your grade to your wishlist."
            )

        # Check if already in wishlist
        existing = await self.db.execute(
            select(StudentWishlist).where(
                and_(
                    StudentWishlist.student_id == student_id,
                    StudentWishlist.course_id == course_id
                )
            )
        )
        if existing.scalar_one_or_none():
            raise ValueError("Course already in wishlist")

        wishlist_item = StudentWishlist(
            student_id=student_id,
            course_id=course_id
        )

        self.db.add(wishlist_item)
        await self.db.commit()
        await self.db.refresh(wishlist_item)

        return wishlist_item

    async def remove_from_wishlist(self, student_id: UUID, course_id: UUID) -> bool:
        """Remove course from wishlist"""
        result = await self.db.execute(
            select(StudentWishlist).where(
                and_(
                    StudentWishlist.student_id == student_id,
                    StudentWishlist.course_id == course_id
                )
            )
        )
        wishlist_item = result.scalar_one_or_none()

        if not wishlist_item:
            return False

        await self.db.delete(wishlist_item)
        await self.db.commit()

        return True

    async def get_wishlist(self, student_id: UUID) -> List[Dict]:
        """Get student's wishlist"""
        result = await self.db.execute(
            select(StudentWishlist, Course)
            .join(Course, StudentWishlist.course_id == Course.id)
            .where(StudentWishlist.student_id == student_id)
            .order_by(desc(StudentWishlist.added_at))
        )
        items = result.all()

        wishlist = []
        for wishlist_item, course in items:
            instructor_name = await self._get_instructor_name(course.instructor_id)
            wishlist.append({
                "wishlist_id": str(wishlist_item.id),
                "course_id": str(course.id),
                "course_title": course.title,
                "course_description": course.description,
                "instructor_name": instructor_name,
                "grade_levels": course.grade_levels,
                "price": float(course.price) if course.price else 0.0,
                "thumbnail_url": course.thumbnail_url,
                "added_at": wishlist_item.added_at
            })

        return wishlist

    async def get_upcoming_live_sessions(self, student_id: UUID) -> List[Dict]:
        """Get student's upcoming live sessions"""
        # Get student's enrolled courses
        enrolled_result = await self.db.execute(
            select(Enrollment.course_id)
            .where(
                and_(
                    Enrollment.student_id == student_id,
                    Enrollment.is_deleted == False
                )
            )
        )
        enrolled_course_ids = [row[0] for row in enrolled_result.all()]

        # Placeholder for live sessions (would query LiveSession model)
        # For now, return empty list
        sessions = []

        return sessions

    async def generate_session_prep(
        self,
        student_id: UUID,
        session_id: UUID
    ) -> StudentSessionPrep:
        """Generate AI session prep tips"""
        # Get student info
        student_result = await self.db.execute(
            select(Student).where(Student.id == student_id)
        )
        student = student_result.scalar_one_or_none()

        if not student:
            raise ValueError("Student not found")

        # Generate AI tips
        prompt = f"""Generate 3-5 preparation tips for a grade {student.grade_level} student
attending an upcoming live learning session. Include:
- What to have ready
- Key questions to think about
- How to make the most of the session"""

        ai_response = await self.ai_orchestrator.chat(
            message=prompt,
            system_message="You are a helpful learning coach preparing students for live sessions.",
            task_type="general"
        )

        # Create session prep record
        prep = StudentSessionPrep(
            session_id=session_id,
            student_id=student_id,
            tips={"ai_tips": ai_response["message"]},
            engagement_prediction=75  # Placeholder
        )

        self.db.add(prep)
        await self.db.commit()
        await self.db.refresh(prep)

        return prep

    async def get_course_preview(self, course_id: UUID) -> Dict:
        """Get detailed course preview"""
        result = await self.db.execute(
            select(Course).where(Course.id == course_id)
        )
        course = result.scalar_one_or_none()

        if not course:
            raise ValueError("Course not found")

        instructor_name = await self._get_instructor_name(course.instructor_id)

        return {
            "course_id": str(course.id),
            "title": course.title,
            "description": course.description,
            "instructor_name": instructor_name,
            "grade_levels": course.grade_levels,
            "learning_area": course.learning_area,
            "average_rating": float(course.average_rating),
            "enrollment_count": course.enrollment_count,
            "thumbnail_url": course.thumbnail_url,
            "price": float(course.price) if course.price else 0.0,
            "created_at": course.created_at,
            "is_published": course.is_published
        }
