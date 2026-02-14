import React, { useState } from 'react';
import {
  Search, Filter, RefreshCw, Eye, AlertTriangle,
  ShieldAlert, MessageSquare, ThumbsUp, Clock,
  CheckCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import AdminPageHeader from '../../components/admin/shared/AdminPageHeader';

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------
type TabType = 'dashboard' | 'flagged' | 'safety';

type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

type FlagType = 'inappropriate' | 'off_topic' | 'harmful_content' | 'data_leak' | 'bias_detected';

type FlagStatus = 'pending' | 'reviewed' | 'dismissed' | 'escalated';

interface FlaggedConversation {
  id: string;
  student_name: string;
  student_grade: string;
  flag_type: FlagType;
  severity: SeverityLevel;
  snippet: string;
  ai_model: string;
  flagged_at: string;
  status: FlagStatus;
}

interface SafetyIncident {
  id: string;
  incident_type: string;
  description: string;
  affected_students: number;
  severity: SeverityLevel;
  occurred_at: string;
  resolved: boolean;
}

interface MonitoringStats {
  active_sessions: number;
  flagged_today: number;
  safety_violations: number;
  avg_satisfaction: number;
}

// ------------------------------------------------------------------
// Mock data
// ------------------------------------------------------------------
const mockStats: MonitoringStats = {
  active_sessions: 142,
  flagged_today: 7,
  safety_violations: 2,
  avg_satisfaction: 4.6,
};

const mockFlaggedConversations: FlaggedConversation[] = [
  {
    id: 'fc-001',
    student_name: 'Amani Wanjiku',
    student_grade: 'Grade 7',
    flag_type: 'inappropriate',
    severity: 'high',
    snippet: 'AI response contained age-inappropriate language regarding...',
    ai_model: 'Gemini Pro',
    flagged_at: '2025-01-15T14:32:00Z',
    status: 'pending',
  },
  {
    id: 'fc-002',
    student_name: 'Brian Ochieng',
    student_grade: 'Grade 5',
    flag_type: 'off_topic',
    severity: 'low',
    snippet: 'Conversation drifted to unrelated gaming topics for 15+ turns...',
    ai_model: 'Claude 3.5',
    flagged_at: '2025-01-15T13:18:00Z',
    status: 'reviewed',
  },
  {
    id: 'fc-003',
    student_name: 'Faith Njeri',
    student_grade: 'Grade 8',
    flag_type: 'harmful_content',
    severity: 'critical',
    snippet: 'Student expressed distress signals that triggered safety protocol...',
    ai_model: 'GPT-4',
    flagged_at: '2025-01-15T11:45:00Z',
    status: 'escalated',
  },
  {
    id: 'fc-004',
    student_name: 'David Kamau',
    student_grade: 'Grade 6',
    flag_type: 'bias_detected',
    severity: 'medium',
    snippet: 'AI response showed potential cultural bias in history explanation...',
    ai_model: 'Gemini Pro',
    flagged_at: '2025-01-15T10:22:00Z',
    status: 'pending',
  },
  {
    id: 'fc-005',
    student_name: 'Esther Akinyi',
    student_grade: 'Grade 4',
    flag_type: 'data_leak',
    severity: 'high',
    snippet: 'AI nearly disclosed another student\'s personal information...',
    ai_model: 'Claude 3.5',
    flagged_at: '2025-01-15T09:05:00Z',
    status: 'reviewed',
  },
  {
    id: 'fc-006',
    student_name: 'George Mwangi',
    student_grade: 'Grade 7',
    flag_type: 'off_topic',
    severity: 'low',
    snippet: 'Extended conversation about social media instead of mathematics...',
    ai_model: 'Grok',
    flagged_at: '2025-01-15T08:33:00Z',
    status: 'dismissed',
  },
  {
    id: 'fc-007',
    student_name: 'Hannah Chebet',
    student_grade: 'Grade 3',
    flag_type: 'inappropriate',
    severity: 'medium',
    snippet: 'AI used vocabulary significantly above student reading level...',
    ai_model: 'GPT-4',
    flagged_at: '2025-01-14T16:47:00Z',
    status: 'pending',
  },
];

const mockSafetyIncidents: SafetyIncident[] = [
  {
    id: 'si-001',
    incident_type: 'Content Filter Bypass',
    description: 'A prompt injection attempt was detected and blocked. The student tried to circumvent content filters.',
    affected_students: 1,
    severity: 'high',
    occurred_at: '2025-01-15T14:00:00Z',
    resolved: true,
  },
  {
    id: 'si-002',
    incident_type: 'Distress Signal',
    description: 'Student expressed emotional distress. AI triggered safety protocol and notified counselor on duty.',
    affected_students: 1,
    severity: 'critical',
    occurred_at: '2025-01-15T11:45:00Z',
    resolved: false,
  },
  {
    id: 'si-003',
    incident_type: 'Data Exposure Risk',
    description: 'AI model nearly returned PII from training context. The response was intercepted by the safety layer.',
    affected_students: 3,
    severity: 'high',
    occurred_at: '2025-01-14T09:12:00Z',
    resolved: true,
  },
  {
    id: 'si-004',
    incident_type: 'Bias Report',
    description: 'Multiple reports of culturally insensitive content in Kiswahili history module. Under investigation.',
    affected_students: 12,
    severity: 'medium',
    occurred_at: '2025-01-13T15:30:00Z',
    resolved: false,
  },
];

// ------------------------------------------------------------------
// Badge helpers
// ------------------------------------------------------------------
const severityColors: Record<SeverityLevel, string> = {
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const flagTypeLabels: Record<FlagType, string> = {
  inappropriate: 'Inappropriate',
  off_topic: 'Off Topic',
  harmful_content: 'Harmful Content',
  data_leak: 'Data Leak',
  bias_detected: 'Bias Detected',
};

const statusColors: Record<FlagStatus, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  reviewed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  dismissed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  escalated: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const SeverityBadge: React.FC<{ level: SeverityLevel }> = ({ level }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${severityColors[level]}`}
  >
    {level}
  </span>
);

const StatusBadge: React.FC<{ status: FlagStatus }> = ({ status }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${statusColors[status]}`}
  >
    {status}
  </span>
);

// ------------------------------------------------------------------
// Stats card
// ------------------------------------------------------------------
const StatsCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconColor: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}> = ({ label, value, icon, iconColor, change, changeType }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6"
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-gray-500 dark:text-white/60 text-sm">{label}</span>
      <div className={iconColor}>{icon}</div>
    </div>
    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    {change && (
      <p className={`text-xs mt-1 ${
        changeType === 'positive' ? 'text-emerald-400' :
        changeType === 'negative' ? 'text-red-400' :
        'text-gray-400 dark:text-white/40'
      }`}>
        {change}
      </p>
    )}
  </motion.div>
);

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
const formatDate = (iso: string): string => {
  return new Date(iso).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ------------------------------------------------------------------
// Main component
// ------------------------------------------------------------------
const AIMonitoringPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredConversations = mockFlaggedConversations.filter((conv) => {
    const matchesSearch =
      !search ||
      conv.student_name.toLowerCase().includes(search.toLowerCase()) ||
      conv.snippet.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = !severityFilter || conv.severity === severityFilter;
    const matchesStatus = !statusFilter || conv.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const tabs: { key: TabType; label: string; count?: number }[] = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'flagged', label: 'Flagged Conversations', count: mockFlaggedConversations.filter(c => c.status === 'pending').length },
    { key: 'safety', label: 'Safety Incidents', count: mockSafetyIncidents.filter(i => !i.resolved).length },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Header */}
        <AdminPageHeader
          title="AI Monitoring"
          subtitle="Monitor AI conversations, review flagged interactions, and manage safety incidents"
          breadcrumbs={[
            { label: 'AI Systems', path: '/dashboard/admin' },
            { label: 'Monitoring' },
          ]}
          actions={
            <button className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-[#444] transition-colors">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label="Active Sessions"
            value={mockStats.active_sessions}
            icon={<MessageSquare className="w-5 h-5" />}
            iconColor="text-blue-400"
            change="+12 from last hour"
            changeType="neutral"
          />
          <StatsCard
            label="Flagged Today"
            value={mockStats.flagged_today}
            icon={<AlertTriangle className="w-5 h-5" />}
            iconColor="text-yellow-400"
            change="-3 from yesterday"
            changeType="positive"
          />
          <StatsCard
            label="Safety Violations"
            value={mockStats.safety_violations}
            icon={<ShieldAlert className="w-5 h-5" />}
            iconColor="text-red-400"
            change="+1 from yesterday"
            changeType="negative"
          />
          <StatsCard
            label="Avg Satisfaction"
            value={`${mockStats.avg_satisfaction}/5`}
            icon={<ThumbsUp className="w-5 h-5" />}
            iconColor="text-emerald-400"
            change="+0.2 from last week"
            changeType="positive"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-[#E40000] text-gray-900 dark:text-white'
                  : 'bg-gray-100 dark:bg-[#22272B] text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-[#2A3035]'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.key ? 'bg-gray-200 dark:bg-white/20' : 'bg-[#2A3035]'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Quick overview: recent flagged */}
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Flagged Interactions</h3>
              <div className="space-y-3">
                {mockFlaggedConversations.slice(0, 4).map((conv) => (
                  <div
                    key={conv.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-lg"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#22272B] flex items-center justify-center text-gray-500 dark:text-white/60 text-xs font-bold uppercase flex-shrink-0">
                        {conv.student_name.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{conv.student_name}</p>
                        <p className="text-xs text-gray-400 dark:text-white/40 truncate">{conv.snippet}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                      <SeverityBadge level={conv.severity} />
                      <StatusBadge status={conv.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active sessions overview */}
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Session Overview</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-lg">
                  <p className="text-2xl font-bold text-blue-400">89</p>
                  <p className="text-xs text-gray-400 dark:text-white/40 mt-1">Gemini Pro</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-lg">
                  <p className="text-2xl font-bold text-purple-400">31</p>
                  <p className="text-xs text-gray-400 dark:text-white/40 mt-1">Claude 3.5</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-lg">
                  <p className="text-2xl font-bold text-emerald-400">15</p>
                  <p className="text-xs text-gray-400 dark:text-white/40 mt-1">GPT-4</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-lg">
                  <p className="text-2xl font-bold text-orange-400">7</p>
                  <p className="text-xs text-gray-400 dark:text-white/40 mt-1">Grok</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'flagged' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
                <input
                  type="text"
                  placeholder="Search by student name or snippet..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#E40000]/50 transition-colors"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="pl-10 pr-8 py-2.5 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-[#E40000]/50 transition-colors min-w-[140px]"
                >
                  <option value="">All Severity</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-[#E40000]/50 transition-colors min-w-[130px]"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="dismissed">Dismissed</option>
                <option value="escalated">Escalated</option>
              </select>
            </div>

            {/* Flagged conversations table */}
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-16">
                  <MessageSquare className="w-16 h-16 text-white/10 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Flagged Conversations</h3>
                  <p className="text-gray-400 dark:text-white/40 text-sm">No conversations match your current filters.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-[#22272B] text-left">
                        <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Student</th>
                        <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Flag Type</th>
                        <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Severity</th>
                        <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Snippet</th>
                        <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Model</th>
                        <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Flagged At</th>
                        <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Status</th>
                        <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredConversations.map((conv) => (
                        <tr
                          key={conv.id}
                          className="border-b border-gray-200 dark:border-[#22272B]/50 hover:bg-[#1E2327] transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-gray-900 dark:text-white font-medium">{conv.student_name}</p>
                              <p className="text-xs text-gray-400 dark:text-white/40">{conv.student_grade}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-gray-600 dark:text-white/70 text-xs">{flagTypeLabels[conv.flag_type]}</span>
                          </td>
                          <td className="px-4 py-3">
                            <SeverityBadge level={conv.severity} />
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-gray-500 dark:text-white/50 text-xs truncate max-w-[220px]">{conv.snippet}</p>
                          </td>
                          <td className="px-4 py-3 text-gray-500 dark:text-white/50">{conv.ai_model}</td>
                          <td className="px-4 py-3 text-gray-400 dark:text-white/40 text-xs">{formatDate(conv.flagged_at)}</td>
                          <td className="px-4 py-3">
                            <StatusBadge status={conv.status} />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                title="View Details"
                                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#22272B] text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {conv.status === 'pending' && (
                                <>
                                  <button
                                    title="Mark Reviewed"
                                    className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-gray-500 dark:text-white/50 hover:text-emerald-400 transition-colors"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    title="Escalate"
                                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 dark:text-white/50 hover:text-red-400 transition-colors"
                                  >
                                    <ShieldAlert className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'safety' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {mockSafetyIncidents.map((incident) => (
              <div
                key={incident.id}
                className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      incident.severity === 'critical' ? 'bg-red-500/20' :
                      incident.severity === 'high' ? 'bg-orange-500/20' :
                      'bg-yellow-500/20'
                    }`}>
                      <ShieldAlert className={`w-5 h-5 ${
                        incident.severity === 'critical' ? 'text-red-400' :
                        incident.severity === 'high' ? 'text-orange-400' :
                        'text-yellow-400'
                      }`} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-gray-900 dark:text-white font-semibold">{incident.incident_type}</h4>
                        <SeverityBadge level={incident.severity} />
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          incident.resolved
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}>
                          {incident.resolved ? 'Resolved' : 'Open'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-white/50 mb-2">{incident.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-white/40">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(incident.occurred_at)}
                        </span>
                        <span>{incident.affected_students} student{incident.affected_students !== 1 ? 's' : ''} affected</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      title="View Details"
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#22272B] text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {!incident.resolved && (
                      <button
                        title="Mark Resolved"
                        className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-gray-500 dark:text-white/50 hover:text-emerald-400 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </>
  );
};

export default AIMonitoringPage;
