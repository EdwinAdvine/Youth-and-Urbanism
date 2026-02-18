import React from 'react';
import { Eye, ThumbsUp, MessageSquare, Calendar, User, Tag, Star } from 'lucide-react';

interface KBArticle {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  createdAt: string;
  updatedAt?: string;
  views: number;
  helpful: number;
  comments: number;
  tags: string[];
  isFeatured?: boolean;
}

interface KBArticleCardProps {
  article: KBArticle;
  onClick: () => void;
  relevanceScore?: number;
}

const KBArticleCard: React.FC<KBArticleCardProps> = ({ article, onClick, relevanceScore }) => {
  const categoryColors: Record<string, string> = {
    technical: 'bg-blue-500/20 text-blue-400',
    policy: 'bg-purple-500/20 text-purple-400',
    support: 'bg-green-500/20 text-green-400',
    training: 'bg-orange-500/20 text-orange-400',
  };

  return (
    <button
      onClick={onClick}
      className="w-full p-4 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl hover:border-[#E40000]/30 transition-all text-left group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {article.isFeatured && (
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 flex-shrink-0" />
            )}
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#FF4444] transition-colors truncate">
              {article.title}
            </h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-white/50 line-clamp-2">{article.excerpt}</p>
        </div>
        {relevanceScore !== undefined && (
          <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full flex-shrink-0">
            {Math.round(relevanceScore * 100)}%
          </span>
        )}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 mt-3 text-[10px] text-gray-400 dark:text-white/40">
        <span
          className={`px-2 py-0.5 rounded-full ${
            categoryColors[article.category] || 'bg-gray-100 dark:bg-[#22272B] text-gray-400 dark:text-white/40'
          }`}
        >
          {article.category}
        </span>
        <span className="flex items-center gap-1">
          <User className="w-3 h-3" />
          {article.author}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(article.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* Tags */}
      {article.tags.length > 0 && (
        <div className="flex items-center gap-1.5 mt-2">
          <Tag className="w-3 h-3 text-gray-400 dark:text-white/30" />
          <div className="flex flex-wrap gap-1">
            {article.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] text-gray-400 dark:text-white/30">
                #{tag}
              </span>
            ))}
            {article.tags.length > 3 && (
              <span className="text-[10px] text-gray-400 dark:text-white/30">+{article.tags.length - 3}</span>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200 dark:border-[#22272B]">
        <span className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-white/40">
          <Eye className="w-3 h-3" />
          {article.views}
        </span>
        <span className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-white/40">
          <ThumbsUp className="w-3 h-3" />
          {article.helpful}
        </span>
        <span className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-white/40">
          <MessageSquare className="w-3 h-3" />
          {article.comments}
        </span>
      </div>
    </button>
  );
};

export default KBArticleCard;
