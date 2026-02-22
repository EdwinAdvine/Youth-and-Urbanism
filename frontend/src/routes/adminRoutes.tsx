import { lazy } from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';
import { S } from './routeHelpers';

// Admin Dashboard Pages (lazy-loaded for code splitting)
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
const AIProvidersPage = lazy(() => import('../pages/admin/AIProvidersPage'));
const PlatformPulsePage = lazy(() => import('../pages/admin/PlatformPulsePage'));
const UsersPage = lazy(() => import('../pages/admin/UsersPage'));
const UserDetailPage = lazy(() => import('../pages/admin/UserDetailPage'));
const RolesPermissionsPage = lazy(() => import('../pages/admin/RolesPermissionsPage'));
const FamiliesPage = lazy(() => import('../pages/admin/FamiliesPage'));
const RestrictionsPage = lazy(() => import('../pages/admin/RestrictionsPage'));
const CoursesAdminPage = lazy(() => import('../pages/admin/CoursesAdminPage'));
const CBCAlignmentPage = lazy(() => import('../pages/admin/CBCAlignmentPage'));
const AssessmentsAdminPage = lazy(() => import('../pages/admin/AssessmentsAdminPage'));
const CertificatesAdminPage = lazy(() => import('../pages/admin/CertificatesAdminPage'));
const ResourceLibraryPage = lazy(() => import('../pages/admin/ResourceLibraryPage'));
const AIMonitoringPage = lazy(() => import('../pages/admin/AIMonitoringPage'));
const AIContentReviewPage = lazy(() => import('../pages/admin/AIContentReviewPage'));
const AIPersonalizationPage = lazy(() => import('../pages/admin/AIPersonalizationPage'));
const AIPerformancePage = lazy(() => import('../pages/admin/AIPerformancePage'));
const LearningAnalyticsPage = lazy(() => import('../pages/admin/LearningAnalyticsPage'));
const BusinessAnalyticsPage = lazy(() => import('../pages/admin/BusinessAnalyticsPage'));
const CompliancePage = lazy(() => import('../pages/admin/CompliancePage'));
const CustomInsightsPage = lazy(() => import('../pages/admin/CustomInsightsPage'));
const MoneyFlowPage = lazy(() => import('../pages/admin/MoneyFlowPage'));
const PlansPage = lazy(() => import('../pages/admin/PlansPage'));
const PartnersAdminPage = lazy(() => import('../pages/admin/PartnersAdminPage'));
const InvoicesPage = lazy(() => import('../pages/admin/InvoicesPage'));
const TicketsPage = lazy(() => import('../pages/admin/TicketsPage'));
const TicketDetailPage = lazy(() => import('../pages/admin/TicketDetailPage'));
const ModerationPage = lazy(() => import('../pages/admin/ModerationPage'));
const SystemConfigPage = lazy(() => import('../pages/admin/SystemConfigPage'));
const AuditLogsPage = lazy(() => import('../pages/admin/AuditLogsPage'));
const AdminNotificationsPage = lazy(() => import('../pages/admin/AdminNotificationsPage'));
const AdminProfilePage = lazy(() => import('../pages/admin/AdminProfilePage'));
const AdminPreferencesPage = lazy(() => import('../pages/admin/AdminPreferencesPage'));
const SystemHealthPage = lazy(() => import('../pages/admin/SystemHealthPage'));
const StaffAccountsPage = lazy(() => import('../pages/admin/StaffAccountsPage'));
const FinancialAccessPage = lazy(() => import('../pages/admin/FinancialAccessPage'));
const WithdrawalQueuePage = lazy(() => import('../pages/admin/WithdrawalQueuePage'));
const RevenueSplitConfigPage = lazy(() => import('../pages/admin/RevenueSplitConfigPage'));
const PlanFeaturesPage = lazy(() => import('../pages/admin/PlanFeaturesPage'));
const AvatarPage = lazy(() => import('../pages/student/AvatarPage'));

export const adminRoutes = (
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
    <Route path="finance/plans/:planId/features" element={<S><PlanFeaturesPage /></S>} />
    <Route path="finance/access" element={<S><FinancialAccessPage /></S>} />
    <Route path="finance/withdrawals" element={<S><WithdrawalQueuePage /></S>} />
    <Route path="finance/revenue-split" element={<S><RevenueSplitConfigPage /></S>} />
    <Route path="partners" element={<S><PartnersAdminPage /></S>} />
    <Route path="invoices" element={<S><InvoicesPage /></S>} />
    {/* Operations & Control */}
    <Route path="tickets" element={<S><TicketsPage /></S>} />
    <Route path="tickets/:id" element={<S><TicketDetailPage /></S>} />
    <Route path="moderation" element={<S><ModerationPage /></S>} />
    <Route path="config" element={<S><SystemConfigPage /></S>} />
    <Route path="audit-logs" element={<S><AuditLogsPage /></S>} />
    <Route path="system-health" element={<S><SystemHealthPage /></S>} />
    <Route path="staff-accounts" element={<S><StaffAccountsPage /></S>} />
    {/* Account */}
    <Route path="notifications" element={<S><AdminNotificationsPage /></S>} />
    <Route path="profile" element={<S><AdminProfilePage /></S>} />
    <Route path="profile/avatar" element={<S><AvatarPage /></S>} />
    <Route path="preferences" element={<S><AdminPreferencesPage /></S>} />
  </Route>
);
