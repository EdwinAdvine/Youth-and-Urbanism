# Frontend Routing Map

**Project**: Urban Home School (The Bird AI) / Urban Bird v1
**Router**: React Router v7 (BrowserRouter)
**Source**: `frontend/src/App.tsx`
**Last Updated**: 2026-02-15

---

## Route Summary

| Section | Route Count | Auth Required | Role Restriction |
|---------|-------------|---------------|-----------------|
| Public Routes | 12 | No | None |
| Special Routes | 2 | No | None |
| Student Dashboard | 93 | Yes | student |
| Parent Dashboard | 48 | Yes | parent |
| Instructor Dashboard | 41 | Yes | instructor |
| Partner Dashboard | 38 | Yes | partner |
| Staff Dashboard | 39 | Yes | staff |
| Admin Dashboard | 36 | Yes | admin |
| Non-Dashboard Auth | 14 | Yes | Any role |
| Catch-all (404) | 1 | No | None |
| **Total** | **~324** | | |

---

## Public Routes (under PublicLayout)

These routes use `PublicLayout` which provides `PublicHeader` + `<Outlet />` + `Footer`.

| Route | Page Component | Description |
|-------|---------------|-------------|
| `/` | `HomePage` | Landing page (redirects to dashboard if authenticated) |
| `/courses` | `CourseCatalogPage` | Public course catalog |
| `/courses/:courseId` | `CourseDetailsPage` | Individual course detail page |
| `/pricing` | `PricingPage` | Subscription pricing plans |
| `/store` | `StorePage` | E-commerce store |
| `/store/products/:slug` | `ProductDetailPage` | Product detail page |
| `/how-it-works` | `HowItWorksPage` | Platform explanation page |
| `/about` | `AboutPage` | About the platform |
| `/contact` | `ContactPage` | Contact information |
| `/certificate-validation` | `CertificateValidationPage` | Validate certificates by code |
| `/become-instructor` | `BecomeInstructorPage` | Instructor registration landing |
| `/categories/:slug` | `PlaceholderPage` | Category placeholder (title="Category") |
| `/forum` | `PublicForumPage` | Public forum page |

---

## Special Routes (No Layout Wrapper)

These routes render without any shared layout.

| Route | Page Component | Description |
|-------|---------------|-------------|
| `/the-bird` | `BotPage` | Full-screen Bird AI chat experience |
| `/instructor/:slug` | `InstructorPublicProfilePage` | Public instructor profile (lazy-loaded) |

---

## Student Dashboard (`/dashboard/student`)

**Layout**: `DashboardLayout` with `role="student"`
**Protection**: `ProtectedRoute` with `allowedRoles={['student']}`
**All routes are lazy-loaded and wrapped with Suspense.**

### Home
| Route | Page Component | Description |
|-------|---------------|-------------|
| `/dashboard/student` (index) | `StudentDashboardHome` | Student dashboard home with widgets |

### Today (5 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `today/ai-plan` | `AIPlanPage` | AI-generated daily learning plan |
| `today/streak` | `StreakPage` | Learning streak tracker |
| `today/mood` | `MoodCheckPage` | Daily mood check-in |
| `today/urgent` | `UrgentItemsPage` | Urgent items requiring attention |
| `today/quote` | `DailyQuotePage` | Daily inspirational quote |

### AI Tutor (6 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `ai-tutor/chat` | `AITutorChatPage` | AI tutor chat interface |
| `ai-tutor/learning-path` | `LearningPathPage` | AI-generated learning path |
| `ai-tutor/voice` | `VoiceModePage` | Voice interaction mode |
| `ai-tutor/journal` | `AIJournalPage` | AI learning journal |
| `ai-tutor/explain` | `HelpMeUnderstandPage` | AI explanation tool |
| `ai-tutor/teacher-collab` | `TeacherCollabPage` | AI-teacher collaboration view |

