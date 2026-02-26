import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { ArrowLeft } from 'lucide-react';
import TransactionRow from '../../components/student/wallet/TransactionRow';

const transactions = [
  { title: 'Course: Advanced Fractions', type: 'debit' as const, amount: -500, date: 'Feb 12', method: 'Wallet' },
  { title: 'M-Pesa Top-up', type: 'credit' as const, amount: 1000, date: 'Feb 10', method: 'M-Pesa' },
  { title: 'Course: Coding for Kids', type: 'debit' as const, amount: -750, date: 'Feb 8', method: 'Wallet' },
  { title: 'Card Top-up', type: 'credit' as const, amount: 2000, date: 'Feb 5', method: 'Visa' },
  { title: 'Monthly Subscription', type: 'debit' as const, amount: -299, date: 'Feb 1', method: 'Auto' },
  { title: 'M-Pesa Top-up', type: 'credit' as const, amount: 500, date: 'Jan 28', method: 'M-Pesa' },
  { title: 'Course: Science Lab', type: 'debit' as const, amount: -400, date: 'Jan 25', method: 'Wallet' },
  { title: 'Referral Bonus', type: 'credit' as const, amount: 200, date: 'Jan 20', method: 'System' },
];

const RecentTransactionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();
  const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all');

  const filtered = filter === 'all' ? transactions : transactions.filter(t => t.type === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className={`p-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 ${borderRadius}`}>
          <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Transaction History</h1>
          <p className="text-gray-600 dark:text-white/70">{transactions.length} transactions</p>
        </div>
      </div>

      <div className="flex gap-2">
        {(['all', 'credit', 'debit'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 ${borderRadius} text-sm capitalize ${filter === f ? 'bg-[#FF0000]/20 text-[#FF0000] border border-[#FF0000]/30' : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60 border border-gray-200 dark:border-white/10'}`}>
            {f === 'all' ? 'All' : f === 'credit' ? 'Top-ups' : 'Payments'}
          </button>
        ))}
      </div>

      <div className={`bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] divide-y divide-white/5`}>
        {filtered.map((tx, i) => (
          <TransactionRow key={i} {...tx} />
        ))}
      </div>
    </div>
  );
};

export default RecentTransactionsPage;
