import { lazy } from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';
import { S } from './routeHelpers';

// Staff Dashboard Pages (lazy-loaded for code splitting)
const StaffDashboardPage = lazy(() => import('../pages/staff/StaffDashboardPage'));
const StaffContentReviewPage = lazy(() => import('../pages/staff/ContentReviewPage'));
const StaffApprovalFeedbackPage = lazy(() => import('../pages/staff/ApprovalFeedbackPage'));
const StaffCBCStandardsPage = lazy(() => import('../pages/staff/CBCStandardsPage'));
const StaffSafetyPolicyPage = lazy(() => import('../pages/staff/SafetyPolicyPage'));
const StaffTicketsPage = lazy(() => import('../pages/staff/TicketsPage'));
const StaffTicketDetailPage = lazy(() => import('../pages/staff/TicketDetailPage'));
const StaffLiveSupportPage = lazy(() => import('../pages/staff/LiveSupportPage'));
const StaffStudentProgressPage = lazy(() => import('../pages/staff/StudentProgressPage'));
const StaffSessionsPage = lazy(() => import('../pages/staff/SessionsPage'));
const StaffLiveClassPage = lazy(() => import('../pages/staff/LiveClassPage'));
const StaffPlatformHealthPage = lazy(() => import('../pages/staff/PlatformHealthPage'));
const StaffContentPerformancePage = lazy(() => import('../pages/staff/ContentPerformancePage'));
const StaffSupportMetricsPage = lazy(() => import('../pages/staff/SupportMetricsPage'));
const StaffCustomReportsPage = lazy(() => import('../pages/staff/CustomReportsPage'));
const StaffStudentJourneysPage = lazy(() => import('../pages/staff/StudentJourneysPage'));
const StaffStudentJourneyDetailPage = lazy(() => import('../pages/staff/StudentJourneyDetailPage'));
const StaffKnowledgeBasePage = lazy(() => import('../pages/staff/KnowledgeBasePage'));
const StaffKBArticleEditorPage = lazy(() => import('../pages/staff/KBArticleEditorPage'));
const StaffContentStudioPage = lazy(() => import('../pages/staff/ContentStudioPage'));
const StaffContentEditorPage = lazy(() => import('../pages/staff/ContentEditorPage'));
const StaffAssessmentBuilderPage = lazy(() => import('../pages/staff/AssessmentBuilderPage'));
const StaffAssessmentEditorPage = lazy(() => import('../pages/staff/AssessmentEditorPage'));
const StaffMyPerformancePage = lazy(() => import('../pages/staff/MyPerformancePage'));
const StaffTeamPulsePage = lazy(() => import('../pages/staff/TeamPulsePage'));
const StaffLearningResourcesPage = lazy(() => import('../pages/staff/LearningResourcesPage'));
const StaffNotificationsPage = lazy(() => import('../pages/staff/StaffNotificationsPage'));
const StaffProfilePage = lazy(() => import('../pages/staff/StaffProfilePage'));
const StaffPreferencesPage = lazy(() => import('../pages/staff/StaffPreferencesPage'));
const StaffSecurityPage = lazy(() => import('../pages/staff/StaffSecurityPage'));

export const staffRoutes = (
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
);
