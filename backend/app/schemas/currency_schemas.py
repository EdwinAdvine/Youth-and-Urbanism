"""
Currency and Exchange Rate Pydantic Schemas for Urban Home School

Request and response schemas for multi-currency support and exchange rate management.
"""

from datetime import datetime
from decimal import Decimal
from typing import Optional, List, Dict, Any
from uuid import UUID
from enum import Enum

from pydantic import BaseModel, Field, field_validator, ConfigDict


# Enums

class CurrencyCode(str, Enum):
    """Supported currency codes"""
    KES = "KES"  # Kenyan Shilling (base)
    USD = "USD"  # US Dollar
    EUR = "EUR"  # Euro
    GBP = "GBP"  # British Pound
    ZAR = "ZAR"  # South African Rand
    UGX = "UGX"  # Ugandan Shilling
    TZS = "TZS"  # Tanzanian Shilling


class ExchangeRateSource(str, Enum):
    """Exchange rate data sources"""
    MANUAL = "manual"
    API = "api"
    BANK = "bank"


# ========== EXCHANGE RATE SCHEMAS ==========

class ExchangeRateCreate(BaseModel):
    """Schema for creating an exchange rate"""
    target_currency: CurrencyCode = Field(..., description="Target currency code")
    rate: Decimal = Field(
        ...,
        gt=0,
        decimal_places=6,
        description="Exchange rate (1 target = rate × KES)"
    )
    effective_date: Optional[datetime] = Field(
        None,
        description="When rate becomes effective (defaults to now)"
    )
    expiry_date: Optional[datetime] = Field(
        None,
        description="When rate expires (null = no expiry)"
    )
    source: ExchangeRateSource = Field(
        default=ExchangeRateSource.MANUAL,
        description="Data source"
    )
    provider: Optional[str] = Field(
        None,
        max_length=100,
        description="API provider name"
    )
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Additional rate info (bid, ask, mid)"
    )

    @field_validator('expiry_date')
    @classmethod
    def validate_expiry_after_effective(cls, v: Optional[datetime], info) -> Optional[datetime]:
        """Ensure expiry is after effective date"""
        if v is None:
            return v

        values = info.data
        effective_date = values.get('effective_date') or datetime.utcnow()

        if v <= effective_date:
            raise ValueError("Expiry date must be after effective date")

        return v

    @property
    def inverse_rate(self) -> Decimal:
        """Calculate inverse rate"""
        return Decimal("1") / self.rate


class ExchangeRateUpdate(BaseModel):
    """Schema for updating an exchange rate"""
    rate: Optional[Decimal] = Field(None, gt=0, decimal_places=6)
    expiry_date: Optional[datetime] = None
    is_active: Optional[bool] = None
    metadata: Optional[Dict[str, Any]] = None


class ExchangeRateResponse(BaseModel):
    """Schema for exchange rate response"""
    id: UUID
    base_currency: str
    target_currency: str
    rate: Decimal
    inverse_rate: Decimal
    effective_date: datetime
    expiry_date: Optional[datetime] = None
    source: str
    provider: Optional[str] = None
    is_active: bool
    is_manual: bool

    # Computed fields
    currency_pair: str
    is_valid: bool
    is_expired: bool
    days_until_expiry: Optional[int] = None

    metadata: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ExchangeRateListResponse(BaseModel):
    """Schema for paginated exchange rate list"""
    rates: List[ExchangeRateResponse]
    total: int = Field(..., ge=0)
    page: int = Field(..., ge=1)
    page_size: int = Field(..., ge=1, le=100)
    total_pages: int = Field(..., ge=0)


class ExchangeRateSummary(BaseModel):
    """Schema for current exchange rates summary"""
    base_currency: str = Field(default="KES")
    rates: Dict[str, Decimal] = Field(..., description="Currency → Rate mapping")
    last_updated: datetime
    source: str


# ========== CURRENCY CONVERSION SCHEMAS ==========

class CurrencyConversionRequest(BaseModel):
    """Schema for requesting currency conversion"""
    from_currency: CurrencyCode = Field(..., description="Source currency")
    to_currency: CurrencyCode = Field(..., description="Target currency")
    amount: Decimal = Field(
        ...,
        gt=0,
        decimal_places=2,
        description="Amount to convert"
    )
    conversion_type: str = Field(
        default="display",
        max_length=50,
        description="Type: payment, display, refund, payout"
    )
    transaction_id: Optional[UUID] = Field(
        None,
        description="Related transaction ID"
    )
    notes: Optional[str] = Field(
        None,
        max_length=500,
        description="Optional conversion notes"
    )

    @field_validator('from_currency', 'to_currency')
    @classmethod
    def validate_different_currencies(cls, v: CurrencyCode, info) -> CurrencyCode:
        """Ensure from and to currencies are different"""
        values = info.data

        # Only validate when both currencies are set
        if 'from_currency' in values and 'to_currency' in values:
            if values.get('from_currency') == values.get('to_currency'):
                raise ValueError("From and to currencies must be different")

        return v


class CurrencyConversionResponse(BaseModel):
    """Schema for currency conversion response"""
    from_currency: str
    to_currency: str
    original_amount: Decimal
    converted_amount: Decimal
    exchange_rate_used: Decimal
    conversion_ratio: Decimal = Field(..., description="Actual conversion ratio")
    conversion_direction: str = Field(..., description="e.g., 'USD → KES'")


