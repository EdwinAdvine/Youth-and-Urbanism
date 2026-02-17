Staff/Teachers Dashboard - Comprehensive Implementation Plan
Context
The Urban Home School platform currently has a fully implemented Admin Dashboard (30+ pages) but the Staff/Teachers Dashboard is a single static page (DashboardStaff.tsx) with hardcoded mock data and no dedicated sidebar. Staff members (teachers, content moderators, support agents, curriculum specialists) need a comprehensive dashboard matching the Admin dashboard's quality and depth. This plan creates a complete staff ecosystem: 30 pages, dedicated sidebar, 14 backend API modules, 8 database migrations, real AI integration, LiveKit video conferencing, real-time collaborative editing, full SLA engine, adaptive assessments, PWA offline support, and comprehensive testing.

Key decisions confirmed with user:

Build all at once (not phased)
Single unified staff role (no teacher/staff split)
Separate /api/v1/staff/ endpoints
Real AI integration via existing orchestrator
WebSocket real-time chat
Yjs + TipTap collaborative editing
LiveKit SFU for 30-person video classrooms
pgvector for AI-powered knowledge base
Full adaptive assessment engine
Full SLA engine with auto-escalation
Full drag-and-drop report builder with scheduling + API export
PWA offline support with core action queueing
Production-like seed data (50+ staff, 500+ students, 1000+ tickets, 6 months analytics)
Comprehensive testing (pytest 80%+, Vitest + RTL, Playwright E2E)
1. Files to Create
1A. Backend - Database Migrations

backend/alembic/versions/
  003_staff_core_tables.py              # staff_profiles, staff_teams
  004_staff_tickets_sla.py              # staff_tickets, ticket_messages, sla_policies, sla_escalations
  005_staff_content_assessments.py      # content_items, content_versions, collab_sessions, adaptive_assessments, assessment_questions, cbc_competencies
  006_staff_knowledge_base.py           # kb_articles, kb_categories, kb_embeddings (pgvector)
  007_staff_live_sessions.py            # live_sessions, live_session_recordings, breakout_rooms
  008_staff_analytics_reports.py        # report_definitions, report_schedules
  009_staff_notifications_push.py       # push_subscriptions, notification_preferences
  010_staff_collaboration.py            # yjs_documents
1B. Backend - Models

backend/app/models/staff/
  __init__.py
  staff_profile.py           # StaffProfile, StaffTeam
  ticket.py                  # StaffTicket, StaffTicketMessage, TicketTag
  sla_policy.py              # SLAPolicy, SLAEscalation
  content_item.py            # StaffContentItem, StaffContentVersion, StaffCollabSession
  assessment.py              # AdaptiveAssessment, AssessmentQuestion
  cbc_competency.py          # CBCCompetency
  live_session.py            # LiveSession, LiveSessionRecording, BreakoutRoom
  knowledge_article.py       # KBArticle, KBCategory, KBEmbedding
  custom_report.py           # ReportDefinition, ReportSchedule
  notification_preference.py # StaffNotificationPref, PushSubscription
  moderation_queue.py        # StaffModerationItem, ReviewDecision
  student_journey.py         # StudentJourney, FamilyCase, CaseNote
1C. Backend - Schemas

backend/app/schemas/staff/
  __init__.py
  dashboard_schemas.py       # MyFocusResponse, AIAgendaItem
  ticket_schemas.py          # TicketCreate, TicketUpdate, TicketListResponse, TicketMessageCreate
  sla_schemas.py             # SLAPolicyCreate, SLAStatus, EscalationEvent
  content_schemas.py         # ContentCreate, ContentUpdate, VersionResponse
  assessment_schemas.py      # AssessmentCreate, QuestionCreate, AdaptiveSessionState, AIGradingResult
  session_schemas.py         # SessionCreate, SessionUpdate, LiveKitTokenResponse
  knowledge_base_schemas.py  # ArticleCreate, ArticleUpdate, KBSearchQuery, KBSearchResult
  report_schemas.py          # ReportConfigSchema, ScheduleCreate, ExportRequest
  team_schemas.py            # MyPerformance, TeamPulseResponse, WorkloadSuggestion
  account_schemas.py         # ProfileUpdate, PreferencesUpdate, NotificationPrefUpdate
  moderation_schemas.py      # ModerationItemResponse, ReviewDecisionCreate
  notification_schemas.py    # PushSubscribeRequest, NotificationResponse
