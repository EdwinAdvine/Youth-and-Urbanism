/**
 * Shared authenticated routes - accessible to all logged-in users
 * These routes auto-detect the user's role for layout rendering
 */

import { lazy } from 'react';
import { Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import { S } from './routeHelpers';

// Non-admin shared pages
const CoursesPage = lazy(() => import('../pages/CoursesPage'));
const MyCoursesPage = lazy(() => import('../pages/MyCoursesPage'));
const CreateCoursePage = lazy(() => import('../pages/CreateCoursePage'));
const LessonPlayerPage = lazy(() => import('../pages/LessonPlayerPage'));
const AssignmentsPage = lazy(() => import('../pages/AssignmentsPage'));
const QuizzesPage = lazy(() => import('../pages/QuizzesPage'));
const CertificatesPage = lazy(() => import('../pages/CertificatesPage'));
const ForumPage = lazy(() => import('../pages/ForumPage'));
const PaymentPage = lazy(() => import('../pages/PaymentPage'));
const TransactionsPage = lazy(() => import('../pages/TransactionsPage'));
const WalletPage = lazy(() => import('../pages/WalletPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const NotificationsPage = lazy(() => import('../pages/NotificationsPage'));

// Store / E-Commerce pages
const StorePage = lazy(() => import('../pages/StorePage'));
const ProductDetailPage = lazy(() => import('../pages/ProductDetailPage'));
const CheckoutPage = lazy(() => import('../pages/CheckoutPage'));
const InstructorPublicProfilePage = lazy(() => import('../pages/InstructorPublicProfilePage'));

export const sharedAuthRoutes = (
  <>
    {/* Non-dashboard authenticated routes - individual protected routes */}
    <Route path="/courses-available" element={<ProtectedRoute><S><CoursesPage /></S></ProtectedRoute>} />
    <Route path="/my-courses" element={<ProtectedRoute><S><MyCoursesPage /></S></ProtectedRoute>} />
    <Route path="/create-course" element={<ProtectedRoute><S><CreateCoursePage /></S></ProtectedRoute>} />
    <Route path="/lesson/:lessonId" element={<ProtectedRoute><S><LessonPlayerPage /></S></ProtectedRoute>} />
    <Route path="/assignments" element={<ProtectedRoute><S><AssignmentsPage /></S></ProtectedRoute>} />
    <Route path="/quizzes" element={<ProtectedRoute><S><QuizzesPage /></S></ProtectedRoute>} />
    <Route path="/certificates" element={<ProtectedRoute><S><CertificatesPage /></S></ProtectedRoute>} />
    <Route path="/forum-authenticated" element={<ProtectedRoute><S><ForumPage /></S></ProtectedRoute>} />
    <Route path="/payment" element={<ProtectedRoute><S><PaymentPage /></S></ProtectedRoute>} />
    <Route path="/transactions" element={<ProtectedRoute><S><TransactionsPage /></S></ProtectedRoute>} />
    <Route path="/wallet" element={<ProtectedRoute><S><WalletPage /></S></ProtectedRoute>} />
    <Route path="/profile" element={<ProtectedRoute><S><ProfilePage /></S></ProtectedRoute>} />
    <Route path="/settings" element={<ProtectedRoute><S><SettingsPage /></S></ProtectedRoute>} />
    <Route path="/notifications" element={<ProtectedRoute><S><NotificationsPage /></S></ProtectedRoute>} />

    {/* Store / E-Commerce */}
    <Route path="/store" element={<ProtectedRoute><S><StorePage /></S></ProtectedRoute>} />
    <Route path="/store/products/:slug" element={<ProtectedRoute><S><ProductDetailPage /></S></ProtectedRoute>} />
    <Route path="/store/checkout" element={<ProtectedRoute><S><CheckoutPage /></S></ProtectedRoute>} />

    {/* Public instructor profile (no auth required) */}
    <Route path="/instructor/:instructorId" element={<S><InstructorPublicProfilePage /></S>} />
  </>
);
