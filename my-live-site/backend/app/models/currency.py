"""
Currency and Exchange Rate Models - Urban Home School

This module implements multi-currency support with exchange rate tracking:

Models:
- ExchangeRate: Currency exchange rates with historical tracking
- CurrencyConversion: Transaction-level currency conversion log

Features:
- Multi-currency support (KES, USD, EUR, GBP, etc.)
- Real-time exchange rate tracking
- Historical exchange rate storage
- Automatic rate updates from external APIs
- Transaction-level conversion logging
- Base currency (KES) for internal accounting
"""

import uuid
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional

from sqlalchemy import (
    Column,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    Numeric,
    Index,
    Text,
    UniqueConstraint,
    CheckConstraint,
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import relationship

from app.database import Base


class ExchangeRate(AsyncAttrs, Base):
    """
    Currency exchange rate tracking with historical data.

    Stores exchange rates between currencies with automatic updates
    from external APIs (e.g., exchangerate-api.com, fixer.io).

    Base Currency: KES (Kenyan Shilling)
    All rates are stored relative to KES.

    Example:
        - 1 USD = 150 KES -> rate = 150.00
        - 1 EUR = 165 KES -> rate = 165.00
        - 1 GBP = 195 KES -> rate = 195.00

    Attributes:
        id: Unique exchange rate identifier (UUID)
        base_currency: Base currency code (always KES)
        target_currency: Target currency code (USD, EUR, GBP, etc.)
        rate: Exchange rate (1 target_currency = rate * base_currency)
        inverse_rate: Inverse rate (1 base_currency = inverse_rate * target_currency)
        effective_date: When this rate became effective
        expiry_date: When this rate expires (for future rates)
        source: Data source (manual, api, bank)
        provider: API provider name (exchangerate-api, fixer, etc.)
        is_active: Whether this rate is currently active
        is_manual: Whether rate was manually entered
        metadata: Additional rate information
        created_at: Record creation timestamp
        updated_at: Last update timestamp
    """

    __tablename__ = "exchange_rates"

    # Primary key
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
        doc="Unique exchange rate identifier",
    )

    # Currency pair
    base_currency = Column(
        String(3),
        default="KES",
        nullable=False,
        index=True,
        doc="Base currency code (ISO 4217)",
    )

    target_currency = Column(
        String(3),
        nullable=False,
        index=True,
        doc="Target currency code (ISO 4217)",
    )

    # Exchange rates
    rate = Column(
        Numeric(20, 6),
        nullable=False,
        doc="Exchange rate (1 target = rate * base)",
    )

    inverse_rate = Column(
        Numeric(20, 6),
        nullable=False,
        doc="Inverse rate (1 base = inverse_rate * target)",
    )

    # Validity period
    effective_date = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
        doc="When this rate became effective",
    )

    expiry_date = Column(
        DateTime,
        nullable=True,
        index=True,
        doc="When this rate expires (null = no expiry)",
    )

    # Source tracking
    source = Column(
        String(50),
        default="api",
        nullable=False,
        doc="Data source (manual, api, bank)",
    )

    provider = Column(
        String(100),
        nullable=True,
        doc="API provider name (exchangerate-api, fixer, etc.)",
    )

    # Status flags
    is_active = Column(
        Boolean,
        default=True,
        nullable=False,
        index=True,
        doc="Whether this rate is currently active",
    )

    is_manual = Column(
        Boolean,
        default=False,
        nullable=False,
        doc="Whether rate was manually entered",
    )

    # Additional metadata
    meta = Column(
        JSONB,
        default=dict,
        nullable=False,
        doc="Additional rate information (bid, ask, mid, etc.)",
    )

    # Timestamps
    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
        doc="Record creation timestamp",
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
        doc="Last update timestamp",
    )

    # Relationships
    conversions = relationship(
        "CurrencyConversion",
        back_populates="exchange_rate",
        cascade="all, delete-orphan",
    )

    # Constraints and indexes
    __table_args__ = (
        Index(
            "idx_exchange_rates_currency_pair_active",
            "base_currency",
            "target_currency",
            "is_active",
        ),
        Index(
            "idx_exchange_rates_effective_date",
            "effective_date",
            "target_currency",
        ),
        UniqueConstraint(
            "base_currency",
            "target_currency",
            "effective_date",
            name="uq_exchange_rate_currency_date",
        ),
        CheckConstraint(
            "rate > 0",
            name="check_exchange_rate_positive"
        ),
        CheckConstraint(
            "inverse_rate > 0",
            name="check_inverse_rate_positive"
        ),
    )

    def __repr__(self) -> str:
        """String representation for debugging."""
        return (
            f"<ExchangeRate(id={self.id}, "
            f"{self.target_currency}/{self.base_currency}={self.rate}, "
            f"effective={self.effective_date}, active={self.is_active})>"
        )

    # Helper properties
    @property
    def currency_pair(self) -> str:
        """Get currency pair notation (e.g., USD/KES)."""
        return f"{self.target_currency}/{self.base_currency}"

    @property
    def is_valid(self) -> bool:
        """Check if rate is currently valid."""
        now = datetime.utcnow()
        if not self.is_active:
            return False
        if now < self.effective_date:
            return False
        if self.expiry_date and now >= self.expiry_date:
            return False
        return True

    @property
    def days_until_expiry(self) -> Optional[int]:
        """Get days until rate expires."""
        if not self.expiry_date:
            return None
        delta = self.expiry_date - datetime.utcnow()
        return max(0, delta.days)

    @property
    def is_expired(self) -> bool:
        """Check if rate has expired."""
        if not self.expiry_date:
            return False
        return datetime.utcnow() >= self.expiry_date

    # Conversion methods
    def convert_to_base(self, amount: Decimal) -> Decimal:
        """
        Convert amount from target currency to base currency.

        Args:
            amount: Amount in target currency

        Returns:
            Decimal: Amount in base currency (KES)
        """
        return amount * self.rate

    def convert_from_base(self, amount: Decimal) -> Decimal:
        """
        Convert amount from base currency to target currency.

        Args:
            amount: Amount in base currency (KES)

        Returns:
            Decimal: Amount in target currency
        """
        return amount * self.inverse_rate

    # Lifecycle methods
    def deactivate(self) -> None:
        """Deactivate this exchange rate."""
        self.is_active = False
        self.updated_at = datetime.utcnow()

    def expire(self, expiry_date: Optional[datetime] = None) -> None:
        """
        Set expiry date for this rate.

        Args:
            expiry_date: When to expire (defaults to now)
        """
        self.expiry_date = expiry_date or datetime.utcnow()
        self.is_active = False
        self.updated_at = datetime.utcnow()

    @staticmethod
    def calculate_inverse_rate(rate: Decimal) -> Decimal:
        """
        Calculate inverse exchange rate.

        Args:
            rate: Exchange rate

        Returns:
            Decimal: Inverse rate
        """
        if rate <= 0:
            raise ValueError("Rate must be positive")
        return Decimal("1") / rate

    @staticmethod
    def is_rate_stale(last_update: datetime, max_age_hours: int = 24) -> bool:
        """
        Check if exchange rate is stale and needs update.

        Args:
            last_update: When rate was last updated
            max_age_hours: Maximum age in hours before considered stale

        Returns:
            bool: True if rate is stale
        """
        age = datetime.utcnow() - last_update
        return age > timedelta(hours=max_age_hours)


