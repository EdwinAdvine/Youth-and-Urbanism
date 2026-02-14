import React from 'react';
import { Sparkles, CheckCircle, XCircle } from 'lucide-react';

interface RubricBreakdown {
  criteria: string;
  score: number;
  maxScore: number;
}

interface AIGradingResult {
  score: number;
  feedback: string;
  competencyMet: boolean;
  rubricBreakdown: RubricBreakdown[];
}

interface AIGradingPanelProps {
  result: AIGradingResult;
  isLoading?: boolean;
}

const SkeletonLine: React.FC<{ width?: string }> = ({ width = 'w-full' }) => (
  <div className={`h-3 ${width} bg-[#22272B] rounded animate-pulse`} />
);

const AIGradingPanel: React.FC<AIGradingPanelProps> = ({ result, isLoading = false }) => {
  const totalMaxScore = result.rubricBreakdown.reduce((acc, r) => acc + r.maxScore, 0);
  const totalScore = result.rubricBreakdown.reduce((acc, r) => acc + r.score, 0);
  const overallPercentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;

  const getScoreColor = (percentage: number): string => {
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-amber-400';
    if (percentage >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getBarColor = (score: number, maxScore: number): string => {
    const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
    if (pct >= 80) return 'bg-green-400';
    if (pct >= 60) return 'bg-amber-400';
    if (pct >= 40) return 'bg-orange-400';
    return 'bg-red-400';
  };

  if (isLoading) {
    return (
      <div className="bg-[#181C1F] border border-[#22272B] rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#22272B]">
          <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
          <span className="text-sm font-semibold text-white">AI Grading</span>
          <span className="ml-auto text-xs text-white/40 animate-pulse">Analyzing...</span>
        </div>
        <div className="p-5 space-y-4">
          {/* Score skeleton */}
          <div className="flex justify-center py-4">
            <div className="w-20 h-20 rounded-full bg-[#22272B] animate-pulse" />
          </div>
          {/* Rubric skeleton */}
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1.5">
                <SkeletonLine width="w-1/3" />
                <SkeletonLine />
              </div>
            ))}
          </div>
          {/* Feedback skeleton */}
          <div className="space-y-1.5 pt-2">
            <SkeletonLine width="w-1/4" />
            <SkeletonLine />
            <SkeletonLine width="w-3/4" />
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
        <h3 className="text-sm font-semibold text-white">AI Grading Result</h3>
        <span className="ml-auto">
          {result.competencyMet ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500/20 text-green-400 border border-green-500/30">
              <CheckCircle className="w-3 h-3" />
              Competency Met
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/20 text-red-400 border border-red-500/30">
              <XCircle className="w-3 h-3" />
              Not Yet Met
            </span>
          )}
        </span>
      </div>

      <div className="p-5">
        {/* Overall Score */}
        <div className="flex justify-center mb-6">
          <div className="relative w-24 h-24">
            {/* Background ring */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#22272B"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={
                  overallPercentage >= 80 ? '#4ade80' :
                  overallPercentage >= 60 ? '#fbbf24' :
                  overallPercentage >= 40 ? '#fb923c' : '#f87171'
                }
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(overallPercentage / 100) * 264} 264`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-bold ${getScoreColor(overallPercentage)}`}>
                {result.score}
              </span>
              <span className="text-[10px] text-white/40">/ 100</span>
            </div>
          </div>
        </div>

        {/* Rubric Breakdown */}
        <div className="mb-5">
          <h4 className="text-xs font-medium text-white/60 mb-3">Rubric Breakdown</h4>
          <div className="space-y-3">
            {result.rubricBreakdown.map((item, index) => {
              const pct = item.maxScore > 0 ? (item.score / item.maxScore) * 100 : 0;
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/80">{item.criteria}</span>
                    <span className="text-xs text-white/50 tabular-nums">
                      {item.score}/{item.maxScore}
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#22272B] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getBarColor(item.score, item.maxScore)}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Feedback */}
        <div className="pt-4 border-t border-[#22272B]">
          <h4 className="text-xs font-medium text-white/60 mb-2">AI Feedback</h4>
          <p className="text-sm text-white/70 leading-relaxed">{result.feedback}</p>
        </div>
      </div>
    </div>
  );
};

export default AIGradingPanel;
