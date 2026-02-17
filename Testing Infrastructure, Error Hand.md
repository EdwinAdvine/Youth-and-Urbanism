Plan: Testing Infrastructure, Error Handling & Admin System Health Dashboard
Context
The Urban Home School platform has grown to ~60+ API routes across 6 roles (Student, Parent, Instructor, Admin, Staff, Partner) but test coverage is minimal. Only ~12 backend test files exist covering auth, payments, AI tutor, courses, security, and staff routes. The frontend has zero real tests (only 1 manual test component). Error handling is basic (3 FastAPI exception handlers, no frontend Error Boundaries, no structured error logging to DB). The admin dashboard shows hardcoded data with no access to system health, test results, or error logs.

Goal: Build a comprehensive testing + error handling + admin observability system so the super admin can run tests, view error logs, and get AI-powered fix suggestions.

Phase 1: Error Handling Infrastructure (Backend)
1.1 Error Logging Database Model
New file: backend/app/models/admin/error_log.py

Create ErrorLog SQLAlchemy model with fields:
id (UUID), timestamp, level (ERROR/WARNING/CRITICAL), source (backend/frontend/test)
error_type (exception class name), message, stack_trace (Text)
endpoint (request path), method, user_id (nullable FK), user_role
request_data (JSONB, sanitized), context (JSONB, extra metadata)
ai_diagnosis (Text, nullable - populated when admin requests AI analysis)
is_resolved (bool), resolved_by (FK), resolved_at
Reuse patterns from existing backend/app/models/admin/audit_log.py
1.2 Error Logging Middleware
New file: backend/app/middleware/error_logging_middleware.py

Middleware that catches all unhandled exceptions and 5xx responses
Writes to error_logs table asynchronously (same pattern as audit_middleware.py)
Captures: stack trace, request context, user info from JWT, timing data
Sanitizes sensitive fields (passwords, tokens, API keys) before storing
1.3 Structured Logging Service
New file: backend/app/services/admin/error_logging_service.py

log_error() - Write error to DB
get_errors() - Query with filters (level, date range, source, endpoint, resolved status)
get_error_stats() - Aggregated error counts by type, endpoint, time period
mark_resolved() - Mark error as resolved
diagnose_with_ai() - Send error context to AI Orchestrator for interpretation
Reuse backend/app/services/ai_orchestrator.py with a specialized system prompt
Return: root cause analysis, suggested fix, severity assessment, affected files
1.4 Alembic Migration
Create migration for error_logs table
Phase 2: Error Handling Infrastructure (Frontend)
2.1 Global Error Boundary
New file: frontend/src/components/error/GlobalErrorBoundary.tsx

Wraps the entire app in App.tsx
Catches React rendering crashes
Shows fallback UI with "Something went wrong" + option to reload
Reports error to backend via POST /api/v1/admin/errors/report
2.2 Per-Feature Error Boundaries
New file: frontend/src/components/error/FeatureErrorBoundary.tsx

Reusable component wrapping major sections (dashboard, chat, courses, settings)
Graceful degradation: crashed section shows error card, rest of app continues
Each boundary logs to centralized error reporter
2.3 Centralized Error Reporter Service
New file: frontend/src/services/errorReporterService.ts

reportError(error, context) - Sends errors to backend API
Captures: component stack, browser info, user role, current route
Deduplication: don't report the same error repeatedly
Queue with retry for offline/network failures
Integrates with existing react-hot-toast for user-facing notifications
2.4 Enhanced API Error Handling
Modify: frontend/src/services/api.ts

Add response interceptor that reports 5xx errors to error reporter
Add consistent toast notifications for common error types (network, auth, validation)
Add request/response timing for performance monitoring
Phase 3: Admin System Health Dashboard
3.1 Backend API Routes
New file: backend/app/api/v1/admin/system_health.py

Endpoints (admin-only):

GET /admin/system-health/overview - System health summary (DB status, error counts, test results summary)
GET /admin/system-health/errors - Paginated error log list with filters
GET /admin/system-health/errors/{error_id} - Single error detail
POST /admin/system-health/errors/{error_id}/diagnose - Trigger AI diagnosis
PATCH /admin/system-health/errors/{error_id}/resolve - Mark error resolved
POST /admin/system-health/tests/run - Trigger test suite execution
GET /admin/system-health/tests/results - Get test run history
GET /admin/system-health/tests/results/{run_id} - Get specific run results
WebSocket /ws/admin/test-run/{token} - Stream live test output
3.2 Test Runner Service
New file: backend/app/services/admin/test_runner_service.py

