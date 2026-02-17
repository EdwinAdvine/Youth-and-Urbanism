# Parent Dashboard Pages

**Project**: Urban Home School (The Bird AI) / Urban Bird v1
**Base Route**: `/dashboard/parent`
**Layout**: `DashboardLayout` with `role="parent"` + `ParentSidebar`
**Protection**: `ProtectedRoute` with `allowedRoles={['parent']}`
**Last Updated**: 2026-02-15

---

## Page Count Summary

| Section | Pages |
|---------|-------|
| Home & Quick Access | 4 |
| Children | 2 |
| AI Insights (with childId) | 6 |
| AI Insights (without childId) | 6 |
| Children Sub-pages | 5 |
| Communications | 3 |
| Finance | 4 |
| Reports | 4 |
| Settings | 6 |
| **Total** | **40** (34 unique page components, 6 duplicated routes for AI Insights) |

---

## Home & Quick Access (4 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 1 | `/dashboard/parent` | `frontend/src/pages/parent/ParentDashboardHome.tsx` | `ParentDashboardHome` | Parent dashboard home with highlights, urgent items, and children overview |
| 2 | `highlights` | `frontend/src/pages/parent/HighlightsPage.tsx` | `HighlightsPage` | Children's recent highlights and accomplishments |
| 3 | `urgent` | `frontend/src/pages/parent/UrgentItemsPage.tsx` | `ParentUrgentItemsPage` | Urgent items requiring parental attention |
| 4 | `mood` | `frontend/src/pages/parent/MoodSnapshotPage.tsx` | `MoodSnapshotPage` | Children's mood snapshot and emotional wellbeing |

---

## Children (2 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 5 | `children` | `frontend/src/pages/parent/ChildrenOverviewPage.tsx` | `ChildrenOverviewPage` | Overview of all children with summary stats |
| 6 | `children/:childId` | `frontend/src/pages/parent/ChildDetailPage.tsx` | `ChildDetailPage` | Detailed view of a specific child's progress |

---

## AI Insights - With Child Context (6 routes)

These routes accept a `:childId` parameter to show AI insights for a specific child.

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 7 | `ai/summary/:childId` | `frontend/src/pages/parent/AIInsightsPage.tsx` | `ParentAIInsightsPage` | AI-generated summary insights for a specific child |
| 8 | `ai/learning-style/:childId` | `frontend/src/pages/parent/AILearningStylePage.tsx` | `AILearningStylePage` | AI analysis of child's learning style |
| 9 | `ai/support-tips/:childId` | `frontend/src/pages/parent/AISupportTipsPage.tsx` | `AISupportTipsPage` | AI-generated parenting support tips for child |
| 10 | `ai/planning/:childId` | `frontend/src/pages/parent/AIPlanningPage.tsx` | `AIPlanningPage` | AI-assisted learning plan for child |
| 11 | `ai/patterns/:childId` | `frontend/src/pages/parent/AIPatternsPage.tsx` | `AIPatternsPage` | AI-detected learning patterns for child |
| 12 | `ai/warnings/:childId` | `frontend/src/pages/parent/AIWarningsPage.tsx` | `AIWarningsPage` | AI warnings and risk indicators for child |

---

## AI Insights - Without Child Context (6 routes)

Same page components, accessible without a specific child selected (shows aggregated or prompts child selection).

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 13 | `ai/summary` | `frontend/src/pages/parent/AIInsightsPage.tsx` | `ParentAIInsightsPage` | AI insights overview (all children) |
| 14 | `ai/learning-style` | `frontend/src/pages/parent/AILearningStylePage.tsx` | `AILearningStylePage` | Learning style overview |
| 15 | `ai/support-tips` | `frontend/src/pages/parent/AISupportTipsPage.tsx` | `AISupportTipsPage` | Support tips overview |
| 16 | `ai/planning` | `frontend/src/pages/parent/AIPlanningPage.tsx` | `AIPlanningPage` | Planning overview |
| 17 | `ai/patterns` | `frontend/src/pages/parent/AIPatternsPage.tsx` | `AIPatternsPage` | Patterns overview |
| 18 | `ai/warnings` | `frontend/src/pages/parent/AIWarningsPage.tsx` | `AIWarningsPage` | Warnings overview |

---

