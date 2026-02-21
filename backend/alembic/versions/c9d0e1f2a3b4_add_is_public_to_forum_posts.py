"""add is_public to forum_posts

Revision ID: c9d0e1f2a3b4
Revises: b7c8d9e0f1a2
Create Date: 2026-02-21 13:00:00.000000

"""
from typing import Union
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'c9d0e1f2a3b4'
down_revision: Union[str, None] = 'b7c8d9e0f1a2'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'forum_posts',
        sa.Column('is_public', sa.Boolean(), nullable=False, server_default='true'),
    )
    op.create_index('ix_forum_posts_is_public', 'forum_posts', ['is_public'])


def downgrade() -> None:
    op.drop_index('ix_forum_posts_is_public', table_name='forum_posts')
    op.drop_column('forum_posts', 'is_public')
