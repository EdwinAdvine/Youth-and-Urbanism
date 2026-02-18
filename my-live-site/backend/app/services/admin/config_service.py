"""
Admin Config Service - Phase 8 (Operations & Control)

Provides maker-checker system configuration management.
All config changes require a request + approval workflow.
"""

import logging
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.admin.operations import SystemConfig, SystemConfigChangeRequest

logger = logging.getLogger(__name__)


class ConfigService:
    """Service for admin system configuration (maker-checker)."""

    # ------------------------------------------------------------------
    # List Configs
    # ------------------------------------------------------------------
    @staticmethod
    async def list_configs(
        db: AsyncSession,
        category: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        List all system configuration entries.

        Returns items grouped by category with total counts.
        """
        q = select(SystemConfig)
        if category:
            q = q.where(SystemConfig.category == category)
        q = q.order_by(SystemConfig.category, SystemConfig.key)

        result = await db.execute(q)
        configs = result.scalars().all()

        # Get unique categories
        cat_q = select(SystemConfig.category).distinct()
        cat_result = await db.execute(cat_q)
        categories = [row[0] for row in cat_result if row[0]]

        items: List[Dict[str, Any]] = []
        for c in configs:
            items.append({
                "id": str(c.id),
                "key": c.key,
                "value": c.value,
                "description": c.description,
                "category": c.category,
                "is_sensitive": c.is_sensitive,
                "editable": c.editable,
                "last_modified": c.updated_at.isoformat() if c.updated_at else None,
                "modified_by": str(c.last_modified_by) if c.last_modified_by else None,
            })

        return {
            "items": items,
            "total": len(items),
            "categories": categories,
        }

    # ------------------------------------------------------------------
    # Request Change (Maker)
    # ------------------------------------------------------------------
    @staticmethod
    async def request_change(
        db: AsyncSession,
        config_id: str,
        requested_value: dict,
        requester_id: uuid.UUID,
        reason: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Submit a configuration change request (maker step).

        The change won't take effect until approved by a different admin.
        """
        try:
            config_uuid = uuid.UUID(config_id)
        except ValueError:
            return {"success": False, "error": "Invalid config ID"}

        # Verify config exists
        q = select(SystemConfig).where(SystemConfig.id == config_uuid)
        result = await db.execute(q)
        config = result.scalar_one_or_none()

        if not config:
            return {"success": False, "error": "Configuration not found"}

        if not config.editable:
            return {"success": False, "error": "This configuration is not editable"}

        # Create change request
        change_request = SystemConfigChangeRequest(
            config_id=config_uuid,
            previous_value=config.value,
            requested_value=requested_value,
            requester_id=requester_id,
            reason=reason,
            status="pending",
        )
        db.add(change_request)
        await db.commit()
        await db.refresh(change_request)

        return {
            "success": True,
            "request_id": str(change_request.id),
            "config_key": config.key,
            "status": "pending",
        }

    # ------------------------------------------------------------------
    # List Pending Changes
    # ------------------------------------------------------------------
    @staticmethod
    async def list_pending_changes(
        db: AsyncSession,
    ) -> List[Dict[str, Any]]:
        """List all pending configuration change requests."""
        q = (
            select(SystemConfigChangeRequest)
            .where(SystemConfigChangeRequest.status == "pending")
            .order_by(SystemConfigChangeRequest.created_at.desc())
        )
        result = await db.execute(q)
        requests = result.scalars().all()

        items: List[Dict[str, Any]] = []
        for r in requests:
            # Get config details
            config_q = select(SystemConfig).where(SystemConfig.id == r.config_id)
            config_result = await db.execute(config_q)
            config = config_result.scalar_one_or_none()

            items.append({
                "id": str(r.id),
                "config_id": str(r.config_id),
                "config_key": config.key if config else "unknown",
                "config_category": config.category if config else "unknown",
                "previous_value": r.previous_value,
                "requested_value": r.requested_value,
                "requester_id": str(r.requester_id) if r.requester_id else None,
                "reason": r.reason,
                "status": r.status,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            })

        return items

    # ------------------------------------------------------------------
    # Approve Change (Checker)
    # ------------------------------------------------------------------
    @staticmethod
    async def approve_change(
        db: AsyncSession,
        request_id: str,
        approver_id: uuid.UUID,
    ) -> Dict[str, Any]:
        """
        Approve a config change request (checker step).

        Applies the new value to the config and records the approval.
        Ensures the approver is not the same as the requester.
        """
        try:
            request_uuid = uuid.UUID(request_id)
        except ValueError:
            return {"success": False, "error": "Invalid request ID"}

        q = select(SystemConfigChangeRequest).where(
            SystemConfigChangeRequest.id == request_uuid
        )
        result = await db.execute(q)
        change_req = result.scalar_one_or_none()

        if not change_req:
            return {"success": False, "error": "Change request not found"}

        if change_req.status != "pending":
            return {"success": False, "error": f"Request is already {change_req.status}"}

        # Maker-checker: approver must not be the requester
        if change_req.requester_id == approver_id:
            return {"success": False, "error": "Cannot approve your own change request"}

        # Apply the change
        config_q = select(SystemConfig).where(SystemConfig.id == change_req.config_id)
        config_result = await db.execute(config_q)
        config = config_result.scalar_one_or_none()

        if not config:
            return {"success": False, "error": "Configuration no longer exists"}

        config.value = change_req.requested_value
        config.last_modified_by = approver_id

        change_req.status = "approved"
        change_req.reviewer_id = approver_id
        change_req.reviewed_at = datetime.utcnow()

        await db.commit()

        return {
            "success": True,
            "config_key": config.key,
            "new_value": config.value,
            "status": "approved",
        }

    # ------------------------------------------------------------------
    # Reject Change
    # ------------------------------------------------------------------
    @staticmethod
    async def reject_change(
        db: AsyncSession,
        request_id: str,
        reviewer_id: uuid.UUID,
    ) -> Dict[str, Any]:
        """Reject a pending config change request."""
        try:
            request_uuid = uuid.UUID(request_id)
        except ValueError:
            return {"success": False, "error": "Invalid request ID"}

        q = select(SystemConfigChangeRequest).where(
            SystemConfigChangeRequest.id == request_uuid
        )
        result = await db.execute(q)
        change_req = result.scalar_one_or_none()

        if not change_req:
            return {"success": False, "error": "Change request not found"}

        if change_req.status != "pending":
            return {"success": False, "error": f"Request is already {change_req.status}"}

        change_req.status = "rejected"
        change_req.reviewer_id = reviewer_id
        change_req.reviewed_at = datetime.utcnow()

        await db.commit()

        return {
            "success": True,
            "request_id": str(change_req.id),
            "status": "rejected",
        }
