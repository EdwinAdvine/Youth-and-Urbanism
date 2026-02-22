"""
Withdrawal Service

Business logic for creating, approving, and processing withdrawal requests.
Integrates with Paystack and M-Pesa B2C for payout processing.
"""

import logging
from decimal import Decimal
from typing import Any, Dict, List, Optional
from uuid import UUID

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.withdrawal import WithdrawalRequest, WithdrawalStatus, WithdrawalMethod
from app.models.payment import Wallet

logger = logging.getLogger(__name__)


class WithdrawalService:
    """Manage withdrawal requests and payout processing."""

    @staticmethod
    async def create_request(
        db: AsyncSession,
        user_id: UUID,
        amount: Decimal,
        currency: str,
        payout_method: str,
        payout_details: Dict[str, Any],
    ) -> WithdrawalRequest:
        """
        Create a new withdrawal request.

        Validates:
        - User has a wallet with sufficient balance
        - Wallet is not withdrawal-blocked (e.g., student wallets)
        - No existing pending/approved request for the same user
        """
        # Get user's wallet
        result = await db.execute(
            select(Wallet).where(Wallet.user_id == user_id)
        )
        wallet = result.scalar_one_or_none()

        if not wallet:
            raise ValueError("Wallet not found. Please contact support.")

        if wallet.is_withdrawal_blocked:
            raise ValueError("Withdrawals are not available for your account type.")

        if Decimal(str(wallet.balance)) < amount:
            raise ValueError(
                f"Insufficient balance. Available: {wallet.balance} {wallet.currency}"
            )

        # Check for existing pending/approved requests
        existing = await db.execute(
            select(func.count()).select_from(WithdrawalRequest).where(
                and_(
                    WithdrawalRequest.user_id == user_id,
                    WithdrawalRequest.status.in_([
                        WithdrawalStatus.REQUESTED,
                        WithdrawalStatus.APPROVED,
                        WithdrawalStatus.PROCESSING,
                    ]),
                )
            )
        )
        if existing.scalar() > 0:
            raise ValueError(
                "You already have a pending withdrawal request. "
                "Please wait for it to be processed."
            )

        # Validate payout method
        try:
            method = WithdrawalMethod(payout_method)
        except ValueError:
            raise ValueError(
                f"Invalid payout method: {payout_method}. "
                f"Use one of: mpesa_b2c, bank_transfer, paypal"
            )

        request = WithdrawalRequest(
            user_id=user_id,
            amount=amount,
            currency=currency,
            payout_method=method,
            payout_details=payout_details,
        )
        db.add(request)
        await db.commit()
        await db.refresh(request)

        logger.info(
            "Withdrawal request created: user=%s, amount=%s %s, method=%s",
            user_id, amount, currency, payout_method,
        )

        return request

    @staticmethod
    async def approve_request(
        db: AsyncSession,
        request_id: UUID,
        reviewer_id: UUID,
    ) -> WithdrawalRequest:
        """Approve a withdrawal request (Super Admin only)."""
        result = await db.execute(
            select(WithdrawalRequest).where(WithdrawalRequest.id == request_id)
        )
        request = result.scalar_one_or_none()

        if not request:
            raise ValueError("Withdrawal request not found")
        if request.status != WithdrawalStatus.REQUESTED:
            raise ValueError(f"Cannot approve request with status: {request.status.value}")

        # Verify wallet still has sufficient funds
        wallet_result = await db.execute(
            select(Wallet).where(Wallet.user_id == request.user_id)
        )
        wallet = wallet_result.scalar_one_or_none()

        if not wallet or Decimal(str(wallet.balance)) < request.amount:
            raise ValueError("User no longer has sufficient balance for this withdrawal")

        request.approve(reviewer_id)
        await db.commit()
        await db.refresh(request)

        logger.info(
            "Withdrawal request %s approved by %s", request_id, reviewer_id,
        )

        return request

    @staticmethod
    async def reject_request(
        db: AsyncSession,
        request_id: UUID,
        reviewer_id: UUID,
        reason: str,
    ) -> WithdrawalRequest:
        """Reject a withdrawal request (Super Admin only)."""
        result = await db.execute(
            select(WithdrawalRequest).where(WithdrawalRequest.id == request_id)
        )
        request = result.scalar_one_or_none()

        if not request:
            raise ValueError("Withdrawal request not found")
        if request.status != WithdrawalStatus.REQUESTED:
            raise ValueError(f"Cannot reject request with status: {request.status.value}")

        request.reject(reviewer_id, reason)
        await db.commit()
        await db.refresh(request)

        logger.info(
            "Withdrawal request %s rejected by %s: %s",
            request_id, reviewer_id, reason,
        )

        return request

    @staticmethod
    async def process_withdrawal(
        db: AsyncSession,
        request_id: UUID,
    ) -> WithdrawalRequest:
        """
        Process an approved withdrawal request.

        Calls the appropriate payment gateway (Paystack or M-Pesa B2C)
        to send the payout, then updates the wallet balance.
        """
        result = await db.execute(
            select(WithdrawalRequest).where(WithdrawalRequest.id == request_id)
        )
        request = result.scalar_one_or_none()

        if not request:
            raise ValueError("Withdrawal request not found")
        if request.status != WithdrawalStatus.APPROVED:
            raise ValueError("Only approved requests can be processed")

        request.start_processing()
        await db.commit()

        try:
            if request.payout_method == WithdrawalMethod.MPESA_B2C:
                tx_ref = await _process_mpesa_payout(request)
            elif request.payout_method == WithdrawalMethod.BANK_TRANSFER:
                tx_ref = await _process_paystack_payout(request)
            elif request.payout_method == WithdrawalMethod.PAYPAL:
                tx_ref = f"PP-{request.id}"  # Placeholder — PayPal payout integration
            else:
                raise ValueError(f"Unsupported payout method: {request.payout_method}")

            # Debit the wallet
            wallet_result = await db.execute(
                select(Wallet).where(Wallet.user_id == request.user_id)
            )
            wallet = wallet_result.scalar_one_or_none()
            if wallet:
                wallet.debit(request.amount)
                wallet.total_withdrawn = (
                    Decimal(str(wallet.total_withdrawn)) + Decimal(str(request.amount))
                )

            request.mark_completed(tx_ref)
            await db.commit()

            logger.info(
                "Withdrawal %s processed successfully: ref=%s", request_id, tx_ref,
            )

        except Exception as exc:
            request.mark_failed(str(exc))
            await db.commit()
            logger.exception("Withdrawal %s processing failed", request_id)

        await db.refresh(request)
        return request

    @staticmethod
    async def list_pending(
        db: AsyncSession,
        page: int = 1,
        page_size: int = 20,
        status_filter: Optional[str] = None,
    ) -> Dict[str, Any]:
        """List withdrawal requests for the admin approval queue."""
        query = select(WithdrawalRequest).order_by(WithdrawalRequest.created_at.desc())

        if status_filter:
            try:
                ws = WithdrawalStatus(status_filter)
                query = query.where(WithdrawalRequest.status == ws)
            except ValueError:
                pass
        else:
            # Default: show requested (pending approval)
            query = query.where(
                WithdrawalRequest.status == WithdrawalStatus.REQUESTED
            )

        # Count
        count_query = select(func.count()).select_from(query.subquery())
        total = (await db.execute(count_query)).scalar() or 0

        # Paginate
        offset = (page - 1) * page_size
        items_result = await db.execute(query.offset(offset).limit(page_size))
        items = items_result.scalars().all()

        return {
            "items": [_serialize_request(r) for r in items],
            "total": total,
            "page": page,
            "page_size": page_size,
        }

    @staticmethod
    async def list_user_requests(
        db: AsyncSession,
        user_id: UUID,
        page: int = 1,
        page_size: int = 20,
    ) -> Dict[str, Any]:
        """List withdrawal requests for a specific user."""
        query = (
            select(WithdrawalRequest)
            .where(WithdrawalRequest.user_id == user_id)
            .order_by(WithdrawalRequest.created_at.desc())
        )

        count_query = select(func.count()).select_from(query.subquery())
        total = (await db.execute(count_query)).scalar() or 0

        offset = (page - 1) * page_size
        items_result = await db.execute(query.offset(offset).limit(page_size))
        items = items_result.scalars().all()

        return {
            "items": [_serialize_request(r) for r in items],
            "total": total,
            "page": page,
            "page_size": page_size,
        }


