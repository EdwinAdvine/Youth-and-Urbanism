import React, { useState } from 'react';
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';

export interface FilterDef {
  key: string;
  label: string;
  type: 'select' | 'text' | 'date';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface AdminFilterPanelProps {
  filters: FilterDef[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onReset: () => void;
  className?: string;
}

const AdminFilterPanel: React.FC<AdminFilterPanelProps> = ({
  filters,
  values,
  onChange,
  onReset,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const activeCount = Object.values(values).filter((v) => v !== '' && v !== undefined).length;

  return (
    <div className={`bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl ${className}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-[#1E2225] transition-colors rounded-xl"
      >
        <div className="flex items-center gap-2">
          <span>Filters</span>
          {activeCount > 0 && (
            <span className="px-1.5 py-0.5 text-xs font-semibold bg-red-500/20 text-red-400 rounded">
              {activeCount}
            </span>
          )}
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* Filter controls */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-[#22272B]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filters.map((filter) => (
              <div key={filter.key} className="space-y-1">
                <label className="text-xs text-gray-500 dark:text-white/40 font-medium">
                  {filter.label}
                </label>

                {filter.type === 'select' ? (
                  <select
                    value={values[filter.key] || ''}
                    onChange={(e) => onChange(filter.key, e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-[#22272B] border border-gray-200 dark:border-[#333] rounded-lg text-gray-900 dark:text-white focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none"
                  >
                    <option value="">{filter.placeholder || 'All'}</option>
                    {filter.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : filter.type === 'date' ? (
                  <input
                    type="date"
                    value={values[filter.key] || ''}
                    onChange={(e) => onChange(filter.key, e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-[#22272B] border border-gray-200 dark:border-[#333] rounded-lg text-gray-900 dark:text-white focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none"
                  />
                ) : (
                  <input
                    type="text"
                    value={values[filter.key] || ''}
                    onChange={(e) => onChange(filter.key, e.target.value)}
                    placeholder={filter.placeholder || `Filter by ${filter.label.toLowerCase()}...`}
                    className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-[#22272B] border border-gray-200 dark:border-[#333] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Reset button */}
          {activeCount > 0 && (
            <button
              onClick={onReset}
              className="mt-3 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-white/50 hover:text-red-400 dark:hover:text-red-400 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminFilterPanel;
