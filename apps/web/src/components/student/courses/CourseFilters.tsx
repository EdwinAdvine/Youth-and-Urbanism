import React from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { Search } from 'lucide-react';

interface CourseFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  sortOptions: string[];
}

const CourseFilters: React.FC<CourseFiltersProps> = ({ search, onSearchChange, sortBy, onSortChange, sortOptions }) => {
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className="flex gap-3 flex-wrap">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search courses..."
          className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-[#FF0000]`}
        />
      </div>
      <div className="flex gap-2">
        {sortOptions.map((sort) => (
          <button
            key={sort}
            onClick={() => onSortChange(sort)}
            className={`px-3 py-2.5 ${borderRadius} text-sm capitalize ${
              sortBy === sort
                ? 'bg-[#FF0000]/20 text-[#FF0000] border border-[#FF0000]/30'
                : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60 border border-gray-200 dark:border-white/10'
            }`}
          >
            {sort}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CourseFilters;