run_backend_tests() - Spawns pytest as subprocess, captures output in real-time
run_frontend_tests() - Spawns npm run test in frontend dir, captures output
run_all_tests() - Runs both sequentially
Stores results in a test_runs table: id, type (backend/frontend/all), status (running/passed/failed), output (Text), summary (JSONB: passed/failed/skipped counts), started_at, completed_at, triggered_by
Streams output via WebSocket for live updates
Only one test run can be active at a time (prevent concurrent runs)
3.3 Test Run Database Model
New file: backend/app/models/admin/test_run.py

TestRun model: id, type, status, output, summary, started_at, completed_at, triggered_by
3.4 Frontend Admin Page
New file: frontend/src/pages/admin/SystemHealthPage.tsx

Sections:

Overview Cards: Total errors (24h), test pass rate, system uptime, last test run
Error Log Viewer: Filterable table (level, source, date, resolved), click for detail
Error Detail Modal: Stack trace, request context, AI Diagnosis button, mark resolved
Test Runner Panel: "Run Backend Tests" / "Run Frontend Tests" / "Run All" buttons
Live Test Output: Terminal-like display streaming test output via WebSocket
Test History: List of past test runs with pass/fail badges
New file: frontend/src/services/admin/adminSystemHealthService.ts

API client for all system health endpoints
3.5 Route & Navigation
Modify: frontend/src/App.tsx - Add route /dashboard/admin/system-health
Modify: frontend/src/pages/DashboardAdmin.tsx - Wire up "System Logs" button to navigate to new page
Modify: frontend/src/components/admin/ - Add sidebar link if admin sidebar exists

Phase 4: Backend Test Coverage (All Modules)
Structure: backend/tests/ (keep existing, extend)
4.1 Existing Tests (Audit & Fix)
Files to verify work correctly:

tests/conftest.py - Main fixtures (SQLite in-memory)
tests/factories.py - Data factories
tests/api/test_auth.py - 24+ auth tests
tests/api/test_payments.py - Payment tests
tests/api/test_ai_tutor.py - AI tutor tests
tests/api/test_courses.py - Course tests
tests/utils/test_security.py - Security tests
tests/models/test_user_model.py - User model tests
tests/services/test_auth_service.py - Auth service tests
tests/services/test_payment_service.py - Payment service tests
tests/services/test_ai_orchestrator.py - AI orchestrator tests
tests/integration/test_payment_lifecycle.py - Payment lifecycle
tests/staff/ - 15 staff test files
4.2 Missing API Route Tests
Each file follows the pattern in test_auth.py (pytest classes, markers, fixtures):

