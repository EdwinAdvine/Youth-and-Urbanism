import React, { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import KBSearchBar from '../components/staff/knowledge/KBSearchBar';
import KBArticleCard from '../components/staff/knowledge/KBArticleCard';
import KBSuggestions from '../components/staff/knowledge/KBSuggestions';

const KnowledgeBasePage: React.FC = () => {
  const [search, setSearch] = useState('');

  const articles = [
    {
      id: '1',
      title: 'How to handle student disputes',
      excerpt: 'A comprehensive guide on mediating conflicts between students',
      category: 'support',
      author: 'Jane Doe',
      createdAt: '2024-01-15',
      views: 245,
      helpful: 32,
      comments: 5,
      tags: ['conflict', 'mediation'],
      isFeatured: true,
    },
  ];

  const suggestions = [
    {
      id: '1',
      type: 'missing' as const,
      title: 'Online Safety Guidelines',
      description: 'Many staff members have asked about online safety protocols',
      priority: 'high' as const,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0F1112] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Knowledge Base</h1>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#E40000]/20 text-[#FF4444] rounded-lg hover:bg-[#E40000]/30">
            <Plus className="w-4 h-4" />
            New Article
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <KBSearchBar onSearch={(q) => setSearch(q)} />
            {articles.map((article) => (
              <KBArticleCard key={article.id} article={article} onClick={() => {}} />
            ))}
          </div>
          <div>
            <KBSuggestions suggestions={suggestions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBasePage;
