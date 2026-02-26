import { lazy } from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';
import { S } from './routeHelpers';
import DashboardInstructor from '../pages/DashboardInstructor';

// Instructor Dashboard Pages (lazy-loaded for code splitting)
const AIInsightsPage = lazy(() => import('../pages/instructor/AIInsightsPage').then(m => ({ default: m.AIInsightsPage })));
const MyCoursesInstructorPage = lazy(() => import('../pages/instructor/MyCoursesPage').then(m => ({ default: m.MyCoursesPage })));
const CourseEditorPage = lazy(() => import('../pages/instructor/CourseEditorPage').then(m => ({ default: m.CourseEditorPage })));
const ModulesEditorPage = lazy(() => import('../pages/instructor/ModulesEditorPage').then(m => ({ default: m.ModulesEditorPage })));
const CBCAlignmentInstructorPage = lazy(() => import('../pages/instructor/CBCAlignmentPage').then(m => ({ default: m.CBCAlignmentPage })));
const AssessmentsInstructorPage = lazy(() => import('../pages/instructor/AssessmentsPage').then(m => ({ default: m.AssessmentsPage })));
const AssessmentEditorPage = lazy(() => import('../pages/instructor/AssessmentEditorPage').then(m => ({ default: m.AssessmentEditorPage })));
const SubmissionsPage = lazy(() => import('../pages/instructor/SubmissionsPage').then(m => ({ default: m.SubmissionsPage })));
const ResourcesInstructorPage = lazy(() => import('../pages/instructor/ResourcesPage').then(m => ({ default: m.ResourcesPage })));
const SessionsInstructorPage = lazy(() => import('../pages/instructor/SessionsPage').then(m => ({ default: m.SessionsPage })));
const SessionDetailInstructorPage = lazy(() => import('../pages/instructor/SessionDetailPage').then(m => ({ default: m.SessionDetailPage })));
const LiveSessionPage = lazy(() => import('../pages/instructor/LiveSessionPage').then(m => ({ default: m.LiveSessionPage })));
const MessagesPage = lazy(() => import('../pages/instructor/MessagesPage').then(m => ({ default: m.MessagesPage })));
const AIHandoffPage = lazy(() => import('../pages/instructor/AIHandoffPage').then(m => ({ default: m.AIHandoffPage })));
const ProgressPulsePage = lazy(() => import('../pages/instructor/ProgressPulsePage').then(m => ({ default: m.ProgressPulsePage })));
const InterventionsPage = lazy(() => import('../pages/instructor/InterventionsPage').then(m => ({ default: m.InterventionsPage })));
const DiscussionsPage = lazy(() => import('../pages/instructor/DiscussionsPage').then(m => ({ default: m.DiscussionsPage })));
const FeedbackPage = lazy(() => import('../pages/instructor/FeedbackPage').then(m => ({ default: m.FeedbackPage })));
const SentimentAnalysisPage = lazy(() => import('../pages/instructor/SentimentAnalysisPage').then(m => ({ default: m.SentimentAnalysisPage })));
const PerformancePage = lazy(() => import('../pages/instructor/PerformancePage').then(m => ({ default: m.PerformancePage })));
const BadgesPage = lazy(() => import('../pages/instructor/BadgesPage').then(m => ({ default: m.BadgesPage })));
const RecognitionPage = lazy(() => import('../pages/instructor/RecognitionPage').then(m => ({ default: m.RecognitionPage })));
const EarningsDashboardPage = lazy(() => import('../pages/instructor/EarningsDashboardPage').then(m => ({ default: m.EarningsDashboardPage })));
const PayoutsPage = lazy(() => import('../pages/instructor/PayoutsPage').then(m => ({ default: m.PayoutsPage })));
const EarningsBreakdownPage = lazy(() => import('../pages/instructor/EarningsBreakdownPage').then(m => ({ default: m.EarningsBreakdownPage })));
const RatesPage = lazy(() => import('../pages/instructor/RatesPage').then(m => ({ default: m.RatesPage })));
const DocumentsPage = lazy(() => import('../pages/instructor/DocumentsPage').then(m => ({ default: m.DocumentsPage })));
const CBCReferencesPage = lazy(() => import('../pages/instructor/CBCReferencesPage').then(m => ({ default: m.CBCReferencesPage })));
const AIPromptsPage = lazy(() => import('../pages/instructor/AIPromptsPage').then(m => ({ default: m.AIPromptsPage })));
const CommunityLoungePage = lazy(() => import('../pages/instructor/CommunityLoungePage').then(m => ({ default: m.CommunityLoungePage })));
const CoCreatePage = lazy(() => import('../pages/instructor/CoCreatePage').then(m => ({ default: m.CoCreatePage })));
const SupportTicketsPage = lazy(() => import('../pages/instructor/SupportTicketsPage').then(m => ({ default: m.SupportTicketsPage })));
const SupportTicketDetailPage = lazy(() => import('../pages/instructor/SupportTicketDetailPage').then(m => ({ default: m.SupportTicketDetailPage })));
const InstructorNotificationsPage = lazy(() => import('../pages/instructor/InstructorNotificationsPage').then(m => ({ default: m.InstructorNotificationsPage })));
const InstructorProfilePage = lazy(() => import('../pages/instructor/ProfilePage').then(m => ({ default: m.ProfilePage })));
const PublicPageSettingsPage = lazy(() => import('../pages/instructor/PublicPageSettingsPage').then(m => ({ default: m.PublicPageSettingsPage })));
const AvailabilityPage = lazy(() => import('../pages/instructor/AvailabilityPage').then(m => ({ default: m.AvailabilityPage })));
const SecurityPage = lazy(() => import('../pages/instructor/SecurityPage').then(m => ({ default: m.SecurityPage })));
const LoginHistoryPage = lazy(() => import('../pages/instructor/LoginHistoryPage').then(m => ({ default: m.LoginHistoryPage })));
const WithdrawalRequestPage = lazy(() => import('../pages/instructor/WithdrawalRequestPage'));
const CourseEnrollmentsPage = lazy(() =>
  import('../pages/instructor/CourseEnrollmentsPage').then(m => ({ default: m.CourseEnrollmentsPage }))
);
const AvatarPage = lazy(() => import('../pages/student/AvatarPage'));

export const instructorRoutes = (
  <Route path="/dashboard/instructor" element={<ProtectedRoute allowedRoles={['instructor']}><DashboardLayout role="instructor" /></ProtectedRoute>}>
    <Route index element={<S><DashboardInstructor /></S>} />
    <Route path="insights" element={<S><AIInsightsPage /></S>} />
    <Route path="courses" element={<S><MyCoursesInstructorPage /></S>} />
    <Route path="courses/create" element={<S><CourseEditorPage /></S>} />
    <Route path="courses/editor" element={<S><CourseEditorPage /></S>} />
    <Route path="courses/:courseId/edit" element={<S><CourseEditorPage /></S>} />
    <Route path="courses/:courseId/modules" element={<S><ModulesEditorPage /></S>} />
    <Route path="courses/:courseId/cbc-alignment" element={<S><CBCAlignmentInstructorPage /></S>} />
    <Route path="courses/:courseId/enrollments" element={<S><CourseEnrollmentsPage /></S>} />
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
    <Route path="earnings/withdraw" element={<S><WithdrawalRequestPage /></S>} />
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
    <Route path="profile/avatar" element={<S><AvatarPage /></S>} />
  </Route>
);
