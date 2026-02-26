import React from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { Star, Heart } from 'lucide-react';
import ShoutoutCard from '../../components/student/community/ShoutoutCard';

const received = [
  { id: '1', from: 'Amina W.', to: 'Kevin O.', message: 'Great job explaining fractions to me! You made it so easy to understand.', timeAgo: '2 hours ago', likes: 5 },
  { id: '2', from: 'Mrs. Kamau', to: 'Kevin O.', message: 'Your essay was the best in class this week. Keep writing!', timeAgo: '1 day ago', likes: 12 },
  { id: '3', from: 'Brian K.', to: 'Kevin O.', message: 'Thanks for being a great study partner in our Science group!', timeAgo: '3 days ago', likes: 3 },
];

const ReceiveShoutoutsPage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Heart className="w-8 h-8 text-red-400" /> Received Shoutouts
        </h1>
        <p className="text-gray-600 dark:text-white/70">Kind words from your classmates and teachers</p>
      </div>

      <div className={`p-5 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 ${borderRadius} border border-yellow-500/20 text-center`}>
        <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
        <div className="text-3xl font-bold text-gray-900 dark:text-white">{received.length}</div>
        <div className="text-gray-500 dark:text-white/60 text-sm">shoutouts received</div>
      </div>

      <div className="space-y-3">
        {received.map((s) => (
          <ShoutoutCard key={s.id} {...s} />
        ))}
      </div>
    </div>
  );
};

export default ReceiveShoutoutsPage;
