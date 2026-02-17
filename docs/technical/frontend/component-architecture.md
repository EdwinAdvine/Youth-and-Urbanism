# Frontend Component Architecture

**Project**: Urban Home School (The Bird AI) / Urban Bird v1
**Framework**: React 18 + TypeScript + Vite + Tailwind CSS
**Last Updated**: 2026-02-15

---

## Component Organization (Feature-Based)

The frontend follows a feature-based component organization pattern, grouping components by role and functional domain. All components live under `frontend/src/components/`.

```
frontend/src/components/
|
+-- admin/                          # Admin dashboard components
|   +-- analytics/
|   |   +-- AIQueryBuilder.tsx          - AI-powered analytics query builder
|   |   +-- ChartRenderer.tsx           - Dynamic chart rendering component
|   +-- dashboard/
|   |   +-- AIAnomaliesCard.tsx          - AI anomaly detection dashboard card
|   |   +-- AlertsCard.tsx              - Active alerts dashboard card
|   |   +-- BentoGrid.tsx              - Bento grid layout for admin dashboard
|   |   +-- EnrollmentsCard.tsx         - Enrollment metrics card
|   |   +-- PendingItemsCard.tsx        - Pending approvals card
|   |   +-- RevenueCard.tsx             - Revenue overview card
|   +-- permissions/
|   |   +-- PermissionMatrix.tsx        - Role/permission matrix editor
|   +-- pulse/
|   |   +-- HealthStatus.tsx            - System health status indicator
|   |   +-- RealtimeOverview.tsx        - Real-time platform overview
|   |   +-- UrgentFlags.tsx             - Urgent system flags display
|   +-- shared/
|   |   +-- AdminBadge.tsx              - Admin-styled badge component
|   |   +-- AdminBentoCard.tsx          - Reusable bento card for admin
|   |   +-- AdminBulkActions.tsx        - Bulk action toolbar
|   |   +-- AdminChart.tsx              - Chart wrapper for admin pages
|   |   +-- AdminDataTable.tsx          - Data table with sorting/filtering
|   |   +-- AdminEmptyState.tsx         - Empty state placeholder
|   |   +-- AdminExportButton.tsx       - Data export button
|   |   +-- AdminFilterPanel.tsx        - Advanced filter panel
|   |   +-- AdminLoadingSkeleton.tsx    - Loading skeleton component
|   |   +-- AdminModal.tsx              - Modal dialog for admin
|   |   +-- AdminPageHeader.tsx         - Page header with breadcrumbs
|   |   +-- AdminStatsCard.tsx          - Statistics card component
|   +-- sidebar/
|   |   +-- AdminSidebar.tsx            - Admin navigation sidebar
|   +-- users/
|   |   +-- UserProfileDrawer.tsx       - Slide-out user profile drawer
|   +-- AIProviderForm.tsx              - AI provider configuration form
|   +-- AIProviderList.tsx              - List of configured AI providers
|   +-- RecommendedProviders.tsx        - Recommended AI provider suggestions
|
+-- auth/                           # Authentication components
|   +-- AuthModal.tsx                   - Authentication modal (login/signup tabs)
|   +-- LoginForm.tsx                   - Login form with validation
|   +-- SignupForm.tsx                  - Registration form with role selection
|
+-- bird-chat/                      # The Bird AI full-screen chat interface
|   +-- BirdChatPage.tsx                - Full-screen AI chat page component
|   +-- ChatHeader.tsx                  - Chat header with bird avatar
|   +-- ChatMessages.tsx                - Message list with auto-scroll
|   +-- InputBar.tsx                    - Chat input with voice/text support
|
+-- co-pilot/                       # AI CoPilot sidebar (available on all dashboards)
|   +-- AgentProfileSettings.tsx        - AI agent personality configuration
|   +-- ChatInput.tsx                   - CoPilot chat input component
|   +-- ChatMessages.tsx                - CoPilot message display
|   +-- CoPilotAccessibility.tsx        - Accessibility settings for CoPilot
|   +-- CoPilotContent.tsx              - Main CoPilot content area
|   +-- CoPilotMobileDrawer.tsx         - Mobile drawer variant of CoPilot
|   +-- CoPilotPerformance.tsx          - AI performance metrics display
|   +-- CoPilotSidebar.tsx              - CoPilot sidebar wrapper
|   +-- __tests__/
|       +-- CoPilot.test.tsx            - CoPilot component tests
|
+-- course/                         # Shared course components
|   +-- CourseCard.tsx                  - Reusable course card component
|
+-- dashboard/                      # Shared dashboard components
|   +-- StatsCards.tsx                  - Dashboard statistics cards
|   +-- WelcomeWidget.tsx              - Welcome/greeting widget
|
+-- error/                          # Error handling components
|   +-- FeatureErrorBoundary.tsx        - Feature-level error boundary
|   +-- GlobalErrorBoundary.tsx         - App-level error boundary
|
+-- instructor/                     # Instructor dashboard components
|   +-- assessments/
|   |   +-- SubmissionRow.tsx           - Student submission table row
|   +-- courses/
|   |   +-- CBCAlignmentBadge.tsx       - CBC curriculum alignment badge
|   |   +-- CourseCard.tsx              - Instructor-specific course card
|   +-- dashboard/
|   |   +-- AIInsightsCard.tsx          - AI insights dashboard card
|   |   +-- EarningsSnapshotCard.tsx    - Earnings overview card
|   |   +-- UpcomingSessionsCard.tsx    - Upcoming sessions card
|   +-- sessions/
|   |   +-- LiveVideoRoom.tsx           - Live video session room
|   +-- shared/
|   |   +-- InstructorPageHeader.tsx    - Page header for instructor pages
|   |   +-- InstructorStatsCard.tsx     - Statistics card for instructors
|   +-- sidebar/
|   |   +-- InstructorSidebar.tsx       - Instructor navigation sidebar
|   +-- InstructorSidebar.tsx           - Legacy instructor sidebar (root-level)
|
+-- layout/                         # Layout components
|   +-- DashboardLayout.tsx             - Dashboard shell (Topbar + Sidebars + Outlet)
|   +-- Footer.tsx                      - Public page footer
|   +-- PublicHeader.tsx                - Public page header/navigation
|   +-- PublicLayout.tsx                - Public page shell (Header + Outlet + Footer)
|   +-- Sidebar.tsx                     - Generic sidebar component
|   +-- Topbar.tsx                      - Dashboard top navigation bar
|
+-- parent/                         # Parent dashboard components
|   +-- children/
|   |   +-- ActivityTimeline.tsx        - Child activity timeline
|   |   +-- CBCRadarChart.tsx           - CBC competency radar chart
|   |   +-- GoalManager.tsx             - Child goal management
|   +-- ChildSelector.tsx               - Child selection dropdown
|   +-- ParentSidebar.tsx               - Parent navigation sidebar
|
+-- partner/                        # Partner dashboard components
|   +-- shared/
|   |   +-- PartnerBadge.tsx            - Partner-styled badge
|   |   +-- PartnerBentoCard.tsx        - Bento card for partner dashboard
|   |   +-- PartnerChart.tsx            - Chart wrapper for partner pages
|   |   +-- PartnerDataTable.tsx        - Data table for partner pages
|   |   +-- PartnerEmptyState.tsx       - Empty state placeholder
|   |   +-- PartnerFilterBar.tsx        - Filter bar component
|   |   +-- PartnerLoadingSkeleton.tsx  - Loading skeleton
|   |   +-- PartnerModal.tsx            - Modal dialog for partner
|   |   +-- PartnerPageHeader.tsx       - Page header with breadcrumbs
|   |   +-- PartnerStatsCard.tsx        - Statistics card
|   |   +-- USAGE_EXAMPLES.tsx          - Usage examples for shared components
|   |   +-- index.ts                    - Barrel export file
|   +-- sidebar/
|       +-- PartnerSidebar.tsx          - Partner navigation sidebar
|
+-- staff/                          # Staff dashboard components
|   +-- assessment/
|   |   +-- AIGradingPanel.tsx          - AI-assisted grading panel
|   |   +-- AdaptivePathEditor.tsx      - Adaptive learning path editor
|   |   +-- DifficultySlider.tsx        - Question difficulty slider
|   |   +-- QuestionBankBrowser.tsx     - Question bank browser
|   |   +-- QuestionEditor.tsx          - Question editing form
|   +-- content/
|   |   +-- CBCTagPicker.tsx            - CBC curriculum tag picker
|   |   +-- ContentVersionHistory.tsx   - Content version history viewer
|   |   +-- MultimediaBlockLibrary.tsx  - Multimedia content block library
|   |   +-- TipTapEditor.tsx            - TipTap rich text editor
|   +-- dashboard/
|   |   +-- AIAgendaCard.tsx            - AI-generated daily agenda card
|   |   +-- AnomaliesCard.tsx           - Platform anomalies card
|   |   +-- ModerationQueueCard.tsx     - Content moderation queue card
|   |   +-- StaffBentoGrid.tsx          - Bento grid for staff dashboard
|   |   +-- StudentFlagsCard.tsx        - Flagged students card
|   |   +-- TasksDeadlinesCard.tsx      - Tasks and deadlines card
|   |   +-- UrgentTicketsCard.tsx       - Urgent support tickets card
|   |   +-- ViewToggle.tsx              - Dashboard view mode toggle
|   +-- knowledge/
|   |   +-- KBArticleCard.tsx           - Knowledge base article card
|   |   +-- KBEditor.tsx               - Knowledge base article editor
|   |   +-- KBSearchBar.tsx            - Knowledge base search bar
|   |   +-- KBSuggestions.tsx          - AI-suggested KB articles
|   +-- live/
|   |   +-- AttendanceTracker.tsx       - Live class attendance tracker
|   |   +-- BreakoutRoomManager.tsx     - Breakout room management
|   |   +-- LiveClassRoom.tsx           - Live classroom component
|   |   +-- PostSessionSummary.tsx      - Post-session summary generator
|   |   +-- RecordingIndicator.tsx      - Recording status indicator
|   |   +-- ScreenSharePanel.tsx        - Screen sharing panel
|   +-- reports/
|   |   +-- ReportCanvas.tsx            - Drag-and-drop report canvas
|   |   +-- ReportPreview.tsx           - Report preview component
|   |   +-- ReportScheduler.tsx         - Scheduled report configuration
|   |   +-- ReportWidgetPalette.tsx     - Report widget palette
|   +-- shared/
|   |   +-- StaffBadge.tsx              - Staff-styled badge
|   |   +-- StaffBentoCard.tsx          - Bento card for staff
|   |   +-- StaffChart.tsx              - Chart wrapper for staff pages
|   |   +-- StaffDataTable.tsx          - Data table for staff pages
|   |   +-- StaffEmptyState.tsx         - Empty state placeholder
|   |   +-- StaffFilterBar.tsx          - Filter bar component
|   |   +-- StaffLoadingSkeleton.tsx    - Loading skeleton
|   |   +-- StaffModal.tsx              - Modal dialog for staff
|   |   +-- StaffPageHeader.tsx         - Page header with breadcrumbs
|   |   +-- StaffStatsCard.tsx          - Statistics card
|   +-- sidebar/
|   |   +-- StaffSidebar.tsx            - Staff navigation sidebar
|   +-- tickets/
|       +-- AITriagePanel.tsx           - AI ticket triage panel
|       +-- SLAIndicator.tsx            - SLA compliance indicator
|       +-- TicketAssignPanel.tsx       - Ticket assignment panel
|       +-- TicketConversation.tsx      - Ticket conversation thread
|
+-- store/                          # E-commerce components
|   +-- CartDrawer.tsx                  - Shopping cart slide-out drawer
|
+-- student/                        # Student dashboard components
|   +-- account/
|   |   +-- AvatarPicker.tsx            - Avatar selection component
|   |   +-- ConsentForm.tsx             - Data consent form
|   |   +-- LearningStyleQuiz.tsx       - Learning style assessment quiz
|   |   +-- NotificationCard.tsx        - Notification preference card
|   |   +-- TeacherAccessToggle.tsx     - Teacher access permission toggle
|   +-- ai/
|   |   +-- ChatInterface.tsx           - AI tutor chat interface
|   |   +-- JournalEntry.tsx            - AI learning journal entry
|   |   +-- TeacherQuestionForm.tsx     - Ask-teacher question form
|   |   +-- VoicePlayer.tsx             - Voice response player
|   |   +-- VoiceRecorder.tsx           - Voice input recorder
|   +-- charts/
|   |   +-- ChartConfig.ts             - Chart configuration constants
|   |   +-- HeatmapChart.tsx            - Activity heatmap chart
|   |   +-- LineChart.tsx               - Progress line chart
|   |   +-- ProgressRing.tsx            - Circular progress ring
|   |   +-- RadarChart.tsx              - Skill radar chart
|   +-- community/
|   |   +-- ClassWall.tsx               - Class shoutout wall
|   |   +-- ForumPostCard.tsx           - Forum post card
|   |   +-- FriendCard.tsx              - Friend/connection card
|   |   +-- ShoutoutCard.tsx            - Shoutout card
|   |   +-- StudyGroupCard.tsx          - Study group card
|   |   +-- TeacherQAThread.tsx         - Teacher Q&A thread
|   +-- courses/
|   |   +-- CourseCardStudent.tsx        - Student-specific course card
|   |   +-- CourseFilters.tsx            - Course filter controls
|   |   +-- SessionCalendar.tsx          - Session calendar view
|   +-- dashboard/
|   |   +-- DailyPlanWidget.tsx          - AI daily plan widget
|   |   +-- DailyQuoteCard.tsx           - Inspirational quote card
|   |   +-- MoodCheckInModal.tsx         - Mood check-in modal
|   |   +-- MoodWidget.tsx              - Current mood display widget
|   |   +-- StreakDisplay.tsx            - Learning streak display
|   |   +-- StudentStatsCards.tsx        - Student statistics cards
|   |   +-- TeacherSyncCard.tsx          - Teacher sync status card
|   |   +-- TimeAdaptiveGreeting.tsx     - Time-based greeting
|   |   +-- UrgentItemsCard.tsx          - Urgent items card
|   +-- live/
|   |   +-- HandRaise.tsx               - Hand raise button for live sessions
|   |   +-- WebRTCRoom.tsx              - WebRTC video room component
|   |   +-- Whiteboard.tsx              - Collaborative whiteboard
|   +-- practice/
|   |   +-- AssignmentCard.tsx           - Assignment card
|   |   +-- ChallengeCard.tsx            - Daily challenge card
|   |   +-- FileUploader.tsx             - File upload component
|   |   +-- PeerProjectCard.tsx          - Peer project card
|   |   +-- QuizPlayer.tsx              - Quiz player component
|   +-- progress/
|   |   +-- BadgeCard.tsx               - Achievement badge card
|   |   +-- GoalCard.tsx                - Goal tracking card
|   |   +-- LeaderboardTable.tsx        - Leaderboard table
|   |   +-- ShareableCard.tsx           - Shareable achievement card
|   |   +-- SkillTreeViz.tsx            - Skill tree visualization
|   |   +-- WeeklyStoryCard.tsx         - Weekly progress story card
|   |   +-- XPBar.tsx                   - Experience points bar
|   +-- sidebar/
|   |   +-- StudentSidebar.tsx          - Student navigation sidebar
|   +-- support/
|   |   +-- AITriageChat.tsx            - AI help triage chat
|   |   +-- GuideCard.tsx               - How-to guide card
|   |   +-- LiveChat.tsx                - Live support chat
|   |   +-- TicketForm.tsx              - Support ticket form
|   +-- wallet/
|       +-- BalanceCard.tsx             - Wallet balance card
|       +-- MpesaForm.tsx              - M-Pesa payment form
|       +-- PaystackForm.tsx           - Paystack payment form
|       +-- PlanCard.tsx               - Subscription plan card
|       +-- ReceiptCard.tsx            - Payment receipt card
|       +-- TransactionRow.tsx         - Transaction history row
|
+-- ProtectedRoute.tsx              # Route protection wrapper (role-based)
```

