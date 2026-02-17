# Urban Home School - Complete Database Schema

## 🗄️ Database Schema Overview

This document provides a comprehensive overview of all database models and their relationships.

---

## 📊 Entity Relationship Diagram

```
┌─────────────────┐
│     USERS       │
│  (existing)     │
└────────┬────────┘
         │
         ├──────────────────────────────────────────────────┐
         │                                                  │
         ├─────────────┐                                    │
         │             │                                    │
         ▼             ▼                                    ▼
┌─────────────┐  ┌──────────────┐              ┌─────────────────────┐
│  STUDENTS   │  │   WALLETS    │              │  PAYMENT_METHODS    │
│ (existing)  │  │  (existing)  │              │    (existing)       │
└──────┬──────┘  └──────┬───────┘              └──────────┬──────────┘
       │                │                                  │
       │                │                                  │
       ▼                ▼                                  │
┌──────────────┐  ┌──────────────────┐                   │
│ ENROLLMENTS  │  │ WALLET_TRANS     │                   │
│  (existing)  │  │   (existing)     │                   │
└──────┬───────┘  └──────────────────┘                   │
       │                                                  │
       │                                                  │
       ▼                                                  ▼
┌─────────────────┐                          ┌──────────────────────┐
│ SUBSCRIPTIONS   │◄─────────────────────────│ SUBSCRIPTION_PLANS   │
│     (NEW)       │                          │       (NEW)          │
└────────┬────────┘                          └──────────────────────┘
         │
         │
         ▼
┌──────────────────┐         ┌──────────────────┐
│  TRANSACTIONS    │────────►│    REFUNDS       │
│   (existing)     │         │     (NEW)        │
└────────┬─────────┘         └──────────────────┘
         │
         │
         ▼
┌──────────────────────┐
│ CURRENCY_CONVERSIONS │
│        (NEW)         │
└──────────┬───────────┘
           │
           ▼
┌──────────────────┐
│ EXCHANGE_RATES   │
│      (NEW)       │
└──────────────────┘

┌─────────────────────┐      ┌───────────────────────┐
│  REVENUE_METRICS    │      │  PAYMENT_ANALYTICS    │
│      (NEW)          │      │       (NEW)           │
└─────────────────────┘      └───────────────────────┘
```

---

## 📋 Model Definitions

### **1. Core Payment Models** (Existing)

#### **Transaction**
Primary payment transaction model.

**Fields:**
- `id` (UUID) - Primary key
- `user_id` (UUID FK) → users.id
- `amount` (Numeric)
- `currency` (String)
- `gateway` (Enum: mpesa, paypal, stripe)
- `status` (Enum: pending, completed, failed, refunded)
- `transaction_reference` (String)
- `transaction_metadata` (JSONB)
- `created_at`, `updated_at` (DateTime)

**Relationships:**
- `user` → User
- `refunds` → Refund[] (NEW)
- `currency_conversions` → CurrencyConversion[] (NEW)

---

#### **Wallet**
User wallet for balance tracking.

**Fields:**
- `id` (UUID) - Primary key
- `user_id` (UUID FK) → users.id (UNIQUE)
- `balance` (Numeric)
- `currency` (String)
- `created_at`, `updated_at` (DateTime)

**Relationships:**
- `user` → User (one-to-one)

---

#### **PaymentMethod**
Saved payment methods for recurring payments.

**Fields:**
- `id` (UUID) - Primary key
- `user_id` (UUID FK) → users.id
- `gateway` (Enum)
- `method_type` (String)
- `details` (JSONB, encrypted)
- `is_default` (Boolean)
- `is_active` (Boolean)
- `created_at`, `updated_at` (DateTime)

**Relationships:**
- `user` → User
- `subscriptions` → Subscription[] (NEW)

---

#### **Enrollment**
Student-course enrollment tracking.

**Fields:**
- `id` (UUID) - Primary key
- `student_id` (UUID FK) → students.id
- `course_id` (UUID FK) → courses.id
- `payment_id` (UUID FK) → transactions.id
- `payment_amount` (Numeric)
- `status` (Enum)
- `progress_percentage` (Numeric)
- `created_at`, `updated_at` (DateTime)

**Relationships:**
- `student` → Student
- `course` → Course
- `payment` → Transaction
- `subscription` → Subscription (NEW, one-to-one)

---

### **2. Subscription System** (NEW)

#### **SubscriptionPlan**
Configurable pricing plans.

