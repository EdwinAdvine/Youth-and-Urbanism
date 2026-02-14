import React, { useState } from 'react';
import { Search, Sparkles, Filter, X } from 'lucide-react';

interface KBSearchBarProps {
  onSearch: (query: string, filters?: SearchFilters) => void;
  onAISearch?: (query: string) => void;
  isSearching?: boolean;
}

interface SearchFilters {
  categories?: string[];
  dateRange?: { from: string; to: string };
  author?: string;
}

const KBSearchBar: React.FC<KBSearchBarProps> = ({ onSearch, onAISearch, isSearching }) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    onSearch(query, filters);
  };

  const handleAISearch = () => {
    if (onAISearch && query.trim()) {
      onAISearch(query);
    }
  };

  const clearFilter = (key: keyof SearchFilters) => {
    setFilters({ ...filters, [key]: undefined });
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-4">
      <form onSubmit={handleSearch} className="space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search knowledge base..."
            className="w-full bg-[#22272B] border border-[#2A2F34] rounded-lg pl-10 pr-24 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#E40000]/30 outline-none"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {onAISearch && (
              <button
                type="button"
                onClick={handleAISearch}
                disabled={!query.trim() || isSearching}
                className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded flex items-center gap-1 hover:bg-purple-500/30 disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3" />
                AI
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1.5 rounded ${
                showFilters || activeFilterCount > 0
                  ? 'bg-[#E40000]/20 text-[#FF4444]'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E40000] text-white text-[9px] rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Active filters */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {filters.categories && (
              <span className="px-2 py-1 bg-[#22272B] text-xs text-white/60 rounded-full flex items-center gap-1">
                Categories: {filters.categories.join(', ')}
                <button
                  onClick={() => clearFilter('categories')}
                  className="text-white/30 hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.dateRange && (
              <span className="px-2 py-1 bg-[#22272B] text-xs text-white/60 rounded-full flex items-center gap-1">
                Date range
                <button
                  onClick={() => clearFilter('dateRange')}
                  className="text-white/30 hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.author && (
              <span className="px-2 py-1 bg-[#22272B] text-xs text-white/60 rounded-full flex items-center gap-1">
                Author: {filters.author}
                <button
                  onClick={() => clearFilter('author')}
                  className="text-white/30 hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Filter panel */}
        {showFilters && (
          <div className="p-3 bg-[#22272B]/50 rounded-lg border border-[#2A2F34] space-y-3">
            <div>
              <label className="text-xs text-white/50 block mb-1">Category</label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    setFilters({
                      ...filters,
                      categories: [e.target.value],
                    });
                  }
                }}
                className="w-full bg-[#181C1F] border border-[#2A2F34] rounded px-2 py-1.5 text-sm text-white"
              >
                <option value="">All categories</option>
                <option value="technical">Technical</option>
                <option value="policy">Policy</option>
                <option value="support">Support</option>
                <option value="training">Training</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-white/50 block mb-1">From</label>
                <input
                  type="date"
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      dateRange: { ...filters.dateRange, from: e.target.value } as any,
                    })
                  }
                  className="w-full bg-[#181C1F] border border-[#2A2F34] rounded px-2 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs text-white/50 block mb-1">To</label>
                <input
                  type="date"
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      dateRange: { ...filters.dateRange, to: e.target.value } as any,
                    })
                  }
                  className="w-full bg-[#181C1F] border border-[#2A2F34] rounded px-2 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isSearching}
          className="w-full px-4 py-2 bg-[#E40000]/20 text-[#FF4444] text-sm font-medium rounded-lg hover:bg-[#E40000]/30 disabled:opacity-50"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </form>
    </div>
  );
};

export default KBSearchBar;
