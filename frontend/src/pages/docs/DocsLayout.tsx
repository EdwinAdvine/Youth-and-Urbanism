// DocsLayout - Main layout wrapper for the documentation pages.
// Provides a sidebar navigation on the left and a content area on the right.
// Includes mobile hamburger menu toggle and breadcrumb navigation.
// Nested under PublicLayout so the site header and footer are visible.

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import DocsSidebar from '../../components/docs/DocsSidebar';
import DocsBreadcrumb from '../../components/docs/DocsBreadcrumb';

const DocsLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-[calc(100vh-200px)] flex bg-white dark:bg-[#0F1112]">
      <DocsSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 min-w-0">
        {/* Mobile header with hamburger */}
        <div className="lg:hidden flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-medium text-gray-900 dark:text-white">Documentation</span>
        </div>

        {/* Content area */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DocsBreadcrumb />
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DocsLayout;