### Learning - Courses (6 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `courses/enrolled` | `EnrolledCoursesPage` | List of enrolled courses |
| `courses/ai-recommended` | `AIRecommendedPage` | AI-recommended courses |
| `browse/marketplace` | `BrowseCoursesPage` | Browse course marketplace |
| `browse/wishlist` | `WishlistPage` | Saved/wishlisted courses |
| `browse/topics` | `TopicExplorerPage` | Topic explorer |
| `browse/course/:id` | `CoursePreviewPage` | Course preview before enrollment |

### Learning - Live Sessions (4 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `live/join` | `JoinLivePage` | Join a live session |
| `live/upcoming` | `UpcomingSessionsPage` | Upcoming scheduled sessions |
| `live/calendar` | `ClassCalendarPage` | Class session calendar |
| `live/recordings` | `RecordingsPage` | Session recordings library |

### Practice & Assessments (14 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `practice/challenges` | `TodaysChallengesPage` | Daily practice challenges |
| `assignments/due-soon` | `AssignmentsDueSoonPage` | Assignments due soon |
| `assignments/pending` | `AssignmentsPendingPage` | Pending assignments |
| `assignments/submitted` | `AssignmentsSubmittedPage` | Submitted assignments |
| `assignments/feedback` | `AssignmentsFeedbackPage` | Assignment feedback view |
| `assignments/resubmit/:id` | `AssignmentsResubmitPage` | Resubmit an assignment |
| `quizzes/upcoming` | `QuizzesUpcomingPage` | Upcoming quizzes |
| `quizzes/practice` | `QuizPracticeModePage` | Quiz practice mode |
| `quizzes/results` | `QuizResultsPage` | Quiz results history |
| `quizzes/skill-reports` | `SkillReportsPage` | Quiz skill reports |
| `projects/active` | `ActiveProjectsPage` | Active projects |
| `projects/upload` | `ProjectUploadPage` | Upload project work |
| `projects/gallery` | `PeerGalleryPage` | Peer project gallery |
| `projects/feedback` | `ProjectFeedbackPage` | Project feedback view |

### Progress & Growth (15 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `achievements/gallery` | `AchievementsGalleryPage` | Achievements and badges gallery |
| `achievements/recent` | `RecentUnlocksPage` | Recently unlocked achievements |
| `achievements/share` | `ShareableCardsPage` | Shareable achievement cards |
| `learning-map` | `LearningMapPage` | Visual learning map |
| `learning-map/strengths` | `StrengthsPage` | Skill strengths analysis |
| `learning-map/growing` | `GrowingAreasPage` | Areas for growth |
| `reports/weekly` | `WeeklyStoryPage` | Weekly progress story |
| `reports/trends` | `VisualTrendsPage` | Visual trend analysis |
| `reports/parent` | `ParentSummaryPage` | Parent summary report |
| `reports/nudges` | `AINudgesPage` | AI learning nudges |
| `reports/teacher` | `TeacherInsightsPage` | Teacher insights view |
| `goals/set` | `SetGoalsPage` | Set learning goals |
| `goals/streaks` | `TrackStreaksPage` | Track goal streaks |

### Community (11 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `community/connect` | `ConnectPage` | Connect with peers |
| `community/study-groups` | `StudyGroupsPage` | Study groups |
| `community/projects` | `CollaborativeProjectsPage` | Collaborative projects |
| `community/questions/new` | `NewQuestionsPage` | New community questions |
| `community/shoutouts/give` | `GiveShoutoutsPage` | Give shoutouts to peers |
| `community/shoutouts/received` | `ReceiveShoutoutsPage` | View received shoutouts |
| `community/teacher-qa` | `TeacherQAPage` | Teacher Q&A section |
| `discussions/recent` | `DiscussionsRecentPage` | Recent discussions |
| `discussions/my-posts` | `MyPostsPage` | My forum posts |
| `discussions/saved` | `SavedPostsPage` | Saved/bookmarked posts |
| `shoutouts/wall` | `ClassWallPage` | Class shoutout wall |

