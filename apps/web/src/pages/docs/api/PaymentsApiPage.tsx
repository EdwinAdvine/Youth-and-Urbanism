// PaymentsApiPage - Payments API endpoint documentation.
// Documents M-Pesa, PayPal, Stripe payments, wallet management, and transaction history.

import React from 'react';
import { Link } from 'react-router-dom';
import DocsSection from '../../../components/docs/DocsSection';
import DocsCodeBlock from '../../../components/docs/DocsCodeBlock';
import DocsApiEndpoint from '../../../components/docs/DocsApiEndpoint';

const PaymentsApiPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
        Payments API
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Endpoints for processing payments via M-Pesa, PayPal, and Stripe, managing wallets,
        and tracking transactions. All endpoints are prefixed
        with <code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">/api/v1/payments</code>.
      </p>

      {/* Overview */}
      <DocsSection
        id="payments-overview"
        title="Overview"
        description="UHS supports multiple payment methods with a focus on M-Pesa for Kenyan users."
      >
        <p className="mb-4">
          The Payments API handles course purchases, wallet top-ups, and transaction management.
          M-Pesa is the primary payment method via Safaricom's STK push. PayPal and Stripe
          are available as international alternatives.
        </p>
        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
            <h4 className="font-semibold text-green-800 dark:text-green-300 mb-1">M-Pesa</h4>
            <p className="text-xs text-green-700 dark:text-green-400">STK Push, Kenya-focused</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">PayPal</h4>
            <p className="text-xs text-blue-700 dark:text-blue-400">International payments</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
            <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-1">Stripe</h4>
            <p className="text-xs text-purple-700 dark:text-purple-400">Card payments</p>
          </div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">Currency</h4>
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            All amounts are in Kenyan Shillings (KES) unless otherwise specified. PayPal and
            Stripe endpoints accept USD with automatic conversion.
          </p>
        </div>
      </DocsSection>

      {/* M-Pesa Initiate */}
      <DocsSection
        id="mpesa-initiate"
        title="Initiate M-Pesa Payment"
        description="Trigger an M-Pesa STK push to the user's phone."
      >
        <DocsApiEndpoint
          method="POST"
          path="/api/v1/payments/mpesa/initiate"
          description="Initiate an M-Pesa STK push payment. The user receives a prompt on their phone to enter their M-Pesa PIN. The phone number must be a valid Safaricom number in the format 2547XXXXXXXX. The payment result is delivered asynchronously via the callback endpoint."
          auth={true}
          requestBody={`{
  "phone_number": "254712345678",
  "amount": 500.00,
  "description": "Course: Mathematics Grade 7"
}`}
          responseBody={`{
  "status": "success",
  "data": {
    "checkout_request_id": "ws_CO_15022026103000_254712345678",
    "merchant_request_id": "29115-34620561-1",
    "response_description": "Success. Request accepted for processing.",
    "transaction_id": "txn-uuid-001",
    "amount": 500.00,
    "phone_number": "254712345678"
  }
}`}
          curlExample={`curl -X POST http://localhost:8000/api/v1/payments/mpesa/initiate \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "phone_number": "254712345678",
    "amount": 500.00,
    "description": "Course: Mathematics Grade 7"
  }'`}
        />
      </DocsSection>

      {/* M-Pesa Callback */}
      <DocsSection
        id="mpesa-callback"
        title="M-Pesa Callback"
        description="Internal endpoint for M-Pesa payment confirmation."
      >
        <DocsApiEndpoint
          method="POST"
          path="/api/v1/payments/mpesa/callback"
          description="Internal callback endpoint used by the Safaricom M-Pesa API to deliver payment results. This endpoint is not called directly by clients. It updates the transaction status in the database and triggers appropriate notifications to the user."
          auth={false}
          responseBody={`{
  "status": "success",
  "data": {
    "message": "Callback processed successfully."
  }
}`}
          curlExample={`# This endpoint is called by Safaricom servers, not by clients directly.
# The callback URL is configured in the M-Pesa API dashboard.`}
        />
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong className="text-gray-900 dark:text-white">Note:</strong> This endpoint is
            called automatically by Safaricom after an STK push. It is not intended for direct
            client use. The callback URL must be publicly accessible and configured in your
            Safaricom Daraja portal.
          </p>
        </div>
      </DocsSection>

      {/* PayPal Create */}
      <DocsSection
        id="paypal-create"
        title="Create PayPal Payment"
        description="Create a PayPal payment order."
      >
        <DocsApiEndpoint
          method="POST"
          path="/api/v1/payments/paypal/create"
          description="Create a PayPal payment order. Returns a PayPal approval URL that the client should redirect the user to for payment authorization. After the user approves, call the execute endpoint to complete the transaction."
          auth={true}
          requestBody={`{
  "amount": 5.00,
  "currency": "USD",
  "description": "Course: Science Grade 8",
  "return_url": "http://localhost:3000/payment/success",
  "cancel_url": "http://localhost:3000/payment/cancel"
}`}
          responseBody={`{
  "status": "success",
  "data": {
    "payment_id": "PAYID-M4EXAMPLE",
    "approval_url": "https://www.paypal.com/checkoutnow?token=EC-EXAMPLE",
    "transaction_id": "txn-uuid-002"
  }
}`}
          curlExample={`curl -X POST http://localhost:8000/api/v1/payments/paypal/create \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 5.00,
    "currency": "USD",
    "description": "Course: Science Grade 8",
    "return_url": "http://localhost:3000/payment/success",
    "cancel_url": "http://localhost:3000/payment/cancel"
  }'`}
        />
      </DocsSection>

      {/* PayPal Execute */}
      <DocsSection
        id="paypal-execute"
        title="Execute PayPal Payment"
        description="Complete a PayPal payment after user approval."
      >
        <DocsApiEndpoint
          method="POST"
          path="/api/v1/payments/paypal/execute"
          description="Execute a PayPal payment after the user has approved it on PayPal. The payment_id and payer_id are provided by PayPal in the return URL query parameters after the user approves the payment."
          auth={true}
          requestBody={`{
  "payment_id": "PAYID-M4EXAMPLE",
  "payer_id": "PAYERID123"
}`}
          responseBody={`{
  "status": "success",
  "data": {
    "transaction_id": "txn-uuid-002",
    "payment_status": "completed",
    "amount": 5.00,
    "currency": "USD",
    "completed_at": "2026-02-15T10:35:00Z"
  }
}`}
          curlExample={`curl -X POST http://localhost:8000/api/v1/payments/paypal/execute \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \\
  -H "Content-Type: application/json" \\
  -d '{"payment_id": "PAYID-M4EXAMPLE", "payer_id": "PAYERID123"}'`}
        />
      </DocsSection>

      {/* Stripe Create Intent */}
      <DocsSection
        id="stripe-intent"
        title="Create Stripe Payment Intent"
        description="Create a Stripe payment intent for card payments."
      >
        <DocsApiEndpoint
          method="POST"
          path="/api/v1/payments/stripe/create-intent"
          description="Create a Stripe payment intent. Returns a client secret that the frontend uses with Stripe.js to complete the card payment. The payment intent is confirmed client-side using the Stripe Elements SDK."
          auth={true}
          requestBody={`{
  "amount": 500,
  "currency": "kes",
  "description": "Course: English Grade 9"
}`}
          responseBody={`{
  "status": "success",
  "data": {
    "client_secret": "pi_3EXAMPLE_secret_EXAMPLEKEY",
    "payment_intent_id": "pi_3EXAMPLE",
    "transaction_id": "txn-uuid-003",
    "amount": 500,
    "currency": "kes"
  }
}`}
          curlExample={`curl -X POST http://localhost:8000/api/v1/payments/stripe/create-intent \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \\
  -H "Content-Type: application/json" \\
  -d '{"amount": 500, "currency": "kes", "description": "Course: English Grade 9"}'`}
        />
      </DocsSection>

      {/* Get Wallet */}
      <DocsSection
        id="wallet"
        title="Get Wallet Balance"
        description="Retrieve the authenticated user's wallet balance."
      >
        <DocsApiEndpoint
          method="GET"
          path="/api/v1/payments/wallet"
          description="Get the current wallet balance for the authenticated user. The wallet stores funds in KES that can be used for instant course purchases without going through external payment providers."
          auth={true}
          responseBody={`{
  "status": "success",
  "data": {
    "balance": 2500.00,
    "currency": "KES",
    "last_top_up": "2026-02-10T14:00:00Z",
    "total_spent": 3500.00,
    "total_loaded": 6000.00
  }
}`}
          curlExample={`curl -X GET http://localhost:8000/api/v1/payments/wallet \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."`}
        />
      </DocsSection>

      {/* Top Up Wallet */}
      <DocsSection
        id="wallet-topup"
        title="Top Up Wallet"
        description="Add funds to the user's wallet."
      >
        <DocsApiEndpoint
          method="POST"
          path="/api/v1/payments/wallet/top-up"
          description="Add funds to the user's wallet. Supports M-Pesa as the payment method for top-ups. The funds are available immediately after successful payment confirmation. Minimum top-up amount is KES 100."
          auth={true}
          requestBody={`{
  "amount": 1000.00,
  "payment_method": "mpesa",
  "phone_number": "254712345678"
}`}
          responseBody={`{
  "status": "success",
  "data": {
    "transaction_id": "txn-uuid-004",
    "amount": 1000.00,
    "payment_method": "mpesa",
    "status": "pending",
    "message": "M-Pesa STK push sent. Please check your phone."
  }
}`}
          curlExample={`curl -X POST http://localhost:8000/api/v1/payments/wallet/top-up \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \\
  -H "Content-Type: application/json" \\
  -d '{"amount": 1000.00, "payment_method": "mpesa", "phone_number": "254712345678"}'`}
        />
      </DocsSection>

      {/* Transaction History */}
      <DocsSection
        id="transactions"
        title="Transaction History"
        description="Retrieve a paginated list of all transactions."
      >
        <DocsApiEndpoint
          method="GET"
          path="/api/v1/payments/transactions"
          description="Get a paginated list of all transactions for the authenticated user. Includes course purchases, wallet top-ups, refunds, and instructor payouts. Supports filtering by type and date range."
          auth={true}
          responseBody={`{
  "status": "success",
  "data": {
    "transactions": [
      {
        "id": "txn-uuid-001",
        "type": "purchase",
        "description": "Course: Mathematics Grade 7",
        "amount": -500.00,
        "currency": "KES",
        "payment_method": "mpesa",
        "status": "completed",
        "created_at": "2026-02-15T10:30:00Z"
      },
      {
        "id": "txn-uuid-004",
        "type": "top_up",
        "description": "Wallet top-up via M-Pesa",
        "amount": 1000.00,
        "currency": "KES",
        "payment_method": "mpesa",
        "status": "completed",
        "created_at": "2026-02-10T14:00:00Z"
      }
    ],
    "page": 1,
    "limit": 20,
    "total": 15
  }
}`}
          curlExample={`# Get all transactions
curl -X GET "http://localhost:8000/api/v1/payments/transactions?page=1&limit=20" \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."

# Filter by type
curl -X GET "http://localhost:8000/api/v1/payments/transactions?type=purchase&page=1" \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."`}
        />
      </DocsSection>

      {/* Transaction Detail */}
      <DocsSection
        id="transaction-detail"
        title="Transaction Details"
        description="Retrieve details of a specific transaction."
      >
        <DocsApiEndpoint
          method="GET"
          path="/api/v1/payments/transactions/:id"
          description="Get full details of a specific transaction including payment method, status, associated course or item, and receipt information."
          auth={true}
          responseBody={`{
  "status": "success",
  "data": {
    "id": "txn-uuid-001",
    "type": "purchase",
    "description": "Course: Mathematics Grade 7",
    "amount": 500.00,
    "currency": "KES",
    "payment_method": "mpesa",
    "mpesa_receipt": "QHR71EXAMPLE",
    "status": "completed",
    "course": {
      "id": "course-uuid-001",
      "title": "Mathematics Grade 7 - Numbers"
    },
    "receipt_url": "/api/v1/payments/transactions/txn-uuid-001/receipt",
    "created_at": "2026-02-15T10:30:00Z",
    "completed_at": "2026-02-15T10:30:15Z"
  }
}`}
          curlExample={`curl -X GET http://localhost:8000/api/v1/payments/transactions/txn-uuid-001 \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."`}
        />
      </DocsSection>

      {/* Refund */}
      <DocsSection
        id="refund"
        title="Request Refund"
        description="Request a refund for a completed transaction."
      >
        <DocsApiEndpoint
          method="POST"
          path="/api/v1/payments/refund"
          description="Submit a refund request for a completed transaction. Refunds are subject to review and approval by the admin team. The refund amount is credited back to the user's wallet. Refund requests must be submitted within 7 days of the original transaction."
          auth={true}
          requestBody={`{
  "transaction_id": "txn-uuid-001",
  "reason": "Course content did not match the description."
}`}
          responseBody={`{
  "status": "success",
  "data": {
    "refund_id": "refund-uuid-001",
    "transaction_id": "txn-uuid-001",
    "amount": 500.00,
    "status": "pending_review",
    "reason": "Course content did not match the description.",
    "created_at": "2026-02-15T12:00:00Z"
  }
}`}
          curlExample={`curl -X POST http://localhost:8000/api/v1/payments/refund \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "transaction_id": "txn-uuid-001",
    "reason": "Course content did not match the description."
  }'`}
        />
      </DocsSection>

      {/* Payment Flow Example */}
      <DocsSection
        id="payment-flow"
        title="Payment Flow Example"
        description="End-to-end M-Pesa payment flow for course purchase."
      >
        <DocsCodeBlock
          language="javascript"
          title="JavaScript - M-Pesa Course Purchase"
          code={`// 1. Initiate M-Pesa payment for a course
const payRes = await fetch('/api/v1/payments/mpesa/initiate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${token}\`
  },
  body: JSON.stringify({
    phone_number: '254712345678',
    amount: 500,
    description: 'Course: Mathematics Grade 7'
  })
});
const { data } = await payRes.json();
// User receives STK push on their phone

// 2. Poll transaction status (or use WebSocket)
const checkStatus = async (txnId) => {
  const res = await fetch(\`/api/v1/payments/transactions/\${txnId}\`, {
    headers: { 'Authorization': \`Bearer \${token}\` }
  });
  const { data } = await res.json();
  return data.status; // "pending", "completed", or "failed"
};

// 3. After payment completes, enroll in course
const enrollRes = await fetch('/api/v1/courses/course-uuid-001/enroll', {
  method: 'POST',
  headers: { 'Authorization': \`Bearer \${token}\` }
});`}
        />
      </DocsSection>

      {/* Bottom navigation */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8 flex justify-between items-center">
        <Link
          to="/docs/api/ai-tutor"
          className="text-sm text-red-600 dark:text-red-400 hover:underline"
        >
          &larr; AI Tutor API
        </Link>
        <Link
          to="/docs/api/more"
          className="text-sm text-red-600 dark:text-red-400 hover:underline"
        >
          More APIs &rarr;
        </Link>
      </div>
    </div>
  );
};

export default PaymentsApiPage;
