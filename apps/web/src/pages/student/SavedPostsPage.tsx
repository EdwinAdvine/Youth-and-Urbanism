import React from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { Bookmark, MessageSquare, Clock, Trash2 } from 'lucide-react';

const savedPosts = [
  { id: '1', title: 'Complete guide to CBC Fractions', author: 'Ms. Wanjiku', subject: 'Math', replies: 24, savedAt: '2 days ago' },
  { id: '2', title: 'How to write a perfect essay', author: 'Mrs. Kamau', subject: 'English', replies: 18, savedAt: '1 week ago' },
  { id: '3', title: 'Science experiment: DIY volcano', author: 'Kevin O.', subject: 'Science', replies: 31, savedAt: '2 weeks ago' },
];

const SavedPostsPage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Bookmark className="w-8 h-8 text-yellow-400 fill-yellow-400" /> Saved Posts
        </h1>
        <p className="text-gray-600 dark:text-white/70">{savedPosts.length} posts saved for later</p>
      </div>

      {savedPosts.length === 0 ? (
        <div className={`p-12 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center`}>
          <Bookmark className="w-12 h-12 text-gray-400 dark:text-gray-300 dark:text-white/20 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-white/60">No saved posts yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {savedPosts.map((post) => (
            <div key={post.id} className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] hover:border-gray-300 dark:hover:border-white/20 transition-colors`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className={`px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs ${borderRadius} mb-2 inline-block`}>{post.subject}</span>
                  <h3 className="text-gray-900 dark:text-white font-medium">{post.title}</h3>
                  <p className="text-gray-400 dark:text-white/40 text-sm mt-1">by {post.author}</p>
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 dark:text-white/50">
                    <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {post.replies} replies</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Saved {post.savedAt}</span>
                  </div>
                </div>
                <button className={`p-2 bg-gray-50 dark:bg-white/5 hover:bg-red-500/20 text-gray-400 dark:text-white/30 hover:text-red-400 ${borderRadius}`}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedPostsPage;
