/**
 * Child Wallet Page
 *
 * Allows parents to view and top up their child's wallet balance,
 * and view recent wallet transactions.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wallet, ArrowLeft, RefreshCw, Plus, ArrowUpRight, ArrowDownLeft,
} from 'lucide-react';
import childWalletService, { ChildWalletBalance } from '../../services/parent/childWalletService';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const ChildWalletPage: React.FC = () => {
  const navigate = useNavigate();
  const { childId } = useParams<{ childId: string }>();
  const [balance, setBalance] = useState<ChildWalletBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (childId) loadBalance();
  }, [childId]);

  const loadBalance = async () => {
    if (!childId) return;
    try {
      setLoading(true);
      const data = await childWalletService.getChildWalletBalance(childId);
      setBalance(data);
    } catch (error) {
      console.error('Failed to load wallet balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopUp = async () => {
    if (!childId || !topUpAmount) return;
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }
    try {
      setTopUpLoading(true);
      await childWalletService.topUpChildWallet(childId, amount);
      setMessage({ type: 'success', text: `KES ${amount.toLocaleString()} added successfully` });
      setTopUpAmount('');
      setShowTopUp(false);
      await loadBalance();
    } catch (error) {
      console.error('Top-up failed:', error);
      setMessage({ type: 'error', text: 'Top-up failed. Please try again.' });
    } finally {
      setTopUpLoading(false);
    }
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
        onClick={() => navigate('/dashboard/parent/children')}
        className="flex items-center gap-2 text-gray-700 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back to Children</span>
      </button>

      {/* Header */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#E40000] to-[#FF0000] rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Child Wallet</h1>
              <p className="text-gray-500 dark:text-white/60 mt-1">
                Manage your child's wallet balance
              </p>
            </div>
          </div>
          <button
            onClick={loadBalance}
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

      {/* Balance Card */}
      {balance && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-gradient-to-br from-[#22272B] to-[#181C1F] border border-[#22272B] rounded-xl p-8">
            <p className="text-white/60 text-sm mb-1">Current Balance</p>
            <p className="text-4xl font-bold text-white mb-6">
              {balance.currency} {balance.balance.toLocaleString()}
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <ArrowDownLeft className="w-4 h-4 text-green-400" />
                  <p className="text-white/50 text-xs">Total Credited</p>
                </div>
                <p className="text-lg font-semibold text-white">
                  {balance.currency} {balance.total_credited.toLocaleString()}
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <ArrowUpRight className="w-4 h-4 text-red-400" />
                  <p className="text-white/50 text-xs">Total Spent</p>
                </div>
                <p className="text-lg font-semibold text-white">
                  {balance.currency} {balance.total_debited.toLocaleString()}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowTopUp(!showTopUp)}
              className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#E40000] hover:bg-[#FF0000] text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Top Up Wallet
            </button>
          </div>
        </motion.div>
      )}

      {/* Top Up Form */}
      {showTopUp && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Funds</h3>

            {/* Quick Amounts */}
            <div className="flex flex-wrap gap-2 mb-4">
              {[100, 250, 500, 1000, 2500].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setTopUpAmount(String(amt))}
                  className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                    topUpAmount === String(amt)
                      ? 'bg-[#E40000] border-[#E40000] text-white'
                      : 'bg-white dark:bg-[#181C1F] border-gray-200 dark:border-[#181C1F] text-gray-700 dark:text-white/80 hover:border-[#E40000]'
                  }`}
                >
                  KES {amt.toLocaleString()}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm text-gray-500 dark:text-white/60 mb-1">Custom Amount (KES)</label>
                <input
                  type="number"
                  min="1"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#181C1F] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#E40000]/50"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleTopUp}
                  disabled={topUpLoading || !topUpAmount}
                  className="px-6 py-3 bg-[#E40000] hover:bg-[#FF0000] disabled:bg-gray-300 dark:disabled:bg-[#181C1F] disabled:text-gray-500 text-white rounded-lg font-medium transition-colors"
                >
                  {topUpLoading ? 'Processing...' : 'Add Funds'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Links */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate(`/dashboard/parent/children/${childId}/spending-limits`)}
            className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl p-5 text-left hover:bg-gray-200 dark:hover:bg-[#2A2E33] transition-colors"
          >
            <h3 className="text-gray-900 dark:text-white font-medium mb-1">Spending Limits</h3>
            <p className="text-gray-500 dark:text-white/50 text-sm">Configure purchase approval settings</p>
          </button>
          <button
            onClick={() => navigate('/dashboard/parent/purchase-approvals')}
            className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl p-5 text-left hover:bg-gray-200 dark:hover:bg-[#2A2E33] transition-colors"
          >
            <h3 className="text-gray-900 dark:text-white font-medium mb-1">Purchase Approvals</h3>
            <p className="text-gray-500 dark:text-white/50 text-sm">Review pending purchase requests</p>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ChildWalletPage;
