import React from 'react';
import { Users, Clock, CheckCircle, XCircle, UserCheck } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  joinedAt: string;
  isPresent: boolean;
}

interface AttendanceTrackerProps {
  participants: Participant[];
}

const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
};

const calculateDuration = (joinedAt: string): string => {
  const joined = new Date(joinedAt).getTime();
  const now = new Date().getTime();
  const diff = Math.max(0, now - joined);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
};

const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({ participants }) => {
  const presentCount = participants.filter((p) => p.isPresent).length;
  const absentCount = participants.length - presentCount;

  return (
    <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-200 dark:border-[#22272B]">
        <UserCheck className="w-4 h-4 text-gray-500 dark:text-white/60" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Attendance</h3>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2 p-4 pb-2">
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
          <p className="text-lg font-bold text-blue-400">{participants.length}</p>
          <p className="text-[10px] text-blue-400/60 mt-0.5">Total Joined</p>
        </div>
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
          <p className="text-lg font-bold text-green-400">{presentCount}</p>
          <p className="text-[10px] text-green-400/60 mt-0.5">Present</p>
        </div>
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-center">
          <p className="text-lg font-bold text-red-400">{absentCount}</p>
          <p className="text-[10px] text-red-400/60 mt-0.5">Left</p>
        </div>
      </div>

      {/* Participants table */}
      <div className="px-4 pb-4">
        <div className="rounded-lg border border-gray-200 dark:border-[#22272B] overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_80px_80px_70px] gap-2 px-3 py-2 bg-gray-100 dark:bg-[#22272B]/50 text-[10px] uppercase tracking-wider text-gray-400 dark:text-white/40 font-medium">
            <span>Name</span>
            <span>Joined</span>
            <span>Duration</span>
            <span className="text-center">Status</span>
          </div>

          {/* Table body */}
          <div className="divide-y divide-gray-200 dark:divide-[#22272B]">
            {participants.length === 0 ? (
              <div className="px-3 py-6 text-center">
                <Users className="w-6 h-6 text-white/10 mx-auto mb-1" />
                <p className="text-xs text-gray-400 dark:text-white/30">No participants</p>
              </div>
            ) : (
              participants.map((participant) => (
                <div
                  key={participant.id}
                  className="grid grid-cols-[1fr_80px_80px_70px] gap-2 px-3 py-2.5 items-center hover:bg-gray-100 dark:hover:bg-[#22272B]/30 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        participant.isPresent ? 'bg-green-400' : 'bg-gray-200 dark:bg-white/20'
                      }`}
                    />
                    <span className="text-sm text-gray-700 dark:text-white/80 truncate">{participant.name}</span>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-white/40 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(participant.joinedAt)}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-white/40 tabular-nums">
                    {calculateDuration(participant.joinedAt)}
                  </span>
                  <div className="flex justify-center">
                    {participant.isPresent ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-green-500/20 text-green-400">
                        <CheckCircle className="w-3 h-3" />
                        Here
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-white/40">
                        <XCircle className="w-3 h-3" />
                        Left
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTracker;
