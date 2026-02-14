import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  Bot,
  Plus,
  Trash2,
} from 'lucide-react';
import AdminPageHeader from '../../components/admin/shared/AdminPageHeader';
import AdminStatsCard from '../../components/admin/shared/AdminStatsCard';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type ModerationTab = 'queue' | 'keywords' | 'history';

interface ModerationItem {
  id: string;
  content_type: 'forum_post' | 'chat_message' | 'profile_update' | 'course_review';
  snippet: string;
  reason: string;
  ai_confidence: number;
  status: 'pending' | 'approved' | 'rejected';
  reporter: string;
  created_at: string;
}

interface KeywordFilter {
  id: string;
  keyword: string;
  category: 'profanity' | 'spam' | 'harassment' | 'misinformation' | 'custom';
  action: 'block' | 'flag' | 'warn';
  matches_count: number;
  active: boolean;
}

interface ModerationHistory {
  id: string;
  content_type: string;
  action: 'approved' | 'rejected';
  moderator: string;
  reason: string;
  timestamp: string;
}

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

const MOCK_QUEUE: ModerationItem[] = [
  { id: 'MOD-001', content_type: 'forum_post', snippet: 'This course is terrible and the instructor should be fired...', reason: 'AI flagged: negative sentiment + aggressive language', ai_confidence: 87, status: 'pending', reporter: 'Auto-detection', created_at: '2025-01-15T10:30:00Z' },
  { id: 'MOD-002', content_type: 'chat_message', snippet: 'Hey, check out this link for free answers to all exams...', reason: 'AI flagged: potential spam / cheating', ai_confidence: 92, status: 'pending', reporter: 'Auto-detection', created_at: '2025-01-15T09:45:00Z' },
  { id: 'MOD-003', content_type: 'course_review', snippet: 'I would rate this 1 star. Complete waste of money...', reason: 'User report: suspected fake review', ai_confidence: 45, status: 'pending', reporter: 'Jane Wanjiku', created_at: '2025-01-15T08:20:00Z' },
  { id: 'MOD-004', content_type: 'profile_update', snippet: 'Bio updated with promotional content and external links', reason: 'AI flagged: spam content in profile', ai_confidence: 78, status: 'pending', reporter: 'Auto-detection', created_at: '2025-01-15T07:00:00Z' },
  { id: 'MOD-005', content_type: 'forum_post', snippet: 'Can someone share their login details so I can access premium?', reason: 'AI flagged: account sharing attempt', ai_confidence: 95, status: 'pending', reporter: 'Auto-detection', created_at: '2025-01-14T22:15:00Z' },
];

const MOCK_KEYWORDS: KeywordFilter[] = [
  { id: 'KW-001', keyword: 'free answers', category: 'spam', action: 'block', matches_count: 23, active: true },
  { id: 'KW-002', keyword: 'share login', category: 'spam', action: 'flag', matches_count: 8, active: true },
  { id: 'KW-003', keyword: 'exam answers', category: 'misinformation', action: 'flag', matches_count: 45, active: true },
  { id: 'KW-004', keyword: 'password sharing', category: 'spam', action: 'block', matches_count: 12, active: true },
  { id: 'KW-005', keyword: 'hate speech', category: 'harassment', action: 'block', matches_count: 3, active: true },
  { id: 'KW-006', keyword: 'buy cheap', category: 'spam', action: 'warn', matches_count: 67, active: false },
];

const MOCK_HISTORY: ModerationHistory[] = [
  { id: 'MH-001', content_type: 'forum_post', action: 'rejected', moderator: 'Admin', reason: 'Contained promotional spam', timestamp: '2025-01-15T09:00:00Z' },
  { id: 'MH-002', content_type: 'chat_message', action: 'approved', moderator: 'Admin', reason: 'False positive - legitimate question', timestamp: '2025-01-15T08:30:00Z' },
  { id: 'MH-003', content_type: 'course_review', action: 'approved', moderator: 'Admin', reason: 'Legitimate negative feedback', timestamp: '2025-01-14T16:00:00Z' },
  { id: 'MH-004', content_type: 'profile_update', action: 'rejected', moderator: 'Admin', reason: 'Spam bio content removed', timestamp: '2025-01-14T14:30:00Z' },
  { id: 'MH-005', content_type: 'forum_post', action: 'rejected', moderator: 'Admin', reason: 'Account sharing solicitation', timestamp: '2025-01-14T12:00:00Z' },
];

