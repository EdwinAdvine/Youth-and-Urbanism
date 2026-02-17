Partner Dashboard — Full Implementation Plan
Context
The platform needs a comprehensive Partner Dashboard with a new Sponsorship feature where partners can sponsor children (minimum 10), with dedicated monitoring tools modeled after the Parent Dashboard. The existing PartnerSidebar.tsx (278 nav items with local useState) and DashboardPartner.tsx (basic overview) will be rebuilt following the Admin Dashboard patterns (Zustand store, shared components, 2-level nav hierarchy). This is a full-stack build spanning backend models, migrations, API routes, services, and ~30+ frontend pages with functional AI integration.

Key Decisions
Sponsorship model: Both direct (Partner → Students) and program/cohort-based
Finance: Subscription-based per child (monthly + termly + annual), custom pricing per partner
Privacy: Parent e-signature consent required (in-app checkbox + timestamp)
AI: Functional multi-provider routing via existing AI orchestrator
Color: Red (#E40000), dark theme
Sidebar: Rebuilt borrowing Admin dashboard patterns (Zustand store, BentoGrid, shared components)
Migrations: Full Alembic migrations
Step 1: Backend Models (backend/app/models/partner/)
Create backend/app/models/partner/ directory following the instructor model pattern.

Files to Create:
__init__.py — Export all partner models (follow backend/app/models/instructor/__init__.py)

partner_profile.py — PartnerProfile model (one-to-one with User)

id (UUID PK), user_id (FK → users.id, unique)
organization_name, organization_type (NGO/Corporate/Government/Foundation/Individual)
display_name, bio, tagline, logo_url, banner_url
contact_person, contact_email, contact_phone
address (JSONB), website, social_links (JSONB)
registration_number (official org registration)
tax_id, tax_exempt (Boolean)
specializations (JSONB — education areas of focus)
partnership_tier (standard/premium/enterprise)
onboarding_completed, onboarding_step
branding_config (JSONB — logo, colors for branded reports)
created_at, updated_at
Relationship: user = relationship("User", back_populates="partner_profile")
sponsorship.py — Core sponsorship models

SponsorshipProgram — program/cohort container

id (UUID PK), partner_id (FK → users.id)
name, description, program_type (direct/cohort)
min_children (default 10), max_children
status (DRAFT/PENDING_APPROVAL/ACTIVE/PAUSED/COMPLETED/CANCELLED)
billing_period (monthly/termly/annual), price_per_child (Numeric)
currency (default KES), custom_pricing_notes (Text)
start_date, end_date (nullable for open-ended)
goals (JSONB — partner-set sponsorship aims)
approved_by (FK → users.id, admin who approved)
approved_at, created_at, updated_at
Indexes on partner_id, status, created_at
SponsoredChild — link between program and student

id (UUID PK), program_id (FK → sponsorship_programs.id)
student_id (FK → students.id), partner_id (FK → users.id)
status (PENDING_CONSENT/ACTIVE/PAUSED/GRADUATED/REMOVED)
enrolled_at, removed_at
partner_goals (JSONB — per-child goals set by partner)
ai_milestones (JSONB — AI-suggested milestones)
notes (Text — partner notes on this child)
Unique constraint on (program_id, student_id)
Indexes on student_id, partner_id, status
SponsorshipConsent — parent e-signature consent

id (UUID PK), sponsored_child_id (FK → sponsored_children.id)
parent_id (FK → users.id)
consent_given (Boolean), consent_text (Text — what they agreed to)
ip_address, user_agent (for audit trail)
consented_at (DateTime), revoked_at (nullable)
revocation_reason (Text, nullable)
Index on parent_id, sponsored_child_id
partner_subscription.py — Subscription billing

PartnerSubscription

id (UUID PK), partner_id (FK → users.id)
program_id (FK → sponsorship_programs.id)
billing_period (monthly/termly/annual)
amount_per_child (Numeric), total_children (Integer)
total_amount (Numeric), currency (default KES)
status (ACTIVE/PAST_DUE/CANCELLED/EXPIRED)
current_period_start, current_period_end
next_billing_date
payment_method_id (FK → payment_methods.id, nullable)
auto_renew (Boolean, default True)
created_at, updated_at
PartnerPayment — individual payment records

id (UUID PK), subscription_id (FK → partner_subscriptions.id)
partner_id (FK → users.id)
amount (Numeric), currency, status (pending/completed/failed/refunded)
payment_gateway (mpesa/stripe/paypal)
transaction_reference, gateway_response (JSONB)
receipt_url, invoice_number
period_start, period_end
paid_at, created_at
partner_impact.py — Impact tracking and reports

PartnerImpactReport
id (UUID PK), partner_id (FK → users.id)
program_id (FK → sponsorship_programs.id, nullable)
report_type (monthly/termly/annual/custom)
title, summary (Text — AI-generated)
metrics (JSONB — structured impact data)
ai_insights (JSONB — AI-generated analysis)
generated_at, exported_at
export_format (pdf/csv/xlsx), export_url
partner_collaboration.py — Collaboration tools

PartnerMessage

id (UUID PK), partner_id (FK), recipient_id (FK)
subject, body (Text), attachments (JSONB)
read_at, created_at
PartnerMeeting

id (UUID PK), partner_id (FK), title, description
scheduled_at, duration_minutes, meeting_url
attendees (JSONB), status (scheduled/completed/cancelled)
ai_suggested (Boolean), notes (Text)
partner_content.py — Partner content contributions

PartnerResource
id (UUID PK), partner_id (FK → users.id)
title, description, resource_type (lesson/material/video/document)
file_url, file_size, mime_type
status (pending_review/approved/rejected)
branding_applied (Boolean)
reviewed_by (FK), reviewed_at
usage_count, target_programs (JSONB — which programs can use)
created_at, updated_at
partner_ticket.py — Support tickets

PartnerTicket
id (UUID PK), partner_id (FK → users.id)
subject, description (Text), category
priority (low/medium/high/urgent)
status (open/in_progress/resolved/closed)
ai_triage_category, ai_triage_priority (AI-assigned)
assigned_to (FK → users.id, staff)
attachments (JSONB), resolution (Text)
created_at, updated_at, resolved_at
Files to Modify:
backend/app/models/user.py — Add partner_profile relationship back_populates
backend/app/models/__init__.py — Import all partner models
backend/alembic/env.py — Register partner models for migration auto-detection
Step 2: Alembic Migration
Generate migration after all models are defined:


cd backend && alembic revision --autogenerate -m "add_partner_dashboard_models"
Tables created: partner_profiles, sponsorship_programs, sponsored_children, sponsorship_consents, partner_subscriptions, partner_payments, partner_impact_reports, partner_messages, partner_meetings, partner_resources, partner_tickets

Step 3: Backend Schemas (backend/app/schemas/partner_schemas.py)
Create Pydantic schemas for all partner models:

Create/Update/Response schemas for each model
SponsorshipProgramCreate with validation (min_children >= 10)
SponsoredChildResponse with consent status
PartnerDashboardOverview — aggregated stats response
PartnerSubscriptionCreate with billing period validation
ConsentRequest/Response schemas
ImpactReportResponse with AI insights
Pagination wrappers following existing patterns
Step 4: Backend Services (backend/app/services/partner/)
Files to Create:
__init__.py

partner_service.py — Profile management

get_partner_profile(user_id, db) → PartnerProfile
create_partner_profile(user_id, data, db) → PartnerProfile
update_partner_profile(user_id, data, db) → PartnerProfile
sponsorship_service.py — Core sponsorship logic

create_sponsorship_program(partner_id, data, db) → SponsorshipProgram
add_children_to_program(program_id, student_ids, db) → list[SponsoredChild]
remove_child_from_program(program_id, student_id, db)
get_sponsored_children(partner_id, db) → list[SponsoredChild]
get_child_progress(sponsored_child_id, db) → dict (learning journey data)
get_child_activity(sponsored_child_id, period, db) → dict
get_child_achievements(sponsored_child_id, db) → list
request_consent(sponsored_child_id, db) → SponsorshipConsent
process_consent(consent_id, parent_id, agreed, ip, user_agent, db)
validate_min_children(program_id, db) — enforce minimum 10 constraint
partner_subscription_service.py — Billing logic

create_subscription(partner_id, program_id, billing_period, db)
process_payment(subscription_id, gateway, db)
check_subscription_status(subscription_id, db)
cancel_subscription(subscription_id, reason, db)
generate_invoice(payment_id, db) → invoice URL
get_billing_history(partner_id, db) → list[PartnerPayment]
partner_ai_service.py — AI-powered features using existing orchestrator

generate_impact_report(partner_id, period, db) — uses AI orchestrator to summarize
get_ai_forecasts(partner_id, db) — enrollment/ROI predictions
get_child_ai_insights(sponsored_child_id, db) — learning style, patterns
ai_triage_ticket(ticket_id, db) — auto-categorize support ticket
generate_custom_content(partner_id, prompt, db) — AI content generation
get_cohort_benchmarking(program_id, db) — compare cohort performance
Routes AI calls through existing app/services/ai_orchestrator.py
partner_analytics_service.py — Analytics and reporting

get_roi_metrics(partner_id, date_range, db)
get_custom_report(partner_id, filters, db)
export_report(report_id, format, db) → file URL
get_student_ai_insights(partner_id, student_id, db)
partner_collaboration_service.py — Messaging and meetings

send_message(partner_id, recipient_id, subject, body, db)
get_messages(partner_id, db) → list[PartnerMessage]
schedule_meeting(partner_id, data, db)
get_meetings(partner_id, db) → list[PartnerMeeting]
Step 5: Backend API Routes (backend/app/api/v1/partner/)
Files to Create:
__init__.py — register all routers

dashboard.py — prefix="/partner/dashboard"

GET /overview → PartnerDashboardOverview (stats, quick links, AI highlights)
GET /ai-highlights → daily AI insights
sponsorships.py — prefix="/partner/sponsorships"

POST /programs → create sponsorship program
GET /programs → list programs
GET /programs/{id} → program detail
PUT /programs/{id} → update program
POST /programs/{id}/children → add children (bulk)
DELETE /programs/{id}/children/{student_id} → remove child
GET /children → all sponsored children across programs
GET /children/{id}/progress → learning journey data
GET /children/{id}/activity → daily/weekly activity
GET /children/{id}/achievements → certificates, badges
GET /children/{id}/goals → goals & milestones
GET /children/{id}/ai-insights → AI companion insights
POST /consent/request → request parent consent
POST /consent/{id}/respond → parent responds to consent (used by parent)
GET /consent/status → consent status for all children
finance.py — prefix="/partner/finance"

POST /subscriptions → create subscription
GET /subscriptions → list subscriptions
PUT /subscriptions/{id} → update (change period, auto-renew)
DELETE /subscriptions/{id} → cancel subscription
POST /payments → process payment
GET /payments → billing history
GET /payments/{id}/receipt → download receipt
GET /budget → budget overview with allocations
GET /grants → grant tracking
analytics.py — prefix="/partner/analytics"

GET /roi → ROI metrics
GET /reports → custom reports
POST /reports/generate → AI-generated report
GET /reports/{id}/export → export report (PDF/CSV)
GET /student-insights/{student_id} → per-student dashboard
content.py — prefix="/partner/content"

POST /resources → upload resource
GET /resources → list resources
GET /courses → sponsored courses usage
POST /ai-generate → AI content generation
support.py — prefix="/partner/support"

POST /tickets → create ticket (AI triage)
GET /tickets → list tickets
GET /tickets/{id} → ticket detail
PUT /tickets/{id} → update ticket
account.py — prefix="/partner/account"

GET /profile → get partner profile
PUT /profile → update profile
GET /notifications → list notifications
PUT /notifications/{id}/read → mark read
PUT /settings → update settings
GET /team → team members
POST /team → add team member
collaboration.py — prefix="/partner/collaboration"

POST /messages → send message
GET /messages → inbox
POST /meetings → schedule meeting
GET /meetings → list meetings
Files to Modify:
backend/app/main.py — Register all partner routers (follow staff router pattern ~lines 503-608)
Step 6: Frontend Types (frontend/src/types/partner.ts)
Create comprehensive TypeScript types (~600-800 lines) following types/admin.ts pattern:

PartnerProfile — organization details, branding, tier
SponsorshipProgram — program with status, billing, children count
SponsoredChild — child with consent status, progress summary
SponsorshipConsent — consent record with timestamps
PartnerSubscription — billing with period, amounts, status
PartnerPayment — payment record with receipt
PartnerImpactReport — report with AI insights
PartnerMessage, PartnerMeeting — collaboration types
PartnerResource — content contribution
PartnerTicket — support ticket
PartnerDashboardOverview — aggregated dashboard stats
PartnerNotification — notification with categories
RealtimeCounters — WebSocket-updated counters
ChildLearningJourney — CBC competencies, weekly progress, focus areas
ChildActivity — time spent, sessions, streaks, engagement
ChildAchievement — certificates, badges, milestones
ChildGoal — partner-set goals with progress bars
ChildAIInsight — learning style, support tips, early warnings
ROIMetrics, CustomReport, BudgetOverview — analytics types
API request/response wrappers, pagination types
Step 7: Frontend Store (frontend/src/store/partnerStore.ts)
Create Zustand store following store/adminStore.ts pattern:


interface PartnerState {
  // UI State
  sidebarCollapsed: boolean;
  globalSearch: string;
  activeSection: string;
  openSidebarSections: string[];

  // Real-time counters
  counters: RealtimeCounters; // pendingConsents, activeSponsorships, openTickets, childAlerts, pendingPayments

  // Notification center
  partnerNotifications: PartnerNotification[];
  unreadCount: number;

  // Sponsored children view state
  selectedProgramId: string | null;
  selectedChildId: string | null;
  childViewMode: 'individual' | 'cohort';

  // Actions (UI, Realtime, Notifications, Child selection)
}
Persist sidebarCollapsed and openSidebarSections in localStorage.

File to Modify:
frontend/src/store/index.ts — Export usePartnerStore
Step 8: Frontend Shared Components (frontend/src/components/partner/shared/)
Create partner-specific shared components following admin's shared/ pattern:

Component	Purpose	Reference
PartnerStatsCard.tsx	KPI display with trend	AdminStatsCard.tsx
PartnerPageHeader.tsx	Page header with breadcrumbs	AdminPageHeader.tsx
PartnerBentoCard.tsx	Flexible card layout	StaffBentoCard.tsx
PartnerDataTable.tsx	Data tables for lists	StaffDataTable.tsx
PartnerFilterBar.tsx	Search and filter bar	StaffFilterBar.tsx
PartnerChart.tsx	Chart visualizations	StaffChart.tsx
PartnerModal.tsx	Modal dialogs	StaffModal.tsx
PartnerBadge.tsx	Status badges	StaffBadge.tsx
PartnerEmptyState.tsx	Empty state handler	StaffEmptyState.tsx
PartnerLoadingSkeleton.tsx	Loading skeletons	AdminLoadingSkeleton.tsx
Step 9: Frontend Sidebar (frontend/src/components/partner/sidebar/PartnerSidebar.tsx)
Rebuild the existing PartnerSidebar.tsx at a new path (partner/sidebar/PartnerSidebar.tsx), borrowing from the Admin sidebar pattern:

Use usePartnerStore (Zustand) instead of local useState
Global search bar at top
2-level nav hierarchy (Section → Children)
Badge counters for actionable items
Mobile responsive with overlay
Red accent color (#E40000)
7 Main Sections:
DASHBOARD — Partnership Overview, Quick Links, AI Highlights
PARTNERSHIPS — Sponsorships, Sponsored Children (Overview, Learning Journey, Activity, Achievements, Goals, AI Insights), Enrollments, Impact Reports, Collaboration
CONTENT — Sponsored Courses, Resource Contributions, AI-Generated Resources
FINANCE — Funding/Subscriptions, Budget Management, Grant Tracking
ANALYTICS — ROI Metrics, Custom Reports, Student AI Insights
SUPPORT — Tickets, Resources, Training Hub
ACCOUNT — Notifications, Profile, Settings, Logout
File to Modify:
frontend/src/components/layout/DashboardLayout.tsx — Update partner sidebar import to new path
Step 10: Frontend Pages (frontend/src/pages/partner/)
Dashboard Section:
File	Route	Description
PartnerDashboardPage.tsx	/dashboard/partner	Stats, BentoGrid, AI highlights, quick links
Partnerships Section:
File	Route	Description
SponsorshipsPage.tsx	/dashboard/partner/sponsorships	List/create sponsorship programs, bulk tools
SponsorshipDetailPage.tsx	/dashboard/partner/sponsorships/:id	Program detail with children list
SponsoredChildrenPage.tsx	/dashboard/partner/sponsored-children	Overview cards — all sponsored children
ChildProgressPage.tsx	/dashboard/partner/sponsored-children/:id	Individual child dashboard (tabs for journey, activity, achievements, goals, AI insights)
EnrollmentsPage.tsx	/dashboard/partner/enrollments	Bulk upload CSV/Excel, cohort tracking
ImpactReportsPage.tsx	/dashboard/partner/impact-reports	AI-summarized outcomes, CBC progress, exports
CollaborationPage.tsx	/dashboard/partner/collaboration	Messages, meetings, shared dashboards
Content Section:
File	Route	Description
SponsoredCoursesPage.tsx	/dashboard/partner/sponsored-courses	Create/monitor courses in cohorts
ResourceContributionsPage.tsx	/dashboard/partner/resources	Upload branded materials
AIGeneratedResourcesPage.tsx	/dashboard/partner/ai-resources	Generate custom lessons with AI
Finance Section:
File	Route	Description
FundingPage.tsx	/dashboard/partner/funding	Subscriptions, payment processing
BudgetManagementPage.tsx	/dashboard/partner/budget	Spending dashboard, ROI forecasting
GrantTrackingPage.tsx	/dashboard/partner/grants	Grant applications, compliance reporting
Analytics Section:
File	Route	Description
ROIMetricsPage.tsx	/dashboard/partner/roi-metrics	Interactive charts, predictive modeling
CustomReportsPage.tsx	/dashboard/partner/custom-reports	Filtered reports, BI export
StudentAIInsightsPage.tsx	/dashboard/partner/student-insights	Per-child dashboards, cohort benchmarking
Support Section:
File	Route	Description
PartnerTicketsPage.tsx	/dashboard/partner/tickets	Submit/view tickets with AI triage
PartnerResourcesPage.tsx	/dashboard/partner/help-resources	API docs, guides, forums
TrainingHubPage.tsx	/dashboard/partner/training	Webinars, certifications
Account Section:
File	Route	Description
PartnerNotificationsPage.tsx	/dashboard/partner/notifications	Customizable alerts
PartnerProfilePage.tsx	/dashboard/partner/profile	Edit org details, team management
PartnerSettingsPage.tsx	/dashboard/partner/settings	Access controls, theme, 2FA
Total: 23 pages

Step 11: Frontend Services (frontend/src/services/partner/)
Files to Create:
partnerDashboardService.ts — Dashboard API calls

getOverview(), getAIHighlights()
sponsorshipService.ts — Sponsorship CRUD

getPrograms(), createProgram(), getChildren(), addChildren()
getChildProgress(), getChildActivity(), getChildAchievements()
getChildGoals(), getChildAIInsights()
requestConsent(), getConsentStatus()
partnerFinanceService.ts — Billing and payments

getSubscriptions(), createSubscription(), processPayment()
getBillingHistory(), getBudgetOverview(), getGrants()
partnerAnalyticsService.ts — Analytics

getROIMetrics(), generateReport(), exportReport()
partnerContentService.ts — Content management

getCourses(), uploadResource(), generateAIContent()
partnerSupportService.ts — Support tickets

createTicket(), getTickets(), updateTicket()
partnerAccountService.ts — Account management

getProfile(), updateProfile(), getNotifications(), updateSettings()
Step 12: Routing Updates
File to Modify: frontend/src/App.tsx
Add 23 lazy-loaded partner routes inside ProtectedRoute with allowedRoles={['partner']}:

Follow the admin/staff route pattern (~lines 155-225)
Replace existing /dashboard/partner route with new PartnerDashboardPage
All routes prefixed with /dashboard/partner/*
Step 13: AI Integration
Multi-Provider Routing via Existing Orchestrator
File to modify: backend/app/services/ai_orchestrator.py — Add partner-specific task routing

Feature	Provider	Task Type
Impact report generation	Claude (Anthropic)	Creative/summary
ROI forecasting	Gemini Pro	Analytics/reasoning
Child learning insights	Claude	Educational analysis
Ticket triage	Gemini Pro	Classification
Content generation	Claude	Creative
Cohort benchmarking	Gemini Pro	Data analysis
Enrollment forecasts	Gemini Pro	Predictive
New file: backend/app/services/partner/partner_ai_service.py — Partner-specific AI service that calls the orchestrator with appropriate task types and prompts.

Step 14: Seed Data
File to Create: backend/seed_partner_data.py
Create demo partner user with profile
Create sample sponsorship programs (2-3)
Create sample sponsored children (15-20)
Create sample consent records
Create sample subscriptions and payments
Create sample impact reports
Create sample tickets and messages
Step 15: Tests
Backend Tests: backend/tests/partner/
conftest.py — fixtures (partner user, program, children, db session)
test_partner_dashboard_api.py — dashboard overview endpoint
test_sponsorship_api.py — CRUD for programs and children
test_consent_api.py — consent flow
test_finance_api.py — subscriptions and payments
test_analytics_api.py — reports and metrics
Frontend Tests: frontend/src/tests/partner/
partnerStore.test.ts — Zustand store actions
PartnerSidebar.test.tsx — sidebar rendering and navigation
Verification Plan
Database: Run alembic upgrade head — verify all 11 tables created
Seed: Run python seed_partner_data.py — verify demo data
API: Start backend (uvicorn main:app --reload), visit /docs — verify all partner endpoints appear under Partner tags
Frontend: Start frontend (npm run dev), login as partner user — verify:
Sidebar renders with all 7 sections, collapsible, search works
Dashboard page shows stats, BentoGrid cards, AI highlights
Sponsored Children page shows overview cards
Child detail page shows tabs (Learning Journey, Activity, Achievements, Goals, AI Insights)
Finance pages show subscription management
AI features return real insights (verify orchestrator calls)
Consent flow: Login as parent → verify consent request appears → approve → verify child data appears in partner dashboard
TypeScript: Run npx tsc --noEmit — zero errors
Backend tests: Run pytest tests/partner/ — all pass
Build: Run npm run build — successful production build
Implementation Order
Execute steps sequentially (each depends on the prior):

Backend models (Step 1) + User model modification
Alembic migration (Step 2)
Backend schemas (Step 3)
Backend services (Step 4) + AI service (Step 13)
Backend API routes (Step 5) + main.py registration
Seed data (Step 14)
Frontend types (Step 6)
Frontend store (Step 7)
Frontend shared components (Step 8)
Frontend sidebar rebuild (Step 9) + DashboardLayout update
Frontend pages — all 23 (Step 10)
Frontend services (Step 11)
Routing updates (Step 12)
Tests (Step 15)
Verification (full end-to-end)
Files Summary
New Files (~75+ files):
Backend models: 8 files in backend/app/models/partner/
Backend schemas: 1 file
Backend services: 7 files in backend/app/services/partner/
Backend API routes: 9 files in backend/app/api/v1/partner/
Backend seed: 1 file
Backend tests: 6 files in backend/tests/partner/
Frontend types: 1 file
Frontend store: 1 file
Frontend shared components: 10 files in frontend/src/components/partner/shared/
Frontend sidebar: 1 file in frontend/src/components/partner/sidebar/
Frontend pages: 23 files in frontend/src/pages/partner/
Frontend services: 7 files in frontend/src/services/partner/
Frontend tests: 2 files
Modified Files (~6 files):
backend/app/models/user.py — add partner_profile relationship
backend/app/models/__init__.py — import partner models
backend/alembic/env.py — register partner models
backend/app/main.py — register partner API routers
frontend/src/App.tsx — add 23 partner routes
frontend/src/components/layout/DashboardLayout.tsx — update sidebar import
frontend/src/store/index.ts — export partner storeß