import React from 'react';
import { Video, Calendar, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';

interface Session {
  id: string;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  participants_count: number;
}

interface UpcomingSessionsCardProps {
  sessions: Session[];
}

export const UpcomingSessionsCard: React.FC<UpcomingSessionsCardProps> = ({ sessions }) => {
  const navigate = useNavigate();

  if (sessions.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Video className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Sessions</h3>
        </div>
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-300 dark:text-white/20 mx-auto mb-3" />
          <p className="text-gray-400 dark:text-gray-300 dark:text-white/40 text-sm">No upcoming sessions</p>
          <button
            onClick={() => navigate('/dashboard/instructor/sessions/new')}
            className="mt-4 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-gray-900 dark:text-white rounded-lg transition-colors text-sm font-medium"
          >
            Schedule Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Video className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Sessions</h3>
        </div>
        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs font-medium rounded-full">
          {sessions.length}
        </span>
      </div>

      <div className="space-y-3">
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => navigate(`/dashboard/instructor/sessions/${session.id}`)}
            className="p-4 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg border border-gray-100 dark:border-white/5 cursor-pointer transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-gray-900 dark:text-white font-medium text-sm mb-1">{session.title}</h4>
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-white/60">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(parseISO(session.scheduled_at), 'MMM d, h:mm a')}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {session.participants_count} participants
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-300 dark:text-white/40">{session.duration_minutes}min</span>
            </div>
          </div>
        ))}
      </div>

      {sessions.length > 0 && (
        <button
          onClick={() => navigate('/dashboard/instructor/sessions')}
          className="w-full mt-4 flex items-center justify-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          View All Sessions
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
