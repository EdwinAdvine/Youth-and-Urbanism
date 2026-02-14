import React, { useState } from 'react';
import {
  ShieldBan,
  AlertTriangle,
  Eye,
  CheckCircle,
  AlertCircle,
  Ban,
  UserX,
  MessageSquareWarning,
  Check,
  X,
  Search,
  Filter,
} from 'lucide-react';
import { motion } from 'framer-motion';
import AdminPageHeader from '../../components/admin/shared/AdminPageHeader';

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

type TabType = 'active' | 'appeals' | 'watchlist';
type RestrictionType = 'ban' | 'suspension' | 'warning';
type AppealStatus = 'pending' | 'approved' | 'denied';

interface Restriction {
  id: string;
  user_name: string;
  user_email: string;
  user_role: string;
  type: RestrictionType;
  reason: string;
  details: string;
  issued_by: string;
  issued_at: Date;
  expires_at: Date | null;
  is_active: boolean;
}

interface Appeal {
  id: string;
  restriction_id: string;
  user_name: string;
  user_email: string;
  restriction_type: RestrictionType;
  appeal_reason: string;
  submitted_at: Date;
  status: AppealStatus;
  reviewed_by: string | null;
}

interface WatchListEntry {
  id: string;
  user_name: string;
  user_email: string;
  user_role: string;
  reason: string;
  risk_level: 'high' | 'medium' | 'low';
  flags: string[];
  added_at: Date;
  added_by: string;
}

// ------------------------------------------------------------------
// Badge helpers
// ------------------------------------------------------------------

const restrictionTypeConfig: Record<RestrictionType, { label: string; color: string; bgColor: string; borderColor: string; icon: React.ReactNode }> = {
  ban: {
    label: 'Ban',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30',
    icon: <Ban className="w-4 h-4 text-red-400" />,
  },
  suspension: {
    label: 'Suspension',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/30',
    icon: <UserX className="w-4 h-4 text-orange-400" />,
  },
  warning: {
    label: 'Warning',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/30',
    icon: <MessageSquareWarning className="w-4 h-4 text-yellow-400" />,
  },
};

