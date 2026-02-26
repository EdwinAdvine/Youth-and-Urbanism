import React from 'react';
import { X, ChevronDown } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
  value: string;
}

interface PartnerFilterBarProps {
  filters: FilterConfig[];
  onFilterChange: (key: string, value: string) => void;
  onClearAll?: () => void;
  className?: string;
}

const PartnerFilterBar: React.FC<PartnerFilterBarProps> = ({
  filters,
  onFilterChange,
  onClearAll,
  className = '',
}) => {
  const hasActiveFilters = filters.some((f) => f.value !== '' && f.value !== 'all');

  return (
    <div
      className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 ${className}`}
    >
      {filters.map((filter) => (
        <div key={filter.key} className="relative w-full sm:w-auto">
          <label className="sr-only" htmlFor={`filter-${filter.key}`}>
            {filter.label}
          </label>
          <div className="relative">
            <select
              id={`filter-${filter.key}`}
              value={filter.value}
              onChange={(e) => onFilterChange(filter.key, e.target.value)}
              className="
                appearance-none w-full sm:w-auto min-w-[140px]
                pl-3 pr-8 py-2 text-sm
                bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg
                text-gray-700 dark:text-white/80
                focus:outline-none focus:border-[#E40000]/50 focus:ring-1 focus:ring-[#E40000]/30
                transition-colors cursor-pointer
              "
            >
              <option value="" className="bg-gray-100 dark:bg-[#22272B]">
                {filter.label}
              </option>
              {filter.options.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="bg-gray-100 dark:bg-[#22272B]"
                >
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-white/40 pointer-events-none" />
          </div>
        </div>
      ))}

      {onClearAll && hasActiveFilters && (
        <button
          onClick={onClearAll}
          className="
            flex items-center gap-1.5 px-3 py-2 text-xs font-medium
            text-gray-500 dark:text-white/50 hover:text-gray-700 dark:hover:text-white/80
            bg-transparent hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg
            transition-colors flex-shrink-0
          "
        >
          <X className="w-3.5 h-3.5" />
          Clear all
        </button>
      )}
    </div>
  );
};

export default PartnerFilterBar;