## Children Sub-pages (5 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 19 | `learning-journey` | `frontend/src/pages/parent/LearningJourneyPage.tsx` | `LearningJourneyPage` | Child's complete learning journey timeline |
| 20 | `cbc-competencies` | `frontend/src/pages/parent/CBCCompetenciesPage.tsx` | `CBCCompetenciesPage` | CBC competency tracking with radar chart |
| 21 | `activity` | `frontend/src/pages/parent/ActivityPage.tsx` | `ParentActivityPage` | Child activity log and timeline |
| 22 | `achievements` | `frontend/src/pages/parent/AchievementsPage.tsx` | `ParentAchievementsPage` | Child achievements and badges |
| 23 | `goals` | `frontend/src/pages/parent/GoalsPage.tsx` | `ParentGoalsPage` | Child goal management and tracking |

---

## Communications (3 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 24 | `communications/inbox` | `frontend/src/pages/parent/NotificationsInboxPage.tsx` | `NotificationsInboxPage` | Notifications inbox from school |
| 25 | `messages` | `frontend/src/pages/parent/MessagesPage.tsx` | `ParentMessagesPage` | Messages with teachers and staff |
| 26 | `support` | `frontend/src/pages/parent/SupportPage.tsx` | `ParentSupportPage` | Support center for parents |

---

## Finance (4 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 27 | `finance/subscription` | `frontend/src/pages/parent/SubscriptionPage.tsx` | `SubscriptionPage` | Current subscription plan details |
| 28 | `finance/history` | `frontend/src/pages/parent/PaymentHistoryPage.tsx` | `PaymentHistoryPage` | Payment and billing history |
| 29 | `finance/manage` | `frontend/src/pages/parent/ManageSubscriptionPage.tsx` | `ManageSubscriptionPage` | Manage subscription (upgrade, downgrade, cancel) |
| 30 | `finance/addons` | `frontend/src/pages/parent/AddonsPage.tsx` | `ParentAddonsPage` | Browse and purchase add-ons |

---

## Reports (4 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 31 | `reports` | `frontend/src/pages/parent/ReportsListPage.tsx` | `ReportsListPage` | List of available reports |
| 32 | `reports/term-summary` | `frontend/src/pages/parent/TermSummaryPage.tsx` | `TermSummaryPage` | Term summary report with grades and progress |
| 33 | `reports/transcripts` | `frontend/src/pages/parent/TranscriptsPage.tsx` | `TranscriptsPage` | Academic transcripts download |
| 34 | `reports/portfolio` | `frontend/src/pages/parent/PortfolioExportPage.tsx` | `PortfolioExportPage` | Export child's learning portfolio |

---

## Settings (6 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 35 | `settings/notifications` | `frontend/src/pages/parent/NotificationPrefsPage.tsx` | `NotificationPrefsPage` | Notification preference settings |
| 36 | `settings/consent` | `frontend/src/pages/parent/ConsentPage.tsx` | `ParentConsentPage` | Data consent and privacy management |
| 37 | `settings/privacy` | `frontend/src/pages/parent/PrivacyPage.tsx` | `ParentPrivacyPage` | Privacy settings and data controls |
| 38 | `settings/family` | `frontend/src/pages/parent/FamilyMembersPage.tsx` | `FamilyMembersPage` | Manage family members and access |
| 39 | `settings/profile` | `frontend/src/pages/parent/ProfilePage.tsx` | `ParentProfilePage` | Parent profile settings |
| 40 | `settings/security` | `frontend/src/pages/parent/SecurityPage.tsx` | `ParentSecurityPage` | Security settings (password, 2FA) |

---

## Key Parent Components

The parent dashboard uses several specialized components found in `frontend/src/components/parent/`:

| Component | File Path | Description |
|-----------|-----------|-------------|
| `ParentSidebar` | `components/parent/ParentSidebar.tsx` | Parent navigation sidebar with child selector |
| `ChildSelector` | `components/parent/ChildSelector.tsx` | Dropdown to select active child context |
| `CBCRadarChart` | `components/parent/children/CBCRadarChart.tsx` | CBC competency radar chart visualization |
| `ActivityTimeline` | `components/parent/children/ActivityTimeline.tsx` | Child activity timeline component |
| `GoalManager` | `components/parent/children/GoalManager.tsx` | Goal management component |
