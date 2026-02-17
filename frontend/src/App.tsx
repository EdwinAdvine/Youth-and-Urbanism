import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import GlobalErrorBoundary from './components/error/GlobalErrorBoundary';
import ScrollToTopOnNavigate from './components/layout/ScrollToTopOnNavigate';
import './App.css';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';

// Public Pages
import HomePage from './pages/HomePage';
import PlaceholderPage from './pages/PlaceholderPage';
import PricingPage from './pages/PricingPage';
import BotPage from './pages/BotPage';
import HowItWorksPage from './pages/HowItWorksPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CertificateValidationPage from './pages/CertificateValidationPage';
import BecomeInstructorPage from './pages/BecomeInstructorPage';
import PublicForumPage from './pages/PublicForumPage';

// Existing Pages
import CourseCatalogPage from './pages/CourseCatalogPage';
import CourseDetailsPage from './pages/CourseDetailsPage';
const SearchResultsPage = lazy(() => import('./pages/SearchResultsPage'));

// Documentation Pages (lazy-loaded)
const DocsLayout = lazy(() => import('./pages/docs/DocsLayout'));
const DocsHomePage = lazy(() => import('./pages/docs/DocsHomePage'));
const GettingStartedPage = lazy(() => import('./pages/docs/GettingStartedPage'));
const ChangelogPage = lazy(() => import('./pages/docs/ChangelogPage'));
const StudentGuidePage = lazy(() => import('./pages/docs/uhs/StudentGuidePage'));
const ParentGuidePage = lazy(() => import('./pages/docs/uhs/ParentGuidePage'));
const InstructorGuidePage = lazy(() => import('./pages/docs/uhs/InstructorGuidePage'));
const PartnerGuidePage = lazy(() => import('./pages/docs/uhs/PartnerGuidePage'));
const CoursesGuidePage = lazy(() => import('./pages/docs/uhs/CoursesGuidePage'));
const AssessmentsGuidePage = lazy(() => import('./pages/docs/uhs/AssessmentsGuidePage'));
const PaymentsGuidePage = lazy(() => import('./pages/docs/uhs/PaymentsGuidePage'));
const ForumGuidePage = lazy(() => import('./pages/docs/uhs/ForumGuidePage'));
const StoreGuidePage = lazy(() => import('./pages/docs/uhs/StoreGuidePage'));
const CertificatesGuidePage = lazy(() => import('./pages/docs/uhs/CertificatesGuidePage'));
const AITutorGuidePage = lazy(() => import('./pages/docs/bird/AITutorGuidePage'));
const CoPilotGuidePage = lazy(() => import('./pages/docs/bird/CoPilotGuidePage'));
const VoiceModeGuidePage = lazy(() => import('./pages/docs/bird/VoiceModeGuidePage'));
const LearningPathsGuidePage = lazy(() => import('./pages/docs/bird/LearningPathsGuidePage'));
const ApiOverviewPage = lazy(() => import('./pages/docs/api/ApiOverviewPage'));
const AuthApiPage = lazy(() => import('./pages/docs/api/AuthApiPage'));
const CoursesApiPage = lazy(() => import('./pages/docs/api/CoursesApiPage'));
const AITutorApiPage = lazy(() => import('./pages/docs/api/AITutorApiPage'));
const PaymentsApiPage = lazy(() => import('./pages/docs/api/PaymentsApiPage'));
const MoreApisPage = lazy(() => import('./pages/docs/api/MoreApisPage'));
const DocsFAQPage = lazy(() => import('./pages/docs/FAQPage'));

// Protected Pages
import ProtectedRoute from './components/ProtectedRoute';
import DashboardInstructor from './pages/DashboardInstructor';
// DashboardStaff replaced by lazy-loaded StaffDashboardPage

// Parent Dashboard Pages (lazy-loaded for code splitting)
const ParentDashboardHome = lazy(() => import('./pages/parent/ParentDashboardHome'));
const ChildrenOverviewPage = lazy(() => import('./pages/parent/ChildrenOverviewPage'));
const ChildDetailPage = lazy(() => import('./pages/parent/ChildDetailPage'));
const ParentAIInsightsPage = lazy(() => import('./pages/parent/AIInsightsPage'));
const AILearningStylePage = lazy(() => import('./pages/parent/AILearningStylePage'));
const AISupportTipsPage = lazy(() => import('./pages/parent/AISupportTipsPage'));
const AIPlanningPage = lazy(() => import('./pages/parent/AIPlanningPage'));
const AIPatternsPage = lazy(() => import('./pages/parent/AIPatternsPage'));
const AIWarningsPage = lazy(() => import('./pages/parent/AIWarningsPage'));
const HighlightsPage = lazy(() => import('./pages/parent/HighlightsPage'));
const ParentUrgentItemsPage = lazy(() => import('./pages/parent/UrgentItemsPage'));
const MoodSnapshotPage = lazy(() => import('./pages/parent/MoodSnapshotPage'));
const LearningJourneyPage = lazy(() => import('./pages/parent/LearningJourneyPage'));
const CBCCompetenciesPage = lazy(() => import('./pages/parent/CBCCompetenciesPage'));
const ParentActivityPage = lazy(() => import('./pages/parent/ActivityPage'));
const ParentAchievementsPage = lazy(() => import('./pages/parent/AchievementsPage'));
const ParentGoalsPage = lazy(() => import('./pages/parent/GoalsPage'));
const NotificationsInboxPage = lazy(() => import('./pages/parent/NotificationsInboxPage'));
const ParentMessagesPage = lazy(() => import('./pages/parent/MessagesPage'));
const ParentSupportPage = lazy(() => import('./pages/parent/SupportPage'));
const SubscriptionPage = lazy(() => import('./pages/parent/SubscriptionPage'));
const PaymentHistoryPage = lazy(() => import('./pages/parent/PaymentHistoryPage'));
const ManageSubscriptionPage = lazy(() => import('./pages/parent/ManageSubscriptionPage'));
const ParentAddonsPage = lazy(() => import('./pages/parent/AddonsPage'));
const ReportsListPage = lazy(() => import('./pages/parent/ReportsListPage'));
const TermSummaryPage = lazy(() => import('./pages/parent/TermSummaryPage'));
const TranscriptsPage = lazy(() => import('./pages/parent/TranscriptsPage'));
const PortfolioExportPage = lazy(() => import('./pages/parent/PortfolioExportPage'));
const NotificationPrefsPage = lazy(() => import('./pages/parent/NotificationPrefsPage'));
const ParentConsentPage = lazy(() => import('./pages/parent/ConsentPage'));
const ParentPrivacyPage = lazy(() => import('./pages/parent/PrivacyPage'));
const FamilyMembersPage = lazy(() => import('./pages/parent/FamilyMembersPage'));
const ParentProfilePage = lazy(() => import('./pages/parent/ProfilePage'));
const ParentSecurityPage = lazy(() => import('./pages/parent/SecurityPage'));

