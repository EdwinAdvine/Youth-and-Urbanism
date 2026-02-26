# Instructor Dashboard Pages

**Project**: Urban Home School (The Bird AI) / Urban Bird v1
**Base Route**: `/dashboard/instructor`
**Layout**: `DashboardLayout` with `role="instructor"` + `InstructorSidebar`
**Protection**: `ProtectedRoute` with `allowedRoles={['instructor']}`
**Last Updated**: 2026-02-15

---

## Page Count Summary

| Section | Pages |
|---------|-------|
| Home & AI | 2 |
| Courses | 4 |
| Assessments | 4 |
| Sessions | 3 |
| Student Analytics | 7 |
| Recognition | 3 |
| Earnings | 5 |
| Hub | 6 |
| Account | 6 |
| **Total** | **40** |

---

## Home & AI (2 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 1 | `/dashboard/instructor` | `frontend/src/pages/DashboardInstructor.tsx` | `DashboardInstructor` | Instructor dashboard home with AI insights card, earnings snapshot, and upcoming sessions |
| 2 | `insights` | `frontend/src/pages/instructor/AIInsightsPage.tsx` | `AIInsightsPage` | AI-powered teaching insights and student analysis |

**Note**: The instructor dashboard home page is imported from the root `pages/` directory (`DashboardInstructor.tsx`), not from `pages/instructor/`. All other instructor pages are in `pages/instructor/`.

---

## Courses (4 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 3 | `courses` | `frontend/src/pages/instructor/MyCoursesPage.tsx` | `MyCoursesPage` | List of instructor's courses with stats |
| 4 | `courses/editor` | `frontend/src/pages/instructor/CourseEditorPage.tsx` | `CourseEditorPage` | Course creation and editing form |
| 5 | `courses/:courseId/modules` | `frontend/src/pages/instructor/ModulesEditorPage.tsx` | `ModulesEditorPage` | Course modules and lesson editor |
| 6 | `courses/:courseId/cbc-alignment` | `frontend/src/pages/instructor/CBCAlignmentPage.tsx` | `CBCAlignmentPage` | CBC curriculum alignment configuration for a course |

---

## Assessments (4 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 7 | `assessments` | `frontend/src/pages/instructor/AssessmentsPage.tsx` | `AssessmentsPage` | List of assessments (quizzes, tests, assignments) |
| 8 | `assessments/editor` | `frontend/src/pages/instructor/AssessmentEditorPage.tsx` | `AssessmentEditorPage` | Assessment creation and editing tool |
| 9 | `submissions` | `frontend/src/pages/instructor/SubmissionsPage.tsx` | `SubmissionsPage` | Student submissions review queue |
| 10 | `resources` | `frontend/src/pages/instructor/ResourcesPage.tsx` | `ResourcesPage` | Teaching resources management |

---

## Sessions (3 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 11 | `sessions` | `frontend/src/pages/instructor/SessionsPage.tsx` | `SessionsPage` | List of teaching sessions |
| 12 | `sessions/:sessionId` | `frontend/src/pages/instructor/SessionDetailPage.tsx` | `SessionDetailPage` | Session detail view with attendees and materials |
| 13 | `sessions/:sessionId/live` | `frontend/src/pages/instructor/LiveSessionPage.tsx` | `LiveSessionPage` | Live video teaching session with WebRTC room |

---

## Student Analytics (7 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 14 | `messages` | `frontend/src/pages/instructor/MessagesPage.tsx` | `MessagesPage` | Messages center for student/parent communication |
| 15 | `ai-handoff` | `frontend/src/pages/instructor/AIHandoffPage.tsx` | `AIHandoffPage` | AI-to-teacher handoff management (when AI escalates to teacher) |
| 16 | `progress-pulse` | `frontend/src/pages/instructor/ProgressPulsePage.tsx` | `ProgressPulsePage` | Real-time student progress pulse dashboard |
| 17 | `interventions` | `frontend/src/pages/instructor/InterventionsPage.tsx` | `InterventionsPage` | Student intervention tracking and planning |
| 18 | `discussions` | `frontend/src/pages/instructor/DiscussionsPage.tsx` | `DiscussionsPage` | Course discussion forums management |
| 19 | `feedback` | `frontend/src/pages/instructor/FeedbackPage.tsx` | `FeedbackPage` | Student feedback collection and review |
| 20 | `feedback/sentiment` | `frontend/src/pages/instructor/SentimentAnalysisPage.tsx` | `SentimentAnalysisPage` | AI sentiment analysis of student feedback |

---

## Recognition (3 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 21 | `performance` | `frontend/src/pages/instructor/PerformancePage.tsx` | `PerformancePage` | Teaching performance metrics and analytics |
| 22 | `badges` | `frontend/src/pages/instructor/BadgesPage.tsx` | `BadgesPage` | Teaching badges and achievements |
| 23 | `recognition` | `frontend/src/pages/instructor/RecognitionPage.tsx` | `RecognitionPage` | Recognition from students, parents, and platform |