### Wallet & Access (10 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `wallet/balance` | `WalletBalancePage` | Wallet balance overview |
| `wallet/add/mpesa` | `MpesaTopupPage` | M-Pesa top-up |
| `wallet/add/card` | `CardPaymentPage` | Card payment |
| `wallet/transactions` | `RecentTransactionsPage` | Recent transactions |
| `wallet/methods` | `PaymentMethodsPage` | Payment methods management |
| `wallet/upgrade` | `UpgradePlanPage` | Upgrade subscription plan |
| `wallet/family` | `FamilyPlanPage` | Family plan management |
| `wallet/receipts` | `ReceiptsPage` | Payment receipts |
| `wallet/advisor` | `AIFundAdvisorPage` | AI financial advisor |
| `subscriptions` | `SubscriptionsPage` | Subscription management |

### Support & Help (7 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `support/guides` | `HowToGuidesPage` | How-to guides |
| `support/contact` | `ContactSupportPage` | Contact support |
| `support/community` | `AskCommunityPage` | Ask the community |
| `support/teacher-chat` | `TeacherChatPage` | Chat with teacher |
| `support/urgent` | `UrgentFlagPage` | Flag urgent issue |
| `support/report` | `ReportProblemPage` | Report a problem |
| `support/ai-help` | `AIHelpTriagePage` | AI help triage |

### Account (12 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `notifications` | `StudentNotificationsPage` | Notifications inbox |
| `notifications/priority` | `PriorityAlertsPage` | Priority alerts |
| `notifications/settings` | `NotificationSettingsPage` | Notification settings |
| `profile` | `StudentProfilePage` | Student profile |
| `profile/avatar` | `AvatarPage` | Avatar customization |
| `profile/bio` | `BioPage` | Bio editor |
| `profile/learning-style` | `LearningStylePage` | Learning style settings |
| `profile/interests` | `InterestsPage` | Interest tags |
| `preferences` | `StudentPreferencesPage` | General preferences |
| `preferences/ai-personality` | `AIPersonalityPage` | AI tutor personality settings |
| `privacy` | `PrivacySecurityPage` | Privacy and security settings |
| `privacy/teacher-access` | `TeacherAccessPage` | Teacher data access permissions |

**Total Student Routes: 93**

---

## Parent Dashboard (`/dashboard/parent`)

**Layout**: `DashboardLayout` with `role="parent"`
**Protection**: `ProtectedRoute` with `allowedRoles={['parent']}`

### Home & Quick Access (3 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `/dashboard/parent` (index) | `ParentDashboardHome` | Parent dashboard home |
| `highlights` | `HighlightsPage` | Children's highlights |
| `urgent` | `ParentUrgentItemsPage` | Urgent items |
| `mood` | `MoodSnapshotPage` | Children's mood snapshot |

### Children (2 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `children` | `ChildrenOverviewPage` | Overview of all children |
| `children/:childId` | `ChildDetailPage` | Individual child detail |

### AI Insights (12 routes - 6 with childId, 6 without)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `ai/summary/:childId` | `ParentAIInsightsPage` | AI insights for specific child |
| `ai/learning-style/:childId` | `AILearningStylePage` | Learning style analysis for child |
| `ai/support-tips/:childId` | `AISupportTipsPage` | AI support tips for child |
| `ai/planning/:childId` | `AIPlanningPage` | AI planning for child |
| `ai/patterns/:childId` | `AIPatternsPage` | Learning patterns for child |
| `ai/warnings/:childId` | `AIWarningsPage` | AI warnings for child |
| `ai/summary` | `ParentAIInsightsPage` | AI insights (no child selected) |
| `ai/learning-style` | `AILearningStylePage` | Learning style (no child selected) |
| `ai/support-tips` | `AISupportTipsPage` | Support tips (no child selected) |
| `ai/planning` | `AIPlanningPage` | Planning (no child selected) |
| `ai/patterns` | `AIPatternsPage` | Patterns (no child selected) |
| `ai/warnings` | `AIWarningsPage` | Warnings (no child selected) |

