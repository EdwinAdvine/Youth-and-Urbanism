/**
 * Store Service
 *
 * Handles all HTTP calls for the e-commerce store feature.
 * Uses the shared apiClient (axios) from api.ts which already
 * attaches JWT tokens and refreshes them automatically.
 */

import apiClient from './api';
import type {
  Product,
  ProductListResponse,
  ProductCategory,
  ProductFilterParams,
  Cart,
  CartItem,
  CartItemCreateRequest,
  CartItemUpdateRequest,
  Order,
  CheckoutRequest,
  ShippingAddress,
  ShippingAddressCreateRequest,
} from '../types/store';

const BASE = '/api/v1/store';

// =============================================================================
// Products (Public)
// =============================================================================

/**
 * List products with optional filtering and pagination.
 */
async function listProducts(params?: ProductFilterParams): Promise<ProductListResponse> {
  const { data } = await apiClient.get<ProductListResponse>(`${BASE}/products`, {
    params,
  });
  return data;
}

/**
 * Get a single product by its URL-friendly slug.
 */
async function getProductBySlug(slug: string): Promise<Product> {
  const { data } = await apiClient.get<Product>(`${BASE}/products/${slug}`);
  return data;
}

// =============================================================================
// Product Categories (Public)
// =============================================================================

/**
 * List all active product categories.
 */
async function listCategories(): Promise<ProductCategory[]> {
  const { data } = await apiClient.get<ProductCategory[]>(`${BASE}/categories`);
  return data;
}

// =============================================================================
// Cart (Auth Required)
// =============================================================================

/**
 * Get the current user's shopping cart.
 */
async function getCart(): Promise<Cart> {
  const { data } = await apiClient.get<Cart>(`${BASE}/cart`);
  return data;
}

/**
 * Add an item to the user's cart.
 */
async function addToCart(item: CartItemCreateRequest): Promise<CartItem> {
  const { data } = await apiClient.post<CartItem>(`${BASE}/cart/items`, item);
  return data;
}

/**
 * Update the quantity of a cart item.
 */
async function updateCartItem(itemId: string, payload: CartItemUpdateRequest): Promise<CartItem> {
  const { data } = await apiClient.put<CartItem>(`${BASE}/cart/items/${itemId}`, payload);
  return data;
}

/**
 * Remove an item from the cart entirely.
 */
async function removeCartItem(itemId: string): Promise<void> {
  await apiClient.delete(`${BASE}/cart/items/${itemId}`);
}

// =============================================================================
// Checkout & Orders (Auth Required)
// =============================================================================

/**
 * Create an order from the current cart.
 */
async function checkout(payload: CheckoutRequest): Promise<Order> {
  const { data } = await apiClient.post<Order>(`${BASE}/checkout`, payload);
  return data;
}

/**
 * List the authenticated user's orders.
 */
async function listOrders(page = 1, limit = 20): Promise<Order[]> {
  const { data } = await apiClient.get<Order[]>(`${BASE}/orders`, {
    params: { page, limit },
  });
  return data;
}

/**
 * Get a single order by its order number.
 */
async function getOrder(orderNumber: string): Promise<Order> {
  const { data } = await apiClient.get<Order>(`${BASE}/orders/${orderNumber}`);
  return data;
}

// =============================================================================
// Shipping Addresses (Auth Required)
// =============================================================================

/**
 * List shipping addresses for the current user.
 */
async function listShippingAddresses(): Promise<ShippingAddress[]> {
  const { data } = await apiClient.get<ShippingAddress[]>(`${BASE}/shipping-addresses`);
  return data;
}

/**
 * Create a new shipping address.
 */
async function createShippingAddress(payload: ShippingAddressCreateRequest): Promise<ShippingAddress> {
  const { data } = await apiClient.post<ShippingAddress>(`${BASE}/shipping-addresses`, payload);
  return data;
}

// =============================================================================
// Export
// =============================================================================

const storeService = {
  listProducts,
  getProductBySlug,
  listCategories,
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  checkout,
  listOrders,
  getOrder,
  listShippingAddresses,
  createShippingAddress,
};

export default storeService;