New Test File	Tests For	Source
tests/api/test_users.py	api/v1/users.py	Profile CRUD, role checks
tests/api/test_parents.py	api/v1/parents.py	Parent-student linking
tests/api/test_notifications.py	api/v1/notifications.py	Notification CRUD
tests/api/test_forum.py	api/v1/forum.py	Forum posts, replies
tests/api/test_categories.py	api/v1/categories.py	CBC category CRUD
tests/api/test_store.py	api/v1/store.py	Store items, cart
tests/api/test_assessments.py	api/v1/assessments.py	Quiz/assignment CRUD
tests/api/test_contact.py	api/v1/contact.py	Contact form
tests/api/test_certificates.py	api/v1/certificates.py	Certificate validation
tests/api/test_instructor_applications.py	api/v1/instructor_applications.py	Application flow
tests/api/test_search.py	api/v1/search.py	Global search
tests/api/test_ai_agent_profile.py	api/v1/ai_agent_profile.py	AI agent customization
4.3 Missing Admin Route Tests
New Test File	Tests For
tests/admin/conftest.py	Admin-specific fixtures
tests/admin/test_ai_providers.py	AI provider CRUD
tests/admin/test_analytics.py	Analytics endpoints
tests/admin/test_dashboard.py	Dashboard overview
tests/admin/test_pulse.py	Platform pulse/health
tests/admin/test_users.py	Admin user management
tests/admin/test_content.py	Content management
tests/admin/test_ai_monitoring.py	AI monitoring
tests/admin/test_advanced_analytics.py	Advanced analytics
tests/admin/test_finance.py	Finance endpoints
tests/admin/test_operations.py	Operations (tickets, moderation)
tests/admin/test_account.py	Admin account
tests/admin/test_families.py	Families & enrollments
tests/admin/test_restrictions.py	User restrictions
tests/admin/test_permissions.py	Permissions
tests/admin/test_system_health.py	NEW system health endpoints
4.4 Missing Student Route Tests
New Test File	Tests For
tests/student/conftest.py	Student-specific fixtures
tests/student/test_dashboard.py	Student dashboard
tests/student/test_ai_tutor.py	Student AI tutor
tests/student/test_progress.py	Progress & gamification
tests/student/test_learning.py	Courses, enrollments
tests/student/test_community.py	Friends, study groups
tests/student/test_wallet.py	Wallet & payments
tests/student/test_support.py	Help, tickets
tests/student/test_account.py	Profile, preferences
4.5 Missing Instructor Route Tests
New Test File	Tests For
tests/instructor/conftest.py	Instructor-specific fixtures
tests/instructor/test_dashboard.py	Instructor dashboard
tests/instructor/test_account.py	Account management
tests/instructor/test_earnings.py	Earnings tracking
tests/instructor/test_courses.py	Course management
tests/instructor/test_assessments.py	Assessment creation
tests/instructor/test_sessions.py	Live sessions
tests/instructor/test_interactions.py	Student interactions
tests/instructor/test_impact.py	Impact & recognition
tests/instructor/test_hub.py	Community hub
tests/instructor/test_resources.py	Resource management
tests/instructor/test_insights.py	AI insights
4.6 Missing Parent Route Tests
New Test File	Tests For
tests/parent/conftest.py	Parent-specific fixtures
tests/parent/test_dashboard.py	Parent dashboard
tests/parent/test_children.py	Children overview
tests/parent/test_ai_insights.py	AI insights
tests/parent/test_communications.py	Messages, notifications
tests/parent/test_finance.py	Subscriptions, payments
tests/parent/test_mpesa.py	M-Pesa integration
tests/parent/test_reports.py	Reports & transcripts
tests/parent/test_settings.py	Preferences, privacy
4.7 Missing Partner Route Tests
New Test File	Tests For
tests/partner/conftest.py	Partner-specific fixtures
tests/partner/test_dashboard.py	Partner dashboard
tests/partner/test_sponsorships.py	Sponsorship management
tests/partner/test_finance.py	Partner finance
tests/partner/test_analytics.py	Partner analytics
tests/partner/test_content.py	Partner content
tests/partner/test_support.py	Partner support
tests/partner/test_account.py	Partner account
tests/partner/test_collaboration.py	Collaboration features
4.8 Missing Service Tests
New Test File	Tests For
tests/services/test_course_service.py	services/course_service.py
tests/services/test_assessment_service.py	services/assessment_service.py
tests/services/test_email_service.py	services/email_service.py
tests/services/test_parent_service.py	services/parent_service.py
tests/services/test_notification_service.py	services/notification_service.py
tests/services/test_forum_service.py	services/forum_service.py
tests/services/test_analytics_service.py	services/analytics_service.py
tests/services/test_category_service.py	services/category_service.py
tests/services/test_store_service.py	services/store_service.py
4.9 Missing Model Tests
New Test File	Tests For
tests/models/test_student_model.py	Student model
tests/models/test_course_model.py	Course model
tests/models/test_payment_model.py	Payment model
tests/models/test_enrollment_model.py	Enrollment model
tests/models/test_ai_tutor_model.py	AI Tutor model
tests/models/test_assessment_model.py	Assessment model
tests/models/test_notification_model.py	Notification model
4.10 Missing Middleware/Utils Tests
New Test File	Tests For
tests/middleware/test_audit_middleware.py	middleware/audit_middleware.py
tests/middleware/test_error_logging_middleware.py	NEW error logging middleware
tests/utils/test_permissions.py	utils/permissions.py
Phase 5: Frontend Test Coverage (All Modules)
Structure: frontend/src/__tests__/ for shared, co-located __tests__/ for component tests
5.1 Test Setup
Modify: frontend/src/setupTests.ts - Add global mocks, test utilities
New file: frontend/src/test-utils.tsx - Custom render with providers (Router, stores)

