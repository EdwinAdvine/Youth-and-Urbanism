import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter, Video, Calendar, Users, Clock, PlayCircle } from 'lucide-react';
import { InstructorPageHeader } from '../../components/instructor/shared/InstructorPageHeader';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Session {
  id: string;
  title: string;
  description: string;
  course_id?: string;
  course_title?: string;
  scheduled_start: string;
  scheduled_end: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  participants_count: number;
  max_participants?: number;
  meeting_url?: string;
  recording_url?: string;
  created_at: string;
}

export const SessionsPage: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSessions();
  }, [statusFilter]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await axios.get(`${API_URL}/api/v1/instructor/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      // Mock data for development
      if (!response.data || response.data.length === 0) {
        setSessions([
          {
            id: '1',
            title: 'Algebra Review Session',
            description: 'Q&A session covering linear equations',
            course_id: '1',
            course_title: 'Introduction to Mathematics - Grade 7',
            scheduled_start: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            scheduled_end: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
            status: 'scheduled',
            participants_count: 0,
            max_participants: 30,
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '2',
            title: 'Writing Workshop',
            description: 'Collaborative writing exercises',
            course_id: '2',
            course_title: 'English Language & Literature',
            scheduled_start: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            scheduled_end: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
            status: 'live',
            participants_count: 18,
            max_participants: 25,
            meeting_url: '/dashboard/instructor/sessions/2/live',
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '3',
            title: 'Science Experiment Demo',
            description: 'Live demonstration of chemical reactions',
            course_id: '3',
            course_title: 'Science Experiments for Young Learners',
            scheduled_start: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            scheduled_end: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
            status: 'completed',
            participants_count: 22,
            max_participants: 25,
            recording_url: '/recordings/session-3.mp4',
            created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ]);
      } else {
        setSessions(response.data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSession = () => {
    navigate('/dashboard/instructor/sessions/create');
  };

  const handleJoinSession = (sessionId: string) => {
    navigate(`/dashboard/instructor/sessions/${sessionId}/live`);
  };

  const handleViewDetails = (sessionId: string) => {
    navigate(`/dashboard/instructor/sessions/${sessionId}`);
  };

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    total: sessions.length,
    upcoming: sessions.filter((s) => s.status === 'scheduled').length,
    live: sessions.filter((s) => s.status === 'live').length,
    completed: sessions.filter((s) => s.status === 'completed').length,
  };

  const statusConfig = {
    scheduled: {
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      label: 'Scheduled',
    },
    live: {
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      label: 'Live Now',
    },
    completed: {
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/10',
      borderColor: 'border-gray-500/30',
      label: 'Completed',
    },
    cancelled: {
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      label: 'Cancelled',
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <InstructorPageHeader
        title="Live Sessions"
        description="Schedule and host virtual classroom sessions"
        icon={<Video className="w-6 h-6 text-purple-400" />}
        actions={
          <button
            onClick={handleScheduleSession}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Schedule Session
          </button>
        }
      />

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Video className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-white/60">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-white/60">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.upcoming}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <PlayCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-white/60">Live Now</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.live}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-500/10 rounded-lg">
              <Video className="w-5 h-5 text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-white/60">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-300 dark:text-white/40" />
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500 dark:text-white/60" />
            <span className="text-sm text-gray-500 dark:text-white/60">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
            >
              <option value="all">All</option>
              <option value="scheduled">Scheduled</option>
              <option value="live">Live</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-12 text-center">
          <Video className="w-16 h-16 text-gray-400 dark:text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Sessions</h3>
          <p className="text-gray-500 dark:text-white/60 mb-6">
            {searchQuery
              ? 'No sessions match your search criteria'
              : 'Schedule your first live session to get started'}
          </p>
          {!searchQuery && (
            <button
              onClick={handleScheduleSession}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium"
            >
              Schedule Your First Session
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredSessions.map((session) => {
            const config = statusConfig[session.status];
            return (
              <div
                key={session.id}
                className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all cursor-pointer"
                onClick={() => handleViewDetails(session.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-3 py-1 rounded-lg border ${config.bgColor} ${config.borderColor} ${config.color} text-sm font-medium flex items-center gap-2`}
                      >
                        {session.status === 'live' && (
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        )}
                        {config.label}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-300 dark:text-white/40">{session.course_title}</span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{session.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-white/60 mb-3">{session.description}</p>

                    <div className="flex items-center gap-4 flex-wrap text-sm text-gray-500 dark:text-white/60">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(session.scheduled_start), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>
                          {format(new Date(session.scheduled_start), 'h:mm a')} -{' '}
                          {format(new Date(session.scheduled_end), 'h:mm a')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>
                          {session.participants_count}
                          {session.max_participants && `/${session.max_participants}`} participants
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div>
                    {session.status === 'live' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinSession(session.id);
                        }}
                        className="px-6 py-3 bg-green-500 hover:bg-green-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                      >
                        <PlayCircle className="w-5 h-5" />
                        Join Live
                      </button>
                    )}
                    {session.status === 'scheduled' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(session.id);
                        }}
                        className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium"
                      >
                        View Details
                      </button>
                    )}
                    {session.status === 'completed' && session.recording_url && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(session.id);
                        }}
                        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium"
                      >
                        View Recording
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