### Children Sub-pages (5 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `learning-journey` | `LearningJourneyPage` | Child's learning journey |
| `cbc-competencies` | `CBCCompetenciesPage` | CBC competency tracking |
| `activity` | `ParentActivityPage` | Child activity log |
| `achievements` | `ParentAchievementsPage` | Child achievements |
| `goals` | `ParentGoalsPage` | Child goal management |

### Communications (3 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `communications/inbox` | `NotificationsInboxPage` | Notifications inbox |
| `messages` | `ParentMessagesPage` | Messages |
| `support` | `ParentSupportPage` | Support center |

### Finance (4 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `finance/subscription` | `SubscriptionPage` | Subscription management |
| `finance/history` | `PaymentHistoryPage` | Payment history |
| `finance/manage` | `ManageSubscriptionPage` | Manage subscription |
| `finance/addons` | `ParentAddonsPage` | Add-ons marketplace |

### Reports (4 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `reports` | `ReportsListPage` | Reports list |
| `reports/term-summary` | `TermSummaryPage` | Term summary report |
| `reports/transcripts` | `TranscriptsPage` | Academic transcripts |
| `reports/portfolio` | `PortfolioExportPage` | Portfolio export |

### Settings (6 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `settings/notifications` | `NotificationPrefsPage` | Notification preferences |
| `settings/consent` | `ParentConsentPage` | Data consent management |
| `settings/privacy` | `ParentPrivacyPage` | Privacy settings |
| `settings/family` | `FamilyMembersPage` | Family member management |
| `settings/profile` | `ParentProfilePage` | Parent profile |
| `settings/security` | `ParentSecurityPage` | Security settings |

**Total Parent Routes: 48**

---

## Instructor Dashboard (`/dashboard/instructor`)

**Layout**: `DashboardLayout` with `role="instructor"`
**Protection**: `ProtectedRoute` with `allowedRoles={['instructor']}`

### Home & AI (2 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `/dashboard/instructor` (index) | `DashboardInstructor` | Instructor dashboard home |
| `insights` | `AIInsightsPage` | AI-powered teaching insights |

### Courses (4 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `courses` | `MyCoursesInstructorPage` | My courses list |
| `courses/editor` | `CourseEditorPage` | Course editor |
| `courses/:courseId/modules` | `ModulesEditorPage` | Course modules editor |
| `courses/:courseId/cbc-alignment` | `CBCAlignmentInstructorPage` | CBC alignment tool |

### Assessments (4 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `assessments` | `AssessmentsInstructorPage` | Assessments list |
| `assessments/editor` | `AssessmentEditorPage` | Assessment editor |
| `submissions` | `SubmissionsPage` | Student submissions |
| `resources` | `ResourcesInstructorPage` | Teaching resources |

### Sessions (3 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `sessions` | `SessionsInstructorPage` | Sessions list |
| `sessions/:sessionId` | `SessionDetailInstructorPage` | Session detail |
| `sessions/:sessionId/live` | `LiveSessionPage` | Live session room |

### Student Analytics (6 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `messages` | `MessagesPage` | Messages center |
| `ai-handoff` | `AIHandoffPage` | AI-to-teacher handoff |
| `progress-pulse` | `ProgressPulsePage` | Student progress pulse |
| `interventions` | `InterventionsPage` | Student interventions |
| `discussions` | `DiscussionsPage` | Course discussions |
| `feedback` | `FeedbackPage` | Student feedback |
| `feedback/sentiment` | `SentimentAnalysisPage` | Sentiment analysis |

### Recognition (3 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `performance` | `PerformancePage` | Teaching performance metrics |
| `badges` | `BadgesPage` | Teaching badges |
| `recognition` | `RecognitionPage` | Recognition and awards |

### Earnings (5 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `earnings` | `EarningsDashboardPage` | Earnings dashboard |
| `earnings/breakdown` | `EarningsBreakdownPage` | Earnings breakdown |
| `earnings/payouts` | `PayoutsPage` | Payout history |
| `earnings/rates` | `RatesPage` | Rate management |
| `earnings/documents` | `DocumentsPage` | Tax documents |

