"""
Store Pydantic Schemas for Urban Home School E-Commerce

This module defines Pydantic v2 schemas for the merchandise store API
request/response validation. Schemas cover:
- Product CRUD operations
- Product category responses
- Shopping cart management
- Order and checkout workflows
- Shipping address management
- Paginated product listing

All response schemas use from_attributes = True for ORM compatibility.
"""

from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


# =============================================================================
# Product Category Schemas
# =============================================================================

class ProductCategoryResponse(BaseModel):
    """Response schema for product categories."""

    id: UUID
    name: str
    slug: str
    description: Optional[str] = None
    icon: Optional[str] = None
    display_order: int = 0
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# =============================================================================
# Product Schemas
# =============================================================================

class ProductCreate(BaseModel):
    """Schema for creating a new product (admin only)."""

    name: str = Field(..., min_length=1, max_length=200, description="Product name")
    slug: str = Field(..., min_length=1, max_length=200, description="URL-friendly slug")
    description: str = Field(..., min_length=1, description="Product description")
    price: Decimal = Field(..., ge=0, description="Selling price")
    compare_at_price: Optional[Decimal] = Field(None, ge=0, description="Original price for discount display")
    currency: str = Field(default="KES", max_length=3, description="Currency code (ISO 4217)")
    images: List[str] = Field(default_factory=list, description="List of image URLs")
    product_category_id: Optional[UUID] = Field(None, description="Product category UUID")
    inventory_count: int = Field(default=0, ge=0, description="Stock quantity")
    sku: Optional[str] = Field(None, max_length=50, description="Stock Keeping Unit")
    weight_grams: Optional[int] = Field(None, ge=0, description="Weight in grams")
    is_active: bool = Field(default=True, description="Whether product is active")
    is_featured: bool = Field(default=False, description="Whether product is featured")
    tags: List[str] = Field(default_factory=list, description="Product tags")

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, v: str) -> str:
        """Ensure currency code is uppercase."""
        return v.upper()

    @field_validator("slug")
    @classmethod
    def validate_slug(cls, v: str) -> str:
        """Ensure slug is lowercase and URL-friendly."""
        return v.lower().strip()


class ProductUpdate(BaseModel):
    """Schema for updating an existing product (admin only). All fields optional."""

    name: Optional[str] = Field(None, min_length=1, max_length=200)
    slug: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=1)
    price: Optional[Decimal] = Field(None, ge=0)
    compare_at_price: Optional[Decimal] = Field(None, ge=0)
    currency: Optional[str] = Field(None, max_length=3)
    images: Optional[List[str]] = None
    product_category_id: Optional[UUID] = None
    inventory_count: Optional[int] = Field(None, ge=0)
    sku: Optional[str] = Field(None, max_length=50)
    weight_grams: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    tags: Optional[List[str]] = None

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, v: Optional[str]) -> Optional[str]:
        """Ensure currency code is uppercase if provided."""
        if v is not None:
            return v.upper()
        return v

    @field_validator("slug")
    @classmethod
    def validate_slug(cls, v: Optional[str]) -> Optional[str]:
        """Ensure slug is lowercase and URL-friendly if provided."""
        if v is not None:
            return v.lower().strip()
        return v


class ProductResponse(BaseModel):
    """Response schema for a single product."""

    id: UUID
    name: str
    slug: str
    description: str
    price: Decimal
    compare_at_price: Optional[Decimal] = None
    currency: str = "KES"
    images: List[str] = Field(default_factory=list)
    product_category_id: Optional[UUID] = None
    category: Optional[ProductCategoryResponse] = None
    inventory_count: int = 0
    sku: Optional[str] = None
    weight_grams: Optional[int] = None
    is_active: bool = True
    is_featured: bool = False
    tags: List[str] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProductListResponse(BaseModel):
    """Paginated product list response."""

    products: List[ProductResponse]
    total: int = Field(..., description="Total number of products matching the query")

    model_config = {"from_attributes": True}


# =============================================================================
# Cart Schemas
# =============================================================================

