"""
Knowledge Base Service

Article CRUD, vector-search via pgvector embeddings, and AI-powered
KB article suggestions for support tickets.
"""

import logging
import math
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from sqlalchemy import select, func, and_, text, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.staff.knowledge_article import KBArticle, KBEmbedding, KBCategory
from app.services.ai_orchestrator import AIOrchestrator

logger = logging.getLogger(__name__)

# Embedding dimension (OpenAI text-embedding-ada-002 compatible)
EMBEDDING_DIMENSION = 1536
# Maximum chunk size for embedding generation
CHUNK_SIZE = 500


async def list_articles(
    db: AsyncSession,
    filters: Optional[Dict[str, Any]] = None,
    page: int = 1,
    page_size: int = 20,
) -> Dict[str, Any]:
    """Return a paginated list of KB articles with optional filters."""
    try:
        filters = filters or {}
        conditions = []

        if filters.get("status"):
            conditions.append(KBArticle.status == filters["status"])
        if filters.get("category_id"):
            conditions.append(KBArticle.category_id == filters["category_id"])
        if filters.get("is_internal") is not None:
            conditions.append(KBArticle.is_internal == filters["is_internal"])
        if filters.get("search"):
            search_term = f"%{filters['search']}%"
            conditions.append(
                KBArticle.title.ilike(search_term)
            )
        if filters.get("author_id"):
            conditions.append(KBArticle.author_id == filters["author_id"])

        where_clause = and_(*conditions) if conditions else True

        # Total count
        total_q = select(func.count(KBArticle.id)).where(where_clause)
        total_result = await db.execute(total_q)
        total: int = total_result.scalar() or 0
        total_pages = math.ceil(total / page_size) if page_size > 0 else 0

        # Paginated items
        offset = (page - 1) * page_size
        items_q = (
            select(KBArticle)
            .where(where_clause)
            .order_by(KBArticle.updated_at.desc())
            .offset(offset)
            .limit(page_size)
        )
        items_result = await db.execute(items_q)
        articles = items_result.scalars().all()

        item_list = [
            {
                "id": str(a.id),
                "title": a.title,
                "slug": a.slug,
                "body": a.body[:300] if a.body else "",
                "category_id": str(a.category_id) if a.category_id else None,
                "tags": a.tags or [],
                "status": a.status,
                "author_id": str(a.author_id),
                "is_internal": a.is_internal,
                "view_count": a.view_count,
                "helpful_count": a.helpful_count,
                "created_at": a.created_at.isoformat(),
                "updated_at": a.updated_at.isoformat() if a.updated_at else None,
            }
            for a in articles
        ]

        return {
            "items": item_list,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
        }

    except Exception as e:
        logger.error(f"Error listing KB articles: {e}")
        raise


async def get_article(db: AsyncSession, article_id: str) -> Optional[Dict[str, Any]]:
    """Return a single KB article with full body."""
    try:
        q = select(KBArticle).where(KBArticle.id == article_id)
        result = await db.execute(q)
        a = result.scalar_one_or_none()

        if not a:
            return None

        return {
            "id": str(a.id),
            "title": a.title,
            "slug": a.slug,
            "body": a.body,
            "body_html": a.body_html,
            "category_id": str(a.category_id) if a.category_id else None,
            "tags": a.tags or [],
            "status": a.status,
            "author_id": str(a.author_id),
            "is_internal": a.is_internal,
            "view_count": a.view_count,
            "helpful_count": a.helpful_count,
            "not_helpful_count": a.not_helpful_count,
            "metadata": a.metadata or {},
            "published_at": a.published_at.isoformat() if a.published_at else None,
            "created_at": a.created_at.isoformat(),
            "updated_at": a.updated_at.isoformat() if a.updated_at else None,
        }

    except Exception as e:
        logger.error(f"Error fetching KB article {article_id}: {e}")
        raise