/* ------------------------------------------------------------------ */
/* Badge helpers                                                       */
/* ------------------------------------------------------------------ */

const contentTypeColors: Record<string, string> = {
  forum_post: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  chat_message: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  profile_update: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  course_review: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

const ContentTypeBadge: React.FC<{ type: string }> = ({ type }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${
      contentTypeColors[type] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }`}
  >
    {type.replace('_', ' ')}
  </span>
);

const categoryColors: Record<string, string> = {
  profanity: 'bg-red-500/20 text-red-400 border-red-500/30',
  spam: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  harassment: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  misinformation: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  custom: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const actionColors: Record<string, string> = {
  block: 'bg-red-500/20 text-red-400 border-red-500/30',
  flag: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  warn: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

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

const ModerationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ModerationTab>('queue');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [queue, setQueue] = useState(MOCK_QUEUE);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const handleApprove = (id: string) => {
    setQueue((prev) => prev.map((item) => item.id === id ? { ...item, status: 'approved' as const } : item));
  };

  const handleReject = (id: string) => {
    setQueue((prev) => prev.map((item) => item.id === id ? { ...item, status: 'rejected' as const } : item));
  };

  const pendingCount = queue.filter((q) => q.status === 'pending').length;
  const aiFlaggedCount = queue.filter((q) => q.ai_confidence > 70).length;

  const tabs: { key: ModerationTab; label: string }[] = [
    { key: 'queue', label: 'Queue' },
    { key: 'keywords', label: 'Keyword Filters' },
    { key: 'history', label: 'History' },
  ];

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
        <div className="h-16 bg-[#22272B] rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-[#22272B] rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-80 bg-[#22272B] rounded-xl animate-pulse" />
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
      <AdminPageHeader
        title="Content Moderation"
        subtitle="Review flagged content, manage keyword filters, and moderation history"
        breadcrumbs={[
          { label: 'Operations', path: '/dashboard/admin' },
          { label: 'Moderation' },
        ]}
        actions={
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-[#22272B] border border-[#333] rounded-lg text-white/70 hover:text-white hover:border-[#444] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        }
      />

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AdminStatsCard
          title="Pending Review"
          value={pendingCount}
          icon={<Shield className="w-5 h-5" />}
          trend={{ value: 3, label: 'new today', direction: 'up' }}
        />
        <AdminStatsCard
          title="AI Flagged"
          value={aiFlaggedCount}
          icon={<Bot className="w-5 h-5" />}
          trend={{ value: 85, label: 'avg confidence', direction: 'neutral' }}
        />
        <AdminStatsCard
          title="Reviewed Today"
          value={MOCK_HISTORY.length}
          icon={<CheckCircle className="w-5 h-5" />}
          trend={{ value: 12, label: 'vs yesterday', direction: 'up' }}
        />
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex gap-1 bg-[#181C1F] border border-[#22272B] rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-[#E40000] text-white'
                : 'text-white/50 hover:text-white hover:bg-[#22272B]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          placeholder="Search content..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#181C1F] border border-[#22272B] rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#E40000]/50 transition-colors"
        />
      </motion.div>

      {/* Tab Content */}
      <motion.div variants={itemVariants} className="bg-[#181C1F] border border-[#22272B] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === 'queue' && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#22272B] text-left">
                  <th className="px-4 py-3 text-white/60 font-medium">Content Type</th>
                  <th className="px-4 py-3 text-white/60 font-medium">Snippet</th>
                  <th className="px-4 py-3 text-white/60 font-medium">Reason</th>
                  <th className="px-4 py-3 text-white/60 font-medium">AI Confidence</th>
                  <th className="px-4 py-3 text-white/60 font-medium">Status</th>
                  <th className="px-4 py-3 text-white/60 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((item) => (
                  <tr key={item.id} className="border-b border-[#22272B]/50 hover:bg-[#1E2327] transition-colors">
                    <td className="px-4 py-3"><ContentTypeBadge type={item.content_type} /></td>
                    <td className="px-4 py-3">
                      <p className="text-white/70 text-sm truncate max-w-[300px]">{item.snippet}</p>
                    </td>
                    <td className="px-4 py-3 text-white/50 text-xs max-w-[200px]">{item.reason}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-[#22272B] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.ai_confidence > 80 ? 'bg-red-400' : item.ai_confidence > 60 ? 'bg-yellow-400' : 'bg-blue-400'
                            }`}
                            style={{ width: `${item.ai_confidence}%` }}
                          />
                        </div>
                        <span className="text-xs text-white/60">{item.ai_confidence}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${
                        item.status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : item.status === 'rejected'
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button title="View" className="p-1.5 rounded-lg hover:bg-[#22272B] text-white/50 hover:text-white transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        {item.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(item.id)}
                              title="Approve"
                              className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-white/50 hover:text-emerald-400 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(item.id)}
                              title="Reject"
                              className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/50 hover:text-red-400 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'keywords' && (
            <div>
              <div className="p-4 border-b border-[#22272B] flex items-center justify-between">
                <h3 className="text-sm font-medium text-white">Keyword Filters</h3>
                <button className="flex items-center gap-2 px-3 py-1.5 text-xs bg-[#E40000] rounded-lg text-white hover:bg-[#C00] transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                  Add Keyword
                </button>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#22272B] text-left">
                    <th className="px-4 py-3 text-white/60 font-medium">Keyword</th>
                    <th className="px-4 py-3 text-white/60 font-medium">Category</th>
                    <th className="px-4 py-3 text-white/60 font-medium">Action</th>
                    <th className="px-4 py-3 text-white/60 font-medium">Matches</th>
                    <th className="px-4 py-3 text-white/60 font-medium">Active</th>
                    <th className="px-4 py-3 text-white/60 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_KEYWORDS.map((kw) => (
                    <tr key={kw.id} className="border-b border-[#22272B]/50 hover:bg-[#1E2327] transition-colors">
                      <td className="px-4 py-3 text-white font-mono text-sm">{kw.keyword}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${
                          categoryColors[kw.category] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                        }`}>
                          {kw.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${
                          actionColors[kw.action] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                        }`}>
                          {kw.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/60">{kw.matches_count}</td>
                      <td className="px-4 py-3">
                        <span className={`w-2 h-2 rounded-full inline-block ${kw.active ? 'bg-emerald-400' : 'bg-gray-500'}`} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button title="Delete" className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/50 hover:text-red-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'history' && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#22272B] text-left">
                  <th className="px-4 py-3 text-white/60 font-medium">Timestamp</th>
                  <th className="px-4 py-3 text-white/60 font-medium">Content Type</th>
                  <th className="px-4 py-3 text-white/60 font-medium">Action</th>
                  <th className="px-4 py-3 text-white/60 font-medium">Moderator</th>
                  <th className="px-4 py-3 text-white/60 font-medium">Reason</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_HISTORY.map((entry) => (
                  <tr key={entry.id} className="border-b border-[#22272B]/50 hover:bg-[#1E2327] transition-colors">
                    <td className="px-4 py-3 text-white/60">{formatDate(entry.timestamp)}</td>
                    <td className="px-4 py-3">
                      <span className="text-white/70 capitalize">{entry.content_type.replace('_', ' ')}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        entry.action === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border-red-500/30'
                      }`}>
                        {entry.action === 'approved' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {entry.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/60">{entry.moderator}</td>
                    <td className="px-4 py-3 text-white/50">{entry.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ModerationPage;
