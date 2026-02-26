// DocsApiEndpoint - Reusable component for displaying API endpoint documentation.
// Shows method badge, path, description, auth requirements, and request/response examples.

import React, { useState } from 'react';
import DocsCodeBlock from './DocsCodeBlock';

interface DocsApiEndpointProps {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  auth?: boolean;
  requestBody?: string;
  responseBody?: string;
  curlExample?: string;
}

const methodColors: Record<string, string> = {
  GET: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  POST: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  PUT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  DELETE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  PATCH: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
};

const DocsApiEndpoint: React.FC<DocsApiEndpointProps> = ({
  method,
  path,
  description,
  auth = true,
  requestBody,
  responseBody,
  curlExample,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg mb-4 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
      >
        <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${methodColors[method]}`}>
          {method}
        </span>
        <code className="text-sm font-mono text-gray-900 dark:text-white flex-1">{path}</code>
        {auth && (
          <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
            Auth
          </span>
        )}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
          <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>

          {requestBody && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Request Body</h4>
              <DocsCodeBlock code={requestBody} language="json" />
            </div>
          )}

          {responseBody && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Response</h4>
              <DocsCodeBlock code={responseBody} language="json" />
            </div>
          )}

          {curlExample && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Example</h4>
              <DocsCodeBlock code={curlExample} language="bash" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocsApiEndpoint;