// Partner Dashboard Pages (lazy-loaded for code splitting)
const PartnerDashboardPage = lazy(() => import('./pages/partner/PartnerDashboardPage'));
const SponsorshipsPage = lazy(() => import('./pages/partner/SponsorshipsPage'));
const SponsoredChildrenPage = lazy(() => import('./pages/partner/SponsoredChildrenPage'));
const ChildProgressPage = lazy(() => import('./pages/partner/ChildProgressPage'));
const FundingPage = lazy(() => import('./pages/partner/FundingPage'));
const PartnerProfilePage = lazy(() => import('./pages/partner/PartnerProfilePage'));
const QuickLinksPage = lazy(() => import('./pages/partner/QuickLinksPage'));
const AIHighlightsPage = lazy(() => import('./pages/partner/AIHighlightsPage'));
const PartnerChildrenOverviewPage = lazy(() => import('./pages/partner/ChildrenOverviewPage'));
const ChildrenJourneyPage = lazy(() => import('./pages/partner/ChildrenJourneyPage'));
const ChildrenActivityPage = lazy(() => import('./pages/partner/ChildrenActivityPage'));
const ChildrenAchievementsPage = lazy(() => import('./pages/partner/ChildrenAchievementsPage'));
const ChildrenGoalsPage = lazy(() => import('./pages/partner/ChildrenGoalsPage'));
const ChildrenAIInsightsPage = lazy(() => import('./pages/partner/ChildrenAIInsightsPage'));
const EnrollmentsPage = lazy(() => import('./pages/partner/EnrollmentsPage'));
const ImpactReportsPage = lazy(() => import('./pages/partner/ImpactReportsPage'));
const CollaborationPage = lazy(() => import('./pages/partner/CollaborationPage'));
const SponsoredCoursesPage = lazy(() => import('./pages/partner/SponsoredCoursesPage'));
const ResourceContributionsPage = lazy(() => import('./pages/partner/ResourceContributionsPage'));
const AIResourcesPage = lazy(() => import('./pages/partner/AIResourcesPage'));
const BudgetManagementPage = lazy(() => import('./pages/partner/BudgetManagementPage'));
const GrantTrackingPage = lazy(() => import('./pages/partner/GrantTrackingPage'));
const ROIMetricsPage = lazy(() => import('./pages/partner/ROIMetricsPage'));
const CustomReportsPage = lazy(() => import('./pages/partner/CustomReportsPage'));
const StudentInsightsPage = lazy(() => import('./pages/partner/StudentInsightsPage'));
const PartnerTicketsPage = lazy(() => import('./pages/partner/TicketsPage'));
const SupportResourcesPage = lazy(() => import('./pages/partner/SupportResourcesPage'));
const WebinarsPage = lazy(() => import('./pages/partner/WebinarsPage'));
const CertificationPage = lazy(() => import('./pages/partner/CertificationPage'));
const PartnerNotificationsPage = lazy(() => import('./pages/partner/NotificationsPage'));
const PartnerSettingsPage = lazy(() => import('./pages/partner/SettingsPage'));

// Admin Dashboard Pages (lazy-loaded for code splitting)
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AIProvidersPage = lazy(() => import('./pages/admin/AIProvidersPage'));
const PlatformPulsePage = lazy(() => import('./pages/admin/PlatformPulsePage'));
const UsersPage = lazy(() => import('./pages/admin/UsersPage'));
const UserDetailPage = lazy(() => import('./pages/admin/UserDetailPage'));
const RolesPermissionsPage = lazy(() => import('./pages/admin/RolesPermissionsPage'));
const FamiliesPage = lazy(() => import('./pages/admin/FamiliesPage'));
const RestrictionsPage = lazy(() => import('./pages/admin/RestrictionsPage'));
const CoursesAdminPage = lazy(() => import('./pages/admin/CoursesAdminPage'));
const CBCAlignmentPage = lazy(() => import('./pages/admin/CBCAlignmentPage'));
const AssessmentsAdminPage = lazy(() => import('./pages/admin/AssessmentsAdminPage'));
const CertificatesAdminPage = lazy(() => import('./pages/admin/CertificatesAdminPage'));
const ResourceLibraryPage = lazy(() => import('./pages/admin/ResourceLibraryPage'));
const AIMonitoringPage = lazy(() => import('./pages/admin/AIMonitoringPage'));
const AIContentReviewPage = lazy(() => import('./pages/admin/AIContentReviewPage'));
const AIPersonalizationPage = lazy(() => import('./pages/admin/AIPersonalizationPage'));
const AIPerformancePage = lazy(() => import('./pages/admin/AIPerformancePage'));
const LearningAnalyticsPage = lazy(() => import('./pages/admin/LearningAnalyticsPage'));
const BusinessAnalyticsPage = lazy(() => import('./pages/admin/BusinessAnalyticsPage'));
const CompliancePage = lazy(() => import('./pages/admin/CompliancePage'));
const CustomInsightsPage = lazy(() => import('./pages/admin/CustomInsightsPage'));
const MoneyFlowPage = lazy(() => import('./pages/admin/MoneyFlowPage'));
const PlansPage = lazy(() => import('./pages/admin/PlansPage'));
const PartnersAdminPage = lazy(() => import('./pages/admin/PartnersAdminPage'));
const InvoicesPage = lazy(() => import('./pages/admin/InvoicesPage'));
const TicketsPage = lazy(() => import('./pages/admin/TicketsPage'));
const TicketDetailPage = lazy(() => import('./pages/admin/TicketDetailPage'));
const ModerationPage = lazy(() => import('./pages/admin/ModerationPage'));
const SystemConfigPage = lazy(() => import('./pages/admin/SystemConfigPage'));
const AuditLogsPage = lazy(() => import('./pages/admin/AuditLogsPage'));
const AdminNotificationsPage = lazy(() => import('./pages/admin/AdminNotificationsPage'));
const AdminProfilePage = lazy(() => import('./pages/admin/AdminProfilePage'));
const AdminPreferencesPage = lazy(() => import('./pages/admin/AdminPreferencesPage'));
const SystemHealthPage = lazy(() => import('./pages/admin/SystemHealthPage'));

// Non-admin pages
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import QuizzesPage from './pages/QuizzesPage';
import CertificatesPage from './pages/CertificatesPage';
import NotificationsPage from './pages/NotificationsPage';
import ForumPage from './pages/ForumPage';
import PaymentPage from './pages/PaymentPage';
import WalletPage from './pages/WalletPage';
import TransactionsPage from './pages/TransactionsPage';
import MyCoursesPage from './pages/MyCoursesPage';
import CreateCoursePage from './pages/CreateCoursePage';
import LessonPlayerPage from './pages/LessonPlayerPage';
import InstructorDashboardPage from './pages/InstructorDashboardPage';

