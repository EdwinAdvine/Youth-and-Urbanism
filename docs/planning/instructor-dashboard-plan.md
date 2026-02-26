External Instructor Dashboard — Full Implementation Plan
Context
The instructor role currently has a sidebar with 150+ navigation items (frontend/src/components/instructor/InstructorSidebar.tsx) and a basic landing page (frontend/src/pages/DashboardInstructor.tsx), but none of the ~50 actual pages behind those links are built. The backend has solid existing infrastructure (courses, payments, assessments, enrollments, live sessions) but no instructor-specific API endpoints. This plan builds the complete instructor dashboard — full stack, real AI integrations, custom WebRTC, real-time co-editing, full gamification, multi-method 2FA, and public instructor profiles — on a single feature/instructor-dashboard branch.

Phase 1: Foundation (Backend Models + Frontend Store + Sidebar + Types)
1.1 Backend Models — New directory: backend/app/models/instructor/
__init__.py — Export all models

instructor_profile.py — InstructorProfile table:

id (UUID PK), user_id (FK users.id, unique), display_name, bio (Text), tagline, avatar_url, banner_url, specializations (JSONB[]), qualifications (JSONB[]), experience_years, subjects (JSONB[]), languages (JSONB[]), teaching_style, ai_personality_config (JSONB), public_profile_enabled (Bool), public_slug (String unique), seo_meta (JSONB), availability_config (JSONB), social_links (JSONB), portfolio_items (JSONB[]), onboarding_completed (Bool), timestamps
instructor_earnings.py — 3 tables:

InstructorEarning: id, instructor_id, course_id (nullable), session_id (nullable), earning_type (enum: course_sale/session_fee/bonus/referral), gross_amount, platform_fee_pct, partner_fee_pct, net_amount, currency, status (enum: pending/confirmed/paid/reversed), period_start/end, metadata (JSONB), timestamps
InstructorPayout: id, instructor_id, amount, currency, payout_method (enum: mpesa_b2c/bank_transfer/paypal), payout_details (JSONB), status (enum: requested/processing/completed/failed/reversed), transaction_reference, processed_at, failure_reason, timestamps
InstructorRevenueSplit: id, instructor_id, course_id (nullable), instructor_pct (default 60), platform_pct (default 30), partner_pct (default 10), set_by (FK users.id), effective_from/until, notes, timestamps
instructor_gamification.py — 5 tables:

InstructorBadge: id, name, description, icon_url, category, criteria (JSONB), tier (bronze/silver/gold/platinum), points_value, is_active, timestamps
InstructorBadgeAward: id, instructor_id, badge_id, awarded_at, metadata (JSONB)
InstructorPoints: id, instructor_id, points (default 0), level (default 1), streak_days, longest_streak, last_activity_at, timestamps
InstructorPointsLog: id, instructor_id, points_delta, reason, source, metadata (JSONB), created_at
PeerKudo: id, from_instructor_id, to_instructor_id, message, category, is_public, created_at
instructor_session.py — 2 tables (extends existing LiveSession model at backend/app/models/staff/live_session.py):

InstructorSessionAttendance: id, session_id (FK live_sessions.id), student_id (FK students.id), joined_at, left_at, duration_seconds, engagement_score (AI-calculated), attention_data (JSONB)
InstructorSessionFollowUp: id, session_id, instructor_id, title, description, due_date, status, assigned_to_student_id (nullable), timestamps
instructor_ai_insight.py — 2 tables:

InstructorDailyInsight: id, instructor_id, insight_date (Date), insights (JSONB[]), generated_at, ai_model_used, metadata (JSONB)
InstructorCBCAnalysis: id, course_id, instructor_id, alignment_score (0-100), competencies_covered (JSONB[]), competencies_missing (JSONB[]), suggestions (JSONB[]), ai_model_used, analysis_data (JSONB), timestamps
instructor_discussion.py — 2 tables:

