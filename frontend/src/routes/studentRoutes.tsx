import { lazy } from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';
import { S } from './routeHelpers';

// Student Dashboard Pages (lazy-loaded for code splitting)
const StudentDashboardHome = lazy(() => import('../pages/student/StudentDashboardHome'));
const AIPlanPage = lazy(() => import('../pages/student/AIPlanPage'));
const StreakPage = lazy(() => import('../pages/student/StreakPage'));
const MoodCheckPage = lazy(() => import('../pages/student/MoodCheckPage'));
const UrgentItemsPage = lazy(() => import('../pages/student/UrgentItemsPage'));
const DailyQuotePage = lazy(() => import('../pages/student/DailyQuotePage'));
const AITutorChatPage = lazy(() => import('../pages/student/AITutorChatPage'));
const LearningPathPage = lazy(() => import('../pages/student/LearningPathPage'));
const VoiceModePage = lazy(() => import('../pages/student/VoiceModePage'));
const AIJournalPage = lazy(() => import('../pages/student/AIJournalPage'));
const HelpMeUnderstandPage = lazy(() => import('../pages/student/HelpMeUnderstandPage'));
const TeacherCollabPage = lazy(() => import('../pages/student/TeacherCollabPage'));
const EnrolledCoursesPage = lazy(() => import('../pages/student/EnrolledCoursesPage'));
const AIRecommendedPage = lazy(() => import('../pages/student/AIRecommendedPage'));
const BrowseCoursesPage = lazy(() => import('../pages/student/BrowseCoursesPage'));
const WishlistPage = lazy(() => import('../pages/student/WishlistPage'));
const JoinLivePage = lazy(() => import('../pages/student/JoinLivePage'));
const UpcomingSessionsPage = lazy(() => import('../pages/student/UpcomingSessionsPage'));
const ClassCalendarPage = lazy(() => import('../pages/student/ClassCalendarPage'));
const RecordingsPage = lazy(() => import('../pages/student/RecordingsPage'));
const TodaysChallengesPage = lazy(() => import('../pages/student/TodaysChallengesPage'));
const AssignmentsDueSoonPage = lazy(() => import('../pages/student/AssignmentsDueSoonPage'));
const AssignmentsPendingPage = lazy(() => import('../pages/student/AssignmentsPendingPage'));
const AssignmentsSubmittedPage = lazy(() => import('../pages/student/AssignmentsSubmittedPage'));
const QuizzesUpcomingPage = lazy(() => import('../pages/student/QuizzesUpcomingPage'));
const QuizPracticeModePage = lazy(() => import('../pages/student/QuizPracticeModePage'));
const QuizResultsPage = lazy(() => import('../pages/student/QuizResultsPage'));
const ActiveProjectsPage = lazy(() => import('../pages/student/ActiveProjectsPage'));
const ProjectUploadPage = lazy(() => import('../pages/student/ProjectUploadPage'));
const PeerGalleryPage = lazy(() => import('../pages/student/PeerGalleryPage'));
const AchievementsGalleryPage = lazy(() => import('../pages/student/AchievementsGalleryPage'));
const RecentUnlocksPage = lazy(() => import('../pages/student/RecentUnlocksPage'));
const LearningMapPage = lazy(() => import('../pages/student/LearningMapPage'));
const WeeklyStoryPage = lazy(() => import('../pages/student/WeeklyStoryPage'));
const VisualTrendsPage = lazy(() => import('../pages/student/VisualTrendsPage'));
const SetGoalsPage = lazy(() => import('../pages/student/SetGoalsPage'));
const TrackStreaksPage = lazy(() => import('../pages/student/TrackStreaksPage'));
const ConnectPage = lazy(() => import('../pages/student/ConnectPage'));
const StudyGroupsPage = lazy(() => import('../pages/student/StudyGroupsPage'));
const DiscussionsRecentPage = lazy(() => import('../pages/student/DiscussionsRecentPage'));
const MyPostsPage = lazy(() => import('../pages/student/MyPostsPage'));
const SavedPostsPage = lazy(() => import('../pages/student/SavedPostsPage'));
const ClassWallPage = lazy(() => import('../pages/student/ClassWallPage'));
const WalletBalancePage = lazy(() => import('../pages/student/WalletBalancePage'));
const MpesaTopupPage = lazy(() => import('../pages/student/MpesaTopupPage'));
const CardPaymentPage = lazy(() => import('../pages/student/CardPaymentPage'));
const SubscriptionsPage = lazy(() => import('../pages/student/SubscriptionsPage'));
const HowToGuidesPage = lazy(() => import('../pages/student/HowToGuidesPage'));
const ContactSupportPage = lazy(() => import('../pages/student/ContactSupportPage'));
const StudentNotificationsPage = lazy(() => import('../pages/student/StudentNotificationsPage'));
const StudentProfilePage = lazy(() => import('../pages/student/StudentProfilePage'));
const StudentPreferencesPage = lazy(() => import('../pages/student/StudentPreferencesPage'));
const PrivacySecurityPage = lazy(() => import('../pages/student/PrivacySecurityPage'));

