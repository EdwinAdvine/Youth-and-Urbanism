"""
Forum Service for Urban Home School

Handles CRUD operations for forum posts, replies, likes,
and moderation. Integrates with notification service for
reply notifications.

This module provides functions organized into sections:
- Helper functions for building author info and post statistics
- Post CRUD (create, list with filters, detail view, update, delete)
- Reply CRUD (create, update, delete)
- Like toggling for both posts and replies
- Moderation (mark solved, pin/unpin, mark reply as solution)

All functions are async and accept an AsyncSession. Soft deletes are
used throughout to preserve data integrity.
"""

import logging
from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID

import bleach
from sqlalchemy import select, func, desc, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.forum import ForumPost, ForumReply, ForumLike
from app.models.user import User

logger = logging.getLogger(__name__)

# HTML sanitization configuration
ALLOWED_TAGS = [
    'p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li',
    'blockquote', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
]
ALLOWED_ATTRS = {
    'a': ['href', 'title'],
    'code': ['class'],  # For syntax highlighting
}
ALLOWED_PROTOCOLS = ['http', 'https', 'mailto']


def sanitize_html(text: str) -> str:
    """
    Sanitize user-provided HTML to prevent XSS attacks.

    Removes all disallowed tags, attributes, and protocols while
    preserving safe formatting elements.

    Args:
        text: Raw user input HTML

    Returns:
        Sanitized HTML safe for rendering
    """
    if not text:
        return ""

    return bleach.clean(
        text,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRS,
        protocols=ALLOWED_PROTOCOLS,
        strip=True  # Remove disallowed tags entirely
    )


# ============================================================================
# Helper: build author info dict
# ============================================================================

async def _get_author_info(db: AsyncSession, user_id: UUID) -> dict:
    """
    Fetch author info dict for embedding in post and reply responses.

    Looks up the user by UUID and returns a dict with id, name, role, and
    avatar URL. Falls back to "Unknown" name and "student" role if the
    user is not found.
    """
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        return {"id": user_id, "name": "Unknown", "role": "student", "avatar": None}
    profile = user.profile_data or {}
    return {
        "id": user.id,
        "name": profile.get("full_name", user.email.split("@")[0]),
        "role": user.role,
        "avatar": profile.get("avatar") or profile.get("profile_image"),
    }


async def _get_post_stats(db: AsyncSession, post_id: UUID) -> dict:
    """
    Compute reply count and like count for a forum post.

    Queries the database for the number of non-deleted replies and total
    likes associated with the given post UUID. Returns a dict with
    'replies' and 'likes' integer counts.
    """
    reply_count = await db.execute(
        select(func.count()).where(
            ForumReply.post_id == post_id, ForumReply.is_deleted == False
        )
    )
    like_count = await db.execute(
        select(func.count()).where(ForumLike.post_id == post_id)
    )
    return {
        "replies": reply_count.scalar() or 0,
        "likes": like_count.scalar() or 0,
    }


async def _user_liked_post(db: AsyncSession, user_id: UUID, post_id: UUID) -> bool:
    """Check whether a specific user has liked a given post. Returns True if liked."""
    result = await db.execute(
        select(ForumLike).where(ForumLike.user_id == user_id, ForumLike.post_id == post_id)
    )
    return result.scalars().first() is not None


async def _user_liked_reply(db: AsyncSession, user_id: UUID, reply_id: UUID) -> bool:
    """Check whether a specific user has liked a given reply. Returns True if liked."""
    result = await db.execute(
        select(ForumLike).where(ForumLike.user_id == user_id, ForumLike.reply_id == reply_id)
    )
    return result.scalars().first() is not None


# ============================================================================
# Posts
# ============================================================================

