"""
Knowledge Base Models

Internal and public knowledge base for staff and users. KBCategory provides
a hierarchical category tree. KBArticle stores articles with rich text,
tagging, and helpfulness ratings. KBEmbedding stores chunked text for
semantic search (the actual vector column must be added via raw SQL
migration using pgvector).
"""

import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, DateTime, UUID, Index, Boolean, Integer, Text, ForeignKey,
)
from sqlalchemy.dialects.postgresql import JSONB
from app.database import Base


class KBCategory(Base):
    """
    Hierarchical knowledge-base category.

    Supports nested categories via self-referential parent_id. Sort order
    controls display position within a given parent level.
    """

    __tablename__ = "kb_categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    parent_id = Column(
        UUID(as_uuid=True),
        ForeignKey("kb_categories.id", ondelete="SET NULL"),
        nullable=True,
    )
    sort_order = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<KBCategory(name='{self.name}', slug='{self.slug}')>"


class KBArticle(Base):
    """
    Knowledge-base article with rich content and helpfulness tracking.

    Articles can be internal (staff-only) or public. Tags, status, and
    category support filtering and workflow management. View and
    helpful/not-helpful counters drive content quality metrics.
    """

    __tablename__ = "kb_articles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    body = Column(Text, nullable=False)
    body_html = Column(Text, nullable=True)

    # Categorization
    category_id = Column(
        UUID(as_uuid=True),
        ForeignKey("kb_categories.id", ondelete="SET NULL"),
        nullable=True,
    )
    tags = Column(JSONB, default=[])
    status = Column(String(30), default="draft", nullable=False)

    # Authorship
    author_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    # Engagement metrics
    view_count = Column(Integer, default=0, nullable=False)
    helpful_count = Column(Integer, default=0, nullable=False)
    not_helpful_count = Column(Integer, default=0, nullable=False)

    # Visibility
    is_internal = Column(Boolean, default=False, nullable=False)

    # Metadata
    extra_data = Column(JSONB, default={})

    # Timestamps
    published_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    __table_args__ = (
        Index("ix_kb_articles_category_id", "category_id"),
        Index("ix_kb_articles_status", "status"),
    )

    def __repr__(self) -> str:
        return (
            f"<KBArticle(title='{self.title}', "
            f"status='{self.status}', internal={self.is_internal})>"
        )


class KBEmbedding(Base):
    """
    Chunked text embedding for semantic search over knowledge-base articles.

    Each row stores a text chunk and its index within the source article.
    The actual embedding vector column (e.g., vector(1536)) must be added
    via a raw SQL migration using the pgvector extension, as SQLAlchemy
    does not natively support the vector type. Example migration SQL:

        ALTER TABLE kb_embeddings
        ADD COLUMN embedding vector(1536);
        CREATE INDEX ix_kb_embeddings_vector
        ON kb_embeddings USING ivfflat (embedding vector_cosine_ops);
    """

    __tablename__ = "kb_embeddings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    article_id = Column(
        UUID(as_uuid=True),
        ForeignKey("kb_articles.id", ondelete="CASCADE"),
        nullable=False,
    )
    chunk_text = Column(Text, nullable=False)
    chunk_index = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index("ix_kb_embeddings_article_id", "article_id"),
    )

    def __repr__(self) -> str:
        return (
            f"<KBEmbedding(article_id={self.article_id}, "
            f"chunk_index={self.chunk_index})>"
        )