1D. Backend - API Routes

backend/app/api/v1/staff/
  __init__.py
  dashboard.py               # GET overview, tasks, ai-agenda
  moderation.py              # GET queue, POST approve/reject, GET cbc-alignment, GET safety-flags
  support.py                 # CRUD tickets, assign, escalate, SLA status
  live_support.py            # WebSocket live chat endpoints
  student_journeys.py        # GET at-risk learners, family cases, case notes
  knowledge_base.py          # CRUD articles, vector search, AI suggestions
  content_studio.py          # CRUD content items, versioning, collab sessions
  assessment_builder.py      # CRUD assessments + questions, adaptive engine, AI grading
  sessions.py                # CRUD live sessions, LiveKit token generation, recordings
  insights.py                # GET platform health, content performance, support metrics
  reports.py                 # CRUD reports, scheduling, export (CSV/PDF/Excel), API trigger
  student_progress.py        # GET student progress cards, learning journey, daily activity
  team.py                    # GET my-performance, team-pulse (permission-gated), learning resources
  account.py                 # Profile, preferences, security, own audit logs
  notifications.py           # Push subscribe, digest config, notification CRUD, mark-read
1E. Backend - Services

backend/app/services/staff/
  __init__.py
  dashboard_service.py       # Aggregations for staff home dashboard
  moderation_service.py      # Content review workflows, bulk actions
  support_service.py         # Ticket management, assignment, resolution
  sla_engine.py              # SLA calculation, auto-escalation, breach detection background loop
  knowledge_base_service.py  # CRUD, embedding generation, pgvector similarity search
  content_studio_service.py  # Content versioning, publish workflow
  assessment_engine.py       # Adaptive question selection, difficulty adjustment, AI grading
  session_service.py         # LiveKit API integration (room create, token generate, recording)
  insights_service.py        # Analytics aggregation queries
  report_builder_service.py  # Report generation, PDF/CSV/Excel rendering, cron scheduling
  team_service.py            # Performance metrics, workload analysis
  notification_service.py    # Push notification dispatch, email digests, WebSocket events
  ai_analysis_service.py     # LLM-based: risk scoring, predictions, content quality, workload balancing
  cbc_service.py             # CBC competency lookup, gap analysis, alignment scoring
1F. Backend - WebSocket Handlers

backend/app/websocket/
  staff_connection_manager.py  # Staff-specific WS: counter updates, notifications, SLA warnings
  yjs_handler.py               # Yjs CRDT sync for collaborative editing
  live_chat_handler.py         # Real-time support chat (ticket conversations)
1G. Backend - Seed Scripts

backend/seed_staff_data.py         # 50+ staff, 500+ students, 100+ courses, 1000+ tickets, etc.
backend/seed_cbc_competencies.py   # ~800 CBC competencies from KICD framework
1H. Frontend - Pages (30 pages)

