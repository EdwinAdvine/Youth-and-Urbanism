# Route Integration Guide

This guide explains how to integrate the modularized route files into your App.tsx.

## Step-by-Step Integration

### Step 1: Import Route Definitions

Add these imports at the top of your `App.tsx`:

```typescript
import {
  studentRoutes,
  parentRoutes,
  instructorRoutes,
  partnerRoutes,
  staffRoutes,
  adminRoutes
} from './routes';
```

### Step 2: Replace Inline Routes

In your `Routes` component, replace the inline route definitions with the imported routes:

**Before** (Old App.tsx with inline routes):
```typescript
<Routes>
  {/* Public routes */}
  <Route element={<PublicLayout />}>
    {/* ... */}
  </Route>

  {/* Student Dashboard - ~90 inline routes */}
  <Route path="/dashboard/student" element={<ProtectedRoute allowedRoles={['student']}><DashboardLayout role="student" /></ProtectedRoute>}>
    <Route index element={<S><StudentDashboardHome /></S>} />
    <Route path="today/ai-plan" element={<S><AIPlanPage /></S>} />
    {/* ... 88 more routes ... */}
  </Route>

  {/* Parent Dashboard - ~41 inline routes */}
  <Route path="/dashboard/parent" element={<ProtectedRoute allowedRoles={['parent']}><DashboardLayout role="parent" /></ProtectedRoute>}>
    {/* ... */}
  </Route>

  {/* ... more inline routes for other roles ... */}
</Routes>
```

**After** (New App.tsx with modular routes):
```typescript
<Routes>
  {/* Public routes */}
  <Route element={<PublicLayout />}>
    {/* ... */}
  </Route>

  {/* Role-based dashboard routes */}
  {studentRoutes}
  {parentRoutes}
  {instructorRoutes}
  {partnerRoutes}
  {staffRoutes}
  {adminRoutes}

  {/* Other authenticated routes */}
  <Route element={<ProtectedRoute><DashboardLayoutAutoRole /></ProtectedRoute>}>
    {/* ... */}
  </Route>
</Routes>
```

### Step 3: Remove Unused Imports

