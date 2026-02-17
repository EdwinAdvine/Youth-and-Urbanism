# Student Dashboard Pages

**Project**: Urban Home School (The Bird AI) / Urban Bird v1
**Base Route**: `/dashboard/student`
**Layout**: `DashboardLayout` with `role="student"` + `StudentSidebar`
**Protection**: `ProtectedRoute` with `allowedRoles={['student']}`
**Last Updated**: 2026-02-15

---

## Page Count Summary

| Section | Pages |
|---------|-------|
| Home | 1 |
| Today | 5 |
| AI Tutor | 6 |
| Learning - Courses | 6 |
| Learning - Live Sessions | 4 |
| Practice & Assessments | 14 |
| Progress & Growth | 15 |
| Community | 11 |
| Wallet & Access | 10 |
| Support & Help | 7 |
| Account | 12 |
| **Total** | **91** |

---

## Home

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 1 | `/dashboard/student` | `frontend/src/pages/student/StudentDashboardHome.tsx` | `StudentDashboardHome` | Main student dashboard with time-adaptive greeting, mood check-in, daily plan widget, streak display, urgent items, stats cards, teacher sync card, and daily quote |

---

## Today (5 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 2 | `today/ai-plan` | `frontend/src/pages/student/AIPlanPage.tsx` | `AIPlanPage` | AI-generated daily learning plan with prioritized tasks |
| 3 | `today/streak` | `frontend/src/pages/student/StreakPage.tsx` | `StreakPage` | Learning streak tracker with heatmap and history |
| 4 | `today/mood` | `frontend/src/pages/student/MoodCheckPage.tsx` | `MoodCheckPage` | Daily mood check-in with emoji selector and notes |
| 5 | `today/urgent` | `frontend/src/pages/student/UrgentItemsPage.tsx` | `UrgentItemsPage` | Urgent items requiring immediate attention (due assignments, quizzes) |
| 6 | `today/quote` | `frontend/src/pages/student/DailyQuotePage.tsx` | `DailyQuotePage` | Daily inspirational quote with sharing options |

---

## AI Tutor (6 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 7 | `ai-tutor/chat` | `frontend/src/pages/student/AITutorChatPage.tsx` | `AITutorChatPage` | Main AI tutor chat interface with text/voice input |
| 8 | `ai-tutor/learning-path` | `frontend/src/pages/student/LearningPathPage.tsx` | `LearningPathPage` | AI-generated personalized learning path visualization |
| 9 | `ai-tutor/voice` | `frontend/src/pages/student/VoiceModePage.tsx` | `VoiceModePage` | Voice-only interaction mode with AI tutor |
| 10 | `ai-tutor/journal` | `frontend/src/pages/student/AIJournalPage.tsx` | `AIJournalPage` | AI learning journal for reflections and notes |
| 11 | `ai-tutor/explain` | `frontend/src/pages/student/HelpMeUnderstandPage.tsx` | `HelpMeUnderstandPage` | AI explanation tool for difficult concepts |
| 12 | `ai-tutor/teacher-collab` | `frontend/src/pages/student/TeacherCollabPage.tsx` | `TeacherCollabPage` | AI-teacher collaboration view showing how AI and teacher work together |

---

## Learning - Courses (6 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 13 | `courses/enrolled` | `frontend/src/pages/student/EnrolledCoursesPage.tsx` | `EnrolledCoursesPage` | List of enrolled courses with progress tracking |
| 14 | `courses/ai-recommended` | `frontend/src/pages/student/AIRecommendedPage.tsx` | `AIRecommendedPage` | AI-recommended courses based on learning profile |
| 15 | `browse/marketplace` | `frontend/src/pages/student/BrowseCoursesPage.tsx` | `BrowseCoursesPage` | Course marketplace browser with filters |
| 16 | `browse/wishlist` | `frontend/src/pages/student/WishlistPage.tsx` | `WishlistPage` | Saved/wishlisted courses |
| 17 | `browse/topics` | `frontend/src/pages/student/TopicExplorerPage.tsx` | `TopicExplorerPage` | Topic explorer for discovering learning areas |
| 18 | `browse/course/:id` | `frontend/src/pages/student/CoursePreviewPage.tsx` | `CoursePreviewPage` | Course preview before enrollment |

