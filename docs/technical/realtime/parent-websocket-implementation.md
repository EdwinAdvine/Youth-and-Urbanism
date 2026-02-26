Parents Dashboard - Full Implementation Plan
Context
The Urban Home School platform needs a comprehensive Parents Dashboard - the primary interface for parents to monitor their children's learning, communicate with teachers/AI tutors, manage finances, and control privacy settings. The existing codebase has a basic DashboardParent.tsx welcome page, a ParentSidebar.tsx with navigation stubs, and 4 backend API endpoints for child linking/progress. This plan builds out all 8 sidebar sections into a fully functional, production-ready parent experience with real-time features, AI integration, M-Pesa payments, PDF reports, and cross-project 2FA.

Phase 1: Foundation - Database, Store, Sidebar, WebSocket, Seed Data
1.1 New Database Models
Create backend/app/models/parent/ directory with these tables:

parent_mood_entries - Daily mood/energy tracking

id (UUID PK), parent_id (FK users), child_id (FK students, nullable), emoji (String), energy_level (Integer 1-5), note (Text), recorded_date (Date), created_at
parent_family_goals - Family learning goals

id (UUID PK), parent_id (FK users), child_id (FK students, nullable), title, description, category (academic/behavioral/creative/health), target_date, progress_percentage, status (active/completed/paused/cancelled), is_ai_suggested, ai_metadata (JSONB), created_at, updated_at
parent_consent_records - Granular consent matrix

id (UUID PK), parent_id (FK users), child_id (FK students), data_type (String), recipient_type (String), consent_given (Boolean), granted_at, revoked_at, expires_at, reason, created_at, updated_at
parent_consent_audit_log - Consent change audit trail

id (UUID PK), consent_record_id (FK consent_records), action (granted/revoked/updated/expired), performed_by (FK users), old_value, new_value, ip_address, user_agent, created_at
parent_messages - Real-time messaging

id (UUID PK), conversation_id (UUID indexed), sender_id (FK users), recipient_id (FK users, nullable), channel (ai_tutor/teacher/family/support), child_id (FK students, nullable), content (Text), message_type (text/image/file/system), is_read, read_at, metadata_ (JSONB), created_at
parent_ai_alerts - AI-generated warnings/insights

id (UUID PK), parent_id (FK users), child_id (FK students), alert_type (engagement_drop/performance_decline/milestone_reached/etc), severity (info/warning/critical), title, message, ai_recommendation, is_read, is_dismissed, action_url, metadata_ (JSONB), created_at
parent_notification_preferences - Per-child notification controls

id (UUID PK), parent_id (FK users), child_id (FK students, nullable), notification_type, channel_email, channel_sms, channel_push, channel_in_app, severity_threshold, is_enabled, created_at, updated_at
parent_reports - Generated reports

id (UUID PK), parent_id (FK users), child_id (FK students), report_type (weekly/monthly/term/transcript/portfolio), title, period_start, period_end, data (JSONB), ai_summary, ai_projections (JSONB), pdf_url, status (generating/ready/archived), created_at
user_two_factor_auth - 2FA config (cross-cutting, all roles)

id (UUID PK), user_id (FK users UNIQUE), totp_secret (encrypted), totp_enabled, sms_enabled, sms_phone, email_enabled, email_address, backup_codes (JSONB hashed), recovery_email, last_used_at, created_at, updated_at
user_login_history - Login audit (cross-cutting, all roles)

id (UUID PK), user_id (FK users), ip_address, user_agent, device_info (JSONB), location, login_at, success, failure_reason
1.2 Alembic Migration
Create migration adding all tables above
Register models in backend/app/models/parent/__init__.py and backend/app/models/__init__.py
Update backend/alembic/env.py with parent model imports
1.3 Parent Zustand Store
New file: frontend/src/store/parentStore.ts (follow staffStore.ts pattern)


ParentState:
  selectedChildId: string | null
  children: ChildSummary[]
  counters: { unreadMessages, unreadAlerts, pendingConsents, upcomingDeadlines, newAchievements, newReports }
  sidebarCollapsed: boolean
  openSidebarSections: string[]
  parentNotifications: ParentNotification[]
  unreadCount: number
  Actions: setSelectedChild, setChildren, updateCounters, incrementCounter, decrementCounter,
           toggleSidebarSection, addNotification, markNotificationRead, markAllRead, etc.
  Persist: sidebarCollapsed, openSidebarSections, selectedChildId
