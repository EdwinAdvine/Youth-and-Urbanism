import React from 'react';
import { Sparkles, TrendingUp, AlertCircle, BookOpen } from 'lucide-react';

interface Suggestion {
  id: string;
  type: 'trending' | 'missing' | 'outdated' | 'update';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  articleId?: string;
}

interface KBSuggestionsProps {
  suggestions: Suggestion[];
  onCreateArticle?: (suggestion: Suggestion) => void;
  onUpdateArticle?: (articleId: string) => void;
  onDismiss?: (suggestionId: string) => void;
}

const KBSuggestions: React.FC<KBSuggestionsProps> = ({
  suggestions,
  onCreateArticle,
  onUpdateArticle,
  onDismiss,
}) => {
  const typeConfig: Record<
    string,
    { icon: React.ElementType; color: string; label: string }
  > = {
    trending: { icon: TrendingUp, color: 'text-green-400 bg-green-500/20', label: 'Trending Topic' },
    missing: { icon: AlertCircle, color: 'text-red-400 bg-red-500/20', label: 'Missing Content' },
    outdated: { icon: AlertCircle, color: 'text-orange-400 bg-orange-500/20', label: 'Outdated' },
    update: { icon: BookOpen, color: 'text-blue-400 bg-blue-500/20', label: 'Suggested Update' },
  };

  const priorityBadge: Record<string, string> = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  if (suggestions.length === 0) {
    return (
      <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-5 text-center">
        <Sparkles className="w-8 h-8 text-white/10 mx-auto mb-2" />
        <p className="text-sm text-white/40">No AI suggestions at the moment</p>
      </div>
    );
  }

  return (
    <div className="bg-[#181C1F] border border-purple-500/20 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-purple-400" />
        AI Suggestions
      </h3>
      <div className="space-y-2">
        {suggestions.map((suggestion) => {
          const config = typeConfig[suggestion.type] || typeConfig.update;
          const Icon = config.icon;

          return (
            <div
              key={suggestion.id}
              className="p-3 bg-[#22272B]/50 border border-[#2A2F34] rounded-lg hover:border-purple-500/20 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${config.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-white/40">{config.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                        priorityBadge[suggestion.priority]
                      }`}
                    >
                      {suggestion.priority}
                    </span>
                  </div>
                  <h4 className="text-sm text-white font-medium mb-1">{suggestion.title}</h4>
                  <p className="text-xs text-white/50">{suggestion.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {suggestion.type === 'missing' && onCreateArticle && (
                      <button
                        onClick={() => onCreateArticle(suggestion)}
                        className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30"
                      >
                        Create Article
                      </button>
                    )}
                    {(suggestion.type === 'outdated' || suggestion.type === 'update') &&
                      suggestion.articleId &&
                      onUpdateArticle && (
                        <button
                          onClick={() => onUpdateArticle(suggestion.articleId!)}
                          className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30"
                        >
                          Update Article
                        </button>
                      )}
                    {onDismiss && (
                      <button
                        onClick={() => onDismiss(suggestion.id)}
                        className="text-xs px-2 py-1 text-white/40 hover:text-white"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KBSuggestions;