**Fields:**
- `id` (UUID) - Primary key
- `name` (String) - e.g., "Monthly Pro"
- `description` (Text)
- `plan_type` (Enum: course_access, platform_access, premium_features, bundle)
- `billing_cycle` (Enum: weekly, monthly, quarterly, semi_annual, annual)
- `price` (Numeric)
- `currency` (String)
- `trial_days` (Integer)
- `features` (JSONB) - Array of features
- `course_ids` (JSONB) - Array of course UUIDs
- `max_enrollments` (Integer) - -1 for unlimited
- `is_active` (Boolean)
- `is_popular` (Boolean)
- `display_order` (Integer)
- `metadata` (JSONB)
- `created_at`, `updated_at` (DateTime)

**Relationships:**
- `subscriptions` → Subscription[]

**Indexes:**
- `idx_subscription_plans_type_active` (plan_type, is_active)
- `idx_subscription_plans_billing_cycle` (billing_cycle)
- `idx_subscription_plans_display` (is_active, display_order)

---

#### **Subscription**
User subscription tracking with auto-renewal.

**Fields:**
- `id` (UUID) - Primary key
- `user_id` (UUID FK) → users.id
- `plan_id` (UUID FK) → subscription_plans.id
- `enrollment_id` (UUID FK) → enrollments.id (nullable)
- `payment_method_id` (UUID FK) → payment_methods.id (nullable)
- `status` (Enum: active, trialing, paused, past_due, cancelled, expired, suspended)
- `current_period_start` (DateTime)
- `current_period_end` (DateTime)
- `trial_start` (DateTime, nullable)
- `trial_end` (DateTime, nullable)
- `cancel_at_period_end` (Boolean)
- `cancelled_at` (DateTime, nullable)
- `ended_at` (DateTime, nullable)
- `next_billing_date` (DateTime, nullable)
- `last_payment_date` (DateTime, nullable)
- `last_payment_amount` (Numeric, nullable)
- `failed_payment_count` (Integer)
- `renewal_count` (Integer)
- `metadata` (JSONB)
- `created_at`, `updated_at` (DateTime)

**Relationships:**
- `user` → User
- `plan` → SubscriptionPlan
- `enrollment` → Enrollment (optional)
- `payment_method` → PaymentMethod (optional)
- `refunds` → Refund[] (NEW)

**Indexes:**
- `idx_subscriptions_user_status` (user_id, status)
- `idx_subscriptions_next_billing` (next_billing_date, status)
- `idx_subscriptions_trial_end` (trial_end, status)
- `idx_subscriptions_period_end` (current_period_end, status)

**Lifecycle:**
```
trialing → active → (paused/past_due) → cancelled/expired
```

---

### **3. Refund System** (NEW)

#### **Refund**
Refund request and processing with admin approval.

**Fields:**
- `id` (UUID) - Primary key
- `transaction_id` (UUID FK) → transactions.id (RESTRICT)
- `enrollment_id` (UUID FK) → enrollments.id (nullable)
- `subscription_id` (UUID FK) → subscriptions.id (nullable)
- `user_id` (UUID FK) → users.id (denormalized)
- `refund_type` (Enum: full, partial, prorated)
- `refund_reason` (Enum: accidental_purchase, course_not_as_described, etc.)
- `refund_amount` (Numeric)
- `original_amount` (Numeric)
- `currency` (String)
- `status` (Enum: pending, approved, rejected, processing, completed, failed)
- `requested_by` (UUID FK) → users.id (nullable)
- `approved_by` (UUID FK) → users.id (nullable)
- `processed_by` (UUID FK) → users.id (nullable)
- `gateway` (Enum: mpesa, paypal, stripe)
- `gateway_refund_id` (String, nullable)
- `user_reason` (Text)
- `admin_notes` (Text, nullable)
- `rejection_reason` (Text, nullable)
- `eligibility_check` (JSONB)
- `metadata` (JSONB)
- `requested_at`, `reviewed_at`, `processed_at`, `completed_at` (DateTime)
- `created_at`, `updated_at` (DateTime)

**Relationships:**
- `transaction` → Transaction
- `enrollment` → Enrollment (optional)
- `subscription` → Subscription (optional)
- `user` → User

**Indexes:**
- `idx_refunds_user_status` (user_id, status)
- `idx_refunds_transaction` (transaction_id)
- `idx_refunds_status_requested` (status, requested_at)
- `idx_refunds_gateway_status` (gateway, status)