**Total Component Files**: ~160+ `.tsx` files across all feature domains.

---

## Layout Architecture

The application uses two primary layout shells:

### PublicLayout

Used for unauthenticated/public-facing pages.

```
+-----------------------------------------------+
|              PublicHeader                       |
|  (Logo, Navigation, Auth buttons)              |
+-----------------------------------------------+
|                                                 |
|              <Outlet />                         |
|  (Page content: Home, Courses, Pricing, etc.)  |
|                                                 |
+-----------------------------------------------+
|              Footer                             |
|  (Links, copyright, social media)              |
+-----------------------------------------------+
```

**Routes using PublicLayout**: `/`, `/courses`, `/courses/:courseId`, `/pricing`, `/store`, `/store/products/:slug`, `/how-it-works`, `/about`, `/contact`, `/certificate-validation`, `/become-instructor`, `/forum`, `/categories/:slug`

### DashboardLayout

Used for all authenticated dashboard pages. Accepts a `role` prop to determine which sidebar to render.

```
+-----------------------------------------------+
|              Topbar                             |
|  (Hamburger, Search, Notifications, Profile)   |
+---+-------------------------------------------+
|   |                                    |      |
| R |                                    |  AI  |
| O |         Main Content Area          | CoPi |
| L |         <Outlet />                 | lot  |
| E |                                    | Side |
|   |                                    | bar  |
| S |                                    |      |
| I |                                    |      |
| D |                                    |      |
| E |                                    |      |
| B |                                    |      |
| A |                                    |      |
| R |                                    |      |
+---+------------------------------------+------+
```