// Student Dashboard - New Pages (Phase 4A-4G)
// 4A: Learning
const TopicExplorerPage = lazy(() => import('../pages/student/TopicExplorerPage'));
const CoursePreviewPage = lazy(() => import('../pages/student/CoursePreviewPage'));
// 4B: Practice & Assessments
const AssignmentsFeedbackPage = lazy(() => import('../pages/student/AssignmentsFeedbackPage'));
const AssignmentsResubmitPage = lazy(() => import('../pages/student/AssignmentsResubmitPage'));
const SkillReportsPage = lazy(() => import('../pages/student/SkillReportsPage'));
const ProjectFeedbackPage = lazy(() => import('../pages/student/ProjectFeedbackPage'));
// 4C: Progress & Growth
const ShareableCardsPage = lazy(() => import('../pages/student/ShareableCardsPage'));
const StrengthsPage = lazy(() => import('../pages/student/StrengthsPage'));
const GrowingAreasPage = lazy(() => import('../pages/student/GrowingAreasPage'));
const ParentSummaryPage = lazy(() => import('../pages/student/ParentSummaryPage'));
const AINudgesPage = lazy(() => import('../pages/student/AINudgesPage'));
const TeacherInsightsPage = lazy(() => import('../pages/student/TeacherInsightsPage'));
// 4D: Community
const CollaborativeProjectsPage = lazy(() => import('../pages/student/CollaborativeProjectsPage'));
const NewQuestionsPage = lazy(() => import('../pages/student/NewQuestionsPage'));
const GiveShoutoutsPage = lazy(() => import('../pages/student/GiveShoutoutsPage'));
const ReceiveShoutoutsPage = lazy(() => import('../pages/student/ReceiveShoutoutsPage'));
const TeacherQAPage = lazy(() => import('../pages/student/TeacherQAPage'));
// 4E: Wallet & Access
const RecentTransactionsPage = lazy(() => import('../pages/student/RecentTransactionsPage'));
const PaymentMethodsPage = lazy(() => import('../pages/student/PaymentMethodsPage'));
const UpgradePlanPage = lazy(() => import('../pages/student/UpgradePlanPage'));
const FamilyPlanPage = lazy(() => import('../pages/student/FamilyPlanPage'));
const ReceiptsPage = lazy(() => import('../pages/student/ReceiptsPage'));
const AIFundAdvisorPage = lazy(() => import('../pages/student/AIFundAdvisorPage'));
// 4F: Support & Help
const AskCommunityPage = lazy(() => import('../pages/student/AskCommunityPage'));
const TeacherChatPage = lazy(() => import('../pages/student/TeacherChatPage'));
const UrgentFlagPage = lazy(() => import('../pages/student/UrgentFlagPage'));
const ReportProblemPage = lazy(() => import('../pages/student/ReportProblemPage'));
const AIHelpTriagePage = lazy(() => import('../pages/student/AIHelpTriagePage'));
// 4G: Account
const PriorityAlertsPage = lazy(() => import('../pages/student/PriorityAlertsPage'));
const NotificationSettingsPage = lazy(() => import('../pages/student/NotificationSettingsPage'));
const AvatarPage = lazy(() => import('../pages/student/AvatarPage'));
const BioPage = lazy(() => import('../pages/student/BioPage'));
const LearningStylePage = lazy(() => import('../pages/student/LearningStylePage'));
const InterestsPage = lazy(() => import('../pages/student/InterestsPage'));
const AIPersonalityPage = lazy(() => import('../pages/student/AIPersonalityPage'));
const TeacherAccessPage = lazy(() => import('../pages/student/TeacherAccessPage'));

