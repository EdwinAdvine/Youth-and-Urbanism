import React from 'react';

interface AdminLoadingSkeletonProps {
  variant?: 'card' | 'table' | 'chart' | 'text' | 'stats-row';
  count?: number;
  className?: string;
}

const Shimmer: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className = '', style }) => (
  <div className={`animate-pulse bg-gray-100 dark:bg-[#22272B] rounded ${className}`} style={style} />
);

const AdminLoadingSkeleton: React.FC<AdminLoadingSkeletonProps> = ({
  variant = 'card',
  count = 1,
  className = '',
}) => {
  const items = Array.from({ length: count }, (_, i) => i);

  if (variant === 'stats-row') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {items.map((i) => (
          <div key={i} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Shimmer className="h-4 w-24" />
              <Shimmer className="h-8 w-8 rounded-lg" />
            </div>
            <Shimmer className="h-8 w-20" />
            <Shimmer className="h-3 w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden ${className}`}>
        {/* Table header */}
        <div className="flex items-center gap-4 px-5 py-3 border-b border-gray-200 dark:border-[#22272B]">
          {[80, 120, 100, 140, 80].map((w, i) => (
            <Shimmer key={i} className="h-4" style={{ width: w }} />
          ))}
        </div>
        {/* Table rows */}
        {items.map((i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-200 dark:border-[#22272B] last:border-0">
            {[80, 120, 100, 140, 80].map((w, j) => (
              <Shimmer key={j} className="h-4" style={{ width: w }} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <div className={`bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5 space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <Shimmer className="h-5 w-32" />
          <Shimmer className="h-8 w-24 rounded-lg" />
        </div>
        <Shimmer className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`space-y-2 ${className}`}>
        {items.map((i) => (
          <Shimmer key={i} className="h-4" style={{ width: `${70 + Math.random() * 30}%` }} />
        ))}
      </div>
    );
  }

  // Default: card
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {items.map((i) => (
        <div key={i} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <Shimmer className="h-5 w-28" />
            <Shimmer className="h-6 w-16 rounded-full" />
          </div>
          <div className="space-y-2">
            <Shimmer className="h-4 w-full" />
            <Shimmer className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminLoadingSkeleton;
