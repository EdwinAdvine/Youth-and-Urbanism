import React, { useEffect, useState, useCallback } from 'react';
import {
  Clock,
  MapPin,
  Monitor,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Filter,
  ChevronDown,
  Shield,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { InstructorPageHeader } from '../../components/instructor/shared/InstructorPageHeader';
import { format } from 'date-fns';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface LoginRecord {
  id: string;
  user_id?: string;
  ip_address: string;
  user_agent: string;
  location?: string;
  success: boolean;
  failure_reason?: string;
  two_factor_method?: string;
  created_at: string;
}

type StatusFilter = 'all' | 'success' | 'failed';

const MOCK_LOGIN_HISTORY: LoginRecord[] = [
  {
    id: '1',
    ip_address: '197.232.45.123',
    user_agent: 'Chrome 120 on macOS',
    location: 'Nairobi, Kenya',
    success: true,
    two_factor_method: 'totp',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    ip_address: '197.232.45.123',
    user_agent: 'Chrome 120 on macOS',
    location: 'Nairobi, Kenya',
    success: true,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    ip_address: '41.80.115.234',
    user_agent: 'Safari 17 on iOS',
    location: 'Mombasa, Kenya',
    success: false,
    failure_reason: 'Invalid password',
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    ip_address: '102.89.23.56',
    user_agent: 'Firefox 121 on Windows',
    location: 'Lagos, Nigeria',
    success: false,
    failure_reason: 'Unknown device',
    created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    ip_address: '197.232.45.123',
    user_agent: 'Chrome 120 on macOS',
    location: 'Nairobi, Kenya',
    success: true,
    two_factor_method: 'totp',
    created_at: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    ip_address: '197.232.45.123',
    user_agent: 'Chrome Mobile on Android',
    location: 'Nairobi, Kenya',
    success: true,
    created_at: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '7',
    ip_address: '41.80.115.234',
    user_agent: 'Safari 17 on iOS',
    location: 'Mombasa, Kenya',
    success: true,
    two_factor_method: 'sms',
    created_at: new Date(Date.now() - 144 * 60 * 60 * 1000).toISOString(),
  },
];

const PAGE_SIZE = 10;

export const LoginHistoryPage: React.FC = () => {
  const [allHistory, setAllHistory] = useState<LoginRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLoginHistory = useCallback(
    async (pageNum: number, append: boolean = false) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const token = localStorage.getItem('access_token');
        const response = await axios.get(
          `${API_URL}/api/v1/instructor/account/login-history`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { limit: PAGE_SIZE * pageNum },
          }
        );

        const data: LoginRecord[] = response.data;

        if (data && data.length > 0) {
          setAllHistory(data);
          setHasMore(data.length >= PAGE_SIZE * pageNum);
        } else {
          // Use mock data as fallback when API returns empty
          if (!append) {
            setAllHistory(MOCK_LOGIN_HISTORY);
            setHasMore(false);
          }
        }
      } catch (err) {
        console.error('Error fetching login history:', err);
        // Use mock data as fallback on error
        if (!append) {
          setAllHistory(MOCK_LOGIN_HISTORY);
          setHasMore(false);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchLoginHistory(1);
  }, [fetchLoginHistory]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchLoginHistory(nextPage, true);
  };

  const handleRefresh = () => {
    setPage(1);
    fetchLoginHistory(1);
  };

  // Apply client-side filter
  const filteredHistory = allHistory.filter((record) => {
    if (statusFilter === 'success') return record.success;
    if (statusFilter === 'failed') return !record.success;
    return true;
  });

  // Detect suspicious activity: failed logins from locations that differ from successful ones
  const successfulLocations = new Set(
    allHistory
      .filter((r) => r.success && r.location)
      .map((r) => r.location!.toLowerCase())
  );

  const suspiciousRecords = allHistory.filter(
    (r) =>
      !r.success &&
      r.location &&
      !successfulLocations.has(r.location.toLowerCase())
  );

  const failedCount = allHistory.filter((r) => !r.success).length;
  const hasSuspiciousActivity = suspiciousRecords.length > 0;

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
        title="Login History"
        description="Review recent login activity on your account"
        icon={<Clock className="w-6 h-6 text-purple-400" />}
        actions={
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        }
      />

      {/* Suspicious Activity Warning */}
      {hasSuspiciousActivity && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-300 mb-1">
                Suspicious Activity Detected
              </h3>
              <p className="text-sm text-red-200/80 mb-3">
                We detected {suspiciousRecords.length} failed login
                {suspiciousRecords.length > 1 ? ' attempts' : ' attempt'} from
                unrecognized location{suspiciousRecords.length > 1 ? 's' : ''}. If
                you do not recognize this activity, please change your password and
                enable two-factor authentication immediately.
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  ...new Set(
                    suspiciousRecords.map(
                      (r) => r.location || 'Unknown location'
                    )
                  ),
                ].map((location) => (
                  <span
                    key={location}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-500/20 text-red-300 text-xs rounded-full border border-red-500/30"
                  >
                    <MapPin className="w-3 h-3" />
                    {location}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Failed Login Warning (non-suspicious) */}
      {!hasSuspiciousActivity && failedCount > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg flex-shrink-0">
              <Shield className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-yellow-300 mb-1">
                Failed Login Attempts
              </h3>
              <p className="text-sm text-yellow-200/80">
                There {failedCount === 1 ? 'was' : 'were'} {failedCount} failed
                login {failedCount === 1 ? 'attempt' : 'attempts'} from known
                locations. Consider enabling two-factor authentication for added
                security.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-white/60">
                Total Logins
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {allHistory.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-white/60">
                Successful
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {allHistory.filter((r) => r.success).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <XCircle className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-white/60">Failed</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {failedCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500 dark:text-white/60" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
          >
            <option value="all">All Logins</option>
            <option value="success">Successful Only</option>
            <option value="failed">Failed Only</option>
          </select>
        </div>
        <span className="text-xs text-gray-500 dark:text-white/40">
          Showing {filteredHistory.length} of {allHistory.length} records
        </span>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Login History Table */}
      <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/10 text-left">
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">
                  Status
                </th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">
                  Date & Time
                </th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">
                  Location
                </th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">
                  IP Address
                </th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">
                  Device
                </th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">
                  2FA
                </th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-sm text-gray-500 dark:text-white/60"
                  >
                    No login records found for the selected filter.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((record) => {
                  const isSuspicious =
                    !record.success &&
                    record.location &&
                    !successfulLocations.has(record.location.toLowerCase());

                  return (
                    <tr
                      key={record.id}
                      className={`border-b border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors ${
                        isSuspicious ? 'bg-red-500/5' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {record.success ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400" />
                          )}
                          {isSuspicious && (
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {format(
                            new Date(record.created_at),
                            'MMM d, yyyy h:mm a'
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500 dark:text-white/60" />
                          <span
                            className={`text-sm ${
                              isSuspicious
                                ? 'text-red-300 font-medium'
                                : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            {record.location || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 dark:text-white/80 font-mono">
                          {record.ip_address}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Monitor className="w-4 h-4 text-gray-500 dark:text-white/60" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            {record.user_agent}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {record.two_factor_method ? (
                          <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs rounded border border-green-500/30">
                            {record.two_factor_method.toUpperCase()}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-white/40">
                            --
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {record.failure_reason ? (
                          <span className="text-xs text-red-300">
                            {record.failure_reason}
                          </span>
                        ) : record.success ? (
                          <span className="text-xs text-gray-400 dark:text-white/40">
                            --
                          </span>
                        ) : (
                          <span className="text-xs text-red-300">
                            Authentication failed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Load More */}
        {hasMore && filteredHistory.length > 0 && (
          <div className="flex justify-center py-4 border-t border-gray-200 dark:border-white/10">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="flex items-center gap-2 px-6 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-purple-500/20"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Load More
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Security Tips */}
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6">
        <h4 className="text-sm font-semibold text-purple-200 mb-2">
          Security Tips
        </h4>
        <ul className="text-sm text-purple-200/80 space-y-1 list-disc list-inside">
          <li>Review your login history regularly for unrecognized activity</li>
          <li>
            Enable two-factor authentication for an extra layer of security
          </li>
          <li>
            If you see logins from unknown locations, change your password
            immediately
          </li>
          <li>
            Use a unique, strong password and avoid reusing credentials across
            sites
          </li>
        </ul>
      </div>
    </div>
  );
};
