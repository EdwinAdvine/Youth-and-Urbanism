/**
 * Purchase Approvals Page
 *
 * Allows parents to view and act on pending purchase requests
 * from their children.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck, ArrowLeft, RefreshCw, Check, X, Clock, ShoppingCart,
} from 'lucide-react';
import childWalletService, { PurchaseRequest } from '../../services/parent/childWalletService';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const PurchaseApprovalsPage: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await childWalletService.getPendingApprovals();
      setRequests(data);
    } catch (error) {
      console.error('Failed to load purchase requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      setActionLoading(requestId);
      await childWalletService.approvePurchase(requestId);
      setMessage({ type: 'success', text: 'Purchase approved' });
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (error) {
      console.error('Failed to approve purchase:', error);
      setMessage({ type: 'error', text: 'Failed to approve purchase' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectId) return;
    try {
      setActionLoading(rejectId);
      await childWalletService.rejectPurchase(rejectId, rejectReason || undefined);
      setMessage({ type: 'success', text: 'Purchase rejected' });
      setRequests((prev) => prev.filter((r) => r.id !== rejectId));
      setRejectId(null);
      setRejectReason('');
    } catch (error) {
      console.error('Failed to reject purchase:', error);
      setMessage({ type: 'error', text: 'Failed to reject purchase' });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'approved':
      case 'auto_approved':
        return 'bg-green-500/20 text-green-400';
      case 'rejected':
        return 'bg-red-500/20 text-red-400';
      case 'expired':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const timeRemaining = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${mins}m left`;
    return `${mins}m left`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E40000]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard/parent')}
        className="flex items-center gap-2 text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back to Dashboard</span>
      </button>

      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#E40000] to-[#FF0000] rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Purchase Approvals</h1>
              <p className="text-gray-500 dark:text-white/60 mt-1">
                Review and approve your children's purchase requests
              </p>
            </div>
          </div>
          <button
            onClick={loadRequests}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] text-gray-700 dark:text-white/80 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-[#2A2E33] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Message */}
      {message && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className={`rounded-xl p-4 text-sm ${
            message.type === 'success'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {message.text}
          </div>
        </motion.div>
      )}

      {/* Rejection Modal */}
      {rejectId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-[#22272B] rounded-xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Reject Purchase</h3>
            <label className="block text-sm text-gray-500 dark:text-white/60 mb-2">Reason (optional)</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Why are you rejecting this purchase?"
              rows={3}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-[#181C1F] border border-gray-200 dark:border-[#181C1F] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#E40000]/50 mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setRejectId(null); setRejectReason(''); }}
                className="px-4 py-2 text-sm text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading === rejectId}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {actionLoading === rejectId ? 'Rejecting...' : 'Reject Purchase'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Requests List */}
      {requests.length > 0 ? (
        <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-3">
          {requests.map((request) => (
            <motion.div
              key={request.id}
              variants={fadeUp}
              className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-gray-900 dark:text-white font-medium">{request.item_name}</h3>
                  <p className="text-gray-500 dark:text-white/50 text-sm capitalize">{request.purchase_type.replace(/_/g, ' ')}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadge(request.status)}`}>
                  {request.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-900 dark:text-white font-bold">
                    {request.currency} {request.amount.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 text-gray-500 dark:text-white/40">
                    <Clock className="w-3 h-3" />
                    {timeRemaining(request.expires_at)}
                  </span>
                </div>

                {request.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(request.id)}
                      disabled={actionLoading === request.id}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => setRejectId(request.id)}
                      disabled={actionLoading === request.id}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-400 dark:text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No pending approvals
            </h3>
            <p className="text-gray-500 dark:text-white/60 text-sm">
              When your children request purchases, they will appear here for your review.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PurchaseApprovalsPage;
