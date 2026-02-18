"""Add admin infrastructure tables: audit_logs, permissions, role_permissions, user_permission_overrides

Revision ID: 002_admin_infrastructure
Revises: 001_enhanced_payments
Create Date: 2026-02-13

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

# revision identifiers, used by Alembic.
revision = '002_admin_infrastructure'
down_revision = '001_enhanced_payments'
branch_labels = None
depends_on = None


# Default permissions to seed
DEFAULT_PERMISSIONS = [
    # Users
    ("users.read", "users", "read", "View user profiles and lists"),
    ("users.create", "users", "create", "Create new user accounts"),
    ("users.update", "users", "update", "Edit user profiles"),
    ("users.delete", "users", "delete", "Deactivate or delete users"),
    # Courses
    ("courses.read", "courses", "read", "View course content and details"),
    ("courses.create", "courses", "create", "Create new courses"),
    ("courses.update", "courses", "update", "Edit existing courses"),
    ("courses.delete", "courses", "delete", "Archive or delete courses"),
    ("courses.approve", "courses", "approve", "Approve submitted courses"),
    # Enrollments
    ("enrollments.read", "enrollments", "read", "View enrollments"),
    ("enrollments.create", "enrollments", "create", "Create enrollments"),
    ("enrollments.update", "enrollments", "update", "Modify enrollments"),
    ("enrollments.approve", "enrollments", "approve", "Approve pending enrollments"),
    # Assessments
    ("assessments.read", "assessments", "read", "View assessments"),
    ("assessments.create", "assessments", "create", "Create assessments"),
    ("assessments.update", "assessments", "update", "Edit assessments"),
    ("assessments.override", "assessments", "override", "Override grades"),
    # Finance
    ("finance.read", "finance", "read", "View financial data"),
    ("finance.refund", "finance", "refund", "Process refunds"),
    ("finance.payout", "finance", "payout", "Process payouts"),
    # AI Systems
    ("ai.read", "ai", "read", "View AI monitoring data"),
    ("ai.configure", "ai", "configure", "Configure AI providers"),
    ("ai.override", "ai", "override", "Override AI content"),
    # Support
    ("tickets.read", "tickets", "read", "View support tickets"),
    ("tickets.update", "tickets", "update", "Respond to and manage tickets"),
    ("tickets.assign", "tickets", "assign", "Assign tickets to staff"),
    # Moderation
    ("moderation.read", "moderation", "read", "View moderation queue"),
    ("moderation.decide", "moderation", "decide", "Make moderation decisions"),
    # System
    ("config.read", "config", "read", "View system configuration"),
    ("config.update", "config", "update", "Request configuration changes"),
    ("config.approve", "config", "approve", "Approve configuration changes"),
    # Audit
    ("audit.read", "audit", "read", "View audit logs"),
    ("audit.export", "audit", "export", "Export audit logs"),
    # Partners
    ("partners.read", "partners", "read", "View partner data"),
    ("partners.manage", "partners", "manage", "Manage partner contracts"),
    # Certificates
    ("certificates.read", "certificates", "read", "View certificates"),
    ("certificates.issue", "certificates", "issue", "Issue certificates"),
    ("certificates.revoke", "certificates", "revoke", "Revoke certificates"),
    # Analytics
    ("analytics.read", "analytics", "read", "View analytics dashboards"),
    ("analytics.export", "analytics", "export", "Export analytics data"),
    # Permissions
    ("permissions.read", "permissions", "read", "View permission settings"),
    ("permissions.manage", "permissions", "manage", "Manage roles and permissions"),
]


def upgrade() -> None:
    """Create admin infrastructure tables and seed default permissions."""

    # 1. Create audit_logs table
    op.create_table(
        'audit_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('actor_id', postgresql.UUID(as_uuid=True), nullable=False, index=True),
        sa.Column('actor_email', sa.String(255), nullable=False),
        sa.Column('actor_role', sa.String(50), nullable=False),
        sa.Column('action', sa.String(100), nullable=False, index=True),
        sa.Column('resource_type', sa.String(100), nullable=False, index=True),
        sa.Column('resource_id', postgresql.UUID(as_uuid=True), nullable=True, index=True),
        sa.Column('details', postgresql.JSONB, server_default='{}'),
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('user_agent', sa.String(500), nullable=True),
        sa.Column('status', sa.String(20), server_default='success'),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.func.now(), index=True),
    )

    # Composite indexes for common query patterns
    op.create_index('ix_audit_actor_created', 'audit_logs', ['actor_id', 'created_at'])
    op.create_index('ix_audit_resource', 'audit_logs', ['resource_type', 'resource_id'])
    op.create_index('ix_audit_action_created', 'audit_logs', ['action', 'created_at'])

    # 2. Create permissions table
    op.create_table(
        'permissions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('name', sa.String(100), unique=True, nullable=False, index=True),
        sa.Column('description', sa.String(500), nullable=True),
        sa.Column('resource', sa.String(100), nullable=False, index=True),
        sa.Column('action', sa.String(50), nullable=False),
        sa.Column('field_restrictions', postgresql.JSONB, server_default='{}'),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
    )

    # 3. Create role_permissions table
    op.create_table(
        'role_permissions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('role', sa.String(50), nullable=False, index=True),
        sa.Column('permission_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('permissions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('granted_by', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id'), nullable=True),
        sa.Column('granted_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
        sa.Column('expires_at', sa.DateTime, nullable=True),
    )

    # 4. Create user_permission_overrides table
    op.create_table(
        'user_permission_overrides',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('user_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('permission_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('permissions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('granted', sa.Boolean, nullable=False, server_default=sa.text('true')),
        sa.Column('granted_by', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id'), nullable=True),
        sa.Column('reason', sa.Text, nullable=True),
        sa.Column('expires_at', sa.DateTime, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.func.now()),
    )

    # 5. Seed default permissions
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

    # Insert all default permissions and grant to admin role
    for name, resource, action, description in DEFAULT_PERMISSIONS:
        perm_id = uuid.uuid4()

        op.bulk_insert(permissions_table, [{
            'id': perm_id,
            'name': name,
            'resource': resource,
            'action': action,
            'description': description,
        }])

        # Grant all permissions to admin role
        op.bulk_insert(role_permissions_table, [{
            'id': uuid.uuid4(),
            'role': 'admin',
            'permission_id': perm_id,
        }])

        # Grant read permissions to staff role
        if action == 'read':
            op.bulk_insert(role_permissions_table, [{
                'id': uuid.uuid4(),
                'role': 'staff',
                'permission_id': perm_id,
            }])


def downgrade() -> None:
    """Remove admin infrastructure tables."""
    op.drop_table('user_permission_overrides')
    op.drop_table('role_permissions')
    op.drop_table('permissions')
    op.drop_index('ix_audit_action_created', table_name='audit_logs')
    op.drop_index('ix_audit_resource', table_name='audit_logs')
    op.drop_index('ix_audit_actor_created', table_name='audit_logs')
    op.drop_table('audit_logs')