---

## Learning - Live Sessions (4 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 19 | `live/join` | `frontend/src/pages/student/JoinLivePage.tsx` | `JoinLivePage` | Join an active live session |
| 20 | `live/upcoming` | `frontend/src/pages/student/UpcomingSessionsPage.tsx` | `UpcomingSessionsPage` | List of upcoming scheduled sessions |
| 21 | `live/calendar` | `frontend/src/pages/student/ClassCalendarPage.tsx` | `ClassCalendarPage` | Calendar view of class sessions |
| 22 | `live/recordings` | `frontend/src/pages/student/RecordingsPage.tsx` | `RecordingsPage` | Library of recorded sessions |

---

## Practice & Assessments (14 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 23 | `practice/challenges` | `frontend/src/pages/student/TodaysChallengesPage.tsx` | `TodaysChallengesPage` | Today's practice challenges and daily exercises |
| 24 | `assignments/due-soon` | `frontend/src/pages/student/AssignmentsDueSoonPage.tsx` | `AssignmentsDueSoonPage` | Assignments due soon with countdown |
| 25 | `assignments/pending` | `frontend/src/pages/student/AssignmentsPendingPage.tsx` | `AssignmentsPendingPage` | Pending assignments awaiting completion |
| 26 | `assignments/submitted` | `frontend/src/pages/student/AssignmentsSubmittedPage.tsx` | `AssignmentsSubmittedPage` | Submitted assignments with status tracking |
| 27 | `assignments/feedback` | `frontend/src/pages/student/AssignmentsFeedbackPage.tsx` | `AssignmentsFeedbackPage` | Assignment feedback from teachers |
| 28 | `assignments/resubmit/:id` | `frontend/src/pages/student/AssignmentsResubmitPage.tsx` | `AssignmentsResubmitPage` | Resubmit a specific assignment |
| 29 | `quizzes/upcoming` | `frontend/src/pages/student/QuizzesUpcomingPage.tsx` | `QuizzesUpcomingPage` | Upcoming quizzes with preparation tips |
| 30 | `quizzes/practice` | `frontend/src/pages/student/QuizPracticeModePage.tsx` | `QuizPracticeModePage` | Quiz practice mode for test preparation |
| 31 | `quizzes/results` | `frontend/src/pages/student/QuizResultsPage.tsx` | `QuizResultsPage` | Quiz results and performance history |
| 32 | `quizzes/skill-reports` | `frontend/src/pages/student/SkillReportsPage.tsx` | `SkillReportsPage` | Skill-level reports from quiz performance |
| 33 | `projects/active` | `frontend/src/pages/student/ActiveProjectsPage.tsx` | `ActiveProjectsPage` | Active projects in progress |
| 34 | `projects/upload` | `frontend/src/pages/student/ProjectUploadPage.tsx` | `ProjectUploadPage` | Upload project files and submissions |
| 35 | `projects/gallery` | `frontend/src/pages/student/PeerGalleryPage.tsx` | `PeerGalleryPage` | Gallery of peer projects |
| 36 | `projects/feedback` | `frontend/src/pages/student/ProjectFeedbackPage.tsx` | `ProjectFeedbackPage` | Feedback received on projects |

---

