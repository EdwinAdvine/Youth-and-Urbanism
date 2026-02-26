/**
 * Instructor Withdrawal Request Page
 *
 * Allows instructors to request withdrawal of their earnings
 * to M-Pesa or bank account.
 */

import { useState, useEffect } from 'react';
import { ArrowDownToLine, Phone, Building2, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import withdrawalService, { WithdrawalRequest } from '../../services/withdrawalService';

const STATUS_COLORS: Record<string, string> = {
  requested: 'bg-yellow-500/20 text-yellow-400',
  approved: 'bg-blue-500/20 text-blue-400',
  processing: 'bg-blue-500/20 text-blue-400',
  completed: 'bg-green-500/20 text-green-400',
  failed: 'bg-red-500/20 text-red-400',
  rejected: 'bg-red-500/20 text-red-400',
};

export default function WithdrawalRequestPage() {
  const [method, setMethod] = useState<'mpesa_b2c' | 'bank_transfer'>('mpesa_b2c');
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [history, setHistory] = useState<WithdrawalRequest[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      const data = await withdrawalService.getMyRequests();
      setHistory(data.items);
    } catch {
      // Silently fail
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const payoutDetails: Record<string, any> =
      method === 'mpesa_b2c'
        ? { phone }
        : { bank_code: bankCode, account_number: accountNumber, account_name: accountName };

    try {
      setLoading(true);
      await withdrawalService.createRequest({
        amount: numAmount,
        payout_method: method,
        payout_details: payoutDetails,
      });
      setSuccess(true);
      setAmount('');
      setPhone('');
      setBankCode('');
      setAccountNumber('');
      setAccountName('');
      await loadHistory();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit withdrawal request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <ArrowDownToLine className="w-7 h-7 text-copilot-cyan" />
          Request Withdrawal
        </h1>
        <p className="text-zinc-400 mt-1">
          Withdraw your earnings to M-Pesa or bank account. Requests are reviewed within 24 hours.
        </p>
      </div>

      {/* Request Form */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">New Withdrawal</h2>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            Withdrawal request submitted successfully. You will be notified when reviewed.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Amount (KES)</label>
            <input
              type="number"
              min="100"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-copilot-cyan/50"
              required
            />
          </div>

          {/* Method Selection */}
          <div>
            <label className="block text-sm text-zinc-400 mb-2">Payout Method</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setMethod('mpesa_b2c')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                  method === 'mpesa_b2c'
                    ? 'bg-copilot-cyan/10 border-copilot-cyan text-copilot-cyan'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                }`}
              >
                <Phone className="w-4 h-4" />
                M-Pesa
              </button>
              <button
                type="button"
                onClick={() => setMethod('bank_transfer')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                  method === 'bank_transfer'
                    ? 'bg-copilot-cyan/10 border-copilot-cyan text-copilot-cyan'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Bank Transfer
              </button>
            </div>
          </div>

          {/* Method-specific fields */}
          {method === 'mpesa_b2c' ? (
            <div>
              <label className="block text-sm text-zinc-400 mb-1">M-Pesa Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g., 0712345678"
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-copilot-cyan/50"
                required
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Bank Code</label>
                <input
                  type="text"
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value)}
                  placeholder="e.g., 063 (Diamond Trust Bank)"
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-copilot-cyan/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Account Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Your bank account number"
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-copilot-cyan/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Account Name</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Name on your bank account"
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-copilot-cyan/50"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-copilot-cyan text-zinc-900 font-semibold rounded-lg hover:bg-copilot-cyan/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Withdrawal Request'
            )}
          </button>
        </form>
      </div>

      {/* History */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Withdrawal History</h2>

        {historyLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
          </div>
        ) : history.length === 0 ? (
          <p className="text-zinc-500 text-center py-8">No withdrawal requests yet</p>
        ) : (
          <div className="space-y-3">
            {history.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg"
              >
                <div>
                  <div className="text-white font-medium">
                    KES {req.amount.toLocaleString()}
                  </div>
                  <div className="text-zinc-500 text-xs mt-1">
                    {req.payout_method === 'mpesa_b2c' ? 'M-Pesa' : 'Bank Transfer'}
                    {' · '}
                    {new Date(req.created_at).toLocaleDateString()}
                  </div>
                  {req.rejection_reason && (
                    <div className="text-red-400 text-xs mt-1">
                      Reason: {req.rejection_reason}
                    </div>
                  )}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full capitalize ${STATUS_COLORS[req.status] || 'bg-zinc-700 text-zinc-300'}`}>
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
