Student Dashboard - Full Implementation Plan
Context
The student dashboard currently uses the default Sidebar.tsx component and a single DashboardStudent.tsx page. Every other role (admin, staff, instructor, parent, partner) already has a dedicated sidebar, store, pages, services, and backend APIs. This plan brings the student experience to the same level with 9 major sections, real AI integration, full-stack implementation, and cross-cutting infrastructure (i18n, PWA, Socket.IO, Chart.js, age-adaptive UI, gamification, WCAG 2.1 AA).

Design Decisions Summary
Decision	Choice
Target age	All ages 6-17, adaptive UI by grade + manual override
Sidebar	New StudentSidebar.tsx, collapsible + mobile drawer, accordion sub-nav
AI integration	Real (existing orchestrator)
Teacher collab	Full integration with instructor dashboard
Payments	Paystack (cards) + M-Pesa Daraja API
Design style	Adaptive by age (gamified young, clean teens)
Community	Full social platform
Voice mode	Full voice chat (ElevenLabs TTS + browser STT)
Daily plan	AI-suggested, editable (drag-and-drop)
Time-adaptive	Yes, fully adaptive (morning/afternoon/evening)
Charts	Chart.js (radar, line, progress rings, heatmaps)
Backend	Full-stack together per section
Mood tracking	Simple emoji + optional note
Notifications	Full real-time (bell + badge + Socket.IO)
Course browse	Full marketplace
Live sessions	Custom WebRTC (video, audio, screen share, recording, whiteboard, hand raise)
File uploads	Full media, server disk now, cloud later
Privacy	COPPA-compliant
Support	Full live chat + AI chatbot + tickets
PWA	Full (offline, sync, push notifications)
Real-time	Socket.IO
Age detection	Grade level mapping + manual override
Gamification	Full RPG-style (XP, levels, skill trees, streaks, badges, leaderboards)
Parent reports	All channels (auto + share + email/SMS)
UI components	Tailwind only (no component library)
i18n	react-i18next from day one, English first
Mood check-in	Login modal + dashboard widget + AI awareness
Accessibility	Full WCAG 2.1 AA
Build order	As listed in spec
Phase 0: Infrastructure Setup
0A: Install new npm packages

# Frontend
npm install chart.js react-chartjs-2    # Charts
npm install socket.io-client            # Real-time
npm install i18next react-i18next       # i18n
npm install vite-plugin-pwa workbox-window  # PWA
npm install @anthropic-ai/sdk           # (if needed for voice)

# Backend
pip install python-socketio             # Socket.IO server
pip install paystack                    # Paystack payments
0B: i18n setup
New files:

frontend/src/i18n/index.ts - i18next initialization
frontend/src/i18n/locales/en.json - English translations
frontend/src/i18n/locales/sw.json - Swahili placeholder
Modify: frontend/src/main.tsx - import i18n initialization

0C: PWA setup
New files:

frontend/public/manifest.json - PWA manifest
frontend/src/sw.ts - Service worker with workbox
frontend/public/icons/ - App icons (192x192, 512x512)
Modify: frontend/vite.config.ts - add VitePWA plugin

0D: Socket.IO integration
New files:

frontend/src/hooks/useStudentWebSocket.ts - Student WebSocket hook (pattern from useStaffWebSocket.ts)
backend/app/websocket/student_ws.py - Student WebSocket endpoint
Modify: backend/main.py - register student WebSocket route

0E: Age-adaptive theme system
New files:

frontend/src/hooks/useAgeAdaptiveUI.ts - Hook that returns age group (young | tween | teen) from grade level or override
frontend/src/contexts/AgeThemeContext.tsx - Context provider for age-adaptive styling
frontend/src/styles/age-themes.ts - Theme config per age group (font sizes, border radius, colors, animation intensity)
0F: Chart.js setup
New files:

frontend/src/components/student/charts/ChartConfig.ts - Chart.js defaults & registration
frontend/src/components/student/charts/RadarChart.tsx
frontend/src/components/student/charts/ProgressRing.tsx
frontend/src/components/student/charts/LineChart.tsx
frontend/src/components/student/charts/HeatmapChart.tsx
Phase 1: Student Sidebar + Store + Types + Routing
1A: Student types
New file: frontend/src/types/student.ts


