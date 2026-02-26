import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Eye,
  ShieldCheck,
  Users,
  FileCheck,
} from 'lucide-react';
import AdminPageHeader from '../../components/admin/shared/AdminPageHeader';
import AdminStatsCard from '../../components/admin/shared/AdminStatsCard';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface ComplianceIncident {
  id: string;
  type: 'data_breach' | 'consent_violation' | 'access_violation' | 'child_protection' | 'data_request';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedUsers: number;
  status: 'open' | 'investigating' | 'resolved' | 'escalated';
  resolution: string | null;
  reportedAt: string;
  resolvedAt: string | null;
}

interface ComplianceCheckItem {
  id: string;
  category: string;
  requirement: string;
  status: 'compliant' | 'partial' | 'non_compliant';
  lastAudit: string;
  notes: string;
}

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

const INCIDENTS: ComplianceIncident[] = [
  {
    id: 'inc-001',
    type: 'data_breach',
    severity: 'critical',
    title: 'Unauthorized API access attempt detected',
    description: 'Multiple failed authentication attempts from suspicious IP range targeting student data endpoints.',
    affectedUsers: 0,
    status: 'resolved',
    resolution: 'IP range blocked, API keys rotated, additional rate limiting applied.',
    reportedAt: '2026-02-10T08:15:00Z',
    resolvedAt: '2026-02-10T09:42:00Z',
  },
  {
    id: 'inc-002',
    type: 'consent_violation',
    severity: 'high',
    title: 'Parental consent records missing for 12 students',
    description: 'Batch enrollment process bypassed consent verification step for new students in Kisumu region.',
    affectedUsers: 12,
    status: 'investigating',
    resolution: null,
    reportedAt: '2026-02-11T14:30:00Z',
    resolvedAt: null,
  },
  {
    id: 'inc-003',
    type: 'child_protection',
    severity: 'high',
    title: 'AI tutor content filter flagged inappropriate response',
    description: 'Gemini model generated age-inappropriate analogy in Grade 3 science session. Content was auto-blocked.',
    affectedUsers: 1,
    status: 'resolved',
    resolution: 'Content filter updated, model prompt guardrails strengthened, session reviewed.',
    reportedAt: '2026-02-09T11:20:00Z',
    resolvedAt: '2026-02-09T13:05:00Z',
  },
  {
    id: 'inc-004',
    type: 'access_violation',
    severity: 'medium',
    title: 'Instructor accessed student records outside assigned class',
    description: 'Instructor role boundary exceeded for cross-class student performance data access.',
    affectedUsers: 8,
    status: 'escalated',
    resolution: null,
    reportedAt: '2026-02-12T09:45:00Z',
    resolvedAt: null,
  },
  {
    id: 'inc-005',
    type: 'data_request',
    severity: 'low',
    title: 'Parent data portability request (DPA Section 35)',
    description: 'Parent requested full export of child learning data under Kenya DPA data portability rights.',
    affectedUsers: 1,
    status: 'open',
    resolution: null,
    reportedAt: '2026-02-13T06:10:00Z',
    resolvedAt: null,
  },
];

const COMPLIANCE_CHECKS: ComplianceCheckItem[] = [
  {
    id: 'cc-01',
    category: 'Data Collection',
    requirement: 'Lawful basis for processing children\'s personal data (DPA Sec. 33)',
    status: 'compliant',
    lastAudit: '2026-01-15',
    notes: 'Parental consent collected for all minors. Consent forms updated Q4 2025.',
  },
  {
    id: 'cc-02',
    category: 'Data Storage',
    requirement: 'Data stored within Kenya or with adequate safeguards (DPA Sec. 48)',
    status: 'compliant',
    lastAudit: '2026-01-15',
    notes: 'Primary database on Contabo VDS (Nairobi POP). AI API calls use encrypted transit.',
  },
  {
    id: 'cc-03',
    category: 'Child Protection',
    requirement: 'Age-appropriate AI content filtering and monitoring',
    status: 'compliant',
    lastAudit: '2026-02-01',
    notes: 'Multi-layer content filtering active. Weekly manual audit of flagged sessions.',
  },
  {
    id: 'cc-04',
    category: 'Consent Management',
    requirement: 'Verifiable parental consent for users under 18 (DPA Sec. 33(2))',
    status: 'partial',
    lastAudit: '2026-02-01',
    notes: 'Digital consent in place. Physical verification for 12 recent enrollments pending.',
  },
  {
    id: 'cc-05',
    category: 'Data Rights',
    requirement: 'Right to erasure and data portability (DPA Sec. 35-37)',
    status: 'compliant',
    lastAudit: '2026-01-20',
    notes: 'Automated deletion workflow active. Average fulfillment time: 48 hours.',
  },
  {
    id: 'cc-06',
    category: 'Security',
    requirement: 'Encryption at rest and in transit for personal data (DPA Sec. 41)',
    status: 'compliant',
    lastAudit: '2026-02-05',
    notes: 'TLS 1.3 for all connections. AES-256 for sensitive fields in database.',
  },
];