5.2 Service Tests (Unit)
New Test File	Tests For
src/services/__tests__/api.test.ts	API client, interceptors, error handler
src/services/__tests__/authService.test.ts	Auth service
src/services/__tests__/aiTutorService.test.ts	AI tutor service
src/services/__tests__/paymentService.test.ts	Payment service
src/services/__tests__/courseService.test.ts	Course service
src/services/__tests__/searchService.test.ts	Search service
src/services/admin/__tests__/adminDashboardService.test.ts	Admin dashboard service
src/services/admin/__tests__/adminUserService.test.ts	Admin user service
src/services/admin/__tests__/adminPulseService.test.ts	Admin pulse service
src/services/admin/__tests__/adminSystemHealthService.test.ts	NEW system health service
src/services/staff/__tests__/staffDashboardService.test.ts	Staff dashboard service
src/services/student/__tests__/studentDashboardService.test.ts	Student dashboard service
src/services/student/__tests__/studentAIService.test.ts	Student AI service
src/services/partner/__tests__/partnerDashboardService.test.ts	Partner dashboard service
src/services/__tests__/parentDashboardService.test.ts	Parent dashboard service
src/services/__tests__/errorReporterService.test.ts	NEW error reporter
5.3 Store Tests (Unit)
New Test File	Tests For
src/store/__tests__/authStore.test.ts	Auth store
src/store/__tests__/coPilotStore.test.ts	CoPilot store
src/store/__tests__/themeStore.test.ts	Theme store (if exists)
5.4 Component Tests (Integration)
New Test File	Tests For
src/components/auth/__tests__/LoginForm.test.tsx	Login form
src/components/auth/__tests__/SignupForm.test.tsx	Signup form
src/components/error/__tests__/GlobalErrorBoundary.test.tsx	NEW global error boundary
src/components/error/__tests__/FeatureErrorBoundary.test.tsx	NEW feature error boundary
src/components/layout/__tests__/DashboardLayout.test.tsx	Dashboard layout
src/components/layout/__tests__/Sidebar.test.tsx	Sidebar navigation
src/components/admin/__tests__/AIProviderForm.test.tsx	AI provider form
src/components/__tests__/ProtectedRoute.test.tsx	Route protection
5.5 Page Tests (Integration)
New Test File	Tests For
src/pages/__tests__/DashboardAdmin.test.tsx	Admin dashboard
src/pages/__tests__/DashboardStudent.test.tsx	Student dashboard
src/pages/__tests__/DashboardInstructor.test.tsx	Instructor dashboard
src/pages/admin/__tests__/SystemHealthPage.test.tsx	NEW system health page
Phase 6: E2E Test Coverage
Extend existing e2e/ with Playwright
New Test File	Tests For
e2e/auth/login.spec.ts	Login flow all roles
e2e/auth/register.spec.ts	Registration flow
e2e/student/dashboard.spec.ts	Student dashboard
e2e/student/ai-tutor.spec.ts	AI tutor chat
e2e/admin/system-health.spec.ts	NEW system health page
e2e/admin/dashboard.spec.ts	Admin dashboard
e2e/parent/dashboard.spec.ts	Parent dashboard
e2e/instructor/dashboard.spec.ts	Instructor dashboard
e2e/partner/dashboard.spec.ts	Partner dashboard
Phase 7: Run Tests & Fix Failures
Run existing backend tests: cd backend && pytest
Identify and fix all failures (update fixtures, mock missing deps, fix imports)
Run existing frontend tests: cd frontend && npm run test
Run new tests incrementally, fixing as we go
Target: All tests passing with 80%+ backend coverage
Execution Order
We will implement in this order to build foundations first:

Error handling backend (Phase 1) - DB model, middleware, service
Error handling frontend (Phase 2) - Error boundaries, reporter
Admin System Health UI (Phase 3) - Backend API + frontend page
Run & fix existing tests (Phase 7 partial) - Ensure baseline works
Backend tests (Phase 4) - All missing tests
Frontend tests (Phase 5) - All missing tests
E2E tests (Phase 6) - Cross-cutting flows
Final test run & fixes (Phase 7 complete) - Everything green
Key Files to Modify (Existing)
File	Change
backend/app/main.py	Register error logging middleware, system health routes
backend/app/config.py	No changes needed (logging config already exists)
backend/app/middleware/audit_middleware.py	Reference pattern for error middleware
backend/tests/conftest.py	May need updates for new test patterns
frontend/src/App.tsx	Add admin/system-health route, wrap with GlobalErrorBoundary
frontend/src/pages/DashboardAdmin.tsx	Wire "System Logs" button to new page
frontend/src/services/api.ts	Add error reporting interceptor
frontend/src/setupTests.ts	Add global test mocks/utilities
frontend/vitest.config.ts	May need coverage config updates
Key Files to Reuse
File	Reuse For
backend/app/models/admin/audit_log.py	Pattern for ErrorLog model
backend/app/middleware/audit_middleware.py	Pattern for error logging middleware
backend/app/services/ai_orchestrator.py	AI diagnosis of errors
backend/tests/conftest.py	Test fixture patterns
backend/tests/factories.py	Test data factory patterns
backend/tests/api/test_auth.py	Test class/marker patterns
backend/tests/staff/conftest.py	Role-specific fixture patterns
frontend/src/services/api.ts	handleApiError utility
frontend/vitest.config.ts	Test config reference
Verification
Backend tests: cd backend && pytest --tb=short - All pass, 80%+ coverage
Frontend tests: cd frontend && npm run test - All pass
E2E tests: npx playwright test - All pass
Error handling:
Trigger a 500 error -> verify it appears in error_logs table
Frontend crash -> verify Global Error Boundary catches it
API error -> verify toast notification shows
Admin System Health:
Login as admin -> navigate to /dashboard/admin/system-health
View error logs with filters
Click "Diagnose with AI" on an error -> get AI analysis
Click "Run Backend Tests" -> see live output via WebSocket
View test history with pass/fail results
Non-admin access: Verify non-admin users cannot access system health endpoints