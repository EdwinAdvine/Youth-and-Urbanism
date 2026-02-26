// AuthApiPage - Authentication API endpoint documentation.
// Documents register, login, logout, token management, and password reset endpoints.

import React from 'react';
import { Link } from 'react-router-dom';
import DocsSection from '../../../components/docs/DocsSection';
import DocsCodeBlock from '../../../components/docs/DocsCodeBlock';
import DocsApiEndpoint from '../../../components/docs/DocsApiEndpoint';

const AuthApiPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
        Authentication API
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Endpoints for user registration, login, token management, and password operations.
        All auth endpoints are prefixed with <code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">/api/v1/auth</code>.
      </p>

      {/* Overview */}
      <DocsSection
        id="auth-overview"
        title="Overview"
        description="The authentication system uses JWT Bearer tokens with bcrypt password hashing."
      >
        <p className="mb-4">
          UHS uses JSON Web Tokens (JWT) with the HS256 algorithm for authentication. Access tokens
          expire after 30 minutes by default. All protected endpoints require a valid token in
          the <code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">Authorization</code> header.
        </p>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">Important</h4>
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            Store tokens securely. Never expose tokens in URLs, logs, or client-side storage
            that is accessible to other scripts. Use httpOnly cookies or secure storage mechanisms.
          </p>
        </div>
      </DocsSection>

      {/* Register */}
      <DocsSection
        id="register"
        title="Register"
        description="Create a new user account."
      >
        <DocsApiEndpoint
          method="POST"
          path="/api/v1/auth/register"
          description="Create a new user account. The role determines which dashboard and features the user can access. After registration, a verification email is sent to the provided address."
          auth={false}
          requestBody={`{
  "email": "student@example.com",
  "password": "securePassword123!",
  "full_name": "Jane Mwangi",
  "role": "student"
}`}
          responseBody={`{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "student@example.com",
    "full_name": "Jane Mwangi",
    "role": "student",
    "is_verified": false,
    "created_at": "2026-02-15T10:30:00Z"
  }
}`}
          curlExample={`curl -X POST http://localhost:8000/api/v1/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "student@example.com",
    "password": "securePassword123!",
    "full_name": "Jane Mwangi",
    "role": "student"
  }'`}
        />
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Valid roles: <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">student</code>,{' '}
          <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">parent</code>,{' '}
          <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">instructor</code>,{' '}
          <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">admin</code>,{' '}
          <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">partner</code>,{' '}
          <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">staff</code>
        </p>
      </DocsSection>

      {/* Login */}
      <DocsSection
        id="login"
        title="Login"
        description="Authenticate and receive a JWT access token."
      >
        <DocsApiEndpoint
          method="POST"
          path="/api/v1/auth/login"
          description="Authenticate with email and password to receive a JWT access token. The token must be included in the Authorization header for all subsequent protected requests."
          auth={false}
          requestBody={`{
  "email": "student@example.com",
  "password": "securePassword123!"
}`}
          responseBody={`{
  "status": "success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "student@example.com",
      "full_name": "Jane Mwangi",
      "role": "student",
      "is_verified": true
    }
  }
}`}
          curlExample={`curl -X POST http://localhost:8000/api/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "student@example.com", "password": "securePassword123!"}'`}
        />
      </DocsSection>

      {/* Logout */}
      <DocsSection
        id="logout"
        title="Logout"
        description="Invalidate the current access token."
      >
        <DocsApiEndpoint
          method="POST"
          path="/api/v1/auth/logout"
          description="Invalidate the current JWT token. After logout, the token can no longer be used to access protected endpoints. The token is added to a blacklist stored in Redis."
          auth={true}
          responseBody={`{
  "status": "success",
  "data": {
    "message": "Successfully logged out"
  }
}`}
          curlExample={`curl -X POST http://localhost:8000/api/v1/auth/logout \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."`}
        />
      </DocsSection>

      {/* Get Current User */}
      <DocsSection
        id="get-me"
        title="Get Current User"
        description="Retrieve the profile of the currently authenticated user."
      >
        <DocsApiEndpoint
          method="GET"
          path="/api/v1/auth/me"
          description="Returns the full profile of the authenticated user, including role, verification status, profile metadata, and account timestamps."
          auth={true}
          responseBody={`{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "student@example.com",
    "full_name": "Jane Mwangi",
    "role": "student",
    "is_verified": true,
    "avatar_url": "/uploads/avatars/jane.jpg",
    "profile_data": {
      "grade_level": "Grade 7",
      "learning_style": "visual",
      "subjects": ["Mathematics", "Science"]
    },
    "created_at": "2026-02-15T10:30:00Z",
    "updated_at": "2026-02-15T12:00:00Z"
  }
}`}
          curlExample={`curl -X GET http://localhost:8000/api/v1/auth/me \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."`}
        />
      </DocsSection>

      {/* Refresh Token */}
      <DocsSection
        id="refresh"
        title="Refresh Token"
        description="Obtain a new access token using the current valid token."
      >
        <DocsApiEndpoint
          method="POST"
          path="/api/v1/auth/refresh"
          description="Exchange a valid (not yet expired) access token for a new one. This extends the session without requiring the user to log in again. The old token is invalidated."
          auth={true}
          responseBody={`{
  "status": "success",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new...",
    "token_type": "bearer"
  }
}`}
          curlExample={`curl -X POST http://localhost:8000/api/v1/auth/refresh \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."`}
        />
      </DocsSection>

      {/* Forgot Password */}
      <DocsSection
        id="forgot-password"
        title="Forgot Password"
        description="Request a password reset link via email."
      >
        <DocsApiEndpoint
          method="POST"
          path="/api/v1/auth/forgot-password"
          description="Send a password reset link to the registered email address. The link contains a one-time token valid for 1 hour. For security, the endpoint always returns 200 even if the email is not found."
          auth={false}
          requestBody={`{
  "email": "student@example.com"
}`}
          responseBody={`{
  "status": "success",
  "data": {
    "message": "If the email exists, a password reset link has been sent."
  }
}`}
          curlExample={`curl -X POST http://localhost:8000/api/v1/auth/forgot-password \\
  -H "Content-Type: application/json" \\
  -d '{"email": "student@example.com"}'`}
        />
      </DocsSection>

      {/* Reset Password */}
      <DocsSection
        id="reset-password"
        title="Reset Password"
        description="Reset password using the token from the reset email."
      >
        <DocsApiEndpoint
          method="POST"
          path="/api/v1/auth/reset-password"
          description="Reset the user's password using the one-time token received via email. The token is invalidated after use. The new password must meet minimum security requirements (8+ characters, mixed case, at least one number)."
          auth={false}
          requestBody={`{
  "token": "reset-token-from-email",
  "new_password": "newSecurePassword456!"
}`}
          responseBody={`{
  "status": "success",
  "data": {
    "message": "Password has been reset successfully."
  }
}`}
          curlExample={`curl -X POST http://localhost:8000/api/v1/auth/reset-password \\
  -H "Content-Type: application/json" \\
  -d '{"token": "reset-token-from-email", "new_password": "newSecurePassword456!"}'`}
        />
      </DocsSection>

      {/* Change Password */}
      <DocsSection
        id="change-password"
        title="Change Password"
        description="Change password for the currently authenticated user."
      >
        <DocsApiEndpoint
          method="PUT"
          path="/api/v1/auth/change-password"
          description="Change the password for the currently logged-in user. Requires the current password for verification. All existing sessions are invalidated after the password change."
          auth={true}
          requestBody={`{
  "current_password": "securePassword123!",
  "new_password": "evenMoreSecure789!"
}`}
          responseBody={`{
  "status": "success",
  "data": {
    "message": "Password changed successfully. Please log in again."
  }
}`}
          curlExample={`curl -X PUT http://localhost:8000/api/v1/auth/change-password \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \\
  -H "Content-Type: application/json" \\
  -d '{"current_password": "securePassword123!", "new_password": "evenMoreSecure789!"}'`}
        />
      </DocsSection>

      {/* Verify Email */}
      <DocsSection
        id="verify-email"
        title="Verify Email"
        description="Verify email address using the token from the verification email."
      >
        <DocsApiEndpoint
          method="POST"
          path="/api/v1/auth/verify-email"
          description="Verify the user's email address using the token sent during registration. Once verified, the user gains full access to the platform features. Tokens expire after 24 hours."
          auth={false}
          requestBody={`{
  "token": "email-verification-token"
}`}
          responseBody={`{
  "status": "success",
  "data": {
    "message": "Email verified successfully.",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "student@example.com",
      "is_verified": true
    }
  }
}`}
          curlExample={`curl -X POST http://localhost:8000/api/v1/auth/verify-email \\
  -H "Content-Type: application/json" \\
  -d '{"token": "email-verification-token"}'`}
        />
      </DocsSection>

      {/* Error Codes */}
      <DocsSection
        id="auth-errors"
        title="Common Auth Errors"
        description="Error codes specific to authentication endpoints."
      >
        <DocsCodeBlock
          language="json"
          title="401 - Invalid Credentials"
          code={`{
  "status": "error",
  "message": "Invalid credentials",
  "detail": "The email or password provided is incorrect."
}`}
        />
        <DocsCodeBlock
          language="json"
          title="409 - Email Already Registered"
          code={`{
  "status": "error",
  "message": "Email already registered",
  "detail": "An account with this email address already exists."
}`}
        />
        <DocsCodeBlock
          language="json"
          title="403 - Email Not Verified"
          code={`{
  "status": "error",
  "message": "Email not verified",
  "detail": "Please verify your email address before logging in."
}`}
        />
      </DocsSection>

      {/* Bottom navigation */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8 flex justify-between items-center">
        <Link
          to="/docs/api"
          className="text-sm text-red-600 dark:text-red-400 hover:underline"
        >
          &larr; API Overview
        </Link>
        <Link
          to="/docs/api/courses"
          className="text-sm text-red-600 dark:text-red-400 hover:underline"
        >
          Courses API &rarr;
        </Link>
      </div>
    </div>
  );
};

export default AuthApiPage;
