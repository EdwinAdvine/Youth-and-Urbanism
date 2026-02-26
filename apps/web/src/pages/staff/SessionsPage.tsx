import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  X,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  getSessions,
  createSession,
  updateSession,
  getRecordings,
} from '@/services/staff/staffSessionService';
import type { LiveSession, LiveSessionRecording } from '@/types/staff';
import type {
  CreateSessionPayload,
  UpdateSessionPayload,
} from '@/services/staff/staffSessionService';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  live: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  ended: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const typeColors: Record<string, string> = {
  class: 'bg-[#E40000]/20 text-red-400 border-red-500/30',
  meeting: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  tutoring: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'recordings'>('upcoming');
  const [search, setSearch] = useState('');

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newSession, setNewSession] = useState<CreateSessionPayload>({
    title: '',
    description: '',
    session_type: 'class',
    max_participants: 30,
    scheduled_at: '',
    recording_enabled: true,
    screen_share_enabled: true,
    grade_level: '',
  });

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSession, setEditingSession] = useState<LiveSession | null>(null);
  const [editData, setEditData] = useState<UpdateSessionPayload>({});
  const [saving, setSaving] = useState(false);

  // Details modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailSession, setDetailSession] = useState<LiveSession | null>(null);

  // Recording modal state
  const [showRecordingModal, setShowRecordingModal] = useState(false);
  const [recordings, setRecordings] = useState<LiveSessionRecording[]>([]);
  const [loadingRecordings, setLoadingRecordings] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const statusFilter =
        activeTab === 'upcoming' ? 'scheduled' :
        activeTab === 'past' ? 'ended' :
        undefined;
      const response = await getSessions({
        page: currentPage,
        page_size: 10,
        status: statusFilter,
      });
      setSessions(response.items);
      setTotalPages(response.total_pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, [currentPage, activeTab]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      !search ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.host.name.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const upcomingCount = sessions.filter((s) => s.status === 'scheduled').length;
  const liveCount = sessions.filter((s) => s.status === 'live').length;
  const endedCount = sessions.filter((s) => s.status === 'ended').length;
  const recordingsCount = sessions.filter((s) => s.recording_enabled).length;

  const handleCreateSession = async () => {
    if (!newSession.title.trim() || !newSession.scheduled_at) return;
    try {
      setCreating(true);
      setCreateError(null);
      const created = await createSession(newSession);
      setSessions((prev) => [created, ...prev]);
      setShowCreateModal(false);
      setNewSession({
        title: '',
        description: '',
        session_type: 'class',
        max_participants: 30,
        scheduled_at: '',
        recording_enabled: true,
        screen_share_enabled: true,
        grade_level: '',
      });
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create session');
    } finally {
      setCreating(false);
    }
  };

  const handleEditSession = (session: LiveSession) => {
    setEditingSession(session);
    setEditData({
      title: session.title,
      description: session.description || '',
      session_type: session.session_type,
      max_participants: session.max_participants,
      scheduled_at: session.scheduled_at,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingSession) return;
    try {
      setSaving(true);
      const updated = await updateSession(editingSession.id, editData);
      setSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setShowEditModal(false);
      setEditingSession(null);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to update session');
    } finally {
      setSaving(false);
    }
  };

  const handleViewRecording = async (sessionId: string) => {
    try {
      setLoadingRecordings(true);
      const recs = await getRecordings(sessionId);
      setRecordings(recs);
      setShowRecordingModal(true);
    } catch {
      // If no recordings found, show empty state
      setRecordings([]);
      setShowRecordingModal(true);
    } finally {
      setLoadingRecordings(false);
    }
  };

  const handleJoinSession = (sessionId: string) => {
    navigate(`/dashboard/staff/learning/sessions/${sessionId}/live`);
  };

  const handleViewDetails = (session: LiveSession) => {
    setDetailSession(session);
    setShowDetailsModal(true);
  };

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

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-gray-400 dark:text-white/40 text-sm mb-4">{error}</p>
          <button
            onClick={fetchSessions}
            className="px-4 py-2 bg-[#E40000]/20 text-[#FF4444] rounded-lg hover:bg-[#E40000]/30 text-sm"
          >
            Retry
          </button>
        </div>
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
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#E40000] hover:bg-[#C80000] text-gray-900 dark:text-white text-sm rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Schedule Session
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Upcoming', value: upcomingCount, icon: Calendar, color: 'text-blue-400' },
          { label: 'In Progress', value: liveCount, icon: Radio, color: 'text-emerald-400' },
          { label: 'Completed', value: endedCount, icon: CheckCircle, color: 'text-gray-400' },
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
                        <span className="block text-xs text-gray-400 dark:text-white/40">
                          {session.course_title || 'No course'} {session.grade_level ? `- ${session.grade_level}` : ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-white/60">{session.host.name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border capitalize ${typeColors[session.session_type] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                        {session.session_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-gray-500 dark:text-white/60">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">{formatDate(session.scheduled_at)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-gray-400 dark:text-white/40" />
                        <span className="text-gray-500 dark:text-white/60 text-xs">
                          {session.current_participants}/{session.max_participants}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${statusColors[session.status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                        {session.status === 'live' ? 'Live' : session.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {session.status === 'live' && (
                          <button
                            onClick={() => handleJoinSession(session.id)}
                            className="flex items-center gap-1 px-2.5 py-1 text-xs bg-[#E40000] hover:bg-[#C80000] text-gray-900 dark:text-white rounded-lg transition-colors"
                          >
                            <Play className="w-3 h-3" />Join
                          </button>
                        )}
                        {session.recording_enabled && session.status === 'ended' && (
                          <button
                            onClick={() => handleViewRecording(session.id)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#22272B] text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors"
                            title="View Recording"
                          >
                            <Film className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleViewDetails(session)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#22272B] text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {session.status === 'scheduled' && (
                          <button
                            onClick={() => handleEditSession(session)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#22272B] text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors"
                            title="Edit"
                          >
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
            Showing {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''} (page {currentPage} of {totalPages})
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#22272B] text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-lg text-xs font-medium bg-[#E40000] text-gray-900 dark:text-white">{currentPage}</button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#22272B] text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Schedule Session</h2>
              <button
                onClick={() => { setShowCreateModal(false); setCreateError(null); }}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#22272B] text-gray-400 dark:text-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400">
                {createError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 dark:text-white/40 mb-1">Title *</label>
                <input
                  type="text"
                  value={newSession.title}
                  onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                  placeholder="Session title..."
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#E40000]/50 placeholder-white/30"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 dark:text-white/40 mb-1">Description</label>
                <textarea
                  value={newSession.description || ''}
                  onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                  placeholder="Brief description..."
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#E40000]/50 resize-none placeholder-white/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 dark:text-white/40 mb-1">Type</label>
                  <select
                    value={newSession.session_type}
                    onChange={(e) => setNewSession({ ...newSession, session_type: e.target.value as CreateSessionPayload['session_type'] })}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="class">Class</option>
                    <option value="tutoring">Tutoring</option>
                    <option value="meeting">Meeting</option>
                    <option value="workshop">Workshop</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 dark:text-white/40 mb-1">Max Participants</label>
                  <input
                    type="number"
                    min={1}
                    value={newSession.max_participants || 30}
                    onChange={(e) => setNewSession({ ...newSession, max_participants: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 dark:text-white/40 mb-1">Scheduled At *</label>
                  <input
                    type="datetime-local"
                    value={newSession.scheduled_at}
                    onChange={(e) => setNewSession({ ...newSession, scheduled_at: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 dark:text-white/40 mb-1">Grade Level</label>
                  <input
                    type="text"
                    value={newSession.grade_level || ''}
                    onChange={(e) => setNewSession({ ...newSession, grade_level: e.target.value })}
                    placeholder="e.g. Grade 5"
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none placeholder-white/30"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newSession.recording_enabled ?? true}
                    onChange={(e) => setNewSession({ ...newSession, recording_enabled: e.target.checked })}
                    className="accent-[#E40000]"
                  />
                  <span className="text-xs text-gray-500 dark:text-white/60">Enable Recording</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newSession.screen_share_enabled ?? true}
                    onChange={(e) => setNewSession({ ...newSession, screen_share_enabled: e.target.checked })}
                    className="accent-[#E40000]"
                  />
                  <span className="text-xs text-gray-500 dark:text-white/60">Screen Share</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                onClick={() => { setShowCreateModal(false); setCreateError(null); }}
                className="px-4 py-2 text-sm text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSession}
                disabled={creating || !newSession.title.trim() || !newSession.scheduled_at}
                className="flex items-center gap-2 px-4 py-2 bg-[#E40000] hover:bg-[#C80000] text-white text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Session Modal */}
      {showEditModal && editingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Session</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#22272B] text-gray-400 dark:text-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 dark:text-white/40 mb-1">Title</label>
                <input
                  type="text"
                  value={editData.title || ''}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#E40000]/50"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 dark:text-white/40 mb-1">Description</label>
                <textarea
                  value={editData.description || ''}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none focus:border-[#E40000]/50 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 dark:text-white/40 mb-1">Type</label>
                  <select
                    value={editData.session_type || editingSession.session_type}
                    onChange={(e) => setEditData({ ...editData, session_type: e.target.value as UpdateSessionPayload['session_type'] })}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="class">Class</option>
                    <option value="tutoring">Tutoring</option>
                    <option value="meeting">Meeting</option>
                    <option value="workshop">Workshop</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 dark:text-white/40 mb-1">Max Participants</label>
                  <input
                    type="number"
                    min={1}
                    value={editData.max_participants || editingSession.max_participants}
                    onChange={(e) => setEditData({ ...editData, max_participants: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 dark:text-white/40 mb-1">Scheduled At</label>
                <input
                  type="datetime-local"
                  value={editData.scheduled_at || editingSession.scheduled_at.slice(0, 16)}
                  onChange={(e) => setEditData({ ...editData, scheduled_at: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-900 dark:text-white text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-sm text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-[#E40000] hover:bg-[#C80000] text-white text-sm rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit3 className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && detailSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl w-full max-w-lg mx-4 p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Session Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#22272B] text-gray-400 dark:text-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-base font-medium text-gray-900 dark:text-white">{detailSession.title}</h3>
                {detailSession.description && (
                  <p className="text-sm text-gray-500 dark:text-white/50 mt-1">{detailSession.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-100 dark:bg-[#22272B]/50 rounded-lg">
                  <p className="text-[10px] text-gray-400 dark:text-white/40 mb-0.5">Host</p>
                  <p className="text-sm text-gray-900 dark:text-white">{detailSession.host.name}</p>
                </div>
                <div className="p-3 bg-gray-100 dark:bg-[#22272B]/50 rounded-lg">
                  <p className="text-[10px] text-gray-400 dark:text-white/40 mb-0.5">Type</p>
                  <p className="text-sm text-gray-900 dark:text-white capitalize">{detailSession.session_type}</p>
                </div>
                <div className="p-3 bg-gray-100 dark:bg-[#22272B]/50 rounded-lg">
                  <p className="text-[10px] text-gray-400 dark:text-white/40 mb-0.5">Status</p>
                  <p className="text-sm text-gray-900 dark:text-white capitalize">{detailSession.status}</p>
                </div>
                <div className="p-3 bg-gray-100 dark:bg-[#22272B]/50 rounded-lg">
                  <p className="text-[10px] text-gray-400 dark:text-white/40 mb-0.5">Participants</p>
                  <p className="text-sm text-gray-900 dark:text-white">{detailSession.current_participants}/{detailSession.max_participants}</p>
                </div>
                <div className="p-3 bg-gray-100 dark:bg-[#22272B]/50 rounded-lg">
                  <p className="text-[10px] text-gray-400 dark:text-white/40 mb-0.5">Scheduled</p>
                  <p className="text-sm text-gray-900 dark:text-white">{formatDate(detailSession.scheduled_at)}</p>
                </div>
                <div className="p-3 bg-gray-100 dark:bg-[#22272B]/50 rounded-lg">
                  <p className="text-[10px] text-gray-400 dark:text-white/40 mb-0.5">Recording</p>
                  <p className="text-sm text-gray-900 dark:text-white">{detailSession.recording_enabled ? 'Enabled' : 'Disabled'}</p>
                </div>
              </div>

              {detailSession.grade_level && (
                <p className="text-xs text-gray-400 dark:text-white/40">Grade Level: {detailSession.grade_level}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 text-sm text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Close
              </button>
              {detailSession.status === 'live' && (
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleJoinSession(detailSession.id);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#E40000] hover:bg-[#C80000] text-white text-sm rounded-lg transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Join Session
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recording Modal */}
      {showRecordingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recordings</h2>
              <button
                onClick={() => setShowRecordingModal(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#22272B] text-gray-400 dark:text-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingRecordings ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400 dark:text-white/40" />
              </div>
            ) : recordings.length === 0 ? (
              <div className="text-center py-8">
                <Film className="w-10 h-10 text-white/10 mx-auto mb-2" />
                <p className="text-sm text-gray-400 dark:text-white/40">No recordings available</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recordings.map((rec) => (
                  <div key={rec.id} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-[#22272B]/50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white">{rec.format.toUpperCase()} Recording</p>
                      <p className="text-xs text-gray-400 dark:text-white/40">
                        {rec.duration_seconds ? `${Math.round(rec.duration_seconds / 60)} min` : 'Duration unknown'}
                        {rec.file_size_bytes ? ` | ${(rec.file_size_bytes / 1048576).toFixed(1)} MB` : ''}
                      </p>
                    </div>
                    <a
                      href={rec.recording_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#E40000] hover:bg-[#C80000] text-white text-xs rounded-lg transition-colors"
                    >
                      <Play className="w-3 h-3" />
                      Play
                    </a>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-end mt-4">
              <button
                onClick={() => setShowRecordingModal(false)}
                className="px-4 py-2 text-sm text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SessionsPage;
