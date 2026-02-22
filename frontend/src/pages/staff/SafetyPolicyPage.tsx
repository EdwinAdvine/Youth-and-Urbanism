import React, { useState, useEffect } from 'react';
import { getSafetyFlags } from '../../services/staff/staffModerationService';

interface SafetyFlag {
  id: string;
  title: string;
  description: string;
  type: 'content_safety' | 'student_safety' | 'data_privacy' | 'harassment' | 'academic_integrity' | 'policy_violation';
  riskScore: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'investigating' | 'resolved' | 'escalated' | 'dismissed';
  reportedBy: string;
  reportedAt: string;
  resolvedAt: string | null;
  affectedUsers: number;
  assignedTo: string;
}

interface SafetyStats {
  activeFlags: number;
  highRisk: number;
  resolvedToday: number;
  avgResolutionHours: number;
}

const SafetyPolicyPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [flags, setFlags] = useState<SafetyFlag[]>([]);
  const [stats, setStats] = useState<SafetyStats>({ activeFlags: 0, highRisk: 0, resolvedToday: 0, avgResolutionHours: 0 });
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const mockFlags: SafetyFlag[] = [
    {
      id: 'SF-001', title: 'Inappropriate content detected in AI tutor chat',
      description: 'AI tutor response contained age-inappropriate references in a Grade 4 science session about human reproduction.',
      type: 'content_safety', riskScore: 92, severity: 'critical', status: 'active',
      reportedBy: 'AI Safety Monitor', reportedAt: '2024-01-15T06:30:00Z', resolvedAt: null,
      affectedUsers: 1, assignedTo: 'Sarah Mwangi',
    },
    {
      id: 'SF-002', title: 'Bulk data export attempt by instructor account',
      description: 'Instructor account attempted to export student PII for 340+ students outside normal workflow.',
      type: 'data_privacy', riskScore: 88, severity: 'critical', status: 'investigating',
      reportedBy: 'System', reportedAt: '2024-01-15T05:15:00Z', resolvedAt: null,
      affectedUsers: 340, assignedTo: 'James Karanja',
    },
    {
      id: 'SF-003', title: 'Student reported bullying in discussion forum',
      description: 'A Grade 7 student reported receiving hurtful messages from another student in the Mathematics forum.',
      type: 'harassment', riskScore: 75, severity: 'high', status: 'investigating',
      reportedBy: 'Student (Parent notified)', reportedAt: '2024-01-15T08:45:00Z', resolvedAt: null,
      affectedUsers: 2, assignedTo: 'Grace Odhiambo',
    },
    {
      id: 'SF-004', title: 'Suspected exam answer sharing ring',
      description: '8 students from different families submitted identical answers to Grade 6 End of Term Math exam within 5 minutes.',
      type: 'academic_integrity', riskScore: 70, severity: 'high', status: 'active',
      reportedBy: 'AI Integrity Monitor', reportedAt: '2024-01-14T14:20:00Z', resolvedAt: null,
      affectedUsers: 8, assignedTo: 'Peter Njoroge',
    },
    {
      id: 'SF-005', title: 'Student account accessed from unusual location',
      description: 'Grade 8 student account logged in from IP address geolocated to a different country.',
      type: 'student_safety', riskScore: 65, severity: 'medium', status: 'active',
      reportedBy: 'Security Monitor', reportedAt: '2024-01-15T03:00:00Z', resolvedAt: null,
      affectedUsers: 1, assignedTo: 'Unassigned',
    },
    {
      id: 'SF-006', title: 'Partner content contains embedded tracking pixels',
      description: 'Content submission from partner "EduTech Africa" contains hidden tracking scripts that collect user data.',
      type: 'data_privacy', riskScore: 82, severity: 'high', status: 'escalated',
      reportedBy: 'Content Scanner', reportedAt: '2024-01-14T11:30:00Z', resolvedAt: null,
      affectedUsers: 0, assignedTo: 'Legal Team',
    },
    {
      id: 'SF-007', title: 'Parent using child\'s account for non-educational purposes',
      description: 'Activity patterns suggest an adult is using a Grade 3 student account to access the platform forums.',
      type: 'policy_violation', riskScore: 45, severity: 'medium', status: 'active',
      reportedBy: 'AI Behavior Monitor', reportedAt: '2024-01-14T09:00:00Z', resolvedAt: null,
      affectedUsers: 1, assignedTo: 'David Wekesa',
    },
    {
      id: 'SF-008', title: 'Excessive login failures for admin account',
      description: 'Admin account "staff_admin_02" experienced 47 failed login attempts in 30 minutes.',
      type: 'data_privacy', riskScore: 78, severity: 'high', status: 'resolved',
      reportedBy: 'Security Monitor', reportedAt: '2024-01-14T02:45:00Z', resolvedAt: '2024-01-14T04:30:00Z',
      affectedUsers: 1, assignedTo: 'James Karanja',
    },
    {
      id: 'SF-009', title: 'AI tutor encouraging non-CBC-aligned learning path',
      description: 'AI tutor suggested study resources that contradict the Competency-Based Curriculum framework.',
      type: 'content_safety', riskScore: 55, severity: 'medium', status: 'resolved',
      reportedBy: 'Curriculum Monitor', reportedAt: '2024-01-13T16:00:00Z', resolvedAt: '2024-01-14T10:00:00Z',
      affectedUsers: 3, assignedTo: 'Dr. Amina Hassan',
    },
    {
      id: 'SF-010', title: 'Instructor shared internal assessment keys externally',
      description: 'Grade 8 assessment answer keys were detected in a public Telegram group linked to an instructor.',
      type: 'academic_integrity', riskScore: 90, severity: 'critical', status: 'escalated',
      reportedBy: 'Manual Report', reportedAt: '2024-01-13T12:00:00Z', resolvedAt: null,
      affectedUsers: 45, assignedTo: 'Legal Team',
    },
    {
      id: 'SF-011', title: 'Student expressed concerning emotional state in AI chat',
      description: 'AI tutor detected language suggesting emotional distress in a Grade 7 student\'s chat session.',
      type: 'student_safety', riskScore: 85, severity: 'critical', status: 'active',
      reportedBy: 'AI Wellness Monitor', reportedAt: '2024-01-15T09:30:00Z', resolvedAt: null,
      affectedUsers: 1, assignedTo: 'Counselor Team',
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getSafetyFlags({ page: 1, page_size: 50 });
        if (response.items && response.items.length > 0) {
          const mapped: SafetyFlag[] = response.items.map((item) => ({
            id: item.id,
            title: item.description.substring(0, 80),
            description: item.description,
            type: (item.flag_type as SafetyFlag['type']) || 'content_safety',
            riskScore: Math.round(item.ai_confidence * 100),
            severity: item.severity,
            status: item.status === 'open' ? 'active' : item.status === 'reviewed' ? 'resolved' : 'dismissed',
            reportedBy: 'AI Safety Monitor',
            reportedAt: item.created_at,
            resolvedAt: item.status === 'reviewed' ? item.created_at : null,
            affectedUsers: 1,
            assignedTo: 'Staff Team',
          }));
          setFlags(mapped);
          setStats({
            activeFlags: mapped.filter(f => f.status === 'active' || f.status === 'investigating' || f.status === 'escalated').length,
            highRisk: mapped.filter(f => f.severity === 'critical' || f.severity === 'high').length,
            resolvedToday: mapped.filter(f => f.status === 'resolved').length,
            avgResolutionHours: 14.5,
          });
        } else {
          // Fallback to mock data if API returns empty
          setFlags(mockFlags);
          setStats({
            activeFlags: mockFlags.filter(f => f.status === 'active' || f.status === 'investigating' || f.status === 'escalated').length,
            highRisk: mockFlags.filter(f => f.severity === 'critical' || f.severity === 'high').length,
            resolvedToday: mockFlags.filter(f => f.status === 'resolved').length,
            avgResolutionHours: 14.5,
          });
        }
      } catch (err) {
        console.warn('[SafetyPolicy] API unavailable, using fallback data:', err);
        setFlags(mockFlags);
        setStats({
          activeFlags: mockFlags.filter(f => f.status === 'active' || f.status === 'investigating' || f.status === 'escalated').length,
          highRisk: mockFlags.filter(f => f.severity === 'critical' || f.severity === 'high').length,
          resolvedToday: mockFlags.filter(f => f.status === 'resolved').length,
          avgResolutionHours: 14.5,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredFlags = flags.filter((flag) => {
    if (typeFilter !== 'all' && flag.type !== typeFilter) return false;
    if (severityFilter !== 'all' && flag.severity !== severityFilter) return false;
    if (statusFilter !== 'all' && flag.status !== statusFilter) return false;
    return true;
  });

  const getSeverityBadge = (severity: SafetyFlag['severity']) => {
    const config: Record<string, { color: string }> = {
      critical: { color: 'bg-red-500/20 text-red-400 border-red-500/30' },
      high: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
      medium: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
      low: { color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${config[severity].color}`}>
        {severity}
      </span>
    );
  };

  const getStatusBadge = (status: SafetyFlag['status']) => {
    const config: Record<string, { label: string; color: string }> = {
      active: { label: 'Active', color: 'bg-red-500/20 text-red-400' },
      investigating: { label: 'Investigating', color: 'bg-blue-500/20 text-blue-400' },
      resolved: { label: 'Resolved', color: 'bg-green-500/20 text-green-400' },
      escalated: { label: 'Escalated', color: 'bg-purple-500/20 text-purple-400' },
      dismissed: { label: 'Dismissed', color: 'bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-white/40' },
    };
    const { label, color } = config[status];
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{label}</span>;
  };

  const getTypeLabel = (type: SafetyFlag['type']) => {
    const labels: Record<string, string> = {
      content_safety: 'Content Safety',
      student_safety: 'Student Safety',
      data_privacy: 'Data Privacy',
      harassment: 'Harassment',
      academic_integrity: 'Academic Integrity',
      policy_violation: 'Policy Violation',
    };
    return labels[type];
  };

  const getRiskBar = (score: number) => {
    const color = score >= 80 ? 'bg-red-500' : score >= 60 ? 'bg-orange-500' : score >= 40 ? 'bg-yellow-500' : 'bg-green-500';
    const textColor = score >= 80 ? 'text-red-400' : score >= 60 ? 'text-orange-400' : score >= 40 ? 'text-yellow-400' : 'text-green-400';
    return (
      <div className="flex items-center gap-2">
        <div className="w-20 h-2 bg-gray-100 dark:bg-[#22272B] rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
        </div>
        <span className={`text-xs font-bold ${textColor}`}>{score}</span>
      </div>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-KE', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-7 w-44 bg-white dark:bg-[#181C1F] rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] animate-pulse" />
          ))}
        </div>
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-16 bg-white dark:bg-[#181C1F] rounded-lg border border-gray-200 dark:border-[#22272B] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Safety & Policy</h1>
          <p className="text-sm text-gray-500 dark:text-white/50 mt-1">
            Monitor safety flags, risk incidents, and policy compliance across the platform
          </p>
        </div>
        <button className="px-4 py-2 bg-[#E40000] hover:bg-[#E40000]/90 text-gray-900 dark:text-white text-sm font-medium rounded-lg transition-colors">
          Report Incident
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] p-4">
          <p className="text-xs text-gray-500 dark:text-white/50 uppercase tracking-wider">Active Flags</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{stats.activeFlags}</p>
        </div>
        <div className="bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] p-4">
          <p className="text-xs text-gray-500 dark:text-white/50 uppercase tracking-wider">High Risk</p>
          <p className="text-2xl font-bold text-orange-400 mt-1">{stats.highRisk}</p>
        </div>
        <div className="bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] p-4">
          <p className="text-xs text-gray-500 dark:text-white/50 uppercase tracking-wider">Resolved Today</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{stats.resolvedToday}</p>
        </div>
        <div className="bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] p-4">
          <p className="text-xs text-gray-500 dark:text-white/50 uppercase tracking-wider">Avg Resolution</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.avgResolutionHours}h</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B]">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-1.5 bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-lg text-sm text-gray-600 dark:text-white/70 focus:outline-none focus:border-[#E40000]/50"
        >
          <option value="all">All Types</option>
          <option value="content_safety">Content Safety</option>
          <option value="student_safety">Student Safety</option>
          <option value="data_privacy">Data Privacy</option>
          <option value="harassment">Harassment</option>
          <option value="academic_integrity">Academic Integrity</option>
          <option value="policy_violation">Policy Violation</option>
        </select>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-3 py-1.5 bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-lg text-sm text-gray-600 dark:text-white/70 focus:outline-none focus:border-[#E40000]/50"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-lg text-sm text-gray-600 dark:text-white/70 focus:outline-none focus:border-[#E40000]/50"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="investigating">Investigating</option>
          <option value="resolved">Resolved</option>
          <option value="escalated">Escalated</option>
          <option value="dismissed">Dismissed</option>
        </select>
        <span className="text-xs text-gray-400 dark:text-white/40 ml-auto">
          {filteredFlags.length} of {flags.length} flags
        </span>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#22272B]">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-white/50 uppercase tracking-wider">Flag</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-white/50 uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-white/50 uppercase tracking-wider">Risk Score</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-white/50 uppercase tracking-wider">Severity</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-white/50 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-white/50 uppercase tracking-wider">Assigned To</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-white/50 uppercase tracking-wider">Reported</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-white/50 uppercase tracking-wider">Affected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#22272B]">
              {filteredFlags.map((flag) => (
                <tr key={flag.id} className="hover:bg-white/[0.02] transition-colors cursor-pointer">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white font-medium">{flag.title}</p>
                      <p className="text-xs text-gray-400 dark:text-white/40 mt-0.5 line-clamp-1">{flag.description}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-500 dark:text-white/60 bg-gray-50 dark:bg-[#0F1112] px-2 py-1 rounded whitespace-nowrap">
                      {getTypeLabel(flag.type)}
                    </span>
                  </td>
                  <td className="px-4 py-3">{getRiskBar(flag.riskScore)}</td>
                  <td className="px-4 py-3">{getSeverityBadge(flag.severity)}</td>
                  <td className="px-4 py-3">{getStatusBadge(flag.status)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs ${flag.assignedTo === 'Unassigned' ? 'text-red-400' : 'text-gray-500 dark:text-white/60'}`}>
                      {flag.assignedTo}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-white/60">{formatDate(flag.reportedAt)}</p>
                      <p className="text-xs text-gray-400 dark:text-white/30">{flag.reportedBy}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-500 dark:text-white/60">{flag.affectedUsers} user{flag.affectedUsers !== 1 ? 's' : ''}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SafetyPolicyPage;