InstructorForumPost: id, instructor_id, forum_id (nullable), title, content, post_type (discussion/announcement/question), is_pinned, is_moderated, sentiment_score (nullable), timestamps
InstructorForumReply: id, post_id, author_id, content, sentiment_score (nullable), timestamps
instructor_2fa.py — 2 tables:

InstructorTwoFactor: id, user_id (unique), totp_secret (encrypted), totp_enabled, sms_enabled, sms_phone, email_otp_enabled, backup_codes (JSONB encrypted), last_verified_at, timestamps
LoginHistory: id, user_id, ip_address, user_agent, location (nullable), success, failure_reason, two_factor_method, created_at
Existing model modifications:

backend/app/models/course.py — Add revenue_split_id (FK), cbc_analysis_id (FK nullable), ai_generated_meta (JSONB nullable)
backend/app/models/user.py — Add relationship: instructor_profile = relationship("InstructorProfile", uselist=False)
Alembic migration: alembic revision --autogenerate -m "instructor_dashboard_models"

1.2 Frontend Types — New file: frontend/src/types/instructor.ts
All TypeScript interfaces: InstructorProfile, InstructorNotification, InstructorRealtimeCounters, InstructorDashboardStats, InstructorEarning, InstructorPayout, InstructorCourse, InstructorAssessment, InstructorSession, InstructorBadge, InstructorPoints, PeerKudo, InstructorWSEventType, InstructorCBCAnalysis, InstructorDailyInsight, plus paginated request/response generics.

1.3 Frontend Zustand Store — New file: frontend/src/store/instructorStore.ts
Modeled on frontend/src/store/staffStore.ts (verified pattern lines 1-80):


interface InstructorRealtimeCounters {
  pendingSubmissions: number;
  unreadMessages: number;
  upcomingSessions: number;
  aiFlaggedStudents: number;
  unreadNotifications: number;
  pendingPayouts: number;
}

interface InstructorState {
  sidebarCollapsed: boolean;
  globalSearch: string;
  activeSection: string;
  openSidebarSections: string[];
  viewMode: 'teaching_focus' | 'earnings_focus' | 'custom';
  counters: InstructorRealtimeCounters;
  instructorNotifications: InstructorNotification[];
  unreadCount: number;
  // Actions: setSidebarCollapsed, setGlobalSearch, toggleSidebarSection,
  // setViewMode, updateCounters, incrementCounter, decrementCounter,
  // addNotification, markNotificationRead, markAllNotificationsRead, etc.
}
Persist sidebarCollapsed, openSidebarSections, viewMode via zustand persist middleware keyed as 'instructor-store'. Export from frontend/src/store/index.ts.

1.4 Sidebar Rebuild — Rewrite: frontend/src/components/instructor/InstructorSidebar.tsx
Borrow patterns from Staff sidebar (Zustand store, search bar, real-time badges, view mode toggle). Flatten navigation from ~150 nested items to ~30 flat items across 7 sections:

Section	Items	Key badges
DASHBOARD	My Focus, AI Daily Insights	—
MY TEACHING SPACE	My Courses, Modules Editor, CBC Alignment (AI), Assessments, Submissions, Resources	counters.pendingSubmissions
STUDENTS & ENGAGEMENT	Live Sessions, Messages, AI Tutor Handoff, Progress Pulse, Discussions	counters.unreadMessages, counters.upcomingSessions
IMPACT & RECOGNITION	Feedback & Ratings, Performance & Growth, Badges & Milestones, Peer Recognition	—
EARNINGS & FINANCES	Earnings Dashboard, Payouts & History, Rates & Billing	counters.pendingPayouts
INSTRUCTOR HUB	CBC References, AI Prompts & Templates, Community Lounge, Co-Create (Yjs), Support	—
ACCOUNT	Notifications, Profile & Portfolio, Public Page, Availability, Security & 2FA	counters.unreadNotifications
Purple accent (#8B5CF6), search bar at top, view mode toggle, "AI" badges on AI-powered items.

Phase 2: Backend API Layer + Services
2.1 Schemas — New directory: backend/app/schemas/instructor/
Files: __init__.py, profile_schemas.py, earnings_schemas.py, course_schemas.py, assessment_schemas.py, session_schemas.py, insight_schemas.py, gamification_schemas.py, discussion_schemas.py, security_schemas.py

2.2 Services — New directory: backend/app/services/instructor/
Service file	Responsibility	Key dependencies
dashboard_service.py	Aggregate today's stats (active students, upcoming sessions, pending submissions, earnings snapshot, AI-flagged students)	Enrollment, LiveSession, Assessment, InstructorEarning models
course_service.py	Instructor course CRUD, modules/lessons JSONB management	Existing Course model
cbc_analysis_service.py	AI-powered CBC alignment checking	ai_orchestrator.py (task_type="reasoning"), CBC competency framework data
assessment_service.py	Assessment CRUD, submissions listing, batch grading with AI feedback, AI adaptive assessment generation	Assessment model, ai_orchestrator.py
session_service.py	Live session CRUD, attendance tracking, recording management, follow-up tasks, AI session summaries	LiveSession model, ai_orchestrator.py
ai_insight_service.py	Nightly batch job generating prioritized daily insights	ai_orchestrator.py, Celery/BackgroundTasks
earnings_service.py	Configurable revenue split calculation, multi-gateway payouts (M-Pesa B2C, bank via Flutterwave/Paystack, PayPal), earnings aggregation, invoice generation (reportlab/weasyprint)	payment_service.py, InstructorRevenueSplit model
gamification_service.py	Badge awarding, points/level calculation, streak tracking, Redis leaderboard, peer kudos	Redis sorted sets, InstructorBadge/Points models
discussion_service.py	Forum CRUD, AI moderation, announcements	ai_orchestrator.py
security_service.py	TOTP (pyotp), SMS OTP (Africa's Talking/Twilio), Email OTP, backup codes, login history	Redis for OTP TTL storage
profile_service.py	Profile CRUD, public profile/SEO, portfolio builder, availability management	InstructorProfile model
2.3 API Routes — New directory: backend/app/api/v1/instructor/
Route file	Key endpoints
dashboard.py	GET /api/v1/instructor/dashboard/overview
courses.py	CRUD /api/v1/instructor/courses, /courses/{id}/modules, /courses/{id}/cbc-analysis, /courses/{id}/analytics
assessments.py	CRUD /api/v1/instructor/assessments, /{id}/submissions, /batch-grade, /ai-generate, /rubrics
sessions.py	CRUD /api/v1/instructor/sessions, /{id}/start, /{id}/end, /{id}/attendance, /{id}/recordings, /{id}/ai-summary, /{id}/follow-ups
interactions.py	/api/v1/instructor/messages, /ai-handoff/{student_id}, /ai-handoff/{student_id}/summary, /students/{id}/progress, /students/{id}/flag, /students/{id}/celebrate
earnings.py	/api/v1/instructor/earnings, /earnings/breakdown, /earnings/projection, /payouts/request, /payouts/history, /payouts/documents, /rates, /rates/ai-optimize
impact.py	/api/v1/instructor/feedback, /feedback/{id}/reply, /feedback/sentiment, /performance, /gamification/badges, /gamification/points, /gamification/leaderboard, /gamification/kudos
hub.py	/api/v1/instructor/hub/cbc-references, /hub/ai-prompts, /hub/community/posts, /hub/support/tickets
account.py	/api/v1/instructor/profile, /profile/public, /availability, /security/totp/setup, /security/totp/verify, /security/sms-otp/enable, /security/email-otp/enable, /security/login-history
insights.py	/api/v1/instructor/insights/daily, /insights/resources
resources.py	CRUD /api/v1/instructor/resources, /resources/ai-suggestions, /resources/usage
Public endpoint (no auth): GET /api/v1/public/instructors/{slug} — public instructor profile, cached in Redis 15 min.

2.4 Register in main.py
Add all 11 instructor routers to backend/app/main.py after the existing staff routes block.

Phase 3: WebSocket Channel + WebRTC + Yjs
3.1 Instructor WebSocket — New file: backend/app/websocket/instructor_connection_manager.py
Clone pattern from backend/app/websocket/staff_connection_manager.py. Events: counter_update, notification, submission_received, session_starting, student_flagged, payout_status, message_received, badge_earned.

Add endpoint to backend/app/main.py:


@app.websocket("/ws/instructor/{token}")
Frontend hook: frontend/src/hooks/useInstructorWebSocket.ts — connects, dispatches to useInstructorStore, auto-reconnect with exponential backoff, 30s heartbeat.

3.2 WebRTC Live Sessions
Backend signaling server — New file: backend/app/websocket/webrtc_signaling.py:

WebRTCSignalingManager managing rooms with participant WebSocket connections
Relays offer/answer/ICE candidates between peers
Endpoint: @app.websocket("/ws/webrtc/{room_id}/{token}")
ICE config — Add STUN/TURN settings to backend/app/config.py, expose via GET /api/v1/instructor/sessions/{id}/ice-config

Frontend:

frontend/src/hooks/useWebRTC.ts — RTCPeerConnection management, media streams, ICE handling
frontend/src/components/instructor/sessions/LiveVideoRoom.tsx — Video grid, camera/mic toggles, screen share, chat overlay, participant list, recording indicator. Mesh topology for up to ~6 participants.
3.3 Yjs Real-time Co-editing
Backend change — In backend/app/main.py, expand Yjs role check to include "instructor" (currently only allows "staff" and "admin").

Frontend:

frontend/src/hooks/useYjsCollaboration.ts — Yjs + y-websocket, connects to /ws/yjs/{docId}/{token}
frontend/src/components/instructor/hub/CollaborativeEditor.tsx — TipTap with @tiptap/extension-collaboration + @tiptap/extension-collaboration-cursor, real-time presence indicators
Phase 4: Frontend Pages (~40 pages, all lazy-loaded)
All pages in frontend/src/pages/instructor/, using DashboardLayout with role="instructor".

Dashboard (2 pages)
InstructorDashboardPage.tsx — Bento grid: stats cards, AI agenda, upcoming sessions, submissions, earnings snapshot, AI-flagged students
AIInsightsPage.tsx — Full daily insights list with action buttons
My Teaching Space (8 pages)
MyCoursesPage.tsx — Course list with filters, search, create
CourseEditorPage.tsx — Course create/edit with rich text (TipTap)
ModulesEditorPage.tsx — Drag-and-drop module/lesson editor (dnd-kit)
CBCAlignmentPage.tsx — AI CBC analysis dashboard per course
AssessmentsPage.tsx — Assessment list (quizzes, assignments, projects)
AssessmentEditorPage.tsx — Create/edit with question builder
SubmissionsPage.tsx — Submissions inbox with batch grading
ResourcesPage.tsx — File upload, AI suggestions, usage stats
Students & Engagement (8 pages)
SessionsPage.tsx — Session list with schedule/host actions
SessionDetailPage.tsx — Attendance heatmap (recharts), recordings, follow-ups
LiveSessionPage.tsx — WebRTC video room (uses LiveVideoRoom component)
MessagesPage.tsx — Direct message threads
AIHandoffPage.tsx — AI tutor conversation history per student
ProgressPulsePage.tsx — Per-student/group progress dashboard
InterventionsPage.tsx — Flag/celebrate/intervene actions
DiscussionsPage.tsx — Forum topics, moderation, announcements
Impact & Recognition (5 pages)
FeedbackPage.tsx — Reviews list, reply interface
SentimentAnalysisPage.tsx — AI sentiment trends, benchmarking
PerformancePage.tsx — Engagement/retention charts (recharts), content ranking
BadgesPage.tsx — Badge showcase, milestones, level progress
RecognitionPage.tsx — Peer kudos received/sent, leaderboard
Earnings & Finances (5 pages)
EarningsDashboardPage.tsx — Monthly/total, line/bar charts, breakdown
EarningsBreakdownPage.tsx — Detailed by course/session/bonus
PayoutsPage.tsx — Withdraw (M-Pesa/bank/PayPal), history, receipts
RatesPage.tsx — Session/course rates, bonus rules, payment methods
DocumentsPage.tsx — Tax/invoice documents, auto-generated reports
Instructor Hub (6 pages)
CBCReferencesPage.tsx — CBC curriculum browser
AIPromptsPage.tsx — Prompt builder, template library
CommunityLoungePage.tsx — Forum among instructors
CoCreatePage.tsx — Real-time Yjs collaborative editor
SupportTicketsPage.tsx — Ticket list
SupportTicketDetailPage.tsx — Single ticket with chat
Account (6 pages)
InstructorNotificationsPage.tsx — Smart inbox with AI filtering
ProfilePage.tsx — Bio, credentials, photo, portfolio
PublicPageSettingsPage.tsx — Public profile preview and SEO settings
AvailabilityPage.tsx — Calendar, booking rules, notification filters, AI personality
SecurityPage.tsx — Password, 2FA setup (TOTP/SMS/Email), backup codes
LoginHistoryPage.tsx — Login history table
Public Profile (1 page, outside dashboard)
frontend/src/pages/InstructorPublicProfilePage.tsx — Route: /instructor/:slug, no auth, SEO (react-helmet-async), hero + bio + courses + ratings + credentials + badges
Shared Components — frontend/src/components/instructor/
Subdirectory	Components
dashboard/	InstructorBentoGrid, EarningsSnapshotCard, AIInsightsCard, UpcomingSessionsCard, SubmissionsCard, FlaggedStudentsCard
courses/	CourseCard, ModuleEditor (dnd-kit), LessonEditor (TipTap), CBCAlignmentBadge
assessments/	QuestionBuilder, SubmissionRow, BatchGradingPanel, RubricEditor
sessions/	SessionCard, AttendanceHeatmap (recharts), RecordingPlayer, FollowUpTask, LiveVideoRoom
earnings/	EarningsChart (recharts), PayoutRequestForm, InvoiceCard
gamification/	BadgeCard, LevelProgressBar, StreakIndicator, LeaderboardTable, KudoCard
security/	TOTPSetup, SMSOTPSetup, EmailOTPSetup, BackupCodes, TwoFactorVerification
shared/	InstructorPageHeader, InstructorStatsCard, AIBadge, EmptyState
Route Registration in frontend/src/App.tsx
~40 lazy imports + protected routes under /dashboard/instructor/* with allowedRoles={['instructor']}. Public route /instructor/:slug under PublicLayout.

Phase 5: AI Integration Points
All route through existing backend/app/services/ai_orchestrator.py:

Feature	AI task_type	Trigger
CBC Alignment Checker	reasoning	On-demand per course
AI Content Generator	creative	On-demand in module editor
AI Adaptive Assessments	reasoning	On-demand from assessment editor
AI Feedback Suggestions	general	On-demand in grading panel
AI Session Summaries	general	Post-session from recording transcript
AI Daily Insights	general	Nightly batch (Celery/BackgroundTasks)
AI Sentiment Analysis	reasoning	On-demand from feedback page
AI Moderation	general	On forum post creation
AI Rate Optimizer	reasoning	On-demand from rates page
AI Portfolio Builder	creative	On-demand from profile page
AI Scheduling Optimizer	reasoning	On-demand from availability page
AI Earnings Forecaster	reasoning	On-demand from earnings dashboard
AI Tutor Handoff Summary	general	On-demand per student
Phase 6: Gamification System
Seed Data — New file: backend/seed_instructor_badges.py
10+ predefined badges: "First Course Published" (bronze/10pts), "100 Students Enrolled" (silver/50pts), "500 Students Enrolled" (gold/100pts), "Perfect Rating" (gold/75pts), "CBC Champion" (silver/40pts), "7-Day Streak" (bronze/20pts), "30-Day Streak" (silver/50pts), "Community Contributor" (bronze/15pts), "Peer Recognized" (silver/30pts), "KSh 100K Earned" (gold/100pts).

Achievement Engine — In gamification_service.py
check_achievements(instructor_id) — Called after events (course publish, enrollment, rating). Evaluates badge criteria (JSONB), awards, logs points, broadcasts via WebSocket.

Leaderboard — Redis sorted set instructor:leaderboard:points, updated on points change, monthly reset.
Phase 7: 2FA Implementation
TOTP — pyotp library
Setup: generate secret, return QR code URI
Verify: validate 6-digit code, enable TOTP
Store encrypted totp_secret in InstructorTwoFactor
SMS OTP — Africa's Talking API (Kenya-focused) or Twilio
Send 6-digit code to phone, store in Redis with 5-min TTL (2fa:sms:{user_id}:{code})
Email OTP — Existing email_service.py
Same flow, Redis with 10-min TTL
Login Flow Change — Modify backend/app/api/v1/auth.py
After password check, if 2FA enabled: return {"requires_2fa": true, "methods": [...], "temp_token": "..."}
New endpoint: POST /api/v1/auth/verify-2fa — validates temp_token + code + method, returns JWT
Build Order (within single feature branch)
Step	What	Estimated scope
1	Backend models + Alembic migration	~12 new tables
2	Frontend types + Zustand store	2 files
3	Sidebar rebuild	1 file rewrite
4	Backend schemas	~10 files
5	Backend services	~11 files
6	Backend API routes + register in main.py	~12 files
7	WebSocket channel (backend + frontend hook)	3 files
8	Dashboard pages (2) + shared components	~8 files
9	Teaching Space pages (8) + components	~12 files
10	Students & Engagement pages (8) + components	~12 files
11	WebRTC signaling + LiveVideoRoom + useWebRTC hook	~4 files
12	Yjs co-editing integration (1 backend line + 2 frontend files)	~3 files
13	Earnings & Finances pages (5) + components	~8 files
14	Impact & Recognition pages (5) + gamification seed + components	~10 files
15	Instructor Hub pages (6) + CollaborativeEditor	~8 files
16	Account pages (6) + security components + 2FA	~12 files
17	Public instructor profile page	1 file
18	Route registration in App.tsx	1 file update
19	Polish: loading states, error handling, responsive QA	Across all files
Verification Plan
Backend models: Run alembic upgrade head — all tables created without errors
API endpoints: Visit /docs (Swagger) — all instructor routes visible and testable
Frontend build: npm run build in frontend/ — no TypeScript errors
Sidebar navigation: Every sidebar link navigates to its page without 404
WebSocket: Open dashboard — real-time counters update on events
WebRTC: Schedule and start a live session — video/audio works between 2 browsers
Yjs co-editing: Open Co-Create page in 2 browser tabs — edits sync in real-time
AI features: Trigger CBC alignment check on a course — AI returns alignment score
Earnings: Create course, simulate enrollment sale — earnings appear with correct configurable split
Payouts: Request withdrawal — payout record created with correct method
Gamification: Publish a course — "First Course Published" badge awarded, points logged
2FA: Enable TOTP in security settings — login requires authenticator code
Public profile: Visit /instructor/{slug} — public page renders with SEO meta tags
Lint: npm run lint and npx tsc --noEmit pass clean