## Progress & Growth (15 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 37 | `achievements/gallery` | `frontend/src/pages/student/AchievementsGalleryPage.tsx` | `AchievementsGalleryPage` | Full gallery of earned achievements and badges |
| 38 | `achievements/recent` | `frontend/src/pages/student/RecentUnlocksPage.tsx` | `RecentUnlocksPage` | Recently unlocked achievements |
| 39 | `achievements/share` | `frontend/src/pages/student/ShareableCardsPage.tsx` | `ShareableCardsPage` | Create shareable achievement cards for social media |
| 40 | `learning-map` | `frontend/src/pages/student/LearningMapPage.tsx` | `LearningMapPage` | Visual learning map showing skill tree |
| 41 | `learning-map/strengths` | `frontend/src/pages/student/StrengthsPage.tsx` | `StrengthsPage` | Detailed view of academic strengths |
| 42 | `learning-map/growing` | `frontend/src/pages/student/GrowingAreasPage.tsx` | `GrowingAreasPage` | Areas identified for growth |
| 43 | `reports/weekly` | `frontend/src/pages/student/WeeklyStoryPage.tsx` | `WeeklyStoryPage` | Weekly progress story narrative |
| 44 | `reports/trends` | `frontend/src/pages/student/VisualTrendsPage.tsx` | `VisualTrendsPage` | Visual trend charts for learning progress |
| 45 | `reports/parent` | `frontend/src/pages/student/ParentSummaryPage.tsx` | `ParentSummaryPage` | Summary report shared with parents |
| 46 | `reports/nudges` | `frontend/src/pages/student/AINudgesPage.tsx` | `AINudgesPage` | AI-generated learning nudges and suggestions |
| 47 | `reports/teacher` | `frontend/src/pages/student/TeacherInsightsPage.tsx` | `TeacherInsightsPage` | Teacher insights shared with student |
| 48 | `goals/set` | `frontend/src/pages/student/SetGoalsPage.tsx` | `SetGoalsPage` | Set personal learning goals |
| 49 | `goals/streaks` | `frontend/src/pages/student/TrackStreaksPage.tsx` | `TrackStreaksPage` | Track goal completion streaks |

---

## Community (11 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 50 | `community/connect` | `frontend/src/pages/student/ConnectPage.tsx` | `ConnectPage` | Connect with other students and manage friend connections |
| 51 | `community/study-groups` | `frontend/src/pages/student/StudyGroupsPage.tsx` | `StudyGroupsPage` | Browse and join study groups |
| 52 | `community/projects` | `frontend/src/pages/student/CollaborativeProjectsPage.tsx` | `CollaborativeProjectsPage` | Collaborative group projects |
| 53 | `community/questions/new` | `frontend/src/pages/student/NewQuestionsPage.tsx` | `NewQuestionsPage` | New questions in the community |
| 54 | `community/shoutouts/give` | `frontend/src/pages/student/GiveShoutoutsPage.tsx` | `GiveShoutoutsPage` | Give shoutouts and recognition to peers |
| 55 | `community/shoutouts/received` | `frontend/src/pages/student/ReceiveShoutoutsPage.tsx` | `ReceiveShoutoutsPage` | View received shoutouts |
| 56 | `community/teacher-qa` | `frontend/src/pages/student/TeacherQAPage.tsx` | `TeacherQAPage` | Teacher Q&A section for asking questions |
| 57 | `discussions/recent` | `frontend/src/pages/student/DiscussionsRecentPage.tsx` | `DiscussionsRecentPage` | Recent forum discussions |
| 58 | `discussions/my-posts` | `frontend/src/pages/student/MyPostsPage.tsx` | `MyPostsPage` | My forum posts |
| 59 | `discussions/saved` | `frontend/src/pages/student/SavedPostsPage.tsx` | `SavedPostsPage` | Saved/bookmarked forum posts |
| 60 | `shoutouts/wall` | `frontend/src/pages/student/ClassWallPage.tsx` | `ClassWallPage` | Class shoutout wall display |

---

## Wallet & Access (10 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 61 | `wallet/balance` | `frontend/src/pages/student/WalletBalancePage.tsx` | `WalletBalancePage` | Wallet balance overview and summary |
| 62 | `wallet/add/mpesa` | `frontend/src/pages/student/MpesaTopupPage.tsx` | `MpesaTopupPage` | M-Pesa mobile money top-up |
| 63 | `wallet/add/card` | `frontend/src/pages/student/CardPaymentPage.tsx` | `CardPaymentPage` | Card payment/top-up |
| 64 | `wallet/transactions` | `frontend/src/pages/student/RecentTransactionsPage.tsx` | `RecentTransactionsPage` | Recent transaction history |
| 65 | `wallet/methods` | `frontend/src/pages/student/PaymentMethodsPage.tsx` | `PaymentMethodsPage` | Manage payment methods |
| 66 | `wallet/upgrade` | `frontend/src/pages/student/UpgradePlanPage.tsx` | `UpgradePlanPage` | Upgrade subscription plan |
| 67 | `wallet/family` | `frontend/src/pages/student/FamilyPlanPage.tsx` | `FamilyPlanPage` | Family plan management |
| 68 | `wallet/receipts` | `frontend/src/pages/student/ReceiptsPage.tsx` | `ReceiptsPage` | Payment receipts |
| 69 | `wallet/advisor` | `frontend/src/pages/student/AIFundAdvisorPage.tsx` | `AIFundAdvisorPage` | AI financial advisor for plan recommendations |
| 70 | `subscriptions` | `frontend/src/pages/student/SubscriptionsPage.tsx` | `SubscriptionsPage` | Subscription management |

