# Staff Dashboard Pages

**Project**: Urban Home School (The Bird AI) / Urban Bird v1
**Base Route**: `/dashboard/staff`
**Layout**: `DashboardLayout` with `role="staff"`
**Protection**: `ProtectedRoute` with `allowedRoles={['staff']}`
**Last Updated**: 2026-02-15

---

## Page Count Summary

| Section | Pages |
|---------|-------|
| Home | 2 |
| User Management | 5 |
| Content Moderation | 4 |
| System Monitoring | 4 |
| Reports | 4 |
| Support | 3 |
| Account | 4 |
| **Total** | **26** |

---

## Home (2 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 1 | `/dashboard/staff` | `frontend/src/pages/DashboardStaff.tsx` | `DashboardStaff` | Staff dashboard home with pending tasks, system alerts, user activity overview, and quick action cards |
| 2 | `activity-feed` | `frontend/src/pages/staff/ActivityFeedPage.tsx` | `ActivityFeedPage` | Real-time platform activity feed showing user registrations, content changes, flagged items, and system events |

**Note**: The staff dashboard home page is imported from the root `pages/` directory (`DashboardStaff.tsx`), not from `pages/staff/`. All other staff pages are in `pages/staff/`.

---

## User Management (5 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 3 | `users` | `frontend/src/pages/staff/UsersListPage.tsx` | `UsersListPage` | User list with search, filtering by role, status, and registration date, plus bulk actions |
| 4 | `users/:userId` | `frontend/src/pages/staff/UserDetailPage.tsx` | `UserDetailPage` | Individual user profile view with activity history, enrolled courses, and account status |
| 5 | `users/:userId/edit` | `frontend/src/pages/staff/UserEditPage.tsx` | `UserEditPage` | Edit user profile fields, role assignment, and account status (active, suspended, banned) |
| 6 | `instructor-applications` | `frontend/src/pages/staff/InstructorApplicationsPage.tsx` | `InstructorApplicationsPage` | Review and approve or reject pending instructor applications with qualifications and background checks |
| 7 | `family-accounts` | `frontend/src/pages/staff/FamilyAccountsPage.tsx` | `FamilyAccountsPage` | Manage parent-child account linkages, verify family relationships, and handle family plan subscriptions |

---

## Content Moderation (4 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 8 | `moderation` | `frontend/src/pages/staff/ModerationQueuePage.tsx` | `ModerationQueuePage` | Content moderation queue showing flagged forum posts, course reviews, and user-generated content |
| 9 | `moderation/:itemId` | `frontend/src/pages/staff/ModerationDetailPage.tsx` | `ModerationDetailPage` | Detailed view of a flagged item with context, reporter info, and moderation actions (approve, remove, warn) |
| 10 | `course-reviews` | `frontend/src/pages/staff/CourseReviewsPage.tsx` | `CourseReviewsPage` | Review submitted courses for quality, CBC alignment, and content policy compliance before publishing |
| 11 | `reported-content` | `frontend/src/pages/staff/ReportedContentPage.tsx` | `ReportedContentPage` | Summary of all reported content across the platform with trending issues and resolution rates |

---

## System Monitoring (4 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 12 | `system-health` | `frontend/src/pages/staff/SystemHealthPage.tsx` | `SystemHealthPage` | System health dashboard showing API response times, database performance, Redis cache status, and error rates |
| 13 | `ai-monitoring` | `frontend/src/pages/staff/AIMonitoringPage.tsx` | `AIMonitoringPage` | AI provider monitoring with response times, token usage, cost tracking, and failover events across Gemini, Claude, OpenAI, and Grok |
| 14 | `audit-log` | `frontend/src/pages/staff/AuditLogPage.tsx` | `AuditLogPage` | Searchable audit log of administrative actions including user modifications, content changes, and security events |
| 15 | `error-tracker` | `frontend/src/pages/staff/ErrorTrackerPage.tsx` | `ErrorTrackerPage` | Application error tracker aggregating frontend and backend errors with stack traces and frequency analysis |

---

