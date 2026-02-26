import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Grid, List, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getContentItems } from '@/services/staff/staffContentService';
import type { ContentItem } from '@/types/staff';

const ContentStudioPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getContentItems();
      setItems(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content items');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const getStatusBadge = (status: ContentItem['status']) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-500/20 text-gray-400',
      review: 'bg-yellow-500/20 text-yellow-400',
      approved: 'bg-blue-500/20 text-blue-400',
      published: 'bg-green-500/20 text-green-400',
      archived: 'bg-red-500/20 text-red-400',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${colors[status] || ''}`}>
        {status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="h-8 w-48 bg-white dark:bg-[#181C1F] rounded animate-pulse" />
            <div className="h-10 w-40 bg-white dark:bg-[#181C1F] rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4">
                <div className="aspect-video bg-gray-100 dark:bg-[#22272B] rounded-lg mb-3 animate-pulse" />
                <div className="h-4 w-3/4 bg-gray-100 dark:bg-[#22272B] rounded animate-pulse mb-2" />
                <div className="h-3 w-1/2 bg-gray-100 dark:bg-[#22272B] rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <p className="text-lg text-gray-900 dark:text-white font-medium mb-2">Failed to load content</p>
            <p className="text-sm text-gray-500 dark:text-white/50 mb-4">{error}</p>
            <button
              onClick={fetchContent}
              className="px-4 py-2 bg-[#E40000]/20 text-[#FF4444] rounded-lg hover:bg-[#E40000]/30"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Content Studio</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-[#E40000]/20 text-[#FF4444]' : 'text-gray-400 dark:text-white/40'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-[#E40000]/20 text-[#FF4444]' : 'text-gray-400 dark:text-white/40'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => navigate('/dashboard/staff/learning/content/editor')}
              className="flex items-center gap-2 px-4 py-2 bg-[#E40000]/20 text-[#FF4444] rounded-lg hover:bg-[#E40000]/30"
            >
              <Plus className="w-4 h-4" />
              New Content
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-sm text-gray-500 dark:text-white/50 mb-4">No content items found</p>
            <button
              onClick={() => navigate('/dashboard/staff/learning/content/editor')}
              className="flex items-center gap-2 px-4 py-2 bg-[#E40000]/20 text-[#FF4444] rounded-lg hover:bg-[#E40000]/30"
            >
              <Plus className="w-4 h-4" />
              Create your first content
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/dashboard/staff/learning/content/editor/${item.id}`)}
                className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4 hover:border-[#E40000]/30 cursor-pointer transition-colors"
              >
                <div className="aspect-video bg-gray-100 dark:bg-[#22272B] rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-xs text-gray-400 dark:text-white/30 uppercase">{item.content_type}</span>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.title}</h3>
                  {getStatusBadge(item.status)}
                </div>
                <p className="text-xs text-gray-400 dark:text-white/40">
                  {item.grade_levels.length > 0 ? item.grade_levels.join(', ') : 'No grade'} {item.learning_area ? `\u00b7 ${item.learning_area}` : ''}
                </p>
                <p className="text-xs text-gray-400 dark:text-white/30 mt-1">
                  By {item.author?.name ?? 'Unknown'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-[#22272B]">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-white/50 uppercase tracking-wider">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-white/50 uppercase tracking-wider">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-white/50 uppercase tracking-wider">Author</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-white/50 uppercase tracking-wider">Grade</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-white/50 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[#22272B]">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => navigate(`/dashboard/staff/learning/content/editor/${item.id}`)}
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.02] cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-900 dark:text-white font-medium">{item.title}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500 dark:text-white/60 bg-gray-50 dark:bg-[#0F1112] px-2 py-1 rounded capitalize">
                        {item.content_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700 dark:text-white/80">{item.author?.name ?? 'Unknown'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500 dark:text-white/60">
                        {item.grade_levels.length > 0 ? item.grade_levels.join(', ') : '--'}
                      </span>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(item.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentStudioPage;
