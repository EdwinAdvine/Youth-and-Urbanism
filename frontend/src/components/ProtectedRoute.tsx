import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  const [hydrated, setHydrated] = useState(useAuthStore.persist.hasHydrated());

  useEffect(() => {
    // Zustand persist hydrates asynchronously from localStorage.
    // Wait for hydration before making redirect decisions to avoid
    // prematurely bouncing authenticated users back to the home page.
    if (hydrated) return;

    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    // In case hydration completed between the initial useState and this effect
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
    }

    return unsub;
  }, [hydrated]);

  // While Zustand is still hydrating, render nothing instead of redirecting
  if (!hydrated) {
    return null;
  }

  // If not authenticated, redirect to home with return URL
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If roles are specified and user role is not allowed, redirect to correct dashboard
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    const correctDashboard = `/dashboard/${user.role}`;
    // Avoid infinite redirect loop: if already on correct dashboard, render children
    if (location.pathname.startsWith(correctDashboard)) {
      return <>{children}</>;
    }
    return <Navigate to={correctDashboard} replace />;
  }

  // Render the protected component
  return <>{children}</>;
};

export default ProtectedRoute;
