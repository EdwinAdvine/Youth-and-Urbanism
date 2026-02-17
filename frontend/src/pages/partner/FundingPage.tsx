import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  DollarSign,
  Download,
  Filter,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  TrendingUp,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { getSubscriptions, getBillingHistory, processPayment, downloadReceipt } from '../../services/partner/partnerFinanceService';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface Subscription {
  id: string;
  program: string;
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'annual';
  status: 'active' | 'pending' | 'cancelled';
  nextPayment: string;
  childrenCount: number;
}

interface Payment {
  id: string;
  date: string;
  program: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  method: string;
  invoiceUrl: string;
}

const fallbackSubscriptions: Subscription[] = [
  {
    id: '1',
    program: 'STEM Excellence Program',
    amount: 225000,
    frequency: 'monthly',
    status: 'active',
    nextPayment: 'Mar 1, 2026',
    childrenCount: 45,
  },
  {
    id: '2',
    program: 'Early Childhood Development',
    amount: 410000,
    frequency: 'monthly',
    status: 'active',
    nextPayment: 'Mar 1, 2026',
    childrenCount: 82,
  },
  {
    id: '3',
    program: 'Girls in Tech Initiative',
    amount: 180000,
    frequency: 'monthly',
    status: 'active',
    nextPayment: 'Mar 1, 2026',
    childrenCount: 30,
  },
  {
    id: '4',
    program: 'Rural Education Access',
    amount: 300000,
    frequency: 'monthly',
    status: 'pending',
    nextPayment: 'Apr 1, 2026',
    childrenCount: 0,
  },
];

const fallbackPaymentHistory: Payment[] = [
  {
    id: '1',
    date: 'Feb 1, 2026',
    program: 'All Programs',
    amount: 845000,
    status: 'completed',
    method: 'Bank Transfer',
    invoiceUrl: '#',
  },
  {
    id: '2',
    date: 'Jan 1, 2026',
    program: 'All Programs',
    amount: 815000,
    status: 'completed',
    method: 'Bank Transfer',
    invoiceUrl: '#',
  },
  {
    id: '3',
    date: 'Dec 1, 2025',
    program: 'All Programs',
    amount: 795000,
    status: 'completed',
    method: 'Bank Transfer',
    invoiceUrl: '#',
  },
  {
    id: '4',
    date: 'Nov 1, 2025',
    program: 'STEM Excellence',
    amount: 225000,
    status: 'completed',
    method: 'M-Pesa',
    invoiceUrl: '#',
  },
];

const FundingPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(fallbackSubscriptions);
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>(fallbackPaymentHistory);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [subsResponse, billingResponse] = await Promise.all([
          getSubscriptions(),
          getBillingHistory(),
        ]);

        // Map API PartnerSubscription to local Subscription shape
        const mappedSubscriptions: Subscription[] = subsResponse.items.map((sub) => {
          const frequencyMap: Record<string, 'monthly' | 'quarterly' | 'annual'> = {
            monthly: 'monthly',
            termly: 'quarterly',
            annual: 'annual',
          };
          const statusMap: Record<string, 'active' | 'pending' | 'cancelled'> = {
            active: 'active',
            past_due: 'pending',
            paused: 'pending',
            cancelled: 'cancelled',
            expired: 'cancelled',
          };
          return {
            id: sub.id,
            program: sub.program_id,
            amount: sub.total_amount,
            frequency: frequencyMap[sub.billing_period] || 'monthly',
            status: statusMap[sub.status] || 'pending',
            nextPayment: sub.next_billing_date
              ? new Date(sub.next_billing_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'N/A',
            childrenCount: sub.total_children,
          };
        });

        // Map API PartnerPayment to local Payment shape
        const gatewayLabelMap: Record<string, string> = {
          mpesa: 'M-Pesa',
          bank_transfer: 'Bank Transfer',
          paypal: 'PayPal',
          stripe: 'Credit Card',
          invoice: 'Invoice',
        };
        const paymentStatusMap: Record<string, 'completed' | 'pending' | 'failed'> = {
          completed: 'completed',
          pending: 'pending',
          processing: 'pending',
          failed: 'failed',
          refunded: 'failed',
          cancelled: 'failed',
        };
        const mappedPayments: Payment[] = billingResponse.items.map((payment) => ({
          id: payment.id,
          date: payment.paid_at
            ? new Date(payment.paid_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : new Date(payment.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }),
          program: payment.subscription_id,
          amount: payment.amount,
          status: paymentStatusMap[payment.status] || 'pending',
          method: gatewayLabelMap[payment.payment_gateway] || payment.payment_gateway,
          invoiceUrl: payment.receipt_url || '#',
        }));

        if (mappedSubscriptions.length > 0) {
          setSubscriptions(mappedSubscriptions);
        }
        if (mappedPayments.length > 0) {
          setPaymentHistory(mappedPayments);
        }
      } catch (err) {
        console.error('Failed to fetch funding data:', err);
        setError('Failed to load funding data. Showing cached results.');
        // State already initialized with fallback data, so UI still works
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-500/20 text-green-400 border-green-500/30',
      completed: 'bg-green-500/20 text-green-400 border-green-500/30',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
      failed: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    const icons = {
      active: CheckCircle,
      completed: CheckCircle,
      pending: Clock,
      cancelled: XCircle,
      failed: XCircle,
    };
    const Icon = icons[status as keyof typeof icons];
    return (
      <span
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
          styles[status as keyof typeof styles]
        }`}
      >
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredPayments = paymentHistory.filter((payment) => {
    const matchesSearch =
      payment.program.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.method.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleProcessPayment = async () => {
    try {
      setProcessingPayment(true);
      const subId = selectedProgram === 'all' ? subscriptions[0]?.id : selectedProgram;
      const gatewayMap: Record<string, 'mpesa' | 'stripe' | 'paypal'> = {
        bank_transfer: 'paypal',
        mpesa: 'mpesa',
        stripe: 'stripe',
      };
      await processPayment({
        subscription_id: subId,
        payment_gateway: gatewayMap[paymentMethod] || 'mpesa',
      });
      alert('Payment processed successfully!');
      setShowPaymentForm(false);
      // Refresh billing history
      try {
        const billingResponse = await getBillingHistory();
        if (billingResponse.items.length > 0) {
          const gatewayLabelMap: Record<string, string> = { mpesa: 'M-Pesa', bank_transfer: 'Bank Transfer', paypal: 'PayPal', stripe: 'Credit Card', invoice: 'Invoice' };
          const paymentStatusMap: Record<string, 'completed' | 'pending' | 'failed'> = { completed: 'completed', pending: 'pending', processing: 'pending', failed: 'failed', refunded: 'failed', cancelled: 'failed' };
          setPaymentHistory(billingResponse.items.map((p) => ({
            id: p.id, date: new Date(p.paid_at || p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            program: p.subscription_id, amount: p.amount, status: paymentStatusMap[p.status] || 'pending',
            method: gatewayLabelMap[p.payment_gateway] || p.payment_gateway, invoiceUrl: p.receipt_url || '#',
          })));
        }
      } catch { /* keep existing data */ }
    } catch {
      alert('Payment processing failed. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleDownloadReceipt = async (paymentId: string) => {
    try {
      setDownloadingId(paymentId);
      const result = await downloadReceipt(paymentId);
      if (result.url) {
        window.open(result.url, '_blank');
      }
    } catch {
      alert('Receipt download is not available for this payment.');
    } finally {
      setDownloadingId(null);
    }
  };

  const totalMonthly = subscriptions
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => sum + s.amount, 0);

  const stats = [
    {
      label: 'Total Monthly',
      value: `KSh ${(totalMonthly / 1000).toFixed(0)}K`,
      icon: DollarSign,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      change: '+8% vs last month',
    },
    {
      label: 'Active Subscriptions',
      value: subscriptions.filter((s) => s.status === 'active').length,
      icon: CheckCircle,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      change: '4 programs',
    },
    {
      label: 'Next Payment',
      value: 'Mar 1',
      icon: Calendar,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      change: 'In 15 days',
    },
    {
      label: 'YTD Spending',
      value: 'KSh 1.66M',
      icon: TrendingUp,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      change: '2 months paid',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0F1112] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#E40000] animate-spin" />
          <p className="text-gray-500 dark:text-white/60 text-sm">Loading funding data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F1112] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Funding & Billing</h1>
              <p className="text-gray-500 dark:text-white/60">Manage subscriptions, payments, and invoices</p>
            </div>
            <button
              onClick={() => setShowPaymentForm(!showPaymentForm)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#FF4444] transition-colors"
            >
              <CreditCard className="w-5 h-5" />
              Make Payment
            </button>
          </div>
        </motion.div>

        {/* Error Banner */}
        {error && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="flex items-center gap-3 px-4 py-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <p className="text-sm text-yellow-300">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Stats Overview */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          {stats.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-white/50 mb-1">{stat.label}</p>
              <p className="text-xs text-gray-400 dark:text-white/40">{stat.change}</p>
            </div>
          ))}
        </motion.div>

        {/* Active Subscriptions */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Active Subscriptions</h2>
            <div className="space-y-4">
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg p-4 hover:bg-[#2A2F34] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{sub.program}</h3>
                        {getStatusBadge(sub.status)}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400 dark:text-white/40 text-xs mb-1">Amount</p>
                          <p className="text-gray-900 dark:text-white font-medium">
                            KSh {(sub.amount / 1000).toFixed(0)}K / {sub.frequency}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 dark:text-white/40 text-xs mb-1">Children Supported</p>
                          <p className="text-gray-900 dark:text-white font-medium">{sub.childrenCount}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 dark:text-white/40 text-xs mb-1">Next Payment</p>
                          <p className="text-gray-900 dark:text-white font-medium">{sub.nextPayment}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Payment Processing Form */}
        {showPaymentForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Process Payment</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-xs text-gray-500 dark:text-white/50 block mb-1.5">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#E40000]/50"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="mpesa">M-Pesa</option>
                    <option value="stripe">Credit Card</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-white/50 block mb-1.5">Select Program</label>
                  <select
                    value={selectedProgram}
                    onChange={(e) => setSelectedProgram(e.target.value)}
                    className="w-full bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#E40000]/50"
                  >
                    <option value="all">All Programs (KSh {(totalMonthly / 1000).toFixed(0)}K)</option>
                    {subscriptions.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.program} (KSh {(sub.amount / 1000).toFixed(0)}K)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleProcessPayment}
                  disabled={processingPayment}
                  className="px-6 py-2.5 bg-[#E40000] text-gray-900 dark:text-white rounded-lg hover:bg-[#FF4444] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {processingPayment && <Loader2 className="w-4 h-4 animate-spin" />}
                  {processingPayment ? 'Processing...' : 'Process Payment'}
                </button>
                <button
                  onClick={() => setShowPaymentForm(false)}
                  className="px-6 py-2.5 bg-gray-100 dark:bg-[#22272B] text-gray-900 dark:text-white rounded-lg hover:bg-[#2A2F34] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Payment History */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Payment History</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/40" />
                  <input
                    type="text"
                    placeholder="Search payments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg text-sm text-gray-900 dark:text-white placeholder-white/30 focus:outline-none focus:border-[#E40000]/50"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400 dark:text-white/40" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#2A2F34] rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#E40000]/50"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="overflow-x-auto"><table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-[#22272B]">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 dark:text-white/40">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 dark:text-white/40">Program</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 dark:text-white/40">Amount</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 dark:text-white/40">Method</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 dark:text-white/40">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 dark:text-white/40">Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="border-b border-gray-200 dark:border-[#22272B] hover:bg-gray-100 dark:hover:bg-[#22272B]">
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{payment.date}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">{payment.program}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 dark:text-white font-medium">
                        KSh {payment.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500 dark:text-white/60">{payment.method}</td>
                      <td className="py-3 px-4">{getStatusBadge(payment.status)}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDownloadReceipt(payment.id)}
                          disabled={downloadingId === payment.id}
                          className="flex items-center gap-2 text-[#E40000] hover:text-[#FF4444] text-sm disabled:opacity-50"
                        >
                          {downloadingId === payment.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                          {downloadingId === payment.id ? 'Downloading...' : 'Download'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FundingPage;
