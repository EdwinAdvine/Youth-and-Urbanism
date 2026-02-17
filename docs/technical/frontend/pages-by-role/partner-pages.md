# Partner Dashboard Pages

**Project**: Urban Home School (The Bird AI) / Urban Bird v1
**Base Route**: `/dashboard/partner`
**Layout**: `DashboardLayout` with `role="partner"` + `PartnerSidebar`
**Protection**: `ProtectedRoute` with `allowedRoles={['partner']}`
**Last Updated**: 2026-02-15

---

## Page Count Summary

| Section | Pages |
|---------|-------|
| Home | 2 |
| Sponsorships | 4 |
| Impact & Analytics | 5 |
| Programs | 4 |
| Payments | 4 |
| Account | 5 |
| **Total** | **24** |

---

## Home (2 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 1 | `/dashboard/partner` | `frontend/src/pages/DashboardPartner.tsx` | `DashboardPartner` | Partner dashboard home with sponsorship overview, impact summary, recent activity, and quick action cards |
| 2 | `highlights` | `frontend/src/pages/partner/HighlightsPage.tsx` | `PartnerHighlightsPage` | Recent highlights from sponsored students including achievements, course completions, and milestone events |

**Note**: The partner dashboard home page is imported from the root `pages/` directory (`DashboardPartner.tsx`), not from `pages/partner/`. All other partner pages are in `pages/partner/`.

---

## Sponsorships (4 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 3 | `sponsorships` | `frontend/src/pages/partner/SponsorshipsPage.tsx` | `SponsorshipsPage` | List of all active, pending, and completed sponsorships with filtering and search |
| 4 | `sponsorships/:sponsorshipId` | `frontend/src/pages/partner/SponsorshipDetailPage.tsx` | `SponsorshipDetailPage` | Detailed view of a specific sponsorship showing student progress, allocated funds, and timeline |
| 5 | `sponsorships/new` | `frontend/src/pages/partner/NewSponsorshipPage.tsx` | `NewSponsorshipPage` | Create a new sponsorship by selecting students, courses, or programs and setting funding parameters |
| 6 | `sponsored-students` | `frontend/src/pages/partner/SponsoredStudentsPage.tsx` | `SponsoredStudentsPage` | Overview of all students receiving sponsorship with aggregated performance metrics and demographic data |

---

## Impact & Analytics (5 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 7 | `impact` | `frontend/src/pages/partner/ImpactDashboardPage.tsx` | `ImpactDashboardPage` | Impact dashboard with KPIs including students reached, courses funded, completion rates, and grade improvements |
| 8 | `impact/student-outcomes` | `frontend/src/pages/partner/StudentOutcomesPage.tsx` | `StudentOutcomesPage` | Detailed student outcome analytics showing academic performance trends, skill development, and CBC competency growth |
| 9 | `impact/geographic` | `frontend/src/pages/partner/GeographicImpactPage.tsx` | `GeographicImpactPage` | Geographic distribution of impact across Kenyan counties with map visualization and regional statistics |
| 10 | `impact/reports` | `frontend/src/pages/partner/ImpactReportsPage.tsx` | `ImpactReportsPage` | Downloadable impact reports for stakeholders with customizable date ranges and metrics |
| 11 | `impact/comparison` | `frontend/src/pages/partner/BenchmarkComparisonPage.tsx` | `BenchmarkComparisonPage` | Benchmark comparison of sponsored student performance against platform averages and national standards |

---

## Programs (4 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 12 | `programs` | `frontend/src/pages/partner/ProgramsPage.tsx` | `ProgramsPage` | List of partner-funded educational programs with status, enrollment, and budget utilization |
| 13 | `programs/:programId` | `frontend/src/pages/partner/ProgramDetailPage.tsx` | `ProgramDetailPage` | Detailed view of a specific program with participant roster, milestones, and spending breakdown |
| 14 | `programs/new` | `frontend/src/pages/partner/NewProgramPage.tsx` | `NewProgramPage` | Create a new educational program with target criteria, budget allocation, and course selection |
| 15 | `programs/scholarships` | `frontend/src/pages/partner/ScholarshipsPage.tsx` | `ScholarshipsPage` | Manage scholarship funds including application criteria, selection pipeline, and disbursement tracking |

