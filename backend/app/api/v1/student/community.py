"""
Student Community API Routes - Friends, Study Groups, Shoutouts, Teacher Q&A
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, List, Optional
from uuid import UUID
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User
from app.models.student_community import ShoutoutCategory
from app.services.student.community_service import CommunityService
from app.utils.security import get_current_user


router = APIRouter(prefix="/student/community", tags=["Student Community"])


# Pydantic schemas
class FriendRequestRequest(BaseModel):
    friend_id: str


class CreateStudyGroupRequest(BaseModel):
    name: str
    description: Optional[str] = None
    subject: Optional[str] = None
    max_members: int = 10


class SendShoutoutRequest(BaseModel):
    to_student_id: str
    message: str
    category: ShoutoutCategory
    is_anonymous: bool = False


# API Endpoints
@router.post("/friends/request")
async def send_friend_request(
    request: FriendRequestRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Send a friend request

    Body:
    - friend_id: Student ID to send request to
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can send friend requests"
        )

    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    service = CommunityService(db)

    try:
        friend_uuid = UUID(request.friend_id)
        friendship = await service.send_friend_request(
            from_student_id=current_user.student_id,
            to_student_id=friend_uuid
        )

        return {
            "friendship_id": str(friendship.id),
            "status": friendship.status.value,
            "created_at": friendship.created_at,
            "message": "Friend request sent"
        }
    except ValueError as e:
        if "badly formed hexadecimal UUID string" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid friend ID format"
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send friend request: {str(e)}"
        )


@router.post("/friends/accept/{friendship_id}")
async def accept_friend_request(
    friendship_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Accept a friend request
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can accept friend requests"
        )

    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    service = CommunityService(db)

    try:
        friendship_uuid = UUID(friendship_id)
        friendship = await service.accept_friend_request(
            student_id=current_user.student_id,
            friendship_id=friendship_uuid
        )

        return {
            "friendship_id": str(friendship.id),
            "status": friendship.status.value,
            "message": "Friend request accepted"
        }
    except ValueError as e:
        if "badly formed hexadecimal UUID string" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid friendship ID format"
            )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to accept friend request: {str(e)}"
        )


@router.get("/friends")
async def get_friends(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict]:
    """
    Get student's friends
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

    service = CommunityService(db)

    try:
        friends = await service.get_friends(current_user.student_id)
        return friends
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch friends: {str(e)}"
        )


@router.get("/friends/requests")
async def get_friend_requests(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict]:
    """
    Get pending friend requests
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

    service = CommunityService(db)

    try:
        requests = await service.get_friend_requests(current_user.student_id)
        return requests
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch friend requests: {str(e)}"
        )


@router.post("/study-groups")
async def create_study_group(
    request: CreateStudyGroupRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Create a study group

    Body:
    - name: Group name
    - description: Optional description
    - subject: Optional subject
    - max_members: Maximum members (default: 10)
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can create study groups"
        )

    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    service = CommunityService(db)

    try:
        group = await service.create_study_group(
            student_id=current_user.student_id,
            name=request.name,
            description=request.description,
            subject=request.subject,
            max_members=request.max_members
        )

        return {
            "group_id": str(group.id),
            "name": group.name,
            "description": group.description,
            "subject": group.subject,
            "member_count": len(group.members or []),
            "max_members": group.max_members,
            "created_at": group.created_at,
            "message": "Study group created successfully"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create study group: {str(e)}"
        )


@router.post("/study-groups/{group_id}/join")
async def join_study_group(
    group_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Join a study group
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can join study groups"
        )

    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    service = CommunityService(db)

    try:
        group_uuid = UUID(group_id)
        group = await service.join_study_group(
            student_id=current_user.student_id,
            group_id=group_uuid
        )

        return {
            "group_id": str(group.id),
            "member_count": len(group.members or []),
            "message": "Joined study group successfully"
        }
    except ValueError as e:
        if "badly formed hexadecimal UUID string" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid group ID format"
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to join study group: {str(e)}"
        )


@router.get("/study-groups")
async def get_study_groups(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict]:
    """
    Get student's study groups
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

    service = CommunityService(db)

    try:
        groups = await service.get_study_groups(current_user.student_id)
        return groups
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch study groups: {str(e)}"
        )


@router.post("/shoutouts")
async def send_shoutout(
    request: SendShoutoutRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Dict:
    """
    Send a shoutout to another student

    Body:
    - to_student_id: Recipient student ID
    - message: Shoutout message
    - category: encouragement | help | achievement | thanks | other
    - is_anonymous: Whether to send anonymously (default: false)
    """
    if current_user.role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can send shoutouts"
        )

    if not current_user.student_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student profile not found"
        )

    service = CommunityService(db)

    try:
        to_student_uuid = UUID(request.to_student_id)
        shoutout = await service.send_shoutout(
            from_student_id=current_user.student_id,
            to_student_id=to_student_uuid,
            message=request.message,
            category=request.category,
            is_anonymous=request.is_anonymous
        )

        return {
            "shoutout_id": str(shoutout.id),
            "created_at": shoutout.created_at,
            "message": "Shoutout sent successfully"
        }
    except ValueError as e:
        if "badly formed hexadecimal UUID string" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid student ID format"
            )
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send shoutout: {str(e)}"
        )


@router.get("/shoutouts/received")
async def get_shoutouts_received(
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict]:
    """
    Get shoutouts received by student
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

    service = CommunityService(db)

    try:
        shoutouts = await service.get_shoutouts_received(current_user.student_id, limit)
        return shoutouts
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch shoutouts: {str(e)}"
        )


@router.get("/class-wall")
async def get_class_wall(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict]:
    """
    Get public shoutouts for class wall
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

    service = CommunityService(db)

    try:
        wall_posts = await service.get_class_wall(current_user.student_id, limit)
        return wall_posts
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch class wall: {str(e)}"
        )


@router.get("/teacher-qa")
async def get_teacher_qa_threads(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> List[Dict]:
    """
    Get teacher Q&A threads
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

    service = CommunityService(db)

    try:
        threads = await service.get_teacher_qa_threads(current_user.student_id)
        return threads
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch Q&A threads: {str(e)}"
        )
