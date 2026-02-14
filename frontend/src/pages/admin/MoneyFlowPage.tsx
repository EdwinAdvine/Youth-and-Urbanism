import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  RefreshCw,
  Search,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import AdminPageHeader from '../../components/admin/shared/AdminPageHeader';
import AdminStatsCard from '../../components/admin/shared/AdminStatsCard';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type MoneyFlowTab = 'transactions' | 'refunds' | 'failed' | 'payouts';

interface Transaction {
  id: string;
  date: string;
  user: string;
  email: string;
  amount: number;
  type: 'payment' | 'subscription' | 'refund' | 'payout';
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  reference: string;
}

interface Refund {
  id: string;
  date: string;
  user: string;
  original_amount: number;
  refund_amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
}

interface FailedPayment {
  id: string;
  date: string;
  user: string;
  amount: number;
  method: string;
  error_code: string;
  retries: number;
  status: 'failed' | 'retrying' | 'resolved';
}

interface Payout {
  id: string;
  date: string;
  recipient: string;
  amount: number;
  method: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  scheduled_date: string;
}

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'TXN-001', date: '2025-01-15T10:30:00Z', user: 'Jane Wanjiku', email: 'jane@example.com', amount: 2500, type: 'subscription', status: 'completed', reference: 'MPESA-QK7F3H' },
  { id: 'TXN-002', date: '2025-01-15T09:15:00Z', user: 'Peter Ochieng', email: 'peter@example.com', amount: 1500, type: 'payment', status: 'completed', reference: 'MPESA-LM9P2T' },
  { id: 'TXN-003', date: '2025-01-15T08:45:00Z', user: 'Mary Akinyi', email: 'mary@example.com', amount: 3000, type: 'subscription', status: 'pending', reference: 'MPESA-NR4W8Y' },
  { id: 'TXN-004', date: '2025-01-14T16:20:00Z', user: 'David Kamau', email: 'david@example.com', amount: 500, type: 'refund', status: 'refunded', reference: 'MPESA-XC2B6K' },
  { id: 'TXN-005', date: '2025-01-14T14:00:00Z', user: 'Grace Njeri', email: 'grace@example.com', amount: 2500, type: 'subscription', status: 'failed', reference: 'MPESA-HJ5M1Q' },
  { id: 'TXN-006', date: '2025-01-14T11:30:00Z', user: 'John Mwangi', email: 'john@example.com', amount: 4500, type: 'payment', status: 'completed', reference: 'MPESA-FD8T3V' },
  { id: 'TXN-007', date: '2025-01-13T15:45:00Z', user: 'Sarah Wambui', email: 'sarah@example.com', amount: 1200, type: 'payout', status: 'completed', reference: 'MPESA-PL6N9A' },
  { id: 'TXN-008', date: '2025-01-13T12:00:00Z', user: 'Brian Otieno', email: 'brian@example.com', amount: 2500, type: 'subscription', status: 'completed', reference: 'MPESA-GT7R4E' },
];

const MOCK_REFUNDS: Refund[] = [
  { id: 'REF-001', date: '2025-01-15T08:00:00Z', user: 'Mary Akinyi', original_amount: 3000, refund_amount: 3000, reason: 'Duplicate charge', status: 'pending' },
  { id: 'REF-002', date: '2025-01-14T14:30:00Z', user: 'David Kamau', original_amount: 2500, refund_amount: 500, reason: 'Partial refund - downgrade', status: 'processed' },
  { id: 'REF-003', date: '2025-01-13T10:00:00Z', user: 'Anne Muthoni', original_amount: 1500, refund_amount: 1500, reason: 'Service not delivered', status: 'approved' },
  { id: 'REF-004', date: '2025-01-12T16:15:00Z', user: 'Tom Kipchoge', original_amount: 2500, refund_amount: 2500, reason: 'Cancelled within 24hrs', status: 'rejected' },
];

const MOCK_FAILED: FailedPayment[] = [
  { id: 'FP-001', date: '2025-01-15T09:45:00Z', user: 'Grace Njeri', amount: 2500, method: 'M-Pesa', error_code: 'INSUFFICIENT_FUNDS', retries: 2, status: 'retrying' },
  { id: 'FP-002', date: '2025-01-15T07:30:00Z', user: 'Kevin Omondi', amount: 1500, method: 'M-Pesa', error_code: 'TIMEOUT', retries: 3, status: 'failed' },
  { id: 'FP-003', date: '2025-01-14T18:00:00Z', user: 'Ruth Wangari', amount: 3000, method: 'Card', error_code: 'CARD_DECLINED', retries: 1, status: 'failed' },
  { id: 'FP-004', date: '2025-01-14T12:20:00Z', user: 'James Njoroge', amount: 2500, method: 'M-Pesa', error_code: 'NETWORK_ERROR', retries: 2, status: 'resolved' },
];

