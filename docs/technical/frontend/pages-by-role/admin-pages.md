# Admin Dashboard Pages

**Project**: Urban Home School (The Bird AI) / Urban Bird v1
**Base Route**: `/dashboard/admin`
**Layout**: `DashboardLayout` with `role="admin"` + `AdminSidebar`
**Protection**: `ProtectedRoute` with `allowedRoles={['admin']}`
**Last Updated**: 2026-02-15

---

## Page Count Summary

| Section | Pages |
|---------|-------|
| Home & Overview | 3 |
| People & Access | 5 |
| Content & Learning | 5 |
| AI Systems | 4 |
| Analytics & Intelligence | 4 |
| Finance & Partnerships | 4 |
| Operations & Control | 6 |
| Account | 3 |
| **Total** | **34** |

---

## Home & Overview (3 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 1 | `/dashboard/admin` | `frontend/src/pages/admin/AdminDashboardPage.tsx` | `AdminDashboardPage` | Admin dashboard home with BentoGrid layout showing alerts, enrollments, revenue, pending items, and AI anomalies |
| 2 | `pulse` | `frontend/src/pages/admin/PlatformPulsePage.tsx` | `PlatformPulsePage` | Real-time platform pulse with health status, urgent flags, and realtime overview |
| 3 | `ai-providers` | `frontend/src/pages/admin/AIProvidersPage.tsx` | `AIProvidersPage` | AI provider management (configure Gemini, Claude, OpenAI, Grok, ElevenLabs, Synthesia) |

---

## People & Access (5 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 4 | `users` | `frontend/src/pages/admin/UsersPage.tsx` | `UsersPage` | User management with filtering, search, and bulk actions |
| 5 | `users/:id` | `frontend/src/pages/admin/UserDetailPage.tsx` | `UserDetailPage` | Individual user detail with profile drawer |
| 6 | `roles-permissions` | `frontend/src/pages/admin/RolesPermissionsPage.tsx` | `RolesPermissionsPage` | Role and permission matrix management |
| 7 | `families` | `frontend/src/pages/admin/FamiliesPage.tsx` | `FamiliesPage` | Family account management (parent-child relationships) |
| 8 | `restrictions` | `frontend/src/pages/admin/RestrictionsPage.tsx` | `RestrictionsPage` | Access restrictions and content filtering rules |

---

## Content & Learning (5 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 9 | `courses` | `frontend/src/pages/admin/CoursesAdminPage.tsx` | `CoursesAdminPage` | Course management (approve, edit, remove courses) |
| 10 | `cbc-alignment` | `frontend/src/pages/admin/CBCAlignmentPage.tsx` | `CBCAlignmentPage` | Platform-wide CBC curriculum alignment settings |
| 11 | `assessments` | `frontend/src/pages/admin/AssessmentsAdminPage.tsx` | `AssessmentsAdminPage` | Assessment management and quality control |
| 12 | `certificates` | `frontend/src/pages/admin/CertificatesAdminPage.tsx` | `CertificatesAdminPage` | Certificate template and issuance management |
| 13 | `resources` | `frontend/src/pages/admin/ResourceLibraryPage.tsx` | `ResourceLibraryPage` | Platform resource library management |

---

## AI Systems (4 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 14 | `ai-monitoring` | `frontend/src/pages/admin/AIMonitoringPage.tsx` | `AIMonitoringPage` | AI system monitoring (response times, error rates, cost tracking) |
| 15 | `ai-content` | `frontend/src/pages/admin/AIContentReviewPage.tsx` | `AIContentReviewPage` | Review AI-generated content for quality and safety |
| 16 | `ai-personalization` | `frontend/src/pages/admin/AIPersonalizationPage.tsx` | `AIPersonalizationPage` | AI personalization settings and student profiling configuration |
| 17 | `ai-performance` | `frontend/src/pages/admin/AIPerformancePage.tsx` | `AIPerformancePage` | AI model performance metrics and benchmarks |

---

## Analytics & Intelligence (4 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 18 | `analytics/learning` | `frontend/src/pages/admin/LearningAnalyticsPage.tsx` | `LearningAnalyticsPage` | Learning analytics across all students |
| 19 | `analytics/business` | `frontend/src/pages/admin/BusinessAnalyticsPage.tsx` | `BusinessAnalyticsPage` | Business metrics (revenue, growth, retention) |
| 20 | `analytics/compliance` | `frontend/src/pages/admin/CompliancePage.tsx` | `CompliancePage` | Compliance reporting (GDPR, DPA, data protection) |
| 21 | `analytics/custom` | `frontend/src/pages/admin/CustomInsightsPage.tsx` | `CustomInsightsPage` | Custom insights builder with AI query builder |

---

## Finance & Partnerships (4 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 22 | `finance/transactions` | `frontend/src/pages/admin/MoneyFlowPage.tsx` | `MoneyFlowPage` | Transaction flow and money movement tracking |
| 23 | `finance/plans` | `frontend/src/pages/admin/PlansPage.tsx` | `PlansPage` | Subscription plan management and pricing |
| 24 | `partners` | `frontend/src/pages/admin/PartnersAdminPage.tsx` | `PartnersAdminPage` | Partner organization management |
| 25 | `invoices` | `frontend/src/pages/admin/InvoicesPage.tsx` | `InvoicesPage` | Invoice management and billing |

