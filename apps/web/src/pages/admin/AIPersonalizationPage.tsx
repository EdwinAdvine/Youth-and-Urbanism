import React, { useState } from 'react';
import {
  Search, Filter, RefreshCw, Eye, AlertTriangle,
  GitBranch, Target, TrendingUp, Users, Shield,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import AdminPageHeader from '../../components/admin/shared/AdminPageHeader';

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------
type TabType = 'overview' | 'bias' | 'audits';

type BiasCategory = 'gender' | 'cultural' | 'socioeconomic' | 'regional' | 'ability';

type BiasStatus = 'normal' | 'warning' | 'flagged';

type AuditStatus = 'compliant' | 'review_needed' | 'non_compliant';

interface BiasReport {
  id: string;
  category: BiasCategory;
  metric_name: string;
  fairness_score: number;
  threshold: number;
  status: BiasStatus;
  affected_students: number;
  last_evaluated: string;
  description: string;
}

interface LearningPathAudit {
  id: string;
  student_name: string;
  grade_level: string;
  path_name: string;
  subjects: string[];
  customization_level: number;
  ai_model: string;
  audit_status: AuditStatus;
  last_updated: string;
  recommendation_quality: number;
}

interface PersonalizationStats {
  active_paths: number;
  bias_flags: number;
  customization_score: number;
  students_on_paths: number;
}

// ------------------------------------------------------------------
// Mock data
// ------------------------------------------------------------------
const mockStats: PersonalizationStats = {
  active_paths: 238,
  bias_flags: 4,
  customization_score: 87,
  students_on_paths: 312,
};

const mockBiasChartData = [
  { category: 'Gender', score: 94, threshold: 85 },
  { category: 'Cultural', score: 78, threshold: 85 },
  { category: 'Socioeconomic', score: 91, threshold: 85 },
  { category: 'Regional', score: 82, threshold: 85 },
  { category: 'Ability', score: 96, threshold: 85 },
  { category: 'Language', score: 73, threshold: 85 },
];

const mockBiasReports: BiasReport[] = [
  {
    id: 'br-001',
    category: 'gender',
    metric_name: 'Content Gender Representation',
    fairness_score: 94,
    threshold: 85,
    status: 'normal',
    affected_students: 0,
    last_evaluated: '2025-01-15T14:00:00Z',
    description: 'AI-generated content shows balanced gender representation across all subjects.',
  },
  {
    id: 'br-002',
    category: 'cultural',
    metric_name: 'Cultural Context Accuracy',
    fairness_score: 78,
    threshold: 85,
    status: 'flagged',
    affected_students: 45,
    last_evaluated: '2025-01-15T13:30:00Z',
    description: 'History and social studies content underrepresents certain Kenyan ethnic communities.',
  },
  {
    id: 'br-003',
    category: 'socioeconomic',
    metric_name: 'Example Diversity Score',
    fairness_score: 91,
    threshold: 85,
    status: 'normal',
    affected_students: 0,
    last_evaluated: '2025-01-15T12:00:00Z',
    description: 'Math and science examples include diverse socioeconomic contexts.',
  },
  {
    id: 'br-004',
    category: 'regional',
    metric_name: 'Regional Reference Balance',
    fairness_score: 82,
    threshold: 85,
    status: 'warning',
    affected_students: 28,
    last_evaluated: '2025-01-15T11:00:00Z',
    description: 'Content examples skew toward urban Nairobi contexts. Rural and coastal references underrepresented.',
  },
  {
    id: 'br-005',
    category: 'ability',
    metric_name: 'Learning Pace Adaptability',
    fairness_score: 96,
    threshold: 85,
    status: 'normal',
    affected_students: 0,
    last_evaluated: '2025-01-15T10:30:00Z',
    description: 'AI tutor adapts pace effectively across different learning abilities.',
  },
];

const mockLearningPathAudits: LearningPathAudit[] = [
  {
    id: 'lpa-001',
    student_name: 'Amani Wanjiku',
    grade_level: 'Grade 7',
    path_name: 'Accelerated Science Track',
    subjects: ['Science', 'Mathematics'],
    customization_level: 92,
    ai_model: 'Gemini Pro',
    audit_status: 'compliant',
    last_updated: '2025-01-15T14:30:00Z',
    recommendation_quality: 95,
  },
  {
    id: 'lpa-002',
    student_name: 'Brian Ochieng',
    grade_level: 'Grade 5',
    path_name: 'Foundation Mathematics',
    subjects: ['Mathematics'],
    customization_level: 78,
    ai_model: 'Claude 3.5',
    audit_status: 'review_needed',
    last_updated: '2025-01-15T13:15:00Z',
    recommendation_quality: 72,
  },
  {
    id: 'lpa-003',
    student_name: 'Faith Njeri',
    grade_level: 'Grade 8',
    path_name: 'Creative Writing Focus',
    subjects: ['English', 'Kiswahili'],
    customization_level: 88,
    ai_model: 'Claude 3.5',
    audit_status: 'compliant',
    last_updated: '2025-01-15T12:45:00Z',
    recommendation_quality: 90,
  },
  {
    id: 'lpa-004',
    student_name: 'David Kamau',
    grade_level: 'Grade 6',
    path_name: 'Remedial Science Support',
    subjects: ['Science'],
    customization_level: 65,
    ai_model: 'GPT-4',
    audit_status: 'non_compliant',
    last_updated: '2025-01-15T11:00:00Z',
    recommendation_quality: 58,
  },
  {
    id: 'lpa-005',
    student_name: 'Esther Akinyi',
    grade_level: 'Grade 4',
    path_name: 'All-Round Excellence',
    subjects: ['Mathematics', 'English', 'Science', 'Kiswahili'],
    customization_level: 95,
    ai_model: 'Gemini Pro',
    audit_status: 'compliant',
    last_updated: '2025-01-15T10:20:00Z',
    recommendation_quality: 97,
  },
  {
    id: 'lpa-006',
    student_name: 'George Mwangi',
    grade_level: 'Grade 7',
    path_name: 'Social Studies Deep Dive',
    subjects: ['Social Studies', 'Kiswahili'],
    customization_level: 81,
    ai_model: 'Grok',
    audit_status: 'review_needed',
    last_updated: '2025-01-14T16:30:00Z',
    recommendation_quality: 76,
  },
];

// ------------------------------------------------------------------
// Badge helpers
// ------------------------------------------------------------------
const biasStatusColors: Record<BiasStatus, string> = {
  normal: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  flagged: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const auditStatusColors: Record<AuditStatus, string> = {
  compliant: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  review_needed: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  non_compliant: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const auditStatusLabels: Record<AuditStatus, string> = {
  compliant: 'Compliant',
  review_needed: 'Review Needed',
  non_compliant: 'Non-Compliant',
};

const BiasStatusBadge: React.FC<{ status: BiasStatus }> = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${biasStatusColors[status]}`}>
    {status === 'normal' ? 'Normal' : status === 'warning' ? 'Warning' : 'Flagged'}
  </span>
);

const AuditStatusBadge: React.FC<{ status: AuditStatus }> = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${auditStatusColors[status]}`}>
    {auditStatusLabels[status]}
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
// Custom tooltip for chart
// ------------------------------------------------------------------
const CustomTooltip: React.FC<{
  active?: boolean;
  payload?: Array<{ value: number; payload: { category: string; threshold: number } }>;
}> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0];
  return (
    <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg p-3 shadow-xl">
      <p className="text-gray-900 dark:text-white font-medium text-sm">{data.payload.category}</p>
      <p className="text-sm text-gray-500 dark:text-white/60">
        Score: <span className={data.value >= data.payload.threshold ? 'text-emerald-400' : 'text-red-400'}>{data.value}%</span>
      </p>
      <p className="text-xs text-gray-400 dark:text-white/40">Threshold: {data.payload.threshold}%</p>
    </div>
  );
};

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
const AIPersonalizationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [search, setSearch] = useState('');
  const [auditFilter, setAuditFilter] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      showToast('Personalization data refreshed');
    }, 1200);
  };

  const handleViewBiasDetails = (report: BiasReport) => {
    alert(
      `Bias Report Details\n\n` +
      `ID: ${report.id}\n` +
      `Category: ${report.category}\n` +
      `Metric: ${report.metric_name}\n` +
      `Fairness Score: ${report.fairness_score}%\n` +
      `Threshold: ${report.threshold}%\n` +
      `Status: ${report.status}\n` +
      `Affected Students: ${report.affected_students}\n` +
      `Last Evaluated: ${formatDate(report.last_evaluated)}\n\n` +
      `Description:\n${report.description}`
    );
  };

  const handleViewAudit = (audit: LearningPathAudit) => {
    alert(
      `Learning Path Audit Details\n\n` +
      `ID: ${audit.id}\n` +
      `Student: ${audit.student_name} (${audit.grade_level})\n` +
      `Path: ${audit.path_name}\n` +
      `Subjects: ${audit.subjects.join(', ')}\n` +
      `AI Model: ${audit.ai_model}\n` +
      `Customization Level: ${audit.customization_level}%\n` +
      `Recommendation Quality: ${audit.recommendation_quality}%\n` +
      `Audit Status: ${auditStatusLabels[audit.audit_status]}\n` +
      `Last Updated: ${formatDate(audit.last_updated)}`
    );
  };

  const filteredAudits = mockLearningPathAudits.filter((audit) => {
    const matchesSearch =
      !search ||
      audit.student_name.toLowerCase().includes(search.toLowerCase()) ||
      audit.path_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !auditFilter || audit.audit_status === auditFilter;
    return matchesSearch && matchesStatus;
  });

  const tabs: { key: TabType; label: string; count?: number }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'bias', label: 'Bias Reports', count: mockBiasReports.filter((b) => b.status !== 'normal').length },
    { key: 'audits', label: 'Learning Path Audits', count: mockLearningPathAudits.filter((a) => a.audit_status !== 'compliant').length },
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
          title="AI Personalization"
          subtitle="Audit learning paths, monitor bias metrics, and ensure fair AI-driven personalization"
          breadcrumbs={[
            { label: 'AI Systems', path: '/dashboard/admin' },
            { label: 'Personalization' },
          ]}
          actions={
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-[#444] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label="Active Paths"
            value={mockStats.active_paths}
            icon={<GitBranch className="w-5 h-5" />}
            iconColor="text-blue-400"
            change="+18 this week"
            changeType="positive"
          />
          <StatsCard
            label="Bias Flags"
            value={mockStats.bias_flags}
            icon={<AlertTriangle className="w-5 h-5" />}
            iconColor="text-yellow-400"
            change="-2 from last audit"
            changeType="positive"
          />
          <StatsCard
            label="Customization Score"
            value={`${mockStats.customization_score}%`}
            icon={<Target className="w-5 h-5" />}
            iconColor="text-emerald-400"
            change="+3% from last month"
            changeType="positive"
          />
          <StatsCard
            label="Students on Paths"
            value={mockStats.students_on_paths}
            icon={<Users className="w-5 h-5" />}
            iconColor="text-purple-400"
            change="82% of active students"
            changeType="neutral"
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

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Bias Fairness Chart */}
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Bias & Fairness Scores by Category</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockBiasChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#22272B" />
                    <XAxis
                      dataKey="category"
                      tick={{ fill: '#ffffff66', fontSize: 12 }}
                      axisLine={{ stroke: '#22272B' }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: '#ffffff66', fontSize: 12 }}
                      axisLine={{ stroke: '#22272B' }}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={48}>
                      {mockBiasChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.score >= entry.threshold ? '#10B981' : '#EF4444'}
                          fillOpacity={0.8}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs text-gray-400 dark:text-white/40">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-emerald-500/80" />
                  <span>Above threshold (85%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-red-500/80" />
                  <span>Below threshold</span>
                </div>
              </div>
            </div>

            {/* Quick audit summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-emerald-400" />
                </div>
                <p className="text-2xl font-bold text-emerald-400">
                  {mockLearningPathAudits.filter((a) => a.audit_status === 'compliant').length}
                </p>
                <p className="text-sm text-gray-400 dark:text-white/40 mt-1">Compliant Paths</p>
              </div>
              <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="w-6 h-6 text-yellow-400" />
                </div>
                <p className="text-2xl font-bold text-yellow-400">
                  {mockLearningPathAudits.filter((a) => a.audit_status === 'review_needed').length}
                </p>
                <p className="text-sm text-gray-400 dark:text-white/40 mt-1">Review Needed</p>
              </div>
              <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-red-400" />
                </div>
                <p className="text-2xl font-bold text-red-400">
                  {mockLearningPathAudits.filter((a) => a.audit_status === 'non_compliant').length}
                </p>
                <p className="text-sm text-gray-400 dark:text-white/40 mt-1">Non-Compliant</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bias Reports Tab */}
        {activeTab === 'bias' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {mockBiasReports.map((report) => (
              <div
                key={report.id}
                className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      report.status === 'flagged' ? 'bg-red-500/20' :
                      report.status === 'warning' ? 'bg-yellow-500/20' :
                      'bg-emerald-500/20'
                    }`}>
                      <Shield className={`w-5 h-5 ${
                        report.status === 'flagged' ? 'text-red-400' :
                        report.status === 'warning' ? 'text-yellow-400' :
                        'text-emerald-400'
                      }`} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <h4 className="text-gray-900 dark:text-white font-semibold">{report.metric_name}</h4>
                        <BiasStatusBadge status={report.status} />
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border bg-gray-100 dark:bg-[#22272B] text-gray-500 dark:text-white/50 border-gray-300 dark:border-[#333] capitalize">
                          {report.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-white/50 mb-2">{report.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-white/40 flex-wrap">
                        <span>Fairness Score: <span className={report.fairness_score >= report.threshold ? 'text-emerald-400' : 'text-red-400'}>{report.fairness_score}%</span></span>
                        <span>Threshold: {report.threshold}%</span>
                        {report.affected_students > 0 && (
                          <span className="text-yellow-400">{report.affected_students} students affected</span>
                        )}
                        <span>Last evaluated: {formatDate(report.last_evaluated)}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    title="View Details"
                    onClick={() => handleViewBiasDetails(report)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#22272B] text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors flex-shrink-0"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Learning Path Audits Tab */}
        {activeTab === 'audits' && (
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
                  placeholder="Search by student name or path..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#E40000]/50 transition-colors"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
                <select
                  value={auditFilter}
                  onChange={(e) => setAuditFilter(e.target.value)}
                  className="pl-10 pr-8 py-2.5 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-[#E40000]/50 transition-colors min-w-[160px]"
                >
                  <option value="">All Status</option>
                  <option value="compliant">Compliant</option>
                  <option value="review_needed">Review Needed</option>
                  <option value="non_compliant">Non-Compliant</option>
                </select>
              </div>
            </div>

            {/* Audits table */}
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden">
              {filteredAudits.length === 0 ? (
                <div className="text-center py-16">
                  <GitBranch className="w-16 h-16 text-white/10 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Audits Found</h3>
                  <p className="text-gray-400 dark:text-white/40 text-sm">No learning path audits match your current filters.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-[#22272B] text-left">
                        <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Student</th>
                        <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Learning Path</th>
                        <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Subjects</th>
                        <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Customization</th>
                        <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Quality</th>
                        <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">AI Model</th>
                        <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Status</th>
                        <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAudits.map((audit) => (
                        <tr
                          key={audit.id}
                          className="border-b border-gray-200 dark:border-[#22272B]/50 hover:bg-[#1E2327] transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-gray-900 dark:text-white font-medium">{audit.student_name}</p>
                              <p className="text-xs text-gray-400 dark:text-white/40">{audit.grade_level}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-white/70">{audit.path_name}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {audit.subjects.map((subject) => (
                                <span
                                  key={subject}
                                  className="px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-[#22272B] text-gray-500 dark:text-white/50 border border-gray-300 dark:border-[#333]"
                                >
                                  {subject}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-gray-100 dark:bg-[#22272B] rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    audit.customization_level >= 85 ? 'bg-emerald-400' :
                                    audit.customization_level >= 70 ? 'bg-yellow-400' :
                                    'bg-red-400'
                                  }`}
                                  style={{ width: `${audit.customization_level}%` }}
                                />
                              </div>
                              <span className="text-gray-500 dark:text-white/50 text-xs">{audit.customization_level}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`font-semibold text-xs ${
                              audit.recommendation_quality >= 85 ? 'text-emerald-400' :
                              audit.recommendation_quality >= 70 ? 'text-yellow-400' :
                              'text-red-400'
                            }`}>
                              {audit.recommendation_quality}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 dark:text-white/50 text-xs">{audit.ai_model}</td>
                          <td className="px-4 py-3">
                            <AuditStatusBadge status={audit.audit_status} />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end">
                              <button
                                title="View Audit"
                                onClick={() => handleViewAudit(audit)}
                                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#22272B] text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
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
      </motion.div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-lg shadow-xl ${
            toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
          }`}>
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default AIPersonalizationPage;
