import React, { useState, useEffect, useCallback } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import KBSearchBar from '../../components/staff/knowledge/KBSearchBar';
import KBArticleCard from '../../components/staff/knowledge/KBArticleCard';
import KBSuggestions from '../../components/staff/knowledge/KBSuggestions';
import { getArticles, searchKB } from '@/services/staff/staffKnowledgeBaseService';
import type { KBArticle, KBSearchResult } from '@/types/staff';

const KnowledgeBasePage: React.FC = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<KBArticle[]>([]);
  const [searchResults, setSearchResults] = useState<KBSearchResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggestions = [
    {
      id: '1',
      type: 'missing' as const,
      title: 'Online Safety Guidelines',
      description: 'Many staff members have asked about online safety protocols',
      priority: 'high' as const,
    },
  ];

  const fetchArticles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getArticles();
      setArticles(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load articles');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchKB(query);
      setSearchResults(results);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateFromSuggestion = () => {
    navigate('/dashboard/staff/support/kb/editor');
  };

  // Map KBArticle to the shape that KBArticleCard expects
  const mapArticleToCard = (article: KBArticle) => ({
    id: article.id,
    title: article.title,
    excerpt: article.body.length > 120 ? article.body.substring(0, 120) + '...' : article.body,
    category: article.category?.name || 'uncategorized',
    author: article.author.name,
    createdAt: article.created_at,
    views: article.view_count,
    helpful: article.helpful_count,
    comments: 0,
    tags: article.tags,
    isFeatured: false,
  });

  // Map search results for display
  const mapSearchResultToCard = (result: KBSearchResult) => ({
    id: result.article_id,
    title: result.title,
    excerpt: result.snippet,
    category: result.category || 'uncategorized',
    author: '',
    createdAt: '',
    views: 0,
    helpful: 0,
    comments: 0,
    tags: result.tags,
    isFeatured: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="h-8 w-48 bg-white dark:bg-[#181C1F] rounded animate-pulse" />
            <div className="h-10 w-36 bg-white dark:bg-[#181C1F] rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-16 bg-white dark:bg-[#181C1F] rounded-xl animate-pulse" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] animate-pulse" />
              ))}
            </div>
            <div className="h-48 bg-white dark:bg-[#181C1F] rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112] p-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <p className="text-lg text-gray-900 dark:text-white font-medium mb-2">Failed to load knowledge base</p>
          <p className="text-sm text-gray-500 dark:text-white/50 mb-4">{error}</p>
          <button
            onClick={fetchArticles}
            className="px-4 py-2 bg-[#E40000]/20 text-[#FF4444] rounded-lg hover:bg-[#E40000]/30"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const displayItems = searchResults !== null
    ? searchResults.map(mapSearchResultToCard)
    : articles.map(mapArticleToCard);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Knowledge Base</h1>
          <button
            onClick={() => navigate('/dashboard/staff/support/kb/editor')}
            className="flex items-center gap-2 px-4 py-2 bg-[#E40000]/20 text-[#FF4444] rounded-lg hover:bg-[#E40000]/30"
          >
            <Plus className="w-4 h-4" />
            New Article
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <KBSearchBar onSearch={handleSearch} isSearching={isSearching} />

            {searchResults !== null && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-white/50">
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                </p>
                <button
                  onClick={() => setSearchResults(null)}
                  className="text-xs text-[#FF4444] hover:text-[#E40000]"
                >
                  Clear search
                </button>
              </div>
            )}

            {displayItems.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-gray-500 dark:text-white/50">
                  {searchResults !== null ? 'No articles match your search' : 'No articles yet'}
                </p>
              </div>
            ) : (
              displayItems.map((article) => (
                <KBArticleCard
                  key={article.id}
                  article={article}
                  onClick={() => navigate(`/dashboard/staff/support/kb/editor/${article.id}`)}
                  relevanceScore={
                    searchResults !== null
                      ? searchResults.find((r) => r.article_id === article.id)?.similarity_score
                      : undefined
                  }
                />
              ))
            )}
          </div>
          <div>
            <KBSuggestions
              suggestions={suggestions}
              onCreateArticle={handleCreateFromSuggestion}
              onUpdateArticle={(articleId) => navigate(`/dashboard/staff/support/kb/editor/${articleId}`)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBasePage;