**Sidebar Selection Logic** (from `DashboardLayout.tsx`):
- `role === 'admin'` -> `AdminSidebar`
- `role === 'staff'` -> `StaffSidebar`
- `role === 'instructor'` -> `InstructorSidebar`
- `role === 'parent'` -> `ParentSidebar`
- `role === 'partner'` -> `PartnerSidebar`
- Default (student) -> `StudentSidebar`

The **CoPilotSidebar** is always present alongside the role-specific sidebar, appearing on the right side of the layout. It is toggled via the `isExpanded` state in `useCoPilotStore`.

### Special Layouts

- **BotPage** (`/the-bird`): Full-screen AI chat with no shared layout wrapper.
- **InstructorPublicProfilePage** (`/instructor/:slug`): Standalone page, no layout wrapper, wrapped in Suspense.
- **DashboardLayoutAutoRole**: For non-dashboard authenticated routes (`/search`, `/profile`, `/settings`, etc.), auto-detects the user's role from `useAuthStore` and renders the appropriate `DashboardLayout`.

---

## Key Design Patterns

### 1. Lazy Loading with Code Splitting

All dashboard page components are lazy-loaded using `React.lazy()` and wrapped with `Suspense`. A utility wrapper `S` (shorthand for Suspense) is used throughout:

```tsx
const S = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<DashboardLoadingFallback />}>{children}</Suspense>
);

// Usage:
<Route path="ai-tutor/chat" element={<S><AITutorChatPage /></S>} />
```

