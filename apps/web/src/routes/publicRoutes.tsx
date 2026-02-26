/**
 * Public routes - accessible without authentication
 */

import { lazy, Fragment } from 'react';
import { Route } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import { S } from './routeHelpers';

// Eager-loaded public pages (first-paint critical)
import HomePage from '../pages/HomePage';
import PlaceholderPage from '../pages/PlaceholderPage';
import PricingPage from '../pages/PricingPage';
import BotPage from '../pages/BotPage';
import HowItWorksPage from '../pages/HowItWorksPage';
import AboutPage from '../pages/AboutPage';
import ContactPage from '../pages/ContactPage';
import CertificateValidationPage from '../pages/CertificateValidationPage';
import BecomeInstructorPage from '../pages/BecomeInstructorPage';
import PublicForumPage from '../pages/PublicForumPage';
import CourseCatalogPage from '../pages/CourseCatalogPage';
import CourseDetailsPage from '../pages/CourseDetailsPage';
import CategoryPage from '../pages/CategoryPage';

// Lazy-loaded public pages
const SearchResultsPage = lazy(() => import('../pages/SearchResultsPage'));
const StorePage = lazy(() => import('../pages/StorePage'));
const ProductDetailPage = lazy(() => import('../pages/ProductDetailPage'));
const InstructorSetupPage = lazy(() => import('../pages/InstructorSetupPage'));
const StaffSetupPage = lazy(() => import('../pages/StaffSetupPage'));
const PartnerSetupPage = lazy(() => import('../pages/PartnerSetupPage'));
const ChildFirstLoginPage = lazy(() => import('../pages/ChildFirstLoginPage'));
const BecomePartnerPage = lazy(() => import('../pages/BecomePartnerPage'));
const ScholarshipPage = lazy(() => import('../pages/ScholarshipPage'));

export const publicRoutes = (
  <Fragment>
    {/* Bird AI routes - standalone without header/footer */}
    <Route path="/bot" element={<BotPage />} />
    <Route path="/the-bird" element={<BotPage />} />

    {/* Account setup pages (standalone - no header/footer, uses invite token) */}
    <Route path="/instructor-setup" element={<S><InstructorSetupPage /></S>} />
    <Route path="/staff-setup" element={<S><StaffSetupPage /></S>} />
    <Route path="/partner-setup" element={<S><PartnerSetupPage /></S>} />
    <Route path="/child-setup" element={<S><ChildFirstLoginPage /></S>} />

    {/* Regular public routes with header/footer */}
    <Route element={<PublicLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/validate-certificate" element={<CertificateValidationPage />} />
      <Route path="/become-instructor" element={<BecomeInstructorPage />} />
      <Route path="/become-partner" element={<S><BecomePartnerPage /></S>} />
      <Route path="/forum" element={<PublicForumPage />} />
      <Route path="/courses" element={<CourseCatalogPage />} />
      <Route path="/courses/:id" element={<CourseDetailsPage />} />
      <Route path="/categories/:slug" element={<CategoryPage />} />
      <Route path="/search" element={<S><SearchResultsPage /></S>} />
      <Route path="/placeholder" element={<PlaceholderPage />} />
      <Route path="/store" element={<S><StorePage /></S>} />
      <Route path="/store/products/:slug" element={<S><ProductDetailPage /></S>} />
      <Route path="/scholarships" element={<S><ScholarshipPage /></S>} />
    </Route>
  </Fragment>
);