---

## Support & Help (7 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 71 | `support/guides` | `frontend/src/pages/student/HowToGuidesPage.tsx` | `HowToGuidesPage` | How-to guides and platform tutorials |
| 72 | `support/contact` | `frontend/src/pages/student/ContactSupportPage.tsx` | `ContactSupportPage` | Contact support team |
| 73 | `support/community` | `frontend/src/pages/student/AskCommunityPage.tsx` | `AskCommunityPage` | Ask the community for help |
| 74 | `support/teacher-chat` | `frontend/src/pages/student/TeacherChatPage.tsx` | `TeacherChatPage` | Direct chat with teacher |
| 75 | `support/urgent` | `frontend/src/pages/student/UrgentFlagPage.tsx` | `UrgentFlagPage` | Flag an urgent issue |
| 76 | `support/report` | `frontend/src/pages/student/ReportProblemPage.tsx` | `ReportProblemPage` | Report a problem/bug |
| 77 | `support/ai-help` | `frontend/src/pages/student/AIHelpTriagePage.tsx` | `AIHelpTriagePage` | AI-powered help triage to route support requests |

---

## Account (12 pages)

| # | Route | File Path | Component | Description |
|---|-------|-----------|-----------|-------------|
| 78 | `notifications` | `frontend/src/pages/student/StudentNotificationsPage.tsx` | `StudentNotificationsPage` | Notifications inbox |
| 79 | `notifications/priority` | `frontend/src/pages/student/PriorityAlertsPage.tsx` | `PriorityAlertsPage` | Priority/urgent alerts |
| 80 | `notifications/settings` | `frontend/src/pages/student/NotificationSettingsPage.tsx` | `NotificationSettingsPage` | Notification preference settings |
| 81 | `profile` | `frontend/src/pages/student/StudentProfilePage.tsx` | `StudentProfilePage` | Student profile overview |
| 82 | `profile/avatar` | `frontend/src/pages/student/AvatarPage.tsx` | `AvatarPage` | Avatar customization |
| 83 | `profile/bio` | `frontend/src/pages/student/BioPage.tsx` | `BioPage` | Bio and personal information editor |
| 84 | `profile/learning-style` | `frontend/src/pages/student/LearningStylePage.tsx` | `LearningStylePage` | Learning style assessment and settings |
| 85 | `profile/interests` | `frontend/src/pages/student/InterestsPage.tsx` | `InterestsPage` | Interest tags and topic preferences |
| 86 | `preferences` | `frontend/src/pages/student/StudentPreferencesPage.tsx` | `StudentPreferencesPage` | General preferences (theme, language, etc.) |
| 87 | `preferences/ai-personality` | `frontend/src/pages/student/AIPersonalityPage.tsx` | `AIPersonalityPage` | AI tutor personality configuration |
| 88 | `privacy` | `frontend/src/pages/student/PrivacySecurityPage.tsx` | `PrivacySecurityPage` | Privacy and security settings |
| 89 | `privacy/teacher-access` | `frontend/src/pages/student/TeacherAccessPage.tsx` | `TeacherAccessPage` | Manage what data teachers can access |

---

## Additional Student Page Files

The following file exists in the student pages directory but is not registered as a route:

| File Path | Component | Description |
|-----------|-----------|-------------|
| `frontend/src/pages/student/_PlaceholderTemplate.tsx` | `_PlaceholderTemplate` | Template file for creating new student pages |
