# Payment Service Documentation

## Overview

The `PaymentService` class provides comprehensive multi-gateway payment processing for the Urban Home School platform. It supports three major payment gateways and includes a complete wallet management system.

## Supported Payment Gateways

1. **M-Pesa (Daraja API)** - Mobile money payments for Kenya
2. **PayPal (REST API)** - International payments
3. **Stripe** - Credit/debit card processing worldwide

## Features

- Multi-gateway payment processing
- Automatic wallet crediting on successful payments
- Transaction history and audit trail
- Webhook handling for asynchronous payment notifications
- Consistent response format across all methods
- Comprehensive error handling and logging
- Support for payment verification and reconciliation

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# M-Pesa Configuration
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=your_business_shortcode
MPESA_PASSKEY=your_stk_push_passkey
MPESA_ENVIRONMENT=sandbox  # or production
MPESA_CALLBACK_URL=https://yourdomain.com/api/v1/payments/mpesa/callback
MPESA_TIMEOUT_URL=https://yourdomain.com/api/v1/payments/mpesa/timeout

# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox  # or live
PAYPAL_WEBHOOK_ID=your_webhook_id

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_CURRENCY=kes  # or usd, eur, etc.
```

### Required Python Packages

These are already in `requirements.txt`:

```
stripe==7.0.0
paypalrestsdk==1.13.1
requests==2.31.0
```

## Usage

### Initialize Service

```python
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.payment_service import PaymentService

# In your route handler
async def payment_endpoint(db: AsyncSession = Depends(get_db)):
    payment_service = PaymentService(db)
    # Use payment_service methods...
```

## M-Pesa Methods

### 1. Initiate M-Pesa Payment (STK Push)

Sends a payment prompt to the customer's phone.

```python
result = await payment_service.initiate_mpesa_payment(
    phone_number="254712345678",  # Format: 254XXXXXXXXX
    amount=1000.00,               # KES amount
    user_id=user_id,              # UUID of user
    description="Course enrollment",
    course_id=course_id           # Optional
)

if result["success"]:
    payment_id = result["data"]["payment_id"]
    transaction_ref = result["data"]["transaction_ref"]
    checkout_request_id = result["data"]["checkout_request_id"]
else:
    error = result["error"]
```

**Response Format:**
```json
{
  "success": true,
  "data": {
    "payment_id": "uuid",
    "transaction_ref": "TUHS-XXXXXXXXXXXX",
    "checkout_request_id": "ws_CO_...",
    "merchant_request_id": "...",
    "amount": 1000.0,
    "phone_number": "254712345678"
  },
  "error": ""
}
```

### 2. Verify M-Pesa Payment

Check the status of an M-Pesa payment.

```python
result = await payment_service.verify_mpesa_payment(
    transaction_ref="TUHS-XXXXXXXXXXXX"
)

if result["success"]:
    status = result["data"]["status"]  # "completed", "pending", or "failed"
```

**Response Format:**
```json
{
  "success": true,
  "data": {
    "payment_id": "uuid",
    "status": "completed",
    "amount": 1000.0,
    "result_code": "0",
    "result_desc": "The service request is processed successfully."
  },
  "error": ""
}
```

### 3. Handle M-Pesa Callback

Process asynchronous callback from M-Pesa (called automatically by webhook).

```python
# In your webhook endpoint
result = await payment_service.handle_mpesa_callback(
    callback_data=request_body
)
```

**Callback Data Format:**
```json
{
  "Body": {
    "stkCallback": {
      "CheckoutRequestID": "ws_CO_...",
      "ResultCode": 0,
      "ResultDesc": "The service request is processed successfully.",
      "CallbackMetadata": {
        "Item": [
          {"Name": "Amount", "Value": 1000.00},
          {"Name": "MpesaReceiptNumber", "Value": "ABC123XYZ"},
          {"Name": "PhoneNumber", "Value": "254712345678"}
        ]
      }
    }
  }
}
```

## PayPal Methods

### 1. Initiate PayPal Payment

Create a PayPal payment order.

```python
result = await payment_service.initiate_paypal_payment(
    amount=50.00,                 # USD amount
    user_id=user_id,
    description="Premium subscription",
    course_id=course_id,          # Optional
    currency="USD"
)

if result["success"]:
    approval_url = result["data"]["approval_url"]
    # Redirect user to approval_url
```

**Response Format:**
```json
{
  "success": true,
  "data": {
    "payment_id": "uuid",
    "transaction_ref": "TUHS-PP-XXXXXXXXXXXX",
    "paypal_order_id": "PAYID-...",
    "approval_url": "https://www.paypal.com/checkoutnow?token=...",
    "amount": 50.0,
    "currency": "USD"
  },
  "error": ""
}
```

### 2. Capture PayPal Payment

Capture an authorized PayPal payment (after user approves).

```python
result = await payment_service.capture_paypal_payment(
    order_id="PAYID-..."
)

if result["success"]:
    status = result["data"]["status"]  # "completed"
