import React from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { MessageSquare, ThumbsUp, Clock, Plus, Bookmark } from 'lucide-react';

const discussions = [
  { id: '1', title: 'How do you solve fraction word problems?', author: 'Kevin O.', subject: 'Math', replies: 12, likes: 8, timeAgo: '2 hours ago', solved: true },
  { id: '2', title: 'Best way to study for the Science quiz?', author: 'Amina K.', subject: 'Science', replies: 7, likes: 15, timeAgo: '5 hours ago', solved: false },
  { id: '3', title: 'Creative writing tips for essays', author: 'Grace W.', subject: 'English', replies: 9, likes: 11, timeAgo: '1 day ago', solved: true },
  { id: '4', title: 'Can someone explain photosynthesis simply?', author: 'James N.', subject: 'Science', replies: 14, likes: 20, timeAgo: '2 days ago', solved: true },
  { id: '5', title: 'Kiswahili methali meanings', author: 'Faith A.', subject: 'Kiswahili', replies: 6, likes: 5, timeAgo: '3 days ago', solved: false },
];

const DiscussionsRecentPage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Recent Discussions</h1>
          <p className="text-gray-600 dark:text-white/70">Join the conversation with your classmates</p>
        </div>
        <button className={`px-4 py-2 bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white ${borderRadius} flex items-center gap-2`}>
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      <div className="space-y-3">
        {discussions.map((post) => (
          <div key={post.id} className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] hover:border-gray-300 dark:hover:border-white/20 transition-colors cursor-pointer`}>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {post.solved && <span className={`px-2 py-0.5 bg-green-500/20 text-green-400 text-xs ${borderRadius}`}>Solved</span>}
                  <span className={`px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs ${borderRadius}`}>{post.subject}</span>
                </div>
                <h3 className="text-gray-900 dark:text-white font-medium">{post.title}</h3>
                <p className="text-gray-400 dark:text-white/40 text-sm mt-1">by {post.author}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-white/50">
                  <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {post.replies} replies</span>
                  <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {post.likes}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.timeAgo}</span>
                </div>
              </div>
              <button className="text-gray-400 dark:text-white/30 hover:text-gray-500 dark:hover:text-white/60"><Bookmark className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiscussionsRecentPage;