export const studentRoutes = (
  <Route path="/dashboard/student" element={<ProtectedRoute allowedRoles={['student']}><DashboardLayout role="student" /></ProtectedRoute>}>
    <Route index element={<S><StudentDashboardHome /></S>} />
    {/* Today */}
    <Route path="today/ai-plan" element={<S><AIPlanPage /></S>} />
    <Route path="today/streak" element={<S><StreakPage /></S>} />
    <Route path="today/mood" element={<S><MoodCheckPage /></S>} />
    <Route path="today/urgent" element={<S><UrgentItemsPage /></S>} />
    <Route path="today/quote" element={<S><DailyQuotePage /></S>} />
    {/* AI Tutor */}
    <Route path="ai-tutor/chat" element={<S><AITutorChatPage /></S>} />
    <Route path="ai-tutor/learning-path" element={<S><LearningPathPage /></S>} />
    <Route path="ai-tutor/voice" element={<S><VoiceModePage /></S>} />
    <Route path="ai-tutor/journal" element={<S><AIJournalPage /></S>} />
    <Route path="ai-tutor/explain" element={<S><HelpMeUnderstandPage /></S>} />
    <Route path="ai-tutor/teacher-collab" element={<S><TeacherCollabPage /></S>} />
    {/* Learning */}
    <Route path="courses/enrolled" element={<S><EnrolledCoursesPage /></S>} />
    <Route path="courses/ai-recommended" element={<S><AIRecommendedPage /></S>} />
    <Route path="courses/:id" element={<S><CoursePreviewPage /></S>} />
    <Route path="browse/marketplace" element={<S><BrowseCoursesPage /></S>} />
    <Route path="browse/wishlist" element={<S><WishlistPage /></S>} />
    <Route path="browse/topics" element={<S><TopicExplorerPage /></S>} />
    <Route path="browse/course/:id" element={<S><CoursePreviewPage /></S>} />
    <Route path="live/join" element={<S><JoinLivePage /></S>} />
    <Route path="live/upcoming" element={<S><UpcomingSessionsPage /></S>} />
    <Route path="live/calendar" element={<S><ClassCalendarPage /></S>} />
    <Route path="live/recordings" element={<S><RecordingsPage /></S>} />
    {/* Practice & Assessments */}
    <Route path="practice/challenges" element={<S><TodaysChallengesPage /></S>} />
    <Route path="assignments/due-soon" element={<S><AssignmentsDueSoonPage /></S>} />
    <Route path="assignments/pending" element={<S><AssignmentsPendingPage /></S>} />
    <Route path="assignments/submitted" element={<S><AssignmentsSubmittedPage /></S>} />
    <Route path="assignments/feedback" element={<S><AssignmentsFeedbackPage /></S>} />
    <Route path="assignments/resubmit/:id" element={<S><AssignmentsResubmitPage /></S>} />
    <Route path="quizzes/upcoming" element={<S><QuizzesUpcomingPage /></S>} />
    <Route path="quizzes/practice" element={<S><QuizPracticeModePage /></S>} />
    <Route path="quizzes/results" element={<S><QuizResultsPage /></S>} />
    <Route path="quizzes/skill-reports" element={<S><SkillReportsPage /></S>} />
    <Route path="projects/active" element={<S><ActiveProjectsPage /></S>} />
    <Route path="projects/upload" element={<S><ProjectUploadPage /></S>} />
    <Route path="projects/gallery" element={<S><PeerGalleryPage /></S>} />
    <Route path="projects/feedback" element={<S><ProjectFeedbackPage /></S>} />
    {/* Progress & Growth */}
    <Route path="achievements/gallery" element={<S><AchievementsGalleryPage /></S>} />
    <Route path="achievements/recent" element={<S><RecentUnlocksPage /></S>} />
    <Route path="achievements/share" element={<S><ShareableCardsPage /></S>} />
    <Route path="learning-map" element={<S><LearningMapPage /></S>} />
    <Route path="learning-map/strengths" element={<S><StrengthsPage /></S>} />
    <Route path="learning-map/growing" element={<S><GrowingAreasPage /></S>} />
    <Route path="reports/weekly" element={<S><WeeklyStoryPage /></S>} />
    <Route path="reports/trends" element={<S><VisualTrendsPage /></S>} />
    <Route path="reports/parent" element={<S><ParentSummaryPage /></S>} />
    <Route path="reports/nudges" element={<S><AINudgesPage /></S>} />
    <Route path="reports/teacher" element={<S><TeacherInsightsPage /></S>} />
    <Route path="goals/set" element={<S><SetGoalsPage /></S>} />
    <Route path="goals/streaks" element={<S><TrackStreaksPage /></S>} />
    {/* Community */}
    <Route path="community/connect" element={<S><ConnectPage /></S>} />
    <Route path="community/study-groups" element={<S><StudyGroupsPage /></S>} />
    <Route path="community/projects" element={<S><CollaborativeProjectsPage /></S>} />
    <Route path="community/questions/new" element={<S><NewQuestionsPage /></S>} />
    <Route path="community/shoutouts/give" element={<S><GiveShoutoutsPage /></S>} />
    <Route path="community/shoutouts/received" element={<S><ReceiveShoutoutsPage /></S>} />
    <Route path="community/teacher-qa" element={<S><TeacherQAPage /></S>} />
    <Route path="discussions/recent" element={<S><DiscussionsRecentPage /></S>} />
    <Route path="discussions/my-posts" element={<S><MyPostsPage /></S>} />
    <Route path="discussions/saved" element={<S><SavedPostsPage /></S>} />
    <Route path="shoutouts/wall" element={<S><ClassWallPage /></S>} />
    {/* Wallet */}
    <Route path="wallet/balance" element={<S><WalletBalancePage /></S>} />
    <Route path="wallet/add/mpesa" element={<S><MpesaTopupPage /></S>} />
    <Route path="wallet/add/card" element={<S><CardPaymentPage /></S>} />
    <Route path="wallet/transactions" element={<S><RecentTransactionsPage /></S>} />
    <Route path="wallet/methods" element={<S><PaymentMethodsPage /></S>} />
    <Route path="wallet/upgrade" element={<S><UpgradePlanPage /></S>} />
    <Route path="wallet/family" element={<S><FamilyPlanPage /></S>} />
    <Route path="wallet/receipts" element={<S><ReceiptsPage /></S>} />
    <Route path="wallet/advisor" element={<S><AIFundAdvisorPage /></S>} />
    <Route path="subscriptions" element={<S><SubscriptionsPage /></S>} />
    {/* Support */}
    <Route path="support/guides" element={<S><HowToGuidesPage /></S>} />
    <Route path="support/contact" element={<S><ContactSupportPage /></S>} />
    <Route path="support/community" element={<S><AskCommunityPage /></S>} />
    <Route path="support/teacher-chat" element={<S><TeacherChatPage /></S>} />
    <Route path="support/urgent" element={<S><UrgentFlagPage /></S>} />
    <Route path="support/report" element={<S><ReportProblemPage /></S>} />
    <Route path="support/ai-help" element={<S><AIHelpTriagePage /></S>} />
    {/* Account */}
    <Route path="notifications" element={<S><StudentNotificationsPage /></S>} />
    <Route path="notifications/priority" element={<S><PriorityAlertsPage /></S>} />
    <Route path="notifications/settings" element={<S><NotificationSettingsPage /></S>} />
    <Route path="profile" element={<S><StudentProfilePage /></S>} />
    <Route path="profile/avatar" element={<S><AvatarPage /></S>} />
    <Route path="profile/bio" element={<S><BioPage /></S>} />
    <Route path="profile/learning-style" element={<S><LearningStylePage /></S>} />
    <Route path="profile/interests" element={<S><InterestsPage /></S>} />
    <Route path="preferences" element={<S><StudentPreferencesPage /></S>} />
    <Route path="preferences/ai-personality" element={<S><AIPersonalityPage /></S>} />
    <Route path="privacy" element={<S><PrivacySecurityPage /></S>} />
    <Route path="privacy/teacher-access" element={<S><TeacherAccessPage /></S>} />
  </Route>
);
