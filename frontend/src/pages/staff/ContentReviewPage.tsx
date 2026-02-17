import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { getModerationQueue, submitReview } from '@/services/staff/staffModerationService';
import type { ModerationItem } from '@/types/staff';

interface ReviewStats {
  totalPending: number;
  critical: number;
  highPriority: number;
  aiFlagged: number;
}

type ContentTypeFilter = 'all' | string;
type PriorityFilter = 'all' | 'critical' | 'high' | 'medium' | 'low';
type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'changes_requested' | 'escalated';

const ContentReviewPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [stats, setStats] = useState<ReviewStats>({ totalPending: 0, critical: 0, highPriority: 0, aiFlagged: 0 });
  const [contentTypeFilter, setContentTypeFilter] = useState<ContentTypeFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchQueue = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getModerationQueue();
      const fetchedItems = response.items;
      setItems(fetchedItems);
      setStats({
        totalPending: fetchedItems.filter((i) => i.status === 'pending').length,
        critical: fetchedItems.filter((i) => i.priority === 'critical').length,
        highPriority: fetchedItems.filter((i) => i.priority === 'high').length,
        aiFlagged: fetchedItems.filter((i) => i.ai_flags.length > 0).length,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load moderation queue');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const filteredItems = items.filter((item) => {
    if (contentTypeFilter !== 'all' && item.content_type !== contentTypeFilter) return false;
    if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    return true;
  });

  const getPriorityBadge = (priority: ModerationItem['priority']) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-500/20 text-red-400 border-red-500/30',
      high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      low: 'bg-green-500/20 text-green-400 border-green-500/30',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colors[priority]}`}>
        {priority}
      </span>
    );
  };

  const getStatusBadge = (status: ModerationItem['status']) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      approved: 'bg-green-500/20 text-green-400',
      rejected: 'bg-red-500/20 text-red-400',
      changes_requested: 'bg-blue-500/20 text-blue-400',
      escalated: 'bg-purple-500/20 text-purple-400',
    };
    const labels: Record<string, string> = {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      changes_requested: 'Changes Requested',
      escalated: 'Escalated',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getRiskBar = (score: number | null) => {
    if (score === null) return <span className="text-xs text-gray-400 dark:text-white/30">--</span>;
    const color = score >= 70 ? 'bg-red-500' : score >= 40 ? 'bg-yellow-500' : 'bg-green-500';
    return (
      <div className="flex items-center gap-2">
        <div className="w-16 h-1.5 bg-gray-100 dark:bg-[#22272B] rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
        </div>
        <span className={`text-xs font-medium ${getRiskColor(score)}`}>{score}</span>
      </div>
    );
  };

  const handleApprove = async (id: string) => {
    setActionInProgress(id);
    try {
      await submitReview(id, { decision: 'approved' });
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: 'approved' as const } : item)),
      );
      setStats((prev) => ({
        ...prev,
        totalPending: Math.max(0, prev.totalPending - 1),
      }));
    } catch (err) {
      console.error('Failed to approve:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionInProgress(id);
    try {
      await submitReview(id, { decision: 'rejected' });
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: 'rejected' as const } : item)),
      );
      setStats((prev) => ({
        ...prev,
        totalPending: Math.max(0, prev.totalPending - 1),
      }));
    } catch (err) {
      console.error('Failed to reject:', err);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleExportReport = () => {
    const headers = ['ID', 'Title', 'Content Type', 'Submitted By', 'Priority', 'AI Risk Score', 'Status', 'Created At'];
    const rows = filteredItems.map((item) => [
      item.id,
      `"${item.title}"`,
      item.content_type,
      `"${item.submitted_by.name}"`,
      item.priority,
      item.ai_risk_score ?? '',
      item.status,
      item.created_at,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `content-review-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-7 w-56 bg-white dark:bg-[#181C1F] rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] animate-pulse" />
          ))}
        </div>
        <div className="h-10 w-full bg-white dark:bg-[#181C1F] rounded-lg animate-pulse" />
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-14 bg-white dark:bg-[#181C1F] rounded-lg border border-gray-200 dark:border-[#22272B] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <p className="text-lg text-gray-900 dark:text-white font-medium mb-2">Failed to load review queue</p>
          <p className="text-sm text-gray-500 dark:text-white/50 mb-4">{error}</p>
          <button
            onClick={fetchQueue}
            className="px-4 py-2 bg-[#E40000]/20 text-[#FF4444] rounded-lg hover:bg-[#E40000]/30"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Content Review Queue</h1>
          <p className="text-sm text-gray-500 dark:text-white/50 mt-1">
            Review, approve, or reject flagged content across the platform
          </p>
        </div>
        <button
          onClick={handleExportReport}
          className="px-4 py-2 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg text-sm text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:border-[#E40000]/50 transition-colors"
        >
          Export Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Pending', value: stats.totalPending, color: 'text-gray-900 dark:text-white' },
          { label: 'Critical', value: stats.critical, color: 'text-red-400' },
          { label: 'High Priority', value: stats.highPriority, color: 'text-orange-400' },
          { label: 'AI-Flagged', value: stats.aiFlagged, color: 'text-purple-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] p-4">
            <p className="text-xs text-gray-500 dark:text-white/50 uppercase tracking-wider">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B]">
        <select
          value={contentTypeFilter}
          onChange={(e) => setContentTypeFilter(e.target.value as ContentTypeFilter)}
          className="px-3 py-1.5 bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-lg text-sm text-gray-600 dark:text-white/70 focus:outline-none focus:border-[#E40000]/50"
        >
          <option value="all">All Types</option>
          <option value="lesson">Lesson</option>
          <option value="assignment">Assignment</option>
          <option value="quiz">Quiz</option>
          <option value="forum_post">Forum Post</option>
          <option value="resource">Resource</option>
          <option value="video">Video</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
          className="px-3 py-1.5 bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-lg text-sm text-gray-600 dark:text-white/70 focus:outline-none focus:border-[#E40000]/50"
        >
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="px-3 py-1.5 bg-gray-50 dark:bg-[#0F1112] border border-gray-200 dark:border-[#22272B] rounded-lg text-sm text-gray-600 dark:text-white/70 focus:outline-none focus:border-[#E40000]/50"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="changes_requested">Changes Requested</option>
          <option value="escalated">Escalated</option>
        </select>
        <span className="text-xs text-gray-400 dark:text-white/40 ml-auto">
          {filteredItems.length} of {items.length} items
        </span>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-[#181C1F] rounded-xl border border-gray-200 dark:border-[#22272B] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#22272B]">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-white/50 uppercase tracking-wider">Content</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-white/50 uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-white/50 uppercase tracking-wider">Submitted By</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-white/50 uppercase tracking-wider">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-white/50 uppercase tracking-wider">AI Risk</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-white/50 uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-white/50 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#22272B]">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400 dark:text-white/40">
                    No items match the current filters
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white font-medium">{item.title}</p>
                        <p className="text-xs text-gray-400 dark:text-white/40 mt-0.5">
                          {item.description || item.category || 'No description'}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500 dark:text-white/60 bg-gray-50 dark:bg-[#0F1112] px-2 py-1 rounded capitalize">
                        {item.content_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-gray-700 dark:text-white/80">{item.submitted_by.name}</p>
                        <p className="text-xs text-gray-400 dark:text-white/40">{item.submitted_by.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">{getPriorityBadge(item.priority)}</td>
                    <td className="px-4 py-3">{getRiskBar(item.ai_risk_score)}</td>
                    <td className="px-4 py-3">{getStatusBadge(item.status)}</td>
                    <td className="px-4 py-3 text-right">
                      {item.status === 'pending' || item.status === 'escalated' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(item.id)}
                            disabled={actionInProgress === item.id}
                            className="px-3 py-1 text-xs font-medium text-green-400 bg-green-500/10 border border-green-500/20 rounded hover:bg-green-500/20 transition-colors disabled:opacity-50"
                          >
                            {actionInProgress === item.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              'Approve'
                            )}
                          </button>
                          <button
                            onClick={() => handleReject(item.id)}
                            disabled={actionInProgress === item.id}
                            className="px-3 py-1 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded hover:bg-red-500/20 transition-colors disabled:opacity-50"
                          >
                            {actionInProgress === item.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              'Reject'
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-white/30">--</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ContentReviewPage;
