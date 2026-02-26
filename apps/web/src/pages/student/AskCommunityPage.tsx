// AskCommunityPage - Student page at /dashboard/student/ask-community. Forum-style page
// where students post questions, browse peer discussions, and get help from the community.
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { Users, Plus } from 'lucide-react';
import ForumPostCard from '../../components/student/community/ForumPostCard';

const posts = [
  { title: 'How to solve quadratic equations?', author: 'Amina W.', content: "I'm struggling with factoring. Can someone explain the steps?", timeAgo: '1 hour ago', likes: 5, replies: 3, subject: 'Math' },
  { title: 'Best way to study for Science exam?', author: 'Brian K.', content: "The exam is next week and I haven't started revision. Any tips?", timeAgo: '3 hours ago', likes: 8, replies: 6, subject: 'Science' },
  { title: 'Creative writing tips', author: 'Grace A.', content: "How do you come up with story ideas? I always get writer's block.", timeAgo: '1 day ago', likes: 12, replies: 9, subject: 'English' },
];

const AskCommunityPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <Users className="w-8 h-8 text-green-400" /> Ask the Community
          </h1>
          <p className="text-gray-600 dark:text-white/70">Get help from fellow students</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/student/community/questions/new')}
          className={`px-4 py-2 bg-[#FF0000] hover:bg-[#FF0000]/80 text-gray-900 dark:text-white ${borderRadius} flex items-center gap-2`}
        >
          <Plus className="w-4 h-4" /> Ask Question
        </button>
      </div>

      <div className="space-y-3">
        {posts.map((post, i) => (
          <ForumPostCard key={i} {...post} onClick={() => navigate('/dashboard/student/community/discussions')} />
        ))}
      </div>
    </div>
  );
};

export default AskCommunityPage;
