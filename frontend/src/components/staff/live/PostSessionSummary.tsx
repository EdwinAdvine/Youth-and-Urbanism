import React from 'react';
import {
  Clock,
  Users,
  BookOpen,
  Sparkles,
  Star,
  Loader2,
} from 'lucide-react';

interface SessionSummary {
  duration: string;
  attendees: number;
  topicsDiscovered: string[];
  keyMoments: string[];
  aiNotes: string;
}

interface PostSessionSummaryProps {
  summary: SessionSummary;
  isLoading?: boolean;
}

const SkeletonLine: React.FC<{ width?: string }> = ({ width = 'w-full' }) => (
  <div className={`h-3 ${width} bg-[#22272B] rounded animate-pulse`} />
);

const PostSessionSummary: React.FC<PostSessionSummaryProps> = ({ summary, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-[#181C1F] border border-[#22272B] rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#22272B]">
          <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
          <h3 className="text-sm font-semibold text-white">Session Summary</h3>
          <span className="ml-auto flex items-center gap-1.5 text-xs text-white/40">
            <Loader2 className="w-3 h-3 animate-spin" />
            Generating...
          </span>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-[#22272B] rounded-lg animate-pulse" />
            ))}
          </div>
          <div className="space-y-2">
            <SkeletonLine width="w-1/4" />
            <SkeletonLine />
            <SkeletonLine width="w-3/4" />
          </div>
          <div className="space-y-2">
            <SkeletonLine width="w-1/4" />
            <SkeletonLine />
            <SkeletonLine width="w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#181C1F] border border-[#22272B] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#22272B]">
        <Sparkles className="w-4 h-4 text-purple-400" />
        <h3 className="text-sm font-semibold text-white">Session Summary</h3>
        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
          AI Generated
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-[#22272B]/50 border border-[#22272B]">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] uppercase tracking-wider text-white/40">Duration</span>
            </div>
            <p className="text-lg font-bold text-white">{summary.duration}</p>
          </div>
          <div className="p-3 rounded-lg bg-[#22272B]/50 border border-[#22272B]">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-3.5 h-3.5 text-green-400" />
              <span className="text-[10px] uppercase tracking-wider text-white/40">Attendees</span>
            </div>
            <p className="text-lg font-bold text-white">{summary.attendees}</p>
          </div>
        </div>

        {/* Topics Covered */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <BookOpen className="w-3.5 h-3.5 text-white/40" />
            <h4 className="text-xs font-medium text-white/60">Topics Covered</h4>
          </div>
          {summary.topicsDiscovered.length === 0 ? (
            <p className="text-xs text-white/30">No topics recorded</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {summary.topicsDiscovered.map((topic, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Key Moments */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <h4 className="text-xs font-medium text-white/60">Key Moments</h4>
          </div>
          {summary.keyMoments.length === 0 ? (
            <p className="text-xs text-white/30">No key moments recorded</p>
          ) : (
            <div className="space-y-2">
              {summary.keyMoments.map((moment, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 pl-2"
                >
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-amber-400">{index + 1}</span>
                  </span>
                  <p className="text-sm text-white/70 leading-relaxed">{moment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Notes */}
        <div className="pt-4 border-t border-[#22272B]">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <h4 className="text-xs font-medium text-white/60">AI Notes</h4>
          </div>
          <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
            <p className="text-sm text-white/70 leading-relaxed">{summary.aiNotes}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostSessionSummary;
