import React from 'react';
import { Users, AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StudentFlag {
  id: string;
  studentName: string;
  flagType: 'at_risk' | 'attendance' | 'performance' | 'behavior';
  description: string;
  riskScore: number;
}

interface StudentFlagsCardProps {
  flags: StudentFlag[];
  isLoading?: boolean;
}

const StudentFlagsCard: React.FC<StudentFlagsCardProps> = ({ flags, isLoading }) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-5 animate-pulse">
        <div className="h-5 w-36 bg-[#22272B] rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-[#22272B] rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const flagTypeConfig: Record<string, { color: string; label: string }> = {
    at_risk: { color: 'text-red-400 bg-red-500/20', label: 'At Risk' },
    attendance: { color: 'text-orange-400 bg-orange-500/20', label: 'Attendance' },
    performance: { color: 'text-yellow-400 bg-yellow-500/20', label: 'Performance' },
    behavior: { color: 'text-purple-400 bg-purple-500/20', label: 'Behavior' },
  };

  return (
    <div className="bg-[#181C1F] border border-[#22272B] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-orange-400" />
          Student Flags
        </h3>
        <span className="text-xs text-white/40">{flags.length} active</span>
      </div>
      <div className="space-y-2">
        {flags.length === 0 ? (
          <p className="text-sm text-white/40 text-center py-4">No active flags</p>
        ) : (
          flags.slice(0, 4).map((flag) => {
            const config = flagTypeConfig[flag.flagType] || flagTypeConfig.at_risk;
            return (
              <button
                key={flag.id}
                onClick={() => navigate(`/dashboard/staff/support/journeys/${flag.id}`)}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-[#22272B]/50 hover:bg-[#22272B] transition-colors text-left"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white">{flag.studentName}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${config.color}`}>
                      {config.label}
                    </span>
                    <span className="text-[10px] text-white/40 truncate">{flag.description}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  <AlertTriangle className={`w-3 h-3 ${flag.riskScore > 0.7 ? 'text-red-400' : 'text-yellow-400'}`} />
                  <span className="text-[10px] text-white/40">{Math.round(flag.riskScore * 100)}%</span>
                </div>
              </button>
            );
          })
        )}
      </div>
      {flags.length > 4 && (
        <button
          onClick={() => navigate('/dashboard/staff/support/journeys?filter=flagged')}
          className="mt-3 text-xs text-[#FF4444] hover:text-[#FF6666] transition-colors flex items-center gap-1"
        >
          View all flags <ArrowRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

export default StudentFlagsCard;