// Store / E-Commerce Pages
import StorePage from './pages/StorePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import CartDrawer from './components/store/CartDrawer';

// Staff Dashboard Pages (lazy-loaded for code splitting)
const StaffDashboardPage = lazy(() => import('./pages/staff/StaffDashboardPage'));
const StaffContentReviewPage = lazy(() => import('./pages/staff/ContentReviewPage'));
const StaffApprovalFeedbackPage = lazy(() => import('./pages/staff/ApprovalFeedbackPage'));
const StaffCBCStandardsPage = lazy(() => import('./pages/staff/CBCStandardsPage'));
const StaffSafetyPolicyPage = lazy(() => import('./pages/staff/SafetyPolicyPage'));
const StaffTicketsPage = lazy(() => import('./pages/staff/TicketsPage'));
const StaffTicketDetailPage = lazy(() => import('./pages/staff/TicketDetailPage'));
const StaffLiveSupportPage = lazy(() => import('./pages/staff/LiveSupportPage'));
const StaffStudentProgressPage = lazy(() => import('./pages/staff/StudentProgressPage'));
const StaffSessionsPage = lazy(() => import('./pages/staff/SessionsPage'));
const StaffLiveClassPage = lazy(() => import('./pages/staff/LiveClassPage'));
const StaffPlatformHealthPage = lazy(() => import('./pages/staff/PlatformHealthPage'));
const StaffContentPerformancePage = lazy(() => import('./pages/staff/ContentPerformancePage'));
const StaffSupportMetricsPage = lazy(() => import('./pages/staff/SupportMetricsPage'));
const StaffCustomReportsPage = lazy(() => import('./pages/staff/CustomReportsPage'));
const StaffStudentJourneysPage = lazy(() => import('./pages/staff/StudentJourneysPage'));
const StaffStudentJourneyDetailPage = lazy(() => import('./pages/staff/StudentJourneyDetailPage'));
const StaffKnowledgeBasePage = lazy(() => import('./pages/staff/KnowledgeBasePage'));
const StaffKBArticleEditorPage = lazy(() => import('./pages/staff/KBArticleEditorPage'));
const StaffContentStudioPage = lazy(() => import('./pages/staff/ContentStudioPage'));
const StaffContentEditorPage = lazy(() => import('./pages/staff/ContentEditorPage'));
const StaffAssessmentBuilderPage = lazy(() => import('./pages/staff/AssessmentBuilderPage'));
const StaffAssessmentEditorPage = lazy(() => import('./pages/staff/AssessmentEditorPage'));
const StaffMyPerformancePage = lazy(() => import('./pages/staff/MyPerformancePage'));
const StaffTeamPulsePage = lazy(() => import('./pages/staff/TeamPulsePage'));
const StaffLearningResourcesPage = lazy(() => import('./pages/staff/LearningResourcesPage'));
const StaffNotificationsPage = lazy(() => import('./pages/staff/StaffNotificationsPage'));
const StaffProfilePage = lazy(() => import('./pages/staff/StaffProfilePage'));
const StaffPreferencesPage = lazy(() => import('./pages/staff/StaffPreferencesPage'));
const StaffSecurityPage = lazy(() => import('./pages/staff/StaffSecurityPage'));

// Instructor Dashboard Pages (lazy-loaded for code splitting)
const AIInsightsPage = lazy(() => import('./pages/instructor/AIInsightsPage').then(m => ({ default: m.AIInsightsPage })));
const MyCoursesInstructorPage = lazy(() => import('./pages/instructor/MyCoursesPage').then(m => ({ default: m.MyCoursesPage })));
const CourseEditorPage = lazy(() => import('./pages/instructor/CourseEditorPage').then(m => ({ default: m.CourseEditorPage })));
const ModulesEditorPage = lazy(() => import('./pages/instructor/ModulesEditorPage').then(m => ({ default: m.ModulesEditorPage })));
const CBCAlignmentInstructorPage = lazy(() => import('./pages/instructor/CBCAlignmentPage').then(m => ({ default: m.CBCAlignmentPage })));
const AssessmentsInstructorPage = lazy(() => import('./pages/instructor/AssessmentsPage').then(m => ({ default: m.AssessmentsPage })));
const AssessmentEditorPage = lazy(() => import('./pages/instructor/AssessmentEditorPage').then(m => ({ default: m.AssessmentEditorPage })));
const SubmissionsPage = lazy(() => import('./pages/instructor/SubmissionsPage').then(m => ({ default: m.SubmissionsPage })));
const ResourcesInstructorPage = lazy(() => import('./pages/instructor/ResourcesPage').then(m => ({ default: m.ResourcesPage })));
const SessionsInstructorPage = lazy(() => import('./pages/instructor/SessionsPage').then(m => ({ default: m.SessionsPage })));
const SessionDetailInstructorPage = lazy(() => import('./pages/instructor/SessionDetailPage').then(m => ({ default: m.SessionDetailPage })));
const LiveSessionPage = lazy(() => import('./pages/instructor/LiveSessionPage').then(m => ({ default: m.LiveSessionPage })));
const MessagesPage = lazy(() => import('./pages/instructor/MessagesPage').then(m => ({ default: m.MessagesPage })));
const AIHandoffPage = lazy(() => import('./pages/instructor/AIHandoffPage').then(m => ({ default: m.AIHandoffPage })));
const ProgressPulsePage = lazy(() => import('./pages/instructor/ProgressPulsePage').then(m => ({ default: m.ProgressPulsePage })));
const InterventionsPage = lazy(() => import('./pages/instructor/InterventionsPage').then(m => ({ default: m.InterventionsPage })));
const DiscussionsPage = lazy(() => import('./pages/instructor/DiscussionsPage').then(m => ({ default: m.DiscussionsPage })));
const FeedbackPage = lazy(() => import('./pages/instructor/FeedbackPage').then(m => ({ default: m.FeedbackPage })));
const SentimentAnalysisPage = lazy(() => import('./pages/instructor/SentimentAnalysisPage').then(m => ({ default: m.SentimentAnalysisPage })));
const PerformancePage = lazy(() => import('./pages/instructor/PerformancePage').then(m => ({ default: m.PerformancePage })));
const BadgesPage = lazy(() => import('./pages/instructor/BadgesPage').then(m => ({ default: m.BadgesPage })));
const RecognitionPage = lazy(() => import('./pages/instructor/RecognitionPage').then(m => ({ default: m.RecognitionPage })));
const EarningsDashboardPage = lazy(() => import('./pages/instructor/EarningsDashboardPage').then(m => ({ default: m.EarningsDashboardPage })));
const PayoutsPage = lazy(() => import('./pages/instructor/PayoutsPage').then(m => ({ default: m.PayoutsPage })));
const EarningsBreakdownPage = lazy(() => import('./pages/instructor/EarningsBreakdownPage').then(m => ({ default: m.EarningsBreakdownPage })));
const RatesPage = lazy(() => import('./pages/instructor/RatesPage').then(m => ({ default: m.RatesPage })));
const DocumentsPage = lazy(() => import('./pages/instructor/DocumentsPage').then(m => ({ default: m.DocumentsPage })));
const CBCReferencesPage = lazy(() => import('./pages/instructor/CBCReferencesPage').then(m => ({ default: m.CBCReferencesPage })));
const AIPromptsPage = lazy(() => import('./pages/instructor/AIPromptsPage').then(m => ({ default: m.AIPromptsPage })));
const CommunityLoungePage = lazy(() => import('./pages/instructor/CommunityLoungePage').then(m => ({ default: m.CommunityLoungePage })));
const CoCreatePage = lazy(() => import('./pages/instructor/CoCreatePage').then(m => ({ default: m.CoCreatePage })));
const SupportTicketsPage = lazy(() => import('./pages/instructor/SupportTicketsPage').then(m => ({ default: m.SupportTicketsPage })));
const SupportTicketDetailPage = lazy(() => import('./pages/instructor/SupportTicketDetailPage').then(m => ({ default: m.SupportTicketDetailPage })));
const InstructorNotificationsPage = lazy(() => import('./pages/instructor/InstructorNotificationsPage').then(m => ({ default: m.InstructorNotificationsPage })));
const InstructorProfilePage = lazy(() => import('./pages/instructor/ProfilePage').then(m => ({ default: m.ProfilePage })));
const PublicPageSettingsPage = lazy(() => import('./pages/instructor/PublicPageSettingsPage').then(m => ({ default: m.PublicPageSettingsPage })));
const AvailabilityPage = lazy(() => import('./pages/instructor/AvailabilityPage').then(m => ({ default: m.AvailabilityPage })));
const SecurityPage = lazy(() => import('./pages/instructor/SecurityPage').then(m => ({ default: m.SecurityPage })));
const LoginHistoryPage = lazy(() => import('./pages/instructor/LoginHistoryPage').then(m => ({ default: m.LoginHistoryPage })));
const InstructorPublicProfilePage = lazy(() => import('./pages/InstructorPublicProfilePage').then(m => ({ default: m.InstructorPublicProfilePage })));

