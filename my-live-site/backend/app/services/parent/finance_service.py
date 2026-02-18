"""
Parent Finance Service

Business logic for subscriptions, payments, and billing.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from uuid import UUID
from datetime import datetime, date, timedelta

from app.schemas.parent.finance_schemas import (
    CurrentSubscriptionResponse, AvailablePlansResponse, SubscriptionPlan,
    PaymentHistoryResponse, PaymentHistoryItem, ChangeSubscriptionRequest,
    PauseSubscriptionRequest, AddOnsResponse, AddOn, PurchaseAddOnRequest
)


class ParentFinanceService:
    """Service for parent finance operations"""

    async def get_current_subscription(
        self,
        db: AsyncSession,
        parent_id: UUID
    ) -> CurrentSubscriptionResponse:
        """Get current subscription status"""

        # Sample data - would query actual subscription table
        return CurrentSubscriptionResponse(
            plan_id="basic",
            plan_name="Basic Plan",
            status="active",
            billing_cycle="monthly",
            current_period_start=date(2024, 1, 1),
            current_period_end=date(2024, 2, 1),
            next_billing_date=date(2024, 2, 1),
            amount=2500.0,
            children_count=2,
            max_children=3,
            auto_renew=True,
            payment_method="mpesa"
        )

    async def get_available_plans(
        self,
        db: AsyncSession,
        parent_id: UUID
    ) -> AvailablePlansResponse:
        """Get available subscription plans"""

        plans = [
            SubscriptionPlan(
                id="basic",
                name="Basic Plan",
                description="Perfect for small families",
                price_monthly=2500.0,
                price_annual=25000.0,
                features=[
                    "Up to 3 children",
                    "AI tutor access",
                    "CBC-aligned curriculum",
                    "Progress tracking",
                    "Email support"
                ],
                max_children=3,
                is_popular=False,
                is_current=True
            ),
            SubscriptionPlan(
                id="family",
                name="Family Plan",
                description="Most popular for families",
                price_monthly=4500.0,
                price_annual=45000.0,
                features=[
                    "Up to 5 children",
                    "AI tutor access",
                    "CBC-aligned curriculum",
                    "Progress tracking",
                    "Live sessions",
                    "Priority support",
                    "Detailed reports"
                ],
                max_children=5,
                is_popular=True,
                is_current=False
            ),
            SubscriptionPlan(
                id="premium",
                name="Premium Plan",
                description="Complete learning solution",
                price_monthly=7500.0,
                price_annual=75000.0,
                features=[
                    "Unlimited children",
                    "AI tutor access",
                    "CBC-aligned curriculum",
                    "Progress tracking",
                    "Unlimited live sessions",
                    "24/7 priority support",
                    "Advanced analytics",
                    "Parent coaching",
                    "Custom learning paths"
                ],
                max_children=999,
                is_popular=False,
                is_current=False
            )
        ]

        return AvailablePlansResponse(
            plans=plans,
            current_plan_id="basic"
        )

    async def change_subscription(
        self,
        db: AsyncSession,
        parent_id: UUID,
        request: ChangeSubscriptionRequest
    ) -> CurrentSubscriptionResponse:
        """Change subscription plan"""

        # Would update subscription in database
        # Handle prorated charges/credits
        # Initiate payment if upgrade

        return await self.get_current_subscription(db, parent_id)

    async def pause_subscription(
        self,
        db: AsyncSession,
        parent_id: UUID,
        request: PauseSubscriptionRequest
    ) -> CurrentSubscriptionResponse:
        """Pause subscription"""

        # Would update subscription status
        return await self.get_current_subscription(db, parent_id)

    async def resume_subscription(
        self,
        db: AsyncSession,
        parent_id: UUID
    ) -> CurrentSubscriptionResponse:
        """Resume paused subscription"""

        # Would update subscription status
        return await self.get_current_subscription(db, parent_id)

    async def get_payment_history(
        self,
        db: AsyncSession,
        parent_id: UUID,
        limit: int = 50,
        offset: int = 0
    ) -> PaymentHistoryResponse:
        """Get payment history"""

        # Sample data - would query actual payment records
        payments = [
            PaymentHistoryItem(
                id=UUID('12345678-1234-1234-1234-123456789012'),
                transaction_date=datetime(2024, 1, 1, 10, 0, 0),
                amount=2500.0,
                currency="KES",
                payment_method="M-Pesa",
                status="completed",
                description="Basic Plan - Monthly",
                receipt_number="RCP-2024-001",
                mpesa_receipt="QLR123ABC456"
            )
        ]

        return PaymentHistoryResponse(
            payments=payments,
            total_count=len(payments),
            total_paid=sum(p.amount for p in payments)
        )

    async def get_available_addons(
        self,
        db: AsyncSession,
        parent_id: UUID
    ) -> AddOnsResponse:
        """Get available add-ons"""

        addons = [
            AddOn(
                id="extra_child",
                name="Extra Child Slot",
                description="Add one more child to your plan",
                price=500.0,
                duration_months=1,
                features=["One additional child slot"],
                is_purchased=False
            ),
            AddOn(
                id="tutor_hours",
                name="Extra Tutor Hours",
                description="10 additional hours of AI tutoring",
                price=1000.0,
                duration_months=1,
                features=["10 extra AI tutor hours", "Priority response"],
                is_purchased=False
            )
        ]

        return AddOnsResponse(
            addons=addons,
            active_addons=[]
        )

    async def purchase_addon(
        self,
        db: AsyncSession,
        parent_id: UUID,
        request: PurchaseAddOnRequest
    ) -> dict:
        """Purchase an add-on"""

        # Would process payment and activate add-on
        return {"status": "pending", "addon_id": request.addon_id}


# Singleton instance
parent_finance_service = ParentFinanceService()
