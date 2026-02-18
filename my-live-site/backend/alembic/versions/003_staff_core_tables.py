"""Add staff core tables: staff_teams, staff_profiles, and seed staff permissions

Revision ID: 003_staff_core_tables
Revises: 002_admin_infrastructure
Create Date: 2026-02-13

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

# revision identifiers, used by Alembic.
revision = '003_staff_core_tables'
down_revision = '002_admin_infrastructure'
branch_labels = None
depends_on = None


# Staff-specific permissions to seed
STAFF_PERMISSIONS = [
    ("staff.dashboard.read", "staff_dashboard", "read", "View staff dashboard"),
    ("staff.tickets.read", "staff_tickets", "read", "View support tickets"),
    ("staff.tickets.manage", "staff_tickets", "manage", "Manage support tickets"),
    ("staff.tickets.assign", "staff_tickets", "assign", "Assign tickets to staff members"),
    ("staff.content.read", "staff_content", "read", "View content items"),
    ("staff.content.create", "staff_content", "create", "Create new content items"),
    ("staff.content.approve", "staff_content", "approve", "Approve content for publishing"),
    ("staff.assessments.create", "staff_assessments", "create", "Create adaptive assessments"),
    ("staff.assessments.grade", "staff_assessments", "grade", "Grade student assessments"),
    ("staff.sessions.host", "staff_sessions", "host", "Host live teaching sessions"),
    ("staff.kb.manage", "staff_kb", "manage", "Manage knowledge base articles"),
    ("staff.reports.create", "staff_reports", "create", "Create and schedule reports"),
    ("staff.team.view", "staff_team", "view", "View team information"),
    ("staff.team.lead", "staff_team", "lead", "Manage team as department lead"),
    ("staff.moderation.review", "staff_moderation", "review", "Review moderation queue items"),
]


def upgrade() -> None:
    """Create staff core tables and seed staff permissions."""

    # 1. Create staff_teams table
    op.create_table(
        'staff_teams',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('department', sa.String(100), nullable=False),
        sa.Column('lead_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('metadata', postgresql.JSONB, server_default='{}'),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text("now()")),
    )

    # 2. Create staff_profiles table
    op.create_table(
        'staff_profiles',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column('user_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False),
        sa.Column('department', sa.String(100), server_default='General'),
        sa.Column('position', sa.String(100), nullable=False),
        sa.Column('employee_id', sa.String(50), unique=True, nullable=True),
        sa.Column('specializations', postgresql.JSONB, server_default='[]'),
        sa.Column('view_mode', sa.String(30), server_default='teacher_focus'),
        sa.Column('custom_layout', postgresql.JSONB, server_default='{}'),
        sa.Column('availability', postgresql.JSONB, server_default='{}'),
        sa.Column('team_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('staff_teams.id', ondelete='SET NULL'), nullable=True),
        sa.Column('is_department_lead', sa.Boolean, nullable=False, server_default=sa.text('false')),
        sa.Column('hired_at', sa.Date, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text("now()")),
        sa.Column('updated_at', sa.DateTime, nullable=True, server_default=sa.text("now()")),
    )

    # 3. Seed staff permissions
    permissions_table = sa.table(
        'permissions',
        sa.column('id', postgresql.UUID),
        sa.column('name', sa.String),
        sa.column('resource', sa.String),
        sa.column('action', sa.String),
        sa.column('description', sa.String),
    )

    role_permissions_table = sa.table(
        'role_permissions',
        sa.column('id', postgresql.UUID),
        sa.column('role', sa.String),
        sa.column('permission_id', postgresql.UUID),
    )

    for name, resource, action, description in STAFF_PERMISSIONS:
        perm_id = uuid.uuid4()

        op.bulk_insert(permissions_table, [{
            'id': perm_id,
            'name': name,
            'resource': resource,
            'action': action,
            'description': description,
        }])

        # Grant all staff permissions to staff role
        op.bulk_insert(role_permissions_table, [{
            'id': uuid.uuid4(),
            'role': 'staff',
            'permission_id': perm_id,
        }])

        # Grant all staff permissions to admin role as well
        op.bulk_insert(role_permissions_table, [{
            'id': uuid.uuid4(),
            'role': 'admin',
            'permission_id': perm_id,
        }])


def downgrade() -> None:
    """Remove staff core tables and seeded permissions."""
    op.drop_table('staff_profiles')
    op.drop_table('staff_teams')

    # Remove seeded staff permissions
    for name, _, _, _ in STAFF_PERMISSIONS:
        op.execute(f"DELETE FROM role_permissions WHERE permission_id IN (SELECT id FROM permissions WHERE name = '{name}')")
        op.execute(f"DELETE FROM permissions WHERE name = '{name}'")
