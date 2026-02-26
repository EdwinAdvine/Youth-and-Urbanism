import React, { useState, useEffect, useCallback } from 'react';
import { Users, TrendingUp, MessageSquare, Heart, AlertCircle } from 'lucide-react';
import { getTeamPulse } from '@/services/staff/staffTeamService';
import type { TeamPulseData } from '@/types/staff';

const TeamPulsePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TeamPulseData | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getTeamPulse();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load team pulse data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112] p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-8 w-40 bg-gray-100 dark:bg-[#22272B] rounded animate-pulse" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-100 dark:bg-[#22272B] rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-gray-100 dark:bg-[#22272B] rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112] p-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-20 space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400" />
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-[#E40000] hover:bg-[#C80000] text-white text-sm rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const totalTicketsOpen = data?.members.reduce((acc, m) => acc + m.tickets_open, 0) ?? 0;
  const avgQualityScore = data?.members.length
    ? Math.round(data.members.reduce((acc, m) => acc + m.quality_score, 0) / data.members.length)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F1112] p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Team Pulse</h1>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data?.workload_balance_score ?? 0}/10
                </p>
                <p className="text-xs text-gray-400 dark:text-white/40">Workload Balance</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgQualityScore}%</p>
                <p className="text-xs text-gray-400 dark:text-white/40">Avg Quality Score</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalTicketsOpen}</p>
                <p className="text-xs text-gray-400 dark:text-white/40">Open Tickets</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Team Members {data?.team_name ? `- ${data.team_name}` : ''}
          </h2>
          <div className="space-y-2">
            {data?.members && data.members.length > 0 ? (
              data.members.map((member) => (
                <div key={member.user_id} className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-[#22272B]/50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-[#2A2F34] flex items-center justify-center text-gray-900 dark:text-white font-medium">
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white font-medium">{member.name}</p>
                    <p className="text-xs text-gray-400 dark:text-white/40">{member.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-400">
                      Quality: {member.quality_score}%
                    </p>
                    <p className="text-xs text-gray-400 dark:text-white/40">
                      {member.tickets_resolved_period} resolved / {member.tickets_open} open
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 dark:text-white/40 text-center py-4">No team members found</p>
            )}
          </div>
        </div>

        {/* AI Suggestions */}
        {data?.ai_suggestions && data.ai_suggestions.length > 0 && (
          <div className="mt-6 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Suggestions</h2>
            <div className="space-y-3">
              {data.ai_suggestions.map((suggestion, idx) => (
                <div key={idx} className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <p className="text-sm text-gray-900 dark:text-white font-medium capitalize">{suggestion.suggestion_type}</p>
                  <p className="text-xs text-gray-500 dark:text-white/60 mt-1">{suggestion.rationale}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamPulsePage;
