import React from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, description }) => {
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>
        {description && <p className="text-gray-600 dark:text-white/70">{description}</p>}
      </div>

      <div className={`p-12 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center`}>
        <p className="text-gray-500 dark:text-white/60">This page is under construction</p>
        <p className="text-gray-400 dark:text-white/40 text-sm mt-2">Coming soon...</p>
      </div>
    </div>
  );
};

export default PlaceholderPage;
