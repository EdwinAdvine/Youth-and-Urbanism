Security Audit & Remediation Plan — Urban Home School
Context
Urban Home School is an educational platform for Kenyan children handling sensitive data: student PII, payment information (M-Pesa, Stripe, PayPal), AI tutor conversations, and multi-role access (students, parents, instructors, admin, partners, staff). The platform is approaching production deployment on Contabo VDS. This audit identified 42 security vulnerabilities across backend, frontend, and infrastructure — including several critical issues that must be fixed before any production deployment.

Vulnerability Summary
Severity	Count	Examples
CRITICAL	8	Exposed API keys in git, unverified payment webhooks, hardcoded M-Pesa password
HIGH	9	Rate limiting fails open, CORS wildcard headers, tokens in localStorage
MEDIUM	14	No auth rate limiting, missing JWT claims, no CSRF protection
LOW	11	Missing security headers, misleading function names, no CSP
PHASE 1: CRITICAL — Fix Before Any Deployment
1.1 Exposed Secrets in Version Control (CRITICAL)
File: backend/.env.development (tracked by git — NOT in .gitignore)
Issue: Real API keys committed: GEMINI_API_KEY, GROQ_API_KEY, OPENROUTER_API_KEY, SECRET_KEY, ENCRYPTION_KEY
Fix:
Add backend/.env.development to .gitignore
Remove it from git tracking: git rm --cached backend/.env.development
Immediately rotate ALL exposed keys (Gemini, Groq, OpenRouter)
Generate new SECRET_KEY and ENCRYPTION_KEY
Add git-secrets or detect-secrets pre-commit hook
1.2 Unverified Payment Webhooks (CRITICAL)
File: backend/app/api/v1/payments.py:206-341
Issue: M-Pesa callback and PayPal webhook accept ANY request without signature verification — attackers can inject fake payment confirmations
Fix:
M-Pesa: Implement IP whitelist for Safaricom servers + HMAC-SHA256 verification
PayPal: Verify X-PAYPAL-TRANSMISSION-SIG header against PayPal's certificate
Stripe: Verify stripe-signature header using stripe.Webhook.construct_event()
Add replay protection (store processed webhook IDs, reject duplicates)
Replace print() with logger.error() on lines 242, 339
1.3 Hardcoded M-Pesa Password (CRITICAL)
File: backend/app/utils/payments/mpesa_b2c.py:125-133
Issue: Default password "Safaricom999!*!" hardcoded; base64 encoding used instead of RSA encryption
Fix:
Remove hardcoded default password entirely
Add mpesa_initiator_password to config.py as required field
Implement RSA/PKCS#1 v1.5 encryption with Safaricom's public certificate for production
Guard sandbox vs production with environment check
1.4 Encryption Key Fallback Generates Random Key (CRITICAL)
File: backend/app/utils/security.py:55-61
Issue: If Fernet init fails, generates a random ephemeral key — previously encrypted data becomes permanently undecryptable
Fix:
Remove the fallback Fernet(Fernet.generate_key()) on line 61
Raise a hard error if encryption key is invalid — fail fast at startup
Replace print() warning on line 60 with logger.critical()
Enforce separate ENCRYPTION_KEY in production validation
1.5 LiveKit Hardcoded Secret (CRITICAL)
File: livekit-config.yaml:13
Issue: keys: devkey: secret — trivially guessable LiveKit API key/secret
Fix: Use environment variables for LiveKit keys; generate strong secrets for production
1.6 Seed Users with Predictable Passwords (CRITICAL for production)
File: backend/seed_users.py:39-100
Issue: All seed users use predictable passwords like Admin@2026!, Student@2026!
Fix:
Guard seed script to only run in development/staging (if ENVIRONMENT == 'production': sys.exit())
Delete seed users before production deployment
Force password change on first login for any manually-created admin accounts
1.7 Docker Credentials in Compose Files (CRITICAL)
Files: docker-compose.yml:12,51, docker-compose.dev.yml:12
Issue: Database password tuhs_dev_password_123 hardcoded in Docker Compose
Fix:
Use Docker secrets or .env file referenced by env_file directive
Use strong, randomly-generated passwords for production
Remove passwords from compose files committed to git
1.8 Debug Mode Risks (CRITICAL for production)
File: backend/.env.development:5 — DEBUG=True
File: backend/app/database.py:76 — echo=settings.debug logs ALL SQL queries
File: backend/app/main.py:330 — str(exc) returned when debug=True
Fix: Ensure production config enforces DEBUG=False; already partially done via validate_production_settings() in config.py — verify it runs
PHASE 2: HIGH — Fix Before Production Launch
2.1 Rate Limiting Fails Open
File: backend/app/utils/security.py:687-729
Issue: When Redis is unavailable, check_rate_limit() returns True (allows request)
Fix: Change to fail-closed (return False); add in-memory fallback rate limiter
2.2 CORS Allows Wildcard Headers
File: backend/app/config.py:143-146
Fix: Change default from ["*"] to ["Content-Type", "Authorization", "X-Requested-With", "X-CSRF-Token"]
2.3 Admin Bypasses All Permission Checks
File: backend/app/utils/permissions.py:85-87, 141-142, 177-179, 258-260
Fix:
Create super_admin role for unrestricted access
Regular admin role uses permission matrix like other roles
Add audit logging for all admin actions on sensitive resources
2.4 Migrate Token Storage to httpOnly Cookies (Frontend + Backend)
Files: frontend/src/services/authService.ts:59-60, frontend/src/services/api.ts:46, backend/app/api/v1/auth.py
Issue: Access and refresh tokens in localStorage are vulnerable to XSS
Fix (full migration):
Backend (auth.py): Set tokens as httpOnly, Secure, SameSite=Strict cookies in login/refresh responses
Backend (main.py): Add cookie-reading middleware to extract token from cookie into request state
Backend (security.py): Update get_current_user() to read token from cookie header fallback
Frontend (api.ts): Set withCredentials: true on axios; remove Authorization header logic
Frontend (authService.ts): Remove all localStorage.setItem('access_token'...) calls
Frontend (authStore.ts): Store only non-sensitive state (isAuthenticated boolean, user display name)
Add /api/v1/auth/me endpoint to fetch current user from cookie on app load
CORS (config.py): Set allow_credentials=True with explicit origins (no wildcard)
2.5 WebSocket Token in URL Path
Backend: backend/app/main.py:982+ — @app.websocket("/ws/admin/{token}")
Frontend: frontend/src/hooks/staff/useStaffWebSocket.ts:71
Issue: Token visible in server logs, browser history, Referer headers
Fix: Move token to WebSocket connection auth header or first-message authentication pattern
2.6 No Security Headers
File: backend/app/main.py
Fix: Add middleware setting:
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy (see 2.7)
2.7 No Content Security Policy (Frontend)
File: frontend/index.html — no CSP meta tag or header
Fix: Add CSP via Nginx or backend middleware restricting script/style sources
2.8 CDN Resources Without Subresource Integrity
File: frontend/index.html:7-8
Issue: cdn.tailwindcss.com loaded as <script> with no integrity attribute; same for Font Awesome
Fix: Add SRI hashes, or better: bundle Tailwind via PostCSS (npm install) and self-host Font Awesome
2.9 Error Information Leakage
File: backend/app/main.py:315-339
Fix: Always return generic error messages; log detailed errors server-side only; remove path from error response body
PHASE 3: MEDIUM — Fix Within First Sprint Post-Launch
3.1 No Rate Limiting on Auth Endpoints
File: backend/app/api/v1/auth.py:68-158
Fix: Add per-IP and per-email rate limits: login (10/hr), register (5/hr), forgot-password (3/hr)
3.2 JWT Missing jti Claim
File: backend/app/utils/security.py:118-160
Fix: Add jti (UUID) and nbf claims to all tokens; use jti for revocation tracking
3.3 Token Blacklist Only Checked in get_current_user()
File: backend/app/utils/security.py:554-614
Fix: Move blacklist check into verify_token() so it applies everywhere
3.4 No CSRF Protection
File: backend/app/main.py
Fix: Implement CSRF tokens for state-changing requests using fastapi-csrf-protect or custom middleware
3.5 Sensitive Data in localStorage (Frontend)
Files: frontend/src/store/index.ts, frontend/src/store/instructorStore.ts
Issue: Full user objects, transaction history, forum posts persisted to localStorage
Fix: Use sessionStorage for transient data; fetch sensitive data on-demand from API; never persist PII client-side
3.6 Debug Console Logs in Frontend
Files: frontend/src/services/authService.ts:53,56,63,66, frontend/src/store/authStore.ts:44,46,54
Fix: Remove all console.log with auth details; use environment-conditional logging
3.7 User Email Sent to Error Reporter
File: frontend/src/services/errorReporterService.ts:60-71
Fix: Send only anonymized user ID, not email; sanitize URLs to strip query parameters
3.8 Unsafe JSON.parse in WebSocket Handler
File: frontend/src/hooks/staff/useStaffWebSocket.ts:209
Fix: Wrap in try-catch; validate message schema with Zod before processing
3.9 No File Upload MIME Validation
File: backend/app/config.py:269-276
Fix: Enforce MIME type validation with python-magic; validate file headers, not just extensions
3.10 Replace print() with Logger
Files: backend/app/api/v1/payments.py:242,339, backend/app/utils/security.py:60,728
Fix: Use logger.error() / logger.warning() for proper monitoring integration
3.11 Session Cookie SameSite Should Be Strict
File: backend/app/config.py:392
Fix: Change production default from "lax" to "strict"
3.12 Redis Connection Without Auth/TLS
Files: docker-compose.yml:28, backend/.env.development:12
Issue: Redis exposed on port 6379 with no password and no TLS
Fix: Set requirepass in Redis config; use TLS in production; bind to internal network only
3.13 PostgreSQL Without SSL
File: backend/.env.development:9
Issue: Database connection string has no ?sslmode=require
Fix: Enable SSL for production PostgreSQL connections
3.14 No CI/CD Pipeline
Issue: No .github/workflows/ or equivalent CI/CD configuration found
Fix: Create CI pipeline with: linting, tests, pip-audit, npm audit, SAST scanning
PHASE 4: LOW — Ongoing Improvements
4.1 Missing Audit Trail for Permission Changes
File: backend/app/middleware/audit_middleware.py:109-184
Fix: Create immutable audit log table for role/permission changes with digital signatures
4.2 Misleading Function Names
File: backend/app/utils/permissions.py:335 — verify_admin_access() allows staff too
Fix: Rename to verify_admin_or_staff_access()
4.3 No API Versioning Strategy
File: backend/app/config.py:47-50
Fix: Plan v2 API with backward compatibility; add deprecation headers
4.4 Card Payment Data in React State
File: frontend/src/pages/PaymentPage.tsx:168-194
Fix: Use Stripe Elements / PayPal JS SDK for PCI-compliant tokenization; never handle raw card data
4.5 Unvalidated window.open() URL
File: frontend/src/pages/PaymentPage.tsx:248
Fix: Validate URL protocol before opening; add noopener,noreferrer flags
4.6 Token Refresh Race Condition
File: frontend/src/services/api.ts:77-102
Fix: Add mutex/queue for token refresh; implement max retry counter
4.7 Dependency Vulnerability Scanning
Files: backend/requirements.txt, frontend/package.json
Fix: Add pip-audit and npm audit to CI; set up Dependabot/Renovate for automated updates
Files to Modify (by priority)
Critical Path
File	Changes
.gitignore	Add backend/.env.development, livekit-config.yaml
backend/.env.development	Remove from git tracking; rotate all keys
backend/app/utils/security.py	Remove Fernet fallback; add jti claim; fix rate limit fail-open; move blacklist check
backend/app/api/v1/payments.py	Add webhook signature verification for M-Pesa, PayPal, Stripe
backend/app/utils/payments/mpesa_b2c.py	Remove hardcoded password; implement RSA encryption
backend/app/config.py	Restrict CORS headers; add missing config fields; enforce production validation
backend/app/main.py	Add security headers middleware; fix error exposure; improve WebSocket auth
backend/app/utils/permissions.py	Implement admin permission matrix
backend/app/api/v1/auth.py	Add rate limiting on login/register/forgot-password
frontend/index.html	Add SRI to CDN resources or self-host; add CSP meta tag
frontend/src/services/authService.ts	Migrate to httpOnly cookies; remove console.log
frontend/src/services/api.ts	Update for cookie-based auth; fix token refresh race condition
frontend/src/hooks/staff/useStaffWebSocket.ts	Remove token from URL; add JSON.parse safety
frontend/src/services/errorReporterService.ts	Remove PII from error reports
livekit-config.yaml	Use env vars for keys; generate strong secret
docker-compose.yml	Remove inline passwords; add Redis auth; restrict ports
backend/seed_users.py	Add production guard
Verification Plan
After Phase 1
Verify .env.development is untracked: git ls-files backend/.env.development should return empty
Verify no secrets in git history: git log --all -p -- backend/.env.development | grep -i "api_key\|secret"
Test payment webhooks reject unsigned requests (send curl with no signature, expect 403)
Verify encryption key failure crashes the app instead of silently falling back
Test seed script refuses to run with ENVIRONMENT=production
After Phase 2
Test rate limiting blocks requests when Redis is down
Verify CORS rejects requests with non-whitelisted headers
Verify admin role has bounded permissions (can't access super_admin endpoints)
Verify security headers present: curl -I https://api.domain.com/health
Test WebSocket connection without valid token is rejected
Run npm audit and pip-audit — zero critical/high findings
After Phase 3
Brute-force login test: verify lockout after 10 attempts
Verify CSRF tokens required on all POST/PUT/DELETE endpoints
Check no PII in error reports: trigger errors and inspect payloads
Run OWASP ZAP automated scan against staging
Verify no console.log with auth data in production build: grep -r "console.log" frontend/dist/
Ongoing
Monthly pip-audit + npm audit runs
Quarterly penetration testing
Annual security audit review
Monitor OWASP Top 10 updates
Overall Security Posture Assessment
Current Score: 3/10 (Not Production-Ready)

The platform has good foundational choices (bcrypt hashing, JWT auth, SQLAlchemy parameterized queries, Pydantic validation) but has critical gaps in secrets management, payment security, and defense-in-depth. The most urgent issues are:

Real API keys committed to git — must be rotated immediately
Payment webhooks accept any request — direct financial fraud risk
No security headers or CSP — browser-level protections missing entirely
Tokens in localStorage — vulnerable to any XSS
After completing Phases 1-2, the security posture would improve to approximately 7/10, suitable for a monitored production launch. Completing all phases would bring it to 8.5/10, which is strong for an early-stage educational platform.