class CurrencyConversionCreate(BaseModel):
    """Schema for logging a currency conversion (internal use)"""
    transaction_id: Optional[UUID] = None
    exchange_rate_id: UUID = Field(..., description="Exchange rate used")
    from_currency: CurrencyCode
    to_currency: CurrencyCode
    original_amount: Decimal = Field(..., gt=0, decimal_places=2)
    converted_amount: Decimal = Field(..., gt=0, decimal_places=2)
    exchange_rate_used: Decimal = Field(..., gt=0, decimal_places=6)
    conversion_type: str = Field(default="payment", max_length=50)
    reference_id: Optional[UUID] = None
    notes: Optional[str] = Field(None, max_length=500)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class CurrencyConversionLogResponse(BaseModel):
    """Schema for currency conversion log response"""
    id: UUID
    transaction_id: Optional[UUID] = None
    exchange_rate_id: UUID
    from_currency: str
    to_currency: str
    original_amount: Decimal
    converted_amount: Decimal
    exchange_rate_used: Decimal
    conversion_type: str
    reference_id: Optional[UUID] = None
    notes: Optional[str] = None

    # Computed fields
    conversion_direction: str
    conversion_ratio: Decimal
    is_to_base_currency: bool
    is_from_base_currency: bool

    metadata: Dict[str, Any]
    converted_at: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CurrencyConversionListResponse(BaseModel):
    """Schema for paginated conversion log list"""
    conversions: List[CurrencyConversionLogResponse]
    total: int = Field(..., ge=0)
    page: int = Field(..., ge=1)
    page_size: int = Field(..., ge=1, le=100)
    total_pages: int = Field(..., ge=0)


# ========== EXCHANGE RATE UPDATES ==========

class ExchangeRateUpdateRequest(BaseModel):
    """Schema for triggering exchange rate update from API"""
    currencies: Optional[List[CurrencyCode]] = Field(
        None,
        description="Specific currencies to update (null = all)"
    )
    provider: str = Field(
        default="exchangerate-api",
        description="API provider to use"
    )
    force_update: bool = Field(
        default=False,
        description="Force update even if rates are recent"
    )


class ExchangeRateUpdateResponse(BaseModel):
    """Schema for exchange rate update response"""
    success: bool
    updated_currencies: List[str] = Field(..., description="Currencies updated")
    failed_currencies: List[str] = Field(..., description="Currencies that failed")
    rates_updated: int
    provider: str
    timestamp: datetime
    errors: List[str] = Field(default_factory=list)


class ExchangeRateBatchCreate(BaseModel):
    """Schema for batch creating exchange rates"""
    rates: List[ExchangeRateCreate] = Field(..., min_items=1, max_items=50)


class ExchangeRateBatchResponse(BaseModel):
    """Schema for batch create response"""
    created: int
    failed: int
    rates: List[ExchangeRateResponse]
    errors: List[Dict[str, str]] = Field(default_factory=list)


# ========== CURRENCY ANALYTICS ==========

class CurrencyUsageStats(BaseModel):
    """Schema for currency usage statistics"""
    currency: str
    transaction_count: int
    total_volume: Decimal = Field(..., description="Total transaction volume")
    average_transaction: Decimal
    percentage_of_total: Decimal = Field(..., description="Percentage of total volume")


class CurrencyAnalytics(BaseModel):
    """Schema for currency analytics"""
    period_start: datetime
    period_end: datetime
    total_transactions: int
    currencies_used: int
    base_currency_volume: Decimal = Field(..., description="Volume in KES")
    currency_breakdown: List[CurrencyUsageStats]
    most_used_currency: str
    conversion_count: int
    total_conversion_fees: Decimal = Field(..., description="Estimated conversion costs")


# ========== MULTI-CURRENCY WALLET ==========

class WalletBalanceMultiCurrency(BaseModel):
    """Schema for wallet balance in multiple currencies"""
    wallet_id: UUID
    base_balance: Decimal = Field(..., description="Balance in KES")
    base_currency: str = Field(default="KES")
    balances: Dict[str, Decimal] = Field(
        ...,
        description="Balance in other currencies"
    )
    exchange_rates: Dict[str, Decimal] = Field(
        ...,
        description="Exchange rates used"
    )
    as_of: datetime = Field(..., description="When balances were calculated")


class AmountInCurrency(BaseModel):
    """Schema for converting amount to specific currency"""
    amount: Decimal
    currency: CurrencyCode


# ========== CURRENCY SETTINGS ==========

class CurrencySettings(BaseModel):
    """Schema for platform currency settings"""
    base_currency: str = Field(default="KES")
    supported_currencies: List[str]
    default_display_currency: str = Field(default="KES")
    auto_update_rates: bool = Field(default=True)
    update_frequency_hours: int = Field(default=24, ge=1, le=168)
    rate_api_provider: str
    allow_multi_currency_payments: bool = Field(default=True)
    conversion_fee_percentage: Decimal = Field(
        default=Decimal("0.00"),
        ge=0,
        le=10,
        description="Platform conversion fee %"
    )


class CurrencySupportedList(BaseModel):
    """Schema for list of supported currencies"""
    currencies: List[Dict[str, str]] = Field(
        ...,
        description="List of {code, name, symbol}"
    )
    base_currency: str
    total_supported: int
