/**
 * Admin System Health Dashboard
 *
 * Provides: error log viewer with AI diagnosis, test runner with live
 * output, and system health overview cards.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  Bug,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Database,
  FlaskConical,
  Loader2,
  Play,
  RefreshCw,
  Search,
  Shield,
  Sparkles,
  Terminal,
  X,
  XCircle,
} from 'lucide-react';
import {
  adminSystemHealthService,
  type HealthOverview,
  type ErrorLogEntry,
  type ErrorsPage,
  type TestRun,
  type TestRunsPage,
} from '../../services/admin/adminSystemHealthService';

// ─── Animations ─────────────────────────────────────────────────────

const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.05 } },
};

// ─── Helpers ────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function levelColor(level: string): string {
  switch (level.toUpperCase()) {
    case 'CRITICAL': return 'bg-red-100 text-red-800';
    case 'ERROR': return 'bg-orange-100 text-orange-800';
    case 'WARNING': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-700';
  }
}

function statusColor(status: string): string {
  switch (status) {
    case 'passed': return 'bg-green-100 text-green-800';
    case 'failed': return 'bg-red-100 text-red-800';
    case 'running': return 'bg-blue-100 text-blue-800';
    case 'error': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-700';
  }
}

// ─── Tab type ───────────────────────────────────────────────────────

type Tab = 'overview' | 'errors' | 'tests';

// ─── Main Component ─────────────────────────────────────────────────

const SystemHealthPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Overview state
  const [overview, setOverview] = useState<HealthOverview | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);

  // Errors state
  const [errorsData, setErrorsData] = useState<ErrorsPage | null>(null);
  const [errorsLoading, setErrorsLoading] = useState(false);
  const [errorPage, setErrorPage] = useState(1);
  const [errorSearch, setErrorSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [resolvedFilter, setResolvedFilter] = useState<string>('');
  const [selectedError, setSelectedError] = useState<ErrorLogEntry | null>(null);
  const [diagnosing, setDiagnosing] = useState(false);
  const [resolving, setResolving] = useState(false);

  // Tests state
  const [testRuns, setTestRuns] = useState<TestRunsPage | null>(null);
  const [testsLoading, setTestsLoading] = useState(false);
  const [runningTest, setRunningTest] = useState<string | null>(null);
  const [activeRun, setActiveRun] = useState<TestRun | null>(null);
  const [testPage, setTestPage] = useState(1);

  // ── Fetchers ────────────────────────────────────────────────────

  const fetchOverview = useCallback(async () => {
    setOverviewLoading(true);
    try {
      const data = await adminSystemHealthService.getOverview();
      setOverview(data);
    } catch (err) {
      console.error('Failed to fetch overview:', err);
    } finally {
      setOverviewLoading(false);
    }
  }, []);

  const fetchErrors = useCallback(async () => {
    setErrorsLoading(true);
    try {
      const data = await adminSystemHealthService.getErrors({
        page: errorPage,
        page_size: 20,
        level: levelFilter || undefined,
        is_resolved: resolvedFilter === '' ? undefined : resolvedFilter === 'true',
        error_type: errorSearch || undefined,
      });
      setErrorsData(data);
    } catch (err) {
      console.error('Failed to fetch errors:', err);
    } finally {
      setErrorsLoading(false);
    }
  }, [errorPage, levelFilter, resolvedFilter, errorSearch]);

  const fetchTestRuns = useCallback(async () => {
    setTestsLoading(true);
    try {
      const data = await adminSystemHealthService.getTestRuns({ page: testPage, page_size: 10 });
      setTestRuns(data);
    } catch (err) {
      console.error('Failed to fetch test runs:', err);
    } finally {
      setTestsLoading(false);
    }
  }, [testPage]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  useEffect(() => {
    if (activeTab === 'errors') fetchErrors();
  }, [activeTab, fetchErrors]);

  useEffect(() => {
    if (activeTab === 'tests') fetchTestRuns();
  }, [activeTab, fetchTestRuns]);

  // ── Actions ─────────────────────────────────────────────────────

  const handleRunTests = async (type: 'backend' | 'frontend' | 'all') => {
    setRunningTest(type);
    try {
      const run = await adminSystemHealthService.runTests(type);
      setActiveRun(run);
      // Poll for completion
      const poll = setInterval(async () => {
        try {
          const updated = await adminSystemHealthService.getTestRun(run.id);
          setActiveRun(updated);
          if (updated.status !== 'running' && updated.status !== 'pending') {
            clearInterval(poll);
            setRunningTest(null);
            fetchTestRuns();
            fetchOverview();
          }
        } catch {
          clearInterval(poll);
          setRunningTest(null);
        }
      }, 3000);
    } catch (err) {
      console.error('Failed to start test run:', err);
      setRunningTest(null);
    }
  };

  const handleDiagnose = async (errorId: string) => {
    setDiagnosing(true);
    try {
      const result = await adminSystemHealthService.diagnoseError(errorId);
      if (selectedError && selectedError.id === errorId) {
        setSelectedError({
          ...selectedError,
          ai_diagnosis: result.diagnosis,
          ai_diagnosed_at: result.diagnosed_at,
        });
      }
      fetchErrors();
    } catch (err) {
      console.error('Failed to diagnose error:', err);
    } finally {
      setDiagnosing(false);
    }
  };

  const handleResolve = async (errorId: string) => {
    setResolving(true);
    try {
      const updated = await adminSystemHealthService.resolveError(errorId, 'Resolved via dashboard');
      if (selectedError && selectedError.id === errorId) {
        setSelectedError(updated);
      }
      fetchErrors();
      fetchOverview();
    } catch (err) {
      console.error('Failed to resolve error:', err);
    } finally {
      setResolving(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={stagger}
    >
      {/* Header */}
      <motion.div variants={fadeIn} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-7 h-7 text-red-600" />
            System Health
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Monitor errors, run tests, and get AI-powered diagnostics
          </p>
        </div>
        <button
          onClick={() => { fetchOverview(); if (activeTab === 'errors') fetchErrors(); if (activeTab === 'tests') fetchTestRuns(); }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeIn} className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-6">
          {([
            { key: 'overview', label: 'Overview', icon: Activity },
            { key: 'errors', label: 'Error Logs', icon: Bug },
            { key: 'tests', label: 'Test Runner', icon: FlaskConical },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 pb-3 px-1 border-b-2 transition-colors text-sm font-medium ${
                activeTab === key
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
      </motion.div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab overview={overview} loading={overviewLoading} />}
      {activeTab === 'errors' && (
        <ErrorsTab
          data={errorsData}
          loading={errorsLoading}
          page={errorPage}
          setPage={setErrorPage}
          search={errorSearch}
          setSearch={setErrorSearch}
          levelFilter={levelFilter}
          setLevelFilter={setLevelFilter}
          resolvedFilter={resolvedFilter}
          setResolvedFilter={setResolvedFilter}
          selectedError={selectedError}
          setSelectedError={setSelectedError}
          diagnosing={diagnosing}
          resolving={resolving}
          onDiagnose={handleDiagnose}
          onResolve={handleResolve}
        />
      )}
      {activeTab === 'tests' && (
        <TestsTab
          testRuns={testRuns}
          loading={testsLoading}
          page={testPage}
          setPage={setTestPage}
          runningTest={runningTest}
          activeRun={activeRun}
          onRunTests={handleRunTests}
        />
      )}
    </motion.div>
  );
};

// ─── Overview Tab ───────────────────────────────────────────────────

const OverviewTab: React.FC<{ overview: HealthOverview | null; loading: boolean }> = ({ overview, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 animate-pulse h-28" />
        ))}
      </div>
    );
  }

  if (!overview) {
    return <p className="text-gray-500 text-center py-10">Unable to load system health data.</p>;
  }

  const stats = overview.errors_24h;
  const latestRun = overview.latest_test_run;

  return (
    <motion.div variants={stagger} className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={fadeIn} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Database</span>
            <Database className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
            {overview.database.status}
          </p>
          <p className="text-xs text-gray-500 mt-1">{overview.database.latency_ms}ms latency</p>
        </motion.div>

        <motion.div variants={fadeIn} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Errors (24h)</span>
            <AlertTriangle className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-1">{stats.unresolved} unresolved</p>
        </motion.div>

        <motion.div variants={fadeIn} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Critical</span>
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.by_level?.CRITICAL || 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.by_level?.ERROR || 0} errors, {stats.by_level?.WARNING || 0} warnings
          </p>
        </motion.div>

        <motion.div variants={fadeIn} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Test Run</span>
            <FlaskConical className="w-5 h-5 text-blue-500" />
          </div>
          {latestRun ? (
            <>
              <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{latestRun.status}</p>
              <p className="text-xs text-gray-500 mt-1">{latestRun.run_type} &middot; {timeAgo(latestRun.started_at)}</p>
            </>
          ) : (
            <p className="text-sm text-gray-400">No test runs yet</p>
          )}
        </motion.div>
      </div>

      {/* Top Error Types & Failing Endpoints */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={fadeIn} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <Bug className="w-4 h-4" /> Top Error Types (24h)
          </h3>
          {stats.top_error_types.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No errors in the last 24 hours</p>
          ) : (
            <div className="space-y-2">
              {stats.top_error_types.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300 truncate mr-3">{item.type}</span>
                  <span className="font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-xs">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div variants={fadeIn} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Top Failing Endpoints (24h)
          </h3>
          {stats.top_failing_endpoints.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No endpoint errors in the last 24 hours</p>
          ) : (
            <div className="space-y-2">
              {stats.top_failing_endpoints.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300 truncate mr-3 font-mono text-xs">{item.endpoint}</span>
                  <span className="font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-xs">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

// ─── Errors Tab ─────────────────────────────────────────────────────

interface ErrorsTabProps {
  data: ErrorsPage | null;
  loading: boolean;
  page: number;
  setPage: (p: number) => void;
  search: string;
  setSearch: (s: string) => void;
  levelFilter: string;
  setLevelFilter: (l: string) => void;
  resolvedFilter: string;
  setResolvedFilter: (r: string) => void;
  selectedError: ErrorLogEntry | null;
  setSelectedError: (e: ErrorLogEntry | null) => void;
  diagnosing: boolean;
  resolving: boolean;
  onDiagnose: (id: string) => void;
  onResolve: (id: string) => void;
}

const ErrorsTab: React.FC<ErrorsTabProps> = ({
  data, loading, page, setPage, search, setSearch,
  levelFilter, setLevelFilter, resolvedFilter, setResolvedFilter,
  selectedError, setSelectedError, diagnosing, resolving,
  onDiagnose, onResolve,
}) => {
  return (
    <motion.div variants={stagger} className="space-y-4">
      {/* Filters */}
      <motion.div variants={fadeIn} className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by error type..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-800 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <select
            value={levelFilter}
            onChange={e => { setLevelFilter(e.target.value); setPage(1); }}
            className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-800 text-sm cursor-pointer"
          >
            <option value="">All Levels</option>
            <option value="CRITICAL">Critical</option>
            <option value="ERROR">Error</option>
            <option value="WARNING">Warning</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={resolvedFilter}
            onChange={e => { setResolvedFilter(e.target.value); setPage(1); }}
            className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-800 text-sm cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="false">Unresolved</option>
            <option value="true">Resolved</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeIn} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">No error logs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Level</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Message</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Source</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Time</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {data.items.map(err => (
                  <tr
                    key={err.id}
                    onClick={() => setSelectedError(err)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer transition"
                  >
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${levelColor(err.level)}`}>
                        {err.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300 max-w-[180px] truncate">
                      {err.error_type}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-[300px] truncate">
                      {err.message}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{err.source}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{timeAgo(err.created_at)}</td>
                    <td className="px-4 py-3">
                      {err.is_resolved ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && data.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
            <span className="text-xs text-gray-500">
              Page {data.page} of {data.pages} ({data.total} total)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(Math.min(data.pages, page + 1))}
                disabled={page >= data.pages}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Error Detail Modal */}
      {selectedError && (
        <ErrorDetailModal
          error={selectedError}
          onClose={() => setSelectedError(null)}
          diagnosing={diagnosing}
          resolving={resolving}
          onDiagnose={onDiagnose}
          onResolve={onResolve}
        />
      )}
    </motion.div>
  );
};

// ─── Error Detail Modal ─────────────────────────────────────────────

const ErrorDetailModal: React.FC<{
  error: ErrorLogEntry;
  onClose: () => void;
  diagnosing: boolean;
  resolving: boolean;
  onDiagnose: (id: string) => void;
  onResolve: (id: string) => void;
}> = ({ error, onClose, diagnosing, resolving, onDiagnose, onResolve }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${levelColor(error.level)}`}>
                {error.level}
              </span>
              <span className="font-mono text-sm text-gray-700 dark:text-gray-300">{error.error_type}</span>
            </div>
            <p className="text-xs text-gray-500">{new Date(error.created_at).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Message */}
          <div>
            <h4 className="text-xs font-semibold uppercase text-gray-400 mb-1">Message</h4>
            <p className="text-sm text-gray-800 dark:text-gray-200">{error.message}</p>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-xs text-gray-400">Source</span>
              <p className="text-gray-700 dark:text-gray-300">{error.source}</p>
            </div>
            <div>
              <span className="text-xs text-gray-400">Endpoint</span>
              <p className="font-mono text-xs text-gray-700 dark:text-gray-300">{error.method} {error.endpoint || 'N/A'}</p>
            </div>
            <div>
              <span className="text-xs text-gray-400">User</span>
              <p className="text-gray-700 dark:text-gray-300">{error.user_role || 'N/A'} {error.user_id ? `(${error.user_id.slice(0, 8)}...)` : ''}</p>
            </div>
            <div>
              <span className="text-xs text-gray-400">Resolved</span>
              <p className={error.is_resolved ? 'text-green-600' : 'text-red-500'}>{error.is_resolved ? 'Yes' : 'No'}</p>
            </div>
          </div>

          {/* Stack Trace */}
          {error.stack_trace && (
            <div>
              <h4 className="text-xs font-semibold uppercase text-gray-400 mb-1">Stack Trace</h4>
              <pre className="bg-gray-900 text-green-400 text-xs p-4 rounded-lg overflow-x-auto max-h-60 whitespace-pre-wrap">
                {error.stack_trace}
              </pre>
            </div>
          )}

          {/* Context */}
          {error.context && (
            <div>
              <h4 className="text-xs font-semibold uppercase text-gray-400 mb-1">Context</h4>
              <pre className="bg-gray-50 dark:bg-gray-700 text-xs p-3 rounded-lg overflow-x-auto max-h-40">
                {JSON.stringify(error.context, null, 2)}
              </pre>
            </div>
          )}

          {/* AI Diagnosis */}
          <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold uppercase text-gray-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> AI Diagnosis
              </h4>
              <button
                onClick={() => onDiagnose(error.id)}
                disabled={diagnosing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 disabled:opacity-50 transition"
              >
                {diagnosing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                {diagnosing ? 'Analyzing...' : error.ai_diagnosis ? 'Re-diagnose' : 'Diagnose with AI'}
              </button>
            </div>
            {error.ai_diagnosis ? (
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {error.ai_diagnosis}
                {error.ai_diagnosed_at && (
                  <p className="text-xs text-purple-400 mt-3">
                    Diagnosed {timeAgo(error.ai_diagnosed_at)}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Click "Diagnose with AI" to get an automated analysis and suggested fix.</p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 dark:border-gray-700">
          {!error.is_resolved && (
            <button
              onClick={() => onResolve(error.id)}
              disabled={resolving}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
            >
              {resolving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Mark Resolved
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Tests Tab ──────────────────────────────────────────────────────

const TestsTab: React.FC<{
  testRuns: TestRunsPage | null;
  loading: boolean;
  page: number;
  setPage: (p: number) => void;
  runningTest: string | null;
  activeRun: TestRun | null;
  onRunTests: (type: 'backend' | 'frontend' | 'all') => void;
}> = ({ testRuns, loading, page, setPage, runningTest, activeRun, onRunTests }) => {
  return (
    <motion.div variants={stagger} className="space-y-6">
      {/* Test Runner Controls */}
      <motion.div variants={fadeIn} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
          <Play className="w-4 h-4" /> Run Tests
        </h3>
        <div className="flex flex-wrap gap-3">
          {(['backend', 'frontend', 'all'] as const).map(type => (
            <button
              key={type}
              onClick={() => onRunTests(type)}
              disabled={!!runningTest}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition ${
                runningTest === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              } disabled:opacity-50`}
            >
              {runningTest === type ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FlaskConical className="w-4 h-4" />
              )}
              {type === 'all' ? 'Run All Tests' : `Run ${type.charAt(0).toUpperCase() + type.slice(1)} Tests`}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Active Test Run Output */}
      {activeRun && (
        <motion.div variants={fadeIn} className="bg-gray-900 rounded-xl shadow-sm border border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300 font-medium">
                Test Run: {activeRun.run_type}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(activeRun.status)}`}>
                {activeRun.status}
              </span>
            </div>
            {activeRun.duration_seconds && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {activeRun.duration_seconds}
              </span>
            )}
          </div>
          <div className="p-4 max-h-96 overflow-y-auto">
            <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
              {activeRun.output || (activeRun.status === 'running' ? 'Running tests...\n' : 'Waiting for output...')}
            </pre>
          </div>
          {activeRun.summary && (
            <div className="flex items-center gap-4 px-4 py-3 bg-gray-800 border-t border-gray-700">
              <span className="text-xs text-green-400 font-medium">
                Passed: {activeRun.summary.passed || 0}
              </span>
              <span className="text-xs text-red-400 font-medium">
                Failed: {activeRun.summary.failed || 0}
              </span>
              <span className="text-xs text-yellow-400 font-medium">
                Skipped: {activeRun.summary.skipped || 0}
              </span>
              <span className="text-xs text-gray-400">
                Total: {activeRun.summary.total || 0}
              </span>
            </div>
          )}
        </motion.div>
      )}

      {/* Test History */}
      <motion.div variants={fadeIn} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Test History
          </h3>
        </div>

        {loading ? (
          <div className="p-10 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
          </div>
        ) : !testRuns || testRuns.items.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">No test runs yet. Click a button above to start.</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {testRuns.items.map(run => (
              <div key={run.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(run.status)}`}>
                    {run.status}
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{run.run_type}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {run.summary && (
                    <span>
                      <span className="text-green-600">{run.summary.passed || 0}P</span>
                      {' / '}
                      <span className="text-red-500">{run.summary.failed || 0}F</span>
                    </span>
                  )}
                  {run.duration_seconds && <span>{run.duration_seconds}</span>}
                  <span>{timeAgo(run.started_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {testRuns && testRuns.total > 10 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
            <span className="text-xs text-gray-500">
              Page {testRuns.page} of {Math.ceil(testRuns.total / 10)}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= Math.ceil(testRuns.total / 10)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default SystemHealthPage;
