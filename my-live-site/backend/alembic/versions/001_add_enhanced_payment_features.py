"""Add enhanced payment features: subscriptions, refunds, currency, and analytics

Revision ID: 001_enhanced_payments
Revises:
Create Date: 2026-02-12

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

# revision identifiers, used by Alembic.
revision = '001_enhanced_payments'
down_revision = '000_initial_schema'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Upgrade database with enhanced payment features."""

    # Create enum types
    op.execute("CREATE TYPE billing_cycle_enum AS ENUM ('weekly', 'monthly', 'quarterly', 'semi_annual', 'annual')")
    op.execute("CREATE TYPE subscription_status_enum AS ENUM ('active', 'trialing', 'paused', 'past_due', 'cancelled', 'expired', 'suspended')")
    op.execute("CREATE TYPE plan_type_enum AS ENUM ('course_access', 'platform_access', 'premium_features', 'bundle')")
    op.execute("CREATE TYPE refund_status_enum AS ENUM ('pending', 'approved', 'rejected', 'processing', 'completed', 'failed')")
    op.execute("CREATE TYPE refund_type_enum AS ENUM ('full', 'partial', 'prorated')")
    op.execute("CREATE TYPE refund_reason_enum AS ENUM ('accidental_purchase', 'course_not_as_described', 'technical_issues', 'poor_quality', 'duplicate_payment', 'did_not_use', 'financial_hardship', 'other')")

    # 1. Create subscription_plans table
    op.create_table(
        'subscription_plans',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('plan_type', postgresql.ENUM(name='plan_type_enum', create_type=False), nullable=False),
        sa.Column('billing_cycle', postgresql.ENUM(name='billing_cycle_enum', create_type=False), nullable=False),
        sa.Column('price', sa.Numeric(10, 2), nullable=False),
        sa.Column('currency', sa.String(3), nullable=False, server_default='KES'),
        sa.Column('trial_days', sa.Integer, nullable=False, server_default='0'),
        sa.Column('features', postgresql.JSONB, nullable=False, server_default='[]'),
        sa.Column('course_ids', postgresql.JSONB, nullable=False, server_default='[]'),
        sa.Column('max_enrollments', sa.Integer, nullable=False, server_default='-1'),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default='true'),
        sa.Column('is_popular', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('display_order', sa.Integer, nullable=False, server_default='0'),
        sa.Column('meta', postgresql.JSONB, nullable=False, server_default='{}'),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime, nullable=False, server_default=sa.text('now()')),
    )

    # Create indexes for subscription_plans
    op.create_index('idx_subscription_plans_type_active', 'subscription_plans', ['plan_type', 'is_active'])
    op.create_index('idx_subscription_plans_billing_cycle', 'subscription_plans', ['billing_cycle'])
    op.create_index('idx_subscription_plans_display', 'subscription_plans', ['is_active', 'display_order'])

    # 2. Create subscriptions table
    op.create_table(
        'subscriptions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('plan_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('subscription_plans.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('enrollment_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('enrollments.id', ondelete='SET NULL'), nullable=True),
        sa.Column('payment_method_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('payment_methods.id', ondelete='SET NULL'), nullable=True),
        sa.Column('status', postgresql.ENUM(name='subscription_status_enum', create_type=False), nullable=False, server_default='active'),
        sa.Column('current_period_start', sa.DateTime, nullable=False),
        sa.Column('current_period_end', sa.DateTime, nullable=False),
        sa.Column('trial_start', sa.DateTime, nullable=True),
        sa.Column('trial_end', sa.DateTime, nullable=True),
        sa.Column('cancel_at_period_end', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('cancelled_at', sa.DateTime, nullable=True),
        sa.Column('ended_at', sa.DateTime, nullable=True),
        sa.Column('next_billing_date', sa.DateTime, nullable=True),
        sa.Column('last_payment_date', sa.DateTime, nullable=True),
        sa.Column('last_payment_amount', sa.Numeric(10, 2), nullable=True),
        sa.Column('failed_payment_count', sa.Integer, nullable=False, server_default='0'),
        sa.Column('renewal_count', sa.Integer, nullable=False, server_default='0'),
        sa.Column('meta', postgresql.JSONB, nullable=False, server_default='{}'),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime, nullable=False, server_default=sa.text('now()')),
    )

    # Create indexes for subscriptions
    op.create_index('idx_subscriptions_user_status', 'subscriptions', ['user_id', 'status'])
    op.create_index('idx_subscriptions_next_billing', 'subscriptions', ['next_billing_date', 'status'])
    op.create_index('idx_subscriptions_trial_end', 'subscriptions', ['trial_end', 'status'])
    op.create_index('idx_subscriptions_period_end', 'subscriptions', ['current_period_end', 'status'])

    # 3. Create refunds table
    op.create_table(
        'refunds',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('transaction_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('transactions.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('enrollment_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('enrollments.id', ondelete='SET NULL'), nullable=True),
        sa.Column('subscription_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('subscriptions.id', ondelete='SET NULL'), nullable=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('refund_type', postgresql.ENUM(name='refund_type_enum', create_type=False), nullable=False),
        sa.Column('refund_reason', postgresql.ENUM(name='refund_reason_enum', create_type=False), nullable=False),
        sa.Column('refund_amount', sa.Numeric(10, 2), nullable=False),
        sa.Column('original_amount', sa.Numeric(10, 2), nullable=False),
        sa.Column('currency', sa.String(3), nullable=False, server_default='KES'),
        sa.Column('status', postgresql.ENUM(name='refund_status_enum', create_type=False), nullable=False, server_default='pending'),
        sa.Column('requested_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('approved_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('processed_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('gateway', sa.String(50), nullable=False),
        sa.Column('gateway_refund_id', sa.String(255), nullable=True),
        sa.Column('user_reason', sa.Text, nullable=False),
        sa.Column('admin_notes', sa.Text, nullable=True),
        sa.Column('rejection_reason', sa.Text, nullable=True),
        sa.Column('eligibility_check', postgresql.JSONB, nullable=False, server_default='{}'),
        sa.Column('meta', postgresql.JSONB, nullable=False, server_default='{}'),
        sa.Column('requested_at', sa.DateTime, nullable=False, server_default=sa.text('now()')),
        sa.Column('reviewed_at', sa.DateTime, nullable=True),
        sa.Column('processed_at', sa.DateTime, nullable=True),
        sa.Column('completed_at', sa.DateTime, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime, nullable=False, server_default=sa.text('now()')),
        sa.CheckConstraint('refund_amount > 0', name='check_refund_amount_positive'),
        sa.CheckConstraint('refund_amount <= original_amount', name='check_refund_not_exceed_original'),
    )

    # Create indexes for refunds
    op.create_index('idx_refunds_user_status', 'refunds', ['user_id', 'status'])
    op.create_index('idx_refunds_transaction', 'refunds', ['transaction_id'])
    op.create_index('idx_refunds_status_requested', 'refunds', ['status', 'requested_at'])
    op.create_index('idx_refunds_gateway_status', 'refunds', ['gateway', 'status'])

    # 4. Create exchange_rates table
    op.create_table(
        'exchange_rates',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('base_currency', sa.String(3), nullable=False, server_default='KES'),
        sa.Column('target_currency', sa.String(3), nullable=False),
        sa.Column('rate', sa.Numeric(20, 6), nullable=False),
        sa.Column('inverse_rate', sa.Numeric(20, 6), nullable=False),
        sa.Column('effective_date', sa.DateTime, nullable=False, server_default=sa.text('now()')),
        sa.Column('expiry_date', sa.DateTime, nullable=True),
        sa.Column('source', sa.String(50), nullable=False, server_default='api'),
        sa.Column('provider', sa.String(100), nullable=True),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default='true'),
        sa.Column('is_manual', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('meta', postgresql.JSONB, nullable=False, server_default='{}'),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime, nullable=False, server_default=sa.text('now()')),
        sa.CheckConstraint('rate > 0', name='check_exchange_rate_positive'),
        sa.CheckConstraint('inverse_rate > 0', name='check_inverse_rate_positive'),
        sa.UniqueConstraint('base_currency', 'target_currency', 'effective_date', name='uq_exchange_rate_currency_date'),
    )

    # Create indexes for exchange_rates
    op.create_index('idx_exchange_rates_currency_pair_active', 'exchange_rates', ['base_currency', 'target_currency', 'is_active'])
    op.create_index('idx_exchange_rates_effective_date', 'exchange_rates', ['effective_date', 'target_currency'])

    # 5. Create currency_conversions table
    op.create_table(
        'currency_conversions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('transaction_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('transactions.id', ondelete='SET NULL'), nullable=True),
        sa.Column('exchange_rate_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('exchange_rates.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('from_currency', sa.String(3), nullable=False),
        sa.Column('to_currency', sa.String(3), nullable=False),
        sa.Column('original_amount', sa.Numeric(20, 2), nullable=False),
        sa.Column('converted_amount', sa.Numeric(20, 2), nullable=False),
        sa.Column('exchange_rate_used', sa.Numeric(20, 6), nullable=False),
        sa.Column('conversion_type', sa.String(50), nullable=False, server_default='payment'),
        sa.Column('reference_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('notes', sa.Text, nullable=True),
        sa.Column('meta', postgresql.JSONB, nullable=False, server_default='{}'),
        sa.Column('converted_at', sa.DateTime, nullable=False, server_default=sa.text('now()')),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text('now()')),
        sa.CheckConstraint('original_amount > 0', name='check_original_amount_positive'),
        sa.CheckConstraint('converted_amount > 0', name='check_converted_amount_positive'),
        sa.CheckConstraint('exchange_rate_used > 0', name='check_exchange_rate_used_positive'),
    )

    # Create indexes for currency_conversions
    op.create_index('idx_currency_conversions_currencies', 'currency_conversions', ['from_currency', 'to_currency', 'converted_at'])
    op.create_index('idx_currency_conversions_transaction', 'currency_conversions', ['transaction_id'])
    op.create_index('idx_currency_conversions_type_date', 'currency_conversions', ['conversion_type', 'converted_at'])

    # 6. Create revenue_metrics table
    op.create_table(
        'revenue_metrics',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('metric_date', sa.Date, nullable=False),
        sa.Column('period_type', sa.String(20), nullable=False, server_default='daily'),
        sa.Column('currency', sa.String(3), nullable=False, server_default='KES'),
        sa.Column('total_revenue', sa.Numeric(15, 2), nullable=False, server_default='0.00'),
        sa.Column('net_revenue', sa.Numeric(15, 2), nullable=False, server_default='0.00'),
        sa.Column('refund_amount', sa.Numeric(15, 2), nullable=False, server_default='0.00'),
        sa.Column('transaction_count', sa.Integer, nullable=False, server_default='0'),
        sa.Column('successful_count', sa.Integer, nullable=False, server_default='0'),
        sa.Column('failed_count', sa.Integer, nullable=False, server_default='0'),
        sa.Column('refund_count', sa.Integer, nullable=False, server_default='0'),
        sa.Column('average_transaction_value', sa.Numeric(10, 2), nullable=False, server_default='0.00'),
        sa.Column('gateway_breakdown', postgresql.JSONB, nullable=False, server_default='{}'),
        sa.Column('payment_method_breakdown', postgresql.JSONB, nullable=False, server_default='{}'),
        sa.Column('course_revenue', sa.Numeric(15, 2), nullable=False, server_default='0.00'),
        sa.Column('subscription_revenue', sa.Numeric(15, 2), nullable=False, server_default='0.00'),
        sa.Column('meta', postgresql.JSONB, nullable=False, server_default='{}'),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime, nullable=False, server_default=sa.text('now()')),
        sa.CheckConstraint('total_revenue >= 0', name='check_total_revenue_non_negative'),
        sa.CheckConstraint('net_revenue >= 0', name='check_net_revenue_non_negative'),
        sa.CheckConstraint('refund_amount >= 0', name='check_refund_amount_non_negative'),
        sa.UniqueConstraint('metric_date', 'period_type', 'currency', name='uq_revenue_metrics_date_period_currency'),
    )

    # Create indexes for revenue_metrics
    op.create_index('idx_revenue_metrics_date_period', 'revenue_metrics', ['metric_date', 'period_type'])
    op.create_index('idx_revenue_metrics_date_currency', 'revenue_metrics', ['metric_date', 'currency'])

    # 7. Create payment_analytics table
    op.create_table(
        'payment_analytics',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('metric_date', sa.Date, nullable=False),
        sa.Column('period_type', sa.String(20), nullable=False, server_default='daily'),
        sa.Column('active_subscriptions', sa.Integer, nullable=False, server_default='0'),
        sa.Column('new_subscriptions', sa.Integer, nullable=False, server_default='0'),
        sa.Column('cancelled_subscriptions', sa.Integer, nullable=False, server_default='0'),
        sa.Column('churned_subscriptions', sa.Integer, nullable=False, server_default='0'),
        sa.Column('mrr', sa.Numeric(15, 2), nullable=False, server_default='0.00'),
        sa.Column('arr', sa.Numeric(15, 2), nullable=False, server_default='0.00'),
        sa.Column('churn_rate', sa.Numeric(5, 2), nullable=False, server_default='0.00'),
        sa.Column('payment_method_stats', postgresql.JSONB, nullable=False, server_default='{}'),
        sa.Column('gateway_performance', postgresql.JSONB, nullable=False, server_default='{}'),
        sa.Column('failed_payment_stats', postgresql.JSONB, nullable=False, server_default='{}'),
        sa.Column('meta', postgresql.JSONB, nullable=False, server_default='{}'),
        sa.Column('created_at', sa.DateTime, nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime, nullable=False, server_default=sa.text('now()')),
        sa.CheckConstraint('mrr >= 0', name='check_mrr_non_negative'),
        sa.CheckConstraint('arr >= 0', name='check_arr_non_negative'),
        sa.CheckConstraint('churn_rate >= 0 AND churn_rate <= 100', name='check_churn_rate_percentage'),
        sa.UniqueConstraint('metric_date', 'period_type', name='uq_payment_analytics_date_period'),
    )

    # Create indexes for payment_analytics
    op.create_index('idx_payment_analytics_date_period', 'payment_analytics', ['metric_date', 'period_type'])


def downgrade() -> None:
    """Downgrade database by removing enhanced payment features."""

    # Drop tables in reverse order
    op.drop_table('payment_analytics')
    op.drop_table('revenue_metrics')
    op.drop_table('currency_conversions')
    op.drop_table('exchange_rates')
    op.drop_table('refunds')
    op.drop_table('subscriptions')
    op.drop_table('subscription_plans')

    # Drop enum types
    op.execute("DROP TYPE IF EXISTS refund_reason_enum")
    op.execute("DROP TYPE IF EXISTS refund_type_enum")
    op.execute("DROP TYPE IF EXISTS refund_status_enum")
    op.execute("DROP TYPE IF EXISTS plan_type_enum")
    op.execute("DROP TYPE IF EXISTS subscription_status_enum")
    op.execute("DROP TYPE IF EXISTS billing_cycle_enum")
