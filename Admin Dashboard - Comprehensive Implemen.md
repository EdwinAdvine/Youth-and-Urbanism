Admin Dashboard - Comprehensive Implementation Plan
Context
The Urban Home School platform currently has a minimal admin dashboard (DashboardAdmin.tsx) with mock data, a single AI Providers page, and no admin-specific sidebar (admins see the student sidebar). We need to build a full-featured, production-grade admin command center with 9 major sections, real-time monitoring, comprehensive data management, and enterprise-grade security features.

What exists today:

DashboardAdmin.tsx — mock stats cards, quick actions (mostly unlinked), fake system health
AIProvidersPage.tsx — fully built admin page (our template for all new pages)
Default student Sidebar.tsx used for admin role (no admin sidebar)
19 database tables (users, students, courses, payments, AI, forum, store, etc.)
JWT auth with role-based access, 6 roles defined
No WebSocket infrastructure, no charting library, no data table library
User decisions (from 8 rounds of Q&A):

UI: Use existing React + Tailwind + dark theme (#0F1112, #181C1F, #22272B) + red accents (#E40000)
Charts: Recharts | Tables: TanStack Table (server-side pagination + virtual scroll)
Real-time: FastAPI WebSockets with centralized connection manager + Redis Pub/Sub
Permissions: Custom permission matrix with field-level granularity
Build approach: Vertical slices, all 9 sections in order, feature-by-feature
DB migrations: Alembic for all schema changes
Full features: comprehensive audit logging, multi-channel notifications, unified global search, full AI monitoring, NL query builder, built-in ticketing, both partner types, bulk operations + export, WCAG 2.1 AA + keyboard shortcuts, fully responsive
Critical Files to Modify
File	Change
frontend/src/components/layout/DashboardLayout.tsx	Add AdminSidebar case at line 81 (before the default Sidebar fallback)
frontend/src/App.tsx	Add ~30 new admin routes (lines 94-95 area)
frontend/package.json	Add recharts, @tanstack/react-table, @tanstack/react-virtual
backend/app/main.py	Register all new admin routers, add WebSocket endpoint
backend/requirements.txt	Already has redis, alembic — no changes needed
backend/alembic/env.py	Import all new models
Phase 0: Shared Infrastructure (Build First)
Everything below must be built before the 9 sections. These are cross-cutting dependencies.

0.1 Install Dependencies
Frontend (frontend/):


npm install recharts @tanstack/react-table @tanstack/react-virtual
0.2 Admin TypeScript Types
New file: frontend/src/types/admin.ts

Core shared types used across all admin sections:

PaginatedRequest / PaginatedResponse<T> — standard pagination
AuditLogEntry — audit log records
AdminNotification — notification with priority levels
BulkActionResult — bulk operation results
ExportConfig — export format/filter config
WebSocketEvent — WS event envelope
0.3 Admin Zustand Store
New file: frontend/src/store/adminStore.ts

Global admin state:

sidebarCollapsed, globalSearch, activeSection
Real-time counters updated via WebSocket: pendingApprovals, activeAlerts, openTickets, activeUsers
adminNotifications[], unreadCount
Actions for all state mutations
0.4 Admin Sidebar
New file: frontend/src/components/admin/sidebar/AdminSidebar.tsx

Follow exact pattern of InstructorSidebar.tsx / ParentSidebar.tsx:

Props: { isOpen, onClose, onOpenAuthModal }
9 collapsible sections matching the spec exactly:
TODAY / AT A GLANCE
PLATFORM PULSE
PEOPLE & ACCESS (Users, Roles & Permissions, Families & Enrollments, Bans & Restrictions)
CONTENT & LEARNING (Courses & Curriculum, Assessments & Grading, Certificates, Resource Library)
AI SYSTEMS (AI Tutor Monitoring, Content Generation, Personalization, Performance)
ANALYTICS & INTELLIGENCE (Learning Impact, Business & Growth, Compliance & Risk, Custom Insights)
FINANCE & PARTNERSHIPS (Money Flow, Plans & Billing, Partner Dashboard, Invoices)
OPERATIONS & CONTROL (Support, Moderation, System Config, Logs & Audit)
ADMIN ACCOUNT (Notifications, Profile & Security, Preferences, Logout)
Lucide React icons for each section
Active state: bg-[#FF0000]/20 text-[#FF0000]
Badge counts on sections with pending items (from adminStore real-time counters)
Modify: DashboardLayout.tsx line 81 — Add admin case:


user.role === 'admin' ? (
  <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onOpenAuthModal={onOpenAuthModal} />
) : user.role === 'instructor' ? (
0.5 Reusable Admin Components
New directory: frontend/src/components/admin/shared/

Component	Purpose
AdminDataTable.tsx	TanStack Table wrapper — server-side pagination, sorting, filtering, row selection, virtual scroll, export button, bulk action bar, loading skeleton, empty state. Dark theme styling.
AdminStatsCard.tsx	Reusable metric card with icon, value, label, trend indicator, sparkline (Recharts)
AdminBentoCard.tsx	Variable-size bento grid card with header, content slot, optional action
AdminPageHeader.tsx	Page title + breadcrumbs + action buttons
AdminChart.tsx	Recharts wrapper with dark theme defaults, responsive container
AdminBadge.tsx	Status/severity badges (critical=red, high=orange, medium=yellow, low=blue)
AdminModal.tsx	Modal overlay with dark theme, escape key, focus trap
AdminFilterPanel.tsx	Collapsible filter panel for tables
AdminExportButton.tsx	CSV/Excel/PDF export dropdown
AdminBulkActions.tsx	Floating bulk action bar when rows selected
AdminLoadingSkeleton.tsx	Skeleton loaders matching card/table layouts
AdminEmptyState.tsx	Empty state with icon + message + action
0.6 WebSocket Infrastructure
Backend — New files:

backend/app/websocket/connection_manager.py:

ConnectionManager class — manages active connections by user_id
Redis Pub/Sub for cross-process broadcast
Methods: connect(), disconnect(), send_personal(), broadcast_to_role(), broadcast_to_admins()
Heartbeat ping/pong every 30s
backend/app/websocket/events.py:

WSEventType enum — all event types (system.health, user.online, ai.anomaly, payment.received, ticket.created, safety.incident, etc.)
WebSocket endpoint added to backend/app/main.py:


@app.websocket("/ws/admin/{token}")
JWT token verification, admin role check
Register with ConnectionManager
Forward Redis Pub/Sub events to connected admins
Frontend — New file: frontend/src/hooks/admin/useWebSocket.ts

Connects to ws://localhost:8000/ws/admin/{token}
Auto-reconnect with exponential backoff (1s, 2s, 4s, 8s, max 30s)
Event subscription: subscribe(eventType, handler) / unsubscribe()
Returns: { isConnected, subscribe, unsubscribe, lastEvent }
0.7 Audit Logging System
Backend — New model: backend/app/models/admin/audit_log.py

audit_logs table:

id (UUID PK), actor_id (FK users), actor_email, actor_role
action (string, indexed) — e.g., "user.deactivate", "course.approve"
resource_type (string, indexed), resource_id (UUID, nullable)
details (JSONB) — before/after state snapshots
ip_address, user_agent, status (success/failure)
created_at (indexed)
Composite indexes: (actor_id, created_at), (resource_type, resource_id), (action, created_at)
Backend — New middleware: backend/app/middleware/audit_middleware.py

Auto-logs all POST/PUT/PATCH/DELETE to /api/v1/admin/*
Captures actor, IP, user agent, endpoint, status code
Backend — New service: backend/app/services/admin/audit_service.py

log_action(), search_logs(), export_logs(), get_user_activity_timeline()
0.8 Permission System
Backend — New model: backend/app/models/admin/permission.py

3 tables:

permissions — name (unique), resource, action, field_restrictions (JSONB), description
role_permissions — role + permission_id + granted_by + expires_at (temp access)
user_permission_overrides — user_id + permission_id + granted (bool) + reason + expires_at
Backend — New utility: backend/app/utils/permissions.py

require_permission(permission_name) — FastAPI dependency
Checks role_permissions + user overrides, caches in Redis
Returns current_user or raises 403
Frontend — New hook: frontend/src/hooks/admin/useAdminPermissions.ts

Loads permissions from /api/v1/admin/permissions/me
hasPermission(name), canRead(resource), canWrite(resource), canDelete(resource)
0.9 Alembic Migration #002
backend/alembic/versions/002_add_admin_infrastructure.py:

Creates: audit_logs, permissions, role_permissions, user_permission_overrides
Seeds default permissions for admin and staff roles
0.10 Admin Route Registration
All new admin routers registered in backend/app/main.py with prefix /api/v1/admin/ and role-specific tags.

All new frontend routes added to App.tsx wrapped in <ProtectedRoute allowedRoles={['admin']}>.

Phase 1: Today / At a Glance (Bento Grid Command Center)
Backend:

New service: backend/app/services/admin/dashboard_service.py

Aggregation queries across users, enrollments, transactions, ai_tutors, notifications
Redis caching (30s TTL)
New endpoints in backend/app/api/v1/admin/dashboard.py:

Method	Path	Description
GET	/admin/dashboard/overview	Total users, active today, revenue today, new enrollments, AI sessions
GET	/admin/dashboard/alerts	Critical system + safety alerts
GET	/admin/dashboard/pending-items	Pending approvals, escalations, flags
GET	/admin/dashboard/revenue-snapshot	Today's revenue breakdown, payout queue summary
GET	/admin/dashboard/ai-anomalies	AI anomaly detections for today
Frontend:

New File	Description
pages/admin/AdminDashboardPage.tsx	Replaces DashboardAdmin.tsx. Bento grid layout.
components/admin/dashboard/BentoGrid.tsx	Responsive bento grid container (CSS Grid with mixed spans)
components/admin/dashboard/AlertsCard.tsx	Critical alerts with severity badges, action links
components/admin/dashboard/PendingItemsCard.tsx	Pending items grouped by type with counts
components/admin/dashboard/RevenueCard.tsx	Revenue number + sparkline (Recharts) + payout queue count
components/admin/dashboard/EnrollmentsCard.tsx	New enrollments today with mini trend chart
components/admin/dashboard/AIAnomaliesCard.tsx	AI anomaly summary with severity breakdown
Bento Grid Layout (responsive):

Desktop: 4-column grid. Alerts=2col, Revenue=2col, Pending=2col, Enrollments=1col, AI=1col
Tablet: 2-column grid
Mobile: 1-column stack
WebSocket events: system.alert, user.registered, payment.received, ai.anomaly

Route: /dashboard/admin (replaces existing)

Phase 2: Platform Pulse (Real-time Monitoring)
Backend:

New model: backend/app/models/admin/system_health.py

system_health_snapshots table — service_name, status, response_time_ms, error_rate, details (JSONB), checked_at
New service: backend/app/services/admin/pulse_service.py

Redis queries for active sessions
Health check runner (DB, Redis, AI providers, payment gateways)
Background task: health check every 60s, store snapshots
New endpoints in backend/app/api/v1/admin/pulse.py:

Method	Path	Description
GET	/admin/pulse/realtime	Active users, concurrent sessions, AI conversations/hour
GET	/admin/pulse/health	All service health statuses
GET	/admin/pulse/urgent-flags	Child safety, policy violations, escalated tickets
GET	/admin/pulse/metrics/{period}	Historical metrics (1h, 6h, 24h, 7d)
Frontend:

New File	Description
pages/admin/PlatformPulsePage.tsx	Three-panel layout: Overview, Health, Urgent Flags
components/admin/pulse/RealtimeOverview.tsx	Active users counter + Recharts AreaChart (sessions over time)
components/admin/pulse/HealthStatus.tsx	Service cards with green/yellow/red indicators, response time, error rate
components/admin/pulse/UrgentFlags.tsx	Prioritized list of urgent items with action buttons
WebSocket events: system.health.update, user.online/offline, safety.incident, ticket.escalated

Alembic migration #003: Creates system_health_snapshots

Route: /dashboard/admin/pulse

Phase 3: People & Access
Backend:

New models:

backend/app/models/admin/user_restriction.py — user_restrictions table (type, reason, imposed_by, expires_at, appeal_status, appeal_text)
backend/app/models/admin/api_token.py — api_tokens table (user_id, name, token_hash, permissions, last_used_at, expires_at)
New services:

backend/app/services/admin/user_management_service.py — CRUD, bulk ops, activity timeline, device tracking, export
backend/app/services/admin/permission_service.py — permission matrix CRUD, role editing, user overrides
backend/app/services/admin/family_service.py — family linking, consent, duplicate detection, bulk onboard
backend/app/services/admin/restriction_service.py — bans, suspensions, watch list, appeals
New endpoints in backend/app/api/v1/admin/users.py, permissions.py, families.py, restrictions.py:

Users: GET/PUT /admin/users, GET /admin/users/{id}, POST deactivate/reactivate, GET activity/devices, POST bulk, GET export
Permissions: GET list/matrix, PUT role/{role}, POST user/{user_id} override, GET /me, CRUD api-tokens
Families: GET families, GET/POST enrollments pending/approve/reject, GET consent-queue, POST link, GET duplicates, POST bulk-onboard
Restrictions: CRUD restrictions, GET/PUT appeals

Frontend:

New File	Description
pages/admin/UsersPage.tsx	User list with AdminDataTable, search, filters, bulk actions
pages/admin/UserDetailPage.tsx	Deep profile with tabs: Profile, Activity Timeline, Devices, Permissions
pages/admin/RolesPermissionsPage.tsx	Permission matrix grid editor + role editor + API token management
pages/admin/FamiliesPage.tsx	Pending enrollments table, consent queue, parent-child linking, bulk onboard
pages/admin/RestrictionsPage.tsx	Active restrictions table, appeals queue, watch list
components/admin/users/UserProfileDrawer.tsx	Side drawer quick view
components/admin/permissions/PermissionMatrix.tsx	Interactive grid (roles x permissions)
Frontend service: frontend/src/services/admin/adminUserService.ts

Alembic migration #004: Creates user_restrictions, api_tokens

Routes: /dashboard/admin/users, /dashboard/admin/users/:id, /dashboard/admin/roles-permissions, /dashboard/admin/families, /dashboard/admin/restrictions

Phase 4: Content & Learning Integrity
Backend:

New models in backend/app/models/admin/content_integrity.py:

content_versions — course_id, version_number, changes (JSONB), created_by
competency_tags — name, cbc_strand, cbc_sub_strand, grade_level, description
course_competency_mappings — course_id, competency_id, coverage_level
grade_overrides — submission_id, original_grade, new_grade, reason, overridden_by
certificate_templates — name, template_data (JSONB), is_active
resource_items — title, file_url, file_type, file_size, category, tags, moderation_status, usage_count
New service: backend/app/services/admin/content_service.py

New endpoints in backend/app/api/v1/admin/content.py:

Courses: GET list, PUT approve/reject, GET versions, POST archive/restore
CBC: GET alignment dashboard, CRUD competency tags, GET/POST course mappings
Assessments: GET override queue, POST override grade, GET bulk grading
Certificates: GET issuance log, POST revoke, CRUD templates
Resources: CRUD, POST bulk-import, PUT moderate
Frontend:

New File	Description
pages/admin/CoursesAdminPage.tsx	Course management with approval workflow, version history
pages/admin/CBCAlignmentPage.tsx	CBC competency mapping visual dashboard, gap analysis chart
pages/admin/AssessmentsAdminPage.tsx	Grade override queue, rubric management
pages/admin/CertificatesAdminPage.tsx	Issuance log table, template editor, revocation history
pages/admin/ResourceLibraryPage.tsx	Resource table with moderation queue, bulk upload
Alembic migration #005: Creates 6 content tables

Routes: /dashboard/admin/courses, /dashboard/admin/cbc-alignment, /dashboard/admin/assessments, /dashboard/admin/certificates, /dashboard/admin/resources

Phase 5: AI Systems
Backend:

New models in backend/app/models/admin/ai_monitoring.py:

ai_conversation_flags — ai_tutor_id, student_id, flag_type (safety/bias/prompt_drift/quality/hallucination), severity, conversation_snippet, detected_by, status, reviewed_by
ai_content_reviews — content_type, generated_content, model_used, model_version, accuracy_score, review_status, override_content
ai_performance_metrics — provider_id, metric_type (response_time/error_rate/satisfaction/helpfulness), metric_value, period_start/end, sample_size
New service: backend/app/services/admin/ai_monitoring_service.py

New endpoints in backend/app/api/v1/admin/ai_monitoring.py:

Monitoring: GET conversations, GET/PUT flags, GET drift analysis, GET safety dashboard
Content: GET review queue, PUT override content, GET model versions
Personalization: GET learning path audits, GET bias reports, GET over-customization flags
Performance: GET overview, GET ratings, GET error patterns, GET latency metrics
Frontend:

New File	Description
pages/admin/AIMonitoringPage.tsx	Conversation sampling viewer, flagged interactions table
pages/admin/AIContentReviewPage.tsx	Generated content review queue with approve/override
pages/admin/AIPersonalizationPage.tsx	Learning path audit viewer, bias/fairness Recharts
pages/admin/AIPerformancePage.tsx	Performance dashboards — latency, error rate, satisfaction charts
WebSocket events: ai.safety_violation, ai.anomaly

Alembic migration #006: Creates 3 AI monitoring tables

Routes: /dashboard/admin/ai-monitoring, /dashboard/admin/ai-content, /dashboard/admin/ai-personalization, /dashboard/admin/ai-performance

Phase 6: Analytics & Intelligence
Backend:

New models in backend/app/models/admin/analytics.py:

compliance_incidents — type, severity, description, affected_users (JSONB), status, resolution
scheduled_reports — name, query_config (JSONB), schedule_cron, recipients (JSONB), format, is_active
New services:

backend/app/services/admin/advanced_analytics_service.py — learning impact, business metrics, cohort analysis
backend/app/services/admin/ai_query_service.py — NL to SQL/aggregation using existing AI orchestrator
New endpoints in backend/app/api/v1/admin/analytics.py (extends existing):

Learning: GET learning-impact, GET equity-gap
Business: GET business metrics (MRR, churn, LTV), GET partner performance
Compliance: GET consent/DPA, CRUD incidents, GET child protection metrics
Custom: POST ai-query (NL to chart), CRUD scheduled reports, POST export
Frontend:

New File	Description
pages/admin/LearningAnalyticsPage.tsx	CBC progress charts, skill curves, cohort comparison
pages/admin/BusinessAnalyticsPage.tsx	MRR/churn/LTV charts, acquisition funnel, partner metrics
pages/admin/CompliancePage.tsx	DPA dashboard, incident log table, audit trail export
pages/admin/CustomInsightsPage.tsx	AI query builder (text input -> chart), saved queries, scheduled reports
components/admin/analytics/AIQueryBuilder.tsx	NL input with AI-generated chart output
components/admin/analytics/ChartRenderer.tsx	Dynamic Recharts renderer from query results
Alembic migration #007: Creates compliance_incidents, scheduled_reports

Routes: /dashboard/admin/analytics/learning, /dashboard/admin/analytics/business, /dashboard/admin/analytics/compliance, /dashboard/admin/analytics/custom

Phase 7: Finance & Partnerships
Backend:

New models in backend/app/models/admin/finance.py:

partner_contracts — partner_id, partner_type (content/school/business/distribution), contract_status, revenue_share_percent, terms (JSONB), api_quota, api_usage_count
invoices — invoice_number (unique), user_id, partner_id, type, amount, currency, tax_amount, status, due_date, line_items (JSONB), pdf_url
payout_queue — recipient_id, amount, currency, payment_method, status, reference
New service: backend/app/services/admin/finance_service.py

New endpoints in backend/app/api/v1/admin/finance.py:

Money: GET transactions (paginated), GET refunds, PUT process refund, GET failed payments, GET/POST payouts
Plans: CRUD subscription plans, discount management
Partners: GET list (both types), GET detail + API usage, GET revenue share, CRUD contracts
Invoices: GET list, POST generate, POST bulk generate, GET PDF download, GET tax export
Frontend:

New File	Description
pages/admin/MoneyFlowPage.tsx	Transactions table, refund queue, failed payments, payout processing
pages/admin/PlansPage.tsx	Subscription plan editor, discount management
pages/admin/PartnersAdminPage.tsx	Partner list (tabs: content vs business), contract management
pages/admin/InvoicesPage.tsx	Invoice table, bulk generation, PDF download
Alembic migration #008: Creates partner_contracts, invoices, payout_queue

Routes: /dashboard/admin/finance/transactions, /dashboard/admin/finance/plans, /dashboard/admin/partners, /dashboard/admin/invoices

Phase 8: Operations & Control
Backend:

New models in backend/app/models/admin/operations.py:

support_tickets — ticket_number, subject, description, category, priority, status, reporter_id, assigned_to, sla_deadline, sla_breached, csat_score, messages (JSONB)
moderation_items — content_type, content_id, content_snapshot, reason, status, decision, ai_confidence
system_configs — key (unique), value (JSONB), category, requires_approval, current_version
system_config_change_requests — config_id, proposed_value, reason, requested_by, approved_by, status (maker-checker)
keyword_filters — pattern, pattern_type (keyword/regex), action (flag/block/warn), category, is_active
New services:

backend/app/services/admin/ticket_service.py — CRUD, SLA tracking, CSAT, escalation
backend/app/services/admin/moderation_service.py — queue management, AI+human decisions
backend/app/services/admin/config_service.py — config CRUD with maker-checker workflow
New endpoints:

Support: CRUD tickets, POST assign/escalate/message, GET SLA, GET CSAT
Moderation: GET queue, PUT decide, CRUD keyword filters
Config: GET all, POST change-request (maker), PUT approve/reject (checker)
Audit: GET search, GET export, GET api-logs
Frontend:

New File	Description
pages/admin/TicketsPage.tsx	Ticket list with filters, SLA indicators
pages/admin/TicketDetailPage.tsx	Ticket thread view with message composer
pages/admin/ModerationPage.tsx	Moderation queue with AI confidence, keyword filter management
pages/admin/SystemConfigPage.tsx	Config viewer with maker-checker UI for changes
pages/admin/AuditLogsPage.tsx	Searchable, filterable audit log table with export
WebSocket events: ticket.created, ticket.escalated, moderation.reported

Alembic migration #009: Creates 5 operations tables

Routes: /dashboard/admin/tickets, /dashboard/admin/tickets/:id, /dashboard/admin/moderation, /dashboard/admin/config, /dashboard/admin/audit-logs

Phase 9: Admin Account
Backend:

No new models — uses existing users, notifications tables + profile_data JSONB.

New endpoints in backend/app/api/v1/admin/account.py:

GET/PUT /admin/profile — admin profile management
POST /admin/profile/2fa/enable, POST /admin/profile/2fa/verify
GET /admin/profile/sessions, DELETE /admin/profile/sessions/{id}
PUT /admin/profile/password
GET/PUT /admin/preferences — theme, timezone, dashboard layout
GET /admin/notifications — priority filtering
PUT /admin/notifications/{id}/read, PUT /admin/notifications/read-all
Frontend:

New File	Description
pages/admin/AdminNotificationsPage.tsx	Priority inbox (critical/high on top) + full notification list
pages/admin/AdminProfilePage.tsx	Profile, 2FA setup, active sessions, password change
pages/admin/AdminPreferencesPage.tsx	Theme toggle, timezone selector, dashboard layout customization
Routes: /dashboard/admin/notifications, /dashboard/admin/profile, /dashboard/admin/preferences

Global Features (Applied Across All Sections)
Unified Global Search
Frontend: Search bar in AdminSidebar or Topbar — queries /api/v1/admin/search?q=
Backend: /api/v1/admin/search endpoint — searches users, courses, transactions, tickets, enrollments with categorized results
Keyboard shortcut: Ctrl+K or /
Bulk Operations & Export
Every AdminDataTable instance supports row selection + bulk actions
Export button on every table: CSV, Excel (via server), PDF (via server)
Backend export endpoints return file download streams
Accessibility (WCAG 2.1 AA)
All pages: aria-label, role attributes, keyboard navigation
Global shortcuts: Ctrl+K (search), ? (help), g+h (home), g+u (users), g+t (tickets)
Skip-to-content link, focus trapping in modals, high contrast via dark theme
Child Safety System
AI content scanning integrated into AI monitoring (Phase 5)
Mandatory incident reporting workflow in compliance (Phase 6)
Parent notification triggers on safety incidents
Comprehensive audit trail for all child-related data access
Alembic Migration Summary
#	Migration	Tables Created
002	admin_infrastructure	audit_logs, permissions, role_permissions, user_permission_overrides
003	system_health	system_health_snapshots
004	user_management	user_restrictions, api_tokens
005	content_integrity	content_versions, competency_tags, course_competency_mappings, grade_overrides, certificate_templates, resource_items
006	ai_monitoring	ai_conversation_flags, ai_content_reviews, ai_performance_metrics
007	analytics_compliance	compliance_incidents, scheduled_reports
008	finance_partnerships	partner_contracts, invoices, payout_queue
009	operations	support_tickets, moderation_items, system_configs, system_config_change_requests, keyword_filters
Total new tables: ~23

Complete Route Map (App.tsx)

/dashboard/admin                           → AdminDashboardPage (At a Glance)
/dashboard/admin/pulse                     → PlatformPulsePage
/dashboard/admin/users                     → UsersPage
/dashboard/admin/users/:id                 → UserDetailPage
/dashboard/admin/roles-permissions         → RolesPermissionsPage
/dashboard/admin/families                  → FamiliesPage
/dashboard/admin/restrictions              → RestrictionsPage
/dashboard/admin/courses                   → CoursesAdminPage
/dashboard/admin/cbc-alignment             → CBCAlignmentPage
/dashboard/admin/assessments               → AssessmentsAdminPage
/dashboard/admin/certificates              → CertificatesAdminPage
/dashboard/admin/resources                 → ResourceLibraryPage
/dashboard/admin/ai-monitoring             → AIMonitoringPage
/dashboard/admin/ai-content                → AIContentReviewPage
/dashboard/admin/ai-personalization        → AIPersonalizationPage
/dashboard/admin/ai-performance            → AIPerformancePage
/dashboard/admin/ai-providers              → AIProvidersPage (existing)
/dashboard/admin/analytics/learning        → LearningAnalyticsPage
/dashboard/admin/analytics/business        → BusinessAnalyticsPage
/dashboard/admin/analytics/compliance      → CompliancePage
/dashboard/admin/analytics/custom          → CustomInsightsPage
/dashboard/admin/finance/transactions      → MoneyFlowPage
/dashboard/admin/finance/plans             → PlansPage
/dashboard/admin/partners                  → PartnersAdminPage
/dashboard/admin/invoices                  → InvoicesPage
/dashboard/admin/tickets                   → TicketsPage
/dashboard/admin/tickets/:id              → TicketDetailPage
/dashboard/admin/moderation                → ModerationPage
/dashboard/admin/config                    → SystemConfigPage
/dashboard/admin/audit-logs                → AuditLogsPage
/dashboard/admin/notifications             → AdminNotificationsPage
/dashboard/admin/profile                   → AdminProfilePage
/dashboard/admin/preferences               → AdminPreferencesPage
All wrapped in <ProtectedRoute allowedRoles={['admin']}>.

Existing Code to Reuse
What	File	Reuse How
AI Provider page pattern	frontend/src/pages/admin/AIProvidersPage.tsx	Template for all new admin pages (tabs, stats cards, loading, error states)
AI Provider API pattern	backend/app/api/v1/admin/ai_providers.py	Template for all new admin endpoints (verify_admin_access dep, async queries)
Service singleton pattern	frontend/src/services/adminProviderService.ts	Template for all new frontend services
Sidebar component pattern	frontend/src/components/instructor/InstructorSidebar.tsx	Template for AdminSidebar
Framer Motion animations	Used throughout existing pages	Reuse stagger, fadeUp animation patterns
Toast notifications	react-hot-toast already installed	Use for all success/error feedback
Auth store	frontend/src/store/authStore.ts	Get JWT token for WebSocket auth, API calls
Existing User model	backend/app/models/user.py	Base for all user queries — already has role, profile_data JSONB
Existing payment models	backend/app/models/ (Transaction, Wallet, etc.)	Query for finance section — no need to recreate
AI Orchestrator	backend/app/services/ai_orchestrator.py	Use for NL query builder (send prompt to AI, get SQL/chart config)
Verification & Testing
For each phase:
Backend: Run pytest after adding new endpoints. Test with FastAPI TestClient. Verify Alembic migrations: alembic upgrade head
Frontend: Run npm run build to verify TypeScript compilation. Run npm run lint for linting.
Integration: Start backend (python main.py), start frontend (npm run dev), verify:
Admin sidebar renders with all 9 sections
Each page loads data from real API endpoints
WebSocket connection establishes and receives events
Data tables paginate, sort, filter correctly
Bulk actions and exports work
Permission checks block unauthorized access
Audit logs record all admin actions
End-to-end smoke test:
Login as admin (demo user from seed_users.py)
Verify admin sidebar replaces student sidebar
Navigate through all sections — pages load without errors
Create a test user, approve an enrollment, process a refund
Check audit log shows all actions
Open browser DevTools Network tab — verify WebSocket connection active
Test responsive layout at 375px, 768px, 1024px, 1440px widths
Tab through pages — verify keyboard navigation works