### Hub (5 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `hub/cbc-references` | `CBCReferencesPage` | CBC curriculum references |
| `hub/ai-prompts` | `AIPromptsPage` | AI prompt library |
| `hub/community` | `CommunityLoungePage` | Instructor community |
| `hub/co-create` | `CoCreatePage` | Co-creation tools |
| `hub/support` | `SupportTicketsPage` | Support tickets |
| `hub/support/ticket/:ticketId` | `SupportTicketDetailPage` | Support ticket detail |

### Account (6 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `notifications` | `InstructorNotificationsPage` | Notifications |
| `profile` | `InstructorProfilePage` | Instructor profile |
| `profile/public` | `PublicPageSettingsPage` | Public profile settings |
| `availability` | `AvailabilityPage` | Availability calendar |
| `security` | `SecurityPage` | Security settings |
| `security/login-history` | `LoginHistoryPage` | Login history |

**Total Instructor Routes: 41**

---

## Partner Dashboard (`/dashboard/partner`)

**Layout**: `DashboardLayout` with `role="partner"`
**Protection**: `ProtectedRoute` with `allowedRoles={['partner']}`

### Home & Quick Access (3 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `/dashboard/partner` (index) | `PartnerDashboardPage` | Partner dashboard home |
| `quick-links` | `QuickLinksPage` | Quick access links |
| `ai-highlights` | `AIHighlightsPage` | AI-powered highlights |

### Sponsorships (3 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `sponsorships` | `SponsorshipsPage` | Sponsorship programs |
| `sponsored-children` | `SponsoredChildrenPage` | List of sponsored children |
| `sponsored-children/:id` | `ChildProgressPage` | Individual child progress |

### Children (6 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `children/overview` | `PartnerChildrenOverviewPage` | Children overview |
| `children/journey` | `ChildrenJourneyPage` | Learning journeys |
| `children/activity` | `ChildrenActivityPage` | Activity tracking |
| `children/achievements` | `ChildrenAchievementsPage` | Achievements |
| `children/goals` | `ChildrenGoalsPage` | Goals tracking |
| `children/ai-insights` | `ChildrenAIInsightsPage` | AI insights |

### Partnership (3 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `enrollments` | `EnrollmentsPage` | Enrollment management |
| `impact-reports` | `ImpactReportsPage` | Impact reports |
| `collaboration` | `CollaborationPage` | Collaboration tools |

### Content (3 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `courses` | `SponsoredCoursesPage` | Sponsored courses |
| `resources` | `ResourceContributionsPage` | Resource contributions |
| `ai-resources` | `AIResourcesPage` | AI-curated resources |

### Finance (4 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `finance/funding` | `FundingPage` | Funding overview |
| `finance/budget` | `BudgetManagementPage` | Budget management |
| `finance/grants` | `GrantTrackingPage` | Grant tracking |
| `funding` | `FundingPage` | Funding (alternate route) |

### Analytics (3 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `analytics/roi` | `ROIMetricsPage` | ROI metrics |
| `analytics/reports` | `CustomReportsPage` | Custom reports |
| `analytics/student-insights` | `StudentInsightsPage` | Student insights |

### Support (4 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `support/tickets` | `PartnerTicketsPage` | Support tickets |
| `support/resources` | `SupportResourcesPage` | Support resources |
| `support/training/webinars` | `WebinarsPage` | Training webinars |
| `support/training/certification` | `CertificationPage` | Certification program |

### Account (3 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `notifications` | `PartnerNotificationsPage` | Notifications |
| `profile` | `PartnerProfilePage` | Partner profile |
| `settings` | `PartnerSettingsPage` | Partner settings |

**Total Partner Routes: 38**

---

## Staff Dashboard (`/dashboard/staff`)

**Layout**: `DashboardLayout` with `role="staff"`
**Protection**: `ProtectedRoute` with `allowedRoles={['staff']}`

### Home (1 route)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `/dashboard/staff` (index) | `StaffDashboardPage` | Staff dashboard home |

