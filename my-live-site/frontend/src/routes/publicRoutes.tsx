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
import CategoryRedirectPage from '../pages/CategoryRedirectPage';

// Lazy-loaded public pages
const SearchResultsPage = lazy(() => import('../pages/SearchResultsPage'));

export const publicRoutes = (
  <Fragment>
    {/* Bird AI routes - standalone without header/footer */}
    <Route path="/bot" element={<BotPage />} />
    <Route path="/the-bird" element={<BotPage />} />

    {/* Regular public routes with header/footer */}
    <Route element={<PublicLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/validate-certificate" element={<CertificateValidationPage />} />
      <Route path="/become-instructor" element={<BecomeInstructorPage />} />
      <Route path="/forum" element={<PublicForumPage />} />
      <Route path="/courses" element={<CourseCatalogPage />} />
      <Route path="/courses/:id" element={<CourseDetailsPage />} />
      <Route path="/categories/:slug" element={<CategoryRedirectPage />} />
      <Route path="/search" element={<S><SearchResultsPage /></S>} />
      <Route path="/placeholder" element={<PlaceholderPage />} />
    </Route>
  </Fragment>
);
