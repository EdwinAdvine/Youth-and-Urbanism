// DocsSection - Reusable section component for documentation content.
// Provides consistent heading, description, and content layout.

import React from 'react';

interface DocsSectionProps {
  id?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}

const DocsSection: React.FC<DocsSectionProps> = ({ id, title, description, children }) => {
  return (
    <section id={id} className="mb-10">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 scroll-mt-20">
        {title}
      </h2>
      {description && (
        <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>
      )}
      <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
        {children}
      </div>
    </section>
  );
};

export default DocsSection;
