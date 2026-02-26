/**
 * Store / E-Commerce TypeScript Interfaces
 *
 * These types mirror the backend Pydantic schemas defined in
 * backend/app/schemas/store_schemas.py so that the frontend has
 * full type safety when communicating with the store API.
 */

// =============================================================================
// Product Category
// =============================================================================

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Product
// =============================================================================

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price?: number | null;
  currency: string;
  images: string[];
  product_category_id?: string | null;
  category?: ProductCategory | null;
  inventory_count: number;
  sku?: string | null;
  weight_grams?: number | null;
  is_active: boolean;
  is_featured: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
}

export interface ProductFilterParams {
  category?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: string;
  page?: number;
  limit?: number;
}

// =============================================================================
// Cart
// =============================================================================

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  product?: Product | null;
  quantity: number;
  unit_price: number;
  created_at: string;
}

export interface Cart {
  id: string;
  user_id?: string | null;
  session_id?: string | null;
  items: CartItem[];
  created_at: string;
  updated_at: string;
}

export interface CartItemCreateRequest {
  product_id: string;
  quantity: number;
}

export interface CartItemUpdateRequest {
  quantity: number;
}

// =============================================================================
// Orders
// =============================================================================

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: string;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  shipping_address_id?: string | null;
  payment_method?: string | null;
  payment_reference?: string | null;
  tracking_number?: string | null;
  notes?: string | null;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface CheckoutRequest {
  shipping_address_id: string;
  payment_method?: string | null;
  notes?: string | null;
}

// =============================================================================
// Shipping Address
// =============================================================================

export interface ShippingAddress {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  county: string;
  postal_code?: string | null;
  country: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShippingAddressCreateRequest {
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  county: string;
  postal_code?: string;
  country?: string;
  is_default?: boolean;
}