- StudentDashboard, DailyPlan, DailyPlanItem
- MoodEntry, MoodType (happy/okay/tired/frustrated/excited)
- Streak, Achievement, Badge, XPEvent, Level
- LearningGoal, HabitTracker
- StudyGroup, FriendRequest, Shoutout
- TeacherMessage, TeacherCollaboration
- SupportTicket, SupportChat
- Subscription, Receipt
- StudentPreferences (age_ui_mode, ai_personality, etc.)
- NotificationItem, NotificationCategory
- ProjectUpload, PeerGalleryItem
- SkillNode, SkillTree
- LiveSessionStudent, SessionRecording
- Wishlist, CourseReview
1B: Student Zustand store
New file: frontend/src/store/studentStore.ts
Follow pattern from staffStore.ts:

Sidebar section toggle state (openSidebarSections)
Counter badges (unreadNotifications, pendingAssignments, upcomingQuizzes, dueSoonCount, unreadMessages, friendRequests)
Mood state (currentMood, lastCheckIn)
Streak state (currentStreak, longestStreak)
Gamification (xp, level, recentBadges)
Daily plan items
Real-time notification state
Persist with localStorage
1C: StudentSidebar component
New file: frontend/src/components/student/sidebar/StudentSidebar.tsx

Based on existing Sidebar.tsx (which already has the full nav structure at lines 167-900) but enhanced with:

Collapsible mode (icon-only on collapse, full on expand)
Mobile drawer with overlay (existing pattern)
Badge counters from useStudentStore
Age-adaptive styling via useAgeAdaptiveUI
Section icons matching spec (Home, Robot, Book, Puzzle, Chart, Group, Card, Tools, User)
"New" badges on teacher collaboration items
Active route highlighting (red #E40000 pattern)
Modify: frontend/src/components/layout/DashboardLayout.tsx

Import StudentSidebar
Change line 112-118: replace default <Sidebar /> with <StudentSidebar />
1D: Route registration
Modify: frontend/src/App.tsx

Add ~50 lazy-loaded student page routes under /dashboard/student/*:


/dashboard/student                        → StudentDashboardHome
/dashboard/student/today/ai-plan          → AIPlanPage
/dashboard/student/today/streak           → StreakPage
/dashboard/student/today/mood             → MoodCheckPage
/dashboard/student/today/urgent           → UrgentItemsPage
/dashboard/student/today/quote            → DailyQuotePage
/dashboard/student/ai-tutor/chat          → AITutorChatPage
/dashboard/student/ai-tutor/learning-path → LearningPathPage
/dashboard/student/ai-tutor/voice         → VoiceModePage
/dashboard/student/ai-tutor/journal       → AIJournalPage
/dashboard/student/ai-tutor/explain       → HelpMeUnderstandPage
/dashboard/student/ai-tutor/teacher-collab → TeacherCollabPage
/dashboard/student/courses/enrolled       → EnrolledCoursesPage
/dashboard/student/courses/ai-recommended → AIRecommendedPage
/dashboard/student/browse/*               → BrowsePages (marketplace)
/dashboard/student/live/*                 → LiveSessionPages
/dashboard/student/practice/challenges    → TodaysChallengesPage
/dashboard/student/assignments/*          → AssignmentPages
/dashboard/student/quizzes/*              → QuizPages
/dashboard/student/projects/*             → ProjectPages
/dashboard/student/achievements/*         → AchievementPages
/dashboard/student/learning-map/*         → LearningMapPages
/dashboard/student/reports/*              → ReportPages
/dashboard/student/goals/*                → GoalPages
/dashboard/student/community/*            → CommunityPages
/dashboard/student/wallet/*               → WalletPages
/dashboard/student/support/*              → SupportPages
/dashboard/student/notifications/*        → NotificationPages
/dashboard/student/profile/*              → ProfilePages
/dashboard/student/preferences/*          → PreferencesPages
/dashboard/student/privacy                → PrivacyPage
All wrapped with <ProtectedRoute allowedRoles={['student']}> and <Suspense>.

1E: Student API service
New file: frontend/src/services/student/studentDashboardService.ts

API calls for dashboard data, daily plan, mood, streaks, notifications
Pattern from existing staffDashboardService.ts
New file: frontend/src/services/student/studentAIService.ts

Chat, voice, journal, learning path, explain endpoints
New file: frontend/src/services/student/studentCommunityService.ts

Friends, forums, shoutouts, study groups
New file: frontend/src/services/student/studentGamificationService.ts

XP, badges, achievements, leaderboard, skill tree
Phase 2: Dashboard Home (Section 1)
Backend
New files:

backend/app/api/v1/student/dashboard.py - Dashboard API routes

GET /student/dashboard/today - Daily plan, streak, mood, urgents, quote
POST /student/dashboard/mood - Submit mood check-in
GET /student/dashboard/teacher-sync - Teacher notes for daily plan
GET /student/dashboard/quote - Daily quote/micro-lesson
backend/app/services/student/dashboard_service.py

Generate time-adaptive dashboard data (morning/afternoon/evening)
AI daily plan generation via orchestrator
Streak calculation
Urgent item aggregation
New models (migration):

student_mood_entries - mood_type, energy_level, note, timestamp, student_id
student_streaks - current_streak, longest_streak, last_activity_date, streak_shields
student_daily_plans - date, items (JSONB), ai_generated, manually_edited
Frontend
New pages in frontend/src/pages/student/:

StudentDashboardHome.tsx - Main dashboard with time-adaptive greeting, stats cards, daily plan widget, mood widget, streak display, urgent items, daily quote
AIPlanPage.tsx - Full daily plan view with drag-and-drop (@dnd-kit)
StreakPage.tsx - Streak details, history, streak shields
MoodCheckPage.tsx - Mood history, trends
UrgentItemsPage.tsx - All urgent/overdue items
DailyQuotePage.tsx - Quote archive, micro-lessons
New components in frontend/src/components/student/dashboard/:

MoodCheckInModal.tsx - Login modal with emoji selection
MoodWidget.tsx - Inline dashboard mood widget
StreakDisplay.tsx - Current streak with flame animation
DailyPlanWidget.tsx - Draggable daily plan (uses @dnd-kit)
TimeAdaptiveGreeting.tsx - Morning/afternoon/evening greeting
UrgentItemsCard.tsx - Urgent items summary
DailyQuoteCard.tsx - Quote/micro-lesson card
TeacherSyncCard.tsx - Teacher notes integrated in plan
StudentStatsCards.tsx - Updated stats cards for student
Phase 3: My AI Tutor (Section 2)
Backend
New/Modify:

backend/app/api/v1/student/ai_tutor.py - Enhanced AI tutor routes

POST /student/ai/chat - Chat with AI (uses existing orchestrator)
GET /student/ai/learning-path - Get AI daily learning path
PUT /student/ai/learning-path - Edit learning path
POST /student/ai/voice - Voice mode (ElevenLabs TTS)
POST /student/ai/voice/stt - Speech-to-text
GET /student/ai/journal - Get journal entries
POST /student/ai/journal - Create journal entry with mood
POST /student/ai/explain - Help me understand endpoint
POST /student/ai/teacher-question - Send question to teacher via AI
GET /student/ai/teacher-responses - AI-summarized teacher responses
backend/app/services/student/ai_tutor_service.py

Wraps existing ai_orchestrator.py
Adds student context (grade, learning style, mood)
Learning path generation with AI
Journal analysis and insights
Teacher question routing
New model:

student_journal_entries - content, mood_tag, ai_insights (JSONB), reflection_prompts, student_id
Frontend
New pages:

AITutorChatPage.tsx - Full chat interface (reuse patterns from bird-chat/)
LearningPathPage.tsx - AI daily plan with edit/drag
VoiceModePage.tsx - Voice interface (record button, waveform, TTS playback)
AIJournalPage.tsx - Journal entries list, create new with mood tag
HelpMeUnderstandPage.tsx - Simplified AI explainer interface
TeacherCollabPage.tsx - Send questions to teacher, view responses
New components:

frontend/src/components/student/ai/ChatInterface.tsx - Rich chat with markdown, code blocks
frontend/src/components/student/ai/VoiceRecorder.tsx - Browser STT recording
frontend/src/components/student/ai/VoicePlayer.tsx - ElevenLabs TTS playback
frontend/src/components/student/ai/JournalEntry.tsx - Single journal entry card
frontend/src/components/student/ai/TeacherQuestionForm.tsx - Question to teacher form
Phase 4: Learning (Section 3)
Backend
New:

backend/app/api/v1/student/learning.py

GET /student/courses/enrolled - Enrolled courses with progress
GET /student/courses/ai-recommended - AI course recommendations
GET /student/browse - Course marketplace (search, filter, sort)
POST /student/wishlist - Add/remove wishlist
GET /student/wishlist - Get wishlist
GET /student/live-sessions - Upcoming live sessions
GET /student/live-sessions/calendar - Calendar view
GET /student/live-sessions/:id/join - Get WebRTC join token
GET /student/recordings - Session recordings
GET /student/session-prep/:id - AI session prep tips
backend/app/services/student/learning_service.py

AI recommendation engine (uses orchestrator + enrollment history)
Course search with filters (grade, subject, price, rating)
Session prep via AI
New models:

student_wishlists - student_id, course_id, added_at
student_session_prep - session_id, student_id, tips (JSONB), engagement_prediction
Frontend
New pages:

EnrolledCoursesPage.tsx - Course cards with progress rings, continue buttons
AIRecommendedPage.tsx - AI-curated course recommendations
BrowseCoursesPage.tsx - Full marketplace (search, filters, grid/list view)
TopicExplorerPage.tsx - CBC topic tree explorer
CoursePreviewPage.tsx - Course preview before enrollment
WishlistPage.tsx - Saved courses
JoinLivePage.tsx - Active live sessions to join
UpcomingSessionsPage.tsx - Upcoming session list
ClassCalendarPage.tsx - Calendar view of sessions
RecordingsPage.tsx - Past session recordings
New components:

frontend/src/components/student/courses/CourseCardStudent.tsx - Course card with progress ring
frontend/src/components/student/courses/CourseFilters.tsx - Filter panel
frontend/src/components/student/courses/ProgressRingCard.tsx - Circular progress
frontend/src/components/student/live/WebRTCRoom.tsx - WebRTC video room
frontend/src/components/student/live/Whiteboard.tsx - Collaborative whiteboard
frontend/src/components/student/live/HandRaise.tsx - Hand raise button
frontend/src/components/student/live/SessionCalendar.tsx - Calendar component
Phase 5: Practice & Assessments (Section 4)
Backend
New:

backend/app/api/v1/student/practice.py

GET /student/challenges/today - AI-generated micro-quizzes
POST /student/challenges/submit - Submit challenge answer
GET /student/assignments - Assignments with filters (due-soon, pending, submitted, feedback)
POST /student/assignments/:id/submit - Submit assignment
POST /student/assignments/:id/resubmit - Resubmit
GET /student/quizzes - Quizzes with filters
POST /student/quizzes/:id/start - Start quiz attempt
POST /student/quizzes/:id/submit - Submit quiz
GET /student/quizzes/:id/results - Quiz results
GET /student/projects - Active projects
POST /student/projects/upload - Upload project file
GET /student/projects/gallery - Peer gallery
POST /student/teacher-review/:id - Request teacher review
backend/app/services/student/practice_service.py

AI micro-quiz generation per student level
Assignment filtering and status management
File upload handling (server disk with cloud migration path)
New models:

student_challenge_attempts - challenge_id, student_id, answer, is_correct, xp_earned
student_project_uploads - student_id, project_id, file_path, file_type, file_size, version
Frontend
New pages:

TodaysChallengesPage.tsx - Micro-quiz cards with timer
AssignmentsDueSoonPage.tsx - Due soon assignments
AssignmentsPendingPage.tsx - Pending assignments
AssignmentsSubmittedPage.tsx - Submitted with status
AssignmentsFeedbackPage.tsx - Feedback from teachers
AssignmentsResubmitPage.tsx - Resubmit interface
QuizzesUpcomingPage.tsx - Upcoming quizzes
QuizPracticeModePage.tsx - Practice quiz interface
QuizResultsPage.tsx - Results with skill breakdown
SkillReportsPage.tsx - Skill-level analysis
ActiveProjectsPage.tsx - Active projects
ProjectUploadPage.tsx - File upload interface
PeerGalleryPage.tsx - Browse peer projects
ProjectFeedbackPage.tsx - Project feedback
New components:

frontend/src/components/student/practice/ChallengeCard.tsx
frontend/src/components/student/practice/AssignmentCard.tsx
frontend/src/components/student/practice/QuizPlayer.tsx - Quiz taking interface
frontend/src/components/student/practice/FileUploader.tsx - Multi-file upload
frontend/src/components/student/practice/PeerProjectCard.tsx
Phase 6: Progress & Growth (Section 5)
Backend
New:

backend/app/api/v1/student/progress.py

GET /student/achievements - All badges and achievements
GET /student/skill-tree - Skill tree data
GET /student/reports/weekly - AI weekly story
GET /student/reports/trends - Visual trend data
GET /student/reports/parent-summary - Parent report
POST /student/reports/share - Share report with parent
GET /student/goals - Learning goals
POST /student/goals - Set new goal
GET /student/streaks - Streak data
GET /student/xp - XP and level data
GET /student/leaderboard - Class/grade leaderboard
GET /student/teacher-insights - Teacher-shared progress
backend/app/services/student/gamification_service.py

XP calculation and level progression
Badge awarding logic
Streak management with shields
Leaderboard computation
AI weekly story generation via orchestrator
backend/app/services/student/report_service.py

Weekly learning story generation
Trend data aggregation
Parent summary generation and delivery (email/SMS)
New models:

student_xp_events - student_id, xp_amount, source, description, timestamp
student_levels - student_id, current_level, total_xp, next_level_xp
student_badges - student_id, badge_type, badge_name, description, icon, earned_at, is_shareable
student_goals - student_id, title, target, current, deadline, ai_suggested, status
student_skill_nodes - student_id, skill_name, subject, proficiency (0-100), parent_node_id
student_weekly_reports - student_id, week_start, ai_story, metrics (JSONB), shared_with_parent
Frontend
New pages:

AchievementsGalleryPage.tsx - Badge gallery with filters
RecentUnlocksPage.tsx - Recently earned badges
ShareableCardsPage.tsx - Generate shareable achievement cards
SkillTreePage.tsx - Interactive skill tree visualization (Chart.js radar)
StrengthsPage.tsx - Strength areas detail
GrowingAreasPage.tsx - Areas for improvement
WeeklyStoryPage.tsx - AI-generated weekly narrative
VisualTrendsPage.tsx - Line/bar charts of progress
ParentSummaryPage.tsx - Summary shareable with parent
SetGoalsPage.tsx - Create/edit goals
TrackStreaksPage.tsx - Streak detail and history
AINudgesPage.tsx - AI celebrations and nudges
TeacherInsightsPage.tsx - Teacher-annotated progress
New components:

frontend/src/components/student/progress/BadgeCard.tsx - Single badge display
frontend/src/components/student/progress/SkillTreeViz.tsx - Interactive skill tree (Chart.js)
frontend/src/components/student/progress/XPBar.tsx - XP progress bar with level
frontend/src/components/student/progress/LeaderboardTable.tsx
frontend/src/components/student/progress/WeeklyStoryCard.tsx
frontend/src/components/student/progress/GoalCard.tsx
frontend/src/components/student/progress/ShareableCard.tsx - Canvas-based shareable image
Phase 7: Community (Section 6)
Backend
New:

backend/app/api/v1/student/community.py

GET /student/friends - Friend list
POST /student/friends/request - Send friend request
POST /student/friends/accept - Accept request
GET /student/study-groups - Study groups
POST /student/study-groups - Create study group
GET /student/forums - Forum posts with filters
POST /student/forums - Create post
POST /student/forums/:id/reply - Reply to post
POST /student/shoutouts - Give shoutout
GET /student/shoutouts/wall - Class wall
POST /student/teacher-qa - Ask teacher question
GET /student/teacher-qa - Teacher Q&A threads
backend/app/services/student/community_service.py

Friend management with age-appropriate moderation
Study group creation and management
Forum moderation (AI-assisted)
Shoutout system
Teacher Q&A routing
New models:

student_friendships - student_id, friend_id, status (pending/accepted/blocked), created_at
student_study_groups - name, description, created_by, members (JSONB), subject, max_members
student_shoutouts - from_student, to_student, message, category, created_at
student_teacher_qa - student_id, teacher_id, question, ai_summary, answer, is_moderated
Frontend
New pages:

ConnectPage.tsx - Find and add friends
StudyGroupsPage.tsx - Study groups list
CollaborativeProjectsPage.tsx - Collaborative projects
DiscussionsRecentPage.tsx - Recent forum posts
MyPostsPage.tsx - My forum posts
SavedPostsPage.tsx - Saved/bookmarked posts
NewQuestionsPage.tsx - Ask new questions
GiveShoutoutsPage.tsx - Give encouragement
ReceiveShoutoutsPage.tsx - Received encouragement
ClassWallPage.tsx - Class shoutout wall
TeacherQAPage.tsx - Teacher Q&A corner
New components:

frontend/src/components/student/community/FriendCard.tsx
frontend/src/components/student/community/StudyGroupCard.tsx
frontend/src/components/student/community/ForumPostCard.tsx
frontend/src/components/student/community/ShoutoutCard.tsx
frontend/src/components/student/community/ClassWall.tsx
frontend/src/components/student/community/TeacherQAThread.tsx
Phase 8: Wallet & Access (Section 7)
Backend
New:

backend/app/api/v1/student/wallet.py

GET /student/wallet/balance - KES balance summary
GET /student/wallet/transactions - Transaction history
POST /student/wallet/topup/mpesa - M-Pesa top-up (existing Daraja API)
POST /student/wallet/topup/card - Card payment via Paystack
GET /student/wallet/methods - Saved payment methods
POST /student/wallet/methods - Add payment method
GET /student/subscriptions - Current subscription
POST /student/subscriptions/upgrade - Upgrade plan
GET /student/wallet/receipts - Receipts
GET /student/wallet/ai-advisor - AI fund suggestions
backend/app/services/student/wallet_service.py

Wraps existing payment_service.py
Adds Paystack integration
AI fund advisor via orchestrator
Modify:

backend/app/services/payment_service.py - Add Paystack gateway methods
New model:

paystack_transactions - reference, amount, currency, status, customer_email, channel, metadata (JSONB)
Frontend
New pages:

WalletSummaryPage.tsx - Balance overview with recent transactions
RecentTransactionsPage.tsx - Full transaction history
MpesaTopupPage.tsx - M-Pesa STK push form
CardPaymentPage.tsx - Paystack card form
PaymentMethodsPage.tsx - Saved payment methods
CurrentPlanPage.tsx - Subscription details
UpgradePlanPage.tsx - Plan comparison and upgrade
FamilyPlanPage.tsx - Family plan options
ReceiptsPage.tsx - Downloadable receipts
AIFundAdvisorPage.tsx - AI spending suggestions
New components:

frontend/src/components/student/wallet/BalanceCard.tsx
frontend/src/components/student/wallet/TransactionRow.tsx
frontend/src/components/student/wallet/MpesaForm.tsx
frontend/src/components/student/wallet/PaystackForm.tsx
frontend/src/components/student/wallet/PlanCard.tsx
frontend/src/components/student/wallet/ReceiptCard.tsx
Phase 9: Support & Help (Section 8)
Backend
New:

backend/app/api/v1/student/support.py

GET /student/support/guides - How-to guides
POST /student/support/ticket - Create support ticket
GET /student/support/tickets - My tickets
POST /student/support/chat - Start live chat
GET /student/support/chat/:id - Get chat messages
POST /student/support/report - Report a problem
POST /student/support/ai-triage - AI instant response
backend/app/services/student/support_service.py

Wraps existing ticket system
AI triage via orchestrator (auto-escalation logic)
Live chat via Socket.IO
Frontend
New pages:

HowToGuidesPage.tsx - Guides and tutorial videos
AskCommunityPage.tsx - Community help forum
QuickTicketPage.tsx - Create support ticket
TeacherChatPage.tsx - Chat with class teacher
UrgentFlagPage.tsx - Urgent support flag
ReportProblemPage.tsx - Problem report form
AIHelpTriagePage.tsx - AI instant help
New components:

frontend/src/components/student/support/LiveChat.tsx - Real-time chat (Socket.IO)
frontend/src/components/student/support/TicketForm.tsx
frontend/src/components/student/support/GuideCard.tsx
frontend/src/components/student/support/AITriageChat.tsx
Phase 10: You (Section 9)
Backend
New:

backend/app/api/v1/student/account.py

GET /student/notifications - Smart inbox
PUT /student/notifications/:id/read - Mark read
GET /student/profile - Student profile
PUT /student/profile - Update profile
PUT /student/preferences - Update preferences
GET /student/privacy - Privacy settings
PUT /student/privacy - Update privacy
POST /student/privacy/consent - COPPA consent
GET /student/privacy/audit - AI privacy audit
PUT /student/teacher-access - Teacher access controls
backend/app/services/student/account_service.py

Notification management with AI priority filtering
Profile management
COPPA consent workflow (parental approval flow)
Privacy audit generation
New models:

student_consent_records - student_id, parent_id, consent_type, granted_at, expires_at, ip_address
student_teacher_access - student_id, teacher_id, can_view_progress, can_view_mood, can_message
Frontend
New pages:

SmartInboxPage.tsx - Categorized notifications
PriorityAlertsPage.tsx - High-priority notifications
NotificationSettingsPage.tsx - Notification preferences
AvatarPage.tsx - Avatar selection/customization
BioPage.tsx - Bio editing
LearningStylePage.tsx - Learning style quiz/settings
InterestsPage.tsx - Interest tags
ThemePrefsPage.tsx - Theme selection
LanguagePrefsPage.tsx - Language toggle (i18n)
NotificationPrefsPage.tsx - Notification preferences
AIPersonalityPage.tsx - AI tutor personality settings
PrivacySecurityPage.tsx - COPPA-compliant privacy controls
TeacherAccessPage.tsx - Manage teacher viewing permissions
New components:

frontend/src/components/student/account/NotificationCard.tsx
frontend/src/components/student/account/AvatarPicker.tsx
frontend/src/components/student/account/LearningStyleQuiz.tsx
frontend/src/components/student/account/ConsentForm.tsx - COPPA consent
frontend/src/components/student/account/TeacherAccessToggle.tsx
Phase 11: Database Migration
New file: backend/alembic/versions/xxxx_student_dashboard.py

All new tables in a single migration:

student_mood_entries
student_streaks
student_daily_plans
student_journal_entries
student_wishlists
student_session_prep
student_challenge_attempts
student_project_uploads
student_xp_events
student_levels
student_badges
student_goals
student_skill_nodes
student_weekly_reports
student_friendships
student_study_groups
student_shoutouts
student_teacher_qa
paystack_transactions
student_consent_records
student_teacher_access
Files to Modify (Existing)
File	Change
frontend/src/components/layout/DashboardLayout.tsx	Replace default Sidebar with StudentSidebar for student role
frontend/src/App.tsx	Add ~50 student route definitions
frontend/src/main.tsx	Import i18n initialization
frontend/vite.config.ts	Add VitePWA plugin
frontend/package.json	New dependencies (via npm install)
backend/main.py	Register student API router + Socket.IO
backend/app/services/payment_service.py	Add Paystack gateway
backend/requirements.txt	New Python packages
backend/alembic/env.py	Import new models
New File Count Summary
Category	Count
Frontend pages (pages/student/)	~50
Frontend components (components/student/)	~45
Frontend stores/hooks/services	~8
Frontend infra (i18n, PWA, themes)	~6
Backend API routes (api/v1/student/)	6
Backend services (services/student/)	7
Backend models	~21 new tables
Backend migration	1
Total new files	~145
Verification & Testing
Frontend
npm run dev - Verify all pages load without errors
Navigate to each route - confirm sidebar active state highlights correctly
Test sidebar collapse/expand on desktop
Test mobile drawer open/close
Verify age-adaptive UI switches between young/tween/teen themes
Test mood check-in modal appears on first login
Verify Chart.js renders on Progress pages
Test drag-and-drop on daily plan
Verify i18n wrapping (translation keys work)
npx tsc --noEmit - TypeScript type checking passes
npm run build - Production build succeeds
npm run lint - ESLint passes
Backend
python main.py - Server starts without errors
Visit /docs - All new student endpoints visible in Swagger
alembic upgrade head - Migration runs successfully
Test each API endpoint via Swagger UI
Verify WebSocket connection at /ws/student/{token}
pytest - All tests pass
Integration
Login as student user - redirects to /dashboard/student
Full navigation through all 9 sidebar sections
AI chat sends and receives real AI responses
Mood check-in persists across sessions
Notification badge updates in real-time via Socket.IO