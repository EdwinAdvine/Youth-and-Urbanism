// ApiOverviewPage - API Reference overview page for the Urban Home School platform.
// Covers base URL, authentication, response formats, rate limiting, status codes, and endpoint groups.

import React from 'react';
import { Link } from 'react-router-dom';
import DocsSection from '../../../components/docs/DocsSection';
import DocsCodeBlock from '../../../components/docs/DocsCodeBlock';

const ApiOverviewPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
        API Reference
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Complete reference for the Urban Home School REST API. Build integrations, automate
        workflows, and extend the platform.
      </p>

      {/* Base URL */}
      <DocsSection
        id="base-url"
        title="Base URL"
        description="All API requests are relative to the base URL."
      >
        <DocsCodeBlock
          code="http://localhost:8000/api/v1/"
          language="text"
          title="Base URL"
        />
        <p className="mb-4">
          In production, replace <code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">localhost:8000</code> with
          your deployment domain. All endpoints described in this documentation are prefixed
          with <code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">/api/v1/</code>.
        </p>
        <p>
          The API follows RESTful conventions, using standard HTTP methods (GET, POST, PUT, DELETE)
          and returns JSON responses. All requests and responses use UTF-8 encoding.
        </p>
      </DocsSection>

      {/* Authentication */}
      <DocsSection
        id="authentication"
        title="Authentication"
        description="JWT Bearer token authentication for all protected endpoints."
      >
        <p className="mb-4">
          The UHS API uses JSON Web Tokens (JWT) for authentication. To access protected endpoints,
          you must include a valid access token in the <code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">Authorization</code> header.
        </p>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Authentication flow:</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Send a POST request to <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">/auth/login</code> with email and password</li>
            <li>Receive an <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">access_token</code> in the response</li>
            <li>Include the token in the <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">Authorization: Bearer &lt;token&gt;</code> header for all subsequent requests</li>
            <li>Tokens expire after 30 minutes by default; use <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">/auth/refresh</code> to obtain a new token</li>
          </ol>
        </div>
        <DocsCodeBlock
          language="bash"
          title="Example Authentication Flow"
          code={`# Step 1: Login to get access token
curl -X POST http://localhost:8000/api/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "student@example.com", "password": "your_password"}'

# Response:
# {
#   "status": "success",
#   "data": {
#     "access_token": "eyJhbGciOiJIUzI1NiIs...",
#     "token_type": "bearer",
#     "user": { "id": "...", "email": "student@example.com", "role": "student" }
#   }
# }

# Step 2: Use the token in subsequent requests
curl -X GET http://localhost:8000/api/v1/auth/me \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."

# Step 3: Refresh the token before it expires
curl -X POST http://localhost:8000/api/v1/auth/refresh \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."`}
        />
      </DocsSection>

      {/* Response Format */}
      <DocsSection
        id="response-format"
        title="Response Format"
        description="All API responses follow a consistent JSON structure."
      >
        <p className="mb-4">
          Every response from the API wraps data in a standard envelope format. This makes it
          easy to check whether a request succeeded and to extract the relevant data or error
          messages programmatically.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Success Response</h4>
            <DocsCodeBlock
              language="json"
              code={`{
  "status": "success",
  "data": {
    "id": "uuid-here",
    "email": "user@example.com",
    "role": "student"
  }
}`}
            />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Error Response</h4>
            <DocsCodeBlock
              language="json"
              code={`{
  "status": "error",
  "message": "Invalid credentials",
  "detail": "The email or password provided is incorrect."
}`}
            />
          </div>
        </div>
        <p>
          Paginated endpoints include additional metadata such as <code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">page</code>,{' '}
          <code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">limit</code>,{' '}
          <code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">total</code>, and{' '}
          <code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">total_pages</code> fields within the data object.
        </p>
      </DocsSection>

      {/* Rate Limiting */}
      <DocsSection
        id="rate-limiting"
        title="Rate Limiting"
        description="Protect platform stability with request rate limits."
      >
        <p className="mb-4">
          The API enforces rate limiting to ensure fair usage and prevent abuse. Rate limits
          are applied per user (authenticated) or per IP address (unauthenticated).
        </p>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Default rate limits:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Authenticated requests:</strong> 100 requests per minute</li>
            <li><strong>Unauthenticated requests:</strong> 20 requests per minute</li>
            <li><strong>AI Tutor endpoints:</strong> 30 requests per minute (higher token cost)</li>
            <li><strong>File upload endpoints:</strong> 10 requests per minute</li>
          </ul>
        </div>
        <p className="mb-2">
          When a rate limit is exceeded, the API returns a <code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">429 Too Many Requests</code> status
          code. The response includes a <code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">Retry-After</code> header indicating how many
          seconds to wait before retrying.
        </p>
      </DocsSection>

      {/* HTTP Status Codes */}
      <DocsSection
        id="status-codes"
        title="HTTP Status Codes"
        description="Common status codes returned by the API."
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">Code</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">200</span></td>
                <td className="px-4 py-3 text-gray-900 dark:text-white">OK</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Request succeeded. Response body contains the requested data.</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">201</span></td>
                <td className="px-4 py-3 text-gray-900 dark:text-white">Created</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Resource was created successfully. Response contains the new resource.</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-xs font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">400</span></td>
                <td className="px-4 py-3 text-gray-900 dark:text-white">Bad Request</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">The request was malformed or contains invalid parameters.</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">401</span></td>
                <td className="px-4 py-3 text-gray-900 dark:text-white">Unauthorized</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Authentication failed. Token is missing, invalid, or expired.</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">403</span></td>
                <td className="px-4 py-3 text-gray-900 dark:text-white">Forbidden</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">You do not have permission to access this resource. Role-based restriction.</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-xs font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">404</span></td>
                <td className="px-4 py-3 text-gray-900 dark:text-white">Not Found</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">The requested resource does not exist or has been deleted.</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-xs font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">422</span></td>
                <td className="px-4 py-3 text-gray-900 dark:text-white">Unprocessable Entity</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Request body validation failed. Check required fields and data types.</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">500</span></td>
                <td className="px-4 py-3 text-gray-900 dark:text-white">Internal Server Error</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">An unexpected error occurred on the server. Please report if persistent.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </DocsSection>

      {/* API Endpoint Groups */}
      <DocsSection
        id="endpoint-groups"
        title="API Endpoint Groups"
        description="Browse the full API documentation by category."
      >
        <p className="mb-4">
          The API is organized into logical groups. Click on any group below to view detailed
          endpoint documentation including request/response examples and curl commands.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            to="/docs/api/auth"
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors block"
          >
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Authentication</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Register, login, logout, token refresh, password reset, and email verification.
            </p>
            <code className="text-xs text-gray-500 dark:text-gray-500 mt-2 block">/api/v1/auth/*</code>
          </Link>
          <Link
            to="/docs/api/courses"
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors block"
          >
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Courses</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Browse, create, enroll in, and manage CBC-aligned courses and modules.
            </p>
            <code className="text-xs text-gray-500 dark:text-gray-500 mt-2 block">/api/v1/courses/*</code>
          </Link>
          <Link
            to="/docs/api/ai-tutor"
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors block"
          >
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">AI Tutor</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Chat with The Bird AI, manage conversation history, and get voice responses.
            </p>
            <code className="text-xs text-gray-500 dark:text-gray-500 mt-2 block">/api/v1/ai-tutor/*</code>
          </Link>
          <Link
            to="/docs/api/payments"
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors block"
          >
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Payments</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              M-Pesa, PayPal, Stripe payments, wallet management, and transaction history.
            </p>
            <code className="text-xs text-gray-500 dark:text-gray-500 mt-2 block">/api/v1/payments/*</code>
          </Link>
          <Link
            to="/docs/api/more"
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors block sm:col-span-2"
          >
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">More APIs</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Assessments, forum, notifications, store, certificates, users, search, and more.
            </p>
            <code className="text-xs text-gray-500 dark:text-gray-500 mt-2 block">/api/v1/assessments, /forum, /notifications, /store, /certificates, ...</code>
          </Link>
        </div>
      </DocsSection>

      {/* Bottom navigation */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8 flex justify-between items-center">
        <Link
          to="/docs/learning-paths"
          className="text-sm text-red-600 dark:text-red-400 hover:underline"
        >
          &larr; Learning Paths
        </Link>
        <Link
          to="/docs/api/auth"
          className="text-sm text-red-600 dark:text-red-400 hover:underline"
        >
          Auth API &rarr;
        </Link>
      </div>
    </div>
  );
};

export default ApiOverviewPage;