// Student Dashboard Pages (lazy-loaded for code splitting)
const StudentDashboardHome = lazy(() => import('./pages/student/StudentDashboardHome'));
const AIPlanPage = lazy(() => import('./pages/student/AIPlanPage'));
const StreakPage = lazy(() => import('./pages/student/StreakPage'));
const MoodCheckPage = lazy(() => import('./pages/student/MoodCheckPage'));
const UrgentItemsPage = lazy(() => import('./pages/student/UrgentItemsPage'));
const DailyQuotePage = lazy(() => import('./pages/student/DailyQuotePage'));
const AITutorChatPage = lazy(() => import('./pages/student/AITutorChatPage'));
const LearningPathPage = lazy(() => import('./pages/student/LearningPathPage'));
const VoiceModePage = lazy(() => import('./pages/student/VoiceModePage'));
const AIJournalPage = lazy(() => import('./pages/student/AIJournalPage'));
const HelpMeUnderstandPage = lazy(() => import('./pages/student/HelpMeUnderstandPage'));
const TeacherCollabPage = lazy(() => import('./pages/student/TeacherCollabPage'));
const EnrolledCoursesPage = lazy(() => import('./pages/student/EnrolledCoursesPage'));
const AIRecommendedPage = lazy(() => import('./pages/student/AIRecommendedPage'));
const BrowseCoursesPage = lazy(() => import('./pages/student/BrowseCoursesPage'));
const WishlistPage = lazy(() => import('./pages/student/WishlistPage'));
const JoinLivePage = lazy(() => import('./pages/student/JoinLivePage'));
const UpcomingSessionsPage = lazy(() => import('./pages/student/UpcomingSessionsPage'));
const ClassCalendarPage = lazy(() => import('./pages/student/ClassCalendarPage'));
const RecordingsPage = lazy(() => import('./pages/student/RecordingsPage'));
const TodaysChallengesPage = lazy(() => import('./pages/student/TodaysChallengesPage'));
const AssignmentsDueSoonPage = lazy(() => import('./pages/student/AssignmentsDueSoonPage'));
const AssignmentsPendingPage = lazy(() => import('./pages/student/AssignmentsPendingPage'));
const AssignmentsSubmittedPage = lazy(() => import('./pages/student/AssignmentsSubmittedPage'));
const QuizzesUpcomingPage = lazy(() => import('./pages/student/QuizzesUpcomingPage'));
const QuizPracticeModePage = lazy(() => import('./pages/student/QuizPracticeModePage'));
const QuizResultsPage = lazy(() => import('./pages/student/QuizResultsPage'));
const ActiveProjectsPage = lazy(() => import('./pages/student/ActiveProjectsPage'));
const ProjectUploadPage = lazy(() => import('./pages/student/ProjectUploadPage'));
const PeerGalleryPage = lazy(() => import('./pages/student/PeerGalleryPage'));
const AchievementsGalleryPage = lazy(() => import('./pages/student/AchievementsGalleryPage'));
const RecentUnlocksPage = lazy(() => import('./pages/student/RecentUnlocksPage'));
const LearningMapPage = lazy(() => import('./pages/student/LearningMapPage'));
const WeeklyStoryPage = lazy(() => import('./pages/student/WeeklyStoryPage'));
const VisualTrendsPage = lazy(() => import('./pages/student/VisualTrendsPage'));
const SetGoalsPage = lazy(() => import('./pages/student/SetGoalsPage'));
const TrackStreaksPage = lazy(() => import('./pages/student/TrackStreaksPage'));
const ConnectPage = lazy(() => import('./pages/student/ConnectPage'));
const StudyGroupsPage = lazy(() => import('./pages/student/StudyGroupsPage'));
const DiscussionsRecentPage = lazy(() => import('./pages/student/DiscussionsRecentPage'));
const MyPostsPage = lazy(() => import('./pages/student/MyPostsPage'));
const SavedPostsPage = lazy(() => import('./pages/student/SavedPostsPage'));
const ClassWallPage = lazy(() => import('./pages/student/ClassWallPage'));
const WalletBalancePage = lazy(() => import('./pages/student/WalletBalancePage'));
const MpesaTopupPage = lazy(() => import('./pages/student/MpesaTopupPage'));
const CardPaymentPage = lazy(() => import('./pages/student/CardPaymentPage'));
const SubscriptionsPage = lazy(() => import('./pages/student/SubscriptionsPage'));
const HowToGuidesPage = lazy(() => import('./pages/student/HowToGuidesPage'));
const ContactSupportPage = lazy(() => import('./pages/student/ContactSupportPage'));
const StudentNotificationsPage = lazy(() => import('./pages/student/StudentNotificationsPage'));
const StudentProfilePage = lazy(() => import('./pages/student/StudentProfilePage'));
const StudentPreferencesPage = lazy(() => import('./pages/student/StudentPreferencesPage'));
const PrivacySecurityPage = lazy(() => import('./pages/student/PrivacySecurityPage'));

