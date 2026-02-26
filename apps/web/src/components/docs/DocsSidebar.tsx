// DocsSidebar - Collapsible sidebar navigation for the documentation pages.
// Shows two product sections (UHS v1, Urban Bird v1), API reference, and utility pages.
// Supports search filtering and highlights the active page.

import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import DocsSearch from './DocsSearch';

interface NavItem {
  label: string;
  path: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Getting Started',
    items: [
      { label: 'Overview', path: '/docs' },
      { label: 'Getting Started', path: '/docs/getting-started' },
      { label: 'Changelog', path: '/docs/changelog' },
    ],
  },
  {
    title: 'Urban Home School v1',
    items: [
      { label: 'Student Guide', path: '/docs/uhs/student' },
      { label: 'Parent Guide', path: '/docs/uhs/parent' },
      { label: 'Instructor Guide', path: '/docs/uhs/instructor' },
      { label: 'Partner Guide', path: '/docs/uhs/partner' },
      { label: 'Courses', path: '/docs/uhs/courses' },
      { label: 'Assessments', path: '/docs/uhs/assessments' },
      { label: 'Payments', path: '/docs/uhs/payments' },
      { label: 'Forum', path: '/docs/uhs/forum' },
      { label: 'Store', path: '/docs/uhs/store' },
      { label: 'Certificates', path: '/docs/uhs/certificates' },
    ],
  },
  {
    title: 'Urban Bird v1',
    items: [
      { label: 'AI Tutor', path: '/docs/bird/ai-tutor' },
      { label: 'CoPilot', path: '/docs/bird/co-pilot' },
      { label: 'Voice Mode', path: '/docs/bird/voice-mode' },
      { label: 'Learning Paths', path: '/docs/bird/learning-paths' },
    ],
  },
  {
    title: 'API Reference',
    items: [
      { label: 'API Overview', path: '/docs/api' },
      { label: 'Authentication API', path: '/docs/api/auth' },
      { label: 'Courses API', path: '/docs/api/courses' },
      { label: 'AI Tutor API', path: '/docs/api/ai-tutor' },
      { label: 'Payments API', path: '/docs/api/payments' },
      { label: 'More APIs', path: '/docs/api/more' },
    ],
  },
  {
    title: 'Help',
    items: [
      { label: 'FAQ', path: '/docs/faq' },
    ],
  },
];

interface DocsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const DocsSidebar: React.FC<DocsSidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return navSections;

    const query = searchQuery.toLowerCase();
    return navSections
      .map(section => ({
        ...section,
        items: section.items.filter(
          item => item.label.toLowerCase().includes(query)
        ),
      }))
      .filter(section => section.items.length > 0);
  }, [searchQuery]);

  const toggleSection = (title: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  };

  const isActive = (path: string) => {
    if (path === '/docs') return location.pathname === '/docs';
    return location.pathname === path;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <Link to="/docs" className="flex items-center gap-2 mb-4" onClick={onClose}>
          <div className="w-8 h-7 bg-[#FF0000] rounded-lg flex items-center justify-center text-xs font-bold text-white">UHS</div>
          <span className="font-semibold text-gray-900 dark:text-white text-sm">Documentation</span>
        </Link>
        <DocsSearch onSearch={setSearchQuery} />
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredSections.map(section => (
          <div key={section.title}>
            <button
              onClick={() => toggleSection(section.title)}
              className="w-full flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {section.title}
              <svg
                className={`w-3 h-3 transition-transform ${collapsedSections.has(section.title) ? '-rotate-90' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {!collapsedSections.has(section.title) && (
              <ul className="space-y-0.5">
                {section.items.map(item => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={onClose}
                      className={`block px-3 py-1.5 rounded-md text-sm transition-colors ${
                        isActive(item.path)
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-medium'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          UHS v1 / Urban Bird v1
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0F1112] h-full overflow-hidden">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
          <aside className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#0F1112] z-50 lg:hidden shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <span className="font-semibold text-gray-900 dark:text-white">Navigation</span>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
};

export default DocsSidebar;