frontend/src/pages/staff/
  StaffDashboardPage.tsx           # Home / My Focus (AI-prioritized agenda)
  ContentReviewPage.tsx            # Content Review Queue (AI-flagged, bulk actions)
  ApprovalFeedbackPage.tsx         # Approval & Feedback (AI-drafted feedback)
  CBCStandardsPage.tsx             # CBC & Standards Alignment (competency mapping)
  SafetyPolicyPage.tsx             # Safety & Policy (risk scoring, reports)
  TicketsPage.tsx                  # Tickets & Conversations (SLA timers, triage)
  TicketDetailPage.tsx             # Single ticket with conversation thread
  LiveSupportPage.tsx              # Live Support (active chats, AI assistance)
  StudentJourneysPage.tsx          # Student & Family Journeys (at-risk, case view)
  StudentJourneyDetailPage.tsx     # Single student journey detail
  KnowledgeBasePage.tsx            # Knowledge & Responses (AI-powered search)
  KBArticleEditorPage.tsx          # KB article editor
  ContentStudioPage.tsx            # Content Studio (course/module list)
  ContentEditorPage.tsx            # TipTap + Yjs collaborative editor
  AssessmentBuilderPage.tsx        # Assessment list + builder
  AssessmentEditorPage.tsx         # Single assessment editor with adaptive paths
  SessionsPage.tsx                 # Sessions & Live Delivery (schedule, manage)
  LiveClassPage.tsx                # LiveKit live class room
  PlatformHealthPage.tsx           # Platform Health (DAU, engagement, AI usage)
  ContentPerformancePage.tsx       # Content Performance (effectiveness, heatmaps)
  SupportMetricsPage.tsx           # Support Metrics (resolution time, CSAT, trends)
  CustomReportsPage.tsx            # Drag-and-drop report builder
  StudentProgressPage.tsx          # Student Progress Monitoring (overview cards)
  MyPerformancePage.tsx            # My Performance (tasks, quality score, AI insights)
  TeamPulsePage.tsx                # Team Pulse (workload, AI balancer)
  LearningResourcesPage.tsx       # Learning & Resources (wiki, training, community)
  StaffNotificationsPage.tsx       # Notifications (filterable inbox)
  StaffProfilePage.tsx             # Profile & Presence (bio, status, hours)
  StaffPreferencesPage.tsx         # Preferences (theme, layout toggle, shortcuts)
  StaffSecurityPage.tsx            # Security & Access (sessions, 2FA, own audit log)
1I. Frontend - Components

frontend/src/components/staff/
  sidebar/
    StaffSidebar.tsx               # 7-section collapsible sidebar (mirrors AdminSidebar)

  dashboard/
    StaffBentoGrid.tsx             # Bento grid layout for dashboard
    UrgentTicketsCard.tsx          # Urgent tickets widget
    ModerationQueueCard.tsx        # Moderation highlights widget
    TasksDeadlinesCard.tsx         # Tasks & deadlines widget
    AIAgendaCard.tsx               # AI-prioritized daily agenda
    StudentFlagsCard.tsx           # Student/parent flags widget
    AnomaliesCard.tsx              # AI-detected anomalies widget
    ViewToggle.tsx                 # Teacher Focus / Operations Focus preset toggle

  shared/
    StaffStatsCard.tsx             # Stats card (replicates AdminStatsCard pattern)
    StaffBentoCard.tsx             # Variable-size grid card
    StaffPageHeader.tsx            # Page header with breadcrumbs
    StaffDataTable.tsx             # TanStack Table wrapper (replicates AdminDataTable)
    StaffBadge.tsx                 # Status/severity badges
    StaffChart.tsx                 # Recharts wrapper (area, bar, line, pie)
    StaffModal.tsx                 # Modal with focus trap, escape, size variants
    StaffEmptyState.tsx            # Empty state with icon + action
    StaffLoadingSkeleton.tsx       # Loading skeletons (card, table, stats)
    StaffFilterBar.tsx             # Reusable filter bar with dropdowns

  content/
    TipTapEditor.tsx               # TipTap + Yjs collaborative rich text editor
    ContentVersionHistory.tsx      # Version history panel with rollback
    CBCTagPicker.tsx               # CBC competency tag picker with search
    MultimediaBlockLibrary.tsx     # Interactive block palette for content

  assessment/
    QuestionEditor.tsx             # Question creation/edit form
    AdaptivePathEditor.tsx         # Visual adaptive path editor (if correct → if wrong)
    DifficultySlider.tsx           # Difficulty 1-5 slider with labels
    AIGradingPanel.tsx             # AI auto-grading results display
    QuestionBankBrowser.tsx        # Browse/search/filter question bank

  tickets/
    TicketConversation.tsx         # Message thread with internal notes
    SLAIndicator.tsx               # SLA countdown timer + breach warning
    TicketAssignPanel.tsx          # Assignment/escalation panel
    AITriagePanel.tsx              # AI-suggested priority + resolution

  live/
    LiveClassRoom.tsx              # LiveKit video room component
    BreakoutRoomManager.tsx        # Breakout room creation/management
    ScreenSharePanel.tsx           # Screen share controls
    RecordingIndicator.tsx         # Recording status + controls
    AttendanceTracker.tsx          # Live attendance dashboard
    PostSessionSummary.tsx         # AI-generated session summary

  reports/
    ReportCanvas.tsx               # Drag-and-drop report canvas (@dnd-kit)
    ReportWidgetPalette.tsx        # Widget palette (metric, chart, table, text)
    ReportScheduler.tsx            # Schedule config + recipient management
    ReportPreview.tsx              # PDF/print preview

  knowledge/
    KBSearchBar.tsx                # AI-powered vector search bar
    KBArticleCard.tsx              # Article preview card
    KBSuggestions.tsx              # AI-suggested responses during ticket handling
    KBEditor.tsx                   # Article editor with markdown
