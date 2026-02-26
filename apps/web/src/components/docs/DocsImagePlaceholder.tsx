// DocsImagePlaceholder - Placeholder component for screenshots that haven't been added yet.
// Renders a styled box showing what screenshot is expected and its file path.

import React from 'react';

interface DocsImagePlaceholderProps {
  description: string;
  path: string;
  aspectRatio?: 'video' | 'square' | 'wide';
}

const aspectClasses = {
  video: 'aspect-video',
  square: 'aspect-square',
  wide: 'aspect-[21/9]',
};

const DocsImagePlaceholder: React.FC<DocsImagePlaceholderProps> = ({
  description,
  path,
  aspectRatio = 'video',
}) => {
  return (
    <div
      className={`${aspectClasses[aspectRatio]} w-full rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 flex flex-col items-center justify-center p-6 my-4`}
    >
      <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center font-medium">{description}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-mono">{path}</p>
    </div>
  );
};

export default DocsImagePlaceholder;