### Moderation & Quality (4 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `moderation/review` | `StaffContentReviewPage` | Content review queue |
| `moderation/approvals` | `StaffApprovalFeedbackPage` | Approval feedback |
| `moderation/cbc` | `StaffCBCStandardsPage` | CBC standards compliance |
| `moderation/safety` | `StaffSafetyPolicyPage` | Safety policy enforcement |

### Support & Care (8 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `support/tickets` | `StaffTicketsPage` | Support ticket queue |
| `support/tickets/:ticketId` | `StaffTicketDetailPage` | Ticket detail |
| `support/live` | `StaffLiveSupportPage` | Live support chat |
| `support/journeys` | `StaffStudentJourneysPage` | Student journey tracking |
| `support/journeys/:journeyId` | `StaffStudentJourneyDetailPage` | Journey detail |
| `support/kb` | `StaffKnowledgeBasePage` | Knowledge base |
| `support/kb/editor` | `StaffKBArticleEditorPage` | KB article editor (new) |
| `support/kb/editor/:articleId` | `StaffKBArticleEditorPage` | KB article editor (edit) |

### Learning Experience (9 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `learning/sessions` | `StaffSessionsPage` | Learning sessions |
| `learning/sessions/:sessionId/live` | `StaffLiveClassPage` | Live class room |
| `learning/progress` | `StaffStudentProgressPage` | Student progress |
| `learning/content` | `StaffContentStudioPage` | Content studio |
| `learning/content/editor` | `StaffContentEditorPage` | Content editor (new) |
| `learning/content/editor/:contentId` | `StaffContentEditorPage` | Content editor (edit) |
| `learning/assessments` | `StaffAssessmentBuilderPage` | Assessment builder |
| `learning/assessments/editor` | `StaffAssessmentEditorPage` | Assessment editor (new) |
| `learning/assessments/editor/:assessmentId` | `StaffAssessmentEditorPage` | Assessment editor (edit) |

### Insights & Impact (4 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `insights/health` | `StaffPlatformHealthPage` | Platform health metrics |
| `insights/content` | `StaffContentPerformancePage` | Content performance |
| `insights/support` | `StaffSupportMetricsPage` | Support metrics |
| `insights/reports` | `StaffCustomReportsPage` | Custom reports |

### Team & Growth (3 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `team/performance` | `StaffMyPerformancePage` | My performance |
| `team/pulse` | `StaffTeamPulsePage` | Team pulse |
| `team/resources` | `StaffLearningResourcesPage` | Learning resources |

### Account (4 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `account/notifications` | `StaffNotificationsPage` | Notifications |
| `account/profile` | `StaffProfilePage` | Staff profile |
| `account/preferences` | `StaffPreferencesPage` | Preferences |
| `account/security` | `StaffSecurityPage` | Security settings |

**Total Staff Routes: 39**

---

## Admin Dashboard (`/dashboard/admin`)

**Layout**: `DashboardLayout` with `role="admin"`
**Protection**: `ProtectedRoute` with `allowedRoles={['admin']}`

### Home & Overview (3 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `/dashboard/admin` (index) | `AdminDashboardPage` | Admin dashboard home |
| `pulse` | `PlatformPulsePage` | Platform pulse overview |
| `ai-providers` | `AIProvidersPage` | AI provider management |

### People & Access (4 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `users` | `UsersPage` | User management list |
| `users/:id` | `UserDetailPage` | User detail view |
| `roles-permissions` | `RolesPermissionsPage` | Role and permission management |
| `families` | `FamiliesPage` | Family accounts |
| `restrictions` | `RestrictionsPage` | Access restrictions |

### Content & Learning (5 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `courses` | `CoursesAdminPage` | Course management |
| `cbc-alignment` | `CBCAlignmentPage` | CBC curriculum alignment |
| `assessments` | `AssessmentsAdminPage` | Assessment management |
| `certificates` | `CertificatesAdminPage` | Certificate management |
| `resources` | `ResourceLibraryPage` | Resource library |