class CurrencyConversion(AsyncAttrs, Base):
    """
    Currency conversion transaction log.

    Records every currency conversion performed in the system for
    audit trail and accounting purposes.

    Use Cases:
        - Payment in USD converted to KES for processing
        - Wallet balance displayed in user's preferred currency
        - Revenue reporting in multiple currencies
        - Refund amount calculation in original payment currency

    Attributes:
        id: Unique conversion identifier (UUID)
        transaction_id: Related payment transaction (optional)
        exchange_rate_id: Exchange rate used for conversion
        from_currency: Source currency code
        to_currency: Target currency code
        original_amount: Amount in source currency
        converted_amount: Amount in target currency
        exchange_rate_used: Exchange rate at time of conversion
        conversion_type: Type of conversion (payment, display, refund)
        reference_id: Optional reference to related entity
        notes: Optional conversion notes
        metadata: Additional conversion data
        converted_at: When conversion was performed
        created_at: Record creation timestamp
    """

    __tablename__ = "currency_conversions"

    # Primary key
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
        doc="Unique conversion identifier",
    )

    # Foreign keys
    transaction_id = Column(
        UUID(as_uuid=True),
        ForeignKey("transactions.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        doc="Related payment transaction",
    )

    exchange_rate_id = Column(
        UUID(as_uuid=True),
        ForeignKey("exchange_rates.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        doc="Exchange rate used for conversion",
    )

    # Currency details
    from_currency = Column(
        String(3),
        nullable=False,
        index=True,
        doc="Source currency code (ISO 4217)",
    )

    to_currency = Column(
        String(3),
        nullable=False,
        index=True,
        doc="Target currency code (ISO 4217)",
    )

    # Amounts
    original_amount = Column(
        Numeric(20, 2),
        nullable=False,
        doc="Amount in source currency",
    )

    converted_amount = Column(
        Numeric(20, 2),
        nullable=False,
        doc="Amount in target currency",
    )

    exchange_rate_used = Column(
        Numeric(20, 6),
        nullable=False,
        doc="Exchange rate at time of conversion",
    )

    # Conversion metadata
    conversion_type = Column(
        String(50),
        default="payment",
        nullable=False,
        index=True,
        doc="Type of conversion (payment, display, refund, payout)",
    )

    reference_id = Column(
        UUID(as_uuid=True),
        nullable=True,
        doc="Optional reference to related entity",
    )

    notes = Column(
        Text,
        nullable=True,
        doc="Optional conversion notes",
    )

    # Additional metadata
    meta = Column(
        JSONB,
        default=dict,
        nullable=False,
        doc="Additional conversion data",
    )

    # Timestamps
    converted_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
        doc="When conversion was performed",
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        doc="Record creation timestamp",
    )

    # Relationships
    transaction = relationship("Transaction")
    exchange_rate = relationship("ExchangeRate", back_populates="conversions")

    # Indexes
    __table_args__ = (
        Index(
            "idx_currency_conversions_currencies",
            "from_currency",
            "to_currency",
            "converted_at",
        ),
        Index(
            "idx_currency_conversions_transaction",
            "transaction_id",
        ),
        Index(
            "idx_currency_conversions_type_date",
            "conversion_type",
            "converted_at",
        ),
        CheckConstraint(
            "original_amount > 0",
            name="check_original_amount_positive"
        ),
        CheckConstraint(
            "converted_amount > 0",
            name="check_converted_amount_positive"
        ),
        CheckConstraint(
            "exchange_rate_used > 0",
            name="check_exchange_rate_used_positive"
        ),
    )

    def __repr__(self) -> str:
        """String representation for debugging."""
        return (
            f"<CurrencyConversion(id={self.id}, "
            f"{self.from_currency}->{self.to_currency}, "
            f"{self.original_amount}->{self.converted_amount}, "
            f"rate={self.exchange_rate_used})>"
        )

    # Helper properties
    @property
    def conversion_direction(self) -> str:
        """Get conversion direction notation."""
        return f"{self.from_currency} → {self.to_currency}"

    @property
    def conversion_ratio(self) -> Decimal:
        """
        Calculate actual conversion ratio.

        Returns:
            Decimal: Ratio of converted to original amount
        """
        if self.original_amount <= 0:
            return Decimal("0")
        return self.converted_amount / self.original_amount

    @property
    def is_to_base_currency(self) -> bool:
        """Check if conversion is to base currency (KES)."""
        return self.to_currency == "KES"

    @property
    def is_from_base_currency(self) -> bool:
        """Check if conversion is from base currency (KES)."""
        return self.from_currency == "KES"

    # Validation methods
    def validate_conversion(self, tolerance: Decimal = Decimal("0.01")) -> bool:
        """
        Validate that conversion matches expected rate.

        Args:
            tolerance: Acceptable difference percentage (default 1%)

        Returns:
            bool: True if conversion is within tolerance
        """
        expected_amount = self.original_amount * self.exchange_rate_used
        difference = abs(expected_amount - self.converted_amount)
        max_difference = expected_amount * tolerance

        return difference <= max_difference

    @staticmethod
    def calculate_markup(
        base_rate: Decimal,
        applied_rate: Decimal
    ) -> Decimal:
        """
        Calculate markup/spread between rates.

        Args:
            base_rate: Base exchange rate
            applied_rate: Rate actually applied

        Returns:
            Decimal: Markup percentage
        """
        if base_rate <= 0:
            return Decimal("0")

        markup = ((applied_rate - base_rate) / base_rate) * Decimal("100")
        return markup
