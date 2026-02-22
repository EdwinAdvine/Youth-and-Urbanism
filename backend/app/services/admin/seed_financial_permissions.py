"""
Seed Financial Permissions

Creates the financial permission records in the database.
Run this after migrations to set up the financial access control system.
"""

import logging
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.admin.permission import Permission, RolePermission

logger = logging.getLogger(__name__)

FINANCIAL_PERMISSIONS = [
    {
        "name": "finance.transactions.read",
        "resource": "finance.transactions",
        "action": "read",
        "description": "View all platform transactions",
    },
    {
        "name": "finance.transactions.manage",
        "resource": "finance.transactions",
        "action": "manage",
        "description": "Manage and refund transactions",
    },
    {
        "name": "finance.wallets.read",
        "resource": "finance.wallets",
        "action": "read",
        "description": "View user wallet balances",
    },
    {
        "name": "finance.wallets.manage",
        "resource": "finance.wallets",
        "action": "manage",
        "description": "Credit or debit user wallets",
    },
    {
        "name": "finance.payouts.read",
        "resource": "finance.payouts",
        "action": "read",
        "description": "View the payout queue",
    },
    {
        "name": "finance.payouts.approve",
        "resource": "finance.payouts",
        "action": "approve",
        "description": "Approve or reject payout requests",
    },
    {
        "name": "finance.reports.read",
        "resource": "finance.reports",
        "action": "read",
        "description": "View financial reports and invoices",
    },
    {
        "name": "finance.settings.manage",
        "resource": "finance.settings",
        "action": "manage",
        "description": "Modify revenue splits, plan features, and financial settings",
    },
    {
        "name": "finance.withdrawals.approve",
        "resource": "finance.withdrawals",
        "action": "approve",
        "description": "Approve or reject withdrawal requests",
    },
]


async def seed_financial_permissions(db: AsyncSession) -> None:
    """Create financial permission records if they don't already exist."""
    created = 0

    for perm_data in FINANCIAL_PERMISSIONS:
        result = await db.execute(
            select(Permission).where(Permission.name == perm_data["name"])
        )
        existing = result.scalar_one_or_none()

        if not existing:
            perm = Permission(**perm_data)
            db.add(perm)
            created += 1

    if created:
        await db.commit()
        logger.info("Seeded %d financial permissions", created)
    else:
        logger.info("All financial permissions already exist")
