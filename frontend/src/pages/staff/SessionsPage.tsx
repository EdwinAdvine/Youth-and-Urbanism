import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Video,
  Plus,
  Search,
  Calendar,
  Users,
  Play,
  Eye,
  Edit3,
  Clock,
  Radio,
  CheckCircle,
  Film,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface Session {
  id: string;
  title: string;
  host: string;
  type: 'live_class' | 'webinar' | 'tutorial' | 'workshop';
  scheduled_time: string;
  duration_minutes: number;
  participants: number;
  max_participants: number;
  status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
  recording_url?: string;
  subject: string;
  grade_level: string;
}

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

const MOCK_SESSIONS: Session[] = [
  { id: 'SES-001', title: 'Grade 5 Science - The Water Cycle', host: 'Mr. James Odhiambo', type: 'live_class', scheduled_time: '2025-01-16T09:00:00Z', duration_minutes: 45, participants: 28, max_participants: 35, status: 'upcoming', subject: 'Science', grade_level: 'Grade 5' },
  { id: 'SES-002', title: 'CBC Mathematics Workshop - Fractions', host: 'Ms. Faith Wanjiku', type: 'workshop', scheduled_time: '2025-01-15T14:00:00Z', duration_minutes: 60, participants: 32, max_participants: 40, status: 'in_progress', subject: 'Mathematics', grade_level: 'Grade 4' },
  { id: 'SES-003', title: 'Kiswahili Literature Discussion', host: 'Mr. Peter Kamau', type: 'tutorial', scheduled_time: '2025-01-15T10:00:00Z', duration_minutes: 40, participants: 22, max_participants: 30, status: 'completed', recording_url: '/recordings/ses-003.mp4', subject: 'Kiswahili', grade_level: 'Grade 7' },
  { id: 'SES-004', title: 'Parent Orientation: AI Tutor Features', host: 'Ms. Grace Njeri', type: 'webinar', scheduled_time: '2025-01-17T18:00:00Z', duration_minutes: 30, participants: 0, max_participants: 100, status: 'upcoming', subject: 'General', grade_level: 'All' },
  { id: 'SES-005', title: 'Grade 3 English - Creative Writing', host: 'Ms. Amina Hassan', type: 'live_class', scheduled_time: '2025-01-14T09:00:00Z', duration_minutes: 45, participants: 25, max_participants: 30, status: 'completed', recording_url: '/recordings/ses-005.mp4', subject: 'English', grade_level: 'Grade 3' },
  { id: 'SES-006', title: 'Environmental Activities - Planting Trees', host: 'Mr. David Mwangi', type: 'tutorial', scheduled_time: '2025-01-16T11:00:00Z', duration_minutes: 50, participants: 18, max_participants: 25, status: 'upcoming', subject: 'Environmental', grade_level: 'Grade 6' },
  { id: 'SES-007', title: 'Music & Creative Arts - Nyatiti Basics', host: 'Mr. Otieno Silas', type: 'workshop', scheduled_time: '2025-01-13T14:00:00Z', duration_minutes: 60, participants: 15, max_participants: 20, status: 'completed', recording_url: '/recordings/ses-007.mp4', subject: 'Creative Arts', grade_level: 'Grade 8' },
  { id: 'SES-008', title: 'Grade 2 Numeracy - Counting & Patterns', host: 'Ms. Lucy Achieng', type: 'live_class', scheduled_time: '2025-01-15T08:30:00Z', duration_minutes: 35, participants: 30, max_participants: 30, status: 'in_progress', subject: 'Mathematics', grade_level: 'Grade 2' },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const statusColors: Record<string, string> = {
  upcoming: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  in_progress: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  completed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const typeColors: Record<string, string> = {
  live_class: 'bg-[#E40000]/20 text-red-400 border-red-500/30',
  webinar: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  tutorial: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  workshop: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const SessionsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'recordings'>('upcoming');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const upcomingCount = MOCK_SESSIONS.filter((s) => s.status === 'upcoming').length;
  const inProgressCount = MOCK_SESSIONS.filter((s) => s.status === 'in_progress').length;
  const completedCount = MOCK_SESSIONS.filter((s) => s.status === 'completed').length;
  const recordingsCount = MOCK_SESSIONS.filter((s) => s.recording_url).length;

  const filteredSessions = MOCK_SESSIONS.filter((s) => {
    const matchesSearch =
      !search ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.host.toLowerCase().includes(search.toLowerCase());
    if (activeTab === 'upcoming') return matchesSearch && (s.status === 'upcoming' || s.status === 'in_progress');
    if (activeTab === 'past') return matchesSearch && s.status === 'completed';
    if (activeTab === 'recordings') return matchesSearch && !!s.recording_url;
    return matchesSearch;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-gray-100 dark:bg-[#22272B] rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-gray-100 dark:bg-[#22272B] rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-80 bg-gray-100 dark:bg-[#22272B] rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sessions & Live Delivery</h1>
          <p className="text-sm text-gray-500 dark:text-white/50 mt-1">Manage live classes, workshops, and recordings</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#E40000] hover:bg-[#C80000] text-gray-900 dark:text-white text-sm rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          Schedule Session
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Upcoming', value: upcomingCount, icon: Calendar, color: 'text-blue-400' },
          { label: 'In Progress', value: inProgressCount, icon: Radio, color: 'text-emerald-400' },
          { label: 'Completed', value: completedCount, icon: CheckCircle, color: 'text-gray-400' },
          { label: 'Recordings', value: recordingsCount, icon: Film, color: 'text-purple-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 dark:text-white/50 text-xs font-medium">{stat.label}</span>
              <div className={`p-1.5 bg-gray-100 dark:bg-[#22272B] rounded-lg ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Tabs + Search */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex gap-1 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg p-1">
          {(['upcoming', 'past', 'recordings'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm rounded-md transition-colors capitalize ${
                activeTab === tab ? 'bg-gray-100 dark:bg-[#22272B] text-gray-900 dark:text-white' : 'text-gray-500 dark:text-white/50 hover:text-gray-600 dark:hover:text-white/70'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
          <input
            type="text"
            placeholder="Search sessions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#E40000]/50 transition-colors"
          />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#22272B] text-left">
                <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Title</th>
                <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Host</th>
                <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Type</th>
                <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Scheduled</th>
                <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Participants</th>
                <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Status</th>
                <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <Video className="w-12 h-12 text-white/10 mx-auto mb-3" />
                    <p className="text-gray-400 dark:text-white/40 text-sm">No sessions found</p>
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => (
                  <tr
                    key={session.id}
                    className="border-b border-gray-200 dark:border-[#22272B]/50 hover:bg-[#1E2327] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <span className="text-gray-900 dark:text-white font-medium">{session.title}</span>
                        <span className="block text-xs text-gray-400 dark:text-white/40">{session.subject} - {session.grade_level}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-white/60">{session.host}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border capitalize ${typeColors[session.type]}`}>
                        {session.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-gray-500 dark:text-white/60">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">{formatDate(session.scheduled_time)}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 dark:text-white/30">{session.duration_minutes} min</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-gray-400 dark:text-white/40" />
                        <span className="text-gray-500 dark:text-white/60 text-xs">
                          {session.participants}/{session.max_participants}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${statusColors[session.status]}`}>
                        {session.status === 'in_progress' ? 'Live' : session.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {session.status === 'in_progress' && (
                          <button className="flex items-center gap-1 px-2.5 py-1 text-xs bg-[#E40000] hover:bg-[#C80000] text-gray-900 dark:text-white rounded-lg transition-colors">
                            <Play className="w-3 h-3" />Join
                          </button>
                        )}
                        {session.recording_url && (
                          <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#22272B] text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors" title="View Recording">
                            <Film className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#22272B] text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors" title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
                        {session.status === 'upcoming' && (
                          <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#22272B] text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors" title="Edit">
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-[#22272B]">
          <p className="text-xs text-gray-400 dark:text-white/40">
            Showing {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#22272B] text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 transition-colors" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-lg text-xs font-medium bg-[#E40000] text-gray-900 dark:text-white">1</button>
            <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#22272B] text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 transition-colors" disabled>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SessionsPage;
