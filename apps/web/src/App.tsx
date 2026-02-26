import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import GlobalErrorBoundary from './components/error/GlobalErrorBoundary';
import ScrollToTopOnNavigate from './components/layout/ScrollToTopOnNavigate';
import './App.css';

// Import route modules
import { publicRoutes } from './routes/publicRoutes';
import { docsRoutes } from './routes/docsRoutes';
import { sharedAuthRoutes } from './routes/sharedAuthRoutes';
import { studentRoutes } from './routes';
import { parentRoutes } from './routes';
import { instructorRoutes } from './routes';
import { partnerRoutes } from './routes';
import { staffRoutes } from './routes';
import { adminRoutes } from './routes';

/**
 * Main Application Component
 *
 * Architecture:
 * - Public routes: Accessible without authentication (HomePage, Pricing, About, etc.)
 * - Docs routes: Documentation at /docs/*
 * - Shared auth routes: Common authenticated routes that auto-detect user role
 * - Role-specific dashboard routes: Student, Parent, Instructor, Admin, Partner, Staff
 *
 * Each role's routes are modularized in src/routes/ for better maintainability.
 */
const App: React.FC = () => {
  const { checkAuth } = useAuthStore();

  // Auto-refresh authentication state on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <GlobalErrorBoundary>
      <Router>
        <ScrollToTopOnNavigate />
        <Routes>
          {/* Public Routes */}
          {publicRoutes}

          {/* Documentation Routes */}
          {docsRoutes}

          {/* Shared Authenticated Routes (auto-detect role) */}
          {sharedAuthRoutes}

          {/* Role-Specific Dashboard Routes */}
          {studentRoutes}
          {parentRoutes}
          {instructorRoutes}
          {partnerRoutes}
          {staffRoutes}
          {adminRoutes}
        </Routes>
      </Router>
    </GlobalErrorBoundary>
  );
};

export default App;