**Constraints:**
- `refund_amount > 0`
- `refund_amount <= original_amount`

**Workflow:**
```
pending → (approved/rejected) → processing → (completed/failed)
```

**Refund Policy:**
- **Full refund (100%)**: ≤ 7 days AND < 10% completion
- **Partial refund (50%)**: ≤ 14 days AND < 30% completion
- **No refund**: > 14 days OR ≥ 30% completion

---

### **4. Multi-Currency System** (NEW)

#### **ExchangeRate**
Currency exchange rates with historical tracking.

**Fields:**
- `id` (UUID) - Primary key
- `base_currency` (String) - Always "KES"
- `target_currency` (String) - USD, EUR, GBP, etc.
- `rate` (Numeric) - 1 target = rate × base
- `inverse_rate` (Numeric) - 1 base = inverse_rate × target
- `effective_date` (DateTime)
- `expiry_date` (DateTime, nullable)
- `source` (String) - manual, api, bank
- `provider` (String, nullable) - API provider name
- `is_active` (Boolean)
- `is_manual` (Boolean)
- `metadata` (JSONB)
- `created_at`, `updated_at` (DateTime)

**Relationships:**
- `conversions` → CurrencyConversion[]

**Indexes:**
- `idx_exchange_rates_currency_pair_active` (base_currency, target_currency, is_active)
- `idx_exchange_rates_effective_date` (effective_date, target_currency)

**Constraints:**
- `UNIQUE` (base_currency, target_currency, effective_date)
- `rate > 0`
- `inverse_rate > 0`

---

#### **CurrencyConversion**
Transaction-level currency conversion log.

**Fields:**
- `id` (UUID) - Primary key
- `transaction_id` (UUID FK) → transactions.id (nullable)
- `exchange_rate_id` (UUID FK) → exchange_rates.id (RESTRICT)
- `from_currency` (String)
- `to_currency` (String)
- `original_amount` (Numeric)
- `converted_amount` (Numeric)
- `exchange_rate_used` (Numeric)
- `conversion_type` (String) - payment, display, refund, payout
- `reference_id` (UUID, nullable)
- `notes` (Text, nullable)
- `metadata` (JSONB)
- `converted_at` (DateTime)
- `created_at` (DateTime)

**Relationships:**
- `transaction` → Transaction (optional)
- `exchange_rate` → ExchangeRate

**Indexes:**
- `idx_currency_conversions_currencies` (from_currency, to_currency, converted_at)
- `idx_currency_conversions_transaction` (transaction_id)
- `idx_currency_conversions_type_date` (conversion_type, converted_at)

**Constraints:**
- `original_amount > 0`
- `converted_amount > 0`
- `exchange_rate_used > 0`

---

### **5. Analytics System** (NEW)

#### **RevenueMetrics**
Daily/monthly revenue aggregation.

**Fields:**
- `id` (UUID) - Primary key
- `metric_date` (Date)
- `period_type` (String) - daily, weekly, monthly, yearly
- `currency` (String)
- `total_revenue` (Numeric) - Gross revenue
- `net_revenue` (Numeric) - After refunds
- `refund_amount` (Numeric)
- `transaction_count` (Integer)
- `successful_count` (Integer)
- `failed_count` (Integer)
- `refund_count` (Integer)
- `average_transaction_value` (Numeric)
- `gateway_breakdown` (JSONB)
- `payment_method_breakdown` (JSONB)
- `course_revenue` (Numeric)
- `subscription_revenue` (Numeric)
- `metadata` (JSONB)
- `created_at`, `updated_at` (DateTime)

**Indexes:**
- `idx_revenue_metrics_date_period` (metric_date, period_type)
- `idx_revenue_metrics_date_currency` (metric_date, currency)

**Constraints:**
- `UNIQUE` (metric_date, period_type, currency)
- `total_revenue >= 0`
- `net_revenue >= 0`

---

#### **PaymentAnalytics**
Subscription and payment method analytics.

**Fields:**
- `id` (UUID) - Primary key
- `metric_date` (Date)
- `period_type` (String) - daily, monthly
- `active_subscriptions` (Integer)
- `new_subscriptions` (Integer)
- `cancelled_subscriptions` (Integer)
- `churned_subscriptions` (Integer)
- `mrr` (Numeric) - Monthly Recurring Revenue
- `arr` (Numeric) - Annual Recurring Revenue
- `churn_rate` (Numeric) - Percentage
- `payment_method_stats` (JSONB)
- `gateway_performance` (JSONB)
- `failed_payment_stats` (JSONB)
- `metadata` (JSONB)
- `created_at`, `updated_at` (DateTime)

