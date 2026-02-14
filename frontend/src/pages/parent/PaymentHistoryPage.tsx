/**
 * Payment History Page
 *
 * Displays the parent's complete payment history with status
 * badges, receipt links, and amount formatting.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, ArrowLeft, RefreshCw, Download, CreditCard,
} from 'lucide-react';
import { getPaymentHistory } from '../../services/parentFinanceService';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

interface PaymentItem {
  id: string;
  transaction_date: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: string;
  description: string;
  receipt_number: string | null;
  mpesa_receipt: string | null;
}

interface PaymentHistoryData {
  payments: PaymentItem[];
  total_count: number;
  total_paid: number;
}

const PaymentHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<PaymentHistoryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await getPaymentHistory();
      setHistory(data);
    } catch (error) {
      console.error('Failed to load payment history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'failed':
        return 'bg-red-500/20 text-red-400';
      case 'refunded':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E40000]" />
        </div>
      </>
    );
  }

  return (
    <>
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
                <FileText className="w-6 h-6 text-gray-900 dark:text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payment History</h1>
                <p className="text-gray-500 dark:text-white/60 mt-1">
                  View all your past transactions
                </p>
              </div>
            </div>
            <button
              onClick={loadHistory}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] text-gray-700 dark:text-white/80 text-sm rounded-lg hover:bg-[#2A2E33] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Total Paid Summary */}
        {history && history.total_paid > 0 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl p-5 flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-white/60 text-sm">Total Paid</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  KES {history.total_paid.toLocaleString()}
                </p>
              </div>
              <p className="text-gray-400 dark:text-white/40 text-sm">
                {history.total_count} transaction{history.total_count !== 1 ? 's' : ''}
              </p>
            </div>
          </motion.div>
        )}

        {/* Payments Table */}
        {history && history.payments.length > 0 ? (
          <motion.div variants={stagger} initial="hidden" animate="visible">
            {/* Desktop Table */}
            <div className="hidden md:block bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#181C1F]">
                    <th className="text-left text-xs text-gray-500 dark:text-white/50 font-medium px-6 py-4">Date</th>
                    <th className="text-left text-xs text-gray-500 dark:text-white/50 font-medium px-6 py-4">Description</th>
                    <th className="text-right text-xs text-gray-500 dark:text-white/50 font-medium px-6 py-4">Amount (KES)</th>
                    <th className="text-center text-xs text-gray-500 dark:text-white/50 font-medium px-6 py-4">Status</th>
                    <th className="text-center text-xs text-gray-500 dark:text-white/50 font-medium px-6 py-4">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {history.payments.map((payment) => (
                    <motion.tr
                      key={payment.id}
                      variants={fadeUp}
                      className="border-b border-[#181C1F] last:border-b-0 hover:bg-white dark:hover:bg-[#181C1F]/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-white/80">
                        {new Date(payment.transaction_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 dark:text-white">{payment.description}</p>
                        <p className="text-xs text-gray-400 dark:text-white/40 capitalize">{payment.payment_method}</p>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-gray-900 dark:text-white">
                        {payment.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadge(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {payment.receipt_number ? (
                          <button className="text-[#E40000] hover:text-[#FF0000] transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-300 dark:text-white/20">-</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {history.payments.map((payment) => (
                <motion.div
                  key={payment.id}
                  variants={fadeUp}
                  className="bg-gray-100 dark:bg-[#22272B] border border-gray-200 dark:border-[#22272B] rounded-xl p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm text-gray-900 dark:text-white font-medium">{payment.description}</p>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${getStatusBadge(payment.status)}`}>
                      {payment.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400 dark:text-white/40">
                      {new Date(payment.transaction_date).toLocaleDateString()} - {payment.payment_method}
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      KES {payment.amount.toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-12 text-center">
              <CreditCard className="w-16 h-16 text-gray-400 dark:text-gray-300 dark:text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No payment history
              </h3>
              <p className="text-gray-500 dark:text-white/60 text-sm">
                Your payment transactions will appear here.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default PaymentHistoryPage;
