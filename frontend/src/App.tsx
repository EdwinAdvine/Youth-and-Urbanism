import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import './App.css';

// Layouts
import PublicLayout from './components/layout/PublicLayout';

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

// Protected Pages
import ProtectedRoute from './components/ProtectedRoute';
import DashboardStudent from './pages/DashboardStudent';
import DashboardParent from './pages/DashboardParent';
import DashboardInstructor from './pages/DashboardInstructor';
import DashboardPartner from './pages/DashboardPartner';
// DashboardStaff replaced by lazy-loaded StaffDashboardPage

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

// Admin loading fallback (shared with staff)
const AdminLoadingFallback = () => (
  <div className="min-h-screen bg-[#0F1112] flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500" />
  </div>
);

const StaffLoadingFallback = AdminLoadingFallback;

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();

  // Redirect authenticated users from home to their dashboard
  useEffect(() => {
    if (isAuthenticated && user?.role && location.pathname === '/') {
      navigate(`/dashboard/${user.role}`, { replace: true });
    }
  }, [isAuthenticated, user, location.pathname, navigate]);

  return (
    <>
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
      </Route>

      {/* The Bird AI - full screen, no shared layout */}
      <Route path="/the-bird" element={<BotPage />} />

      {/* Protected Dashboard Routes */}
      <Route path="/dashboard/student" element={<ProtectedRoute allowedRoles={['student']}><DashboardStudent /></ProtectedRoute>} />
      <Route path="/dashboard/parent" element={<ProtectedRoute allowedRoles={['parent']}><DashboardParent /></ProtectedRoute>} />
      <Route path="/dashboard/instructor" element={<ProtectedRoute allowedRoles={['instructor']}><DashboardInstructor /></ProtectedRoute>} />
      <Route path="/dashboard/partner" element={<ProtectedRoute allowedRoles={['partner']}><DashboardPartner /></ProtectedRoute>} />
      <Route path="/dashboard/staff" element={<ProtectedRoute allowedRoles={['staff']}><Suspense fallback={<StaffLoadingFallback />}><StaffDashboardPage /></Suspense></ProtectedRoute>} />

      {/* Staff - Moderation & Quality */}
      <Route path="/dashboard/staff/moderation/review" element={<ProtectedRoute allowedRoles={['staff']}><Suspense fallback={<StaffLoadingFallback />}><StaffContentReviewPage /></Suspense></ProtectedRoute>} />
      <Route path="/dashboard/staff/moderation/approvals" element={<ProtectedRoute allowedRoles={['staff']}><Suspense fallback={<StaffLoadingFallback />}><StaffApprovalFeedbackPage /></Suspense></ProtectedRoute>} />
      <Route path="/dashboard/staff/moderation/cbc" element={<ProtectedRoute allowedRoles={['staff']}><Suspense fallback={<StaffLoadingFallback />}><StaffCBCStandardsPage /></Suspense></ProtectedRoute>} />
      <Route path="/dashboard/staff/moderation/safety" element={<ProtectedRoute allowedRoles={['staff']}><Suspense fallback={<StaffLoadingFallback />}><StaffSafetyPolicyPage /></Suspense></ProtectedRoute>} />

      {/* Staff - Support & Care */}
      <Route path="/dashboard/staff/support/tickets" element={<ProtectedRoute allowedRoles={['staff']}><Suspense fallback={<StaffLoadingFallback />}><StaffTicketsPage /></Suspense></ProtectedRoute>} />
      <Route path="/dashboard/staff/support/tickets/:ticketId" element={<ProtectedRoute allowedRoles={['staff']}><Suspense fallback={<StaffLoadingFallback />}><StaffTicketDetailPage /></Suspense></ProtectedRoute>} />
      <Route path="/dashboard/staff/support/live" element={<ProtectedRoute allowedRoles={['staff']}><Suspense fallback={<StaffLoadingFallback />}><StaffLiveSupportPage /></Suspense></ProtectedRoute>} />
      <Route path="/dashboard/staff/learning/sessions" element={<ProtectedRoute allowedRoles={['staff']}><Suspense fallback={<StaffLoadingFallback />}><StaffSessionsPage /></Suspense></ProtectedRoute>} />
      <Route path="/dashboard/staff/learning/sessions/:sessionId/live" element={<ProtectedRoute allowedRoles={['staff']}><Suspense fallback={<StaffLoadingFallback />}><StaffLiveClassPage /></Suspense></ProtectedRoute>} />
      <Route path="/dashboard/staff/learning/progress" element={<ProtectedRoute allowedRoles={['staff']}><Suspense fallback={<StaffLoadingFallback />}><StaffStudentProgressPage /></Suspense></ProtectedRoute>} />

      {/* Staff - Insights & Impact */}
      <Route path="/dashboard/staff/insights/health" element={<ProtectedRoute allowedRoles={['staff']}><Suspense fallback={<StaffLoadingFallback />}><StaffPlatformHealthPage /></Suspense></ProtectedRoute>} />
      <Route path="/dashboard/staff/insights/content" element={<ProtectedRoute allowedRoles={['staff']}><Suspense fallback={<StaffLoadingFallback />}><StaffContentPerformancePage /></Suspense></ProtectedRoute>} />
      <Route path="/dashboard/staff/insights/support" element={<ProtectedRoute allowedRoles={['staff']}><Suspense fallback={<StaffLoadingFallback />}><StaffSupportMetricsPage /></Suspense></ProtectedRoute>} />
      <Route path="/dashboard/staff/insights/reports" element={<ProtectedRoute allowedRoles={['staff']}><Suspense fallback={<StaffLoadingFallback />}><StaffCustomReportsPage /></Suspense></ProtectedRoute>} />

      {/* Admin Dashboard Routes (lazy-loaded) */}
      <Route path="/dashboard/admin" element={<ProtectedRoute allowedRoles={['admin']}><Suspense fallback={<AdminLoadingFallback />}><AdminDashboardPage /></Suspense></ProtectedRoute>} />
      <Route path="/dashboard/admin/pulse" element={<ProtectedRoute allowedRoles={['admin']}><Suspense fallback={<AdminLoadingFallback />}><PlatformPulsePage /></Suspense></ProtectedRoute>} />
      <Route path="/dashboard/admin/ai-providers" element={<ProtectedRoute allowedRoles={['admin']}><Suspense fallback={<AdminLoadingFallback />}><AIProvidersPage /></Suspense></ProtectedRoute>} />

      {/* Admin - People & Access */}
      <Route path="/dashboard/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><Suspense fallback={<AdminLoadingFallback />}><UsersPage /></Suspense></ProtectedRoute>} />
      <Route path="/dashboard/admin/users/:id" element={<ProtectedRoute allowedRoles={['admin']}><Suspense fallback={<AdminLoadingFallback />}><UserDetailPage /></Suspense></ProtectedRoute>} />
      <Route path="/dashboard/admin/roles-permissions" element={<ProtectedRoute allowedRoles={['admin']}><Suspense fallback={<AdminLoadingFallback />}><RolesPermissionsPage /></Suspense></ProtectedRoute>} />
      <Route path="/dashboard/admin/families" element={<ProtectedRoute allowedRoles={['admin']}><Suspense fallback={<AdminLoadingFallback />}><FamiliesPage /></Suspense></ProtectedRoute>} />
      <Route path="/dashboard/admin/restrictions" element={<ProtectedRoute allowedRoles={['admin']}><Suspense fallback={<AdminLoadingFallback />}><RestrictionsPage /></Suspense></ProtectedRoute>} />

      {/* Admin - Content & Learning */}
      <Route path="/dashboard/admin/courses" element={<ProtectedRoute allowedRoles={['admin']}><Suspense fallback={<AdminLoadingFallback />}><CoursesAdminPage /></Suspense></ProtectedRoute>} />
      <Route path="/dashboard/admin/cbc-alignment" element={<ProtectedRoute allowedRoles={['admin']}><Suspense fallback={<AdminLoadingFallback />}><CBCAlignmentPage /></Suspense></ProtectedRoute>} />
      <Route path="/dashboard/admin/assessments" element={<ProtectedRoute allowedRoles={['admin']}><Suspense fallback={<AdminLoadingFallback />}><AssessmentsAdminPage /></Suspense></ProtectedRoute>} />
      <Route path="/dashboard/admin/certificates" element={<ProtectedRoute allowedRoles={['admin']}><Suspense fallback={<AdminLoadingFallback />}><CertificatesAdminPage /></Suspense></ProtectedRoute>} />
      <Route path="/dashboard/admin/resources" element={<ProtectedRoute allowedRoles={['admin']}><Suspense fallback={<AdminLoadingFallback />}><ResourceLibraryPage /></Suspense></ProtectedRoute>} />

      {/* Admin - AI Systems */}
      <Route path="/dashboard/admin/ai-monitoring" element={<ProtectedRoute allowedRoles={['admin']}><Suspense fallback={<AdminLoadingFallback />}><AIMonitoringPage /></Suspense></ProtectedRoute>} />
      <Route path="/dashboard/admin/ai-content" element={<ProtectedRoute allowedRoles={['admin']}><Suspense fallback={<AdminLoadingFallback />}><AIContentReviewPage /></Suspense></ProtectedRoute>} />
      <Route path="/dashboard/admin/ai-personalization" element={<ProtectedRoute allowedRoles={['admin']}><Suspense fallback={<AdminLoadingFallback />}><AIPersonalizationPage /></Suspense></ProtectedRoute>} />
      <Route path="/dashboard/admin/ai-performance" element={<ProtectedRoute allowedRoles={['admin']}><Suspense fallback={<AdminLoadingFallback />}><AIPerformancePage /></Suspense></ProtectedRoute>} />

      {/* Admin - Analytics & Intelligence */}
      <Route path="/dashboard/admin/analytics/learning" element={<ProtectedRoute allowedRoles={['admin']}><Suspense fallback={<AdminLoadingFallback />}><LearningAnalyticsPage /></Suspense></ProtectedRoute>} />
      <Route path="/dashboard/admin/analytics/business" element={<ProtectedRoute allowedRoles={['admin']}><Suspense fallback={<AdminLoadingFallback />}><BusinessAnalyticsPage /></Suspense></ProtectedRoute>} />
      <Route path="/dashboard/admin/analytics/compliance" element={<ProtectedRoute allowedRoles={['admin']}><Suspense fallback={<AdminLoadingFallback />}><CompliancePage /></Suspense></ProtectedRoute>} />
      <Route path="/dashboard/admin/analytics/custom" element={<ProtectedRoute allowedRoles={['admin']}><Suspense fallback={<AdminLoadingFallback />}><CustomInsightsPage /></Suspense></ProtectedRoute>} />

      {/* Admin - Finance & Partnerships */}
      <Route path="/dashboard/admin/finance/transactions" element={<ProtectedRoute allowedRoles={['admin']}><Suspense fallback={<AdminLoadingFallback />}><MoneyFlowPage /></Suspense></ProtectedRoute>} />
      <Route path="/dashboard/admin/finance/plans" element={<ProtectedRoute allowedRoles={['admin']}><Suspense fallback={<AdminLoadingFallback />}><PlansPage /></Suspense></ProtectedRoute>} />
      <Route path="/dashboard/admin/partners" element={<ProtectedRoute allowedRoles={['admin']}><Suspense fallback={<AdminLoadingFallback />}><PartnersAdminPage /></Suspense></ProtectedRoute>} />
      <Route path="/dashboard/admin/invoices" element={<ProtectedRoute allowedRoles={['admin']}><Suspense fallback={<AdminLoadingFallback />}><InvoicesPage /></Suspense></ProtectedRoute>} />

      {/* Admin - Operations & Control */}
      <Route path="/dashboard/admin/tickets" element={<ProtectedRoute allowedRoles={['admin']}><Suspense fallback={<AdminLoadingFallback />}><TicketsPage /></Suspense></ProtectedRoute>} />
      <Route path="/dashboard/admin/tickets/:id" element={<ProtectedRoute allowedRoles={['admin']}><Suspense fallback={<AdminLoadingFallback />}><TicketDetailPage /></Suspense></ProtectedRoute>} />
      <Route path="/dashboard/admin/moderation" element={<ProtectedRoute allowedRoles={['admin']}><Suspense fallback={<AdminLoadingFallback />}><ModerationPage /></Suspense></ProtectedRoute>} />
      <Route path="/dashboard/admin/config" element={<ProtectedRoute allowedRoles={['admin']}><Suspense fallback={<AdminLoadingFallback />}><SystemConfigPage /></Suspense></ProtectedRoute>} />
      <Route path="/dashboard/admin/audit-logs" element={<ProtectedRoute allowedRoles={['admin']}><Suspense fallback={<AdminLoadingFallback />}><AuditLogsPage /></Suspense></ProtectedRoute>} />

      {/* Admin - Account */}
      <Route path="/dashboard/admin/notifications" element={<ProtectedRoute allowedRoles={['admin']}><Suspense fallback={<AdminLoadingFallback />}><AdminNotificationsPage /></Suspense></ProtectedRoute>} />
      <Route path="/dashboard/admin/profile" element={<ProtectedRoute allowedRoles={['admin']}><Suspense fallback={<AdminLoadingFallback />}><AdminProfilePage /></Suspense></ProtectedRoute>} />
      <Route path="/dashboard/admin/preferences" element={<ProtectedRoute allowedRoles={['admin']}><Suspense fallback={<AdminLoadingFallback />}><AdminPreferencesPage /></Suspense></ProtectedRoute>} />

      {/* Protected Course Routes */}
      <Route path="/my-courses" element={<ProtectedRoute><MyCoursesPage /></ProtectedRoute>} />
      <Route path="/courses/create" element={<ProtectedRoute allowedRoles={['instructor', 'admin']}><CreateCoursePage /></ProtectedRoute>} />
      <Route path="/courses/:courseId/lesson/:lessonId" element={<ProtectedRoute><LessonPlayerPage /></ProtectedRoute>} />
      <Route path="/instructor/dashboard" element={<ProtectedRoute allowedRoles={['instructor']}><InstructorDashboardPage /></ProtectedRoute>} />

      {/* Protected User Pages */}
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/quizzes" element={<ProtectedRoute><QuizzesPage /></ProtectedRoute>} />
      <Route path="/certificates" element={<ProtectedRoute><CertificatesPage /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      <Route path="/dashboard/forum" element={<ProtectedRoute><ForumPage /></ProtectedRoute>} />

      {/* Protected Payment Pages */}
      <Route path="/payments" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
      <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
      <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />

      {/* Protected Store Pages */}
      <Route path="/store/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
      <Route path="/store/orders" element={<ProtectedRoute><PlaceholderPage title="My Orders" /></ProtectedRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<PlaceholderPage title="Page Not Found" />} />
    </Routes>
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
