import { lazy } from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';
import { S } from './routeHelpers';

// Partner Dashboard Pages (lazy-loaded for code splitting)
const PartnerDashboardPage = lazy(() => import('../pages/partner/PartnerDashboardPage'));
const SponsorshipsPage = lazy(() => import('../pages/partner/SponsorshipsPage'));
const SponsoredChildrenPage = lazy(() => import('../pages/partner/SponsoredChildrenPage'));
const ChildProgressPage = lazy(() => import('../pages/partner/ChildProgressPage'));
const FundingPage = lazy(() => import('../pages/partner/FundingPage'));
const PartnerProfilePage = lazy(() => import('../pages/partner/PartnerProfilePage'));
const QuickLinksPage = lazy(() => import('../pages/partner/QuickLinksPage'));
const AIHighlightsPage = lazy(() => import('../pages/partner/AIHighlightsPage'));
const PartnerChildrenOverviewPage = lazy(() => import('../pages/partner/ChildrenOverviewPage'));
const ChildrenJourneyPage = lazy(() => import('../pages/partner/ChildrenJourneyPage'));
const ChildrenActivityPage = lazy(() => import('../pages/partner/ChildrenActivityPage'));
const ChildrenAchievementsPage = lazy(() => import('../pages/partner/ChildrenAchievementsPage'));
const ChildrenGoalsPage = lazy(() => import('../pages/partner/ChildrenGoalsPage'));
const ChildrenAIInsightsPage = lazy(() => import('../pages/partner/ChildrenAIInsightsPage'));
const EnrollmentsPage = lazy(() => import('../pages/partner/EnrollmentsPage'));
const ImpactReportsPage = lazy(() => import('../pages/partner/ImpactReportsPage'));
const CollaborationPage = lazy(() => import('../pages/partner/CollaborationPage'));
const SponsoredCoursesPage = lazy(() => import('../pages/partner/SponsoredCoursesPage'));
const ResourceContributionsPage = lazy(() => import('../pages/partner/ResourceContributionsPage'));
const AIResourcesPage = lazy(() => import('../pages/partner/AIResourcesPage'));
const BudgetManagementPage = lazy(() => import('../pages/partner/BudgetManagementPage'));
const GrantTrackingPage = lazy(() => import('../pages/partner/GrantTrackingPage'));
const ROIMetricsPage = lazy(() => import('../pages/partner/ROIMetricsPage'));
const CustomReportsPage = lazy(() => import('../pages/partner/CustomReportsPage'));
const StudentInsightsPage = lazy(() => import('../pages/partner/StudentInsightsPage'));
const PartnerTicketsPage = lazy(() => import('../pages/partner/TicketsPage'));
const SupportResourcesPage = lazy(() => import('../pages/partner/SupportResourcesPage'));
const WebinarsPage = lazy(() => import('../pages/partner/WebinarsPage'));
const CertificationPage = lazy(() => import('../pages/partner/CertificationPage'));
const PartnerNotificationsPage = lazy(() => import('../pages/partner/NotificationsPage'));
const PartnerSettingsPage = lazy(() => import('../pages/partner/SettingsPage'));
const PartnerWalletPage = lazy(() => import('../pages/partner/WalletPage'));
const AvatarPage = lazy(() => import('../pages/student/AvatarPage'));

export const partnerRoutes = (
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
    <Route path="finance/wallet" element={<S><PartnerWalletPage /></S>} />
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
    <Route path="profile/avatar" element={<S><AvatarPage /></S>} />
    <Route path="settings" element={<S><PartnerSettingsPage /></S>} />
  </Route>
);