def _serialize_request(r: WithdrawalRequest) -> Dict[str, Any]:
    """Convert a WithdrawalRequest to a dict."""
    user = r.user
    return {
        "id": str(r.id),
        "user_id": str(r.user_id),
        "amount": float(r.amount),
        "currency": r.currency,
        "payout_method": r.payout_method.value if r.payout_method else None,
        "payout_details": r.payout_details,
        "status": r.status.value if r.status else None,
        "reviewed_by": str(r.reviewed_by) if r.reviewed_by else None,
        "reviewed_at": r.reviewed_at.isoformat() if r.reviewed_at else None,
        "rejection_reason": r.rejection_reason,
        "transaction_reference": r.transaction_reference,
        "processed_at": r.processed_at.isoformat() if r.processed_at else None,
        "failure_reason": r.failure_reason,
        "created_at": r.created_at.isoformat() if r.created_at else None,
        "updated_at": r.updated_at.isoformat() if r.updated_at else None,
        "user_email": user.email if user else None,
        "user_name": user.profile_data.get("full_name", "") if user and user.profile_data else None,
        "user_role": user.role if user else None,
    }


async def _process_mpesa_payout(request: WithdrawalRequest) -> str:
    """Process M-Pesa B2C payout using existing MpesaB2CClient."""
    from app.utils.payments.mpesa_b2c import MpesaB2CClient

    client = MpesaB2CClient()
    phone = request.payout_details.get("phone", "")

    result = await client.send_payment(
        phone_number=phone,
        amount=float(request.amount),
        remarks=f"Withdrawal {request.id}",
        occasion="Platform withdrawal",
    )

    return result.get("ConversationID", f"MPESA-{request.id}")


async def _process_paystack_payout(request: WithdrawalRequest) -> str:
    """Process bank transfer via Paystack."""
    from app.utils.payments.paystack import PaystackClient

    client = PaystackClient()
    details = request.payout_details

    # Create transfer recipient
    recipient = await client.create_transfer_recipient(
        name=details.get("account_name", ""),
        account_number=details.get("account_number", ""),
        bank_code=details.get("bank_code", ""),
        currency=request.currency,
    )

    recipient_code = recipient.get("recipient_code", "")

    # Initiate transfer
    transfer = await client.initiate_transfer(
        amount=int(float(request.amount) * 100),  # Paystack uses kobo/cents
        recipient=recipient_code,
        reason=f"Platform withdrawal #{request.id}",
    )

    return transfer.get("transfer_code", f"PS-{request.id}")
