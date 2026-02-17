"""
Forum API Endpoints

Community discussion features with posts, replies, likes,
and moderation (pin, solve, flag). Categories aligned with CBC curriculum.
"""

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.utils.security import get_current_user
from app.services import forum_service
from app.schemas.forum_schemas import (
    ForumPostCreate,
    ForumPostUpdate,
    ForumReplyCreate,
    ForumReplyUpdate,
    ForumPostResponse,
    ForumPostListResponse,
    ForumPostDetailResponse,
    ForumReplyResponse,
    AuthorInfo,
    ForumPostStats,
)


router = APIRouter(prefix="/forum", tags=["Forum"])


# ============================================================================
# Posts
# ============================================================================

@router.get(
    "/posts",
    response_model=ForumPostListResponse,
    status_code=status.HTTP_200_OK,
    summary="List forum posts",
    description="Get paginated forum posts with optional category filter, search, and sort.",
)
async def list_posts(
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search in title and content"),
    sort: str = Query("latest", pattern="^(latest|popular|unanswered)$"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ForumPostListResponse:
    """List forum posts with optional filtering by category, search text, and sort order."""
    data = await forum_service.get_posts(
        db=db,
        current_user_id=current_user.id,
        category=category,
        search=search,
        sort=sort,
        page=page,
        limit=limit,
    )

    posts = [
        ForumPostResponse(
            **{k: v for k, v in p.items()},
            author=AuthorInfo(**p["author"]),
            stats=ForumPostStats(**p["stats"]),
        )
        for p in data["posts"]
    ]

    return ForumPostListResponse(
        posts=posts,
        total=data["total"],
        page=data["page"],
        limit=data["limit"],
    )


@router.post(
    "/posts",
    response_model=ForumPostResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a forum post",
)
async def create_post(
    data: ForumPostCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ForumPostResponse:
    """Create a new forum post in the given category with optional tags."""
    post = await forum_service.create_post(
        db=db,
        author_id=current_user.id,
        title=data.title,
        content=data.content,
        category=data.category,
        tags=data.tags,
    )
    await db.commit()

    author = await forum_service._get_author_info(db, current_user.id)

    return ForumPostResponse(
        id=post.id,
        title=post.title,
        content=post.content,
        excerpt=post.content[:150] + "..." if len(post.content) > 150 else post.content,
        category=post.category,
        tags=post.tags or [],
        author=AuthorInfo(**author),
        stats=ForumPostStats(views=0, replies=0, likes=0),
        is_pinned=False,
        is_solved=False,
        liked_by_me=False,
        created_at=post.created_at,
        updated_at=post.updated_at,
        last_activity_at=post.last_activity_at,
    )


@router.get(
    "/posts/{post_id}",
    response_model=ForumPostDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Get a forum post with replies",
)
async def get_post(
    post_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ForumPostDetailResponse:
    """Get a single forum post with all its replies. Increments view count."""
    data = await forum_service.get_post_detail(db, post_id, current_user.id)
    await db.commit()  # Commit view count increment

    if not data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Post not found"
        )

    replies = [
        ForumReplyResponse(
            **{k: v for k, v in r.items()},
            author=AuthorInfo(**r["author"]),
        )
        for r in data["replies"]
    ]

    return ForumPostDetailResponse(
        **{k: v for k, v in data.items() if k != "replies"},
        author=AuthorInfo(**data["author"]),
        stats=ForumPostStats(**data["stats"]),
        replies=replies,
    )


@router.put(
    "/posts/{post_id}",
    response_model=ForumPostResponse,
    status_code=status.HTTP_200_OK,
    summary="Update a forum post",
)
async def update_post(
    post_id: UUID,
    data: ForumPostUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ForumPostResponse:
    """Update a forum post. Only the original author can edit their post."""
    post = await forum_service.update_post(
        db=db,
        post_id=post_id,
        author_id=current_user.id,
        title=data.title,
        content=data.content,
        category=data.category,
        tags=data.tags,
    )

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found or you are not the author",
        )

    await db.commit()

    author = await forum_service._get_author_info(db, post.author_id)
    stats_data = await forum_service._get_post_stats(db, post.id)
    liked = await forum_service._user_liked_post(db, current_user.id, post.id)

    return ForumPostResponse(
        id=post.id,
        title=post.title,
        content=post.content,
        excerpt=post.content[:150] + "..." if len(post.content) > 150 else post.content,
        category=post.category,
        tags=post.tags or [],
        author=AuthorInfo(**author),
        stats=ForumPostStats(views=post.view_count, **stats_data),
        is_pinned=post.is_pinned,
        is_solved=post.is_solved,
        liked_by_me=liked,
        created_at=post.created_at,
        updated_at=post.updated_at,
        last_activity_at=post.last_activity_at,
    )


@router.delete(
    "/posts/{post_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a forum post",
)
async def delete_post(
    post_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Delete a forum post. Authors can delete their own; admins can delete any."""
    deleted = await forum_service.delete_post(
        db=db,
        post_id=post_id,
        user_id=current_user.id,
        is_admin=current_user.role == "admin",
    )
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found or you are not authorized",
        )
    await db.commit()


# ============================================================================
# Replies
# ============================================================================

@router.post(
    "/posts/{post_id}/replies",
    response_model=ForumReplyResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a reply to a post",
)
async def create_reply(
    post_id: UUID,
    data: ForumReplyCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ForumReplyResponse:
    """Add a reply to an existing forum post."""
    reply = await forum_service.create_reply(
        db=db, post_id=post_id, author_id=current_user.id, content=data.content
    )
    if not reply:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Post not found"
        )
    await db.commit()

    author = await forum_service._get_author_info(db, current_user.id)

    return ForumReplyResponse(
        id=reply.id,
        post_id=reply.post_id,
        content=reply.content,
        author=AuthorInfo(**author),
        is_solution=False,
        likes=0,
        liked_by_me=False,
        created_at=reply.created_at,
        updated_at=reply.updated_at,
    )


@router.put(
    "/replies/{reply_id}",
    response_model=ForumReplyResponse,
    status_code=status.HTTP_200_OK,
    summary="Edit a reply",
)
async def update_reply(
    reply_id: UUID,
    data: ForumReplyUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ForumReplyResponse:
    """Edit a reply. Only the original author can edit their reply."""
    reply = await forum_service.update_reply(
        db=db, reply_id=reply_id, author_id=current_user.id, content=data.content
    )
    if not reply:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reply not found or you are not the author",
        )
    await db.commit()

    author = await forum_service._get_author_info(db, current_user.id)
    from sqlalchemy import select, func
    from app.models.forum import ForumLike
    like_count = await db.execute(
        select(func.count()).where(ForumLike.reply_id == reply.id)
    )

    return ForumReplyResponse(
        id=reply.id,
        post_id=reply.post_id,
        content=reply.content,
        author=AuthorInfo(**author),
        is_solution=reply.is_solution,
        likes=like_count.scalar() or 0,
        liked_by_me=await forum_service._user_liked_reply(db, current_user.id, reply.id),
        created_at=reply.created_at,
        updated_at=reply.updated_at,
    )


@router.delete(
    "/replies/{reply_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a reply",
)
async def delete_reply(
    reply_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    """Delete a reply. Authors can delete their own; admins can delete any."""
    deleted = await forum_service.delete_reply(
        db=db,
        reply_id=reply_id,
        user_id=current_user.id,
        is_admin=current_user.role == "admin",
    )
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reply not found or you are not authorized",
        )
    await db.commit()


# ============================================================================
# Likes
# ============================================================================

@router.post(
    "/posts/{post_id}/like",
    status_code=status.HTTP_200_OK,
    summary="Toggle like on a post",
)
async def like_post(
    post_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Toggle a like on a forum post. Returns whether the post is now liked."""
    liked = await forum_service.toggle_post_like(db, current_user.id, post_id)
    await db.commit()
    return {"liked": liked}


@router.post(
    "/replies/{reply_id}/like",
    status_code=status.HTTP_200_OK,
    summary="Toggle like on a reply",
)
async def like_reply(
    reply_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Toggle a like on a forum reply. Returns whether the reply is now liked."""
    liked = await forum_service.toggle_reply_like(db, current_user.id, reply_id)
    await db.commit()
    return {"liked": liked}


# ============================================================================
# Moderation
# ============================================================================

@router.patch(
    "/posts/{post_id}/solve",
    status_code=status.HTTP_200_OK,
    summary="Mark post as solved",
)
async def mark_solved(
    post_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Mark a forum post as solved. Only the author or an admin can do this."""
    success = await forum_service.mark_post_solved(
        db=db, post_id=post_id, user_id=current_user.id,
        is_admin=current_user.role == "admin",
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found or you are not authorized",
        )
    await db.commit()
    return {"message": "Post marked as solved"}


@router.patch(
    "/posts/{post_id}/pin",
    status_code=status.HTTP_200_OK,
    summary="Toggle pin on a post (admin only)",
)
async def pin_post(
    post_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Toggle pin status on a forum post. Only admins can pin or unpin posts."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can pin posts",
        )

    is_pinned = await forum_service.toggle_pin_post(db, post_id)
    if is_pinned is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Post not found"
        )
    await db.commit()
    return {"pinned": is_pinned}


@router.patch(
    "/replies/{reply_id}/mark-solution",
    status_code=status.HTTP_200_OK,
    summary="Mark reply as the solution",
)
async def mark_solution(
    reply_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Mark a reply as the accepted solution for the parent post."""
    success = await forum_service.mark_reply_as_solution(
        db=db, reply_id=reply_id, user_id=current_user.id,
        is_admin=current_user.role == "admin",
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reply not found or you are not authorized",
        )
    await db.commit()
    return {"message": "Reply marked as solution"}
