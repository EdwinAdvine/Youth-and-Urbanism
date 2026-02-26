"""Add knowledge base tables: kb_categories, kb_articles, kb_embeddings with pgvector

Revision ID: 006_staff_knowledge_base
Revises: 005_staff_content_assessments
Create Date: 2026-02-13

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

# revision identifiers, used by Alembic.
revision = '006_staff_knowledge_base'
down_revision = '005_staff_content_assessments'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create knowledge base tables with pgvector support."""

    # 0. Enable pgvector extension
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    # 1. Create kb_categories table
    op.create_table(
        'kb_categories',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('slug', sa.String(100), unique=True, nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('parent_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('kb_categories.id', ondelete='SET NULL'), nullable=True),
        sa.Column('sort_order', sa.Integer, server_default='0'),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text("now()")),
    )

    # 2. Create kb_articles table
    op.create_table(
        'kb_articles',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('slug', sa.String(255), unique=True, nullable=False),
        sa.Column('body', sa.Text, nullable=False),
        sa.Column('body_html', sa.Text, nullable=True),
        sa.Column('category_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('kb_categories.id', ondelete='SET NULL'), nullable=True),
        sa.Column('tags', postgresql.JSONB, server_default='[]'),
        sa.Column('status', sa.String(30), server_default='draft'),
        sa.Column('author_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('view_count', sa.Integer, server_default='0'),
        sa.Column('helpful_count', sa.Integer, server_default='0'),
        sa.Column('not_helpful_count', sa.Integer, server_default='0'),
        sa.Column('is_internal', sa.Boolean, nullable=False, server_default=sa.text('false')),
        sa.Column('metadata', postgresql.JSONB, server_default='{}'),
        sa.Column('published_at', sa.DateTime, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text("now()")),
        sa.Column('updated_at', sa.DateTime, nullable=True, server_default=sa.text("now()")),
    )

    # 3. Create kb_embeddings table (without the vector column initially)
    op.create_table(
        'kb_embeddings',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column('article_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('kb_articles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('chunk_text', sa.Text, nullable=False),
        sa.Column('chunk_index', sa.Integer, nullable=False),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text("now()")),
    )

    # 4. Add pgvector embedding column via raw SQL
    op.execute("ALTER TABLE kb_embeddings ADD COLUMN embedding vector(1536)")

    # 5. Create HNSW index for vector similarity search
    op.execute("CREATE INDEX ix_kb_embedding_vector ON kb_embeddings USING hnsw (embedding vector_cosine_ops)")


def downgrade() -> None:
    """Remove knowledge base tables."""
    op.execute("DROP INDEX IF EXISTS ix_kb_embedding_vector")
    op.drop_table('kb_embeddings')
    op.drop_table('kb_articles')
    op.drop_table('kb_categories')
    op.execute("DROP EXTENSION IF EXISTS vector")
