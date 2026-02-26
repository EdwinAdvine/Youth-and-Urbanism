"""
Student Wallet & Payment Service - Balance, Transactions, Paystack Integration
"""
from datetime import datetime
from typing import Dict, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, desc, func
from uuid import UUID
import hashlib
import secrets

from app.models.user import User
from app.models.student import Student
from app.models.student_wallet import (
    PaystackTransaction,
    PaystackTransactionStatus,
    PaystackChannel,
    StudentSavedPaymentMethod
)
from app.models.payment import Wallet, Transaction
from app.services.ai_orchestrator import AIOrchestrator


class WalletService:
    """Service for student wallet and payment operations"""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.ai_orchestrator = AIOrchestrator()

    async def get_wallet_balance(self, user_id: UUID) -> Dict:
        """Get student's wallet balance"""
        result = await self.db.execute(
            select(Wallet).where(Wallet.user_id == user_id)
        )
        wallet = result.scalar_one_or_none()

        if not wallet:
            # Create wallet if doesn't exist
            wallet = Wallet(
                user_id=user_id,
                balance=0.0,
                currency="KES"
            )
            self.db.add(wallet)
            await self.db.commit()
            await self.db.refresh(wallet)

        return {
            "balance": float(wallet.balance),
            "currency": wallet.currency,
            "last_updated": wallet.updated_at
        }

    async def get_transaction_history(
        self,
        user_id: UUID,
        limit: int = 20,
        offset: int = 0
    ) -> Dict:
        """Get transaction history"""
        # Get total count
        count_result = await self.db.execute(
            select(func.count()).select_from(Transaction).where(Transaction.user_id == user_id)
        )
        total = count_result.scalar()

        # Get transactions
        result = await self.db.execute(
            select(Transaction)
            .where(Transaction.user_id == user_id)
            .order_by(desc(Transaction.created_at))
            .limit(limit)
            .offset(offset)
        )
        transactions = result.scalars().all()

        return {
            "transactions": [
                {
                    "id": str(tx.id),
                    "amount": float(tx.amount),
                    "currency": tx.currency,
                    "transaction_type": tx.transaction_type,
                    "status": tx.status,
                    "description": tx.description,
                    "created_at": tx.created_at
                }
                for tx in transactions
            ],
            "total": total,
            "limit": limit,
            "offset": offset
        }

    async def initiate_paystack_payment(
        self,
        user_id: UUID,
        student_id: UUID,
        amount: int,
        email: str,
        metadata: Optional[Dict] = None
    ) -> Dict:
        """
        Initiate Paystack payment

        Args:
            amount: Amount in kobo (smallest currency unit)
            email: Customer email
            metadata: Custom metadata
        """
        # Generate unique reference
        reference = f"TUHS-{secrets.token_hex(8).upper()}"

        # Create transaction record
        transaction = PaystackTransaction(
            user_id=user_id,
            student_id=student_id,
            reference=reference,
            amount=amount,
            currency="KES",
            status=PaystackTransactionStatus.PENDING,
            customer_email=email,
            transaction_metadata=metadata or {}
        )

        self.db.add(transaction)
        await self.db.commit()
        await self.db.refresh(transaction)

        # In production, this would call Paystack API to initialize payment
        # For now, return mock data
        return {
            "reference": reference,
            "authorization_url": f"https://checkout.paystack.com/{reference}",
            "access_code": secrets.token_urlsafe(32),
            "transaction_id": str(transaction.id)
        }

    async def verify_paystack_payment(self, reference: str) -> Dict:
        """
        Verify Paystack payment

        In production, this would call Paystack API to verify
        """
        result = await self.db.execute(
            select(PaystackTransaction).where(PaystackTransaction.reference == reference)
        )
        transaction = result.scalar_one_or_none()

        if not transaction:
            raise ValueError("Transaction not found")

        # In production, verify with Paystack API
        # For now, mock successful verification
        transaction.status = PaystackTransactionStatus.SUCCESS
        transaction.paid_at = datetime.utcnow()
        transaction.channel = PaystackChannel.CARD

        # Update wallet balance
        wallet_result = await self.db.execute(
            select(Wallet).where(Wallet.user_id == transaction.user_id)
        )
        wallet = wallet_result.scalar_one_or_none()

        if wallet:
            wallet.balance += (transaction.amount / 100)  # Convert from kobo

        await self.db.commit()

        return {
            "status": transaction.status.value,
            "amount": transaction.amount,
            "currency": transaction.currency,
            "paid_at": transaction.paid_at,
            "reference": transaction.reference
        }

    async def get_payment_methods(self, student_id: UUID) -> List[Dict]:
        """Get saved payment methods"""
        result = await self.db.execute(
            select(StudentSavedPaymentMethod)
            .where(
                and_(
                    StudentSavedPaymentMethod.student_id == student_id,
                    StudentSavedPaymentMethod.is_active == True
                )
            )
            .order_by(desc(StudentSavedPaymentMethod.is_default))
        )
        methods = result.scalars().all()

        return [
            {
                "id": str(method.id),
                "card_type": method.card_type,
                "last4": method.last4,
                "exp_month": method.exp_month,
                "exp_year": method.exp_year,
                "bank": method.bank,
                "is_default": method.is_default
            }
            for method in methods
        ]

    async def save_payment_method(
        self,
        student_id: UUID,
        authorization_code: str,
        card_type: str,
        last4: str,
        exp_month: str,
        exp_year: str,
        bank: Optional[str] = None
    ) -> StudentSavedPaymentMethod:
        """Save a payment method"""
        # Check if this is the first payment method (make it default)
        existing_count = await self.db.execute(
            select(func.count()).select_from(StudentSavedPaymentMethod)
            .where(StudentSavedPaymentMethod.student_id == student_id)
        )
        is_first = existing_count.scalar() == 0

        method = StudentSavedPaymentMethod(
            student_id=student_id,
            authorization_code=authorization_code,
            card_type=card_type,
            last4=last4,
            exp_month=exp_month,
            exp_year=exp_year,
            bank=bank,
            is_default=is_first
        )

        self.db.add(method)
        await self.db.commit()
        await self.db.refresh(method)

        return method

    async def get_subscription_info(self, student_id: UUID) -> Dict:
        """Get student's subscription information"""
        # Placeholder - would query subscription table
        return {
            "plan": "Basic",
            "status": "active",
            "next_billing_date": None,
            "amount": 0.0,
            "currency": "KES"
        }

    async def get_ai_fund_advisor(self, student_id: UUID) -> Dict:
        """Get AI-powered spending and fund management advice"""
        # Get recent transaction history
        transactions = await self.get_transaction_history(student_id, limit=10)

        # Get wallet balance
        wallet_result = await self.db.execute(
            select(Wallet).join(User).join(Student)
            .where(Student.id == student_id)
        )
        wallet = wallet_result.scalar_one_or_none()

        balance = float(wallet.balance) if wallet else 0.0

        # Generate AI advice
        prompt = f"""Provide brief financial advice for a student with:
- Current balance: KES {balance}
- Recent transactions: {len(transactions['transactions'])} transactions

Give 3 short tips for:
1. Smart spending on educational resources
2. Budgeting for courses
3. Saving strategies"""

        ai_response = await self.ai_orchestrator.chat(
            message=prompt,
            system_message="You are a financial advisor for students. Be encouraging and practical.",
            task_type="general"
        )

        return {
            "advice": ai_response["message"],
            "current_balance": balance,
            "generated_at": datetime.utcnow()
        }
