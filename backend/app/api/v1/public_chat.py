"""
Public Bird Chat API

Unauthenticated endpoint for the homepage /bot page. Calls the AI
orchestrator directly with a general-knowledge system prompt. No user
data is read from the database — only the public course catalog is
queried to suggest relevant courses.

Rate-limited to 20 requests per minute per IP address via Redis.
"""

import logging
import time
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.course import Course
from app.services.ai_orchestrator import get_orchestrator

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/public", tags=["Public Chat"])

# ── Rate-limiting constants ────────────────────────────────────────────────
RATE_LIMIT_REQUESTS = 20   # max requests
RATE_LIMIT_WINDOW   = 60   # per 60 seconds

SYSTEM_PROMPT = (
    "You are The Bird AI, a friendly and knowledgeable educational assistant from "
    "Urban Home School — an e-learning platform for Kenyan children following the "
    "Competency-Based Curriculum (CBC). "
    "Help visitors with any educational question: explain concepts, answer curiosity "
    "questions, and give study tips. Keep answers concise, engaging, and age-appropriate. "
    "You can mention that the platform offers online courses for Kenyan students, but "
    "do not share any internal user data, pricing details, or confidential information. "
    "If asked to do anything harmful or off-topic, politely redirect back to learning.\n\n"
    "LANGUAGE:\n"
    "- You are fluently bilingual in English and Kiswahili.\n"
    "- Respond in the same language the user writes in. If they write in Kiswahili, reply in Kiswahili. "
    "If they write in English, reply in English.\n"
    "- If the user mixes both languages (Sheng or code-switching), respond naturally in the same style.\n"
    "- You may sprinkle friendly Kiswahili greetings (Habari, Karibu, Hongera) even in English replies "
    "to feel warm and relatable to Kenyan visitors.\n"
    "- Always keep educational terms accurate in both languages."
)


# ── Pydantic schemas ───────────────────────────────────────────────────────

class PublicChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    response_mode: str = Field(default="text", pattern="^(text|voice)$")


class SuggestedCourse(BaseModel):
    name: str
    learning_area: str
    url: str


class PublicChatResponse(BaseModel):
    message: str
    suggested_course: Optional[SuggestedCourse] = None


# ── Helpers ────────────────────────────────────────────────────────────────

async def _check_rate_limit(request: Request) -> None:
    """Enforce 20 req/min per client IP using Redis sliding window."""
    try:
        from app.redis import get_redis
        redis = get_redis()
    except Exception:
        # If Redis is unavailable, allow the request through rather than blocking all public users
        logger.warning("Redis unavailable — skipping public chat rate limit")
        return

    client_ip = request.client.host if request.client else "unknown"
    key = f"public_chat_ratelimit:{client_ip}"

    try:
        pipe = redis.pipeline()
        now = int(time.time())
        window_start = now - RATE_LIMIT_WINDOW

        # Use a sorted set: score = timestamp, member = timestamp
        await pipe.zremrangebyscore(key, "-inf", window_start)
        await pipe.zadd(key, {str(now): now})
        await pipe.zcard(key)
        await pipe.expire(key, RATE_LIMIT_WINDOW + 5)
        results = await pipe.execute()

        request_count = results[2]  # zcard result
        if request_count > RATE_LIMIT_REQUESTS:
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. Maximum {RATE_LIMIT_REQUESTS} requests per minute.",
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.warning(f"Rate limit check failed: {str(e)} — allowing request")


async def _find_course_suggestion(
    db: AsyncSession,
    message: str,
) -> Optional[SuggestedCourse]:
    """
    Search published courses for keywords found in the user's message.
    Returns the best matching course, or None.
    """
    # Extract meaningful words (ignore short words)
    words = [w.strip("?!.,") for w in message.split() if len(w.strip("?!.,")) > 3]
    if not words:
        return None

    try:
        # Build OR filter across title, description, and learning_area
        conditions = []
        for word in words[:6]:  # limit to first 6 meaningful words
            word_lower = word.lower()
            conditions.append(Course.title.ilike(f"%{word_lower}%"))
            conditions.append(Course.description.ilike(f"%{word_lower}%"))
            conditions.append(Course.learning_area.ilike(f"%{word_lower}%"))

        stmt = (
            select(Course.id, Course.title, Course.learning_area)
            .where(Course.is_published == True)
            .where(or_(*conditions))
            .limit(1)
        )
        result = await db.execute(stmt)
        row = result.first()

        if row:
            return SuggestedCourse(
                name=row.title,
                learning_area=row.learning_area,
                url=f"/courses/{row.id}",
            )
    except Exception as e:
        logger.warning(f"Course suggestion query failed: {str(e)}")

    return None


# ── Endpoint ───────────────────────────────────────────────────────────────

@router.post("/chat", response_model=PublicChatResponse)
async def public_chat(
    request_body: PublicChatRequest,
    http_request: Request,
    db: AsyncSession = Depends(get_db),
) -> PublicChatResponse:
    """
    Send a message to The Bird AI public chat interface.

    No authentication required. Does not persist conversation history.
    Rate-limited to 20 requests per minute per IP.

    Returns an AI-generated educational response plus an optional
    suggestion for a relevant published course.
    """
    # Enforce rate limit
    await _check_rate_limit(http_request)

    try:
        # Route through the AI orchestrator
        orchestrator = await get_orchestrator(db)
        ai_result = await orchestrator.route_query(
            query=request_body.message,
            context={"system_message": SYSTEM_PROMPT},
            response_mode="text",  # Public chat always returns text
        )
        ai_message = ai_result.get("message", "Sorry, I couldn't generate a response right now. Please try again!")

    except Exception as e:
        logger.error(f"Public chat orchestrator error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="The AI is temporarily unavailable. Please try again shortly.",
        )

    # Find a relevant course suggestion (non-blocking — failure is OK)
    suggested_course = await _find_course_suggestion(db, request_body.message)

    return PublicChatResponse(
        message=ai_message,
        suggested_course=suggested_course,
    )
