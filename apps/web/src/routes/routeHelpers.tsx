import React, { Suspense } from 'react';

// Loading fallback (renders inside DashboardLayout content area)
const DashboardLoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500" />
  </div>
);

// Shorthand for Suspense-wrapped lazy routes
export const S = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<DashboardLoadingFallback />}>{children}</Suspense>
);
