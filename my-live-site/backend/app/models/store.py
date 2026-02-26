"""
Store Models for Urban Home School E-Commerce

This module defines the SQLAlchemy ORM models for the Urban Home School
merchandise store (e-commerce). It includes models for products, product
categories, shopping carts, orders, order items, and shipping addresses.

Key Features:
- UUID primary keys for enhanced security
- Product catalog with categories, inventory, and pricing
- Shopping cart with session-based and user-based support
- Order management with status tracking and shipping
- Shipping address management per user
- JSONB for flexible product images and tags
- KES (Kenyan Shilling) as default currency
"""

import uuid
from datetime import datetime

from sqlalchemy import (
    Column,
    String,
    Text,
    Boolean,
    Integer,
    DateTime,
    UUID,
    ForeignKey,
    Numeric,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.database import Base


class ProductCategory(Base):
    """
    Product category model for organizing store merchandise.

    Categories group products into logical collections such as
    School Supplies, Branded Merchandise, and Books & Materials.

    Attributes:
        id: UUID primary key
        name: Category name (max 100 chars)
        slug: URL-friendly unique identifier
        description: Optional category description
        icon: Optional icon identifier or URL
        display_order: Sort order for display (lower = first)
        is_active: Whether the category is visible in the store
    """

    __tablename__ = "product_categories"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Category information
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    icon = Column(String(100), nullable=True)

    # Display
    display_order = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    products = relationship("Product", back_populates="category", lazy="selectin")

    def __repr__(self) -> str:
        return f"<ProductCategory(id={self.id}, name='{self.name}', slug='{self.slug}')>"


class Product(Base):
    """
    Product model for Urban Home School merchandise store.

    Represents physical merchandise items such as school bags, uniforms,
    exercise books, branded t-shirts, and educational materials.

    Attributes:
        id: UUID primary key
        name: Product name (max 200 chars)
        slug: URL-friendly unique identifier for SEO
        description: Full product description
        price: Current selling price in specified currency
        compare_at_price: Original price for showing discounts (nullable)
        currency: Three-letter currency code (default: KES)
        images: JSONB array of image URLs
        product_category_id: FK to product_categories (nullable)
        inventory_count: Current stock level
        sku: Stock keeping unit (unique, nullable)
        weight_grams: Product weight for shipping calculations
        is_active: Whether the product is available for purchase
        is_featured: Whether to highlight on the storefront
        tags: JSONB array of tags for filtering
    """

    __tablename__ = "products"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Product information
    name = Column(String(200), nullable=False)
    slug = Column(String(200), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=False)

    # Pricing
    price = Column(Numeric(10, 2), nullable=False)
    compare_at_price = Column(Numeric(10, 2), nullable=True)
    currency = Column(String(3), default="KES", nullable=False)

    # Media
    images = Column(JSONB, default=[], nullable=False)

    # Category
    product_category_id = Column(
        UUID(as_uuid=True),
        ForeignKey("product_categories.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Inventory
    inventory_count = Column(Integer, default=0, nullable=False)
    sku = Column(String(50), unique=True, nullable=True)
    weight_grams = Column(Integer, nullable=True)

    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    is_featured = Column(Boolean, default=False, nullable=False)

    # Tags
    tags = Column(JSONB, default=[], nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    category = relationship("ProductCategory", back_populates="products", lazy="selectin")

    def __repr__(self) -> str:
        return (
            f"<Product(id={self.id}, name='{self.name}', "
            f"price={self.price}, sku='{self.sku}', is_active={self.is_active})>"
        )

    @property
    def is_in_stock(self) -> bool:
        """Check if the product is in stock."""
        return self.inventory_count > 0

    @property
    def has_discount(self) -> bool:
        """Check if the product has a compare-at (original) price."""
        return self.compare_at_price is not None and self.compare_at_price > self.price


class Cart(Base):
    """
    Shopping cart model supporting both authenticated and anonymous users.

    Carts can be associated with a logged-in user (user_id) or with
    an anonymous browser session (session_id). When a guest user logs in,
    the session-based cart can be merged into their user-based cart.

    Attributes:
        id: UUID primary key
        user_id: FK to users (nullable for guest carts)
        session_id: Browser session identifier (nullable for authenticated carts)
    """

    __tablename__ = "carts"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Owner identification (one of these should be set)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    session_id = Column(String(100), nullable=True, index=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan", lazy="selectin")

    def __repr__(self) -> str:
        return f"<Cart(id={self.id}, user_id={self.user_id}, session_id='{self.session_id}')>"


class CartItem(Base):
    """
    Individual item in a shopping cart.

    Each cart item references a product and stores the quantity
    and unit price at the time the item was added.

    Attributes:
        id: UUID primary key
        cart_id: FK to carts (CASCADE on delete)
        product_id: FK to products
        quantity: Number of units (default 1)
        unit_price: Price per unit at the time of adding to cart
    """

    __tablename__ = "cart_items"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # References
    cart_id = Column(
        UUID(as_uuid=True),
        ForeignKey("carts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    product_id = Column(
        UUID(as_uuid=True),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Item details
    quantity = Column(Integer, default=1, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    cart = relationship("Cart", back_populates="items")
    product = relationship("Product", lazy="selectin")

    def __repr__(self) -> str:
        return f"<CartItem(id={self.id}, product_id={self.product_id}, quantity={self.quantity})>"


class Order(Base):
    """
    Order model representing a completed purchase.

    Orders are created from shopping carts during checkout. They track
    payment status, shipping information, and order lifecycle.

    Statuses: pending, confirmed, processing, shipped, delivered, cancelled, refunded

    Attributes:
        id: UUID primary key
        user_id: FK to users (the buyer)
        order_number: Human-readable unique order identifier (e.g., UHS-20260212-00001)
        status: Current order status
        subtotal: Sum of all item totals before shipping and tax
        shipping_cost: Shipping fee
        tax: Tax amount
        total: Final total (subtotal + shipping + tax)
        shipping_address_id: FK to shipping_addresses
        payment_method: Payment method used (e.g., mpesa, card)
        payment_reference: External payment reference/transaction ID
        tracking_number: Shipping tracking number
        notes: Optional order notes from the buyer
    """

    __tablename__ = "orders"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Owner
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Order identification
    order_number = Column(String(20), unique=True, nullable=False, index=True)

    # Status
    status = Column(String(20), default="pending", nullable=False)

    # Financials
    subtotal = Column(Numeric(10, 2), nullable=False)
    shipping_cost = Column(Numeric(10, 2), default=0, nullable=False)
    tax = Column(Numeric(10, 2), default=0, nullable=False)
    total = Column(Numeric(10, 2), nullable=False)

    # Shipping
    shipping_address_id = Column(
        UUID(as_uuid=True),
        ForeignKey("shipping_addresses.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Payment
    payment_method = Column(String(50), nullable=True)
    payment_reference = Column(String(200), nullable=True)

    # Tracking
    tracking_number = Column(String(100), nullable=True)

    # Notes
    notes = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan", lazy="selectin")
    shipping_address = relationship("ShippingAddress", lazy="selectin")

    def __repr__(self) -> str:
        return (
            f"<Order(id={self.id}, order_number='{self.order_number}', "
            f"status='{self.status}', total={self.total})>"
        )


class OrderItem(Base):
    """
    Individual line item within an order.

    Stores a snapshot of the product information at the time of purchase,
    ensuring historical accuracy even if the product is later modified.

    Attributes:
        id: UUID primary key
        order_id: FK to orders (CASCADE on delete)
        product_id: FK to products
        product_name: Snapshot of product name at time of purchase
        quantity: Number of units purchased
        unit_price: Price per unit at time of purchase
        total_price: quantity * unit_price
    """

    __tablename__ = "order_items"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # References
    order_id = Column(
        UUID(as_uuid=True),
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    product_id = Column(
        UUID(as_uuid=True),
        ForeignKey("products.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Snapshot of product data at time of order
    product_name = Column(String(200), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    total_price = Column(Numeric(10, 2), nullable=False)

    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product", lazy="selectin")

    def __repr__(self) -> str:
        return (
            f"<OrderItem(id={self.id}, product_name='{self.product_name}', "
            f"quantity={self.quantity}, total_price={self.total_price})>"
        )


class ShippingAddress(Base):
    """
    Shipping address model for user delivery addresses.

    Users can save multiple shipping addresses and mark one as default.
    Addresses are Kenya-centric with county-level location support.

    Attributes:
        id: UUID primary key
        user_id: FK to users
        full_name: Recipient full name
        phone: Contact phone number
        address_line_1: Primary address line
        address_line_2: Secondary address line (nullable)
        city: City or town
        county: Kenyan county (e.g., Nairobi, Mombasa, Kisumu)
        postal_code: Postal/ZIP code (nullable)
        country: Country (default: Kenya)
        is_default: Whether this is the user's default address
    """

    __tablename__ = "shipping_addresses"

    # Primary key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Owner
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Address details
    full_name = Column(String(200), nullable=False)
    phone = Column(String(20), nullable=False)
    address_line_1 = Column(String(200), nullable=False)
    address_line_2 = Column(String(200), nullable=True)
    city = Column(String(100), nullable=False)
    county = Column(String(100), nullable=False)
    postal_code = Column(String(20), nullable=True)
    country = Column(String(50), default="Kenya", nullable=False)

    # Default flag
    is_default = Column(Boolean, default=False, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return (
            f"<ShippingAddress(id={self.id}, full_name='{self.full_name}', "
            f"city='{self.city}', county='{self.county}', is_default={self.is_default})>"
        )
