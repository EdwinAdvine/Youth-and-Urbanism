import React, { useEffect } from 'react';
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
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardPartner from './pages/DashboardPartner';
import DashboardStaff from './pages/DashboardStaff';
import AIProvidersPage from './pages/admin/AIProvidersPage';
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
      <Route path="/dashboard/admin" element={<ProtectedRoute allowedRoles={['admin']}><DashboardAdmin /></ProtectedRoute>} />
      <Route path="/dashboard/admin/ai-providers" element={<ProtectedRoute allowedRoles={['admin']}><AIProvidersPage /></ProtectedRoute>} />
      <Route path="/dashboard/partner" element={<ProtectedRoute allowedRoles={['partner']}><DashboardPartner /></ProtectedRoute>} />
      <Route path="/dashboard/staff" element={<ProtectedRoute allowedRoles={['staff']}><DashboardStaff /></ProtectedRoute>} />

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