The loading fallback renders a centered spinning indicator. Public pages (Home, Pricing, etc.) are directly imported for faster initial load.

### 2. Feature-Based Component Organization

Components are grouped by role and feature domain rather than by type:
- Each role has its own directory (`admin/`, `instructor/`, `staff/`, `student/`, `parent/`, `partner/`)
- Each role directory contains sub-directories for feature domains (`dashboard/`, `shared/`, `sidebar/`, etc.)
- Shared components specific to a role live in `<role>/shared/` (e.g., `AdminStatsCard`, `StaffDataTable`)

### 3. Shared Component Libraries Per Role

Each role has a `shared/` directory containing reusable UI components styled for that role's context:

| Role | Shared Components |
|------|------------------|
| Admin | AdminBadge, AdminBentoCard, AdminBulkActions, AdminChart, AdminDataTable, AdminEmptyState, AdminExportButton, AdminFilterPanel, AdminLoadingSkeleton, AdminModal, AdminPageHeader, AdminStatsCard |
| Staff | StaffBadge, StaffBentoCard, StaffChart, StaffDataTable, StaffEmptyState, StaffFilterBar, StaffLoadingSkeleton, StaffModal, StaffPageHeader, StaffStatsCard |
| Partner | PartnerBadge, PartnerBentoCard, PartnerChart, PartnerDataTable, PartnerEmptyState, PartnerFilterBar, PartnerLoadingSkeleton, PartnerModal, PartnerPageHeader, PartnerStatsCard |
| Instructor | InstructorPageHeader, InstructorStatsCard |

