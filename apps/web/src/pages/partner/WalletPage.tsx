/**
 * Partner Wallet Page
 *
 * Allows partners/sponsors to view wallet balance, top-up,
 * view transactions, and request withdrawals.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wallet, ArrowLeft, RefreshCw, Plus, ArrowUpRight, ArrowDownLeft,
  Clock, Send,
} from 'lucide-react';
import partnerWalletService, {
  WalletBalance, WalletTransaction,
} from '../../services/partner/partnerWalletService';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const WalletPage: React.FC = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Top-up state
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpLoading, setTopUpLoading] = useState(false);

  // Withdraw state
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('mpesa_b2c');
  const [withdrawPhone, setWithdrawPhone] = useState('');
  const [withdrawBank, setWithdrawBank] = useState('');
  const [withdrawAccount, setWithdrawAccount] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bal, txns] = await Promise.all([
        partnerWalletService.getBalance(),
        partnerWalletService.getTransactions(),
      ]);
      setBalance(bal);
      setTransactions(txns.items);
    } catch (error) {
      console.error('Failed to load wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage({ type: 'error', text: 'Enter a valid amount' });
      return;
    }
    try {
      setTopUpLoading(true);
      await partnerWalletService.topUp(amount);
      setMessage({ type: 'success', text: `KES ${amount.toLocaleString()} added to wallet` });
      setTopUpAmount('');
      setShowTopUp(false);
      await loadData();
    } catch {
      setMessage({ type: 'error', text: 'Top-up failed' });
    } finally {
      setTopUpLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage({ type: 'error', text: 'Enter a valid amount' });
      return;
    }

    const details: Record<string, string> =
      withdrawMethod === 'mpesa_b2c'
        ? { phone: withdrawPhone }
        : { bank_name: withdrawBank, account_number: withdrawAccount };

    try {
      setWithdrawLoading(true);
      await partnerWalletService.requestWithdrawal(amount, withdrawMethod, details);
      setMessage({ type: 'success', text: 'Withdrawal request submitted for approval' });
      setWithdrawAmount('');
      setShowWithdraw(false);
      await loadData();
    } catch (error: any) {
      const detail = error?.response?.data?.detail || 'Withdrawal request failed';
      setMessage({ type: 'error', text: detail });
    } finally {
      setWithdrawLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'pending':
      case 'requested':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'failed':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
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
        onClick={() => navigate('/dashboard/partner')}
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
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Wallet</h1>
              <p className="text-gray-500 dark:text-white/60 mt-1">
                Manage your funds and transactions
              </p>
            </div>
          </div>
          <button
            onClick={loadData}
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
            <p className="text-white/60 text-sm mb-1">Available Balance</p>
            <p className="text-4xl font-bold text-white mb-6">
              {balance.currency} {balance.balance.toLocaleString()}
            </p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center gap-1 mb-1">
                  <ArrowDownLeft className="w-3 h-3 text-green-400" />
                  <p className="text-white/50 text-xs">Credited</p>
                </div>
                <p className="text-sm font-semibold text-white">
                  {balance.currency} {balance.total_credited.toLocaleString()}
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center gap-1 mb-1">
                  <ArrowUpRight className="w-3 h-3 text-orange-400" />
                  <p className="text-white/50 text-xs">Spent</p>
                </div>
                <p className="text-sm font-semibold text-white">
                  {balance.currency} {balance.total_debited.toLocaleString()}
                </p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center gap-1 mb-1">
                  <Send className="w-3 h-3 text-blue-400" />
                  <p className="text-white/50 text-xs">Withdrawn</p>
                </div>
                <p className="text-sm font-semibold text-white">
                  {balance.currency} {balance.total_withdrawn.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowTopUp(!showTopUp); setShowWithdraw(false); }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#E40000] hover:bg-[#FF0000] text-white rounded-lg font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                Top Up
              </button>
              <button
                onClick={() => { setShowWithdraw(!showWithdraw); setShowTopUp(false); }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
              >
                <Send className="w-5 h-5" />
                Withdraw
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Top Up Form */}
      {showTopUp && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Funds</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {[5000, 10000, 25000, 50000, 100000].map((amt) => (
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
              <input
                type="number"
                min="1"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                placeholder="Custom amount"
                className="flex-1 px-4 py-3 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#181C1F] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#E40000]/50"
              />
              <button
                onClick={handleTopUp}
                disabled={topUpLoading || !topUpAmount}
                className="px-6 py-3 bg-[#E40000] hover:bg-[#FF0000] disabled:bg-gray-300 dark:disabled:bg-[#181C1F] disabled:text-gray-500 text-white rounded-lg font-medium transition-colors"
              >
                {topUpLoading ? 'Processing...' : 'Add Funds'}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Withdraw Form */}
      {showWithdraw && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Request Withdrawal</h3>

            <div>
              <label className="block text-sm text-gray-500 dark:text-white/60 mb-1">Amount (KES)</label>
              <input
                type="number"
                min="1"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-3 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#181C1F] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#E40000]/50"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-500 dark:text-white/60 mb-1">Payout Method</label>
              <select
                value={withdrawMethod}
                onChange={(e) => setWithdrawMethod(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#181C1F] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E40000]/50"
              >
                <option value="mpesa_b2c">M-Pesa</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>

            {withdrawMethod === 'mpesa_b2c' ? (
              <div>
                <label className="block text-sm text-gray-500 dark:text-white/60 mb-1">M-Pesa Phone Number</label>
                <input
                  type="tel"
                  value={withdrawPhone}
                  onChange={(e) => setWithdrawPhone(e.target.value)}
                  placeholder="254712345678"
                  className="w-full px-4 py-3 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#181C1F] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#E40000]/50"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm text-gray-500 dark:text-white/60 mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={withdrawBank}
                    onChange={(e) => setWithdrawBank(e.target.value)}
                    placeholder="e.g. Equity Bank"
                    className="w-full px-4 py-3 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#181C1F] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#E40000]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 dark:text-white/60 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={withdrawAccount}
                    onChange={(e) => setWithdrawAccount(e.target.value)}
                    placeholder="Account number"
                    className="w-full px-4 py-3 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#181C1F] rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#E40000]/50"
                  />
                </div>
              </>
            )}

            <button
              onClick={handleWithdraw}
              disabled={withdrawLoading || !withdrawAmount}
              className="w-full px-6 py-3 bg-[#E40000] hover:bg-[#FF0000] disabled:bg-gray-300 dark:disabled:bg-[#181C1F] disabled:text-gray-500 text-white rounded-lg font-medium transition-colors"
            >
              {withdrawLoading ? 'Submitting...' : 'Submit Withdrawal Request'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Transactions */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Transactions</h2>
      </motion.div>

      {transactions.length > 0 ? (
        <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-2">
          {transactions.map((tx) => (
            <motion.div
              key={tx.id}
              variants={fadeUp}
              className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  tx.transaction_type.includes('top_up') || tx.transaction_type.includes('credit')
                    ? 'bg-green-500/20'
                    : 'bg-red-500/20'
                }`}>
                  {tx.transaction_type.includes('top_up') || tx.transaction_type.includes('credit') ? (
                    <ArrowDownLeft className="w-4 h-4 text-green-400" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4 text-red-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-900 dark:text-white font-medium capitalize">
                    {tx.description.replace(/_/g, ' ')}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-white/40">
                    <Clock className="w-3 h-3" />
                    {new Date(tx.created_at).toLocaleDateString()}
                    <span className="text-gray-300 dark:text-white/20">|</span>
                    {tx.reference}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${
                  tx.transaction_type.includes('top_up') || tx.transaction_type.includes('credit')
                    ? 'text-green-400'
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {tx.transaction_type.includes('top_up') || tx.transaction_type.includes('credit') ? '+' : '-'}
                  {tx.currency} {tx.amount.toLocaleString()}
                </p>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${getStatusBadge(tx.status)}`}>
                  {tx.status}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-12 text-center">
            <Wallet className="w-16 h-16 text-gray-400 dark:text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No transactions yet
            </h3>
            <p className="text-gray-500 dark:text-white/60 text-sm">
              Your wallet transactions will appear here.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default WalletPage;