const MOCK_PAYOUTS: Payout[] = [
  { id: 'PAY-001', date: '2025-01-15T06:00:00Z', recipient: 'Instructor - Sarah Wambui', amount: 12000, method: 'M-Pesa', status: 'queued', scheduled_date: '2025-01-20' },
  { id: 'PAY-002', date: '2025-01-14T06:00:00Z', recipient: 'Partner - EduTech Kenya', amount: 45000, method: 'Bank Transfer', status: 'processing', scheduled_date: '2025-01-18' },
  { id: 'PAY-003', date: '2025-01-13T06:00:00Z', recipient: 'Instructor - John Mwangi', amount: 8500, method: 'M-Pesa', status: 'completed', scheduled_date: '2025-01-15' },
  { id: 'PAY-004', date: '2025-01-12T06:00:00Z', recipient: 'Partner - LearnAfrica', amount: 32000, method: 'Bank Transfer', status: 'completed', scheduled_date: '2025-01-14' },
];

/* ------------------------------------------------------------------ */
/* Badge helpers                                                       */
/* ------------------------------------------------------------------ */

const txStatusColors: Record<string, string> = {
  completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  failed: 'bg-red-500/20 text-red-400 border-red-500/30',
  refunded: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  approved: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  processed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  retrying: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  resolved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  queued: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  processing: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${
      txStatusColors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }`}
  >
    {status}
  </span>
);

const TypeBadge: React.FC<{ type: string }> = ({ type }) => {
  const colors: Record<string, string> = {
    payment: 'bg-green-500/20 text-green-400 border-green-500/30',
    subscription: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    refund: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    payout: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${
        colors[type] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      }`}
    >
      {type}
    </span>
  );
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const formatKES = (amount: number): string =>
  `KES ${amount.toLocaleString()}`;

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const MoneyFlowPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MoneyFlowTab>('transactions');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const tabs: { key: MoneyFlowTab; label: string; count: number }[] = [
    { key: 'transactions', label: 'Transactions', count: MOCK_TRANSACTIONS.length },
    { key: 'refunds', label: 'Refunds', count: MOCK_REFUNDS.length },
    { key: 'failed', label: 'Failed Payments', count: MOCK_FAILED.length },
    { key: 'payouts', label: 'Payouts', count: MOCK_PAYOUTS.length },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-gray-100 dark:bg-[#22272B] rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-gray-100 dark:bg-[#22272B] rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-80 bg-gray-100 dark:bg-[#22272B] rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <AdminPageHeader
        title="Money Flow"
        subtitle="Track all financial transactions, refunds, and payouts"
        breadcrumbs={[
          { label: 'Finance', path: '/dashboard/admin' },
          { label: 'Money Flow' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-[#444] transition-colors">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-[#22272B] border border-gray-300 dark:border-[#333] rounded-lg text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-[#444] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        }
      />

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatsCard
          title="Revenue Today"
          value="KES 48,500"
          icon={<ArrowUpRight className="w-5 h-5" />}
          trend={{ value: 12.3, label: 'vs yesterday', direction: 'up' }}
        />
        <AdminStatsCard
          title="Pending Refunds"
          value="2"
          icon={<ArrowDownLeft className="w-5 h-5" />}
          trend={{ value: 1, label: 'new today', direction: 'neutral' }}
        />
        <AdminStatsCard
          title="Failed Payments"
          value="3"
          icon={<AlertTriangle className="w-5 h-5" />}
          trend={{ value: 25, label: 'vs yesterday', direction: 'down' }}
        />
        <AdminStatsCard
          title="Payout Queue"
          value="KES 57,000"
          icon={<Clock className="w-5 h-5" />}
          trend={{ value: 2, label: 'pending payouts', direction: 'neutral' }}
        />
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex gap-1 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-[#E40000] text-gray-900 dark:text-white'
                : 'text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#22272B]'
            }`}
          >
            {tab.label}
            <span
              className={`px-1.5 py-0.5 rounded-full text-xs ${
                activeTab === tab.key ? 'bg-gray-200 dark:bg-white/20' : 'bg-gray-100 dark:bg-[#22272B] text-gray-400 dark:text-white/40'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
          <input
            type="text"
            placeholder="Search by user, reference, or amount..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#E40000]/50 transition-colors"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
          <select className="pl-10 pr-8 py-2.5 bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-lg text-gray-900 dark:text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-[#E40000]/50 transition-colors min-w-[140px]">
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </motion.div>

      {/* Table Content */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === 'transactions' && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-[#22272B] text-left">
                  <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Date</th>
                  <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">User</th>
                  <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Amount</th>
                  <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Type</th>
                  <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Status</th>
                  <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Reference</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_TRANSACTIONS.filter(
                  (t) =>
                    !search ||
                    t.user.toLowerCase().includes(search.toLowerCase()) ||
                    t.reference.toLowerCase().includes(search.toLowerCase())
                ).map((tx) => (
                  <tr key={tx.id} className="border-b border-gray-200 dark:border-[#22272B]/50 hover:bg-[#1E2327] transition-colors">
                    <td className="px-4 py-3 text-gray-500 dark:text-white/60">{formatDate(tx.date)}</td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="text-gray-900 dark:text-white font-medium">{tx.user}</span>
                        <span className="block text-xs text-gray-400 dark:text-white/40">{tx.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{formatKES(tx.amount)}</td>
                    <td className="px-4 py-3"><TypeBadge type={tx.type} /></td>
                    <td className="px-4 py-3"><StatusBadge status={tx.status} /></td>
                    <td className="px-4 py-3 text-gray-400 dark:text-white/40 font-mono text-xs">{tx.reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'refunds' && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-[#22272B] text-left">
                  <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Date</th>
                  <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">User</th>
                  <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Original</th>
                  <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Refund</th>
                  <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Reason</th>
                  <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_REFUNDS.map((ref) => (
                  <tr key={ref.id} className="border-b border-gray-200 dark:border-[#22272B]/50 hover:bg-[#1E2327] transition-colors">
                    <td className="px-4 py-3 text-gray-500 dark:text-white/60">{formatDate(ref.date)}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{ref.user}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-white/60">{formatKES(ref.original_amount)}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{formatKES(ref.refund_amount)}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-white/60">{ref.reason}</td>
                    <td className="px-4 py-3"><StatusBadge status={ref.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'failed' && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-[#22272B] text-left">
                  <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Date</th>
                  <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">User</th>
                  <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Amount</th>
                  <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Method</th>
                  <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Error</th>
                  <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Retries</th>
                  <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_FAILED.map((fp) => (
                  <tr key={fp.id} className="border-b border-gray-200 dark:border-[#22272B]/50 hover:bg-[#1E2327] transition-colors">
                    <td className="px-4 py-3 text-gray-500 dark:text-white/60">{formatDate(fp.date)}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{fp.user}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{formatKES(fp.amount)}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-white/60">{fp.method}</td>
                    <td className="px-4 py-3 text-red-400 font-mono text-xs">{fp.error_code}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-white/60">{fp.retries}</td>
                    <td className="px-4 py-3"><StatusBadge status={fp.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'payouts' && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-[#22272B] text-left">
                  <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Date</th>
                  <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Recipient</th>
                  <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Amount</th>
                  <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Method</th>
                  <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Scheduled</th>
                  <th className="px-4 py-3 text-gray-500 dark:text-white/60 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_PAYOUTS.map((po) => (
                  <tr key={po.id} className="border-b border-gray-200 dark:border-[#22272B]/50 hover:bg-[#1E2327] transition-colors">
                    <td className="px-4 py-3 text-gray-500 dark:text-white/60">{formatDate(po.date)}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{po.recipient}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">{formatKES(po.amount)}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-white/60">{po.method}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-white/60">{po.scheduled_date}</td>
                    <td className="px-4 py-3"><StatusBadge status={po.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-[#22272B]">
          <p className="text-xs text-gray-400 dark:text-white/40">Showing 1-8 of 8 results</p>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#22272B] text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 transition-colors" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-lg text-xs font-medium bg-[#E40000] text-gray-900 dark:text-white">1</button>
            <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#22272B] text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 transition-colors" disabled>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MoneyFlowPage;
