import React from 'react';
import { Sparkles, ArrowRight, Clock, AlertCircle } from 'lucide-react';

interface AIAgendaItem {
  id: string;
  title: string;
  priority: number;
  rationale: string;
  category: string;
  estimatedMinutes: number;
  actionUrl: string;
}

interface AIAgendaCardProps {
  items: AIAgendaItem[];
  isLoading?: boolean;
}

const AIAgendaCard: React.FC<AIAgendaCardProps> = ({ items, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-5 col-span-full lg:col-span-2 animate-pulse">
        <div className="h-5 w-48 bg-[#22272B] rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-[#22272B] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const priorityColors = ['', 'text-red-400', 'text-orange-400', 'text-yellow-400', 'text-blue-400', 'text-white/50'];

  return (
    <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-5 col-span-full lg:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          AI-Prioritized Agenda
        </h3>
        <span className="text-[10px] px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full">
          AI Generated
        </span>
      </div>
      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="w-8 h-8 text-white/20 mx-auto mb-2" />
            <p className="text-sm text-white/40">AI is analyzing your workload...</p>
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-[#22272B]/50 hover:bg-[#22272B] transition-colors group"
            >
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                index === 0 ? 'bg-[#E40000]/20 text-[#FF4444]' : 'bg-white/10 text-white/50'
              }`}>
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white font-medium">{item.title}</p>
                <p className="text-xs text-white/40 mt-0.5 line-clamp-1">{item.rationale}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className={`text-[10px] ${priorityColors[item.priority] || 'text-white/40'}`}>
                    P{item.priority}
                  </span>
                  <span className="text-[10px] text-white/30">{item.category}</span>
                  <span className="text-[10px] text-white/30 flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    ~{item.estimatedMinutes}m
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/50 flex-shrink-0 mt-1 transition-colors" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AIAgendaCard;