1J. Frontend - Hooks

frontend/src/hooks/staff/
  useStaffWebSocket.ts             # Staff WebSocket connection + event handling
  useStaffPermissions.ts           # Permission checking for UI element visibility
  useSLACountdown.ts               # SLA countdown timer (calculates remaining time, breach state)
  useLiveKit.ts                    # LiveKit room connection + track management
  useYjsCollab.ts                  # Yjs document + WebSocket provider + awareness
  useOfflineQueue.ts               # IndexedDB offline queue + sync status
  useReportBuilder.ts              # Report builder drag-drop state machine
  useAdaptiveAssessment.ts         # Adaptive assessment state (difficulty tracking, path selection)
  usePushNotifications.ts          # Browser Push API subscription management
1K. Frontend - Services

frontend/src/services/staff/
  staffDashboardService.ts         # /staff/dashboard/* API calls
  staffModerationService.ts        # /staff/moderation/* API calls
  staffSupportService.ts           # /staff/support/* API calls
  staffContentService.ts           # /staff/content/* API calls
  staffAssessmentService.ts        # /staff/assessments/* API calls
  staffSessionService.ts           # /staff/sessions/* API calls
  staffKnowledgeBaseService.ts     # /staff/kb/* API calls (incl. vector search)
  staffInsightsService.ts          # /staff/insights/* API calls
  staffReportService.ts            # /staff/reports/* API calls
  staffTeamService.ts              # /staff/team/* API calls
  staffAccountService.ts           # /staff/account/* API calls
  staffNotificationService.ts      # /staff/notifications/* API calls
1L. Frontend - Store & Types

