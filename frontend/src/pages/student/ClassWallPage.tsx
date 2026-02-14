import React, { useState } from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { Heart, MessageCircle, Send, Star } from 'lucide-react';

const wallPosts = [
  { id: '1', from: 'Grace W.', to: 'Kevin O.', message: 'Great job on the math quiz today! You helped me understand fractions better.', category: 'thanks', timeAgo: '1 hour ago', likes: 5 },
  { id: '2', from: 'Teacher Wanjiku', to: 'Class 7B', message: "I'm so proud of everyone's effort this week! Keep up the amazing work!", category: 'encouragement', timeAgo: '3 hours ago', likes: 18 },
  { id: '3', from: 'Amina K.', to: 'Faith A.', message: 'Congratulations on earning the Quiz Master badge!', category: 'achievement', timeAgo: '5 hours ago', likes: 8 },
  { id: '4', from: 'James N.', to: 'Science Study Group', message: 'Thanks for the help with the water cycle project everyone!', category: 'thanks', timeAgo: '1 day ago', likes: 12 },
  { id: '5', from: 'Brian K.', to: 'Sarah M.', message: "You're an inspiration - 23-day streak and counting!", category: 'encouragement', timeAgo: '1 day ago', likes: 9 },
];

const categoryColors: Record<string, string> = {
  thanks: 'bg-green-500/20 text-green-400',
  encouragement: 'bg-blue-500/20 text-blue-400',
  achievement: 'bg-yellow-500/20 text-yellow-400',
  help: 'bg-purple-500/20 text-purple-400',
};

const ClassWallPage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();
  const [newMessage, setNewMessage] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Star className="w-8 h-8 text-yellow-400" /> Class Wall
        </h1>
        <p className="text-gray-600 dark:text-white/70">Shoutouts and encouragement from your classmates</p>
      </div>

      {/* New Shoutout */}
      <div className={`p-4 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
        <div className="flex gap-2">
          <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Send a shoutout to someone..." className={`flex-1 px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-[#22272B] ${borderRadius} text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-[#FF0000]`} />
          <button className={`px-4 py-2.5 bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white ${borderRadius}`}><Send className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Wall Posts */}
      <div className="space-y-3">
        {wallPosts.map((post) => (
          <div key={post.id} className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 text-xs ${borderRadius} ${categoryColors[post.category]}`}>{post.category}</span>
              <span className="text-gray-400 dark:text-white/40 text-xs">{post.timeAgo}</span>
            </div>
            <p className="text-gray-700 dark:text-white/80">
              <span className="text-gray-900 dark:text-white font-medium">{post.from}</span>
              <span className="text-gray-400 dark:text-white/40"> to </span>
              <span className="text-gray-900 dark:text-white font-medium">{post.to}</span>
            </p>
            <p className="text-gray-600 dark:text-white/70 mt-2">{post.message}</p>
            <div className="flex gap-3 mt-3">
              <button className="flex items-center gap-1 text-sm text-gray-400 dark:text-white/40 hover:text-red-400"><Heart className="w-4 h-4" /> {post.likes}</button>
              <button className="flex items-center gap-1 text-sm text-gray-400 dark:text-white/40 hover:text-blue-400"><MessageCircle className="w-4 h-4" /> Reply</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClassWallPage;