async def create_post(
    db: AsyncSession, author_id: UUID, title: str, content: str,
    category: str, tags: List[str],
) -> ForumPost:
    """
    Create a new forum post.

    Accepts the database session, the author's user UUID, post title,
    content body, category string, and a list of tag strings.

    Returns the newly created ForumPost instance after flushing to
    the database (not yet committed -- caller should commit the session).
    """
    # Sanitize user input to prevent XSS attacks
    sanitized_title = sanitize_html(title)
    sanitized_content = sanitize_html(content)
    sanitized_tags = [sanitize_html(tag) for tag in tags] if tags else []

    post = ForumPost(
        author_id=author_id,
        title=sanitized_title,
        content=sanitized_content,
        category=category,
        tags=sanitized_tags,
    )
    db.add(post)
    await db.flush()
    return post


async def get_posts(
    db: AsyncSession,
    current_user_id: UUID,
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort: str = "latest",
    page: int = 1,
    limit: int = 20,
) -> dict:
    """
    Get paginated forum posts with filters and sorting.

    Supports filtering by category and free-text search across title and
    content. Sorting options are 'latest' (default, pinned first then by
    last activity), 'popular' (by view count), and 'unanswered' (by
    creation date). Returns a dict with posts list, total count, page
    number, and limit. Each post dict includes author info, stats (views,
    replies, likes), and the current user's like status.
    """
    query = select(ForumPost).where(ForumPost.is_deleted == False)

    if category and category != "all":
        query = query.where(ForumPost.category == category)

    if search:
        search_filter = f"%{search}%"
        query = query.where(
            or_(
                ForumPost.title.ilike(search_filter),
                ForumPost.content.ilike(search_filter),
            )
        )

    # Count
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    # Sort
    if sort == "popular":
        query = query.order_by(desc(ForumPost.view_count))
    elif sort == "unanswered":
        # Posts with 0 replies - we'll use last_activity == created_at as proxy
        query = query.order_by(desc(ForumPost.created_at))
    else:  # latest (default)
        query = query.order_by(
            desc(ForumPost.is_pinned), desc(ForumPost.last_activity_at)
        )

    offset = (page - 1) * limit
    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    posts = result.scalars().all()

    # Build response dicts
    post_list = []
    for post in posts:
        author = await _get_author_info(db, post.author_id)
        stats_data = await _get_post_stats(db, post.id)
        liked = await _user_liked_post(db, current_user_id, post.id)

        excerpt = post.content[:150] + "..." if len(post.content) > 150 else post.content

        post_list.append({
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "excerpt": excerpt,
            "category": post.category,
            "tags": post.tags or [],
            "author": author,
            "stats": {
                "views": post.view_count,
                "replies": stats_data["replies"],
                "likes": stats_data["likes"],
            },
            "is_pinned": post.is_pinned,
            "is_solved": post.is_solved,
            "liked_by_me": liked,
            "created_at": post.created_at,
            "updated_at": post.updated_at,
            "last_activity_at": post.last_activity_at,
        })

    return {"posts": post_list, "total": total, "page": page, "limit": limit}


async def get_post_detail(
    db: AsyncSession, post_id: UUID, current_user_id: UUID
) -> Optional[dict]:
    """
    Get a single post with all its replies. Increments the view count.

    Looks up the post by UUID, increments its view counter, and returns
    a detailed dict including the post content, author info, stats, all
    non-deleted replies with their author info and like counts, and the
    current user's like status on both the post and each reply.

    Returns None if the post is not found or has been soft-deleted.
    """
    result = await db.execute(
        select(ForumPost).where(ForumPost.id == post_id, ForumPost.is_deleted == False)
    )
    post = result.scalars().first()
    if not post:
        return None

    # Increment view count
    post.view_count += 1
    await db.flush()

    author = await _get_author_info(db, post.author_id)
    stats_data = await _get_post_stats(db, post.id)
    liked = await _user_liked_post(db, current_user_id, post.id)

    # Get replies
    replies_result = await db.execute(
        select(ForumReply)
        .where(ForumReply.post_id == post_id, ForumReply.is_deleted == False)
        .order_by(ForumReply.created_at)
    )
    replies = replies_result.scalars().all()

    reply_list = []
    for reply in replies:
        reply_author = await _get_author_info(db, reply.author_id)
        like_count = await db.execute(
            select(func.count()).where(ForumLike.reply_id == reply.id)
        )
        reply_liked = await _user_liked_reply(db, current_user_id, reply.id)

        reply_list.append({
            "id": reply.id,
            "post_id": reply.post_id,
            "content": reply.content,
            "author": reply_author,
            "is_solution": reply.is_solution,
            "likes": like_count.scalar() or 0,
            "liked_by_me": reply_liked,
            "created_at": reply.created_at,
            "updated_at": reply.updated_at,
        })

    return {
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "excerpt": post.content[:150] + "..." if len(post.content) > 150 else post.content,
        "category": post.category,
        "tags": post.tags or [],
        "author": author,
        "stats": {
            "views": post.view_count,
            "replies": stats_data["replies"],
            "likes": stats_data["likes"],
        },
        "is_pinned": post.is_pinned,
        "is_solved": post.is_solved,
        "liked_by_me": liked,
        "created_at": post.created_at,
        "updated_at": post.updated_at,
        "last_activity_at": post.last_activity_at,
        "replies": reply_list,
    }


