"""
Student Wallet & Payment Models - Paystack Transactions
"""
from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from ..database import Base


class PaystackTransactionStatus(str, enum.Enum):
    """Paystack transaction status"""
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    ABANDONED = "abandoned"


class PaystackChannel(str, enum.Enum):
    """Paystack payment channel"""
    CARD = "card"
    BANK = "bank"
    USSD = "ussd"
    QR = "qr"
    MOBILE_MONEY = "mobile_money"
    BANK_TRANSFER = "bank_transfer"


class PaystackTransaction(Base):
    """Paystack payment transactions"""
    __tablename__ = "paystack_transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="SET NULL"), nullable=True)

    # Paystack fields
    reference = Column(String(255), unique=True, nullable=False)  # Paystack reference
    amount = Column(Integer, nullable=False)  # Amount in kobo (smallest currency unit)
    currency = Column(String(3), default="KES", nullable=False)
    status = Column(SQLEnum(PaystackTransactionStatus), default=PaystackTransactionStatus.PENDING, nullable=False)
    channel = Column(SQLEnum(PaystackChannel), nullable=True)

    customer_email = Column(String(255), nullable=False)
    customer_name = Column(String(255), nullable=True)

    # Transaction details
    paid_at = Column(DateTime, nullable=True)
    gateway_response = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)

    # Metadata
    transaction_metadata = Column(JSONB, nullable=True)  # Custom metadata (course_id, subscription_type, etc.)

    # Authorization (for card tokenization)
    authorization_code = Column(String(255), nullable=True)
    card_type = Column(String(50), nullable=True)
    last4 = Column(String(4), nullable=True)
    exp_month = Column(String(2), nullable=True)
    exp_year = Column(String(4), nullable=True)
    bank = Column(String(100), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)

    # Relationships
    user = relationship("User", backref="paystack_transactions")
    student = relationship("Student", backref="paystack_transactions")

    def __repr__(self):
        return f"<PaystackTransaction {self.reference} - {self.amount/100} {self.currency} ({self.status})>"


class StudentSavedPaymentMethod(Base):
    """Saved payment methods for students (tokenized cards)"""
    __tablename__ = "student_saved_payment_methods"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)

    # Paystack authorization
    authorization_code = Column(String(255), unique=True, nullable=False)
    card_type = Column(String(50), nullable=False)  # visa, mastercard, etc.
    last4 = Column(String(4), nullable=False)
    exp_month = Column(String(2), nullable=False)
    exp_year = Column(String(4), nullable=False)
    bank = Column(String(100), nullable=True)

    is_default = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)

    # Relationships
    student = relationship("Student", backref="saved_payment_methods")

    def __repr__(self):
        return f"<StudentSavedPaymentMethod {self.card_type} ****{self.last4}>"