### AI Systems (4 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `ai-monitoring` | `AIMonitoringPage` | AI system monitoring |
| `ai-content` | `AIContentReviewPage` | AI content review |
| `ai-personalization` | `AIPersonalizationPage` | AI personalization settings |
| `ai-performance` | `AIPerformancePage` | AI performance metrics |

### Analytics & Intelligence (4 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `analytics/learning` | `LearningAnalyticsPage` | Learning analytics |
| `analytics/business` | `BusinessAnalyticsPage` | Business analytics |
| `analytics/compliance` | `CompliancePage` | Compliance reporting |
| `analytics/custom` | `CustomInsightsPage` | Custom insights builder |

### Finance & Partnerships (4 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `finance/transactions` | `MoneyFlowPage` | Transaction flow |
| `finance/plans` | `PlansPage` | Subscription plans |
| `partners` | `PartnersAdminPage` | Partner management |
| `invoices` | `InvoicesPage` | Invoice management |

### Operations & Control (6 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `tickets` | `TicketsPage` | Support tickets |
| `tickets/:id` | `TicketDetailPage` | Ticket detail |
| `moderation` | `ModerationPage` | Content moderation |
| `config` | `SystemConfigPage` | System configuration |
| `audit-logs` | `AuditLogsPage` | Audit log viewer |
| `system-health` | `SystemHealthPage` | System health dashboard |

### Account (3 routes)
| Route | Page Component | Description |
|-------|---------------|-------------|
| `notifications` | `AdminNotificationsPage` | Notifications |
| `profile` | `AdminProfilePage` | Admin profile |
| `preferences` | `AdminPreferencesPage` | Admin preferences |

**Total Admin Routes: 36**

---

## Non-Dashboard Authenticated Routes

These routes are wrapped in `ProtectedRoute` (any authenticated role) with `DashboardLayoutAutoRole` (auto-detects role for sidebar).

| Route | Page Component | Description |
|-------|---------------|-------------|
| `/search` | `SearchResultsPage` | Global search results (lazy-loaded) |
| `/profile` | `ProfilePage` | User profile |
| `/settings` | `SettingsPage` | User settings |
| `/quizzes` | `QuizzesPage` | Quizzes overview |
| `/certificates` | `CertificatesPage` | Certificates list |
| `/notifications` | `NotificationsPage` | Notifications center |
| `/dashboard/forum` | `ForumPage` | Dashboard forum |
| `/payments` | `PaymentPage` | Payment page |
| `/wallet` | `WalletPage` | Wallet overview |
| `/transactions` | `TransactionsPage` | Transaction history |
| `/my-courses` | `MyCoursesPage` | My courses |
| `/courses/create` | `CreateCoursePage` | Create a course |
| `/courses/:courseId/lesson/:lessonId` | `LessonPlayerPage` | Lesson player |
| `/instructor/dashboard` | `InstructorDashboardPage` | Legacy instructor dashboard |
| `/store/checkout` | `CheckoutPage` | Store checkout |
| `/store/orders` | `PlaceholderPage` | Order history (placeholder, title="My Orders") |

**Total Non-Dashboard Auth Routes: 16**

---

## Catch-All Route

| Route | Page Component | Description |
|-------|---------------|-------------|
| `/*` | `PlaceholderPage` | 404 page (title="Page Not Found") |

---

## Route Protection Architecture

```
                   ProtectedRoute
                   +-- Checks useAuthStore.isAuthenticated
                   +-- Checks allowedRoles (optional)
                   +-- Redirects if unauthorized
                        |
              +---------+---------+
              |                   |
       Role-specific       DashboardLayoutAutoRole
       DashboardLayout     (auto-detect role)
              |                   |
         <Outlet />          <Outlet />
```

### Authentication Flow

1. `ProtectedRoute` checks `isAuthenticated` from `useAuthStore`
2. If not authenticated, redirects to login
3. If `allowedRoles` is specified, checks user role
4. If role mismatch, redirects to user's correct dashboard
5. If authenticated and authorized, renders children/outlet

### Auto-Redirect on Home

When an authenticated user visits `/`, `AppContent` redirects them to `/dashboard/{role}` based on `user.role`.
