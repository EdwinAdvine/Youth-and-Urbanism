import React from 'react';
import { Video, Info, Mic, MicOff, VideoOff, Users, Monitor } from 'lucide-react';

interface LiveClassRoomProps {
  sessionId: string;
  token?: string;
}

interface ParticipantTile {
  id: string;
  name: string;
  initials: string;
  isMuted: boolean;
  isVideoOff: boolean;
}

const MOCK_PARTICIPANTS: ParticipantTile[] = [
  { id: 'p1', name: 'Instructor - Alice', initials: 'IA', isMuted: false, isVideoOff: false },
  { id: 'p2', name: 'Brian Ochieng', initials: 'BO', isMuted: true, isVideoOff: false },
  { id: 'p3', name: 'Catherine Mwangi', initials: 'CM', isMuted: true, isVideoOff: true },
  { id: 'p4', name: 'David Kamau', initials: 'DK', isMuted: false, isVideoOff: true },
];

const LiveClassRoom: React.FC<LiveClassRoomProps> = ({ sessionId, token: _token }) => {
  return (
    <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 dark:border-[#22272B]">
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-[#E40000]" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Live Classroom</h3>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E40000]/20 text-[#E40000] text-[10px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E40000] animate-pulse" />
            LIVE
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-white/40">
          <Users className="w-3.5 h-3.5" />
          <span>{MOCK_PARTICIPANTS.length} participants</span>
          <span className="text-gray-400 dark:text-gray-300 dark:text-white/20">|</span>
          <span>Session: {sessionId}</span>
        </div>
      </div>

      {/* LiveKit notice */}
      <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border-b border-blue-500/20">
        <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
        <span className="text-xs text-blue-400">
          LiveKit room component will mount here when @livekit/components-react is installed
        </span>
      </div>

      {/* Video Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {MOCK_PARTICIPANTS.map((participant) => (
            <div
              key={participant.id}
              className="relative aspect-video bg-gray-100 dark:bg-[#22272B]/60 border border-gray-200 dark:border-[#22272B] rounded-lg overflow-hidden flex items-center justify-center group"
            >
              {participant.isVideoOff ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-full bg-[#333] flex items-center justify-center">
                    <span className="text-lg font-semibold text-gray-500 dark:text-white/60">
                      {participant.initials}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-white/40">{participant.name}</span>
                </div>
              ) : (
                <>
                  {/* Simulated video placeholder */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#22272B] to-gray-100 dark:to-[#181C1F]" />
                  <div className="relative flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-full bg-[#333] flex items-center justify-center ring-2 ring-[#E40000]/30">
                      <span className="text-lg font-semibold text-gray-600 dark:text-white/70">
                        {participant.initials}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-white/50">{participant.name}</span>
                  </div>
                </>
              )}

              {/* Status indicators */}
              <div className="absolute bottom-2 left-2 flex items-center gap-1">
                <span className="p-1 rounded bg-black/40">
                  {participant.isMuted ? (
                    <MicOff className="w-3 h-3 text-red-400" />
                  ) : (
                    <Mic className="w-3 h-3 text-green-400" />
                  )}
                </span>
                {participant.isVideoOff && (
                  <span className="p-1 rounded bg-black/40">
                    <VideoOff className="w-3 h-3 text-red-400" />
                  </span>
                )}
              </div>

              {/* Name tag */}
              <div className="absolute bottom-2 right-2">
                <span className="px-1.5 py-0.5 rounded bg-black/50 text-[10px] text-gray-600 dark:text-white/70">
                  {participant.name.split(' ')[0]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls bar */}
      <div className="flex items-center justify-center gap-3 px-5 py-4 border-t border-gray-200 dark:border-[#22272B] bg-[#1a1f23]">
        <button className="p-3 rounded-full bg-gray-100 dark:bg-[#22272B] hover:bg-[#333] text-gray-900 dark:text-white transition-colors">
          <Mic className="w-5 h-5" />
        </button>
        <button className="p-3 rounded-full bg-gray-100 dark:bg-[#22272B] hover:bg-[#333] text-gray-900 dark:text-white transition-colors">
          <Video className="w-5 h-5" />
        </button>
        <button className="p-3 rounded-full bg-gray-100 dark:bg-[#22272B] hover:bg-[#333] text-gray-900 dark:text-white transition-colors">
          <Monitor className="w-5 h-5" />
        </button>
        <button className="p-3 rounded-full bg-[#E40000] hover:bg-[#E40000]/90 text-gray-900 dark:text-white transition-colors ml-3">
          <span className="text-xs font-medium px-2">Leave</span>
        </button>
      </div>
    </div>
  );
};

export default LiveClassRoom;
