// DocsHomePage - Landing page for the documentation section at /docs.
// Shows two product cards (UHS v1 and Urban Bird v1) with quick navigation links.

import React from 'react';
import { Link } from 'react-router-dom';

const DocsHomePage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Documentation
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Welcome to the official documentation for Urban Home School and The Urban Bird AI.
        Find guides, API references, and everything you need to get the most from the platform.
      </p>

      {/* Product Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {/* UHS v1 Card */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-red-300 dark:hover:border-red-700 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-9 bg-[#FF0000] rounded-lg flex items-center justify-center text-sm font-bold text-white">UHS</div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Urban Home School v1</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">The Educational Platform</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Full-stack educational platform for Kenyan children with CBC-aligned courses,
            multi-role dashboards, payments, community features, and more.
          </p>
          <div className="space-y-2">
            <Link to="/docs/getting-started" className="block text-sm text-red-600 dark:text-red-400 hover:underline">Getting Started</Link>
            <Link to="/docs/student-guide" className="block text-sm text-red-600 dark:text-red-400 hover:underline">Student Guide</Link>
            <Link to="/docs/parent-guide" className="block text-sm text-red-600 dark:text-red-400 hover:underline">Parent Guide</Link>
            <Link to="/docs/instructor-guide" className="block text-sm text-red-600 dark:text-red-400 hover:underline">Instructor Guide</Link>
            <Link to="/docs/courses" className="block text-sm text-red-600 dark:text-red-400 hover:underline">Courses & Learning</Link>
            <Link to="/docs/payments" className="block text-sm text-red-600 dark:text-red-400 hover:underline">Payments</Link>
          </div>
        </div>

        {/* Urban Bird v1 Card */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-sm font-bold text-white">AI</div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Urban Bird v1</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">The AI Tutoring System</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            AI-powered tutoring system with multi-AI orchestration, voice responses,
            personalized learning paths, and an intelligent CoPilot assistant.
          </p>
          <div className="space-y-2">
            <Link to="/docs/ai-tutor" className="block text-sm text-blue-600 dark:text-blue-400 hover:underline">AI Tutor Guide</Link>
            <Link to="/docs/copilot" className="block text-sm text-blue-600 dark:text-blue-400 hover:underline">CoPilot Guide</Link>
            <Link to="/docs/voice-mode" className="block text-sm text-blue-600 dark:text-blue-400 hover:underline">Voice Mode</Link>
            <Link to="/docs/learning-paths" className="block text-sm text-blue-600 dark:text-blue-400 hover:underline">Learning Paths</Link>
          </div>
        </div>
      </div>

      {/* Quick Links Grid */}
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Links</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'API Reference', path: '/docs/api', description: 'REST API documentation with examples', icon: '{ }' },
          { label: 'Assessments', path: '/docs/assessments', description: 'Quizzes, assignments, projects, exams', icon: 'Q' },
          { label: 'Forum', path: '/docs/forum', description: 'Community discussions and Q&A', icon: 'F' },
          { label: 'Store', path: '/docs/store', description: 'E-commerce and product catalog', icon: 'S' },
          { label: 'Certificates', path: '/docs/certificates', description: 'Earning and validating certificates', icon: 'C' },
          { label: 'FAQ', path: '/docs/faq', description: 'Frequently asked questions', icon: '?' },
        ].map(item => (
          <Link
            key={item.path}
            to={item.path}
            className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div className="w-8 h-8 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm font-mono font-bold text-gray-500 dark:text-gray-400 flex-shrink-0">
              {item.icon}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{item.label}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Version Info */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8">
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs font-medium">
            UHS v1.0
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-medium">
            Urban Bird v1.0
          </span>
          <span>February 2026</span>
        </div>
      </div>
    </div>
  );
};

export default DocsHomePage;