After integration, remove these imports from App.tsx (they're now in route files):

```typescript
// ❌ REMOVE these - now in studentRoutes.tsx
const StudentDashboardHome = lazy(() => import('./pages/student/StudentDashboardHome'));
const AIPlanPage = lazy(() => import('./pages/student/AIPlanPage'));
// ... all other student route imports ...

// ❌ REMOVE these - now in parentRoutes.tsx
const ParentDashboardHome = lazy(() => import('./pages/parent/ParentDashboardHome'));
// ... all other parent route imports ...

// ❌ REMOVE these - now in instructorRoutes.tsx
const AIInsightsPage = lazy(() => import('./pages/instructor/AIInsightsPage').then(m => ({ default: m.AIInsightsPage })));
// ... all other instructor route imports ...

// Continue for partner, staff, and admin route imports...
```

**Keep these imports** (still used in App.tsx):
```typescript
// ✅ KEEP these - used in App.tsx directly
import HomePage from './pages/HomePage';
import PlaceholderPage from './pages/PlaceholderPage';
import PricingPage from './pages/PricingPage';
import BotPage from './pages/BotPage';
// ... other public pages ...
import DashboardInstructor from './pages/DashboardInstructor';
// ... other non-modularized imports ...
```

## Complete Example

Here's a complete example of the updated App.tsx Routes section:

```typescript
import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import GlobalErrorBoundary from './components/error/GlobalErrorBoundary';
import ScrollToTopOnNavigate from './components/layout/ScrollToTopOnNavigate';
import './App.css';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';

// Public Pages (non-lazy)
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

// Course Pages
import CourseCatalogPage from './pages/CourseCatalogPage';
import CourseDetailsPage from './pages/CourseDetailsPage';
const SearchResultsPage = lazy(() => import('./pages/SearchResultsPage'));

// Documentation Pages (lazy-loaded)
const DocsLayout = lazy(() => import('./pages/docs/DocsLayout'));
const DocsHomePage = lazy(() => import('./pages/docs/DocsHomePage'));
// ... other doc imports ...

// Protected Pages
import ProtectedRoute from './components/ProtectedRoute';
import DashboardInstructor from './pages/DashboardInstructor';

// Other shared pages
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
// ... other shared imports ...

// Store / E-Commerce Pages
import StorePage from './pages/StorePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import CartDrawer from './components/store/CartDrawer';

// Import modularized routes
import {
  studentRoutes,
  parentRoutes,
  instructorRoutes,
  partnerRoutes,
  staffRoutes,
  adminRoutes
} from './routes';

// Auto-detect role layout wrapper
const DashboardLayoutAutoRole = () => {
  const { user } = useAuthStore();
  const role = (user?.role || 'student') as 'student' | 'parent' | 'instructor' | 'admin' | 'partner' | 'staff';
  return <DashboardLayout role={role} />;
};

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const wasAuthenticated = React.useRef(isAuthenticated);

  // Redirect authenticated users from public pages to their dashboard
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      const onPublicPage = !location.pathname.startsWith('/dashboard/');
      const justLoggedIn = !wasAuthenticated.current;

      if (onPublicPage && (justLoggedIn || location.pathname === '/')) {
        navigate(`/dashboard/${user.role}`, { replace: true });
      }
    }
    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated, user, location.pathname, navigate]);

  return (
    <>
      <ScrollToTopOnNavigate />
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

          {/* Documentation Pages */}
          <Route path="/docs" element={<Suspense fallback={<div>Loading...</div>}><DocsLayout /></Suspense>}>
            {/* ... doc routes ... */}
          </Route>
        </Route>

        {/* The Bird AI - full screen, no shared layout */}
        <Route path="/the-bird" element={<BotPage />} />

        {/* Public Instructor Profile */}
        <Route path="/instructor/:slug" element={<Suspense fallback={<div>Loading...</div>}><InstructorPublicProfilePage /></Suspense>} />

        {/* ============================================================ */}
        {/* ROLE-BASED DASHBOARD ROUTES (Modularized) */}
        {/* ============================================================ */}
        {studentRoutes}
        {parentRoutes}
        {instructorRoutes}
        {partnerRoutes}
        {staffRoutes}
        {adminRoutes}

        {/* ============================================================ */}
        {/* NON-DASHBOARD AUTHENTICATED ROUTES - Auto-detect role layout */}
        {/* ============================================================ */}
        <Route element={<ProtectedRoute><DashboardLayoutAutoRole /></ProtectedRoute>}>
          <Route path="/search" element={<Suspense fallback={<div>Loading...</div>}><SearchResultsPage /></Suspense>} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          {/* ... other shared routes ... */}
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<PlaceholderPage title="Page Not Found" />} />
      </Routes>
    </>
  );
};

const App: React.FC = () => {
  return (
    <GlobalErrorBoundary>
      <Router>
        <AppContent />
      </Router>
    </GlobalErrorBoundary>
  );
};

export default App;
```

## Benefits of This Approach

### 1. Reduced App.tsx Size
- **Before**: ~848 lines
- **After**: ~400 lines (approximate)
- **Reduction**: ~50% smaller

### 2. Better Organization
- Role routes in dedicated files
- Easy to find and update specific routes
- Clear separation of concerns

### 3. Improved Maintainability
- Changes to student routes only touch `studentRoutes.tsx`
- No need to scroll through 800+ lines to find a route
- Reduced risk of merge conflicts

### 4. Team Collaboration
- Multiple developers can work on different role routes simultaneously
- Clear ownership: student team → `studentRoutes.tsx`, etc.
- Easier code reviews (smaller, focused files)

### 5. Performance
- Lazy loading preserved
- Code splitting maintained
- No performance regression

## Testing After Integration

### 1. Visual Testing
Test each role's dashboard manually:
- [ ] Login as student → verify all student routes work
- [ ] Login as parent → verify all parent routes work
- [ ] Login as instructor → verify all instructor routes work
- [ ] Login as partner → verify all partner routes work
- [ ] Login as staff → verify all staff routes work
- [ ] Login as admin → verify all admin routes work

### 2. Route Testing
Verify specific route types:
- [ ] Index routes (e.g., `/dashboard/student`)
- [ ] Static routes (e.g., `/dashboard/student/profile`)
- [ ] Dynamic routes (e.g., `/dashboard/student/browse/course/:id`)
- [ ] Nested routes (e.g., `/dashboard/student/ai-tutor/chat`)

### 3. Lazy Loading Testing
- [ ] Open browser DevTools → Network tab
- [ ] Navigate to different routes
- [ ] Verify lazy-loaded chunks are loaded on demand
- [ ] Check for loading spinner during transitions

### 4. Access Control Testing
- [ ] Try accessing routes from wrong role (should redirect)
- [ ] Verify `ProtectedRoute` still works
- [ ] Test unauthenticated access (should redirect to login)

## Troubleshooting

### Issue: Routes not found (404)
**Solution**: Verify import statement is correct:
```typescript
import {
  studentRoutes,
  // ... other routes
} from './routes'; // Make sure path is correct
```

### Issue: Lazy loading not working
**Solution**: Check that `S` wrapper is used in route files:
```typescript
// ✅ Correct
<Route path="profile" element={<S><StudentProfilePage /></S>} />

// ❌ Wrong (no Suspense)
<Route path="profile" element={<StudentProfilePage />} />
```

### Issue: Role-based access not working
**Solution**: Verify `ProtectedRoute` and `DashboardLayout` are correctly applied:
```typescript
<Route path="/dashboard/student" element={
  <ProtectedRoute allowedRoles={['student']}>
    <DashboardLayout role="student" />
  </ProtectedRoute>
}>
```

### Issue: Import errors
**Solution**: Make sure all route files export their routes:
```typescript
// In studentRoutes.tsx
export const studentRoutes = (
  <Route path="/dashboard/student" element={...}>
    {/* routes */}
  </Route>
);
```

## Rollback Plan

If you need to rollback:

1. Keep a backup of the original App.tsx
2. Simply revert the imports and route replacements
3. The route files don't affect the application if not imported

## Next Steps

After successful integration:

1. **Delete old code**: Remove commented-out inline routes from App.tsx
2. **Update documentation**: Document the new route structure for your team
3. **Setup guidelines**: Create contribution guidelines for adding new routes
4. **Consider CI/CD**: Add route testing to your CI pipeline

---

**Last Updated**: February 18, 2025  
**Integration Time**: ~15-30 minutes  
**Testing Time**: ~30-60 minutes