const riskLevelConfig: Record<string, { label: string; className: string }> = {
  high: { label: 'High', className: 'bg-red-500/20 text-red-400 border border-red-500/30' },
  medium: { label: 'Medium', className: 'bg-orange-500/20 text-orange-400 border border-orange-500/30' },
  low: { label: 'Low', className: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' },
};

// ------------------------------------------------------------------
// Mock data
// ------------------------------------------------------------------

const now = Date.now();
const hours = (h: number) => new Date(now - h * 60 * 60 * 1000);
const days = (d: number) => new Date(now - d * 24 * 60 * 60 * 1000);
const futureDays = (d: number) => new Date(now + d * 24 * 60 * 60 * 1000);

const mockRestrictions: Restriction[] = [
  {
    id: 'rst_001',
    user_name: 'Peter Kiprotich',
    user_email: 'peter.kiprotich@example.com',
    user_role: 'student',
    type: 'ban',
    reason: 'Repeated harassment of other students in forum',
    details: 'Multiple reports from 5 different users over 2 weeks. Warnings ignored.',
    issued_by: 'Admin: Edwin Odhiambo',
    issued_at: days(5),
    expires_at: null,
    is_active: true,
  },
  {
    id: 'rst_002',
    user_name: 'Jane Muthoni',
    user_email: 'jane.muthoni@example.com',
    user_role: 'student',
    type: 'suspension',
    reason: 'Sharing assessment answers in group chat',
    details: 'Screenshots provided by instructor showing answer sharing for Grade 6 Mathematics exam.',
    issued_by: 'Admin: Mary Wanjiku',
    issued_at: days(2),
    expires_at: futureDays(12),
    is_active: true,
  },
  {
    id: 'rst_003',
    user_name: 'Tom Odhiambo',
    user_email: 'tom.odhiambo@example.com',
    user_role: 'instructor',
    type: 'suspension',
    reason: 'Uploading inappropriate course material',
    details: 'Content flagged by automated system and confirmed by admin review.',
    issued_by: 'Admin: Edwin Odhiambo',
    issued_at: days(1),
    expires_at: futureDays(29),
    is_active: true,
  },
  {
    id: 'rst_004',
    user_name: 'Fatma Hassan',
    user_email: 'fatma.hassan@example.com',
    user_role: 'student',
    type: 'warning',
    reason: 'Misuse of AI Tutor: Asking off-topic personal questions',
    details: 'AI tutor session logs show persistent non-educational queries. First warning issued.',
    issued_by: 'System (Auto-detect)',
    issued_at: hours(12),
    expires_at: futureDays(30),
    is_active: true,
  },
  {
    id: 'rst_005',
    user_name: 'David Kimani',
    user_email: 'david.kimani@example.com',
    user_role: 'parent',
    type: 'warning',
    reason: 'Abusive language in support ticket',
    details: 'Ticket #4521 contained threatening language towards support staff.',
    issued_by: 'Staff: Daniel Mwangi',
    issued_at: days(3),
    expires_at: futureDays(27),
    is_active: true,
  },
];

const mockAppeals: Appeal[] = [
  {
    id: 'app_001',
    restriction_id: 'rst_001',
    user_name: 'Peter Kiprotich',
    user_email: 'peter.kiprotich@example.com',
    restriction_type: 'ban',
    appeal_reason: 'I apologize for my behavior and have understood the community guidelines. I would like a second chance to continue my studies. I am preparing for my KCPE exams.',
    submitted_at: days(3),
    status: 'pending',
    reviewed_by: null,
  },
  {
    id: 'app_002',
    restriction_id: 'rst_002',
    user_name: 'Jane Muthoni',
    user_email: 'jane.muthoni@example.com',
    restriction_type: 'suspension',
    appeal_reason: 'I did not share answers intentionally. My study group was discussing concepts and the screenshots were taken out of context. I can provide clarification.',
    submitted_at: days(1),
    status: 'pending',
    reviewed_by: null,
  },
  {
    id: 'app_003',
    restriction_id: 'rst_005',
    user_name: 'David Kimani',
    user_email: 'david.kimani@example.com',
    restriction_type: 'warning',
    appeal_reason: 'I was frustrated because my payment was not processed for 2 weeks. I should not have used that language and I apologize to the support team.',
    submitted_at: hours(6),
    status: 'pending',
    reviewed_by: null,
  },
];

const mockWatchList: WatchListEntry[] = [
  {
    id: 'wl_001',
    user_name: 'Brian Omondi',
    user_email: 'brian.omondi@example.com',
    user_role: 'student',
    reason: 'Multiple login attempts from different locations within short time',
    risk_level: 'high',
    flags: ['Suspicious IP', 'VPN detected', 'Failed logins'],
    added_at: hours(4),
    added_by: 'System (Security)',
  },
  {
    id: 'wl_002',
    user_name: 'Lucy Wambui',
    user_email: 'lucy.wambui@example.com',
    user_role: 'student',
    reason: 'Unusual AI tutor usage pattern: 200+ requests in 1 hour',
    risk_level: 'medium',
    flags: ['High API usage', 'Automated pattern'],
    added_at: hours(8),
    added_by: 'System (AI Monitor)',
  },
  {
    id: 'wl_003',
    user_name: 'Patrick Njeru',
    user_email: 'patrick.njeru@example.com',
    user_role: 'instructor',
    reason: 'Course content similarity score of 94% with external source',
    risk_level: 'medium',
    flags: ['Plagiarism risk', 'Content review needed'],
    added_at: days(2),
    added_by: 'System (Content Check)',
  },
  {
    id: 'wl_004',
    user_name: 'Susan Chelimo',
    user_email: 'susan.chelimo@example.com',
    user_role: 'parent',
    reason: 'Repeated failed payment attempts with different M-Pesa numbers',
    risk_level: 'low',
    flags: ['Payment anomaly'],
    added_at: days(3),
    added_by: 'System (Payments)',
  },
];

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hoursDiff = Math.floor(minutes / 60);
  if (hoursDiff < 24) return `${hoursDiff}h ago`;
  const daysDiff = Math.floor(hoursDiff / 24);
  if (daysDiff < 30) return `${daysDiff}d ago`;
  return date.toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ------------------------------------------------------------------
// Tab button component
// ------------------------------------------------------------------

const TabButton: React.FC<{
  tab: TabType;
  activeTab: TabType;
  label: string;
  icon: React.ReactNode;
  count: number;
  onClick: (tab: TabType) => void;
}> = ({ tab, activeTab, label, icon, count, onClick }) => (
  <button
    onClick={() => onClick(tab)}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      activeTab === tab
        ? 'bg-[#E40000] text-gray-900 dark:text-white'
        : 'bg-gray-100 dark:bg-[#22272B] text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-[#2A3035]'
    }`}
  >
    {icon}
    {label}
    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
      activeTab === tab ? 'bg-gray-200 dark:bg-white/20' : 'bg-[#2A3035]'
    }`}>
      {count}
    </span>
  </button>
);

