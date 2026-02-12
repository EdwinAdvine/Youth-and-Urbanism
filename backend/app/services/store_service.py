"""
Store Service Layer for Urban Home School E-Commerce

This module contains business logic for the merchandise store including:
- Product CRUD (create, read, update, delete with pagination/filtering)
- Cart management (get/create, add items, update quantities, remove, clear)
- Checkout workflow (create order from cart, generate order numbers)
- Order management (list user orders, retrieve by order number)
- Shipping address CRUD

All functions are async and accept an AsyncSession for database operations.
"""

import random
import string
from datetime import datetime
from decimal import Decimal
from typing import List, Optional, Tuple
from uuid import UUID

from sqlalchemy import select, func, and_, or_, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.store import (
    Product,
    ProductCategory,
    Cart,
    CartItem,
    Order,
    OrderItem,
    ShippingAddress,
)
from app.schemas.store_schemas import (
    ProductCreate,
    ProductUpdate,
    ShippingAddressCreate,
    ShippingAddressUpdate,
)


class StoreService:
    """Service class for store-related business logic."""

    # =========================================================================
    # Product CRUD
    # =========================================================================

    @staticmethod
    async def create_product(
        db: AsyncSession,
        product_data: ProductCreate,
    ) -> Product:
        """
        Create a new product in the store.

        Args:
            db: Database session
            product_data: Product creation data

        Returns:
            Created Product instance

        Raises:
            ValueError: If slug already exists
        """
        # Check for duplicate slug
        existing = await StoreService.get_product_by_slug(db, product_data.slug)
        if existing:
            raise ValueError(f"Product with slug '{product_data.slug}' already exists")

        product = Product(
            name=product_data.name,
            slug=product_data.slug,
            description=product_data.description,
            price=product_data.price,
            compare_at_price=product_data.compare_at_price,
            currency=product_data.currency,
            images=product_data.images,
            product_category_id=product_data.product_category_id,
            inventory_count=product_data.inventory_count,
            sku=product_data.sku,
            weight_grams=product_data.weight_grams,
            is_active=product_data.is_active,
            is_featured=product_data.is_featured,
            tags=product_data.tags,
        )

        db.add(product)
        await db.flush()
        await db.refresh(product)

        return product

    @staticmethod
    async def get_product_by_id(
        db: AsyncSession,
        product_id: UUID,
    ) -> Optional[Product]:
        """
        Get a product by its UUID.

        Args:
            db: Database session
            product_id: Product UUID

        Returns:
            Product instance or None if not found
        """
        result = await db.execute(
            select(Product).where(Product.id == product_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_product_by_slug(
        db: AsyncSession,
        slug: str,
    ) -> Optional[Product]:
        """
        Get a product by its URL slug.

        Args:
            db: Database session
            slug: Product slug

        Returns:
            Product instance or None if not found
        """
        result = await db.execute(
            select(Product).where(Product.slug == slug)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def list_products(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 20,
        category_slug: Optional[str] = None,
        search: Optional[str] = None,
        min_price: Optional[Decimal] = None,
        max_price: Optional[Decimal] = None,
        sort_by: str = "created_at_desc",
        is_active: bool = True,
        is_featured: Optional[bool] = None,
    ) -> Tuple[List[Product], int]:
        """
        List products with filtering, search, and pagination.

        Args:
            db: Database session
            skip: Offset for pagination
            limit: Maximum number of results
            category_slug: Filter by category slug
            search: Search in product name and description
            min_price: Minimum price filter
            max_price: Maximum price filter
            sort_by: Sort order (created_at_desc, created_at_asc, price_asc, price_desc, name_asc, name_desc)
            is_active: Filter by active status
            is_featured: Filter by featured status (None = all)

        Returns:
            Tuple of (list of products, total count)
        """
        query = select(Product)
        count_query = select(func.count(Product.id))

        filters = []

        if is_active is not None:
            filters.append(Product.is_active == is_active)

        if is_featured is not None:
            filters.append(Product.is_featured == is_featured)

        if category_slug:
            # Join with category to filter by slug
            category_result = await db.execute(
                select(ProductCategory.id).where(ProductCategory.slug == category_slug)
            )
            category_id = category_result.scalar_one_or_none()
            if category_id:
                filters.append(Product.product_category_id == category_id)
            else:
                # No matching category, return empty
                return [], 0

        if search:
            search_filter = or_(
                Product.name.ilike(f"%{search}%"),
                Product.description.ilike(f"%{search}%"),
            )
            filters.append(search_filter)

        if min_price is not None:
            filters.append(Product.price >= min_price)

        if max_price is not None:
            filters.append(Product.price <= max_price)

        if filters:
            query = query.where(and_(*filters))
            count_query = count_query.where(and_(*filters))

        # Get total count
        total_result = await db.execute(count_query)
        total = total_result.scalar_one()

        # Apply sorting
        sort_options = {
            "created_at_desc": Product.created_at.desc(),
            "created_at_asc": Product.created_at.asc(),
            "price_asc": Product.price.asc(),
            "price_desc": Product.price.desc(),
            "name_asc": Product.name.asc(),
            "name_desc": Product.name.desc(),
        }
        order_clause = sort_options.get(sort_by, Product.created_at.desc())
        query = query.order_by(order_clause).offset(skip).limit(limit)

        result = await db.execute(query)
        products = result.scalars().all()

        return list(products), total

    @staticmethod
    async def update_product(
        db: AsyncSession,
        product_id: UUID,
        product_data: ProductUpdate,
    ) -> Optional[Product]:
        """
        Update an existing product.

        Args:
            db: Database session
            product_id: Product UUID
            product_data: Product update data (partial)

        Returns:
            Updated Product instance or None if not found
        """
        product = await StoreService.get_product_by_id(db, product_id)
        if not product:
            return None

        update_dict = product_data.model_dump(exclude_unset=True)

        # If updating slug, check uniqueness
        if "slug" in update_dict:
            existing = await StoreService.get_product_by_slug(db, update_dict["slug"])
            if existing and existing.id != product_id:
                raise ValueError(f"Product with slug '{update_dict['slug']}' already exists")

        for field, value in update_dict.items():
            setattr(product, field, value)

        product.updated_at = datetime.utcnow()

        await db.flush()
        await db.refresh(product)

        return product

    @staticmethod
    async def delete_product(
        db: AsyncSession,
        product_id: UUID,
    ) -> bool:
        """
        Soft-delete a product by deactivating it.

        Args:
            db: Database session
            product_id: Product UUID

        Returns:
            True if deactivated, False if not found
        """
        product = await StoreService.get_product_by_id(db, product_id)
        if not product:
            return False

        product.is_active = False
        product.updated_at = datetime.utcnow()

        await db.flush()

        return True

    # =========================================================================
    # Product Categories
    # =========================================================================

    @staticmethod
    async def list_categories(
        db: AsyncSession,
        active_only: bool = True,
    ) -> List[ProductCategory]:
        """
        List all product categories ordered by display_order.

        Args:
            db: Database session
            active_only: Whether to return only active categories

        Returns:
            List of ProductCategory instances
        """
        query = select(ProductCategory).order_by(ProductCategory.display_order.asc())

        if active_only:
            query = query.where(ProductCategory.is_active == True)

        result = await db.execute(query)
        return list(result.scalars().all())

    # =========================================================================
    # Cart Management
    # =========================================================================

    @staticmethod
    async def get_or_create_cart(
        db: AsyncSession,
        user_id: Optional[UUID] = None,
        session_id: Optional[str] = None,
    ) -> Cart:
        """
        Get an existing cart or create a new one.

        For authenticated users, looks up by user_id.
        For guests, looks up by session_id.

        Args:
            db: Database session
            user_id: Authenticated user UUID (optional)
            session_id: Browser session ID (optional)

        Returns:
            Cart instance

        Raises:
            ValueError: If neither user_id nor session_id is provided
        """
        if not user_id and not session_id:
            raise ValueError("Either user_id or session_id must be provided")

        # Try to find existing cart
        if user_id:
            result = await db.execute(
                select(Cart).where(Cart.user_id == user_id)
            )
        else:
            result = await db.execute(
                select(Cart).where(Cart.session_id == session_id)
            )

        cart = result.scalar_one_or_none()

        if not cart:
            cart = Cart(
                user_id=user_id,
                session_id=session_id,
            )
            db.add(cart)
            await db.flush()
            await db.refresh(cart)

        return cart

    @staticmethod
    async def add_item_to_cart(
        db: AsyncSession,
        cart_id: UUID,
        product_id: UUID,
        quantity: int = 1,
    ) -> CartItem:
        """
        Add a product to the cart or update quantity if already present.

        Args:
            db: Database session
            cart_id: Cart UUID
            product_id: Product UUID
            quantity: Number of units to add

        Returns:
            CartItem instance

        Raises:
            ValueError: If product not found, inactive, or out of stock
        """
        # Verify product exists and is active
        product = await StoreService.get_product_by_id(db, product_id)
        if not product:
            raise ValueError("Product not found")
        if not product.is_active:
            raise ValueError("Product is not available")
        if product.inventory_count < quantity:
            raise ValueError(f"Insufficient stock. Available: {product.inventory_count}")

        # Check if item already in cart
        result = await db.execute(
            select(CartItem).where(
                and_(
                    CartItem.cart_id == cart_id,
                    CartItem.product_id == product_id,
                )
            )
        )
        existing_item = result.scalar_one_or_none()

        if existing_item:
            new_quantity = existing_item.quantity + quantity
            if product.inventory_count < new_quantity:
                raise ValueError(f"Insufficient stock. Available: {product.inventory_count}")
            existing_item.quantity = new_quantity
            existing_item.unit_price = product.price
            await db.flush()
            await db.refresh(existing_item)
            return existing_item

        # Create new cart item
        cart_item = CartItem(
            cart_id=cart_id,
            product_id=product_id,
            quantity=quantity,
            unit_price=product.price,
        )
        db.add(cart_item)
        await db.flush()
        await db.refresh(cart_item)

        return cart_item

    @staticmethod
    async def update_cart_item_quantity(
        db: AsyncSession,
        item_id: UUID,
        quantity: int,
    ) -> Optional[CartItem]:
        """
        Update the quantity of a cart item.

        Args:
            db: Database session
            item_id: CartItem UUID
            quantity: New quantity

        Returns:
            Updated CartItem or None if not found

        Raises:
            ValueError: If insufficient stock
        """
        result = await db.execute(
            select(CartItem).where(CartItem.id == item_id)
        )
        cart_item = result.scalar_one_or_none()

        if not cart_item:
            return None

        # Verify stock
        product = await StoreService.get_product_by_id(db, cart_item.product_id)
        if product and product.inventory_count < quantity:
            raise ValueError(f"Insufficient stock. Available: {product.inventory_count}")

        cart_item.quantity = quantity
        if product:
            cart_item.unit_price = product.price

        await db.flush()
        await db.refresh(cart_item)

        return cart_item

    @staticmethod
    async def remove_cart_item(
        db: AsyncSession,
        item_id: UUID,
    ) -> bool:
        """
        Remove an item from the cart.

        Args:
            db: Database session
            item_id: CartItem UUID

        Returns:
            True if removed, False if not found
        """
        result = await db.execute(
            select(CartItem).where(CartItem.id == item_id)
        )
        cart_item = result.scalar_one_or_none()

        if not cart_item:
            return False

        await db.delete(cart_item)
        await db.flush()

        return True

    @staticmethod
    async def clear_cart(
        db: AsyncSession,
        cart_id: UUID,
    ) -> bool:
        """
        Remove all items from a cart.

        Args:
            db: Database session
            cart_id: Cart UUID

        Returns:
            True if cleared
        """
        await db.execute(
            delete(CartItem).where(CartItem.cart_id == cart_id)
        )
        await db.flush()

        return True

    # =========================================================================
    # Checkout & Orders
    # =========================================================================

    @staticmethod
    def generate_order_number() -> str:
        """
        Generate a unique human-readable order number.

        Format: UHS-YYYYMMDD-XXXXX where X is a random alphanumeric character.

        Returns:
            Order number string (max 20 chars)
        """
        date_part = datetime.utcnow().strftime("%Y%m%d")
        random_part = "".join(random.choices(string.ascii_uppercase + string.digits, k=5))
        return f"UHS-{date_part}-{random_part}"

    @staticmethod
    async def create_order_from_cart(
        db: AsyncSession,
        user_id: UUID,
        shipping_address_id: UUID,
        payment_method: Optional[str] = None,
        notes: Optional[str] = None,
    ) -> Order:
        """
        Create an order from the user's current cart.

        Validates cart contents, calculates totals, creates order and order items,
        decrements inventory, and clears the cart.

        Args:
            db: Database session
            user_id: Authenticated user UUID
            shipping_address_id: Shipping address UUID
            payment_method: Payment method identifier
            notes: Optional order notes

        Returns:
            Created Order instance

        Raises:
            ValueError: If cart is empty, product unavailable, or address invalid
        """
        # Verify shipping address belongs to user
        address_result = await db.execute(
            select(ShippingAddress).where(
                and_(
                    ShippingAddress.id == shipping_address_id,
                    ShippingAddress.user_id == user_id,
                )
            )
        )
        address = address_result.scalar_one_or_none()
        if not address:
            raise ValueError("Shipping address not found")

        # Get user's cart
        cart = await StoreService.get_or_create_cart(db, user_id=user_id)

        if not cart.items or len(cart.items) == 0:
            raise ValueError("Cart is empty")

        # Calculate totals and validate stock
        subtotal = Decimal("0.00")
        order_items_data = []

        for cart_item in cart.items:
            product = await StoreService.get_product_by_id(db, cart_item.product_id)
            if not product or not product.is_active:
                raise ValueError(f"Product '{cart_item.product_id}' is no longer available")
            if product.inventory_count < cart_item.quantity:
                raise ValueError(
                    f"Insufficient stock for '{product.name}'. "
                    f"Available: {product.inventory_count}, requested: {cart_item.quantity}"
                )

            item_total = product.price * cart_item.quantity
            subtotal += item_total

            order_items_data.append({
                "product_id": product.id,
                "product_name": product.name,
                "quantity": cart_item.quantity,
                "unit_price": product.price,
                "total_price": item_total,
            })

        # Generate unique order number (retry on collision)
        order_number = StoreService.generate_order_number()
        for _ in range(5):
            existing = await db.execute(
                select(Order).where(Order.order_number == order_number)
            )
            if not existing.scalar_one_or_none():
                break
            order_number = StoreService.generate_order_number()

        # Calculate shipping and tax (can be expanded later)
        shipping_cost = Decimal("0.00")
        tax = Decimal("0.00")
        total = subtotal + shipping_cost + tax

        # Create order
        order = Order(
            user_id=user_id,
            order_number=order_number,
            status="pending",
            subtotal=subtotal,
            shipping_cost=shipping_cost,
            tax=tax,
            total=total,
            shipping_address_id=shipping_address_id,
            payment_method=payment_method,
            notes=notes,
        )
        db.add(order)
        await db.flush()

        # Create order items and decrement inventory
        for item_data in order_items_data:
            order_item = OrderItem(
                order_id=order.id,
                product_id=item_data["product_id"],
                product_name=item_data["product_name"],
                quantity=item_data["quantity"],
                unit_price=item_data["unit_price"],
                total_price=item_data["total_price"],
            )
            db.add(order_item)

            # Decrement inventory
            product = await StoreService.get_product_by_id(db, item_data["product_id"])
            if product:
                product.inventory_count -= item_data["quantity"]

        # Clear cart
        await StoreService.clear_cart(db, cart.id)

        await db.flush()
        await db.refresh(order)

        return order

    @staticmethod
    async def get_user_orders(
        db: AsyncSession,
        user_id: UUID,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[List[Order], int]:
        """
        Get all orders for a user with pagination.

        Args:
            db: Database session
            user_id: User UUID
            skip: Offset for pagination
            limit: Maximum number of results

        Returns:
            Tuple of (list of orders, total count)
        """
        base_filter = Order.user_id == user_id

        # Count
        count_result = await db.execute(
            select(func.count(Order.id)).where(base_filter)
        )
        total = count_result.scalar_one()

        # Query
        result = await db.execute(
            select(Order)
            .where(base_filter)
            .order_by(Order.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        orders = result.scalars().all()

        return list(orders), total

    @staticmethod
    async def get_order_by_number(
        db: AsyncSession,
        order_number: str,
        user_id: Optional[UUID] = None,
    ) -> Optional[Order]:
        """
        Get an order by its order number, optionally scoped to a user.

        Args:
            db: Database session
            order_number: Human-readable order number
            user_id: Optional user UUID for ownership verification

        Returns:
            Order instance or None if not found
        """
        query = select(Order).where(Order.order_number == order_number)

        if user_id:
            query = query.where(Order.user_id == user_id)

        result = await db.execute(query)
        return result.scalar_one_or_none()

    # =========================================================================
    # Shipping Addresses
    # =========================================================================

    @staticmethod
    async def create_shipping_address(
        db: AsyncSession,
        user_id: UUID,
        address_data: ShippingAddressCreate,
    ) -> ShippingAddress:
        """
        Create a new shipping address for a user.

        If is_default is True, unsets any existing default address.

        Args:
            db: Database session
            user_id: User UUID
            address_data: Shipping address creation data

        Returns:
            Created ShippingAddress instance
        """
        # If setting as default, unset other defaults
        if address_data.is_default:
            await StoreService._unset_default_addresses(db, user_id)

        address = ShippingAddress(
            user_id=user_id,
            full_name=address_data.full_name,
            phone=address_data.phone,
            address_line_1=address_data.address_line_1,
            address_line_2=address_data.address_line_2,
            city=address_data.city,
            county=address_data.county,
            postal_code=address_data.postal_code,
            country=address_data.country,
            is_default=address_data.is_default,
        )

        db.add(address)
        await db.flush()
        await db.refresh(address)

        return address

    @staticmethod
    async def get_user_shipping_addresses(
        db: AsyncSession,
        user_id: UUID,
    ) -> List[ShippingAddress]:
        """
        Get all shipping addresses for a user.

        Args:
            db: Database session
            user_id: User UUID

        Returns:
            List of ShippingAddress instances, default first
        """
        result = await db.execute(
            select(ShippingAddress)
            .where(ShippingAddress.user_id == user_id)
            .order_by(ShippingAddress.is_default.desc(), ShippingAddress.created_at.desc())
        )
        return list(result.scalars().all())

    @staticmethod
    async def update_shipping_address(
        db: AsyncSession,
        address_id: UUID,
        user_id: UUID,
        address_data: ShippingAddressUpdate,
    ) -> Optional[ShippingAddress]:
        """
        Update an existing shipping address.

        Args:
            db: Database session
            address_id: ShippingAddress UUID
            user_id: User UUID (for ownership verification)
            address_data: Update data (partial)

        Returns:
            Updated ShippingAddress or None if not found
        """
        result = await db.execute(
            select(ShippingAddress).where(
                and_(
                    ShippingAddress.id == address_id,
                    ShippingAddress.user_id == user_id,
                )
            )
        )
        address = result.scalar_one_or_none()

        if not address:
            return None

        update_dict = address_data.model_dump(exclude_unset=True)

        # If setting as default, unset other defaults first
        if update_dict.get("is_default"):
            await StoreService._unset_default_addresses(db, user_id)

        for field, value in update_dict.items():
            setattr(address, field, value)

        address.updated_at = datetime.utcnow()

        await db.flush()
        await db.refresh(address)

        return address

    @staticmethod
    async def delete_shipping_address(
        db: AsyncSession,
        address_id: UUID,
        user_id: UUID,
    ) -> bool:
        """
        Delete a shipping address.

        Args:
            db: Database session
            address_id: ShippingAddress UUID
            user_id: User UUID (for ownership verification)

        Returns:
            True if deleted, False if not found
        """
        result = await db.execute(
            select(ShippingAddress).where(
                and_(
                    ShippingAddress.id == address_id,
                    ShippingAddress.user_id == user_id,
                )
            )
        )
        address = result.scalar_one_or_none()

        if not address:
            return False

        await db.delete(address)
        await db.flush()

        return True

    @staticmethod
    async def _unset_default_addresses(
        db: AsyncSession,
        user_id: UUID,
    ) -> None:
        """
        Unset is_default on all addresses for a user.

        Args:
            db: Database session
            user_id: User UUID
        """
        result = await db.execute(
            select(ShippingAddress).where(
                and_(
                    ShippingAddress.user_id == user_id,
                    ShippingAddress.is_default == True,
                )
            )
        )
        for addr in result.scalars().all():
            addr.is_default = False