/* ------------------------------------------------------------------ */
/* Badge helpers                                                       */
/* ------------------------------------------------------------------ */

const severityColors: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const statusColors: Record<string, string> = {
  open: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  investigating: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  resolved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  escalated: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const complianceStatusColors: Record<string, string> = {
  compliant: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  partial: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  non_compliant: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const complianceStatusLabels: Record<string, string> = {
  compliant: 'Compliant',
  partial: 'Partial',
  non_compliant: 'Non-Compliant',
};

const typeIcons: Record<string, React.ReactNode> = {
  data_breach: <Shield className="w-4 h-4 text-red-400" />,
  consent_violation: <FileCheck className="w-4 h-4 text-orange-400" />,
  access_violation: <Eye className="w-4 h-4 text-yellow-400" />,
  child_protection: <ShieldCheck className="w-4 h-4 text-purple-400" />,
  data_request: <Users className="w-4 h-4 text-blue-400" />,
};

const Badge: React.FC<{ label: string; colorClass: string }> = ({ label, colorClass }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${colorClass}`}
  >
    {label}
  </span>
);

/* ------------------------------------------------------------------ */
/* Animation variants                                                  */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const CompliancePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedIncident, setExpandedIncident] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const activeIncidents = INCIDENTS.filter((inc) => inc.status !== 'resolved').length;
  const consentRate = 97.2;
  const dpaScore = 91.5;
  const childProtectionScore = 98.7;

  const formatDate = (iso: string): string =>
    new Date(iso).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const formatDateTime = (iso: string): string =>
    new Date(iso).toLocaleString('en-KE', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (loading) {
    return (
      <>
        <div className="space-y-6">
          <div className="h-16 bg-gray-100 dark:bg-[#22272B] rounded-lg animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-gray-100 dark:bg-[#22272B] rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-80 bg-gray-100 dark:bg-[#22272B] rounded-xl animate-pulse" />
        </div>
      </>
    );
  }

  return (
    <>
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <AdminPageHeader
          title="Compliance & Data Protection"
          subtitle="Kenya Data Protection Act (DPA 2019) compliance dashboard and incident management"
          breadcrumbs={[
            { label: 'Analytics', path: '/dashboard/admin' },
            { label: 'Compliance' },
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

        {/* Stats Row */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <AdminStatsCard
            title="Active Incidents"
            value={activeIncidents}
            icon={<AlertTriangle className="w-5 h-5" />}
            trend={{ value: 2, label: 'new this week', direction: activeIncidents > 2 ? 'down' : 'up' }}
          />
          <AdminStatsCard
            title="Consent Rate"
            value={`${consentRate}%`}
            icon={<CheckCircle className="w-5 h-5" />}
            trend={{ value: 0.8, label: 'vs last month', direction: 'up' }}
          />
          <AdminStatsCard
            title="DPA Compliance Score"
            value={`${dpaScore}%`}
            icon={<Shield className="w-5 h-5" />}
            trend={{ value: 1.5, label: 'vs last audit', direction: 'up' }}
          />
          <AdminStatsCard
            title="Child Protection Score"
            value={`${childProtectionScore}%`}
            icon={<ShieldCheck className="w-5 h-5" />}
            trend={{ value: 0.3, label: 'vs last audit', direction: 'up' }}
          />
        </motion.div>

        {/* Incident Log Table */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Incident Log</h2>
              <p className="text-sm text-gray-500 dark:text-white/50 mt-1">
                Data protection and child safety incidents requiring attention
              </p>
            </div>
            <div className="flex items-center gap-2 mt-3 sm:mt-0">
              <span className="text-xs text-gray-400 dark:text-white/40">
                {INCIDENTS.filter((i) => i.status !== 'resolved').length} active
              </span>
              <span className="text-xs text-gray-400 dark:text-white/30">|</span>
              <span className="text-xs text-gray-400 dark:text-white/40">
                {INCIDENTS.filter((i) => i.status === 'resolved').length} resolved
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-[#22272B]">
                  <th className="text-left py-3 px-4 text-gray-500 dark:text-white/50 font-medium">Type</th>
                  <th className="text-left py-3 px-4 text-gray-500 dark:text-white/50 font-medium">Incident</th>
                  <th className="text-center py-3 px-4 text-gray-500 dark:text-white/50 font-medium">Severity</th>
                  <th className="text-right py-3 px-4 text-gray-500 dark:text-white/50 font-medium">Affected</th>
                  <th className="text-center py-3 px-4 text-gray-500 dark:text-white/50 font-medium">Status</th>
                  <th className="text-right py-3 px-4 text-gray-500 dark:text-white/50 font-medium">Reported</th>
                  <th className="text-center py-3 px-4 text-gray-500 dark:text-white/50 font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {INCIDENTS.map((incident) => (
                  <React.Fragment key={incident.id}>
                    <tr className="border-b border-gray-200 dark:border-[#22272B]/50 hover:bg-gray-100 dark:hover:bg-[#22272B]/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {typeIcons[incident.type]}
                          <span className="text-gray-500 dark:text-white/60 text-xs capitalize">
                            {incident.type.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white font-medium max-w-[280px] truncate">
                        {incident.title}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge label={incident.severity} colorClass={severityColors[incident.severity]} />
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700 dark:text-white/80">
                        {incident.affectedUsers}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge label={incident.status} colorClass={statusColors[incident.status]} />
                      </td>
                      <td className="py-3 px-4 text-right text-gray-400 dark:text-white/40">
                        {formatDateTime(incident.reportedAt)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() =>
                            setExpandedIncident(
                              expandedIncident === incident.id ? null : incident.id
                            )
                          }
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#22272B] text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                    {expandedIncident === incident.id && (
                      <tr className="bg-gray-50 dark:bg-[#0F1112]">
                        <td colSpan={7} className="px-6 py-4">
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-3"
                          >
                            <div>
                              <span className="text-xs text-gray-400 dark:text-white/40 uppercase tracking-wider">Description</span>
                              <p className="text-sm text-gray-600 dark:text-white/70 mt-1">{incident.description}</p>
                            </div>
                            {incident.resolution && (
                              <div>
                                <span className="text-xs text-gray-400 dark:text-white/40 uppercase tracking-wider">Resolution</span>
                                <p className="text-sm text-emerald-400/80 mt-1">{incident.resolution}</p>
                              </div>
                            )}
                            <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-white/40">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Reported: {formatDateTime(incident.reportedAt)}
                              </span>
                              {incident.resolvedAt && (
                                <span className="flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                                  Resolved: {formatDateTime(incident.resolvedAt)}
                                </span>
                              )}
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* DPA Compliance Checklist */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6"
        >
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">DPA Compliance Checklist</h2>
            <p className="text-sm text-gray-500 dark:text-white/50 mt-1">
              Kenya Data Protection Act 2019 requirements status
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-[#22272B]">
                  <th className="text-left py-3 px-4 text-gray-500 dark:text-white/50 font-medium">Category</th>
                  <th className="text-left py-3 px-4 text-gray-500 dark:text-white/50 font-medium">Requirement</th>
                  <th className="text-center py-3 px-4 text-gray-500 dark:text-white/50 font-medium">Status</th>
                  <th className="text-right py-3 px-4 text-gray-500 dark:text-white/50 font-medium">Last Audit</th>
                  <th className="text-left py-3 px-4 text-gray-500 dark:text-white/50 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {COMPLIANCE_CHECKS.map((check) => (
                  <tr
                    key={check.id}
                    className="border-b border-gray-200 dark:border-[#22272B]/50 hover:bg-gray-100 dark:hover:bg-[#22272B]/30 transition-colors"
                  >
                    <td className="py-3 px-4 text-gray-500 dark:text-white/60 font-medium whitespace-nowrap">
                      {check.category}
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-white/80 max-w-[300px]">
                      {check.requirement}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        label={complianceStatusLabels[check.status]}
                        colorClass={complianceStatusColors[check.status]}
                      />
                    </td>
                    <td className="py-3 px-4 text-right text-gray-400 dark:text-white/40">
                      {formatDate(check.lastAudit)}
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-white/50 max-w-[250px] text-xs">
                      {check.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Compliance Summary Bar */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-[#22272B]">
            <div className="flex items-center justify-between text-xs text-gray-400 dark:text-white/40 mb-2">
              <span>Overall Compliance</span>
              <span>
                {COMPLIANCE_CHECKS.filter((c) => c.status === 'compliant').length}/
                {COMPLIANCE_CHECKS.length} requirements met
              </span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-[#22272B] rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-400 h-full transition-all duration-500"
                style={{
                  width: `${(COMPLIANCE_CHECKS.filter((c) => c.status === 'compliant').length / COMPLIANCE_CHECKS.length) * 100}%`,
                }}
              />
              <div
                className="bg-yellow-400 h-full transition-all duration-500"
                style={{
                  width: `${(COMPLIANCE_CHECKS.filter((c) => c.status === 'partial').length / COMPLIANCE_CHECKS.length) * 100}%`,
                }}
              />
              <div
                className="bg-red-400 h-full transition-all duration-500"
                style={{
                  width: `${(COMPLIANCE_CHECKS.filter((c) => c.status === 'non_compliant').length / COMPLIANCE_CHECKS.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export default CompliancePage;