1.4 Parent Types
New file: frontend/src/types/parent.ts

ChildSummary, ChildDetailProgress, MoodEntry, FamilyGoal, ConsentRecord, ConsentAuditEntry, ParentMessage, Conversation, AIAlert, NotificationPreference, ParentReport, TwoFactorConfig, LoginHistoryEntry, ParentRealtimeCounters, ParentNotification
1.5 Sidebar Redesign
Rewrite: frontend/src/components/parent/ParentSidebar.tsx (borrow AdminSidebar pattern)

Store-driven counters from useParentStore
Global child selector dropdown at top
UPPERCASE section headers
Badge counters on Communications, Alerts, Reports
8 collapsible sections matching the spec
Update DashboardLayout.tsx import if path changes
1.6 WebSocket
New: backend/app/websocket/parent_connection_manager.py - ParentConnectionManager class (follow existing connection_manager.py)
New endpoint in backend/app/main.py: @app.websocket("/ws/parent/{token}")
New: frontend/src/hooks/useParentWebSocket.ts - Connect, parse messages, dispatch to parentStore

1.7 Seed Data
New: backend/seed_parent_data.py

1 parent user + 4 children (ECD 2, Grade 3, Grade 6, Grade 8)
Each child: 3-4 course enrollments, AI tutor with history, assessments, certificates
30 days of mood entries, family goals, AI alerts, messages, consent records, reports, payment history
Phase 2: Dashboard Home (Section 1)
Backend
New router: backend/app/api/v1/parent/dashboard.py

Method	Path	Purpose
GET	/parent/dashboard/overview	All children status, today's activity
GET	/parent/dashboard/highlights	AI-generated today's highlights
GET	/parent/dashboard/urgent	Upcoming deadlines, low engagement, pending consents
POST	/parent/dashboard/mood	Record emoji mood entry
GET	/parent/dashboard/mood/history	Mood history (date range)
GET	/parent/dashboard/ai-summary	AI weekly family forecast & tips
New: backend/app/services/parent/dashboard_service.py
New: backend/app/schemas/parent/dashboard_schemas.py

Frontend
New: frontend/src/pages/parent/ParentDashboardHome.tsx - Route: /dashboard/parent

Replace existing DashboardParent.tsx
Child quick-status cards grid
Urgent items banner
Today's highlights (AI-generated)
Emoji mood input row + energy slider
AI Family Summary card with Recharts sparkline
New: frontend/src/services/parentDashboardService.ts

Phase 3: My Children (Section 2)
Backend
New router: backend/app/api/v1/parent/children.py (enhance existing parents.py)

Method	Path	Purpose
GET	/parent/children	List all children (enriched)
GET	/parent/children/{id}	Full child profile
GET	/parent/children/{id}/learning-journey	Focus areas, weekly narrative, CBC data
GET	/parent/children/{id}/cbc-competencies	CBC radar data (7 competencies)
GET	/parent/children/{id}/activity	Daily/weekly activity stats
GET	/parent/children/{id}/activity/feed	Real-time activity feed
GET	/parent/children/{id}/achievements	Certificates, badges, timeline
GET	/parent/children/{id}/goals	Family goals
POST	/parent/children/{id}/goals	Create goal
PUT	/parent/children/{id}/goals/{gid}	Update goal
DELETE	/parent/children/{id}/goals/{gid}	Delete goal
GET	/parent/children/{id}/ai-pathways	AI predictive pathways
New: backend/app/services/parent/children_service.py
New: backend/app/schemas/parent/children_schemas.py

Frontend
New: frontend/src/pages/parent/ChildrenOverviewPage.tsx - Route: /dashboard/parent/children
New: frontend/src/pages/parent/ChildDetailPage.tsx - Route: /dashboard/parent/children/:childId (tabbed: Learning, Activity, Achievements, Goals)

New components in frontend/src/components/parent/children/:

CBCRadarChart.tsx (Recharts RadarChart for 7 CBC competencies)
ActivityTimeline.tsx (Recharts AreaChart for time/sessions)
StreakTracker.tsx (visual streak display)
AchievementGallery.tsx (certificates, badges, growth timeline)
GoalManager.tsx (CRUD goals with progress bars)
New: frontend/src/components/parent/ChildSelector.tsx - Reusable global child selector
New: frontend/src/services/parentChildrenService.ts