// Student Dashboard - New Pages (Phase 4A-4G)
// 4A: Learning
const TopicExplorerPage = lazy(() => import('./pages/student/TopicExplorerPage'));
const CoursePreviewPage = lazy(() => import('./pages/student/CoursePreviewPage'));
// 4B: Practice & Assessments
const AssignmentsFeedbackPage = lazy(() => import('./pages/student/AssignmentsFeedbackPage'));
const AssignmentsResubmitPage = lazy(() => import('./pages/student/AssignmentsResubmitPage'));
const SkillReportsPage = lazy(() => import('./pages/student/SkillReportsPage'));
const ProjectFeedbackPage = lazy(() => import('./pages/student/ProjectFeedbackPage'));
// 4C: Progress & Growth
const ShareableCardsPage = lazy(() => import('./pages/student/ShareableCardsPage'));
const StrengthsPage = lazy(() => import('./pages/student/StrengthsPage'));
const GrowingAreasPage = lazy(() => import('./pages/student/GrowingAreasPage'));
const ParentSummaryPage = lazy(() => import('./pages/student/ParentSummaryPage'));
const AINudgesPage = lazy(() => import('./pages/student/AINudgesPage'));
const TeacherInsightsPage = lazy(() => import('./pages/student/TeacherInsightsPage'));
// 4D: Community
const CollaborativeProjectsPage = lazy(() => import('./pages/student/CollaborativeProjectsPage'));
const NewQuestionsPage = lazy(() => import('./pages/student/NewQuestionsPage'));
const GiveShoutoutsPage = lazy(() => import('./pages/student/GiveShoutoutsPage'));
const ReceiveShoutoutsPage = lazy(() => import('./pages/student/ReceiveShoutoutsPage'));
const TeacherQAPage = lazy(() => import('./pages/student/TeacherQAPage'));
// 4E: Wallet & Access
const RecentTransactionsPage = lazy(() => import('./pages/student/RecentTransactionsPage'));
const PaymentMethodsPage = lazy(() => import('./pages/student/PaymentMethodsPage'));
const UpgradePlanPage = lazy(() => import('./pages/student/UpgradePlanPage'));
const FamilyPlanPage = lazy(() => import('./pages/student/FamilyPlanPage'));
const ReceiptsPage = lazy(() => import('./pages/student/ReceiptsPage'));
const AIFundAdvisorPage = lazy(() => import('./pages/student/AIFundAdvisorPage'));
// 4F: Support & Help
const AskCommunityPage = lazy(() => import('./pages/student/AskCommunityPage'));
const TeacherChatPage = lazy(() => import('./pages/student/TeacherChatPage'));
const UrgentFlagPage = lazy(() => import('./pages/student/UrgentFlagPage'));
const ReportProblemPage = lazy(() => import('./pages/student/ReportProblemPage'));
const AIHelpTriagePage = lazy(() => import('./pages/student/AIHelpTriagePage'));
// 4G: Account
const PriorityAlertsPage = lazy(() => import('./pages/student/PriorityAlertsPage'));
const NotificationSettingsPage = lazy(() => import('./pages/student/NotificationSettingsPage'));
const AvatarPage = lazy(() => import('./pages/student/AvatarPage'));
const BioPage = lazy(() => import('./pages/student/BioPage'));
const LearningStylePage = lazy(() => import('./pages/student/LearningStylePage'));
const InterestsPage = lazy(() => import('./pages/student/InterestsPage'));
const AIPersonalityPage = lazy(() => import('./pages/student/AIPersonalityPage'));
const TeacherAccessPage = lazy(() => import('./pages/student/TeacherAccessPage'));

// Loading fallback (renders inside DashboardLayout content area)
const DashboardLoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500" />
  </div>
);

// Auto-detect role layout wrapper for non-dashboard authenticated routes
const DashboardLayoutAutoRole = () => {
  const { user } = useAuthStore();
  const role = (user?.role || 'student') as 'student' | 'parent' | 'instructor' | 'admin' | 'partner' | 'staff';
  return <DashboardLayout role={role} />;
};

