"""
Family Service — Phase 3 (People & Access)

Manages parent-child family linking, enrollment approvals,
and consent queue for the admin dashboard.
"""

import logging
from typing import Any, Dict, List, Optional
from uuid import UUID

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.student import Student
from app.models.enrollment import Enrollment

logger = logging.getLogger(__name__)


class FamilyService:

    @staticmethod
    async def list_families(
        db: AsyncSession, page: int = 1, page_size: int = 20, search: Optional[str] = None
    ) -> Dict[str, Any]:
        """List parent users with their linked children."""
        q = select(User).where(and_(User.role == "parent", User.is_deleted == False))
        if search:
            q = q.where(
                User.full_name.ilike(f"%{search}%") | User.email.ilike(f"%{search}%")
            )

        # Count
        count_q = select(func.count()).select_from(q.subquery())
        total = (await db.execute(count_q)).scalar() or 0

        # Paginate
        q = q.order_by(User.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        result = await db.execute(q)
        parents = result.scalars().all()

        items = []
        for parent in parents:
            # Get linked children
            children_q = select(Student).where(Student.parent_id == parent.id)
            children_result = await db.execute(children_q)
            children = children_result.scalars().all()

            items.append({
                "parent_id": str(parent.id),
                "parent_name": parent.full_name,
                "parent_email": parent.email,
                "children_count": len(children),
                "children": [
                    {
                        "id": str(c.id),
                        "name": c.full_name if hasattr(c, 'full_name') else str(c.id),
                        "grade_level": c.grade_level,
                        "admission_number": c.admission_number,
                    }
                    for c in children
                ],
                "created_at": parent.created_at.isoformat() if parent.created_at else None,
            })

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size,
        }

    @staticmethod
    async def get_pending_enrollments(
        db: AsyncSession, page: int = 1, page_size: int = 20
    ) -> Dict[str, Any]:
        """List enrollments pending admin approval."""
        q = select(Enrollment).where(
            and_(Enrollment.is_deleted == False, Enrollment.status == "pending_payment")
        )

        count_q = select(func.count()).select_from(q.subquery())
        total = (await db.execute(count_q)).scalar() or 0

        q = q.order_by(Enrollment.enrolled_at.desc()).offset((page - 1) * page_size).limit(page_size)
        result = await db.execute(q)
        enrollments = result.scalars().all()

        items = [
            {
                "id": str(e.id),
                "student_id": str(e.student_id),
                "course_id": str(e.course_id),
                "status": e.status,
                "enrolled_at": e.enrolled_at.isoformat() if e.enrolled_at else None,
            }
            for e in enrollments
        ]

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size,
        }

    @staticmethod
    async def approve_enrollment(db: AsyncSession, enrollment_id: UUID) -> Dict[str, Any]:
        """Approve a pending enrollment."""
        q = select(Enrollment).where(Enrollment.id == enrollment_id)
        result = await db.execute(q)
        enrollment = result.scalar_one_or_none()
        if not enrollment:
            return {"success": False, "message": "Enrollment not found"}

        enrollment.status = "active"
        await db.commit()
        return {"success": True, "message": "Enrollment approved", "id": str(enrollment.id)}

    @staticmethod
    async def reject_enrollment(db: AsyncSession, enrollment_id: UUID, reason: str = "") -> Dict[str, Any]:
        """Reject a pending enrollment."""
        q = select(Enrollment).where(Enrollment.id == enrollment_id)
        result = await db.execute(q)
        enrollment = result.scalar_one_or_none()
        if not enrollment:
            return {"success": False, "message": "Enrollment not found"}

        enrollment.status = "cancelled"
        await db.commit()
        return {"success": True, "message": "Enrollment rejected", "id": str(enrollment.id)}
