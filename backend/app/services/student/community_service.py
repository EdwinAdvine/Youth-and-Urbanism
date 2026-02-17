"""
Student Community Service - Friends, Study Groups, Shoutouts, Teacher Q&A
"""
from datetime import datetime
from typing import Dict, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, desc
from sqlalchemy.orm import aliased
from uuid import UUID

from app.models.student import Student
from app.models.user import User
from app.models.student_community import (
    StudentFriendship,
    FriendshipStatus,
    StudentStudyGroup,
    StudentShoutout,
    ShoutoutCategory,
    StudentTeacherQA
)


def _get_user_name(user: User) -> str:
    """Extract display name from User profile_data JSONB"""
    if user and user.profile_data:
        return user.profile_data.get("full_name", user.email)
    return "Unknown"


class CommunityService:
    """Service for student community features"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def send_friend_request(self, from_student_id: UUID, to_student_id: UUID) -> StudentFriendship:
        """Send a friend request"""
        # Check if friendship already exists
        existing = await self.db.execute(
            select(StudentFriendship).where(
                or_(
                    and_(
                        StudentFriendship.student_id == from_student_id,
                        StudentFriendship.friend_id == to_student_id
                    ),
                    and_(
                        StudentFriendship.student_id == to_student_id,
                        StudentFriendship.friend_id == from_student_id
                    )
                )
            )
        )
        if existing.scalar_one_or_none():
            raise ValueError("Friendship already exists")

        # Create friend request
        friendship = StudentFriendship(
            student_id=from_student_id,
            friend_id=to_student_id,
            status=FriendshipStatus.PENDING
        )

        self.db.add(friendship)
        await self.db.commit()
        await self.db.refresh(friendship)

        return friendship

    async def accept_friend_request(self, student_id: UUID, friendship_id: UUID) -> StudentFriendship:
        """Accept a friend request"""
        result = await self.db.execute(
            select(StudentFriendship).where(
                and_(
                    StudentFriendship.id == friendship_id,
                    StudentFriendship.friend_id == student_id,
                    StudentFriendship.status == FriendshipStatus.PENDING
                )
            )
        )
        friendship = result.scalar_one_or_none()

        if not friendship:
            raise ValueError("Friend request not found")

        friendship.status = FriendshipStatus.ACCEPTED
        await self.db.commit()
        await self.db.refresh(friendship)

        return friendship

    async def get_friends(self, student_id: UUID) -> List[Dict]:
        """Get student's friends"""
        result = await self.db.execute(
            select(StudentFriendship, Student, User)
            .join(
                Student,
                or_(
                    and_(
                        StudentFriendship.student_id == student_id,
                        StudentFriendship.friend_id == Student.id
                    ),
                    and_(
                        StudentFriendship.friend_id == student_id,
                        StudentFriendship.student_id == Student.id
                    )
                )
            )
            .join(User, Student.user_id == User.id)
            .where(
                and_(
                    or_(
                        StudentFriendship.student_id == student_id,
                        StudentFriendship.friend_id == student_id
                    ),
                    StudentFriendship.status == FriendshipStatus.ACCEPTED
                )
            )
        )
        friendships = result.all()

        friends = []
        for friendship, friend_student, friend_user in friendships:
            friends.append({
                "friendship_id": str(friendship.id),
                "friend_id": str(friend_student.id),
                "friend_name": _get_user_name(friend_user),
                "friend_email": friend_user.email,
                "grade_level": friend_student.grade_level,
                "since": friendship.created_at
            })

        return friends

    async def get_friend_requests(self, student_id: UUID) -> List[Dict]:
        """Get pending friend requests"""
        result = await self.db.execute(
            select(StudentFriendship, Student, User)
            .join(Student, StudentFriendship.student_id == Student.id)
            .join(User, Student.user_id == User.id)
            .where(
                and_(
                    StudentFriendship.friend_id == student_id,
                    StudentFriendship.status == FriendshipStatus.PENDING
                )
            )
        )
        requests = result.all()

        friend_requests = []
        for friendship, requester_student, requester_user in requests:
            friend_requests.append({
                "friendship_id": str(friendship.id),
                "requester_id": str(requester_student.id),
                "requester_name": _get_user_name(requester_user),
                "grade_level": requester_student.grade_level,
                "requested_at": friendship.created_at
            })

        return friend_requests

    async def create_study_group(
        self,
        student_id: UUID,
        name: str,
        description: Optional[str],
        subject: Optional[str],
        max_members: int = 10
    ) -> StudentStudyGroup:
        """Create a study group"""
        group = StudentStudyGroup(
            name=name,
            description=description,
            subject=subject,
            created_by=student_id,
            max_members=max_members,
            members=[str(student_id)],  # Creator is first member
            is_public=True
        )

        self.db.add(group)
        await self.db.commit()
        await self.db.refresh(group)

        return group

    async def join_study_group(self, student_id: UUID, group_id: UUID) -> StudentStudyGroup:
        """Join a study group"""
        result = await self.db.execute(
            select(StudentStudyGroup).where(StudentStudyGroup.id == group_id)
        )
        group = result.scalar_one_or_none()

        if not group:
            raise ValueError("Study group not found")

        # Check if already a member
        if str(student_id) in (group.members or []):
            raise ValueError("Already a member of this group")

        # Check if group is full
        if len(group.members or []) >= group.max_members:
            raise ValueError("Study group is full")

        # Add student to members
        current_members = group.members or []
        current_members.append(str(student_id))
        group.members = current_members

        await self.db.commit()
        await self.db.refresh(group)

        return group

    async def get_study_groups(self, student_id: UUID) -> List[Dict]:
        """Get student's study groups"""
        result = await self.db.execute(
            select(StudentStudyGroup).where(
                StudentStudyGroup.members.contains([str(student_id)])
            )
        )
        groups = result.scalars().all()

        study_groups = []
        for group in groups:
            study_groups.append({
                "group_id": str(group.id),
                "name": group.name,
                "description": group.description,
                "subject": group.subject,
                "member_count": len(group.members or []),
                "max_members": group.max_members,
                "is_creator": str(group.created_by) == str(student_id),
                "created_at": group.created_at
            })

        return study_groups

    async def send_shoutout(
        self,
        from_student_id: UUID,
        to_student_id: UUID,
        message: str,
        category: ShoutoutCategory,
        is_anonymous: bool = False
    ) -> StudentShoutout:
        """Send a shoutout to another student"""
        shoutout = StudentShoutout(
            from_student_id=from_student_id,
            to_student_id=to_student_id,
            message=message,
            category=category,
            is_anonymous=is_anonymous,
            is_public=True
        )

        self.db.add(shoutout)
        await self.db.commit()
        await self.db.refresh(shoutout)

        return shoutout

    async def get_shoutouts_received(self, student_id: UUID, limit: int = 20) -> List[Dict]:
        """Get shoutouts received by student"""
        result = await self.db.execute(
            select(StudentShoutout, Student, User)
            .join(Student, StudentShoutout.from_student_id == Student.id)
            .join(User, Student.user_id == User.id)
            .where(StudentShoutout.to_student_id == student_id)
            .order_by(desc(StudentShoutout.created_at))
            .limit(limit)
        )
        shoutouts = result.all()

        shoutouts_data = []
        for shoutout, from_student, from_user in shoutouts:
            shoutouts_data.append({
                "shoutout_id": str(shoutout.id),
                "from_student_id": str(shoutout.from_student_id) if not shoutout.is_anonymous else None,
                "from_student_name": _get_user_name(from_user) if not shoutout.is_anonymous else "Anonymous",
                "message": shoutout.message,
                "category": shoutout.category.value,
                "is_anonymous": shoutout.is_anonymous,
                "created_at": shoutout.created_at
            })

        return shoutouts_data

    async def get_class_wall(self, student_id: UUID, limit: int = 50) -> List[Dict]:
        """Get public shoutouts for class wall"""
        # Get student's grade to show same-grade shoutouts
        student_result = await self.db.execute(
            select(Student).where(Student.id == student_id)
        )
        student = student_result.scalar_one_or_none()

        if not student:
            raise ValueError("Student not found")

        # Use aliased models to avoid ambiguous join
        FromStudent = aliased(Student)
        ToStudent = aliased(Student)
        FromUser = aliased(User)
        ToUser = aliased(User)

        result = await self.db.execute(
            select(StudentShoutout, FromStudent, ToStudent, FromUser, ToUser)
            .join(FromStudent, StudentShoutout.from_student_id == FromStudent.id, isouter=True)
            .join(ToStudent, StudentShoutout.to_student_id == ToStudent.id, isouter=True)
            .join(FromUser, FromStudent.user_id == FromUser.id, isouter=True)
            .join(ToUser, ToStudent.user_id == ToUser.id, isouter=True)
            .where(StudentShoutout.is_public == True)
            .order_by(desc(StudentShoutout.created_at))
            .limit(limit)
        )
        shoutouts = result.all()

        wall_data = []
        for shoutout, from_student, to_student, from_user, to_user in shoutouts:
            wall_data.append({
                "shoutout_id": str(shoutout.id),
                "from_name": _get_user_name(from_user) if from_user and not shoutout.is_anonymous else "Anonymous",
                "to_name": _get_user_name(to_user) if to_user else "Unknown",
                "message": shoutout.message,
                "category": shoutout.category.value,
                "created_at": shoutout.created_at
            })

        return wall_data

    async def get_teacher_qa_threads(self, student_id: UUID) -> List[Dict]:
        """Get student's teacher Q&A threads"""
        result = await self.db.execute(
            select(StudentTeacherQA, User)
            .join(User, StudentTeacherQA.teacher_id == User.id, isouter=True)
            .where(StudentTeacherQA.student_id == student_id)
            .order_by(desc(StudentTeacherQA.created_at))
        )
        qa_threads = result.all()

        threads = []
        for qa, teacher in qa_threads:
            threads.append({
                "qa_id": str(qa.id),
                "question": qa.question,
                "ai_summary": qa.ai_summary,
                "answer": qa.answer,
                "is_answered": qa.is_answered,
                "teacher_name": _get_user_name(teacher) if teacher else "Teacher",
                "created_at": qa.created_at,
                "answered_at": qa.answered_at
            })

        return threads
