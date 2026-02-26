import React from 'react';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { Video, Users, Clock, Wifi, Hand, MonitorPlay } from 'lucide-react';

const activeSessions = [
  { id: '1', title: 'Mathematics: Fractions Deep Dive', instructor: 'Ms. Wanjiku', participants: 18, startedAt: '10 min ago', subject: 'Math' },
  { id: '2', title: 'Science Lab: Water Cycle Experiment', instructor: 'Mr. Ochieng', participants: 24, startedAt: '25 min ago', subject: 'Science' },
];

const JoinLivePage: React.FC = () => {
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Join Live Session</h1>
        <p className="text-gray-600 dark:text-white/70">Active sessions happening right now</p>
      </div>

      {/* Connection Status */}
      <div className={`p-3 bg-green-500/10 ${borderRadius} border border-green-500/20 flex items-center gap-2`}>
        <Wifi className="w-4 h-4 text-green-400" />
        <span className="text-green-400 text-sm">Your connection is stable - ready to join!</span>
      </div>

      {/* Active Sessions */}
      {activeSessions.length > 0 ? (
        <div className="space-y-4">
          {activeSessions.map((session) => (
            <div key={session.id} className={`p-6 bg-white dark:bg-[#181C1F] ${borderRadius} border border-green-500/30 relative overflow-hidden`}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-400" />
              <div className="flex items-center gap-2 mb-1">
                <span className="flex items-center gap-1 text-green-400 text-xs"><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> LIVE NOW</span>
              </div>
              <h3 className="text-gray-900 dark:text-white font-semibold text-lg mt-2">{session.title}</h3>
              <p className="text-gray-400 dark:text-white/40 text-sm mt-1">{session.instructor}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-white/50">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {session.participants} joined</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Started {session.startedAt}</span>
              </div>
              <div className="flex gap-3 mt-4">
                <button className={`flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-gray-900 dark:text-white font-medium ${borderRadius} flex items-center justify-center gap-2`}>
                  <Video className="w-5 h-5" /> Join with Video
                </button>
                <button className={`px-6 py-3 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white ${borderRadius} flex items-center gap-2`}>
                  <MonitorPlay className="w-5 h-5" /> Watch Only
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`p-12 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center`}>
          <Video className="w-12 h-12 text-gray-400 dark:text-gray-300 dark:text-white/20 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-white/60 mb-2">No live sessions right now</p>
          <p className="text-gray-400 dark:text-white/40 text-sm">Check the schedule for upcoming sessions</p>
        </div>
      )}

      {/* Quick Tips */}
      <div className={`p-4 bg-blue-500/10 ${borderRadius} border border-blue-500/20`}>
        <h3 className="text-gray-900 dark:text-white font-medium mb-2">Session Tips</h3>
        <ul className="space-y-1 text-gray-500 dark:text-white/60 text-sm">
          <li className="flex items-center gap-2"><Hand className="w-3 h-3 text-blue-400" /> Use the hand raise button to ask questions</li>
          <li className="flex items-center gap-2"><Video className="w-3 h-3 text-blue-400" /> Keep your camera on when possible</li>
          <li className="flex items-center gap-2"><Users className="w-3 h-3 text-blue-400" /> Be respectful to your classmates</li>
        </ul>
      </div>
    </div>
  );
};

export default JoinLivePage;