// ------------------------------------------------------------------
// Main component
// ------------------------------------------------------------------

const RestrictionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [restrictions, setRestrictions] = useState(mockRestrictions);
  const [appeals, setAppeals] = useState(mockAppeals);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<RestrictionType | ''>('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLiftRestriction = (id: string) => {
    if (!confirm('Are you sure you want to lift this restriction?')) return;
    setRestrictions((prev) =>
      prev.map((r) => (r.id === id ? { ...r, is_active: false } : r))
    );
    showToast('Restriction lifted successfully', 'success');
  };

  const handleApproveAppeal = (id: string) => {
    setAppeals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'approved' as const, reviewed_by: 'Admin' } : a))
    );
    // Also lift the associated restriction
    const appeal = appeals.find((a) => a.id === id);
    if (appeal) {
      setRestrictions((prev) =>
        prev.map((r) => (r.id === appeal.restriction_id ? { ...r, is_active: false } : r))
      );
    }
    showToast('Appeal approved and restriction lifted', 'success');
  };

  const handleDenyAppeal = (id: string) => {
    setAppeals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'denied' as const, reviewed_by: 'Admin' } : a))
    );
    showToast('Appeal denied', 'success');
  };

  const activeRestrictions = restrictions.filter((r) => r.is_active);
  const pendingAppeals = appeals.filter((a) => a.status === 'pending');

  const filteredRestrictions = activeRestrictions.filter((r) => {
    const matchesSearch = !search || r.user_name.toLowerCase().includes(search.toLowerCase()) || r.user_email.toLowerCase().includes(search.toLowerCase());
    const matchesType = !typeFilter || r.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <AdminPageHeader
          title="Restrictions"
          subtitle="Manage user restrictions, appeals, and security watch list"
          breadcrumbs={[{ label: 'Restrictions' }]}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 dark:text-white/60 text-sm">Active Restrictions</span>
              <ShieldBan className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeRestrictions.length}</p>
            <p className="text-xs text-gray-400 dark:text-white/40 mt-1">
              {activeRestrictions.filter((r) => r.type === 'ban').length} bans,{' '}
              {activeRestrictions.filter((r) => r.type === 'suspension').length} suspensions
            </p>
          </div>
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 dark:text-white/60 text-sm">Pending Appeals</span>
              <AlertTriangle className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingAppeals.length}</p>
            <p className="text-xs text-gray-400 dark:text-white/40 mt-1">Awaiting admin review</p>
          </div>
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 dark:text-white/60 text-sm">Watch List</span>
              <Eye className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockWatchList.length}</p>
            <p className="text-xs text-gray-400 dark:text-white/40 mt-1">
              {mockWatchList.filter((w) => w.risk_level === 'high').length} high risk
            </p>
          </div>
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 dark:text-white/60 text-sm">Warnings Issued</span>
              <MessageSquareWarning className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {activeRestrictions.filter((r) => r.type === 'warning').length}
            </p>
            <p className="text-xs text-gray-400 dark:text-white/40 mt-1">Active warnings</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <TabButton tab="active" activeTab={activeTab} label="Active Restrictions" icon={<ShieldBan className="w-4 h-4" />} count={activeRestrictions.length} onClick={setActiveTab} />
          <TabButton tab="appeals" activeTab={activeTab} label="Appeals Queue" icon={<AlertTriangle className="w-4 h-4" />} count={pendingAppeals.length} onClick={setActiveTab} />
          <TabButton tab="watchlist" activeTab={activeTab} label="Watch List" icon={<Eye className="w-4 h-4" />} count={mockWatchList.length} onClick={setActiveTab} />
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Active Restrictions Tab */}
          {activeTab === 'active' && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#E40000]/50 transition-colors"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as RestrictionType | '')}
                    className="pl-10 pr-8 py-2.5 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-[#E40000]/50 transition-colors min-w-[160px]"
                  >
                    <option value="">All Types</option>
                    <option value="ban">Bans</option>
                    <option value="suspension">Suspensions</option>
                    <option value="warning">Warnings</option>
                  </select>
                </div>
              </div>

              {/* Restrictions Table */}
              <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden">
                {filteredRestrictions.length === 0 ? (
                  <div className="text-center py-16">
                    <ShieldBan className="w-16 h-16 text-white/10 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Active Restrictions</h3>
                    <p className="text-gray-400 dark:text-white/40 text-sm">No matching restrictions found.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-[#22272B] text-left">
                          <th className="px-6 py-3 text-gray-500 dark:text-white/60 font-medium">Type</th>
                          <th className="px-6 py-3 text-gray-500 dark:text-white/60 font-medium">User</th>
                          <th className="px-6 py-3 text-gray-500 dark:text-white/60 font-medium">Reason</th>
                          <th className="px-6 py-3 text-gray-500 dark:text-white/60 font-medium">Issued</th>
                          <th className="px-6 py-3 text-gray-500 dark:text-white/60 font-medium">Expires</th>
                          <th className="px-6 py-3 text-gray-500 dark:text-white/60 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRestrictions.map((restriction) => {
                          const config = restrictionTypeConfig[restriction.type];
                          return (
                            <tr
                              key={restriction.id}
                              className="border-b border-gray-200 dark:border-[#22272B]/50 hover:bg-[#1E2327] transition-colors"
                            >
                              <td className="px-6 py-3">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color} border ${config.borderColor}`}>
                                  {config.icon}
                                  {config.label}
                                </span>
                              </td>
                              <td className="px-6 py-3">
                                <div>
                                  <span className="text-gray-900 dark:text-white font-medium">{restriction.user_name}</span>
                                  <p className="text-[11px] text-gray-400 dark:text-white/30">{restriction.user_email}</p>
                                </div>
                              </td>
                              <td className="px-6 py-3">
                                <p className="text-gray-500 dark:text-white/60 max-w-[250px] truncate">{restriction.reason}</p>
                              </td>
                              <td className="px-6 py-3">
                                <div>
                                  <span className="text-gray-400 dark:text-white/40 text-xs">{timeAgo(restriction.issued_at)}</span>
                                  <p className="text-[10px] text-gray-400 dark:text-gray-300 dark:text-white/20">{restriction.issued_by}</p>
                                </div>
                              </td>
                              <td className="px-6 py-3">
                                {restriction.expires_at ? (
                                  <span className="text-gray-400 dark:text-white/40 text-xs">
                                    {formatDate(restriction.expires_at)}
                                  </span>
                                ) : (
                                  <span className="text-red-400 text-xs font-medium">Permanent</span>
                                )}
                              </td>
                              <td className="px-6 py-3">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => handleLiftRestriction(restriction.id)}
                                    className="px-3 py-1.5 rounded-lg text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
                                  >
                                    Lift
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Appeals Queue Tab */}
          {activeTab === 'appeals' && (
            <div className="space-y-3">
              {pendingAppeals.length === 0 ? (
                <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl text-center py-16">
                  <AlertTriangle className="w-16 h-16 text-white/10 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Pending Appeals</h3>
                  <p className="text-gray-400 dark:text-white/40 text-sm">All appeals have been reviewed.</p>
                </div>
              ) : (
                appeals.map((appeal) => {
                  const config = restrictionTypeConfig[appeal.restriction_type];
                  return (
                    <motion.div
                      key={appeal.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-white dark:bg-[#181C1F] border rounded-xl p-5 ${
                        appeal.status === 'pending'
                          ? 'border-gray-200 dark:border-[#22272B]'
                          : appeal.status === 'approved'
                          ? 'border-emerald-500/20 opacity-60'
                          : 'border-red-500/20 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                          {config.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{appeal.user_name}</h4>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${config.bgColor} ${config.color} border ${config.borderColor}`}>
                              {config.label}
                            </span>
                            {appeal.status === 'pending' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                Pending Review
                              </span>
                            ) : appeal.status === 'approved' ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                Approved
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                                Denied
                              </span>
                            )}
                          </div>

                          {/* Appeal reason */}
                          <div className="bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-lg p-3 mt-2">
                            <p className="text-xs text-gray-400 dark:text-white/30 mb-1 font-medium">Appeal Statement:</p>
                            <p className="text-sm text-gray-500 dark:text-white/60 leading-relaxed">{appeal.appeal_reason}</p>
                          </div>

                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-white/30">
                            <span>{appeal.user_email}</span>
                            <span>Submitted {timeAgo(appeal.submitted_at)}</span>
                          </div>
                        </div>

                        {appeal.status === 'pending' && (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => handleApproveAppeal(appeal.id)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleDenyAppeal(appeal.id)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                              Deny
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          )}

          {/* Watch List Tab */}
          {activeTab === 'watchlist' && (
            <div className="space-y-3">
              {mockWatchList.length === 0 ? (
                <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl text-center py-16">
                  <Eye className="w-16 h-16 text-white/10 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Watch List Empty</h3>
                  <p className="text-gray-400 dark:text-white/40 text-sm">No users are currently being monitored.</p>
                </div>
              ) : (
                mockWatchList.map((entry) => {
                  const risk = riskLevelConfig[entry.risk_level];
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-white dark:bg-[#181C1F] border rounded-xl p-5 ${
                        entry.risk_level === 'high'
                          ? 'border-red-500/20'
                          : 'border-gray-200 dark:border-[#22272B]'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#22272B] flex items-center justify-center text-gray-500 dark:text-white/60 text-sm font-bold uppercase flex-shrink-0">
                          {entry.user_name.slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{entry.user_name}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${risk.className}`}>
                              {risk.label} Risk
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-[#22272B] text-gray-400 dark:text-white/40 capitalize">
                              {entry.user_role}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-white/50">{entry.reason}</p>

                          {/* Flags */}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {entry.flags.map((flag) => (
                              <span
                                key={flag}
                                className="px-2 py-0.5 text-[10px] rounded bg-gray-100 dark:bg-[#22272B] text-gray-400 dark:text-white/40 border border-gray-300 dark:border-[#333]"
                              >
                                {flag}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400 dark:text-white/30">
                            <span>{entry.user_email}</span>
                            <span>Added {timeAgo(entry.added_at)}</span>
                            <span>by {entry.added_by}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => showToast('Restriction issued', 'success')}
                            className="px-3 py-1.5 rounded-lg text-xs bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors"
                          >
                            Restrict
                          </button>
                          <button
                            onClick={() => showToast('Removed from watch list', 'success')}
                            className="px-3 py-1.5 rounded-lg text-xs bg-gray-100 dark:bg-[#22272B] text-gray-500 dark:text-white/50 border border-gray-300 dark:border-[#333] hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-[#444] transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          )}
        </motion.div>

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 animate-slide-in-bottom">
            <div
              className={`flex items-center gap-3 px-5 py-3 rounded-lg shadow-xl ${
                toast.type === 'success'
                  ? 'bg-emerald-500 text-gray-900 dark:text-white'
                  : 'bg-red-500 text-gray-900 dark:text-white'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default RestrictionsPage;
