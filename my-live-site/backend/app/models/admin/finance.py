"""
Finance Models — Phase 7

Tables for partner contracts, invoices, and the payout queue.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Numeric, DateTime, Text, UUID, ForeignKey, Index
from sqlalchemy.dialects.postgresql import JSONB
from app.database import Base


class PartnerContract(Base):
    """
    A legal contract between the platform and a partner organization.

    Contracts define the commercial terms (sponsorship, revenue share, or flat fee)
    including total value, currency, and auto-renewal setting. Status transitions
    through pending -> active -> expired/terminated. The terms JSONB stores
    detailed clauses and conditions specific to each agreement.
    """

    __tablename__ = "partner_contracts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    partner_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    contract_type = Column(String(50), nullable=False)  # sponsorship | revenue_share | flat_fee
    terms = Column(JSONB, default={})
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    status = Column(String(20), default="pending", index=True)  # active | expired | terminated | pending
    auto_renew = Column(Boolean, default=False)
    total_value = Column(Numeric(12, 2), nullable=True)
    currency = Column(String(5), default="KES")
    signed_at = Column(DateTime, nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index('ix_pc_partner_status', 'partner_id', 'status'),
    )

    def __repr__(self) -> str:
        return f"<PartnerContract(partner_id={self.partner_id}, type='{self.contract_type}')>"


class Invoice(Base):
    """
    A billing invoice issued to a partner or user.

    Each invoice has a unique sequential number, line items (JSONB array),
    and a status that moves through draft -> sent -> paid/overdue/cancelled.
    Invoices link to either a partner_id or user_id depending on who is
    being billed, and track due dates and payment timestamps.
    """

    __tablename__ = "invoices"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    invoice_number = Column(String(50), unique=True, nullable=False, index=True)
    partner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(5), default="KES")
    status = Column(String(20), default="draft", index=True)  # draft | sent | paid | overdue | cancelled
    due_date = Column(DateTime, nullable=True)
    paid_at = Column(DateTime, nullable=True)
    items = Column(JSONB, default=[])
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<Invoice(number='{self.invoice_number}', amount={self.amount})>"


class PayoutQueueItem(Base):
    """
    A queued payout awaiting processing for an instructor or partner.

    Created when an instructor requests a withdrawal or when the system
    schedules an automatic payout. Status transitions: pending -> processing
    -> completed/failed. Failed payouts store a failure_reason so the admin
    can retry or investigate. Supports M-Pesa, bank transfer, and PayPal.
    """

    __tablename__ = "payout_queue"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    recipient_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(5), default="KES")
    payment_method = Column(String(50), nullable=False)
    status = Column(String(20), default="pending", index=True)  # pending | processing | completed | failed
    reference = Column(String(100), nullable=True)
    processed_at = Column(DateTime, nullable=True)
    failure_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<PayoutQueueItem(recipient={self.recipient_id}, amount={self.amount}, status='{self.status}')>"