---

## Operations & Control (6 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 26 | `tickets` | `frontend/src/pages/admin/TicketsPage.tsx` | `TicketsPage` | Support ticket management queue |
| 27 | `tickets/:id` | `frontend/src/pages/admin/TicketDetailPage.tsx` | `TicketDetailPage` | Individual support ticket detail and resolution |
| 28 | `moderation` | `frontend/src/pages/admin/ModerationPage.tsx` | `ModerationPage` | Content moderation queue and actions |
| 29 | `config` | `frontend/src/pages/admin/SystemConfigPage.tsx` | `SystemConfigPage` | System configuration settings |
| 30 | `audit-logs` | `frontend/src/pages/admin/AuditLogsPage.tsx` | `AuditLogsPage` | Audit log viewer for security and compliance |
| 31 | `system-health` | `frontend/src/pages/admin/SystemHealthPage.tsx` | `SystemHealthPage` | System health dashboard (server status, database, Redis, API) |

---

## Account (3 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 32 | `notifications` | `frontend/src/pages/admin/AdminNotificationsPage.tsx` | `AdminNotificationsPage` | Admin notifications inbox |
| 33 | `profile` | `frontend/src/pages/admin/AdminProfilePage.tsx` | `AdminProfilePage` | Admin profile settings |
| 34 | `preferences` | `frontend/src/pages/admin/AdminPreferencesPage.tsx` | `AdminPreferencesPage` | Admin preferences (theme, notifications, display) |

---

## Key Admin Components

The admin dashboard uses a rich set of specialized components found in `frontend/src/components/admin/`:

### Dashboard Components
| Component | File Path | Description |
|-----------|-----------|-------------|
| `AIAnomaliesCard` | `components/admin/dashboard/AIAnomaliesCard.tsx` | AI anomaly detection dashboard card |
| `AlertsCard` | `components/admin/dashboard/AlertsCard.tsx` | Active alerts card |
| `BentoGrid` | `components/admin/dashboard/BentoGrid.tsx` | Bento grid layout for dashboard |
| `EnrollmentsCard` | `components/admin/dashboard/EnrollmentsCard.tsx` | Enrollment metrics card |
| `PendingItemsCard` | `components/admin/dashboard/PendingItemsCard.tsx` | Pending approvals card |
| `RevenueCard` | `components/admin/dashboard/RevenueCard.tsx` | Revenue overview card |

### Platform Pulse Components
| Component | File Path | Description |
|-----------|-----------|-------------|
| `HealthStatus` | `components/admin/pulse/HealthStatus.tsx` | System health status indicator |
| `RealtimeOverview` | `components/admin/pulse/RealtimeOverview.tsx` | Real-time platform overview |
| `UrgentFlags` | `components/admin/pulse/UrgentFlags.tsx` | Urgent system flags display |

### Analytics Components
| Component | File Path | Description |
|-----------|-----------|-------------|
| `AIQueryBuilder` | `components/admin/analytics/AIQueryBuilder.tsx` | AI-powered analytics query builder |
| `ChartRenderer` | `components/admin/analytics/ChartRenderer.tsx` | Dynamic chart rendering component |

### Shared Admin Components
| Component | File Path | Description |
|-----------|-----------|-------------|
| `AdminBadge` | `components/admin/shared/AdminBadge.tsx` | Admin-styled badge |
| `AdminBentoCard` | `components/admin/shared/AdminBentoCard.tsx` | Reusable bento card |
| `AdminBulkActions` | `components/admin/shared/AdminBulkActions.tsx` | Bulk action toolbar |
| `AdminChart` | `components/admin/shared/AdminChart.tsx` | Chart wrapper |
| `AdminDataTable` | `components/admin/shared/AdminDataTable.tsx` | Data table with sort/filter |
| `AdminEmptyState` | `components/admin/shared/AdminEmptyState.tsx` | Empty state placeholder |
| `AdminExportButton` | `components/admin/shared/AdminExportButton.tsx` | Data export button |
| `AdminFilterPanel` | `components/admin/shared/AdminFilterPanel.tsx` | Advanced filter panel |
| `AdminLoadingSkeleton` | `components/admin/shared/AdminLoadingSkeleton.tsx` | Loading skeleton |
| `AdminModal` | `components/admin/shared/AdminModal.tsx` | Modal dialog |
| `AdminPageHeader` | `components/admin/shared/AdminPageHeader.tsx` | Page header with breadcrumbs |
| `AdminStatsCard` | `components/admin/shared/AdminStatsCard.tsx` | Statistics card |

### Other Admin Components
| Component | File Path | Description |
|-----------|-----------|-------------|
| `AdminSidebar` | `components/admin/sidebar/AdminSidebar.tsx` | Admin navigation sidebar |
| `PermissionMatrix` | `components/admin/permissions/PermissionMatrix.tsx` | Permission matrix editor |
| `UserProfileDrawer` | `components/admin/users/UserProfileDrawer.tsx` | User profile slide-out drawer |
| `AIProviderForm` | `components/admin/AIProviderForm.tsx` | AI provider configuration form |
| `AIProviderList` | `components/admin/AIProviderList.tsx` | AI providers list |
| `RecommendedProviders` | `components/admin/RecommendedProviders.tsx` | Recommended AI providers |