```

### 3. Handle PayPal Webhook

Process PayPal webhook notifications.

```python
result = await payment_service.handle_paypal_webhook(
    webhook_data=request_body
)
```

**Supported Events:**
- `PAYMENT.SALE.COMPLETED` - Payment completed
- `PAYMENT.SALE.REFUNDED` - Payment refunded

## Stripe Methods

### 1. Initiate Stripe Payment

Create a Stripe payment intent.

```python
result = await payment_service.initiate_stripe_payment(
    amount=75.00,                 # Amount in currency
    user_id=user_id,
    payment_method_id="pm_...",   # Optional, from frontend
    description="Course purchase",
    course_id=course_id,          # Optional
    currency="usd"
)

if result["success"]:
    client_secret = result["data"]["client_secret"]
    # Pass client_secret to frontend for Stripe.js
```

**Response Format:**
```json
{
  "success": true,
  "data": {
    "payment_id": "uuid",
    "transaction_ref": "TUHS-ST-XXXXXXXXXXXX",
    "payment_intent_id": "pi_...",
    "client_secret": "pi_..._secret_...",
    "amount": 75.0,
    "currency": "usd"
  },
  "error": ""
}
```

### 2. Confirm Stripe Payment

Confirm a Stripe payment intent.

```python
result = await payment_service.confirm_stripe_payment(
    payment_intent_id="pi_..."
)

if result["success"]:
    status = result["data"]["status"]  # "completed"
```

### 3. Handle Stripe Webhook

Process Stripe webhook notifications with signature verification.

```python
# In your webhook endpoint
signature = request.headers.get("Stripe-Signature")

result = await payment_service.handle_stripe_webhook(
    webhook_data=request_body,
    signature=signature
)
```

**Supported Events:**
- `payment_intent.succeeded` - Payment succeeded
- `payment_intent.payment_failed` - Payment failed
- `charge.refunded` - Charge refunded

## Wallet Methods

### 1. Get Wallet

Get or create user wallet.

```python
result = await payment_service.get_wallet(user_id)

if result["success"]:
    wallet_id = result["data"]["wallet_id"]
    balance = result["data"]["balance"]
    currency = result["data"]["currency"]
```

**Response Format:**
```json
{
  "success": true,
  "data": {
    "wallet_id": "uuid",
    "user_id": "uuid",
    "balance": 500.0,
    "currency": "KES",
    "total_earned": 1000.0,
    "pending_payout": 0.0,
    "is_active": true
  },
  "error": ""
}
```

### 2. Add Funds

Credit user wallet.

```python
result = await payment_service.add_funds(
    user_id=user_id,
    amount=500.00,
    transaction_id=str(payment_id),
    description="Top-up from M-Pesa"
)

if result["success"]:
    new_balance = result["data"]["new_balance"]
```

**Response Format:**
```json
{
  "success": true,
  "data": {
    "wallet_id": "uuid",
    "previous_balance": 100.0,
    "amount_added": 500.0,
    "new_balance": 600.0,
    "transaction_id": "uuid"
  },
  "error": ""
}
```

### 3. Deduct Funds

Debit user wallet.

```python
result = await payment_service.deduct_funds(
    user_id=user_id,
    amount=100.00,
    transaction_id=str(uuid.uuid4()),
    description="Course enrollment"
)

if result["success"]:
    new_balance = result["data"]["new_balance"]
else:
    if "Insufficient balance" in result["error"]:
        # Handle insufficient funds
        pass
```

### 4. Get Balance

Get current wallet balance.

```python
result = await payment_service.get_balance(user_id)

if result["success"]:
    balance = result["data"]["balance"]
    currency = result["data"]["currency"]
```

## Transaction Methods

### 1. Create Transaction

Create a payment transaction record.

```python
result = await payment_service.create_transaction(
    user_id=user_id,
    amount=1000.00,
    gateway="mpesa",
    metadata={"custom_field": "value"},
    description="Payment for course",
    course_id=course_id
)
```

### 2. Update Transaction Status

Update payment status.

```python
result = await payment_service.update_transaction_status(
    transaction_id=payment_id,
    status="completed"  # or "failed", "refunded"
)
```

### 3. Get Transaction History

Get user's payment history.

```python
result = await payment_service.get_transaction_history(
    user_id=user_id,
    limit=50,      # Max results per page
    offset=0       # Pagination offset
)

if result["success"]:
    transactions = result["data"]["transactions"]
    for txn in transactions:
        print(f"{txn['transaction_ref']}: {txn['status']}")
```

**Response Format:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "payment_id": "uuid",
        "transaction_ref": "TUHS-XXXXXXXXXXXX",
        "gateway": "mpesa",
        "amount": 1000.0,
        "currency": "KES",
        "status": "completed",
        "description": "Course enrollment",
        "course_id": "uuid",
        "created_at": "2024-02-12T10:30:00",
        "completed_at": "2024-02-12T10:31:00"
      }
    ],
    "count": 1,
    "limit": 50,
    "offset": 0
  },
  "error": ""
}
```

