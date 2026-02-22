"""
Admin Withdrawal API

Endpoints for Super Admin to manage the withdrawal approval queue.
"""

import logging
from typing import Any, Dict, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.withdrawal_schemas import WithdrawalRejectBody
from app.services.withdrawal_service import WithdrawalService
from app.utils.permissions import require_super_admin, require_permission

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/withdrawals/queue")
async def list_withdrawal_queue(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: dict = Depends(require_permission("finance.withdrawals.approve")),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    List withdrawal requests in the approval queue.
    Requires finance.withdrawals.approve permission.
    """
    try:
        data = await WithdrawalService.list_pending(
            db, page=page, page_size=page_size, status_filter=status_filter,
        )
        return {"status": "success", "data": data}
    except Exception as exc:
        logger.exception("Failed to list withdrawal queue")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list withdrawal queue.",
        ) from exc


@router.post("/withdrawals/{request_id}/approve")
async def approve_withdrawal(
    request_id: UUID,
    current_user: dict = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Approve a withdrawal request and trigger payout processing.
    Super Admin only.
    """
    try:
        reviewer_id = UUID(current_user["id"])

        # Approve
        request = await WithdrawalService.approve_request(
            db, request_id=request_id, reviewer_id=reviewer_id,
        )

        # Process payout
        request = await WithdrawalService.process_withdrawal(db, request_id=request_id)

        return {
            "status": "success",
            "data": {
                "id": str(request.id),
                "status": request.status.value,
                "transaction_reference": request.transaction_reference,
            },
            "message": "Withdrawal approved and processing initiated.",
        }
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        logger.exception("Failed to approve withdrawal")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to approve withdrawal.",
        ) from exc


@router.post("/withdrawals/{request_id}/reject")
async def reject_withdrawal(
    request_id: UUID,
    body: WithdrawalRejectBody,
    current_user: dict = Depends(require_super_admin),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, Any]:
    """
    Reject a withdrawal request with a reason.
    Super Admin only.
    """
    try:
        reviewer_id = UUID(current_user["id"])
        request = await WithdrawalService.reject_request(
            db,
            request_id=request_id,
            reviewer_id=reviewer_id,
            reason=body.reason,
        )
        return {
            "status": "success",
            "data": {
                "id": str(request.id),
                "status": request.status.value,
                "rejection_reason": request.rejection_reason,
            },
            "message": "Withdrawal request rejected.",
        }
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        logger.exception("Failed to reject withdrawal")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reject withdrawal.",
        ) from exc
