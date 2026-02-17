# Payments API Reference

**Urban Home School (UHS v1) / Urban Bird v1**
*Payment Processing Endpoints*

Base Path: `/api/v1/payments`
Last Updated: 2026-02-15

---

## Table of Contents

1. [Overview](#overview)
2. [POST /payments/initiate](#post-paymentsinitiate)
3. [POST /payments/mpesa/callback](#post-paymentsmpesacallback)
4. [GET /payments/mpesa/status/{transaction_ref}](#get-paymentsmpesastatustransaction_ref)
5. [POST /payments/paypal/webhook](#post-paymentspaypalwebhook)
6. [POST /payments/paypal/capture/{order_id}](#post-paymentspaypalcaptureorder_id)
7. [POST /payments/stripe/webhook](#post-paymentsstripewebhook)
8. [POST /payments/stripe/confirm/{payment_intent_id}](#post-paymentsstripeconfirmpayment_intent_id)
9. [GET /payments/wallet](#get-paymentswallet)
10. [GET /payments/transactions](#get-paymentstransactions)
11. [POST /payments/wallet/add-funds](#post-paymentswalletadd-funds)
12. [GET /payments/methods](#get-paymentsmethods)
13. [POST /payments/methods](#post-paymentsmethods)
14. [DELETE /payments/methods/{method_id}](#delete-paymentsmethodsmethod_id)

---

## Overview

The Payments API handles multi-gateway payment processing for course enrollments, wallet top-ups, and instructor payouts. The platform supports three payment gateways to serve both local Kenyan and international users.

### Supported Payment Gateways

| Gateway | Type | Primary Market | Use Case |
|---------|------|---------------|----------|
| **M-Pesa** | Mobile Money (STK Push) | Kenya | Course payments, wallet top-ups |
| **PayPal** | Online Payments | International | Course payments from abroad |
| **Stripe** | Credit/Debit Cards | International | Card payments globally |

### Payment Flow Overview

```
1. Client calls POST /payments/initiate with gateway and amount
2. Backend creates a pending Transaction record
3. Backend contacts the payment gateway:
   - M-Pesa: Sends STK Push to user's phone
   - PayPal: Returns approval URL for redirect
   - Stripe: Returns client_secret for Stripe.js
4. User completes payment on gateway
5. Gateway sends callback/webhook to backend
6. Backend updates Transaction to "completed"
7. If course payment: enrollment is created
8. If instructor course: revenue split is applied (60/30/10)
```

### Revenue Split Model

For courses created by external instructors:

| Recipient | Share | Description |
|-----------|-------|-------------|
| **Instructor** | 60% | Credited to instructor wallet |
| **Platform** | 30% | Urban Home School operations |
| **Marketing/Support** | 10% | Marketing and customer support fund |

### Supported Currencies

| Currency | Code | Primary Gateway | Symbol |
|----------|------|----------------|--------|
| Kenyan Shilling | `KES` | M-Pesa | KSh |
| US Dollar | `USD` | PayPal, Stripe | $ |
| Euro | `EUR` | PayPal, Stripe | EUR |
| British Pound | `GBP` | PayPal, Stripe | GBP |

---

## POST /payments/initiate

Initiate a payment transaction using the selected payment gateway. This is the primary entry point for all payment flows.

### Details

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Path** | `/api/v1/payments/initiate` |
| **Auth Required** | Yes (Bearer token) |
| **Rate Limit** | 5 requests/minute |

### Request Body

**M-Pesa Payment:**

```json
{
  "gateway": "mpesa",
  "amount": 500.00,
  "currency": "KES",
  "phone_number": "254712345678",
  "course_id": "c1d2e3f4-a5b6-7890-cdef-123456789012",
  "description": "Enrollment: Grade 7 Mathematics"
}
```

**PayPal Payment:**

```json
{
  "gateway": "paypal",
  "amount": 5.00,
  "currency": "USD",
  "course_id": "c1d2e3f4-a5b6-7890-cdef-123456789012",
  "description": "Enrollment: Grade 7 Mathematics"
}
```

**Stripe Payment:**

```json
{
  "gateway": "stripe",
  "amount": 5.00,
  "currency": "USD",
  "course_id": "c1d2e3f4-a5b6-7890-cdef-123456789012",
  "description": "Enrollment: Grade 7 Mathematics"
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `gateway` | string (enum) | Yes | -- | Payment gateway: `mpesa`, `paypal`, or `stripe` |
| `amount` | decimal | Yes | -- | Payment amount (must be > 0, 2 decimal places) |
| `currency` | string | No | `"KES"` | ISO 4217 currency code (auto-uppercased) |
| `phone_number` | string | Conditional | -- | **Required for M-Pesa**. Format: `254XXXXXXXXX` or `07XXXXXXXX` |
| `course_id` | UUID | No | -- | Course being purchased |
| `payment_method_id` | UUID | No | -- | Saved payment method to use |
| `description` | string | No | -- | Payment description (max 500 chars) |
| `metadata` | object | No | `{}` | Additional payment metadata |

### M-Pesa Phone Number Validation

M-Pesa requires a valid Kenyan phone number. Accepted formats:
- `254712345678` (international format with country code)
- `0712345678` (local format, auto-converted to `254712345678`)
- `+254712345678` (with plus prefix, auto-stripped)

### Response (200 OK)

**M-Pesa Response:**

```json
{
  "payment_id": "d4e5f6a7-b8c9-0123-4567-890abcdef012",
  "reference_number": "UHS-TXN-20260215-001",
  "status": "pending",
  "gateway": "mpesa",
  "amount": 500.00,
  "currency": "KES",
  "message": "Please check your phone for the M-Pesa payment prompt",
  "checkout_request_id": "ws_CO_15022026143000_254712345678",
  "merchant_request_id": "29115-34620561-1"
}
```

**PayPal Response:**

```json
{
  "payment_id": "d4e5f6a7-b8c9-0123-4567-890abcdef012",
  "reference_number": "UHS-TXN-20260215-002",
  "status": "pending",
  "gateway": "paypal",
  "amount": 5.00,
  "currency": "USD",
  "message": "Please approve the payment on PayPal",
  "payment_url": "https://www.paypal.com/checkoutnow?token=EC-1AB23456CD789012E",
  "order_id": "5O190127TN364715T"
}
```

**Stripe Response:**

```json
{
  "payment_id": "d4e5f6a7-b8c9-0123-4567-890abcdef012",
  "reference_number": "UHS-TXN-20260215-003",
  "status": "pending",
  "gateway": "stripe",
  "amount": 5.00,
  "currency": "USD",
  "message": "Complete payment using Stripe checkout",
  "payment_intent_id": "pi_3MtwBwLkdIwHu7ix28a3tqPa",
  "client_secret": "pi_3MtwBwLkdIwHu7ix28a3tqPa_secret_YrKJUKribcBjcG8HVhfZluoGH"
}
```

### Error Responses

| Status | Condition | Example |
|--------|-----------|---------|
| `400` | Missing phone for M-Pesa | `{"detail": "Phone number is required for M-Pesa payments"}` |
| `400` | Invalid phone format | `{"detail": "Phone number must be in format 254XXXXXXXXX or 07XXXXXXXX"}` |
| `400` | Unsupported gateway | `{"detail": "Unsupported payment gateway: bitcoin"}` |
| `400` | Invalid amount | `{"detail": "Validation error", "errors": [...]}` |
| `401` | Unauthorized | `{"detail": "Missing or invalid authorization header"}` |
| `500` | Gateway error | `{"detail": "Payment initiation failed: ..."}` |
| `501` | Service not implemented | `{"detail": "Payment service not implemented"}` |

### cURL Examples

```bash
# M-Pesa payment
curl -X POST http://localhost:8000/api/v1/payments/initiate \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "gateway": "mpesa",
    "amount": 500.00,
    "currency": "KES",
    "phone_number": "0712345678",
    "course_id": "c1d2e3f4-a5b6-7890-cdef-123456789012"
  }'

# PayPal payment
curl -X POST http://localhost:8000/api/v1/payments/initiate \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "gateway": "paypal",
    "amount": 5.00,
    "currency": "USD",
    "course_id": "c1d2e3f4-a5b6-7890-cdef-123456789012"
  }'

# Stripe payment
curl -X POST http://localhost:8000/api/v1/payments/initiate \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "gateway": "stripe",
    "amount": 5.00,
    "currency": "USD",
    "course_id": "c1d2e3f4-a5b6-7890-cdef-123456789012"
  }'
```

---

## POST /payments/mpesa/callback

Webhook endpoint for receiving M-Pesa Daraja API STK Push callbacks. This endpoint is called by Safaricom's M-Pesa servers after a payment transaction is completed, failed, or cancelled.

**Important:** This endpoint does NOT require authentication. It is called directly by M-Pesa servers.

### Details

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Path** | `/api/v1/payments/mpesa/callback` |
| **Auth Required** | No (system webhook) |
| **Caller** | Safaricom M-Pesa API |

### Request Body (from M-Pesa)

```json
{
  "MerchantRequestID": "29115-34620561-1",
  "CheckoutRequestID": "ws_CO_15022026143000_254712345678",
  "ResultCode": 0,
  "ResultDesc": "The service request is processed successfully.",
  "CallbackMetadata": {
    "Item": [
      {"Name": "Amount", "Value": 500.00},
      {"Name": "MpesaReceiptNumber", "Value": "SBJ7TYHOL2"},
      {"Name": "Balance"},
      {"Name": "TransactionDate", "Value": 20260215143000},
      {"Name": "PhoneNumber", "Value": 254712345678}
    ]
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `MerchantRequestID` | string | Unique merchant request identifier |
| `CheckoutRequestID` | string | M-Pesa checkout request identifier |
| `ResultCode` | integer | Transaction result code (0 = success) |
| `ResultDesc` | string | Human-readable result description |
| `CallbackMetadata` | object or null | Transaction metadata (present on success) |

### M-Pesa Result Codes

| Code | Description |
|------|-------------|
| `0` | Success |
| `1` | Insufficient funds |
| `1032` | Request cancelled by user |
| `1037` | Timeout (user did not enter PIN) |
| `2001` | Invalid initiator information |

### Response (200 OK)

Always returns success to acknowledge receipt (prevents M-Pesa retries):

```json
{
  "ResultCode": 0,
  "ResultDesc": "Callback processed successfully"
}
```

### Backend Processing

On successful callback (ResultCode = 0):
1. Look up pending transaction by `CheckoutRequestID`
2. Update transaction status to `completed`
3. Store M-Pesa receipt number and metadata
4. Create course enrollment if `course_id` was specified
5. Apply revenue split if instructor course (60/30/10)
6. Credit instructor wallet

---

## GET /payments/mpesa/status/{transaction_ref}

Check the status of an M-Pesa payment transaction using the internal reference number.

### Details

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Path** | `/api/v1/payments/mpesa/status/{transaction_ref}` |
| **Auth Required** | Yes (Bearer token) |
| **Rate Limit** | 100 requests/minute |

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `transaction_ref` | string | Yes | Internal payment reference number |

### Response (200 OK)

```json
{
  "payment_id": "d4e5f6a7-b8c9-0123-4567-890abcdef012",
  "reference_number": "UHS-TXN-20260215-001",
  "status": "completed",
  "amount": 500.00,
  "currency": "KES",
  "gateway": "mpesa",
  "initiated_at": "2026-02-15T14:30:00.000000",
  "completed_at": "2026-02-15T14:30:15.000000",
  "message": "Payment completed successfully"
}
```

### Error Responses

| Status | Condition | Example |
|--------|-----------|---------|
| `403` | Not authorized to view payment | `{"detail": "Not authorized to view this payment"}` |
| `404` | Payment not found | `{"detail": "Payment not found"}` |

### cURL Example

```bash
curl "http://localhost:8000/api/v1/payments/mpesa/status/UHS-TXN-20260215-001" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## POST /payments/paypal/webhook

Webhook endpoint for receiving PayPal payment event notifications. This endpoint is called by PayPal's servers when payment events occur.

**Important:** This endpoint does NOT require authentication. It verifies the webhook signature from PayPal headers.

### Details

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Path** | `/api/v1/payments/paypal/webhook` |
| **Auth Required** | No (system webhook) |
| **Caller** | PayPal webhook system |

### Request Body (from PayPal)

The raw request body and headers are forwarded to the PaymentService for signature verification and processing.

### Response (200 OK)

```json
{
  "status": "success"
}
```

On processing errors:

```json
{
  "status": "received"
}
```

### Backend Processing

1. Verify webhook signature using PayPal's verification API
2. Parse event type (`PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`, etc.)
3. Look up pending transaction
4. Update transaction status
5. Process enrollment and revenue distribution on success

---

## POST /payments/paypal/capture/{order_id}

Capture an authorized PayPal payment after the user has approved it on PayPal's checkout page.

### Details

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Path** | `/api/v1/payments/paypal/capture/{order_id}` |
| **Auth Required** | Yes (Bearer token) |
| **Rate Limit** | 5 requests/minute |

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `order_id` | string | Yes | PayPal order ID to capture |

### Response (200 OK)

```json
{
  "id": "d4e5f6a7-b8c9-0123-4567-890abcdef012",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "course_id": "c1d2e3f4-a5b6-7890-cdef-123456789012",
  "gateway": "paypal",
  "transaction_id": "5O190127TN364715T",
  "reference_number": "UHS-TXN-20260215-002",
  "amount": 5.00,
  "currency": "USD",
  "status": "completed",
  "description": "Enrollment: Grade 7 Mathematics",
  "initiated_at": "2026-02-15T14:30:00.000000",
  "completed_at": "2026-02-15T14:31:00.000000",
  "created_at": "2026-02-15T14:30:00.000000",
  "updated_at": "2026-02-15T14:31:00.000000"
}
```

### Error Responses

| Status | Condition | Example |
|--------|-----------|---------|
| `400` | Capture failed | `{"detail": "PayPal capture failed: ORDER_NOT_APPROVED"}` |
| `403` | Not authorized | `{"detail": "Not authorized to capture this payment"}` |

### cURL Example

```bash
curl -X POST http://localhost:8000/api/v1/payments/paypal/capture/5O190127TN364715T \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## POST /payments/stripe/webhook

Webhook endpoint for receiving Stripe payment event notifications. This endpoint verifies the Stripe webhook signature before processing.

**Important:** This endpoint does NOT require authentication. It uses the `stripe-signature` header for verification.

### Details

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Path** | `/api/v1/payments/stripe/webhook` |
| **Auth Required** | No (system webhook) |
| **Caller** | Stripe webhook system |
| **Required Header** | `stripe-signature` |

### Request Headers

```
stripe-signature: t=1708012345,v1=5257a869e7ecebeda32affa62cdca3fa51cad7e77a0e56ff536d0ce8e108d8bd
```

### Response (200 OK)

```json
{
  "status": "success"
}
```

### Error Responses

| Status | Condition | Example |
|--------|-----------|---------|
| `400` | Invalid signature or processing error | `{"detail": "Webhook processing failed: ..."}` |

---

## POST /payments/stripe/confirm/{payment_intent_id}

Confirm a Stripe PaymentIntent after the client-side payment flow is complete.

### Details

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Path** | `/api/v1/payments/stripe/confirm/{payment_intent_id}` |
| **Auth Required** | Yes (Bearer token) |
| **Rate Limit** | 5 requests/minute |

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `payment_intent_id` | string | Yes | Stripe PaymentIntent ID |

### Response (200 OK)

Returns a full `TransactionResponse` object (same structure as PayPal capture response).

### Error Responses

| Status | Condition | Example |
|--------|-----------|---------|
| `400` | Confirmation failed | `{"detail": "Stripe confirmation failed: ..."}` |
| `403` | Not authorized | `{"detail": "Not authorized to confirm this payment"}` |

### cURL Example

```bash
curl -X POST http://localhost:8000/api/v1/payments/stripe/confirm/pi_3MtwBwLkdIwHu7ix28a3tqPa \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## GET /payments/wallet

Get the current user's wallet balance, total earnings, and pending payout information. Wallets are primarily used by instructors to track course revenue.

### Details

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Path** | `/api/v1/payments/wallet` |
| **Auth Required** | Yes (Bearer token) |
| **Rate Limit** | 100 requests/minute |

### Response (200 OK)

```json
{
  "id": "w1a2b3c4-d5e6-7890-abcd-ef1234567890",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "balance": 15000.00,
  "currency": "KES",
  "total_earned": 45000.00,
  "pending_payout": 5000.00,
  "is_active": true,
  "created_at": "2026-01-01T00:00:00.000000",
  "updated_at": "2026-02-15T12:00:00.000000"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Wallet unique identifier |
| `user_id` | UUID | Wallet owner's user ID |
| `balance` | decimal | Current available balance |
| `currency` | string | Wallet currency (ISO 4217) |
| `total_earned` | decimal | Lifetime total earnings |
| `pending_payout` | decimal | Amount awaiting withdrawal |
| `is_active` | boolean | Whether wallet is active |
| `created_at` | datetime | Wallet creation timestamp |
| `updated_at` | datetime | Last update timestamp |

### Auto-Creation

If an instructor does not have a wallet, one is automatically created with a zero balance when this endpoint is called.

### Error Responses

| Status | Condition | Example |
|--------|-----------|---------|
| `404` | Non-instructor without wallet | `{"detail": "Wallet not found. Wallets are only available for instructors."}` |
| `500` | Server error | `{"detail": "Failed to retrieve wallet: ..."}` |

### cURL Example

```bash
curl "http://localhost:8000/api/v1/payments/wallet" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## GET /payments/transactions

Get paginated transaction history for the current user. Transactions are ordered by creation date (newest first).

### Details

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Path** | `/api/v1/payments/transactions` |
| **Auth Required** | Yes (Bearer token) |
| **Rate Limit** | 100 requests/minute |

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `skip` | integer | No | `0` | Pagination offset (min: 0) |
| `limit` | integer | No | `50` | Page size (min: 1, max: 100) |

### Response (200 OK)

```json
[
  {
    "id": "d4e5f6a7-b8c9-0123-4567-890abcdef012",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "course_id": "c1d2e3f4-a5b6-7890-cdef-123456789012",
    "gateway": "mpesa",
    "transaction_id": "SBJ7TYHOL2",
    "reference_number": "UHS-TXN-20260215-001",
    "amount": 500.00,
    "currency": "KES",
    "status": "completed",
    "description": "Enrollment: Grade 7 Mathematics",
    "phone_number": "254712345678",
    "payment_metadata": {
      "mpesa_receipt": "SBJ7TYHOL2",
      "course_title": "Grade 7 Mathematics: Fractions and Decimals"
    },
    "gateway_response": {},
    "initiated_at": "2026-02-15T14:30:00.000000",
    "completed_at": "2026-02-15T14:30:15.000000",
    "created_at": "2026-02-15T14:30:00.000000",
    "updated_at": "2026-02-15T14:30:15.000000"
  },
  {
    "id": "e5f6a7b8-c9d0-1234-5678-90abcdef0123",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "course_id": null,
    "gateway": "stripe",
    "transaction_id": "pi_3MtwBwLkdIwHu7ix28a3tqPa",
    "reference_number": "UHS-TXN-20260210-005",
    "amount": 10.00,
    "currency": "USD",
    "status": "completed",
    "description": "Wallet top-up",
    "phone_number": null,
    "payment_metadata": {},
    "gateway_response": {},
    "initiated_at": "2026-02-10T10:00:00.000000",
    "completed_at": "2026-02-10T10:00:30.000000",
    "created_at": "2026-02-10T10:00:00.000000",
    "updated_at": "2026-02-10T10:00:30.000000"
  }
]
```

### Error Responses

| Status | Condition | Example |
|--------|-----------|---------|
| `400` | Invalid pagination | `{"detail": "Skip must be non-negative"}` |
| `400` | Invalid limit | `{"detail": "Limit must be between 1 and 100"}` |
| `500` | Server error | `{"detail": "Failed to retrieve transactions: ..."}` |

### cURL Examples

```bash
# Get recent transactions
curl "http://localhost:8000/api/v1/payments/transactions" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Get second page of 20 transactions
curl "http://localhost:8000/api/v1/payments/transactions?skip=20&limit=20" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## POST /payments/wallet/add-funds

Add funds to the user's wallet via a payment gateway. This initiates a payment flow specifically for wallet top-ups (not tied to a course purchase).

### Details

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Path** | `/api/v1/payments/wallet/add-funds` |
| **Auth Required** | Yes (Bearer token) |
| **Rate Limit** | 5 requests/minute |

### Request Body

Same structure as `POST /payments/initiate` (uses `PaymentInitiateRequest` schema).

```json
{
  "gateway": "mpesa",
  "amount": 1000.00,
  "currency": "KES",
  "phone_number": "254712345678",
  "description": "Wallet top-up"
}
```

### Response (201 Created)

Returns a `TransactionResponse` object.

### Error Responses

| Status | Condition | Example |
|--------|-----------|---------|
| `400` | Invalid payment data | `{"detail": "Phone number is required for M-Pesa payments"}` |
| `500` | Processing failure | `{"detail": "Failed to add funds: ..."}` |
| `501` | Service not implemented | `{"detail": "Payment service not implemented"}` |

### cURL Example

```bash
curl -X POST http://localhost:8000/api/v1/payments/wallet/add-funds \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "gateway": "mpesa",
    "amount": 1000.00,
    "currency": "KES",
    "phone_number": "0712345678"
  }'
```

---

## GET /payments/methods

List the user's saved payment methods. Sensitive information (card numbers, phone numbers) is masked for security.

### Details

| Property | Value |
|----------|-------|
| **Method** | `GET` |
| **Path** | `/api/v1/payments/methods` |
| **Auth Required** | Yes (Bearer token) |
| **Rate Limit** | 100 requests/minute |

### Response (200 OK)

```json
[
  {
    "id": "m1a2b3c4-d5e6-7890-abcd-ef1234567890",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "gateway": "mpesa",
    "method_type": "mpesa",
    "details": {
      "phone_number": "2547****5678"
    },
    "is_default": true,
    "is_active": true,
    "created_at": "2026-01-15T10:00:00.000000",
    "updated_at": "2026-01-15T10:00:00.000000"
  },
  {
    "id": "m2b3c4d5-e6f7-8901-bcde-f12345678901",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "gateway": "stripe",
    "method_type": "card",
    "details": {
      "last4": "4242",
      "brand": "visa",
      "exp_month": 12,
      "exp_year": 2028
    },
    "is_default": false,
    "is_active": true,
    "created_at": "2026-02-01T10:00:00.000000",
    "updated_at": "2026-02-01T10:00:00.000000"
  }
]
```

### cURL Example

```bash
curl "http://localhost:8000/api/v1/payments/methods" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## POST /payments/methods

Save a new payment method for future use. Supports M-Pesa numbers, credit/debit cards (via Stripe), and PayPal accounts.

### Details

| Property | Value |
|----------|-------|
| **Method** | `POST` |
| **Path** | `/api/v1/payments/methods` |
| **Auth Required** | Yes (Bearer token) |
| **Rate Limit** | 100 requests/minute |

### Request Body

**M-Pesa:**

```json
{
  "gateway": "mpesa",
  "method_type": "mpesa",
  "details": {
    "phone_number": "254712345678"
  },
  "is_default": true
}
```

**Card (Stripe):**

```json
{
  "gateway": "stripe",
  "method_type": "card",
  "details": {
    "last4": "4242",
    "brand": "visa",
    "exp_month": 12,
    "exp_year": 2028
  },
  "is_default": false
}
```

**PayPal:**

```json
{
  "gateway": "paypal",
  "method_type": "paypal",
  "details": {
    "email": "user@example.com"
  },
  "is_default": false
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `gateway` | string (enum) | Yes | `mpesa`, `paypal`, or `stripe` |
| `method_type` | string (enum) | Yes | `mpesa`, `card`, or `paypal` |
| `details` | object | Yes | Payment method details (validated per type) |
| `is_default` | boolean | No | Set as default payment method (default: `false`) |

### Required Details by Type

| Type | Required Fields |
|------|----------------|
| `mpesa` | `phone_number` |
| `card` | `last4`, `brand`, `exp_month`, `exp_year` |
| `paypal` | `email` |

### Response (201 Created)

Returns the created payment method with masked details.

### Error Responses

| Status | Condition | Example |
|--------|-----------|---------|
| `400` | Missing required field | `{"detail": "phone_number is required for M-Pesa payment methods"}` |
| `400` | Missing card fields | `{"detail": "Missing required fields for card: last4, brand"}` |

### cURL Example

```bash
curl -X POST http://localhost:8000/api/v1/payments/methods \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "gateway": "mpesa",
    "method_type": "mpesa",
    "details": {"phone_number": "254712345678"},
    "is_default": true
  }'
```

---

## DELETE /payments/methods/{method_id}

Remove a saved payment method from the user's account.

### Details

| Property | Value |
|----------|-------|
| **Method** | `DELETE` |
| **Path** | `/api/v1/payments/methods/{method_id}` |
| **Auth Required** | Yes (Bearer token) |
| **Rate Limit** | 100 requests/minute |

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `method_id` | string | Yes | Payment method ID |

### Response (204 No Content)

No response body. The `204` status code indicates successful deletion.

### Error Responses

| Status | Condition | Example |
|--------|-----------|---------|
| `403` | Not authorized | `{"detail": "Not authorized to delete this payment method"}` |
| `404` | Not found | `{"detail": "Payment method not found"}` |

### cURL Example

```bash
curl -X DELETE http://localhost:8000/api/v1/payments/methods/m1a2b3c4-d5e6-7890-abcd-ef1234567890 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Data Model Reference

### Transaction Table (`transactions`)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID (FK) | User who initiated the payment |
| `course_id` | UUID (FK) | Course being purchased (nullable) |
| `gateway` | VARCHAR(20) | Payment gateway (`mpesa`, `paypal`, `stripe`) |
| `transaction_id` | VARCHAR(200) | Gateway-specific transaction ID |
| `reference_number` | VARCHAR(100) | Internal reference number |
| `amount` | DECIMAL(10,2) | Payment amount |
| `currency` | VARCHAR(3) | ISO 4217 currency code |
| `status` | VARCHAR(20) | `pending`, `completed`, `failed`, `refunded`, `cancelled` |
| `description` | TEXT | Payment description |
| `phone_number` | VARCHAR(20) | Phone number (M-Pesa) |
| `payment_metadata` | JSONB | Additional payment metadata |
| `gateway_response` | JSONB | Raw gateway response |
| `initiated_at` | TIMESTAMP | Payment initiation time |
| `completed_at` | TIMESTAMP | Payment completion time |
| `created_at` | TIMESTAMP | Record creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

### Wallet Table (`wallets`)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID (FK) | Wallet owner |
| `balance` | DECIMAL(12,2) | Current available balance |
| `currency` | VARCHAR(3) | Wallet currency |
| `total_earned` | DECIMAL(12,2) | Lifetime earnings |
| `pending_payout` | DECIMAL(12,2) | Pending withdrawal amount |
| `is_active` | BOOLEAN | Wallet active status |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

### PaymentMethod Table (`payment_methods`)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID (FK) | Method owner |
| `gateway` | VARCHAR(20) | Payment gateway |
| `method_type` | VARCHAR(20) | Method type (`mpesa`, `card`, `paypal`) |
| `details` | JSONB | Masked payment details |
| `is_default` | BOOLEAN | Default method flag |
| `is_active` | BOOLEAN | Active status |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

---

## Refund Policy

The platform supports refunds through the admin interface with the following policy:

| Condition | Refund Type | Amount |
|-----------|-------------|--------|
| Within 7 days, < 10% course completion | Full refund | 100% of payment |
| Within 14 days, < 30% course completion | Partial refund | 50% of payment |
| After 14 days or > 30% completion | No refund | 0% |

Refund requests require:
- `payment_id`: The UUID of the original payment
- `reason`: Detailed reason (10-500 characters)
- `amount` (optional): Partial refund amount (defaults to full payment)

Refunds are processed back to the original payment method when possible.
