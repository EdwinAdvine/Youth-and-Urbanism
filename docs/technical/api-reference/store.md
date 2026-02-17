# Store API Reference

> **Base URL:** `/api/v1/store`
>
> **Authentication:** Endpoints that manage user-specific data (cart, checkout) require a valid JWT Bearer token. Product browsing is public.
>
> **Version:** 1.0 &mdash; Urban Home School (The Bird AI)

---

## Table of Contents

1. [List Products](#1-list-products)
2. [Get Product Details](#2-get-product-details)
3. [Get Shopping Cart](#3-get-shopping-cart)
4. [Add to Cart](#4-add-to-cart)
5. [Checkout](#5-checkout)
6. [Error Codes](#error-codes)
7. [Data Models](#data-models)

---

## 1. List Products

Retrieve a paginated list of products from the Urban Home School merchandise store. Products include school supplies, branded merchandise, books, and educational materials.

### Request

```
GET /api/v1/store/products
```

| Parameter  | Location | Type    | Required | Description |
|------------|----------|---------|----------|-------------|
| `category` | query    | string  | No       | Filter by product category slug (e.g., `school-supplies`, `branded-merchandise`, `books-materials`). |
| `search`   | query    | string  | No       | Full-text search on product name, description, and tags. |
| `page`     | query    | integer | No       | Page number (default: `1`). |
| `limit`    | query    | integer | No       | Items per page (default: `20`, max: `100`). |
| `featured` | query    | boolean | No       | Filter to show only featured products. |
| `min_price` | query   | number  | No       | Minimum price filter. |
| `max_price` | query   | number  | No       | Maximum price filter. |
| `sort`     | query    | string  | No       | Sort order: `price_asc`, `price_desc`, `newest`, `popular` (default: `newest`). |

### Response `200 OK`

```json
{
  "status": "success",
  "data": {
    "products": [
      {
        "id": "p1a2b3c4-d5e6-7890-abcd-ef1234567890",
        "name": "Urban Bird School Bag - Blue",
        "slug": "urban-bird-school-bag-blue",
        "description": "Durable school bag with The Bird AI branding, padded laptop compartment, and water bottle holder.",
        "price": 3500.00,
        "compare_at_price": 4500.00,
        "currency": "KES",
        "images": [
          "https://cdn.urbanhomeschool.co.ke/store/bag-blue-front.webp",
          "https://cdn.urbanhomeschool.co.ke/store/bag-blue-side.webp"
        ],
        "category": {
          "id": "cat1a2b3-c4d5-6789-0abc-def123456789",
          "name": "Branded Merchandise",
          "slug": "branded-merchandise"
        },
        "inventory_count": 45,
        "is_in_stock": true,
        "is_featured": true,
        "has_discount": true,
        "tags": ["school-bag", "branded", "laptop-friendly"],
        "created_at": "2026-01-10T08:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total_items": 87,
      "total_pages": 5
    }
  }
}
```

### cURL Example

```bash
# Search for featured school supplies
curl -X GET "http://localhost:8000/api/v1/store/products?category=school-supplies&featured=true&page=1&limit=10"
```

---

## 2. Get Product Details

Retrieve full details for a single product, including all images, category info, and inventory status.

### Request

```
GET /api/v1/store/products/{product_id}
```

| Parameter    | Location | Type          | Required | Description |
|--------------|----------|---------------|----------|-------------|
| `product_id` | path     | string (UUID) | Yes      | The unique identifier of the product. |

### Response `200 OK`

```json
{
  "status": "success",
  "data": {
    "id": "p1a2b3c4-d5e6-7890-abcd-ef1234567890",
    "name": "Urban Bird School Bag - Blue",
    "slug": "urban-bird-school-bag-blue",
    "description": "Durable school bag with The Bird AI branding, padded laptop compartment, and water bottle holder. Perfect for students in Grade 4-12.",
    "price": 3500.00,
    "compare_at_price": 4500.00,
    "currency": "KES",
    "images": [
      "https://cdn.urbanhomeschool.co.ke/store/bag-blue-front.webp",
      "https://cdn.urbanhomeschool.co.ke/store/bag-blue-side.webp",
      "https://cdn.urbanhomeschool.co.ke/store/bag-blue-back.webp"
    ],
    "category": {
      "id": "cat1a2b3-c4d5-6789-0abc-def123456789",
      "name": "Branded Merchandise",
      "slug": "branded-merchandise"
    },
    "sku": "UHS-BAG-BLU-001",
    "inventory_count": 45,
    "is_in_stock": true,
    "is_featured": true,
    "is_active": true,
    "has_discount": true,
    "weight_grams": 850,
    "tags": ["school-bag", "branded", "laptop-friendly"],
    "created_at": "2026-01-10T08:00:00Z",
    "updated_at": "2026-02-01T14:00:00Z"
  }
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| `404 Not Found` | Product with the given ID does not exist or is inactive. |

### cURL Example

```bash
curl -X GET "http://localhost:8000/api/v1/store/products/p1a2b3c4-d5e6-7890-abcd-ef1234567890"
```

---

## 3. Get Shopping Cart

Retrieve the authenticated user's shopping cart with all items and calculated totals.

### Request

```
GET /api/v1/store/cart
```

### Headers

| Header          | Value               |
|-----------------|---------------------|
| `Authorization` | `Bearer <token>`    |

### Response `200 OK`

```json
{
  "status": "success",
  "data": {
    "cart_id": "cart1a2b-3c4d-5e6f-7890-abcdef123456",
    "items": [
      {
        "id": "ci1a2b3c-4d5e-6789-0abc-def123456789",
        "product": {
          "id": "p1a2b3c4-d5e6-7890-abcd-ef1234567890",
          "name": "Urban Bird School Bag - Blue",
          "slug": "urban-bird-school-bag-blue",
          "price": 3500.00,
          "currency": "KES",
          "images": ["https://cdn.urbanhomeschool.co.ke/store/bag-blue-front.webp"],
          "is_in_stock": true
        },
        "quantity": 1,
        "unit_price": 3500.00,
        "line_total": 3500.00
      },
      {
        "id": "ci2b3c4d-5e6f-7890-1abc-def234567890",
        "product": {
          "id": "p2b3c4d5-e6f7-8901-bcde-f12345678901",
          "name": "Exercise Book Set (10 Pack)",
          "slug": "exercise-book-set-10-pack",
          "price": 450.00,
          "currency": "KES",
          "images": ["https://cdn.urbanhomeschool.co.ke/store/exercise-books.webp"],
          "is_in_stock": true
        },
        "quantity": 2,
        "unit_price": 450.00,
        "line_total": 900.00
      }
    ],
    "item_count": 3,
    "subtotal": 4400.00,
    "currency": "KES",
    "created_at": "2026-02-15T08:00:00Z",
    "updated_at": "2026-02-15T09:30:00Z"
  }
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| `401 Unauthorized` | Missing or invalid JWT token. |

### cURL Example

```bash
curl -X GET "http://localhost:8000/api/v1/store/cart" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 4. Add to Cart

Add a product to the authenticated user's shopping cart. If the product is already in the cart, the quantity is updated.

### Request

```
POST /api/v1/store/cart
```

### Headers

| Header          | Value               |
|-----------------|---------------------|
| `Authorization` | `Bearer <token>`    |
| `Content-Type`  | `application/json`  |

### Request Body

```json
{
  "product_id": "p1a2b3c4-d5e6-7890-abcd-ef1234567890",
  "quantity": 1
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `product_id` | string (UUID) | Yes | The product to add to the cart. |
| `quantity` | integer | Yes | Number of units to add (minimum: `1`). |

### Response `201 Created`

```json
{
  "status": "success",
  "data": {
    "cart_id": "cart1a2b-3c4d-5e6f-7890-abcdef123456",
    "item": {
      "id": "ci1a2b3c-4d5e-6789-0abc-def123456789",
      "product_id": "p1a2b3c4-d5e6-7890-abcd-ef1234567890",
      "product_name": "Urban Bird School Bag - Blue",
      "quantity": 1,
      "unit_price": 3500.00,
      "line_total": 3500.00
    },
    "item_count": 1,
    "subtotal": 3500.00,
    "currency": "KES"
  },
  "message": "Item added to cart."
}
```

### Error Responses

| Status | Description |
|--------|-------------|
| `400 Bad Request` | Invalid quantity (zero or negative) or product is out of stock. |
| `401 Unauthorized` | Missing or invalid JWT token. |
| `404 Not Found` | Product not found. |
| `409 Conflict` | Requested quantity exceeds available inventory. |

### cURL Example

```bash
curl -X POST "http://localhost:8000/api/v1/store/cart" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"product_id": "p1a2b3c4-d5e6-7890-abcd-ef1234567890", "quantity": 1}'
```

---

## 5. Checkout

Process checkout for the items currently in the authenticated user's cart. Creates an order, initiates payment, and returns the order confirmation or payment redirect URL.

### Request

```
POST /api/v1/store/checkout
```

### Headers

| Header          | Value               |
|-----------------|---------------------|
| `Authorization` | `Bearer <token>`    |
| `Content-Type`  | `application/json`  |

### Request Body

```json
{
  "payment_gateway": "mpesa",
  "shipping_address": {
    "full_name": "Jane Wanjiku",
    "phone": "+254712345678",
    "address_line_1": "123 Kenyatta Avenue",
    "address_line_2": "Suite 4B",
    "city": "Nairobi",
    "county": "Nairobi",
    "postal_code": "00100",
    "country": "Kenya"
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `payment_gateway` | string | Yes | Payment method. Allowed: `mpesa`, `paypal`, `stripe`. |
| `shipping_address` | object | Yes | Delivery address. |
| `shipping_address.full_name` | string | Yes | Recipient name (max 200 characters). |
| `shipping_address.phone` | string | Yes | Contact phone number (max 20 characters). |
| `shipping_address.address_line_1` | string | Yes | Primary street address (max 200 characters). |
| `shipping_address.address_line_2` | string | No | Secondary address line (max 200 characters). |
| `shipping_address.city` | string | Yes | City or town (max 100 characters). |
| `shipping_address.county` | string | Yes | Kenyan county (max 100 characters). |
| `shipping_address.postal_code` | string | No | Postal/ZIP code (max 20 characters). |
| `shipping_address.country` | string | No | Country (default: `Kenya`, max 50 characters). |
| `notes` | string | No | Optional order notes. |

### Response `201 Created`

```json
{
  "status": "success",
  "data": {
    "order": {
      "id": "ord1a2b3-c4d5-6789-0abc-def123456789",
      "order_number": "UHS-20260215-00042",
      "status": "pending",
      "subtotal": 4400.00,
      "shipping_cost": 300.00,
      "tax": 0.00,
      "total": 4700.00,
      "currency": "KES",
      "items": [
        {
          "product_name": "Urban Bird School Bag - Blue",
          "quantity": 1,
          "unit_price": 3500.00,
          "total_price": 3500.00
        },
        {
          "product_name": "Exercise Book Set (10 Pack)",
          "quantity": 2,
          "unit_price": 450.00,
          "total_price": 900.00
        }
      ],
      "shipping_address": {
        "full_name": "Jane Wanjiku",
        "phone": "+254712345678",
        "city": "Nairobi",
        "county": "Nairobi"
      },
      "created_at": "2026-02-15T10:00:00Z"
    },
    "payment": {
      "gateway": "mpesa",
      "status": "pending",
      "payment_reference": "MPE-20260215-00042",
      "redirect_url": null,
      "instructions": "An M-Pesa payment request has been sent to +254712345678. Enter your PIN to complete the payment."
    }
  },
  "message": "Order placed successfully. Awaiting payment confirmation."
}
```

### Payment Gateway Behavior

| Gateway | Behavior |
|---------|----------|
| `mpesa` | An STK Push is sent to the phone number. The `instructions` field explains next steps. No redirect. |
| `paypal` | A `redirect_url` is returned. Redirect the user to PayPal to complete payment. |
| `stripe` | A `redirect_url` is returned. Redirect the user to the Stripe checkout page. |

### Error Responses

| Status | Description |
|--------|-------------|
| `400 Bad Request` | Cart is empty, invalid payment gateway, or missing shipping address fields. |
| `401 Unauthorized` | Missing or invalid JWT token. |
| `409 Conflict` | One or more items in the cart are out of stock or the inventory has changed. |
| `422 Unprocessable Entity` | Validation errors on shipping address fields. |
| `500 Internal Server Error` | Payment gateway initialization failed. |

### cURL Example

```bash
curl -X POST "http://localhost:8000/api/v1/store/checkout" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "payment_gateway": "mpesa",
    "shipping_address": {
      "full_name": "Jane Wanjiku",
      "phone": "+254712345678",
      "address_line_1": "123 Kenyatta Avenue",
      "city": "Nairobi",
      "county": "Nairobi",
      "postal_code": "00100"
    }
  }'
```

---

## Error Codes

All error responses follow a consistent format:

```json
{
  "status": "error",
  "message": "Human-readable error description.",
  "detail": "Optional technical detail."
}
```

| HTTP Status | Description |
|-------------|-------------|
| `400` | Malformed request body or invalid field values. |
| `401` | Authentication token missing, expired, or invalid. |
| `404` | Requested resource does not exist. |
| `409` | Conflict with current state (e.g., out of stock). |
| `422` | Request body is well-formed but semantically invalid. |
| `500` | Unexpected server error. |

---

## Data Models

### Product

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique product identifier. |
| `name` | string (max 200) | Product display name. |
| `slug` | string (max 200) | URL-friendly unique identifier. |
| `description` | text | Full product description. |
| `price` | decimal (10,2) | Selling price. |
| `compare_at_price` | decimal (10,2) or null | Original price for discount display. |
| `currency` | string (3) | ISO 4217 currency code (default: `KES`). |
| `images` | JSONB array | Array of image URLs. |
| `product_category_id` | UUID or null | FK to product category. |
| `inventory_count` | integer | Current stock level. |
| `sku` | string (max 50) or null | Stock keeping unit (unique). |
| `weight_grams` | integer or null | Product weight for shipping. |
| `is_active` | boolean | Whether the product is available. |
| `is_featured` | boolean | Whether to highlight on storefront. |
| `tags` | JSONB array | Tags for filtering. |

### Cart

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Cart identifier. |
| `user_id` | UUID or null | FK to authenticated user. |
| `session_id` | string or null | Browser session for guest carts. |
| `items` | relationship | Cart items (CartItem[]). |

### Order

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Order identifier. |
| `user_id` | UUID | FK to the buyer. |
| `order_number` | string (max 20) | Human-readable order ID (e.g., `UHS-20260215-00042`). |
| `status` | string | Order status: `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`, `refunded`. |
| `subtotal` | decimal (10,2) | Sum of item totals. |
| `shipping_cost` | decimal (10,2) | Shipping fee. |
| `tax` | decimal (10,2) | Tax amount. |
| `total` | decimal (10,2) | Final total (subtotal + shipping + tax). |
| `payment_method` | string | Gateway used (mpesa, paypal, stripe). |
| `payment_reference` | string | External payment reference. |
| `tracking_number` | string or null | Shipping tracking number. |
