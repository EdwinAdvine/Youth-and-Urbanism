import React from 'react';
import { Shield, Eye, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ModerationHighlight {
  id: string;
  contentType: string;
  contentTitle: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  aiRiskScore: number;
}

interface ModerationQueueCardProps {
  items: ModerationHighlight[];
  totalPending: number;
  isLoading?: boolean;
}

const ModerationQueueCard: React.FC<ModerationQueueCardProps> = ({ items, totalPending, isLoading }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-5 animate-pulse">
        <div className="h-5 w-40 bg-[#22272B] rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-[#22272B] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const priorityColor = {
    critical: 'bg-red-500/20 text-red-400',
    high: 'bg-orange-500/20 text-orange-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    low: 'bg-blue-500/20 text-blue-400',
  };

  return (
    <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400" />
          Moderation Queue
        </h3>
        <span className="px-2 py-0.5 text-xs font-bold bg-amber-500/20 text-amber-400 rounded-full">
          {totalPending}
        </span>
      </div>
      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-white/40 text-center py-4">Queue is clear</p>
        ) : (
          items.slice(0, 4).map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(`/dashboard/staff/moderation/review`)}
              className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#22272B]/50 hover:bg-[#22272B] transition-colors text-left"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white truncate">{item.contentTitle}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${priorityColor[item.priority]}`}>
                    {item.priority}
                  </span>
                  <span className="text-[10px] text-white/40">{item.contentType}</span>
                  <span className="text-[10px] text-white/40">Risk: {Math.round(item.aiRiskScore * 100)}%</span>
                </div>
              </div>
              <Eye className="w-3.5 h-3.5 text-white/30 flex-shrink-0 ml-2" />
            </button>
          ))
        )}
      </div>
      {totalPending > 4 && (
        <button
          onClick={() => navigate('/dashboard/staff/moderation/review')}
          className="mt-3 w-full flex items-center justify-center gap-1 text-xs text-[#FF4444] hover:text-[#FF6666] transition-colors"
        >
          View full queue <ArrowRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

export default ModerationQueueCard;