async def create_article(
    db: AsyncSession,
    author_id: str,
    article_data: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Create a new KB article and generate embeddings for vector search.
    """
    try:
        article = KBArticle(
            id=uuid.uuid4(),
            title=article_data["title"],
            slug=article_data["slug"],
            body=article_data["body"],
            category_id=article_data.get("category_id"),
            tags=article_data.get("tags", []),
            is_internal=article_data.get("is_internal", False),
            author_id=author_id,
            status="draft",
        )
        db.add(article)
        await db.flush()

        # Generate embeddings asynchronously
        try:
            await _generate_embeddings(db, str(article.id), article.body)
        except Exception as emb_error:
            logger.warning(
                f"Embedding generation failed for article {article.id}: {emb_error}"
            )

        logger.info(f"KB article created: {article.title} by {author_id}")

        return {
            "id": str(article.id),
            "title": article.title,
            "slug": article.slug,
            "status": article.status,
            "created_at": article.created_at.isoformat(),
        }

    except Exception as e:
        logger.error(f"Error creating KB article: {e}")
        raise


async def update_article(
    db: AsyncSession,
    article_id: str,
    update_data: Dict[str, Any],
) -> Optional[Dict[str, Any]]:
    """Update a KB article and regenerate embeddings if body changed."""
    try:
        q = select(KBArticle).where(KBArticle.id == article_id)
        result = await db.execute(q)
        article = result.scalar_one_or_none()

        if not article:
            return None

        body_changed = False
        for key, value in update_data.items():
            if value is not None and hasattr(article, key):
                if key == "body":
                    body_changed = True
                setattr(article, key, value)

        article.updated_at = datetime.utcnow()

        if update_data.get("status") == "published" and not article.published_at:
            article.published_at = datetime.utcnow()

        await db.flush()

        # Regenerate embeddings if body changed
        if body_changed and article.body:
            try:
                await _generate_embeddings(db, str(article.id), article.body)
            except Exception as emb_error:
                logger.warning(f"Embedding regeneration failed: {emb_error}")

        logger.info(f"KB article {article_id} updated")

        return {
            "id": str(article.id),
            "title": article.title,
            "status": article.status,
            "updated_at": article.updated_at.isoformat(),
        }

    except Exception as e:
        logger.error(f"Error updating KB article {article_id}: {e}")
        raise


async def delete_article(db: AsyncSession, article_id: str) -> bool:
    """Soft delete a KB article by setting status to 'archived'."""
    try:
        q = select(KBArticle).where(KBArticle.id == article_id)
        result = await db.execute(q)
        article = result.scalar_one_or_none()

        if not article:
            return False

        article.status = "archived"
        article.updated_at = datetime.utcnow()
        await db.flush()

        # Clean up embeddings
        await db.execute(
            delete(KBEmbedding).where(KBEmbedding.article_id == article_id)
        )

        logger.info(f"KB article {article_id} archived (soft delete)")
        return True

    except Exception as e:
        logger.error(f"Error deleting KB article {article_id}: {e}")
        raise


async def vector_search(
    db: AsyncSession,
    query_text: str,
    limit: int = 5,
) -> List[Dict[str, Any]]:
    """
    Embed the query text and perform cosine similarity search against
    KB article embeddings using pgvector.

    Falls back to basic keyword search if pgvector is not available.
    """
    try:
        # Generate query embedding
        query_embedding = await _get_embedding_vector(query_text)

        if query_embedding:
            # pgvector cosine similarity search
            # Uses raw SQL because SQLAlchemy does not natively support vector ops
            embedding_str = "[" + ",".join(str(v) for v in query_embedding) + "]"
            sql = text("""
                SELECT
                    e.article_id,
                    a.title,
                    a.slug,
                    e.chunk_text,
                    1 - (e.embedding <=> :query_vec::vector) AS similarity
                FROM kb_embeddings e
                JOIN kb_articles a ON a.id = e.article_id
                WHERE a.status = 'published'
                ORDER BY e.embedding <=> :query_vec::vector
                LIMIT :limit
            """)
            result = await db.execute(
                sql,
                {"query_vec": embedding_str, "limit": limit},
            )
            rows = result.fetchall()

            return [
                {
                    "article_id": str(row[0]),
                    "title": row[1],
                    "slug": row[2],
                    "snippet": row[3][:200],
                    "similarity_score": round(float(row[4]), 4),
                }
                for row in rows
            ]

        # Fallback: keyword search
        logger.info("Vector search unavailable, falling back to keyword search")
        return await _keyword_search(db, query_text, limit)

    except Exception as e:
        logger.warning(f"Vector search failed, using keyword fallback: {e}")
        return await _keyword_search(db, query_text, limit)


async def get_ai_suggestions(
    db: AsyncSession,
    ticket_text: str,
    limit: int = 5,
) -> Dict[str, Any]:
    """
    Given ticket text, find similar KB articles and optionally generate
    an AI summary of the best matches.
    """
    try:
        results = await vector_search(db, ticket_text, limit)

        # Generate AI summary if results found
        ai_summary = None
        if results:
            try:
                orchestrator = AIOrchestrator(db)
                await orchestrator.load_providers()
                titles = ", ".join(r["title"] for r in results[:3])
                response = await orchestrator.route_query(
                    query=(
                        f"A support ticket says: '{ticket_text[:500]}'. "
                        f"The following KB articles may be relevant: {titles}. "
                        "Provide a brief summary of which articles would help resolve "
                        "this ticket and why."
                    ),
                    context={"task": "kb_suggestion"},
                    response_mode="text",
                )
                ai_summary = response.get("message")
            except Exception as ai_error:
                logger.warning(f"AI summary generation failed: {ai_error}")

        return {
            "suggestions": results,
            "ai_summary": ai_summary,
        }

    except Exception as e:
        logger.error(f"Error generating AI suggestions: {e}")
        return {"suggestions": [], "ai_summary": None}


async def _generate_embeddings(
    db: AsyncSession,
    article_id: str,
    body_text: str,
) -> None:
    """
    Split article body into chunks, generate embeddings via AI, and
    store them in the kb_embeddings table.
    """
    try:
        # Remove existing embeddings for this article
        await db.execute(
            delete(KBEmbedding).where(KBEmbedding.article_id == article_id)
        )

        # Split text into chunks
        chunks = _split_into_chunks(body_text, CHUNK_SIZE)

        for idx, chunk in enumerate(chunks):
            embedding = KBEmbedding(
                id=uuid.uuid4(),
                article_id=article_id,
                chunk_text=chunk,
                chunk_index=idx,
            )
            db.add(embedding)

            # Generate the actual vector embedding
            # The vector column is populated via raw SQL after the row is created
            vector = await _get_embedding_vector(chunk)
            if vector:
                await db.execute(
                    text(
                        "UPDATE kb_embeddings SET embedding = :vec::vector "
                        "WHERE id = :emb_id"
                    ),
                    {"vec": "[" + ",".join(str(v) for v in vector) + "]", "emb_id": embedding.id},
                )

        await db.flush()
        logger.info(f"Generated {len(chunks)} embeddings for article {article_id}")

    except Exception as e:
        logger.warning(f"Embedding generation error for article {article_id}: {e}")


async def _get_embedding_vector(text_input: str) -> Optional[List[float]]:
    """
    Generate an embedding vector for the given text using the AI orchestrator.

    Returns None if embedding generation is unavailable.
    """
    try:
        from app.config import settings

        if settings.openai_api_key:
            from openai import OpenAI

            client = OpenAI(api_key=settings.openai_api_key)
            response = client.embeddings.create(
                model="text-embedding-ada-002",
                input=text_input[:8000],
            )
            return response.data[0].embedding

        logger.debug("No embedding provider configured")
        return None

    except Exception as e:
        logger.warning(f"Embedding generation failed: {e}")
        return None


def _split_into_chunks(text_body: str, chunk_size: int) -> List[str]:
    """Split text into overlapping chunks for embedding."""
    words = text_body.split()
    chunks = []
    overlap = chunk_size // 5  # 20% overlap

    i = 0
    while i < len(words):
        chunk = " ".join(words[i : i + chunk_size])
        if chunk.strip():
            chunks.append(chunk.strip())
        i += chunk_size - overlap

    return chunks if chunks else [text_body[:2000]]


async def _keyword_search(
    db: AsyncSession,
    query_text: str,
    limit: int,
) -> List[Dict[str, Any]]:
    """Fallback keyword-based article search."""
    try:
        search_term = f"%{query_text}%"
        q = (
            select(KBArticle)
            .where(
                and_(
                    KBArticle.status == "published",
                    KBArticle.title.ilike(search_term),
                )
            )
            .order_by(KBArticle.helpful_count.desc())
            .limit(limit)
        )
        result = await db.execute(q)
        articles = result.scalars().all()

        return [
            {
                "article_id": str(a.id),
                "title": a.title,
                "slug": a.slug,
                "snippet": (a.body or "")[:200],
                "similarity_score": 0.5,
                "tags": a.tags or [],
            }
            for a in articles
        ]

    except Exception as e:
        logger.error(f"Keyword search failed: {e}")
        return []