class CartItemCreate(BaseModel):
    """Schema for adding an item to the cart."""

    product_id: UUID = Field(..., description="Product UUID to add")
    quantity: int = Field(default=1, ge=1, description="Quantity to add")


class CartItemUpdate(BaseModel):
    """Schema for updating a cart item quantity."""

    quantity: int = Field(..., ge=1, description="New quantity")


class CartItemResponse(BaseModel):
    """Response schema for a single cart item."""

    id: UUID
    cart_id: UUID
    product_id: UUID
    product: Optional[ProductResponse] = None
    quantity: int
    unit_price: Decimal
    created_at: datetime

    model_config = {"from_attributes": True}


class CartResponse(BaseModel):
    """Response schema for a shopping cart with its items."""

    id: UUID
    user_id: Optional[UUID] = None
    session_id: Optional[str] = None
    items: List[CartItemResponse] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# =============================================================================
# Order Schemas
# =============================================================================

class OrderItemResponse(BaseModel):
    """Response schema for a single order line item."""

    id: UUID
    order_id: UUID
    product_id: Optional[UUID] = None
    product_name: str
    quantity: int
    unit_price: Decimal
    total_price: Decimal

    model_config = {"from_attributes": True}


class OrderResponse(BaseModel):
    """Response schema for a single order."""

    id: UUID
    user_id: UUID
    order_number: str
    status: str = "pending"
    subtotal: Decimal
    shipping_cost: Decimal = Decimal("0.00")
    tax: Decimal = Decimal("0.00")
    total: Decimal
    shipping_address_id: Optional[UUID] = None
    payment_method: Optional[str] = None
    payment_reference: Optional[str] = None
    tracking_number: Optional[str] = None
    notes: Optional[str] = None
    items: List[OrderItemResponse] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CheckoutRequest(BaseModel):
    """Schema for initiating checkout from the current cart."""

    shipping_address_id: UUID = Field(..., description="Shipping address UUID")
    payment_method: Optional[str] = Field(None, max_length=50, description="Payment method (e.g., mpesa, card)")
    notes: Optional[str] = Field(None, max_length=1000, description="Optional order notes")


# =============================================================================
# Shipping Address Schemas
# =============================================================================

class ShippingAddressCreate(BaseModel):
    """Schema for creating a new shipping address."""

    full_name: str = Field(..., min_length=1, max_length=200, description="Recipient full name")
    phone: str = Field(..., min_length=1, max_length=20, description="Contact phone number")
    address_line_1: str = Field(..., min_length=1, max_length=200, description="Primary address line")
    address_line_2: Optional[str] = Field(None, max_length=200, description="Secondary address line")
    city: str = Field(..., min_length=1, max_length=100, description="City or town")
    county: str = Field(..., min_length=1, max_length=100, description="Kenyan county")
    postal_code: Optional[str] = Field(None, max_length=20, description="Postal/ZIP code")
    country: str = Field(default="Kenya", max_length=50, description="Country")
    is_default: bool = Field(default=False, description="Set as default address")


class ShippingAddressUpdate(BaseModel):
    """Schema for updating an existing shipping address. All fields optional."""

    full_name: Optional[str] = Field(None, min_length=1, max_length=200)
    phone: Optional[str] = Field(None, min_length=1, max_length=20)
    address_line_1: Optional[str] = Field(None, min_length=1, max_length=200)
    address_line_2: Optional[str] = Field(None, max_length=200)
    city: Optional[str] = Field(None, min_length=1, max_length=100)
    county: Optional[str] = Field(None, min_length=1, max_length=100)
    postal_code: Optional[str] = Field(None, max_length=20)
    country: Optional[str] = Field(None, max_length=50)
    is_default: Optional[bool] = None


class ShippingAddressResponse(BaseModel):
    """Response schema for a shipping address."""

    id: UUID
    user_id: UUID
    full_name: str
    phone: str
    address_line_1: str
    address_line_2: Optional[str] = None
    city: str
    county: str
    postal_code: Optional[str] = None
    country: str = "Kenya"
    is_default: bool = False
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