async def update_post(
    db: AsyncSession, post_id: UUID, author_id: UUID,
    title: Optional[str] = None, content: Optional[str] = None,
    category: Optional[str] = None, tags: Optional[List[str]] = None,
) -> Optional[ForumPost]:
    """
    Update a forum post. Only the original author can update.

    Accepts optional new values for title, content, category, and tags.
    Only fields that are not None will be updated. Returns the updated
    ForumPost instance, or None if the post was not found or the caller
    is not the author.
    """
    result = await db.execute(
        select(ForumPost).where(
            ForumPost.id == post_id,
            ForumPost.author_id == author_id,
            ForumPost.is_deleted == False,
        )
    )
    post = result.scalars().first()
    if not post:
        return None

    if title is not None:
        post.title = sanitize_html(title)
    if content is not None:
        post.content = sanitize_html(content)
    if category is not None:
        post.category = category
    if tags is not None:
        post.tags = [sanitize_html(tag) for tag in tags]

    await db.flush()
    return post


async def delete_post(
    db: AsyncSession, post_id: UUID, user_id: UUID, is_admin: bool = False
) -> bool:
    """
    Soft-delete a forum post by setting its is_deleted flag to True.

    The post author can delete their own posts. Admins can delete any
    post by passing is_admin=True. Returns True if the post was deleted,
    False if it was not found or the caller lacks permission.
    """
    query = select(ForumPost).where(
        ForumPost.id == post_id, ForumPost.is_deleted == False
    )
    if not is_admin:
        query = query.where(ForumPost.author_id == user_id)

    result = await db.execute(query)
    post = result.scalars().first()
    if not post:
        return False

    post.is_deleted = True
    await db.flush()
    return True


# ============================================================================
# Replies
# ============================================================================

async def create_reply(
    db: AsyncSession, post_id: UUID, author_id: UUID, content: str
) -> Optional[ForumReply]:
    """
    Create a reply on a forum post and update the post's last_activity_at.

    Verifies that the parent post exists and is not deleted before creating
    the reply. Returns the new ForumReply instance, or None if the post
    was not found.
    """
    # Verify post exists
    post_result = await db.execute(
        select(ForumPost).where(ForumPost.id == post_id, ForumPost.is_deleted == False)
    )
    post = post_result.scalars().first()
    if not post:
        return None

    # Sanitize reply content to prevent XSS
    sanitized_content = sanitize_html(content)

    reply = ForumReply(post_id=post_id, author_id=author_id, content=sanitized_content)
    db.add(reply)

    post.last_activity_at = datetime.now(timezone.utc)
    await db.flush()

    return reply


