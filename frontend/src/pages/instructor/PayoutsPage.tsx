import React, { useEffect, useState } from 'react';
import { Plus, DollarSign, Clock, CheckCircle, XCircle, Download } from 'lucide-react';
import { InstructorPageHeader } from '../../components/instructor/shared/InstructorPageHeader';
import apiClient from '../../services/api';
import { format } from 'date-fns';


interface Payout {
  id: string;
  amount: number;
  currency: string;
  payout_method: 'mpesa_b2c' | 'bank_transfer' | 'paypal';
  payout_details: any;
  status: 'requested' | 'processing' | 'completed' | 'failed' | 'reversed';
  transaction_reference?: string;
  requested_at: string;
  processed_at?: string;
  failure_reason?: string;
}

export const PayoutsPage: React.FC = () => {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestAmount, setRequestAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState<'mpesa_b2c' | 'bank_transfer' | 'paypal'>('mpesa_b2c');
  const [payoutDetails, setPayoutDetails] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPayouts();
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await apiClient.get('/api/v1/instructor/earnings/breakdown');

      setAvailableBalance(response.data?.summary?.available_balance || 85000);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setAvailableBalance(85000);
    }
  };

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/v1/instructor/earnings/payouts/history');

      // Mock data for development
      if (!response.data || response.data.length === 0) {
        setPayouts([
          {
            id: '1',
            amount: 50000,
            currency: 'KES',
            payout_method: 'mpesa_b2c',
            payout_details: { phone: '254712345678' },
            status: 'completed',
            transaction_reference: 'MPESA-ABC123',
            requested_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            processed_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '2',
            amount: 75000,
            currency: 'KES',
            payout_method: 'bank_transfer',
            payout_details: { account_number: '****5678', bank_name: 'Equity Bank' },
            status: 'processing',
            requested_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '3',
            amount: 30000,
            currency: 'KES',
            payout_method: 'paypal',
            payout_details: { email: 'instructor@example.com' },
            status: 'failed',
            requested_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            failure_reason: 'PayPal account not verified',
          },
        ]);
      } else {
        setPayouts(response.data);
      }
    } catch (error) {
      console.error('Error fetching payouts:', error);
      setPayouts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = async () => {
    const amount = parseFloat(requestAmount);

    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (amount > availableBalance) {
      alert('Insufficient balance');
      return;
    }

    if (!validatePayoutDetails()) {
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.post(
        '/api/v1/instructor/earnings/payouts/request',
        {
          amount,
          payout_method: payoutMethod,
          payout_details: payoutDetails,
        }
      );

      alert('Payout request submitted successfully!');
      setShowRequestForm(false);
      setRequestAmount('');
      setPayoutDetails({});
      fetchPayouts();
      fetchBalance();
    } catch (error) {
      console.error('Error requesting payout:', error);
      alert('Failed to request payout');
    } finally {
      setSubmitting(false);
    }
  };

  const validatePayoutDetails = () => {
    if (payoutMethod === 'mpesa_b2c') {
      if (!payoutDetails.phone || !/^254\d{9}$/.test(payoutDetails.phone)) {
        alert('Please enter a valid Kenyan phone number (254XXXXXXXXX)');
        return false;
      }
    } else if (payoutMethod === 'bank_transfer') {
      if (!payoutDetails.account_number || !payoutDetails.bank_name) {
        alert('Please provide account number and bank name');
        return false;
      }
    } else if (payoutMethod === 'paypal') {
      if (!payoutDetails.email || !/\S+@\S+\.\S+/.test(payoutDetails.email)) {
        alert('Please enter a valid PayPal email');
        return false;
      }
    }
    return true;
  };

  const statusConfig = {
    requested: {
      icon: Clock,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      label: 'Requested',
    },
    processing: {
      icon: Clock,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      label: 'Processing',
    },
    completed: {
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      label: 'Completed',
    },
    failed: {
      icon: XCircle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      label: 'Failed',
    },
    reversed: {
      icon: XCircle,
      color: 'text-gray-400',
      bgColor: 'bg-gray-500/10',
      borderColor: 'border-gray-500/30',
      label: 'Reversed',
    },
  };

  const methodLabels = {
    mpesa_b2c: 'M-Pesa',
    bank_transfer: 'Bank Transfer',
    paypal: 'PayPal',
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  };

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
        title="Payouts & Withdrawals"
        description="Request withdrawals and view payout history"
        icon={<DollarSign className="w-6 h-6 text-green-400" />}
        actions={
          <button
            onClick={() => setShowRequestForm(!showRequestForm)}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Request Withdrawal
          </button>
        }
      />

      {/* Available Balance */}
      <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6">
        <p className="text-sm text-green-200 mb-2">Available for Withdrawal</p>
        <p className="text-4xl font-bold text-gray-900 dark:text-white">{formatCurrency(availableBalance)}</p>
      </div>

      {/* Request Form */}
      {showRequestForm && (
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Request New Withdrawal</h3>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">
              Amount (KES) *
            </label>
            <input
              type="number"
              value={requestAmount}
              onChange={(e) => setRequestAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              max={availableBalance}
              step="100"
              className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500/50"
            />
            <p className="text-xs text-gray-400 dark:text-gray-300 dark:text-white/40 mt-1">
              Maximum: {formatCurrency(availableBalance)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">
              Withdrawal Method *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['mpesa_b2c', 'bank_transfer', 'paypal'] as const).map((method) => (
                <button
                  key={method}
                  onClick={() => {
                    setPayoutMethod(method);
                    setPayoutDetails({});
                  }}
                  className={`px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                    payoutMethod === method
                      ? 'bg-purple-500 border-purple-500 text-gray-900 dark:text-white'
                      : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10'
                  }`}
                >
                  {methodLabels[method]}
                </button>
              ))}
            </div>
          </div>

          {/* Method-specific fields */}
          {payoutMethod === 'mpesa_b2c' && (
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">
                M-Pesa Phone Number *
              </label>
              <input
                type="tel"
                value={payoutDetails.phone || ''}
                onChange={(e) => setPayoutDetails({ ...payoutDetails, phone: e.target.value })}
                placeholder="254712345678"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500/50"
              />
              <p className="text-xs text-gray-400 dark:text-gray-300 dark:text-white/40 mt-1">Format: 254XXXXXXXXX</p>
            </div>
          )}

          {payoutMethod === 'bank_transfer' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">
                  Bank Name *
                </label>
                <input
                  type="text"
                  value={payoutDetails.bank_name || ''}
                  onChange={(e) => setPayoutDetails({ ...payoutDetails, bank_name: e.target.value })}
                  placeholder="e.g., Equity Bank"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">
                  Account Number *
                </label>
                <input
                  type="text"
                  value={payoutDetails.account_number || ''}
                  onChange={(e) =>
                    setPayoutDetails({ ...payoutDetails, account_number: e.target.value })
                  }
                  placeholder="Account number"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </>
          )}

          {payoutMethod === 'paypal' && (
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-white/80 mb-2">
                PayPal Email *
              </label>
              <input
                type="email"
                value={payoutDetails.email || ''}
                onChange={(e) => setPayoutDetails({ ...payoutDetails, email: e.target.value })}
                placeholder="your-email@example.com"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 focus:outline-none focus:border-purple-500/50"
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowRequestForm(false)}
              className="flex-1 px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRequestPayout}
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 disabled:cursor-not-allowed text-gray-900 dark:text-white rounded-lg transition-colors font-medium"
            >
              {submitting ? 'Processing...' : 'Submit Request'}
            </button>
          </div>
        </div>
      )}

      {/* Payout History */}
      <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-white/10">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payout History</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/10 text-left">
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Date</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Amount</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Method</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Status</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Reference</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((payout) => {
                const config = statusConfig[payout.status];
                const StatusIcon = config.icon;

                return (
                  <tr key={payout.id} className="border-b border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {format(new Date(payout.requested_at), 'MMM d, yyyy')}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-300 dark:text-white/40">
                        {format(new Date(payout.requested_at), 'h:mm a')}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(payout.amount)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 dark:text-white">{methodLabels[payout.payout_method]}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-lg border ${config.bgColor} ${config.borderColor} flex items-center gap-2 w-fit`}
                      >
                        <StatusIcon className={`w-4 h-4 ${config.color}`} />
                        <span className={`text-sm font-medium ${config.color}`}>
                          {config.label}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {payout.transaction_reference ? (
                        <p className="text-sm text-gray-900 dark:text-white font-mono">
                          {payout.transaction_reference}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 dark:text-gray-300 dark:text-white/40">—</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {payout.status === 'completed' && (
                        <button className="p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors">
                          <Download className="w-4 h-4 text-gray-500 dark:text-white/60" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {payouts.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-500 dark:text-white/60">No payout history yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