---

## Earnings (5 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 24 | `earnings` | `frontend/src/pages/instructor/EarningsDashboardPage.tsx` | `EarningsDashboardPage` | Earnings overview dashboard |
| 25 | `earnings/breakdown` | `frontend/src/pages/instructor/EarningsBreakdownPage.tsx` | `EarningsBreakdownPage` | Detailed earnings breakdown by course/session |
| 26 | `earnings/payouts` | `frontend/src/pages/instructor/PayoutsPage.tsx` | `PayoutsPage` | Payout history and upcoming payouts |
| 27 | `earnings/rates` | `frontend/src/pages/instructor/RatesPage.tsx` | `RatesPage` | Session and course rate management |
| 28 | `earnings/documents` | `frontend/src/pages/instructor/DocumentsPage.tsx` | `DocumentsPage` | Tax documents and earning statements |

---

## Hub (6 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 29 | `hub/cbc-references` | `frontend/src/pages/instructor/CBCReferencesPage.tsx` | `CBCReferencesPage` | CBC curriculum reference materials |
| 30 | `hub/ai-prompts` | `frontend/src/pages/instructor/AIPromptsPage.tsx` | `AIPromptsPage` | AI prompt library for teaching assistance |
| 31 | `hub/community` | `frontend/src/pages/instructor/CommunityLoungePage.tsx` | `CommunityLoungePage` | Instructor community lounge |
| 32 | `hub/co-create` | `frontend/src/pages/instructor/CoCreatePage.tsx` | `CoCreatePage` | Co-creation tools for collaborative content |
| 33 | `hub/support` | `frontend/src/pages/instructor/SupportTicketsPage.tsx` | `SupportTicketsPage` | Support ticket listing |
| 34 | `hub/support/ticket/:ticketId` | `frontend/src/pages/instructor/SupportTicketDetailPage.tsx` | `SupportTicketDetailPage` | Individual support ticket detail |

---

## Account (6 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 35 | `notifications` | `frontend/src/pages/instructor/InstructorNotificationsPage.tsx` | `InstructorNotificationsPage` | Notifications inbox |
| 36 | `profile` | `frontend/src/pages/instructor/ProfilePage.tsx` | `InstructorProfilePage` | Instructor profile settings |
| 37 | `profile/public` | `frontend/src/pages/instructor/PublicPageSettingsPage.tsx` | `PublicPageSettingsPage` | Public instructor profile page settings (visible at `/instructor/:slug`) |
| 38 | `availability` | `frontend/src/pages/instructor/AvailabilityPage.tsx` | `AvailabilityPage` | Teaching availability calendar management |
| 39 | `security` | `frontend/src/pages/instructor/SecurityPage.tsx` | `SecurityPage` | Security settings (password, 2FA) |
| 40 | `security/login-history` | `frontend/src/pages/instructor/LoginHistoryPage.tsx` | `LoginHistoryPage` | Login history audit log |

---

## Key Instructor Components

The instructor dashboard uses several specialized components found in `frontend/src/components/instructor/`:

| Component | File Path | Description |
|-----------|-----------|-------------|
| `InstructorSidebar` | `components/instructor/sidebar/InstructorSidebar.tsx` | Instructor navigation sidebar |
| `InstructorSidebar` (legacy) | `components/instructor/InstructorSidebar.tsx` | Legacy sidebar at root level |
| `AIInsightsCard` | `components/instructor/dashboard/AIInsightsCard.tsx` | AI insights dashboard card |
| `EarningsSnapshotCard` | `components/instructor/dashboard/EarningsSnapshotCard.tsx` | Earnings overview card |
| `UpcomingSessionsCard` | `components/instructor/dashboard/UpcomingSessionsCard.tsx` | Upcoming sessions card |
| `SubmissionRow` | `components/instructor/assessments/SubmissionRow.tsx` | Student submission row component |
| `CBCAlignmentBadge` | `components/instructor/courses/CBCAlignmentBadge.tsx` | CBC alignment status badge |
| `CourseCard` | `components/instructor/courses/CourseCard.tsx` | Instructor course card |
| `LiveVideoRoom` | `components/instructor/sessions/LiveVideoRoom.tsx` | Live video session room |
| `InstructorPageHeader` | `components/instructor/shared/InstructorPageHeader.tsx` | Page header component |
| `InstructorStatsCard` | `components/instructor/shared/InstructorStatsCard.tsx` | Stats card component |

---

## Lazy Loading Note

All instructor page components use named exports and are lazy-loaded with `.then()` module resolution:

```typescript
const AIInsightsPage = lazy(() =>
  import('./pages/instructor/AIInsightsPage').then(m => ({ default: m.AIInsightsPage }))
);
```

This pattern differs from other roles (student, parent, partner) which use default exports.
