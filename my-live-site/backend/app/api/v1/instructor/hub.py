"""
Instructor Hub & Community API Routes

Endpoints for CBC curriculum references, AI prompt management,
community forum (posts & replies), and support tickets.
"""

import json
import logging
import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select, desc, asc, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.utils.security import require_role

# Lazy imports for models and schemas are done inside endpoint functions
# to avoid circular imports and speed up module loading.

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/hub", tags=["Instructor Hub & Community"])


# ============================================================================
# Kenya CBC Curriculum Reference Data
# ============================================================================

KENYA_CBC_CURRICULUM = {
    "framework": "Kenya Competency-Based Curriculum (CBC)",
    "effective_year": 2017,
    "overview": (
        "The CBC replaced the 8-4-4 system with a 2-6-3-3-3 structure: "
        "2 years Pre-Primary, 6 years Primary, 3 years Junior Secondary, "
        "3 years Senior Secondary, and 3 years tertiary education."
    ),
    "levels": [
        {
            "level": "Pre-Primary",
            "grades": ["PP1", "PP2"],
            "age_range": "4-5 years",
            "learning_areas": [
                "Language Activities",
                "Mathematical Activities",
                "Environmental Activities",
                "Psychomotor and Creative Activities",
                "Religious Education Activities",
            ],
            "key_competencies": [
                "Communication and collaboration",
                "Self-efficacy",
                "Imagination and creativity",
            ],
        },
        {
            "level": "Lower Primary",
            "grades": ["Grade 1", "Grade 2", "Grade 3"],
            "age_range": "6-8 years",
            "learning_areas": [
                "Literacy Activities (English / Kiswahili / Indigenous Language)",
                "Mathematical Activities",
                "Environmental Activities",
                "Hygiene and Nutrition",
                "Religious Education (CRE / IRE / HRE)",
                "Movement and Creative Activities",
            ],
            "key_competencies": [
                "Communication and collaboration",
                "Critical thinking and problem solving",
                "Creativity and imagination",
                "Citizenship",
                "Digital literacy",
                "Learning to learn",
                "Self-efficacy",
            ],
        },
        {
            "level": "Upper Primary",
            "grades": ["Grade 4", "Grade 5", "Grade 6"],
            "age_range": "9-11 years",
            "learning_areas": [
                "English",
                "Kiswahili / Kenya Sign Language",
                "Home Science",
                "Agriculture",
                "Science and Technology",
                "Mathematics",
                "Religious Education (CRE / IRE / HRE)",
                "Creative Arts (Art & Craft, Music)",
                "Physical and Health Education",
                "Social Studies",
                "Optional: Indigenous Language / Foreign Language / Kenyan Sign Language",
            ],
            "key_competencies": [
                "Communication and collaboration",
                "Critical thinking and problem solving",
                "Creativity and imagination",
                "Citizenship",
                "Digital literacy",
                "Learning to learn",
                "Self-efficacy",
            ],
        },
        {
            "level": "Junior Secondary",
            "grades": ["Grade 7", "Grade 8", "Grade 9"],
            "age_range": "12-14 years",
            "learning_areas": [
                "English",
                "Kiswahili / Kenya Sign Language",
                "Mathematics",
                "Integrated Science",
                "Health Education",
                "Pre-Technical and Pre-Career Education",
                "Social Studies",
                "Religious Education (CRE / IRE / HRE)",
                "Business Studies",
                "Agriculture",
                "Life Skills Education",
                "Physical Education and Sports",
                "Optional: Visual Arts / Performing Arts / Home Science / "
                "Computer Science / Foreign Language / Indigenous Language / "
                "Kenyan Sign Language",
            ],
            "key_competencies": [
                "Communication and collaboration",
                "Critical thinking and problem solving",
                "Creativity and imagination",
                "Citizenship",
                "Digital literacy",
                "Learning to learn",
                "Self-efficacy",
            ],
            "pathways_note": (
                "Junior Secondary introduces learners to various subjects to help "
                "identify talents and interests, preparing them for pathway selection "
                "in Senior Secondary: Arts and Sports Science, Social Sciences, or STEM."
            ),
        },
    ],
    "core_values": [
        "Love",
        "Responsibility",
        "Respect",
        "Unity",
        "Peace",
        "Patriotism",
        "Social justice",
        "Integrity",
    ],
    "pertinent_and_contemporary_issues": [
        "Citizenship",
        "Health and life skills",
        "Community service learning",
        "Financial literacy",
        "Environmental awareness",
        "Safety and security",
        "Gender issues",
        "Disability awareness",
    ],
}


