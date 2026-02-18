// DocsBreadcrumb - Breadcrumb navigation for documentation pages.
// Shows the current location within the docs hierarchy.

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const pathLabels: Record<string, string> = {
  'docs': 'Documentation',
  'getting-started': 'Getting Started',
  'changelog': 'Changelog',
  // Grouping segments
  'uhs': 'Urban Home School',
  'bird': 'Urban Bird AI',
  // UHS guide pages
  'student': 'Student Guide',
  'parent': 'Parent Guide',
  'instructor': 'Instructor Guide',
  'partner': 'Partner Guide',
  'courses': 'Courses',
  'assessments': 'Assessments',
  'payments': 'Payments',
  'forum': 'Forum',
  'store': 'Store',
  'certificates': 'Certificates',
  // Bird guide pages
  'ai-tutor': 'AI Tutor',
  'co-pilot': 'CoPilot',
  'voice-mode': 'Voice Mode',
  'learning-paths': 'Learning Paths',
  // API section
  'api': 'API Reference',
  'auth': 'Authentication',
  'more': 'More APIs',
  'faq': 'FAQ',
};

const DocsBreadcrumb: React.FC = () => {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  if (segments.length <= 1) return null;

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
      {segments.map((segment, index) => {
        const path = '/' + segments.slice(0, index + 1).join('/');
        const isLast = index === segments.length - 1;
        const label = pathLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

        return (
          <React.Fragment key={path}>
            {index > 0 && (
              <svg className="h-4 w-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            {isLast ? (
              <span className="text-gray-900 dark:text-white font-medium">{label}</span>
            ) : (
              <Link to={path} className="hover:text-gray-900 dark:hover:text-white transition-colors">
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default DocsBreadcrumb;