frontend/src/store/staffStore.ts   # Zustand store (sidebar, counters, view mode, notifications)
frontend/src/types/staff.ts        # All staff TypeScript interfaces and enums
frontend/src/sw.ts                 # Service Worker for PWA offline support
2. Files to Modify
Frontend
File	Change
frontend/src/App.tsx	Add ~30 lazy-loaded staff route entries with ProtectedRoute allowedRoles={['staff']} + Suspense + StaffLoadingFallback
frontend/src/components/layout/DashboardLayout.tsx (line 82-112)	Add StaffSidebar case: user.role === 'staff' ? <StaffSidebar ... /> before the default <Sidebar>
frontend/src/types/index.ts (line 6)	Add 'staff' to User role union: role: 'student' | 'parent' | 'instructor' | 'admin' | 'partner' | 'staff'
frontend/src/pages/DashboardStaff.tsx	Replace with redirect to /dashboard/staff (new main page)
frontend/package.json	Add deps: @tiptap/react, @tiptap/starter-kit, @tiptap/extension-collaboration, @tiptap/extension-collaboration-cursor, yjs, y-websocket, @livekit/components-react, livekit-client, @dnd-kit/core, @dnd-kit/sortable, idb-keyval, workbox-precaching, workbox-routing, workbox-strategies, workbox-background-sync
Backend
File	Change
backend/app/main.py (lines 305-484 area)	Register all 14 staff routers with prefix {settings.api_v1_prefix}/staff + add /ws/staff/{token} WebSocket + add /ws/yjs/{doc_id}/{token} WebSocket + add /ws/support-chat/{ticket_id}/{token} WebSocket + add SLA background task in lifespan
backend/app/utils/permissions.py	Add verify_staff_access() dependency (checks role == 'staff' only) + add verify_team_lead() dependency
backend/app/middleware/audit_middleware.py	Add "/api/v1/staff" to MONITORED_PREFIXES for audit logging of staff mutations
backend/app/websocket/connection_manager.py	Add broadcast_to_staff() method alongside existing broadcast_to_admins()
backend/alembic/env.py	Import all new staff models so Alembic detects them
backend/requirements.txt	Add: pgvector, livekit-api, y-py, tiktoken, pywebpush, openpyxl, weasyprint
docker-compose.dev.yml	Change postgres image to pgvector/pgvector:pg16 + add LiveKit service
3. Database Schema Summary
Migration 003: Staff Core (staff_profiles, staff_teams)
staff_profiles: user_id (FK unique), department, position, employee_id, specializations (JSONB), view_mode, custom_layout (JSONB), team_id (FK), is_department_lead, hired_at
staff_teams: name, department, lead_id (FK), description, is_active
Migration 004: Tickets & SLA
staff_tickets: ticket_number (auto TK-YYYY-NNNN), subject, description, category, priority, status, reporter_id, assigned_to, sla_policy_id (FK), sla_deadline, sla_breached, first_response_at, resolved_at, csat_score
staff_ticket_messages: ticket_id (FK), author_id, content, is_internal (staff notes vs visible), attachments (JSONB)
sla_policies: name, priority, category, first_response_minutes, resolution_minutes, escalation_chain (JSONB array of levels), breach_notification (JSONB)
sla_escalations: ticket_id, level, escalated_to, reason, acknowledged_at
Migration 005: Content & Assessments
staff_content_items: title, content_type, body, body_json (TipTap JSON), status (draft/review/approved/published), author_id, course_id, cbc_tags (JSONB), version
staff_content_versions: content_id, version_number, body_snapshot (JSONB), changes_summary, created_by
staff_collab_sessions: content_id, yjs_doc_id, participants (JSONB), is_active
adaptive_assessments: title, assessment_type, adaptive_config (JSONB with initial_difficulty, step_up_threshold), rubric (JSONB), is_ai_graded
assessment_questions: assessment_id, question_text, question_type (mcq/short_answer/essay/fill_blank/matching/ordering), difficulty (1-5), adaptive_paths (JSONB), ai_grading_prompt
cbc_competencies: code (e.g. "MATH.G4.NS.01"), name, learning_area, strand, sub_strand, grade_level, keywords (JSONB) - ~800 rows seeded
Migration 006: Knowledge Base
kb_articles: title, slug, body, category_id, tags, status, author_id, view_count, helpful_count, is_internal
kb_categories: name, slug, parent_id (self-referential), sort_order
kb_embeddings: article_id, chunk_text, chunk_index, embedding (VECTOR(1536)), with HNSW index
Migration 007: Live Sessions
live_sessions: title, host_id, session_type, room_name (LiveKit), status, max_participants (30), scheduled_at, recording_enabled
live_session_recordings: session_id, recording_url, duration_seconds, file_size_bytes
breakout_rooms: session_id, name, participants (JSONB)
Migration 008: Reports
staff_report_definitions: name, report_type, config (JSONB with widgets array), filters, created_by, is_template, is_shared
staff_report_schedules: report_id, schedule_cron, format (csv/excel/pdf), recipients (JSONB), next_run_at
Migration 009: Notifications
staff_push_subscriptions: user_id, endpoint, p256dh_key, auth_key, is_active
staff_notification_preferences: user_id (unique), channels (JSONB), digest_frequency, quiet_hours (JSONB), categories (JSONB)
Migration 010: Collaboration
yjs_documents: doc_id, content_id, doc_state (BYTEA), version, last_updated_by
4. Key Implementation Details
4A. Staff Sidebar (mirrors AdminSidebar exactly)
Pattern source: frontend/src/components/admin/sidebar/AdminSidebar.tsx
7 collapsible sections with Lucide icons (LayoutDashboard, Shield, Heart, Wrench, BarChart3, UsersRound, User)
Badge counts from useStaffStore().counters (openTickets, moderationQueue, unreadNotifications, slaAtRisk)
Active state: red (#E40000) text + left border, route matching via location.pathname.startsWith(path)
Global search bar with Ctrl+K
Mobile: fixed overlay, closes on route change
4B. Staff Store (Zustand)
Pattern source: frontend/src/store/adminStore.ts
State: sidebarCollapsed, globalSearch, activeSection, openSidebarSections (persisted), viewMode ('teacher_focus'|'operations_focus'|'custom'), counters (WebSocket-updated), staffNotifications, unreadCount
Actions: toggle sidebar sections, update/increment/decrement counters, notification CRUD, setViewMode
4C. Permission System Extension
File: backend/app/utils/permissions.py
Add verify_staff_access(): checks role == 'staff' (staff-only endpoints, unlike verify_admin_access() which allows both)
Add verify_team_lead(): checks staff_profiles.is_department_lead == True for team pulse access
Seed ~15 new staff-specific permissions in migration 003 (staff.dashboard.read, staff.tickets.manage, staff.content.approve, etc.)
4D. SLA Engine
Location: backend/app/services/staff/sla_engine.py
On ticket creation: resolve matching SLA policy by (priority, category), compute sla_deadline
Background task: asyncio.create_task in lifespan, runs every 60 seconds
Checks: tickets where sla_deadline < now() AND sla_breached = FALSE → mark breached, execute escalation chain
Escalation chain: JSONB array [{level, after_minutes, notify: [user_ids], action}]
Notifications: WebSocket (ticket.sla_breached), Push API, email to escalation targets
4E. Adaptive Assessment Engine
Location: backend/app/services/staff/assessment_engine.py
Modified IRT: start at initial_difficulty (default 3), step up if correct ratio >= 0.8, step down on wrong
Question selection: random from unused questions at target difficulty, fallback to d +/- 1
AI grading: for essay/short_answer with is_ai_graded=True, send to orchestrator with rubric prompt
Performance prediction: aggregate student history, send to LLM for risk analysis
Final score: weighted by difficulty (d1=1x, d2=1.5x, d3=2x, d4=2.5x, d5=3x)
4F. LiveKit Integration
Docker: Add livekit/livekit-server:latest to docker-compose (ports 7880-7882)
Backend (session_service.py): Use livekit-api Python SDK for room CRUD, token generation with VideoGrants, recording management
Frontend (useLiveKit.ts hook): @livekit/components-react pre-built UI, custom LiveClassRoom.tsx wrapper with breakout rooms, screen share, recording controls
Supports 30 participants, SFU routing
4G. Knowledge Base with pgvector
Docker: Change postgres image to pgvector/pgvector:pg16
Embedding: On article create/update, split into 512-token chunks, generate embeddings via OpenAI ada-002 through orchestrator
Search: Cosine similarity via embedding <=> query_embedding, HNSW index for performance
AI suggestions: During ticket handling, embed ticket text → find similar KB articles → show to staff
4H. Collaborative Editing (Yjs + TipTap)
Backend: /ws/yjs/{doc_id}/{token} WebSocket endpoint, authenticates via JWT, syncs Yjs updates between peers, persists to yjs_documents every 5 seconds
Frontend: TipTapEditor.tsx with @tiptap/extension-collaboration + @tiptap/extension-collaboration-cursor, useYjsCollab.ts hook manages Y.Doc, WebsocketProvider, awareness (cursors, presence)
4I. Report Builder
Frontend: @dnd-kit/core for drag-and-drop widget placement on 12-column grid canvas
Widget types: metric_card, line_chart, bar_chart, pie_chart, data_table, text_block
Config stored as JSONB in staff_report_definitions.config
Backend export: WeasyPrint for PDF, openpyxl for Excel, csv module for CSV
Scheduling: Cron expressions, background task checks next_run_at, generates + emails report
4J. PWA / Offline Support
Service Worker (sw.ts): Workbox for precaching static assets, stale-while-revalidate for GET API calls
Offline queue: workbox-background-sync for POST/PUT/PATCH on: ticket replies, grade submissions, attendance, content drafts, notes
Frontend hook: useOfflineQueue.ts with idb-keyval for IndexedDB storage, sync status, queued action count badge
4K. Push Notifications
Backend: pywebpush library, VAPID keys in env
Frontend: Service Worker push event listener, usePushNotifications.ts hook for subscription management
Triggers: SLA breach, new ticket assigned, moderation item flagged, session starting, critical alerts
4L. View Toggle (Teacher Focus / Operations Focus)
Two preset layouts stored in staffStore.viewMode
Teacher Focus: Dashboard shows Content Studio, Assessment Builder, Student Progress, Sessions prominently
Operations Focus: Dashboard shows Tickets, Moderation Queue, Support Metrics, Platform Health
Custom: User-arranged widget grid saved to staff_profiles.custom_layout
Persisted to backend via PATCH /api/v1/staff/account/preferences
4M. AI Integration Points
All route through existing AIOrchestrator at backend/app/services/ai_orchestrator.py:

Feature	Model	Input	Output
AI-Prioritized Agenda	Gemini Pro	Pending tickets, tasks, deadlines	Ordered priority list with rationale
AI Auto-Grading	Claude/Gemini	Question + answer + rubric	Score, feedback, competency_met
Performance Prediction	Gemini Pro	Student assessment history	Risk score 0-1, risk factors, interventions
KB Suggestions	OpenAI ada-002 + pgvector	Ticket text	Top 5 similar KB articles
Content Quality Analysis	Claude	Content body + CBC tags	Quality score, issues, suggestions
Workload Balancing	Gemini Pro	Staff ticket/review counts	Imbalances, rebalancing suggestions
Risk Scoring (Safety)	Claude	Flagged content/behavior	Risk score, classification, recommended action
AI-Drafted Feedback	Claude	Submission + rubric	Pre-drafted feedback text for staff to edit/send
AI FAQ Updates	Gemini Pro	Recent resolved tickets	Suggested new FAQ articles
5. Implementation Order (dependency chain)
Database migrations (003-010) — all tables must exist first
Backend models (models/staff/) — ORM definitions for all tables
Backend permissions (extend permissions.py) — needed by all routes
Backend schemas (schemas/staff/) — request/response validation
Backend services (services/staff/) — business logic layer
Backend routes (api/v1/staff/) — API endpoints calling services
Backend WebSocket handlers — staff WS, Yjs WS, live chat WS
Backend main.py — register all routers + WebSocket endpoints + SLA background task
Seed scripts — seed_staff_data.py + seed_cbc_competencies.py
Frontend types (types/staff.ts) + fix types/index.ts User role
Frontend store (staffStore.ts)
Frontend services (services/staff/)
Frontend hooks (hooks/staff/)
Frontend shared components (components/staff/shared/)
Frontend sidebar (StaffSidebar.tsx)
Frontend domain components (content, assessment, tickets, live, reports, knowledge)
Frontend pages (all 30 pages in pages/staff/)
Frontend routing (App.tsx + DashboardLayout.tsx modifications)
Infrastructure (Docker: pgvector, LiveKit; PWA: Service Worker)
Tests (backend pytest → frontend Vitest → Playwright E2E)
6. Infrastructure Changes
Docker Compose Additions

# Change existing postgres service image:
postgres:
  image: pgvector/pgvector:pg16  # Was: postgres:16-alpine

# Add LiveKit service:
livekit:
  image: livekit/livekit-server:latest
  container_name: tuhs_livekit
  ports:
    - "7880:7880"
    - "7881:7881"
    - "7882:7882/udp"
  volumes:
    - ./livekit-config.yaml:/etc/livekit.yaml
  command: ["--config", "/etc/livekit.yaml"]
New Environment Variables (backend .env)

LIVEKIT_URL=http://localhost:7880
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_CLAIMS_EMAIL=admin@urbanhomeschool.co.ke
7. Seed Data Specification
seed_staff_data.py
Entity	Count	Details
Staff users	50+	15 teachers (varied subjects), 10 moderators, 8 support agents, 5 CBC specialists, 5 team leads, 4 coordinators, 3 ops staff — Kenyan names
Students	500+	Grades 1-9, enrollment histories, assessment results
Families	50	Parent-student links
Courses	100+	All CBC learning areas per grade, mix of statuses
Tickets	1000+	6 months, categories (billing 30%, technical 25%, content 20%, account 15%, safety 10%), ~10% SLA breached
Content items	200+	Lessons, quizzes, worksheets with version histories
KB articles	200+	With pre-generated pgvector embeddings
Assessments	50+	With question banks (5-30 questions each, difficulty 1-5)
Live sessions	100+ historical, 5 scheduled	Attendance data, recordings
SLA policies	4	One per priority level (critical: 1hr/4hr, high: 2hr/8hr, medium: 4hr/24hr, low: 8hr/48hr)
Analytics data	6 months	Daily metrics: ticket volumes, resolution times, content views
Staff teams	5	Content, Support, Academic, Operations, Quality
seed_cbc_competencies.py
~800 competencies from KICD CBC framework
Learning areas: Mathematics, English, Kiswahili, Science & Technology, Social Studies, CRE/IRE, Creative Arts, Music, Physical Education, Health Education
Organized: Learning Area → Grade (1-9) → Strand → Sub-Strand → Competency
Each with unique code (e.g., MATH.G4.NS.01)
8. Testing Strategy
Backend (pytest, target 80%+ coverage)

backend/tests/staff/
  api/
    test_staff_dashboard.py          # Dashboard endpoints
    test_staff_tickets.py            # Ticket CRUD, assignment, SLA
    test_staff_moderation.py         # Moderation queue operations
    test_staff_content.py            # Content CRUD, versioning
    test_staff_assessments.py        # Assessment + question bank CRUD
    test_staff_sessions.py           # Live session management
    test_staff_kb.py                 # KB CRUD, vector search
    test_staff_reports.py            # Report builder operations
    test_staff_team.py               # Team metrics, permission gating
    test_staff_account.py            # Profile, preferences
    test_staff_notifications.py      # Push, digest config
  services/
    test_sla_engine.py               # SLA calculation, escalation (freezegun for time)
    test_assessment_engine.py        # Adaptive selection, scoring, difficulty adjustment
    test_kb_search.py                # Vector similarity search
    test_ai_analysis.py              # AI service (mocked LLM responses)
    test_report_builder.py           # Report generation, export formats
  integration/
    test_ticket_lifecycle.py         # Create → assign → respond → resolve → close + SLA
    test_sla_escalation_flow.py      # SLA breach → escalation chain → notifications
    test_content_publish_flow.py     # Draft → review → approve → publish
    test_assessment_adaptive_flow.py # Student taking adaptive assessment E2E
Frontend (Vitest + React Testing Library)
Page tests: Verify rendering, data fetching, loading/error states
Component tests: StaffSidebar (navigation, badges, sections), StaffDataTable (pagination, sorting), SLAIndicator (countdown, breach), QuestionEditor (form validation)
Hook tests: useStaffWebSocket, useSLACountdown, useOfflineQueue
Store tests: staffStore actions, counter updates, view mode switching
Service tests: API calls with mocked fetch
E2E (Playwright)

e2e/staff/
  staff-login.spec.ts              # Login → dashboard access
  ticket-management.spec.ts        # Create, assign, respond, resolve
  content-review.spec.ts           # Review and approve content
  assessment-creation.spec.ts      # Create assessment with questions
  report-builder.spec.ts           # Build and export report
  navigation.spec.ts               # All sidebar links load correct pages
  responsive.spec.ts               # Mobile sidebar, responsive layouts
9. Verification Plan
Backend Verification

# Run migrations
cd backend && alembic upgrade head

# Seed data
python seed_cbc_competencies.py
python seed_staff_data.py

# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Verify endpoints in Swagger: http://localhost:8000/docs
# Check all /api/v1/staff/* routes appear and respond

# Run tests
pytest tests/staff/ -v --cov=app/services/staff --cov=app/api/v1/staff --cov-report=term-missing
Frontend Verification

cd frontend

# Install new dependencies
npm install

# Type check
npx tsc --noEmit

# Run tests
npx vitest run

# Start dev server
npm run dev

# Manual verification:
# 1. Login as staff user → redirects to /dashboard/staff
# 2. Verify StaffSidebar renders with all 7 sections
# 3. Navigate to each of the 30 pages → verify they load
# 4. Test Teacher Focus / Operations Focus view toggle
# 5. Verify badge counts update via WebSocket
# 6. Test offline: disconnect network → make actions → reconnect → verify sync
E2E Verification

npx playwright test e2e/staff/
Infrastructure Verification

# Verify pgvector
docker exec tuhs_postgres psql -U tuhs_user -d tuhs_db -c "SELECT extname FROM pg_extension WHERE extname = 'vector';"

# Verify LiveKit
curl http://localhost:7880

# Verify WebSocket endpoints
# Use wscat or browser DevTools to connect to /ws/staff/{token}