## Response Format

All methods return a consistent response format:

```python
{
    "success": bool,      # True if operation succeeded
    "data": dict,         # Operation result data
    "error": str          # Error message if success=False
}
```

## Error Handling

Always check the `success` field before accessing `data`:

```python
result = await payment_service.initiate_mpesa_payment(...)

if result["success"]:
    # Operation succeeded
    payment_id = result["data"]["payment_id"]
else:
    # Operation failed
    error_message = result["error"]
    # Log error or show to user
```

## Payment Flow Examples

### M-Pesa Payment Flow

1. **Initiate Payment**
   ```python
   result = await payment_service.initiate_mpesa_payment(...)
   checkout_request_id = result["data"]["checkout_request_id"]
   ```

2. **User Enters PIN** (on their phone)

3. **Receive Callback** (automatic)
   ```python
   # M-Pesa calls your webhook
   await payment_service.handle_mpesa_callback(callback_data)
   # Wallet is automatically credited on success
   ```

4. **Verify Payment** (optional)
   ```python
   result = await payment_service.verify_mpesa_payment(transaction_ref)
   ```

### Stripe Payment Flow

1. **Create Payment Intent**
   ```python
   result = await payment_service.initiate_stripe_payment(...)
   client_secret = result["data"]["client_secret"]
   ```

2. **Collect Payment** (in frontend with Stripe.js)
   ```javascript
   const {paymentIntent} = await stripe.confirmCardPayment(clientSecret, {
     payment_method: {card: cardElement}
   });
   ```

3. **Confirm Payment** (backend)
   ```python
   result = await payment_service.confirm_stripe_payment(payment_intent_id)
   # Wallet is automatically credited on success
   ```

### PayPal Payment Flow

1. **Create Order**
   ```python
   result = await payment_service.initiate_paypal_payment(...)
   approval_url = result["data"]["approval_url"]
   # Redirect user to approval_url
   ```

2. **User Approves** (on PayPal website)

3. **Capture Payment**
   ```python
   # After user returns from PayPal
   result = await payment_service.capture_paypal_payment(order_id)
   # Wallet is automatically credited on success
   ```

## Testing

### Sandbox Credentials

**M-Pesa Sandbox:**
- Consumer Key: Get from Daraja Portal
- Consumer Secret: Get from Daraja Portal
- Shortcode: 174379 (default test shortcode)
- Passkey: Get from Daraja Portal

**PayPal Sandbox:**
- Create account at developer.paypal.com
- Use sandbox credentials for testing

**Stripe Test Mode:**
- Test cards: 4242 4242 4242 4242 (success)
- Test cards: 4000 0000 0000 9995 (insufficient funds)

### Test Phone Numbers (M-Pesa Sandbox)

Use these for testing STK Push:
- 254712345678
- 254708374149

## Security Best Practices

1. **API Keys**: Store all API keys in environment variables, never in code
2. **Webhook Verification**: Always verify webhook signatures
3. **HTTPS Only**: Use HTTPS for all callback URLs in production
4. **Amount Validation**: Validate amounts on backend before processing
5. **Rate Limiting**: Implement rate limiting on payment endpoints
6. **Logging**: Log all payment attempts and errors
7. **PCI Compliance**: Never store card details (use Stripe/PayPal)

## Troubleshooting

### M-Pesa Issues

- **"Missing scopes"**: Check API credentials and permissions
- **"Invalid Access Token"**: Verify consumer key and secret
- **"Timeout"**: User took too long to enter PIN (normal)
- **"Insufficient Funds"**: Customer doesn't have enough money

### PayPal Issues

- **"Sandbox account required"**: Use sandbox credentials in test mode
- **"Invalid credentials"**: Check client ID and secret
- **"Transaction declined"**: Payment method issue

### Stripe Issues

- **"Card declined"**: Test with different test card
- **"Invalid API key"**: Verify secret key
- **"Webhook signature invalid"**: Check webhook secret

## Logging

All payment operations are logged with appropriate levels:

- `INFO`: Successful operations
- `WARNING`: Failed payments (normal)
- `ERROR`: System errors, API failures

Check logs for debugging:
```python
import logging
logger = logging.getLogger(__name__)
```

## Database Models

The service uses these models:

- **Payment**: Main payment transactions
- **Wallet**: User wallet for credits
- **WalletTransaction**: Audit trail for wallet operations
- **User**: User information

See `/backend/app/models/payment.py` for details.

## Support

For issues or questions:
1. Check logs for error messages
2. Verify environment configuration
3. Test with sandbox credentials
4. Review gateway documentation:
   - M-Pesa: https://developer.safaricom.co.ke/
   - PayPal: https://developer.paypal.com/
   - Stripe: https://stripe.com/docs/

## Future Enhancements

Planned features:
- Recurring payments/subscriptions
- Payment splits for instructors
- Refund processing
- Multiple currency support
- Payment analytics dashboard
- Fraud detection
- Scheduled payouts