## Reports (4 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 16 | `reports` | `frontend/src/pages/staff/ReportsOverviewPage.tsx` | `ReportsOverviewPage` | Reports dashboard with links to user growth, revenue, engagement, and content reports |
| 17 | `reports/user-growth` | `frontend/src/pages/staff/UserGrowthReportPage.tsx` | `UserGrowthReportPage` | User registration and growth trends by role, grade level, and region with exportable charts |
| 18 | `reports/engagement` | `frontend/src/pages/staff/EngagementReportPage.tsx` | `EngagementReportPage` | Platform engagement metrics including DAU/MAU, session duration, course completion rates, and AI tutor usage |
| 19 | `reports/revenue` | `frontend/src/pages/staff/RevenueReportPage.tsx` | `RevenueReportPage` | Revenue analytics by payment method (M-Pesa, PayPal, Stripe), course category, and time period |

---

## Support (3 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 20 | `support-tickets` | `frontend/src/pages/staff/SupportTicketsPage.tsx` | `SupportTicketsPage` | Support ticket queue with priority sorting, assignment, and SLA tracking |
| 21 | `support-tickets/:ticketId` | `frontend/src/pages/staff/SupportTicketDetailPage.tsx` | `SupportTicketDetailPage` | Individual support ticket with conversation thread, internal notes, and resolution actions |
| 22 | `announcements` | `frontend/src/pages/staff/AnnouncementsPage.tsx` | `AnnouncementsPage` | Create and manage platform-wide announcements displayed on user dashboards |

---

## Account (4 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 23 | `notifications` | `frontend/src/pages/staff/StaffNotificationsPage.tsx` | `StaffNotificationsPage` | Staff notifications inbox for system alerts, ticket assignments, and moderation flags |
| 24 | `profile` | `frontend/src/pages/staff/StaffProfilePage.tsx` | `StaffProfilePage` | Staff profile settings including name, avatar, department, and contact information |
| 25 | `security` | `frontend/src/pages/staff/SecuritySettingsPage.tsx` | `SecuritySettingsPage` | Security settings with password change, two-factor authentication setup, and session management |
| 26 | `security/login-history` | `frontend/src/pages/staff/LoginHistoryPage.tsx` | `LoginHistoryPage` | Login history audit log showing timestamps, IP addresses, devices, and geolocation |

---

## Key Staff Components

The staff dashboard uses several specialized components found in `frontend/src/components/staff/`:

| Component | File Path | Description |
|-----------|-----------|-------------|
| `StaffSidebar` | `components/layout/Sidebar.tsx` | Staff uses the default sidebar with staff-specific menu items |
| `PendingTasksCard` | `components/staff/dashboard/PendingTasksCard.tsx` | Dashboard card showing pending moderation and support tasks |
| `SystemAlertsCard` | `components/staff/dashboard/SystemAlertsCard.tsx` | Dashboard card with system health alerts and warnings |
| `UserActivityCard` | `components/staff/dashboard/UserActivityCard.tsx` | Dashboard card showing recent user activity summary |
| `ModerationActionBar` | `components/staff/moderation/ModerationActionBar.tsx` | Action toolbar for moderation decisions (approve, flag, remove) |
| `UserProfileDrawer` | `components/staff/users/UserProfileDrawer.tsx` | Slide-out drawer for quick user profile viewing |
| `TicketThread` | `components/staff/support/TicketThread.tsx` | Support ticket conversation thread component |
| `ReportChart` | `components/staff/reports/ReportChart.tsx` | Reusable chart component for report visualizations |
| `AuditLogEntry` | `components/staff/monitoring/AuditLogEntry.tsx` | Individual audit log entry row component |
| `StaffPageHeader` | `components/staff/shared/StaffPageHeader.tsx` | Page header component for staff pages |

---

## Lazy Loading Note

All staff page components use named exports and are lazy-loaded with `.then()` module resolution:

```typescript
const ActivityFeedPage = lazy(() =>
  import('./pages/staff/ActivityFeedPage').then(m => ({ default: m.ActivityFeedPage }))
);
```

This pattern is consistent with the instructor dashboard and ensures that page bundles are only loaded when the user navigates to the corresponding route.