### 4. State Management with Zustand

Global state is managed entirely through Zustand stores (no Redux or React Context for global state):
- `useAuthStore` - Authentication state
- `useUserStore` - User preferences, courses, assignments
- `useThemeStore` - Theme management
- `useCoPilotStore` - AI CoPilot sidebar state
- `useChatStore` - The Bird AI chat state
- `useStudentStore` - Student dashboard state
- `useInstructorStore` - Instructor dashboard state
- `useAdminStore` - Admin dashboard state
- `useStaffStore` - Staff dashboard state
- `useParentStore` - Parent dashboard state
- `usePartnerStore` - Partner dashboard state
- `useCartStore` - Shopping cart state

### 5. Tailwind CSS with Custom Brand Colors

The project uses Tailwind CSS with a custom "copilot" color palette defined in `tailwind.config.js`:
- `copilot-blue` (50-900)
- `copilot-cyan` (50-900)
- `copilot-green` (50-900)
- `copilot-purple` (50-900)
- `copilot-orange` (50-900)
- `copilot-teal` (50-900)

Dark mode is enabled via the `class` strategy (`darkMode: 'class'`).

### 6. Animation with Framer Motion

Framer Motion is used for page transitions, modal animations, sidebar slide-ins, and micro-interactions throughout the dashboard.

### 7. React Router v7

Routing uses React Router v7 with:
- Nested route configuration for dashboard hierarchies
- `<Outlet />` for layout composition
- `ProtectedRoute` wrapper for authentication and role-based access control
- Route parameters for dynamic pages (`:courseId`, `:childId`, `:ticketId`, etc.)

### 8. Error Boundaries

Two levels of error boundaries:
- `GlobalErrorBoundary` - Wraps the entire application at the `App` component level
- `FeatureErrorBoundary` - Available for wrapping individual features/sections

### 9. Role-Based Access Control

The `ProtectedRoute` component:
- Checks authentication state via `useAuthStore`
- Accepts an optional `allowedRoles` prop to restrict access
- Redirects unauthenticated users to the login flow
- Redirects unauthorized users (wrong role) to their appropriate dashboard

### 10. Authenticated User Redirect

When an authenticated user visits `/`, they are automatically redirected to `/dashboard/{role}` based on their user role.