**Indexes:**
- `idx_payment_analytics_date_period` (metric_date, period_type)

**Constraints:**
- `UNIQUE` (metric_date, period_type)
- `churn_rate >= 0 AND churn_rate <= 100`

---

## 🔗 Relationship Summary

### **User Relationships**
```python
User.subscriptions → Subscription[]
User.payment_methods → PaymentMethod[]
User.transactions → Transaction[]
User.wallet → Wallet (one-to-one)
User.refunds_requested → Refund[]
```

### **Transaction Relationships**
```python
Transaction.user → User
Transaction.refunds → Refund[]
Transaction.currency_conversions → CurrencyConversion[]
```

### **Enrollment Relationships**
```python
Enrollment.student → Student
Enrollment.course → Course
Enrollment.payment → Transaction
Enrollment.subscription → Subscription (one-to-one, NEW)
```

### **Subscription Relationships**
```python
Subscription.user → User
Subscription.plan → SubscriptionPlan
Subscription.enrollment → Enrollment (optional)
Subscription.payment_method → PaymentMethod (optional)
Subscription.refunds → Refund[]
```

---

## 📊 Key Metrics & Calculations

### **Subscription Metrics**
- **MRR (Monthly Recurring Revenue)**: Sum of all active monthly subscription values
- **ARR (Annual Recurring Revenue)**: MRR × 12
- **Churn Rate**: (Cancelled + Expired) / Active Subscriptions × 100
- **Growth Rate**: Net New Subscriptions / Previous Active × 100

### **Revenue Metrics**
- **Gross Revenue**: Total successful payments
- **Net Revenue**: Gross Revenue - Refunds
- **Refund Rate**: Refunds / Gross Revenue × 100
- **Average Transaction Value**: Total Revenue / Successful Transactions

### **Payment Performance**
- **Success Rate**: Successful / Total Transactions × 100
- **Failure Rate**: Failed / Total Transactions × 100
- **Gateway Performance**: Success rate by gateway

---

## 🔄 Data Flow Examples

### **1. Course Purchase with Subscription**
```
1. User selects course + subscription plan
2. Create Enrollment (status: pending_payment)
3. Create Subscription (status: trialing if trial_days > 0)
4. Initiate Payment via gateway
5. On payment success:
   - Update Transaction (status: completed)
   - Update Enrollment (status: active)
   - Update Subscription (status: active)
   - Credit Wallet (if applicable)
   - Create RevenueMetrics entry
```

### **2. Refund Request Flow**
```
1. User requests refund
2. Create Refund (status: pending)
3. Check eligibility (days, completion %)
4. Admin reviews → Approve/Reject
5. If approved:
   - Process gateway refund (M-Pesa B2C / PayPal / Stripe)
   - Update Refund (status: completed)
   - Update Transaction (status: refunded)
   - Update Enrollment (status: dropped)
   - Update RevenueMetrics (add refund)
```

### **3. Recurring Payment Processing**
```
1. Cron job finds subscriptions with next_billing_date <= today
2. For each subscription:
   - Get saved payment_method
   - Charge via gateway
   - If successful:
     * Create Transaction
     * Update Subscription (advance billing period)
     * Credit instructor wallet (60% split)
   - If failed:
     * Increment failed_payment_count
     * Update status to past_due
     * Schedule retry
```

---

## 📝 Migration Strategy

### **Phase 1: Core Tables**
1. Create `subscription_plans`
2. Create `subscriptions`
3. Create `refunds`

### **Phase 2: Currency Support**
4. Create `exchange_rates`
5. Create `currency_conversions`

### **Phase 3: Analytics**
6. Create `revenue_metrics`
7. Create `payment_analytics`

### **Phase 4: Update Relationships**
8. Add foreign key relationships
9. Create indexes
10. Add constraints

---

## 🎯 Next Steps

1. ✅ **Schema Design Complete**
2. ⏭️ **Create Alembic Migrations**
3. ⏭️ **Update User Model** (add subscription relationship)
4. ⏭️ **Create Pydantic Schemas**
5. ⏭️ **Implement Service Layer**
6. ⏭️ **Build API Endpoints**
7. ⏭️ **Write Tests**

---

**Last Updated**: 2026-02-12
**Database**: PostgreSQL 14+
**ORM**: SQLAlchemy 2.0 (Async)
