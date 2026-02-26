"""add_user_avatars_table

Revision ID: 023ea9a2808d
Revises: perf_001
Create Date: 2026-02-22 14:00:47.956670

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '023ea9a2808d'
down_revision: Union[str, None] = 'perf_001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create user_avatars table
    op.create_table('user_avatars',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('user_id', sa.UUID(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('avatar_type', sa.Enum('preset_stylized', 'preset_realistic', 'custom_rpm', name='avatartype'), nullable=False),
    sa.Column('model_url', sa.String(length=500), nullable=False),
    sa.Column('thumbnail_url', sa.String(length=500), nullable=True),
    sa.Column('rpm_avatar_id', sa.String(length=200), nullable=True),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('customization_data', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_user_avatars_id'), 'user_avatars', ['id'], unique=False)
    op.create_index(op.f('ix_user_avatars_is_active'), 'user_avatars', ['is_active'], unique=False)
    op.create_index(op.f('ix_user_avatars_user_id'), 'user_avatars', ['user_id'], unique=False)

    # Add active_avatar_id column to ai_agent_profiles
    op.add_column('ai_agent_profiles', sa.Column('active_avatar_id', sa.UUID(), nullable=True))
    op.create_foreign_key('fk_ai_agent_profiles_active_avatar', 'ai_agent_profiles', 'user_avatars', ['active_avatar_id'], ['id'], ondelete='SET NULL')


def downgrade() -> None:
    # Remove active_avatar_id from ai_agent_profiles
    op.drop_constraint('fk_ai_agent_profiles_active_avatar', 'ai_agent_profiles', type_='foreignkey')
    op.drop_column('ai_agent_profiles', 'active_avatar_id')

    # Drop user_avatars table
    op.drop_index(op.f('ix_user_avatars_user_id'), table_name='user_avatars')
    op.drop_index(op.f('ix_user_avatars_is_active'), table_name='user_avatars')
    op.drop_index(op.f('ix_user_avatars_id'), table_name='user_avatars')
    op.drop_table('user_avatars')

    # Drop the enum type
    op.execute('DROP TYPE IF EXISTS avatartype')