async def update_reply(
    db: AsyncSession, reply_id: UUID, author_id: UUID, content: str
) -> Optional[ForumReply]:
    """
    Update the content of a forum reply. Only the original author can update.

    Returns the updated ForumReply instance, or None if the reply was not
    found or the caller is not the author.
    """
    result = await db.execute(
        select(ForumReply).where(
            ForumReply.id == reply_id,
            ForumReply.author_id == author_id,
            ForumReply.is_deleted == False,
        )
    )
    reply = result.scalars().first()
    if not reply:
        return None

    # Sanitize updated content to prevent XSS
    reply.content = sanitize_html(content)
    await db.flush()
    return reply


async def delete_reply(
    db: AsyncSession, reply_id: UUID, user_id: UUID, is_admin: bool = False
) -> bool:
    """
    Soft-delete a forum reply. The author or an admin can delete.

    Returns True if the reply was deleted, False if not found or the
    caller lacks permission.
    """
    query = select(ForumReply).where(
        ForumReply.id == reply_id, ForumReply.is_deleted == False
    )
    if not is_admin:
        query = query.where(ForumReply.author_id == user_id)

    result = await db.execute(query)
    reply = result.scalars().first()
    if not reply:
        return False

    reply.is_deleted = True
    await db.flush()
    return True


# ============================================================================
# Likes (toggle)
# ============================================================================

async def toggle_post_like(db: AsyncSession, user_id: UUID, post_id: UUID) -> bool:
    """Toggle like on a post. Returns True if now liked, False if unliked."""
    result = await db.execute(
        select(ForumLike).where(
            ForumLike.user_id == user_id, ForumLike.post_id == post_id
        )
    )
    existing = result.scalars().first()

    if existing:
        await db.delete(existing)
        await db.flush()
        return False
    else:
        like = ForumLike(user_id=user_id, post_id=post_id)
        db.add(like)
        await db.flush()
        return True


async def toggle_reply_like(db: AsyncSession, user_id: UUID, reply_id: UUID) -> bool:
    """Toggle like on a reply. Returns True if now liked, False if unliked."""
    result = await db.execute(
        select(ForumLike).where(
            ForumLike.user_id == user_id, ForumLike.reply_id == reply_id
        )
    )
    existing = result.scalars().first()

    if existing:
        await db.delete(existing)
        await db.flush()
        return False
    else:
        like = ForumLike(user_id=user_id, reply_id=reply_id)
        db.add(like)
        await db.flush()
        return True


# ============================================================================
# Moderation
# ============================================================================

async def mark_post_solved(
    db: AsyncSession, post_id: UUID, user_id: UUID, is_admin: bool = False
) -> bool:
    """Mark post as solved. Author or admin only."""
    query = select(ForumPost).where(
        ForumPost.id == post_id, ForumPost.is_deleted == False
    )
    if not is_admin:
        query = query.where(ForumPost.author_id == user_id)

    result = await db.execute(query)
    post = result.scalars().first()
    if not post:
        return False

    post.is_solved = True
    await db.flush()
    return True


async def toggle_pin_post(db: AsyncSession, post_id: UUID) -> Optional[bool]:
    """Toggle pin on a post. Admin only. Returns new pin state."""
    result = await db.execute(
        select(ForumPost).where(ForumPost.id == post_id, ForumPost.is_deleted == False)
    )
    post = result.scalars().first()
    if not post:
        return None

    post.is_pinned = not post.is_pinned
    await db.flush()
    return post.is_pinned


async def mark_reply_as_solution(
    db: AsyncSession, reply_id: UUID, user_id: UUID, is_admin: bool = False
) -> bool:
    """Mark a reply as the solution. Post author or admin only."""
    result = await db.execute(select(ForumReply).where(ForumReply.id == reply_id))
    reply = result.scalars().first()
    if not reply:
        return False

    # Only the post author or admin can mark solution
    post_result = await db.execute(
        select(ForumPost).where(ForumPost.id == reply.post_id)
    )
    post = post_result.scalars().first()
    if not post:
        return False

    if not is_admin and post.author_id != user_id:
        return False

    reply.is_solution = True
    post.is_solved = True
    await db.flush()
    return True
