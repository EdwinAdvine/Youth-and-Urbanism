/**
 * Withdrawal Queue Page (Admin)
 *
 * Super Admin page for reviewing and processing withdrawal requests.
 */

import { useState, useEffect, useCallback } from 'react';
import { ArrowDownToLine, Check, X, Loader2, AlertCircle, Clock, Filter } from 'lucide-react';
import withdrawalService, { WithdrawalRequest } from '../../services/withdrawalService';

const STATUS_OPTIONS = [
  { value: '', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'failed', label: 'Failed' },
];

const STATUS_COLORS: Record<string, string> = {
  requested: 'bg-yellow-500/20 text-yellow-400',
  approved: 'bg-blue-500/20 text-blue-400',
  processing: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-green-500/20 text-green-400',
  failed: 'bg-red-500/20 text-red-400',
  rejected: 'bg-red-500/20 text-red-400',
};

export default function WithdrawalQueuePage() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadQueue = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await withdrawalService.getWithdrawalQueue(page, 20, statusFilter || undefined);
      setRequests(data.items);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load withdrawal queue');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try {
      await withdrawalService.approveWithdrawal(id);
      await loadQueue();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to approve withdrawal');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectId || !rejectReason.trim()) return;
    setActionLoading(rejectId);
    try {
      await withdrawalService.rejectWithdrawal(rejectId, rejectReason);
      setRejectId(null);
      setRejectReason('');
      await loadQueue();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reject withdrawal');
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <ArrowDownToLine className="w-7 h-7 text-copilot-cyan" />
            Withdrawal Queue
          </h1>
          <p className="text-zinc-400 mt-1">
            Review and process withdrawal requests. Target: 24 hours.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Filter className="w-4 h-4 text-zinc-500" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-copilot-cyan/50"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-copilot-cyan" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No withdrawal requests to review</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-800/50">
                <tr>
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium">User</th>
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium">Amount</th>
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium">Method</th>
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium">Submitted</th>
                  <th className="text-right px-4 py-3 text-zinc-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-zinc-800/30">
                    <td className="px-4 py-3">
                      <div className="text-white font-medium">{req.user_name || 'N/A'}</div>
                      <div className="text-zinc-500 text-xs">{req.user_email}</div>
                      <div className="text-zinc-600 text-xs capitalize">{req.user_role}</div>
                    </td>
                    <td className="px-4 py-3 text-white font-medium">
                      {req.currency} {req.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-zinc-300 text-xs">
                      {req.payout_method === 'mpesa_b2c' ? 'M-Pesa' : 'Bank Transfer'}
                      <div className="text-zinc-500 mt-0.5">
                        {req.payout_method === 'mpesa_b2c'
                          ? req.payout_details?.phone
                          : req.payout_details?.account_number}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${STATUS_COLORS[req.status] || 'bg-zinc-700 text-zinc-300'}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">
                      {new Date(req.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {req.status === 'requested' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(req.id)}
                            disabled={actionLoading === req.id}
                            className="p-1.5 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 disabled:opacity-50"
                            title="Approve & Process"
                          >
                            {actionLoading === req.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => setRejectId(req.id)}
                            disabled={actionLoading === req.id}
                            className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 disabled:opacity-50"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 bg-zinc-800 text-zinc-400 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-zinc-500 text-sm">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 bg-zinc-800 text-zinc-400 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Reject Modal */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-3">Reject Withdrawal</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              rows={3}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => { setRejectId(null); setRejectReason(''); }}
                className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || actionLoading === rejectId}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading === rejectId ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
