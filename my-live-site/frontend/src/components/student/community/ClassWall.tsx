import React from 'react';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import ShoutoutCard from './ShoutoutCard';

interface Shoutout {
  id: string;
  from: string;
  to: string;
  message: string;
  timeAgo: string;
  likes: number;
}

interface ClassWallProps {
  shoutouts: Shoutout[];
  onLike?: (id: string) => void;
}

const ClassWall: React.FC<ClassWallProps> = ({ shoutouts, onLike }) => {
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className={`p-5 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B]`}>
      <h3 className="text-gray-900 dark:text-white font-semibold mb-4">Class Wall</h3>
      {shoutouts.length === 0 ? (
        <p className="text-gray-400 dark:text-white/40 text-sm text-center py-6">No shoutouts yet. Be the first to encourage a classmate!</p>
      ) : (
        <div className="space-y-3">
          {shoutouts.map((s) => (
            <ShoutoutCard
              key={s.id}
              from={s.from}
              to={s.to}
              message={s.message}
              timeAgo={s.timeAgo}
              likes={s.likes}
              onLike={() => onLike?.(s.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassWall;