Phase 4: AI Companion Insights (Section 3)
Backend
New router: backend/app/api/v1/parent/ai_insights.py

Method	Path	Purpose
GET	/parent/ai/summary/{child_id}	AI tutor summary
GET	/parent/ai/learning-style/{child_id}	Learning style analysis
GET	/parent/ai/support-tips/{child_id}	Practical home support tips
GET	/parent/ai/planning/{child_id}	Topics AI is planning next
GET	/parent/ai/patterns/{child_id}	Curiosity patterns
GET	/parent/ai/warnings/{child_id}	Early warning signs
GET	/parent/ai/alerts	All alerts (paginated, filterable)
PUT	/parent/ai/alerts/{id}/read	Mark alert read
PUT	/parent/ai/alerts/{id}/dismiss	Dismiss alert
GET	/parent/ai/coaching/{child_id}	AI parent coaching content
New: backend/app/services/parent/ai_insights_service.py - Calls AI Orchestrator with child data
New: backend/app/schemas/parent/ai_insights_schemas.py

Frontend
New pages:

AIInsightsPage.tsx - Route: /dashboard/parent/ai/summary (tabs per child)
AILearningStylePage.tsx - Route: /dashboard/parent/ai/learning-style
AISupportTipsPage.tsx - Route: /dashboard/parent/ai/support-tips
AIPlanningPage.tsx - Route: /dashboard/parent/ai/planning
AIPatternsPage.tsx - Route: /dashboard/parent/ai/patterns
AIWarningsPage.tsx - Route: /dashboard/parent/ai/warnings
New components: frontend/src/components/parent/ai/

AlertCard.tsx, InsightCard.tsx
New: frontend/src/services/parentAIService.ts

Phase 5: Communications (Section 4)
Backend
New routers:

backend/app/api/v1/parent/notifications.py:
| GET | /parent/notifications | Smart inbox (paginated, filterable) |
| PUT | /parent/notifications/{id}/read | Mark read |
| PUT | /parent/notifications/read-all | Mark all read |
| GET | /parent/notifications/counts | Unread counts by type |

backend/app/api/v1/parent/messages.py:
| GET | /parent/messages/conversations | List conversations |
| GET | /parent/messages/conversations/{id} | Messages in conversation |
| POST | /parent/messages/send | Send message (REST fallback) |
| PUT | /parent/messages/{id}/read | Mark message read |

backend/app/api/v1/parent/support.py:
| GET | /parent/support/articles | Help articles |
| POST | /parent/support/tickets | Create ticket |
| GET | /parent/support/tickets | List tickets |
| POST | /parent/support/tickets/{id}/messages | Add ticket message |

WebSocket handles: real-time message delivery, typing indicators, read receipts

Frontend
New pages:

NotificationsInboxPage.tsx - Route: /dashboard/parent/communications/inbox
MessagesPage.tsx - Route: /dashboard/parent/messages/* (WhatsApp-style)
SupportPage.tsx - Route: /dashboard/parent/support/*
New components: frontend/src/components/parent/messages/

ChatPanel.tsx, ConversationList.tsx, MessageBubble.tsx
New: frontend/src/hooks/useParentChat.ts - WebSocket-based real-time chat hook
New: frontend/src/services/parentMessagingService.ts

Phase 6: Finance & Plans (Section 5)
Backend
New router: backend/app/api/v1/parent/finance.py
| GET | /parent/finance/subscription | Current plan status |
| GET | /parent/finance/plans | Available plans |
| POST | /parent/finance/subscription/change | Upgrade/downgrade |
| POST | /parent/finance/subscription/pause | Pause subscription |
| POST | /parent/finance/subscription/resume | Resume subscription |
| GET | /parent/finance/history | Payment history |
| GET | /parent/finance/history/{id}/receipt | Download receipt PDF |
| GET | /parent/finance/addons | Available add-ons |
| POST | /parent/finance/addons/purchase | Purchase add-on |

New: backend/app/api/v1/parent/mpesa.py - M-Pesa Daraja sandbox
| POST | /parent/mpesa/stk-push | Initiate STK push |
| POST | /parent/mpesa/callback | M-Pesa callback (public) |
| GET | /parent/mpesa/status/{checkout_id} | Check payment status |

New: backend/app/services/parent/mpesa_service.py - Daraja sandbox integration
New: backend/app/services/parent/finance_service.py
Add to backend/app/config.py: mpesa_consumer_key, mpesa_consumer_secret, mpesa_shortcode, mpesa_passkey, mpesa_callback_url, mpesa_environment

Frontend
New pages:

SubscriptionPage.tsx - Route: /dashboard/parent/finance/plan/*
PaymentHistoryPage.tsx - Route: /dashboard/parent/finance/history
ManageSubscriptionPage.tsx - Route: /dashboard/parent/finance/subscription/*
AddonsPage.tsx - Route: /dashboard/parent/finance/addons/*
New components: frontend/src/components/parent/finance/

MpesaPaymentModal.tsx (STK push flow UI)
PlanComparisonTable.tsx
ReceiptCard.tsx
New: frontend/src/services/parentFinanceService.ts

Phase 7: Reports & Documents (Section 6)
Backend
New router: backend/app/api/v1/parent/reports.py
| GET | /parent/reports | List reports (filterable) |
| GET | /parent/reports/{id} | Full report data |
| POST | /parent/reports/generate | Generate new report |
| GET | /parent/reports/{id}/pdf | Download PDF |
| GET | /parent/reports/term-summary/{child_id} | Term progress |
| GET | /parent/reports/transcript/{child_id} | Official transcript |
| POST | /parent/reports/portfolio/export | Export portfolio (zip) |
| GET | /parent/reports/portfolio/status/{job_id} | Check export status |
| GET | /parent/reports/portfolio/download/{job_id} | Download zip |

New: backend/app/services/parent/report_service.py - PDF generation (WeasyPrint), zip portfolio, AI narrative generation, predictive projections
New: backend/app/schemas/parent/report_schemas.py

Frontend
New pages:

ReportsPage.tsx - Route: /dashboard/parent/reports/*
ReportDetailPage.tsx - Route: /dashboard/parent/reports/:reportId
TermSummaryPage.tsx - Route: /dashboard/parent/reports/term-summary
TranscriptPage.tsx - Route: /dashboard/parent/reports/transcripts
PortfolioExportPage.tsx - Route: /dashboard/parent/reports/portfolio
New components: frontend/src/components/parent/reports/

ProgressChart.tsx (Recharts LineChart)
CompetencyBarChart.tsx (Recharts BarChart)
EngagementTrend.tsx (Recharts AreaChart)
AIProjectionCard.tsx
New: frontend/src/services/parentReportService.ts

Phase 8: Settings & Controls (Section 7)
Backend
New router: backend/app/api/v1/parent/settings.py
| GET/PUT | /parent/settings/consent | Consent matrix CRUD |
| GET | /parent/settings/consent/audit | Audit trail |
| GET/PUT | /parent/settings/notifications | Notification preferences |
| GET/PUT | /parent/settings/profile | Parent profile |
| GET | /parent/settings/family | Family members |
| POST | /parent/settings/family/invite | Invite co-parent/guardian |
| DELETE | /parent/settings/family/{id} | Remove member |
| PUT | /parent/settings/family/{id}/rights | Update viewing rights |
| GET | /parent/settings/privacy/shared-data | Data sharing overview |
| POST | /parent/settings/privacy/data-request | GDPR/DPA data request |
| PUT | /parent/settings/security/password | Change password |
| GET | /parent/settings/security/login-history | Login history |

New: backend/app/services/parent/settings_service.py
New: backend/app/schemas/parent/settings_schemas.py

Frontend
New pages:

ConsentManagementPage.tsx - Route: /dashboard/parent/settings/consent/*
NotificationPreferencesPage.tsx - Route: /dashboard/parent/settings/notifications/*
ParentProfilePage.tsx - Route: /dashboard/parent/settings/profile/*
FamilyMembersPage.tsx - Route: /dashboard/parent/settings/family/*
PrivacyPage.tsx - Route: /dashboard/parent/settings/privacy/*
SecurityPage.tsx - Route: /dashboard/parent/settings/security/*
New components: frontend/src/components/parent/settings/

ConsentMatrix.tsx (interactive grid: rows = data types, cols = recipients, cells = toggle per child)
ConsentAuditLog.tsx (audit trail table)
New: frontend/src/services/parentSettingsService.ts

Phase 9: 2FA System (Cross-cutting, All Roles)
Backend
New router: backend/app/api/v1/auth_2fa.py (not parent-specific)
| POST | /auth/2fa/totp/setup | Generate TOTP secret + QR |
| POST | /auth/2fa/totp/verify | Verify & enable TOTP |
| POST | /auth/2fa/totp/disable | Disable TOTP |
| POST | /auth/2fa/sms/setup | Set SMS phone |
| POST | /auth/2fa/sms/send | Send SMS code |
| POST | /auth/2fa/sms/verify | Verify SMS code |
| POST | /auth/2fa/email/setup | Set 2FA email |
| POST | /auth/2fa/email/send | Send email code |
| POST | /auth/2fa/email/verify | Verify email code |
| GET | /auth/2fa/status | Current 2FA status |
| POST | /auth/2fa/backup-codes/generate | Generate backup codes |
| POST | /auth/2fa/backup-codes/verify | Verify backup code |

Modify: backend/app/api/v1/auth.py - Add 2FA check to login flow (return requires_2fa: true + temp token)
New: backend/app/services/two_factor_service.py - pyotp for TOTP, SMS gateway, email sender
New: backend/app/schemas/auth_2fa_schemas.py

Frontend
New: frontend/src/pages/parent/TwoFactorSetupPage.tsx - Route: /dashboard/parent/settings/security/2fa
New shared components: frontend/src/components/auth/

TwoFactorSetup.tsx (QR code, code input, backup codes)
TwoFactorVerify.tsx (2FA step in login flow)
BackupCodesDisplay.tsx
Modify: frontend/src/services/authService.ts - Handle requires_2fa response
New: frontend/src/services/twoFactorService.ts

Phase 10: Integration, Polish, Testing
Route Registration
Modify: backend/app/main.py - Register all new parent routers + 2FA router + parent WebSocket endpoint
Modify: frontend/src/App.tsx - Add ~25 lazy-loaded parent routes under /dashboard/parent/*

Install Dependencies
Frontend: npm install recharts (charts library)
Backend: pip install pyotp weasyprint qrcode[pil] (2FA, PDF generation, QR codes)

Backend Tests (backend/tests/parent/)
test_parent_dashboard.py, test_parent_children.py, test_parent_ai_insights.py
test_parent_messages.py, test_parent_finance.py, test_parent_reports.py
test_parent_settings.py, test_2fa.py
Frontend Tests (frontend/src/tests/parent/)
Component tests, store tests, service tests (mocked API)
Key Files to Modify (Existing)
File	Change
backend/app/models/__init__.py	Add parent model imports
backend/alembic/env.py	Add parent model imports
backend/app/main.py	Register parent routers + WebSocket endpoint
backend/app/config.py	Add M-Pesa config settings
backend/app/api/v1/auth.py	Add 2FA check to login
frontend/src/App.tsx	Add ~25 parent routes (lazy-loaded)
frontend/src/store/index.ts	Export useParentStore
frontend/src/components/layout/DashboardLayout.tsx	Update ParentSidebar import
frontend/src/services/authService.ts	Handle 2FA in login flow
Key Files to Reuse (Existing Patterns)
Pattern Source	Reuse For
frontend/src/store/staffStore.ts	parentStore.ts structure
frontend/src/components/admin/sidebar/AdminSidebar.tsx	ParentSidebar redesign
backend/app/websocket/connection_manager.py	parent_connection_manager.py
backend/app/services/parent_service.py	Extend for children service
backend/app/services/ai_orchestrator.py	AI insight generation
frontend/src/services/api.ts	All new frontend services
Estimated Scope
~126 new files across backend and frontend
~9 existing files modified
10 new database tables (8 parent-specific + 2 cross-cutting)
~50 new API endpoints
~25 new frontend pages
1 Alembic migration
Verification
Run alembic upgrade head - all new tables created
Run python seed_parent_data.py - demo data populated
Start backend (python main.py) - all routers registered, WebSocket endpoint active
Start frontend (npm run dev) - login as parent, all sidebar sections navigate to working pages
Run pytest backend/tests/parent/ - all backend tests pass
Verify WebSocket: messages appear in real-time between parent and AI tutor
Verify M-Pesa: STK push simulation completes in sandbox mode
Verify PDF: download a weekly report as PDF
Verify 2FA: enable TOTP, login requires authenticator code
Verify consent matrix: toggle consent, check audit log records changes