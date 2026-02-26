// PlaceholderPage - Generic placeholder used for routes under construction.
// Displays a "coming soon" message with a link back to the dashboard.
import React from 'react';
import { Link } from 'react-router-dom';

interface PlaceholderPageProps {
  title?: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title = 'This Page' }) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 dark:bg-[#0F1112] dark:bg-[#0F1112] px-4">
      <div className="text-center max-w-lg">
        <div className="w-20 h-20 bg-[#FF0000]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-[#FF0000]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.049.58.025 1.193-.14 1.743" />
          </svg>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">{title}</h1>
        <p className="text-lg text-gray-600 dark:text-white/70 mb-8">
          This page is under development. We're working on it!
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-[#FF0000] hover:bg-[#E40000] text-gray-900 dark:text-white px-6 py-3 rounded-xl font-semibold transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default PlaceholderPage;