---

## Payments (4 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 16 | `payments` | `frontend/src/pages/partner/PaymentsOverviewPage.tsx` | `PaymentsOverviewPage` | Payment overview showing total contributions, payment history, and upcoming scheduled payments |
| 17 | `payments/history` | `frontend/src/pages/partner/PaymentHistoryPage.tsx` | `PaymentHistoryPage` | Complete payment transaction history with filtering by date, method, amount, and status |
| 18 | `payments/invoices` | `frontend/src/pages/partner/InvoicesPage.tsx` | `InvoicesPage` | Invoice management for sponsorship and program payments with PDF download support |
| 19 | `payments/recurring` | `frontend/src/pages/partner/RecurringPaymentsPage.tsx` | `RecurringPaymentsPage` | Manage recurring payment schedules for ongoing sponsorships and program funding commitments |

---

## Account (5 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 20 | `notifications` | `frontend/src/pages/partner/PartnerNotificationsPage.tsx` | `PartnerNotificationsPage` | Notifications inbox for sponsorship updates, student milestones, payment confirmations, and platform news |
| 21 | `profile` | `frontend/src/pages/partner/PartnerProfilePage.tsx` | `PartnerProfilePage` | Partner organization profile settings including company name, logo, contact details, and public profile |
| 22 | `profile/public` | `frontend/src/pages/partner/PublicProfilePage.tsx` | `PublicProfilePage` | Public-facing partner profile page settings visible at `/partners/:slug` showing impact and programs |
| 23 | `security` | `frontend/src/pages/partner/SecurityPage.tsx` | `PartnerSecurityPage` | Security settings with password change, two-factor authentication, and API key management for integrations |
| 24 | `security/login-history` | `frontend/src/pages/partner/LoginHistoryPage.tsx` | `PartnerLoginHistoryPage` | Login history audit log with timestamps, IP addresses, devices, and geolocation data |

---

## Key Partner Components

The partner dashboard uses several specialized components found in `frontend/src/components/partner/`:

| Component | File Path | Description |
|-----------|-----------|-------------|
| `PartnerSidebar` | `components/partner/PartnerSidebar.tsx` | Partner navigation sidebar with sponsorship-focused menu items |
| `ImpactSummaryCard` | `components/partner/dashboard/ImpactSummaryCard.tsx` | Dashboard card showing high-level impact metrics |
| `SponsorshipOverviewCard` | `components/partner/dashboard/SponsorshipOverviewCard.tsx` | Dashboard card with active sponsorship summary |
| `RecentActivityCard` | `components/partner/dashboard/RecentActivityCard.tsx` | Dashboard card showing recent student activity from sponsored students |
| `SponsorshipCard` | `components/partner/sponsorships/SponsorshipCard.tsx` | Individual sponsorship card with student info and progress |
| `StudentOutcomeChart` | `components/partner/analytics/StudentOutcomeChart.tsx` | Chart component for visualizing student outcome trends |
| `ImpactMapVisualization` | `components/partner/analytics/ImpactMapVisualization.tsx` | Kenya county-level map showing geographic impact distribution |
| `ProgramCard` | `components/partner/programs/ProgramCard.tsx` | Program summary card with enrollment and budget info |
| `PaymentRow` | `components/partner/payments/PaymentRow.tsx` | Payment transaction row component for payment tables |
| `PartnerPageHeader` | `components/partner/shared/PartnerPageHeader.tsx` | Page header component for partner pages |

---

## Lazy Loading Note

All partner page components use named exports and are lazy-loaded with `.then()` module resolution:

```typescript
const SponsorshipsPage = lazy(() =>
  import('./pages/partner/SponsorshipsPage').then(m => ({ default: m.SponsorshipsPage }))
);
```

This pattern is consistent with other role dashboards (instructor, staff) and ensures that page bundles are only loaded when the user navigates to the corresponding route.
