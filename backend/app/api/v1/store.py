"""
Store API Endpoints for Urban Home School E-Commerce

This module defines FastAPI routes for the merchandise store including:
- Public product browsing with filtering, search, and pagination
- Cart management (authenticated or session-based)
- Checkout workflow to create orders
- Order history retrieval
- Shipping address CRUD

All protected endpoints require JWT authentication via Bearer token.
Admin-only endpoints require the 'admin' role.
"""

from decimal import Decimal
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Cookie, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.utils.security import get_current_user
from app.services.store_service import StoreService
from app.schemas.store_schemas import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductListResponse,
    ProductCategoryResponse,
    CartResponse,
    CartItemCreate,
    CartItemUpdate,
    CartItemResponse,
    CheckoutRequest,
    OrderResponse,
    ShippingAddressCreate,
    ShippingAddressUpdate,
    ShippingAddressResponse,
)

# Create router with store prefix and tags
router = APIRouter(prefix="/store", tags=["Store"])


# =============================================================================
# Product Categories
# =============================================================================

@router.get(
    "/categories",
    response_model=list[ProductCategoryResponse],
    status_code=status.HTTP_200_OK,
    summary="List product categories",
    description="Retrieve all active product categories.",
)
async def list_categories(
    db: AsyncSession = Depends(get_db),
) -> list[ProductCategoryResponse]:
    """Get all active product categories."""
    categories = await StoreService.list_categories(db, active_only=True)
    return [ProductCategoryResponse.model_validate(c) for c in categories]


# =============================================================================
# Products (Public)
# =============================================================================

@router.get(
    "/products",
    response_model=ProductListResponse,
    status_code=status.HTTP_200_OK,
    summary="List products",
    description="Browse products with optional filtering by category, price range, search text, and sorting.",
)
async def list_products(
    category: Optional[str] = Query(None, description="Filter by category slug"),
    search: Optional[str] = Query(None, description="Search in name and description"),
    min_price: Optional[Decimal] = Query(None, ge=0, description="Minimum price"),
    max_price: Optional[Decimal] = Query(None, ge=0, description="Maximum price"),
    sort_by: str = Query(
        "created_at_desc",
        description="Sort order: created_at_desc, created_at_asc, price_asc, price_desc, name_asc, name_desc",
    ),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_db),
) -> ProductListResponse:
    """List products with filtering and pagination (public endpoint)."""
    skip = (page - 1) * limit
    products, total = await StoreService.list_products(
        db=db,
        skip=skip,
        limit=limit,
        category_slug=category,
        search=search,
        min_price=min_price,
        max_price=max_price,
        sort_by=sort_by,
    )
    return ProductListResponse(
        products=[ProductResponse.model_validate(p) for p in products],
        total=total,
    )


@router.get(
    "/products/{slug}",
    response_model=ProductResponse,
    status_code=status.HTTP_200_OK,
    summary="Get product by slug",
    description="Retrieve a single product by its URL slug.",
)
async def get_product(
    slug: str,
    db: AsyncSession = Depends(get_db),
) -> ProductResponse:
    """Get a single product by slug (public endpoint)."""
    product = await StoreService.get_product_by_slug(db, slug)
    if not product or not product.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    return ProductResponse.model_validate(product)


# =============================================================================
# Products (Admin Only)
# =============================================================================