// Shorthand for Suspense-wrapped lazy routes
const S = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<DashboardLoadingFallback />}>{children}</Suspense>
);

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const wasAuthenticated = React.useRef(isAuthenticated);

  // Redirect authenticated users from public pages to their dashboard
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      const onPublicPage = !location.pathname.startsWith('/dashboard/');
      const justLoggedIn = !wasAuthenticated.current;

      if (onPublicPage && (justLoggedIn || location.pathname === '/')) {
        navigate(`/dashboard/${user.role}`, { replace: true });
      }
    }
    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated, user, location.pathname, navigate]);

  return (
    <>
    <ScrollToTopOnNavigate />
    <CartDrawer />
    <Routes>
      {/* Public pages with shared header/footer */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CourseCatalogPage />} />
        <Route path="/courses/:courseId" element={<CourseDetailsPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/store" element={<StorePage />} />
        <Route path="/store/products/:slug" element={<ProductDetailPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/certificate-validation" element={<CertificateValidationPage />} />
        <Route path="/become-instructor" element={<BecomeInstructorPage />} />
        <Route path="/categories/:slug" element={<PlaceholderPage title="Category" />} />
        <Route path="/forum" element={<PublicForumPage />} />

        {/* Documentation Pages */}
        <Route path="/docs" element={<S><DocsLayout /></S>}>
          <Route index element={<S><DocsHomePage /></S>} />
          <Route path="getting-started" element={<S><GettingStartedPage /></S>} />
          <Route path="changelog" element={<S><ChangelogPage /></S>} />
          {/* Urban Home School v1 Guides */}
          <Route path="student-guide" element={<S><StudentGuidePage /></S>} />
          <Route path="parent-guide" element={<S><ParentGuidePage /></S>} />
          <Route path="instructor-guide" element={<S><InstructorGuidePage /></S>} />
          <Route path="partner-guide" element={<S><PartnerGuidePage /></S>} />
          <Route path="courses" element={<S><CoursesGuidePage /></S>} />
          <Route path="assessments" element={<S><AssessmentsGuidePage /></S>} />
          <Route path="payments" element={<S><PaymentsGuidePage /></S>} />
          <Route path="forum" element={<S><ForumGuidePage /></S>} />
          <Route path="store" element={<S><StoreGuidePage /></S>} />
          <Route path="certificates" element={<S><CertificatesGuidePage /></S>} />
          {/* Urban Bird v1 Guides */}
          <Route path="ai-tutor" element={<S><AITutorGuidePage /></S>} />
          <Route path="copilot" element={<S><CoPilotGuidePage /></S>} />
          <Route path="voice-mode" element={<S><VoiceModeGuidePage /></S>} />
          <Route path="learning-paths" element={<S><LearningPathsGuidePage /></S>} />
          {/* API Reference */}
          <Route path="api" element={<S><ApiOverviewPage /></S>} />
          <Route path="api/auth" element={<S><AuthApiPage /></S>} />
          <Route path="api/courses" element={<S><CoursesApiPage /></S>} />
          <Route path="api/ai-tutor" element={<S><AITutorApiPage /></S>} />
          <Route path="api/payments" element={<S><PaymentsApiPage /></S>} />
          <Route path="api/more" element={<S><MoreApisPage /></S>} />
          <Route path="faq" element={<S><DocsFAQPage /></S>} />
        </Route>
      </Route>

      {/* The Bird AI - full screen, no shared layout */}
      <Route path="/the-bird" element={<BotPage />} />

      {/* Public Instructor Profile */}
      <Route path="/instructor/:slug" element={<S><InstructorPublicProfilePage /></S>} />

      {/* ============================================================ */}
      {/* STUDENT DASHBOARD - Nested under DashboardLayout role="student" */}
      {/* ============================================================ */}
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

      {/* ============================================================ */}
      {/* PARENT DASHBOARD - Nested under DashboardLayout role="parent" */}
      {/* ============================================================ */}
      <Route path="/dashboard/parent" element={<ProtectedRoute allowedRoles={['parent']}><DashboardLayout role="parent" /></ProtectedRoute>}>
        <Route index element={<S><ParentDashboardHome /></S>} />
        <Route path="highlights" element={<S><HighlightsPage /></S>} />
        <Route path="urgent" element={<S><ParentUrgentItemsPage /></S>} />
        <Route path="mood" element={<S><MoodSnapshotPage /></S>} />
        {/* Children */}
        <Route path="children" element={<S><ChildrenOverviewPage /></S>} />
        <Route path="children/:childId" element={<S><ChildDetailPage /></S>} />
        {/* AI Insights (with childId) */}
        <Route path="ai/summary/:childId" element={<S><ParentAIInsightsPage /></S>} />
        <Route path="ai/learning-style/:childId" element={<S><AILearningStylePage /></S>} />
        <Route path="ai/support-tips/:childId" element={<S><AISupportTipsPage /></S>} />
        <Route path="ai/planning/:childId" element={<S><AIPlanningPage /></S>} />
        <Route path="ai/patterns/:childId" element={<S><AIPatternsPage /></S>} />
        <Route path="ai/warnings/:childId" element={<S><AIWarningsPage /></S>} />
        {/* AI Insights (without childId) */}
        <Route path="ai/summary" element={<S><ParentAIInsightsPage /></S>} />
        <Route path="ai/learning-style" element={<S><AILearningStylePage /></S>} />
        <Route path="ai/support-tips" element={<S><AISupportTipsPage /></S>} />
        <Route path="ai/planning" element={<S><AIPlanningPage /></S>} />
        <Route path="ai/patterns" element={<S><AIPatternsPage /></S>} />
        <Route path="ai/warnings" element={<S><AIWarningsPage /></S>} />
        {/* Children Sub-pages */}
        <Route path="learning-journey" element={<S><LearningJourneyPage /></S>} />
        <Route path="cbc-competencies" element={<S><CBCCompetenciesPage /></S>} />
        <Route path="activity" element={<S><ParentActivityPage /></S>} />
        <Route path="achievements" element={<S><ParentAchievementsPage /></S>} />
        <Route path="goals" element={<S><ParentGoalsPage /></S>} />
        {/* Communications */}
        <Route path="communications/inbox" element={<S><NotificationsInboxPage /></S>} />
        <Route path="messages" element={<S><ParentMessagesPage /></S>} />
        <Route path="support" element={<S><ParentSupportPage /></S>} />
        {/* Finance */}
        <Route path="finance/subscription" element={<S><SubscriptionPage /></S>} />
        <Route path="finance/history" element={<S><PaymentHistoryPage /></S>} />
        <Route path="finance/manage" element={<S><ManageSubscriptionPage /></S>} />
        <Route path="finance/addons" element={<S><ParentAddonsPage /></S>} />
        {/* Reports */}
        <Route path="reports" element={<S><ReportsListPage /></S>} />
        <Route path="reports/term-summary" element={<S><TermSummaryPage /></S>} />
        <Route path="reports/transcripts" element={<S><TranscriptsPage /></S>} />
        <Route path="reports/portfolio" element={<S><PortfolioExportPage /></S>} />
        {/* Settings */}
        <Route path="settings/notifications" element={<S><NotificationPrefsPage /></S>} />
        <Route path="settings/consent" element={<S><ParentConsentPage /></S>} />
        <Route path="settings/privacy" element={<S><ParentPrivacyPage /></S>} />
        <Route path="settings/family" element={<S><FamilyMembersPage /></S>} />
        <Route path="settings/profile" element={<S><ParentProfilePage /></S>} />
        <Route path="settings/security" element={<S><ParentSecurityPage /></S>} />
      </Route>

      {/* ============================================================ */}
      {/* INSTRUCTOR DASHBOARD - Nested under DashboardLayout role="instructor" */}
      {/* ============================================================ */}
      <Route path="/dashboard/instructor" element={<ProtectedRoute allowedRoles={['instructor']}><DashboardLayout role="instructor" /></ProtectedRoute>}>
        <Route index element={<S><DashboardInstructor /></S>} />
        <Route path="insights" element={<S><AIInsightsPage /></S>} />
        <Route path="courses" element={<S><MyCoursesInstructorPage /></S>} />
        <Route path="courses/create" element={<S><CourseEditorPage /></S>} />
        <Route path="courses/editor" element={<S><CourseEditorPage /></S>} />
        <Route path="courses/:courseId/edit" element={<S><CourseEditorPage /></S>} />
        <Route path="courses/:courseId/modules" element={<S><ModulesEditorPage /></S>} />
        <Route path="courses/:courseId/cbc-alignment" element={<S><CBCAlignmentInstructorPage /></S>} />
        <Route path="modules" element={<S><ModulesEditorPage /></S>} />
        <Route path="cbc-alignment" element={<S><CBCAlignmentInstructorPage /></S>} />
        <Route path="assessments" element={<S><AssessmentsInstructorPage /></S>} />
        <Route path="assessments/create" element={<S><AssessmentEditorPage /></S>} />
        <Route path="assessments/editor" element={<S><AssessmentEditorPage /></S>} />
        <Route path="assessments/:assessmentId/edit" element={<S><AssessmentEditorPage /></S>} />
        <Route path="submissions" element={<S><SubmissionsPage /></S>} />
        <Route path="submissions/:submissionId" element={<S><SubmissionsPage /></S>} />
        <Route path="resources" element={<S><ResourcesInstructorPage /></S>} />
        <Route path="sessions" element={<S><SessionsInstructorPage /></S>} />
        <Route path="sessions/create" element={<S><SessionDetailInstructorPage /></S>} />
        <Route path="sessions/:sessionId" element={<S><SessionDetailInstructorPage /></S>} />
        <Route path="sessions/:sessionId/live" element={<S><LiveSessionPage /></S>} />
        <Route path="messages" element={<S><MessagesPage /></S>} />
        <Route path="ai-handoff" element={<S><AIHandoffPage /></S>} />
        <Route path="progress-pulse" element={<S><ProgressPulsePage /></S>} />
        <Route path="interventions" element={<S><InterventionsPage /></S>} />
        <Route path="discussions" element={<S><DiscussionsPage /></S>} />
        <Route path="discussions/create" element={<S><DiscussionsPage /></S>} />
        <Route path="discussions/:postId" element={<S><DiscussionsPage /></S>} />
        <Route path="feedback" element={<S><FeedbackPage /></S>} />
        <Route path="feedback/sentiment" element={<S><SentimentAnalysisPage /></S>} />
        <Route path="performance" element={<S><PerformancePage /></S>} />
        <Route path="badges" element={<S><BadgesPage /></S>} />
        <Route path="recognition" element={<S><RecognitionPage /></S>} />
        <Route path="earnings" element={<S><EarningsDashboardPage /></S>} />
        <Route path="earnings/breakdown" element={<S><EarningsBreakdownPage /></S>} />
        <Route path="earnings/payouts" element={<S><PayoutsPage /></S>} />
        <Route path="earnings/rates" element={<S><RatesPage /></S>} />
        <Route path="earnings/documents" element={<S><DocumentsPage /></S>} />
        <Route path="hub/cbc-references" element={<S><CBCReferencesPage /></S>} />
        <Route path="hub/ai-prompts" element={<S><AIPromptsPage /></S>} />
        <Route path="hub/community" element={<S><CommunityLoungePage /></S>} />
        <Route path="hub/co-create" element={<S><CoCreatePage /></S>} />
        <Route path="hub/support" element={<S><SupportTicketsPage /></S>} />
        <Route path="hub/support/ticket/:ticketId" element={<S><SupportTicketDetailPage /></S>} />
        <Route path="notifications" element={<S><InstructorNotificationsPage /></S>} />
        <Route path="profile" element={<S><InstructorProfilePage /></S>} />
        <Route path="profile/public" element={<S><PublicPageSettingsPage /></S>} />
        <Route path="availability" element={<S><AvailabilityPage /></S>} />
        <Route path="security" element={<S><SecurityPage /></S>} />
        <Route path="security/login-history" element={<S><LoginHistoryPage /></S>} />
      </Route>

      {/* ============================================================ */}
      {/* PARTNER DASHBOARD - Nested under DashboardLayout role="partner" */}
      {/* ============================================================ */}
      <Route path="/dashboard/partner" element={<ProtectedRoute allowedRoles={['partner']}><DashboardLayout role="partner" /></ProtectedRoute>}>
        <Route index element={<S><PartnerDashboardPage /></S>} />
        <Route path="quick-links" element={<S><QuickLinksPage /></S>} />
        <Route path="ai-highlights" element={<S><AIHighlightsPage /></S>} />
        <Route path="sponsorships" element={<S><SponsorshipsPage /></S>} />
        <Route path="sponsored-children" element={<S><SponsoredChildrenPage /></S>} />
        <Route path="sponsored-children/:id" element={<S><ChildProgressPage /></S>} />
        {/* Children */}
        <Route path="children/overview" element={<S><PartnerChildrenOverviewPage /></S>} />
        <Route path="children/journey" element={<S><ChildrenJourneyPage /></S>} />
        <Route path="children/activity" element={<S><ChildrenActivityPage /></S>} />
        <Route path="children/achievements" element={<S><ChildrenAchievementsPage /></S>} />
        <Route path="children/goals" element={<S><ChildrenGoalsPage /></S>} />
        <Route path="children/ai-insights" element={<S><ChildrenAIInsightsPage /></S>} />
        {/* Partnership */}
        <Route path="enrollments" element={<S><EnrollmentsPage /></S>} />
        <Route path="impact-reports" element={<S><ImpactReportsPage /></S>} />
        <Route path="collaboration" element={<S><CollaborationPage /></S>} />
        {/* Content */}
        <Route path="courses" element={<S><SponsoredCoursesPage /></S>} />
        <Route path="resources" element={<S><ResourceContributionsPage /></S>} />
        <Route path="ai-resources" element={<S><AIResourcesPage /></S>} />
        {/* Finance */}
        <Route path="finance/funding" element={<S><FundingPage /></S>} />
        <Route path="finance/budget" element={<S><BudgetManagementPage /></S>} />
        <Route path="finance/grants" element={<S><GrantTrackingPage /></S>} />
        <Route path="funding" element={<S><FundingPage /></S>} />
        {/* Analytics */}
        <Route path="analytics/roi" element={<S><ROIMetricsPage /></S>} />
        <Route path="analytics/reports" element={<S><CustomReportsPage /></S>} />
        <Route path="analytics/student-insights" element={<S><StudentInsightsPage /></S>} />
        {/* Support */}
        <Route path="support/tickets" element={<S><PartnerTicketsPage /></S>} />
        <Route path="support/resources" element={<S><SupportResourcesPage /></S>} />
        <Route path="support/training/webinars" element={<S><WebinarsPage /></S>} />
        <Route path="support/training/certification" element={<S><CertificationPage /></S>} />
        {/* Account */}
        <Route path="notifications" element={<S><PartnerNotificationsPage /></S>} />
        <Route path="profile" element={<S><PartnerProfilePage /></S>} />
        <Route path="settings" element={<S><PartnerSettingsPage /></S>} />
      </Route>

      {/* ============================================================ */}
      {/* STAFF DASHBOARD - Nested under DashboardLayout role="staff" */}
      {/* ============================================================ */}
      <Route path="/dashboard/staff" element={<ProtectedRoute allowedRoles={['staff']}><DashboardLayout role="staff" /></ProtectedRoute>}>
        <Route index element={<S><StaffDashboardPage /></S>} />
        {/* Moderation & Quality */}
        <Route path="moderation/review" element={<S><StaffContentReviewPage /></S>} />
        <Route path="moderation/approvals" element={<S><StaffApprovalFeedbackPage /></S>} />
        <Route path="moderation/cbc" element={<S><StaffCBCStandardsPage /></S>} />
        <Route path="moderation/safety" element={<S><StaffSafetyPolicyPage /></S>} />
        {/* Support & Care */}
        <Route path="support/tickets" element={<S><StaffTicketsPage /></S>} />
        <Route path="support/tickets/:ticketId" element={<S><StaffTicketDetailPage /></S>} />
        <Route path="support/live" element={<S><StaffLiveSupportPage /></S>} />
        <Route path="support/journeys" element={<S><StaffStudentJourneysPage /></S>} />
        <Route path="support/journeys/:journeyId" element={<S><StaffStudentJourneyDetailPage /></S>} />
        <Route path="support/kb" element={<S><StaffKnowledgeBasePage /></S>} />
        <Route path="support/kb/editor" element={<S><StaffKBArticleEditorPage /></S>} />
        <Route path="support/kb/editor/:articleId" element={<S><StaffKBArticleEditorPage /></S>} />
        {/* Learning Experience */}
        <Route path="learning/sessions" element={<S><StaffSessionsPage /></S>} />
        <Route path="learning/sessions/:sessionId/live" element={<S><StaffLiveClassPage /></S>} />
        <Route path="learning/progress" element={<S><StaffStudentProgressPage /></S>} />
        <Route path="learning/content" element={<S><StaffContentStudioPage /></S>} />
        <Route path="learning/content/editor" element={<S><StaffContentEditorPage /></S>} />
        <Route path="learning/content/editor/:contentId" element={<S><StaffContentEditorPage /></S>} />
        <Route path="learning/assessments" element={<S><StaffAssessmentBuilderPage /></S>} />
        <Route path="learning/assessments/editor" element={<S><StaffAssessmentEditorPage /></S>} />
        <Route path="learning/assessments/editor/:assessmentId" element={<S><StaffAssessmentEditorPage /></S>} />
        {/* Insights & Impact */}
        <Route path="insights/health" element={<S><StaffPlatformHealthPage /></S>} />
        <Route path="insights/content" element={<S><StaffContentPerformancePage /></S>} />
        <Route path="insights/support" element={<S><StaffSupportMetricsPage /></S>} />
        <Route path="insights/reports" element={<S><StaffCustomReportsPage /></S>} />
        {/* Team & Growth */}
        <Route path="team/performance" element={<S><StaffMyPerformancePage /></S>} />
        <Route path="team/pulse" element={<S><StaffTeamPulsePage /></S>} />
        <Route path="team/resources" element={<S><StaffLearningResourcesPage /></S>} />
        {/* Account */}
        <Route path="account/notifications" element={<S><StaffNotificationsPage /></S>} />
        <Route path="account/profile" element={<S><StaffProfilePage /></S>} />
        <Route path="account/preferences" element={<S><StaffPreferencesPage /></S>} />
        <Route path="account/security" element={<S><StaffSecurityPage /></S>} />
      </Route>

      {/* ============================================================ */}
      {/* ADMIN DASHBOARD - Nested under DashboardLayout role="admin" */}
      {/* ============================================================ */}
      <Route path="/dashboard/admin" element={<ProtectedRoute allowedRoles={['admin']}><DashboardLayout role="admin" /></ProtectedRoute>}>
        <Route index element={<S><AdminDashboardPage /></S>} />
        <Route path="pulse" element={<S><PlatformPulsePage /></S>} />
        <Route path="ai-providers" element={<S><AIProvidersPage /></S>} />
        {/* People & Access */}
        <Route path="users" element={<S><UsersPage /></S>} />
        <Route path="users/:id" element={<S><UserDetailPage /></S>} />
        <Route path="roles-permissions" element={<S><RolesPermissionsPage /></S>} />
        <Route path="families" element={<S><FamiliesPage /></S>} />
        <Route path="restrictions" element={<S><RestrictionsPage /></S>} />
        {/* Content & Learning */}
        <Route path="courses" element={<S><CoursesAdminPage /></S>} />
        <Route path="cbc-alignment" element={<S><CBCAlignmentPage /></S>} />
        <Route path="assessments" element={<S><AssessmentsAdminPage /></S>} />
        <Route path="certificates" element={<S><CertificatesAdminPage /></S>} />
        <Route path="resources" element={<S><ResourceLibraryPage /></S>} />
        {/* AI Systems */}
        <Route path="ai-monitoring" element={<S><AIMonitoringPage /></S>} />
        <Route path="ai-content" element={<S><AIContentReviewPage /></S>} />
        <Route path="ai-personalization" element={<S><AIPersonalizationPage /></S>} />
        <Route path="ai-performance" element={<S><AIPerformancePage /></S>} />
        {/* Analytics & Intelligence */}
        <Route path="analytics/learning" element={<S><LearningAnalyticsPage /></S>} />
        <Route path="analytics/business" element={<S><BusinessAnalyticsPage /></S>} />
        <Route path="analytics/compliance" element={<S><CompliancePage /></S>} />
        <Route path="analytics/custom" element={<S><CustomInsightsPage /></S>} />
        {/* Finance & Partnerships */}
        <Route path="finance/transactions" element={<S><MoneyFlowPage /></S>} />
        <Route path="finance/plans" element={<S><PlansPage /></S>} />
        <Route path="partners" element={<S><PartnersAdminPage /></S>} />
        <Route path="invoices" element={<S><InvoicesPage /></S>} />
        {/* Operations & Control */}
        <Route path="tickets" element={<S><TicketsPage /></S>} />
        <Route path="tickets/:id" element={<S><TicketDetailPage /></S>} />
        <Route path="moderation" element={<S><ModerationPage /></S>} />
        <Route path="config" element={<S><SystemConfigPage /></S>} />
        <Route path="audit-logs" element={<S><AuditLogsPage /></S>} />
        <Route path="system-health" element={<S><SystemHealthPage /></S>} />
        {/* Account */}
        <Route path="notifications" element={<S><AdminNotificationsPage /></S>} />
        <Route path="profile" element={<S><AdminProfilePage /></S>} />
        <Route path="preferences" element={<S><AdminPreferencesPage /></S>} />
      </Route>

      {/* ============================================================ */}
      {/* NON-DASHBOARD AUTHENTICATED ROUTES - Auto-detect role layout */}
      {/* ============================================================ */}
      <Route element={<ProtectedRoute><DashboardLayoutAutoRole /></ProtectedRoute>}>
        <Route path="/search" element={<Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" /></div>}><SearchResultsPage /></Suspense>} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/quizzes" element={<QuizzesPage />} />
        <Route path="/certificates" element={<CertificatesPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/dashboard/forum" element={<ForumPage />} />
        <Route path="/payments" element={<PaymentPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/my-courses" element={<MyCoursesPage />} />
        <Route path="/courses/create" element={<CreateCoursePage />} />
        <Route path="/courses/:courseId/lesson/:lessonId" element={<LessonPlayerPage />} />
        <Route path="/instructor/dashboard" element={<InstructorDashboardPage />} />
        <Route path="/store/checkout" element={<CheckoutPage />} />
        <Route path="/store/orders" element={<PlaceholderPage title="My Orders" />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<PlaceholderPage title="Page Not Found" />} />
    </Routes>
    </>
  );
};

const App: React.FC = () => {
  return (
    <GlobalErrorBoundary>
      <Router>
        <AppContent />
      </Router>
    </GlobalErrorBoundary>
  );
};

export default App;
