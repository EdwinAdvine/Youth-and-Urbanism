import React from 'react';

type SkeletonVariant = 'card' | 'table' | 'stats' | 'list' | 'detail';

interface StaffLoadingSkeletonProps {
  variant: SkeletonVariant;
  count?: number;
  className?: string;
}

const Shimmer: React.FC<{ className?: string; style?: React.CSSProperties }> = ({
  className = '',
  style,
}) => <div className={`animate-pulse bg-[#22272B] rounded ${className}`} style={style} />;

const StaffLoadingSkeleton: React.FC<StaffLoadingSkeletonProps> = ({
  variant,
  count = 1,
  className = '',
}) => {
  const items = Array.from({ length: count }, (_, i) => i);

  // Stats: Row of 4 stat boxes
  if (variant === 'stats') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="bg-[#181C1F] border border-[#22272B] rounded-xl p-5 space-y-3"
          >
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

  // Table: Header row + N body rows
  if (variant === 'table') {
    return (
      <div
        className={`bg-[#181C1F] border border-[#22272B] rounded-xl overflow-hidden ${className}`}
      >
        {/* Table header */}
        <div className="flex items-center gap-4 px-5 py-3 bg-[#22272B]">
          {[80, 120, 100, 140, 80].map((w, i) => (
            <Shimmer key={i} className="h-4" style={{ width: w }} />
          ))}
        </div>
        {/* Table rows */}
        {items.map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-5 py-4 border-b border-[#22272B] last:border-0"
          >
            {[80, 120, 100, 140, 80].map((w, j) => (
              <Shimmer key={j} className="h-4" style={{ width: w }} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  // List: N list items with avatar + 2 lines
  if (variant === 'list') {
    return (
      <div className={`space-y-3 ${className}`}>
        {items.map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 bg-[#181C1F] border border-[#22272B] rounded-xl p-4"
          >
            <Shimmer className="h-10 w-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Shimmer className="h-4 w-3/5" />
              <Shimmer className="h-3 w-2/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Detail: Large header + content block
  if (variant === 'detail') {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Header area */}
        <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-4">
            <Shimmer className="h-16 w-16 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Shimmer className="h-6 w-48" />
              <Shimmer className="h-4 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-[#22272B]">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="space-y-2">
                <Shimmer className="h-3 w-16" />
                <Shimmer className="h-5 w-24" />
              </div>
            ))}
          </div>
        </div>
        {/* Content block */}
        <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6 space-y-3">
          <Shimmer className="h-5 w-40" />
          <Shimmer className="h-4 w-full" />
          <Shimmer className="h-4 w-full" />
          <Shimmer className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  // Default: Card - rounded-xl box with title line + 2 body lines
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {items.map((i) => (
        <div
          key={i}
          className="bg-[#181C1F] border border-[#22272B] rounded-xl p-5 space-y-4"
        >
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

export default StaffLoadingSkeleton;
