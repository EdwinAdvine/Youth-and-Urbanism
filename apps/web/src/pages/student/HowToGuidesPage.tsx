import React, { useState } from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { BookOpen, Search, Play, Clock, ChevronRight, Star, Sparkles } from 'lucide-react';

const guides = [
  { id: '1', title: 'How to Use the AI Tutor', category: 'Getting Started', duration: '3 min', type: 'video' as const, difficulty: 'Beginner', views: 342 },
  { id: '2', title: 'Navigating Your Dashboard', category: 'Getting Started', duration: '2 min', type: 'article' as const, difficulty: 'Beginner', views: 518 },
  { id: '3', title: 'Submitting Assignments', category: 'Courses', duration: '4 min', type: 'video' as const, difficulty: 'Beginner', views: 289 },
  { id: '4', title: 'Taking Quizzes & Practice Tests', category: 'Courses', duration: '5 min', type: 'article' as const, difficulty: 'Beginner', views: 201 },
  { id: '5', title: 'Using Voice Mode with AI', category: 'AI Features', duration: '3 min', type: 'video' as const, difficulty: 'Intermediate', views: 156 },
  { id: '6', title: 'Setting Up Your Study Schedule', category: 'Productivity', duration: '4 min', type: 'article' as const, difficulty: 'Beginner', views: 178 },
  { id: '7', title: 'Joining Live Sessions', category: 'Courses', duration: '3 min', type: 'video' as const, difficulty: 'Beginner', views: 267 },
  { id: '8', title: 'Managing Your Wallet & Payments', category: 'Account', duration: '5 min', type: 'article' as const, difficulty: 'Beginner', views: 312 },
  { id: '9', title: 'Understanding Your Skill Tree', category: 'Progress', duration: '6 min', type: 'video' as const, difficulty: 'Intermediate', views: 134 },
  { id: '10', title: 'Privacy Settings for Students', category: 'Account', duration: '3 min', type: 'article' as const, difficulty: 'Beginner', views: 95 },
];

const categories = ['All', 'Getting Started', 'Courses', 'AI Features', 'Productivity', 'Account', 'Progress'];

const HowToGuidesPage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = guides.filter((g) => {
    const matchesSearch = g.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || g.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <BookOpen className="w-8 h-8 text-blue-400" /> How-To Guides
        </h1>
        <p className="text-gray-600 dark:text-white/70">Learn how to get the most out of Urban Home School</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search guides..."
          className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-blue-500`}
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 ${borderRadius} text-sm whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-[#FF0000] text-gray-900 dark:text-white'
                : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* AI Quick Help */}
      <div className={`p-4 bg-purple-500/10 ${borderRadius} border border-purple-500/20`}>
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-gray-900 dark:text-white font-medium text-sm">Can't find what you need?</p>
            <p className="text-gray-500 dark:text-white/60 text-xs">Ask our AI assistant for instant help</p>
          </div>
          <button className={`px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-gray-900 dark:text-white text-sm ${borderRadius}`}>
            Ask AI
          </button>
        </div>
      </div>

      {/* Guides List */}
      <div className="space-y-2">
        {filtered.map((guide) => (
          <button
            key={guide.id}
            className={`w-full p-4 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] hover:border-gray-300 dark:hover:border-white/20 transition-colors flex items-center gap-4 text-left`}
          >
            <div className={`w-10 h-10 ${borderRadius} flex items-center justify-center flex-shrink-0 ${
              guide.type === 'video' ? 'bg-red-500/20' : 'bg-blue-500/20'
            }`}>
              {guide.type === 'video' ? (
                <Play className="w-5 h-5 text-red-400" />
              ) : (
                <BookOpen className="w-5 h-5 text-blue-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-gray-900 dark:text-white font-medium text-sm truncate">{guide.title}</h3>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 dark:text-white/40">
                <span className={`px-1.5 py-0.5 ${borderRadius} bg-gray-50 dark:bg-white/5`}>{guide.category}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {guide.duration}</span>
                <span className="flex items-center gap-1"><Star className="w-3 h-3" /> {guide.views} views</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 dark:text-white/30 flex-shrink-0" />
          </button>
        ))}

        {filtered.length === 0 && (
          <div className={`p-12 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center`}>
            <BookOpen className="w-12 h-12 text-gray-400 dark:text-gray-300 dark:text-white/20 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-white/60">No guides found matching your search</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HowToGuidesPage;
