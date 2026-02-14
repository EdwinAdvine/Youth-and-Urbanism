import React from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { MessageSquare, ThumbsUp, Clock, Eye, Edit2 } from 'lucide-react';

const myPosts = [
  { id: '1', title: 'How to convert fractions to decimals?', replies: 8, likes: 5, views: 42, timeAgo: '3 days ago', status: 'answered' },
  { id: '2', title: 'Best resources for Kiswahili practice?', replies: 3, likes: 2, views: 18, timeAgo: '1 week ago', status: 'open' },
  { id: '3', title: 'Help with creative writing assignment', replies: 6, likes: 4, views: 35, timeAgo: '2 weeks ago', status: 'answered' },
];

const MyPostsPage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Posts</h1>
        <p className="text-gray-600 dark:text-white/70">{myPosts.length} posts created</p>
      </div>

      <div className="space-y-3">
        {myPosts.map((post) => (
          <div key={post.id} className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] hover:border-gray-300 dark:hover:border-white/20 transition-colors`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 text-xs ${borderRadius} ${post.status === 'answered' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{post.status}</span>
            </div>
            <h3 className="text-gray-900 dark:text-white font-medium">{post.title}</h3>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-white/50">
              <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {post.replies}</span>
              <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {post.likes}</span>
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.views}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.timeAgo}</span>
            </div>
            <button className={`mt-3 px-3 py-1.5 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-white/60 text-sm ${borderRadius} flex items-center gap-1`}>
              <Edit2 className="w-3 h-3" /> Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyPostsPage;
