import { lazy } from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';
import { S } from './routeHelpers';

// Parent Dashboard Pages (lazy-loaded for code splitting)
const ParentDashboardHome = lazy(() => import('../pages/parent/ParentDashboardHome'));
const ChildrenOverviewPage = lazy(() => import('../pages/parent/ChildrenOverviewPage'));
const ChildDetailPage = lazy(() => import('../pages/parent/ChildDetailPage'));
const ParentAIInsightsPage = lazy(() => import('../pages/parent/AIInsightsPage'));
const AILearningStylePage = lazy(() => import('../pages/parent/AILearningStylePage'));
const AISupportTipsPage = lazy(() => import('../pages/parent/AISupportTipsPage'));
const AIPlanningPage = lazy(() => import('../pages/parent/AIPlanningPage'));
const AIPatternsPage = lazy(() => import('../pages/parent/AIPatternsPage'));
const AIWarningsPage = lazy(() => import('../pages/parent/AIWarningsPage'));
const HighlightsPage = lazy(() => import('../pages/parent/HighlightsPage'));
const ParentUrgentItemsPage = lazy(() => import('../pages/parent/UrgentItemsPage'));
const MoodSnapshotPage = lazy(() => import('../pages/parent/MoodSnapshotPage'));
const LearningJourneyPage = lazy(() => import('../pages/parent/LearningJourneyPage'));
const CBCCompetenciesPage = lazy(() => import('../pages/parent/CBCCompetenciesPage'));
const ParentActivityPage = lazy(() => import('../pages/parent/ActivityPage'));
const ParentAchievementsPage = lazy(() => import('../pages/parent/AchievementsPage'));
const ParentGoalsPage = lazy(() => import('../pages/parent/GoalsPage'));
const NotificationsInboxPage = lazy(() => import('../pages/parent/NotificationsInboxPage'));
const ParentMessagesPage = lazy(() => import('../pages/parent/MessagesPage'));
const ParentSupportPage = lazy(() => import('../pages/parent/SupportPage'));
const SubscriptionPage = lazy(() => import('../pages/parent/SubscriptionPage'));
const PaymentHistoryPage = lazy(() => import('../pages/parent/PaymentHistoryPage'));
const ManageSubscriptionPage = lazy(() => import('../pages/parent/ManageSubscriptionPage'));
const ParentAddonsPage = lazy(() => import('../pages/parent/AddonsPage'));
const ReportsListPage = lazy(() => import('../pages/parent/ReportsListPage'));
const TermSummaryPage = lazy(() => import('../pages/parent/TermSummaryPage'));
const TranscriptsPage = lazy(() => import('../pages/parent/TranscriptsPage'));
const PortfolioExportPage = lazy(() => import('../pages/parent/PortfolioExportPage'));
const NotificationPrefsPage = lazy(() => import('../pages/parent/NotificationPrefsPage'));
const ParentConsentPage = lazy(() => import('../pages/parent/ConsentPage'));
const ParentPrivacyPage = lazy(() => import('../pages/parent/PrivacyPage'));
const FamilyMembersPage = lazy(() => import('../pages/parent/FamilyMembersPage'));
const ParentProfilePage = lazy(() => import('../pages/parent/ProfilePage'));
const ParentSecurityPage = lazy(() => import('../pages/parent/SecurityPage'));

export const parentRoutes = (
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
);