# ============================================================================
# CBC References Endpoints
# ============================================================================


@router.get("/cbc/references")
async def get_cbc_references(
    current_user: User = Depends(require_role(["instructor"])),
):
    """
    Browse Kenya CBC curriculum reference data.

    Returns the full CBC curriculum structure including levels (PP1/PP2,
    Lower Primary, Upper Primary, Junior Secondary), learning areas,
    core competencies, values, and pertinent issues.
    """
    return {
        "curriculum": KENYA_CBC_CURRICULUM,
        "retrieved_at": datetime.utcnow().isoformat(),
    }


@router.get("/cbc/analyses", response_model=dict)
async def list_cbc_analyses(
    course_id: Optional[str] = Query(None, description="Filter by course ID"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """
    List CBC alignment analyses for the instructor's courses.

    Returns paginated CBC analysis records showing alignment scores,
    competencies covered/missing, and AI-generated suggestions.
    """
    try:
        from app.models.instructor.instructor_ai_insight import InstructorCBCAnalysis
        from app.models.course import Course

        query = (
            select(InstructorCBCAnalysis)
            .where(InstructorCBCAnalysis.instructor_id == current_user.id)
        )

        if course_id:
            query = query.where(
                InstructorCBCAnalysis.course_id == uuid.UUID(course_id)
            )

        # Count total
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        # Paginate
        query = (
            query
            .order_by(desc(InstructorCBCAnalysis.created_at))
            .offset((page - 1) * limit)
            .limit(limit)
        )
        result = await db.execute(query)
        analyses = result.scalars().all()

        items = []
        for analysis in analyses:
            # Get course title
            course_result = await db.execute(
                select(Course.title).where(Course.id == analysis.course_id)
            )
            course_title = course_result.scalar() or "Unknown Course"

            items.append({
                "id": str(analysis.id),
                "course_id": str(analysis.course_id),
                "course_title": course_title,
                "instructor_id": str(analysis.instructor_id),
                "alignment_score": float(analysis.alignment_score),
                "competencies_covered": analysis.competencies_covered or [],
                "competencies_missing": analysis.competencies_missing or [],
                "suggestions": analysis.suggestions or [],
                "ai_model_used": analysis.ai_model_used,
                "analysis_data": analysis.analysis_data,
                "created_at": analysis.created_at.isoformat(),
                "updated_at": analysis.updated_at.isoformat(),
            })

        return {
            "items": items,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit if total > 0 else 0,
        }
    except Exception as e:
        logger.error(f"Error listing CBC analyses: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# AI Prompts Endpoints (Redis-backed)
# ============================================================================


async def _get_redis():
    """Get a Redis client from the application's Redis URL."""
    import redis.asyncio as aioredis
    from app.config import settings

    return aioredis.from_url(
        settings.redis_url, decode_responses=True
    )


def _prompts_key(instructor_id: str) -> str:
    """Redis key for an instructor's saved AI prompts."""
    return f"instructor:{instructor_id}:ai_prompts"


@router.get("/ai-prompts")
async def list_ai_prompts(
    current_user: User = Depends(require_role(["instructor"])),
):
    """
    List saved AI prompt templates for the instructor.

    Prompts are stored per-instructor in Redis as a JSON list.
    Each prompt has an id, title, content, category, and created_at.
    """
    try:
        redis = await _get_redis()
        try:
            raw = await redis.get(_prompts_key(str(current_user.id)))
        finally:
            await redis.aclose()

        prompts = json.loads(raw) if raw else []
        return {"prompts": prompts, "total": len(prompts)}
    except Exception as e:
        logger.error(f"Error fetching AI prompts: {e}")
        # Fallback: return empty list if Redis is unavailable
        return {"prompts": [], "total": 0, "warning": "Could not connect to cache"}


@router.post("/ai-prompts")
async def save_ai_prompt(
    title: str = Query(..., min_length=3, max_length=200),
    content: str = Query(..., min_length=10),
    category: str = Query("general", description="Prompt category"),
    current_user: User = Depends(require_role(["instructor"])),
):
    """
    Save a new AI prompt template.

    The prompt is appended to the instructor's saved prompts list in Redis.
    """
    try:
        redis = await _get_redis()
        try:
            raw = await redis.get(_prompts_key(str(current_user.id)))
            prompts = json.loads(raw) if raw else []

            new_prompt = {
                "id": str(uuid.uuid4()),
                "title": title,
                "content": content,
                "category": category,
                "created_at": datetime.utcnow().isoformat(),
            }
            prompts.append(new_prompt)

            await redis.set(
                _prompts_key(str(current_user.id)),
                json.dumps(prompts),
            )
        finally:
            await redis.aclose()

        return {"message": "Prompt saved successfully", "prompt": new_prompt}
    except Exception as e:
        logger.error(f"Error saving AI prompt: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save prompt: {e}")


@router.post("/ai-prompts/test")
async def test_ai_prompt(
    prompt_text: str = Query(..., min_length=10, description="The prompt to test"),
    context: str = Query("", description="Optional context for the prompt"),
    current_user: User = Depends(require_role(["instructor"])),
):
    """
    Test an AI prompt through the AI Orchestrator.

    Sends the prompt to the platform's AI orchestrator and returns
    the generated response for preview purposes.
    """
    try:
        from app.services.ai_orchestrator import AIOrchestrator

        orchestrator = AIOrchestrator()
        full_prompt = prompt_text
        if context:
            full_prompt = f"Context: {context}\n\n{prompt_text}"

        response = await orchestrator.generate(
            prompt=full_prompt,
            task_type="creative",
        )

        return {
            "prompt_text": prompt_text,
            "context": context,
            "response": response.get("content", response) if isinstance(response, dict) else str(response),
            "ai_model_used": response.get("model", "unknown") if isinstance(response, dict) else "unknown",
            "generated_at": datetime.utcnow().isoformat(),
        }
    except ImportError:
        # AIOrchestrator not yet available - return mock response
        return {
            "prompt_text": prompt_text,
            "context": context,
            "response": (
                "AI Orchestrator is not configured. This is a placeholder response. "
                "Once the AI service is set up, your prompt will be sent to the "
                "appropriate AI model for generation."
            ),
            "ai_model_used": "mock",
            "generated_at": datetime.utcnow().isoformat(),
        }
    except Exception as e:
        logger.error(f"Error testing AI prompt: {e}")
        raise HTTPException(status_code=500, detail=f"AI prompt test failed: {e}")


# ============================================================================
# Community Forum Endpoints
# ============================================================================


@router.get("/community/posts", response_model=dict)
async def list_forum_posts(
    search: Optional[str] = Query(None, description="Search posts by title or content"),
    post_type: Optional[str] = Query(None, description="Filter by post type: discussion, announcement, question"),
    is_pinned: Optional[bool] = Query(None, description="Filter pinned posts"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """
    List community forum posts with search, filtering, and pagination.

    Joins User to retrieve instructor name and avatar for each post.
    Includes reply count per post.
    """
    try:
        from app.models.instructor.instructor_discussion import (
            InstructorForumPost,
            InstructorForumReply,
            PostType,
        )

        # Base query with reply count subquery
        reply_count_sub = (
            select(
                InstructorForumReply.post_id,
                func.count(InstructorForumReply.id).label("replies_count"),
            )
            .group_by(InstructorForumReply.post_id)
            .subquery()
        )

        query = (
            select(
                InstructorForumPost,
                User.profile_data,
                User.email,
                func.coalesce(reply_count_sub.c.replies_count, 0).label("replies_count"),
            )
            .join(User, User.id == InstructorForumPost.instructor_id)
            .outerjoin(
                reply_count_sub,
                reply_count_sub.c.post_id == InstructorForumPost.id,
            )
        )

        # Apply filters
        if search:
            search_term = f"%{search}%"
            query = query.where(
                or_(
                    InstructorForumPost.title.ilike(search_term),
                    InstructorForumPost.content.ilike(search_term),
                )
            )

        if post_type:
            try:
                pt = PostType(post_type)
                query = query.where(InstructorForumPost.post_type == pt)
            except ValueError:
                pass  # Ignore invalid post_type values

        if is_pinned is not None:
            query = query.where(InstructorForumPost.is_pinned == is_pinned)

        # Count total (before pagination)
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        # Sorting
        sort_column = getattr(InstructorForumPost, sort_by, InstructorForumPost.created_at)
        order_func = desc if sort_order == "desc" else asc
        # Always show pinned posts first
        query = query.order_by(
            desc(InstructorForumPost.is_pinned),
            order_func(sort_column),
        )

        # Paginate
        query = query.offset((page - 1) * limit).limit(limit)
        result = await db.execute(query)
        rows = result.all()

        items = []
        for row in rows:
            post = row[0]
            profile_data = row[1] or {}
            email = row[2]
            replies_count = row[3]

            items.append({
                "id": str(post.id),
                "instructor_id": str(post.instructor_id),
                "instructor_name": profile_data.get("full_name", email),
                "instructor_avatar": profile_data.get("profile_picture"),
                "forum_id": str(post.forum_id) if post.forum_id else None,
                "title": post.title,
                "content": post.content,
                "post_type": post.post_type.value if hasattr(post.post_type, "value") else str(post.post_type),
                "is_pinned": post.is_pinned,
                "is_moderated": post.is_moderated,
                "sentiment_score": float(post.sentiment_score) if post.sentiment_score else None,
                "replies_count": replies_count,
                "created_at": post.created_at.isoformat(),
                "updated_at": post.updated_at.isoformat(),
            })

        return {
            "items": items,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit if total > 0 else 0,
        }
    except Exception as e:
        logger.error(f"Error listing forum posts: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/community/posts", response_model=dict, status_code=201)
async def create_forum_post(
    post_data: "ForumPostCreate",
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """Create a new forum post in the instructor community."""
    try:
        from app.models.instructor.instructor_discussion import (
            InstructorForumPost,
            PostType,
        )
        from app.schemas.instructor.discussion_schemas import ForumPostCreate  # noqa: F811

        # Validate post type
        try:
            pt = PostType(post_data.post_type)
        except ValueError:
            pt = PostType.DISCUSSION

        new_post = InstructorForumPost(
            id=uuid.uuid4(),
            instructor_id=current_user.id,
            forum_id=uuid.UUID(post_data.forum_id) if post_data.forum_id else None,
            title=post_data.title,
            content=post_data.content,
            post_type=pt,
            is_pinned=False,
            is_moderated=False,
        )
        db.add(new_post)
        await db.flush()

        profile_data = current_user.profile_data or {}
        return {
            "id": str(new_post.id),
            "instructor_id": str(new_post.instructor_id),
            "instructor_name": profile_data.get("full_name", current_user.email),
            "instructor_avatar": profile_data.get("profile_picture"),
            "forum_id": str(new_post.forum_id) if new_post.forum_id else None,
            "title": new_post.title,
            "content": new_post.content,
            "post_type": new_post.post_type.value if hasattr(new_post.post_type, "value") else str(new_post.post_type),
            "is_pinned": new_post.is_pinned,
            "is_moderated": new_post.is_moderated,
            "sentiment_score": None,
            "replies_count": 0,
            "created_at": new_post.created_at.isoformat(),
            "updated_at": new_post.updated_at.isoformat(),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating forum post: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/community/posts/{post_id}", response_model=dict)
async def get_forum_post(
    post_id: str,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """
    Get a single forum post with all its replies.

    Returns the post details along with author info and a list of replies
    including each reply's author name and avatar.
    """
    try:
        from app.models.instructor.instructor_discussion import (
            InstructorForumPost,
            InstructorForumReply,
        )

        # Fetch post with author
        post_result = await db.execute(
            select(InstructorForumPost, User.profile_data, User.email)
            .join(User, User.id == InstructorForumPost.instructor_id)
            .where(InstructorForumPost.id == uuid.UUID(post_id))
        )
        post_row = post_result.first()

        if not post_row:
            raise HTTPException(status_code=404, detail="Post not found")

        post = post_row[0]
        post_profile = post_row[1] or {}
        post_email = post_row[2]

        # Fetch replies with authors
        replies_result = await db.execute(
            select(InstructorForumReply, User.profile_data, User.email)
            .join(User, User.id == InstructorForumReply.author_id)
            .where(InstructorForumReply.post_id == uuid.UUID(post_id))
            .order_by(asc(InstructorForumReply.created_at))
        )
        reply_rows = replies_result.all()

        replies = []
        for rrow in reply_rows:
            reply = rrow[0]
            reply_profile = rrow[1] or {}
            reply_email = rrow[2]
            replies.append({
                "id": str(reply.id),
                "post_id": str(reply.post_id),
                "author_id": str(reply.author_id),
                "author_name": reply_profile.get("full_name", reply_email),
                "author_avatar": reply_profile.get("profile_picture"),
                "content": reply.content,
                "sentiment_score": float(reply.sentiment_score) if reply.sentiment_score else None,
                "created_at": reply.created_at.isoformat(),
                "updated_at": reply.updated_at.isoformat(),
            })

        return {
            "id": str(post.id),
            "instructor_id": str(post.instructor_id),
            "instructor_name": post_profile.get("full_name", post_email),
            "instructor_avatar": post_profile.get("profile_picture"),
            "forum_id": str(post.forum_id) if post.forum_id else None,
            "title": post.title,
            "content": post.content,
            "post_type": post.post_type.value if hasattr(post.post_type, "value") else str(post.post_type),
            "is_pinned": post.is_pinned,
            "is_moderated": post.is_moderated,
            "sentiment_score": float(post.sentiment_score) if post.sentiment_score else None,
            "replies_count": len(replies),
            "replies": replies,
            "created_at": post.created_at.isoformat(),
            "updated_at": post.updated_at.isoformat(),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching forum post: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/community/posts/{post_id}", response_model=dict)
async def update_forum_post(
    post_id: str,
    update_data: "ForumPostUpdate",
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing forum post. Only the post author can update."""
    try:
        from app.models.instructor.instructor_discussion import InstructorForumPost
        from app.schemas.instructor.discussion_schemas import ForumPostUpdate  # noqa: F811

        result = await db.execute(
            select(InstructorForumPost)
            .where(InstructorForumPost.id == uuid.UUID(post_id))
        )
        post = result.scalar_one_or_none()

        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        if post.instructor_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You can only update your own posts",
            )

        # Apply updates
        if update_data.title is not None:
            post.title = update_data.title
        if update_data.content is not None:
            post.content = update_data.content
        if update_data.is_pinned is not None:
            post.is_pinned = update_data.is_pinned

        post.updated_at = datetime.utcnow()
        await db.flush()

        profile_data = current_user.profile_data or {}
        return {
            "id": str(post.id),
            "instructor_id": str(post.instructor_id),
            "instructor_name": profile_data.get("full_name", current_user.email),
            "instructor_avatar": profile_data.get("profile_picture"),
            "title": post.title,
            "content": post.content,
            "post_type": post.post_type.value if hasattr(post.post_type, "value") else str(post.post_type),
            "is_pinned": post.is_pinned,
            "is_moderated": post.is_moderated,
            "updated_at": post.updated_at.isoformat(),
            "message": "Post updated successfully",
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating forum post: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/community/posts/{post_id}", response_model=dict)
async def delete_forum_post(
    post_id: str,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """Delete a forum post. Only the post author can delete."""
    try:
        from app.models.instructor.instructor_discussion import InstructorForumPost

        result = await db.execute(
            select(InstructorForumPost)
            .where(InstructorForumPost.id == uuid.UUID(post_id))
        )
        post = result.scalar_one_or_none()

        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        if post.instructor_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You can only delete your own posts",
            )

        await db.delete(post)
        await db.flush()

        return {"message": "Post deleted successfully", "post_id": post_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting forum post: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/community/posts/{post_id}/replies", response_model=dict, status_code=201)
async def create_forum_reply(
    post_id: str,
    reply_data: "ForumReplyCreate",
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """Reply to a forum post."""
    try:
        from app.models.instructor.instructor_discussion import (
            InstructorForumPost,
            InstructorForumReply,
        )
        from app.schemas.instructor.discussion_schemas import ForumReplyCreate  # noqa: F811

        # Verify post exists
        post_result = await db.execute(
            select(InstructorForumPost)
            .where(InstructorForumPost.id == uuid.UUID(post_id))
        )
        post = post_result.scalar_one_or_none()

        if not post:
            raise HTTPException(status_code=404, detail="Post not found")

        new_reply = InstructorForumReply(
            id=uuid.uuid4(),
            post_id=uuid.UUID(post_id),
            author_id=current_user.id,
            content=reply_data.content,
        )
        db.add(new_reply)
        await db.flush()

        profile_data = current_user.profile_data or {}
        return {
            "id": str(new_reply.id),
            "post_id": str(new_reply.post_id),
            "author_id": str(new_reply.author_id),
            "author_name": profile_data.get("full_name", current_user.email),
            "author_avatar": profile_data.get("profile_picture"),
            "content": new_reply.content,
            "sentiment_score": None,
            "created_at": new_reply.created_at.isoformat(),
            "updated_at": new_reply.updated_at.isoformat(),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating forum reply: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/community/replies/{reply_id}", response_model=dict)
async def update_forum_reply(
    reply_id: str,
    update_data: "ForumReplyUpdate",
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing reply. Only the reply author can update."""
    try:
        from app.models.instructor.instructor_discussion import InstructorForumReply
        from app.schemas.instructor.discussion_schemas import ForumReplyUpdate  # noqa: F811

        result = await db.execute(
            select(InstructorForumReply)
            .where(InstructorForumReply.id == uuid.UUID(reply_id))
        )
        reply = result.scalar_one_or_none()

        if not reply:
            raise HTTPException(status_code=404, detail="Reply not found")

        if reply.author_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You can only update your own replies",
            )

        reply.content = update_data.content
        reply.updated_at = datetime.utcnow()
        await db.flush()

        profile_data = current_user.profile_data or {}
        return {
            "id": str(reply.id),
            "post_id": str(reply.post_id),
            "author_id": str(reply.author_id),
            "author_name": profile_data.get("full_name", current_user.email),
            "author_avatar": profile_data.get("profile_picture"),
            "content": reply.content,
            "sentiment_score": float(reply.sentiment_score) if reply.sentiment_score else None,
            "updated_at": reply.updated_at.isoformat(),
            "message": "Reply updated successfully",
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating forum reply: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/community/replies/{reply_id}", response_model=dict)
async def delete_forum_reply(
    reply_id: str,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """Delete a reply. Only the reply author can delete."""
    try:
        from app.models.instructor.instructor_discussion import InstructorForumReply

        result = await db.execute(
            select(InstructorForumReply)
            .where(InstructorForumReply.id == uuid.UUID(reply_id))
        )
        reply = result.scalar_one_or_none()

        if not reply:
            raise HTTPException(status_code=404, detail="Reply not found")

        if reply.author_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You can only delete your own replies",
            )

        await db.delete(reply)
        await db.flush()

        return {"message": "Reply deleted successfully", "reply_id": reply_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting forum reply: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Support Tickets Endpoints
# ============================================================================


@router.get("/support/tickets", response_model=dict)
async def list_support_tickets(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by ticket status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """
    List the instructor's support tickets.

    Returns tickets created by the current instructor, ordered by most recent.
    """
    try:
        from app.models.staff.ticket import StaffTicket

        query = select(StaffTicket).where(
            StaffTicket.reporter_id == current_user.id
        )

        if status_filter:
            query = query.where(StaffTicket.status == status_filter)
        if priority:
            query = query.where(StaffTicket.priority == priority)

        # Count total
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        # Paginate
        query = (
            query
            .order_by(desc(StaffTicket.created_at))
            .offset((page - 1) * limit)
            .limit(limit)
        )
        result = await db.execute(query)
        tickets = result.scalars().all()

        items = []
        for ticket in tickets:
            items.append({
                "id": str(ticket.id),
                "ticket_number": ticket.ticket_number,
                "subject": ticket.subject,
                "description": ticket.description,
                "category": ticket.category,
                "priority": ticket.priority,
                "status": ticket.status,
                "created_at": ticket.created_at.isoformat(),
                "updated_at": ticket.updated_at.isoformat() if ticket.updated_at else None,
                "resolved_at": ticket.resolved_at.isoformat() if ticket.resolved_at else None,
            })

        return {
            "items": items,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit if total > 0 else 0,
        }
    except Exception as e:
        logger.error(f"Error listing support tickets: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/support/tickets", response_model=dict, status_code=201)
async def create_support_ticket(
    subject: str = Query(..., min_length=5, max_length=255),
    description: str = Query(..., min_length=10),
    category: str = Query("general", description="Ticket category"),
    priority: str = Query("medium", description="Priority: low, medium, high, urgent"),
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new support ticket.

    Generates a unique ticket number and creates a ticket assigned to the
    instructor as the reporter.
    """
    try:
        from app.models.staff.ticket import StaffTicket

        # Validate priority
        valid_priorities = {"low", "medium", "high", "urgent"}
        if priority not in valid_priorities:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid priority. Must be one of: {', '.join(valid_priorities)}",
            )

        # Generate ticket number
        ticket_number = f"TK-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

        new_ticket = StaffTicket(
            id=uuid.uuid4(),
            ticket_number=ticket_number,
            subject=subject,
            description=description,
            category=category,
            priority=priority,
            status="open",
            reporter_id=current_user.id,
        )
        db.add(new_ticket)
        await db.flush()

        return {
            "id": str(new_ticket.id),
            "ticket_number": new_ticket.ticket_number,
            "subject": new_ticket.subject,
            "description": new_ticket.description,
            "category": new_ticket.category,
            "priority": new_ticket.priority,
            "status": new_ticket.status,
            "created_at": new_ticket.created_at.isoformat(),
            "message": "Support ticket created successfully",
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating support ticket: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/support/tickets/{ticket_id}", response_model=dict)
async def get_support_ticket(
    ticket_id: str,
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """
    Get a support ticket with its message thread.

    Only the ticket reporter (instructor) can view their own tickets.
    """
    try:
        from app.models.staff.ticket import StaffTicket, StaffTicketMessage

        # Fetch ticket
        result = await db.execute(
            select(StaffTicket)
            .where(StaffTicket.id == uuid.UUID(ticket_id))
        )
        ticket = result.scalar_one_or_none()

        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")

        if ticket.reporter_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You can only view your own tickets",
            )

        # Fetch messages
        messages_result = await db.execute(
            select(StaffTicketMessage, User.profile_data, User.email)
            .join(User, User.id == StaffTicketMessage.author_id)
            .where(StaffTicketMessage.ticket_id == uuid.UUID(ticket_id))
            .where(StaffTicketMessage.is_internal == False)  # noqa: E712
            .order_by(asc(StaffTicketMessage.created_at))
        )
        message_rows = messages_result.all()

        messages = []
        for mrow in message_rows:
            msg = mrow[0]
            msg_profile = mrow[1] or {}
            msg_email = mrow[2]
            messages.append({
                "id": str(msg.id),
                "ticket_id": str(msg.ticket_id),
                "sender_id": str(msg.author_id),
                "sender_name": msg_profile.get("full_name", msg_email),
                "message": msg.content,
                "attachments": msg.attachments or [],
                "created_at": msg.created_at.isoformat(),
            })

        return {
            "id": str(ticket.id),
            "ticket_number": ticket.ticket_number,
            "subject": ticket.subject,
            "description": ticket.description,
            "category": ticket.category,
            "priority": ticket.priority,
            "status": ticket.status,
            "resolution": ticket.resolution,
            "csat_score": ticket.csat_score,
            "created_at": ticket.created_at.isoformat(),
            "updated_at": ticket.updated_at.isoformat() if ticket.updated_at else None,
            "resolved_at": ticket.resolved_at.isoformat() if ticket.resolved_at else None,
            "messages": messages,
            "messages_count": len(messages),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching support ticket: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/support/tickets/{ticket_id}/messages", response_model=dict, status_code=201)
async def add_ticket_message(
    ticket_id: str,
    message: str = Query(..., min_length=1, description="Message content"),
    current_user: User = Depends(require_role(["instructor"])),
    db: AsyncSession = Depends(get_db),
):
    """
    Add a message to an existing support ticket.

    Only the ticket reporter (instructor) can add messages to their own tickets.
    """
    try:
        from app.models.staff.ticket import StaffTicket, StaffTicketMessage

        # Verify ticket exists and belongs to current user
        result = await db.execute(
            select(StaffTicket)
            .where(StaffTicket.id == uuid.UUID(ticket_id))
        )
        ticket = result.scalar_one_or_none()

        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")

        if ticket.reporter_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="You can only add messages to your own tickets",
            )

        if ticket.status == "closed":
            raise HTTPException(
                status_code=400,
                detail="Cannot add messages to a closed ticket",
            )

        new_message = StaffTicketMessage(
            id=uuid.uuid4(),
            ticket_id=uuid.UUID(ticket_id),
            author_id=current_user.id,
            content=message,
            is_internal=False,
        )
        db.add(new_message)
        await db.flush()

        profile_data = current_user.profile_data or {}
        return {
            "id": str(new_message.id),
            "ticket_id": str(new_message.ticket_id),
            "sender_id": str(new_message.author_id),
            "sender_name": profile_data.get("full_name", current_user.email),
            "message": new_message.content,
            "created_at": new_message.created_at.isoformat(),
            "ticket_status": ticket.status,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding ticket message: {e}")
        raise HTTPException(status_code=500, detail=str(e))