@router.post(
    "/products",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a product (admin)",
    description="Create a new product in the store. Requires admin role.",
)
async def create_product(
    product_data: ProductCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ProductResponse:
    """Create a new product (admin only)."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    try:
        product = await StoreService.create_product(db, product_data)
        return ProductResponse.model_validate(product)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.put(
    "/products/{product_id}",
    response_model=ProductResponse,
    status_code=status.HTTP_200_OK,
    summary="Update a product (admin)",
    description="Update an existing product. Requires admin role.",
)
async def update_product(
    product_id: UUID,
    product_data: ProductUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ProductResponse:
    """Update a product by ID (admin only)."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    try:
        product = await StoreService.update_product(db, product_id, product_data)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found",
            )
        return ProductResponse.model_validate(product)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.delete(
    "/products/{product_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a product (admin)",
    description="Soft-delete (deactivate) a product. Requires admin role.",
)
async def delete_product(
    product_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Soft-delete a product by ID (admin only)."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    deleted = await StoreService.delete_product(db, product_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    return {"message": "Product deactivated successfully"}


# =============================================================================
# Cart
# =============================================================================

@router.get(
    "/cart",
    response_model=CartResponse,
    status_code=status.HTTP_200_OK,
    summary="Get shopping cart",
    description="Retrieve the current user's shopping cart. Uses JWT auth or session_id cookie.",
)
async def get_cart(
    session_id: Optional[str] = Cookie(None),
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CartResponse:
    """Get or create the shopping cart for the current user or session."""
    user_id = current_user.id if current_user else None

    if not user_id and not session_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Authentication or session_id cookie required",
        )

    cart = await StoreService.get_or_create_cart(db, user_id=user_id, session_id=session_id)
    return CartResponse.model_validate(cart)


@router.post(
    "/cart/items",
    response_model=CartItemResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add item to cart",
    description="Add a product to the shopping cart.",
)
async def add_to_cart(
    item_data: CartItemCreate,
    session_id: Optional[str] = Cookie(None),
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CartItemResponse:
    """Add a product to the cart."""
    user_id = current_user.id if current_user else None

    if not user_id and not session_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Authentication or session_id cookie required",
        )

    cart = await StoreService.get_or_create_cart(db, user_id=user_id, session_id=session_id)

    try:
        cart_item = await StoreService.add_item_to_cart(
            db, cart.id, item_data.product_id, item_data.quantity
        )
        return CartItemResponse.model_validate(cart_item)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.put(
    "/cart/items/{item_id}",
    response_model=CartItemResponse,
    status_code=status.HTTP_200_OK,
    summary="Update cart item quantity",
    description="Update the quantity of an item in the shopping cart.",
)
async def update_cart_item(
    item_id: UUID,
    item_data: CartItemUpdate,
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CartItemResponse:
    """Update cart item quantity."""
    try:
        cart_item = await StoreService.update_cart_item_quantity(
            db, item_id, item_data.quantity
        )
        if not cart_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cart item not found",
            )
        return CartItemResponse.model_validate(cart_item)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.delete(
    "/cart/items/{item_id}",
    status_code=status.HTTP_200_OK,
    summary="Remove item from cart",
    description="Remove a specific item from the shopping cart.",
)
async def remove_cart_item(
    item_id: UUID,
    current_user: Optional[User] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Remove an item from the cart."""
    removed = await StoreService.remove_cart_item(db, item_id)
    if not removed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found",
        )
    return {"message": "Item removed from cart"}


# =============================================================================
# Checkout & Orders
# =============================================================================

@router.post(
    "/checkout",
    response_model=OrderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Checkout",
    description="Create an order from the current cart. Requires authentication.",
)
async def checkout(
    checkout_data: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> OrderResponse:
    """Create an order from the user's cart."""
    try:
        order = await StoreService.create_order_from_cart(
            db=db,
            user_id=current_user.id,
            shipping_address_id=checkout_data.shipping_address_id,
            payment_method=checkout_data.payment_method,
            notes=checkout_data.notes,
        )
        return OrderResponse.model_validate(order)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get(
    "/orders",
    response_model=list[OrderResponse],
    status_code=status.HTTP_200_OK,
    summary="List user orders",
    description="Get the authenticated user's order history.",
)
async def list_orders(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[OrderResponse]:
    """Get order history for the current user."""
    skip = (page - 1) * limit
    orders, _ = await StoreService.get_user_orders(
        db, current_user.id, skip=skip, limit=limit
    )
    return [OrderResponse.model_validate(o) for o in orders]


@router.get(
    "/orders/{order_number}",
    response_model=OrderResponse,
    status_code=status.HTTP_200_OK,
    summary="Get order by number",
    description="Retrieve a specific order by its order number.",
)
async def get_order(
    order_number: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> OrderResponse:
    """Get a specific order by order number."""
    order = await StoreService.get_order_by_number(
        db, order_number, user_id=current_user.id
    )
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )
    return OrderResponse.model_validate(order)


# =============================================================================
# Shipping Addresses
# =============================================================================

@router.get(
    "/shipping-addresses",
    response_model=list[ShippingAddressResponse],
    status_code=status.HTTP_200_OK,
    summary="List shipping addresses",
    description="Get all shipping addresses for the current user.",
)
async def list_shipping_addresses(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[ShippingAddressResponse]:
    """Get shipping addresses for the current user."""
    addresses = await StoreService.get_user_shipping_addresses(db, current_user.id)
    return [ShippingAddressResponse.model_validate(a) for a in addresses]


@router.post(
    "/shipping-addresses",
    response_model=ShippingAddressResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create shipping address",
    description="Add a new shipping address for the current user.",
)
async def create_shipping_address(
    address_data: ShippingAddressCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ShippingAddressResponse:
    """Create a new shipping address."""
    address = await StoreService.create_shipping_address(
        db, current_user.id, address_data
    )
    return ShippingAddressResponse.model_validate(address)


@router.put(
    "/shipping-addresses/{address_id}",
    response_model=ShippingAddressResponse,
    status_code=status.HTTP_200_OK,
    summary="Update shipping address",
    description="Update an existing shipping address.",
)
async def update_shipping_address(
    address_id: UUID,
    address_data: ShippingAddressUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ShippingAddressResponse:
    """Update a shipping address."""
    address = await StoreService.update_shipping_address(
        db, address_id, current_user.id, address_data
    )
    if not address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipping address not found",
        )
    return ShippingAddressResponse.model_validate(address)


@router.delete(
    "/shipping-addresses/{address_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete shipping address",
    description="Delete a shipping address.",
)
async def delete_shipping_address(
    address_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Delete a shipping address."""
    deleted = await StoreService.delete_shipping_address(
        db, address_id, current_user.id
    )
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipping address not found",
        )
    return {"message": "Shipping address deleted successfully"}
