import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, BookOpen, Users, Bell, FileText, Loader2, ArrowLeft } from 'lucide-react';
import { searchService, type SearchResponse } from '../services/searchService';

const categoryIcons: Record<string, React.ReactNode> = {
  user: <Users className="w-5 h-5 text-blue-400" />,
  course: <BookOpen className="w-5 h-5 text-green-400" />,
  notification: <Bell className="w-5 h-5 text-orange-400" />,
};

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  useEffect(() => {
    if (query.trim()) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (q: string) => {
    setLoading(true);
    try {
      const response = await searchService.search(q, undefined, 50);
      setResults(response);
    } catch {
      setResults({ query: q, total: 0, results: [], categories: {} });
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results?.results.filter(r =>
    activeFilter === 'all' || r.type === activeFilter
  ) || [];

  const categories = results?.categories || {};

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/60 hover:text-gray-700 dark:hover:text-white/80 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Search Results
        </h1>
        {query && (
          <p className="text-gray-500 dark:text-white/60 mt-1">
            {loading ? 'Searching...' : `${results?.total || 0} results for "${query}"`}
          </p>
        )}
      </div>

      {/* Filter Tabs */}
      {results && results.total > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              activeFilter === 'all'
                ? 'bg-[#FF0000]/10 text-[#FF0000] border border-[#FF0000]/30'
                : 'bg-gray-100 dark:bg-[#22272B] text-gray-600 dark:text-white/70 border border-gray-200 dark:border-[#333] hover:border-gray-300 dark:hover:border-[#444]'
            }`}
          >
            All ({results.total})
          </button>
          {Object.entries(categories).map(([type, count]) => (
            <button
              key={type}
              onClick={() => setActiveFilter(type === 'users' ? 'user' : type === 'courses' ? 'course' : type === 'notifications' ? 'notification' : type)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                activeFilter === (type === 'users' ? 'user' : type === 'courses' ? 'course' : type === 'notifications' ? 'notification' : type)
                  ? 'bg-[#FF0000]/10 text-[#FF0000] border border-[#FF0000]/30'
                  : 'bg-gray-100 dark:bg-[#22272B] text-gray-600 dark:text-white/70 border border-gray-200 dark:border-[#333] hover:border-gray-300 dark:hover:border-[#444]'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)} ({count})
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500 dark:text-white/60">Searching...</p>
        </div>
      ) : filteredResults.length > 0 ? (
        <div className="space-y-2">
          {filteredResults.map((result, i) => (
            <button
              key={`${result.type}-${i}`}
              onClick={() => navigate(result.url)}
              className="w-full flex items-start gap-4 p-4 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl hover:border-[#FF0000]/30 hover:shadow-sm transition-all text-left group"
            >
              <div className="mt-0.5">
                {categoryIcons[result.type] || <FileText className="w-5 h-5 text-gray-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white group-hover:text-[#FF0000] transition-colors">
                  {result.title}
                </p>
                <p className="text-sm text-gray-500 dark:text-white/60 mt-1 line-clamp-2">
                  {result.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] uppercase font-semibold text-gray-400 dark:text-white/40 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded">
                    {result.type}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : query ? (
        <div className="text-center py-12">
          <Search className="w-10 h-10 mx-auto text-gray-300 dark:text-white/20 mb-3" />
          <p className="text-gray-500 dark:text-white/60 font-medium">No results found</p>
          <p className="text-sm text-gray-400 dark:text-white/40 mt-1">
            Try different keywords or check your spelling
          </p>
        </div>
      ) : (
        <div className="text-center py-12">
          <Search className="w-10 h-10 mx-auto text-gray-300 dark:text-white/20 mb-3" />
          <p className="text-gray-500 dark:text-white/60">Enter a search term to begin</p>
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;
