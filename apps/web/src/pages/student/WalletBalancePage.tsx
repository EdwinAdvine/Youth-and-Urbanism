import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../hooks/useAgeAdaptiveUI';
import { getWalletBalance, getTransactionHistory } from '../../services/student/studentWalletService';
import { Wallet, ArrowUpRight, ArrowDownLeft, CreditCard, Smartphone, Sparkles, Loader2, AlertCircle } from 'lucide-react';

interface Transaction {
  id: string;
  title: string;
  type: 'credit' | 'debit';
  amount: number;
  date: string;
  method: string;
}

const WalletBalancePage: React.FC = () => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();
  const [balance, setBalance] = useState<number>(0);
  const [totalTopups, setTotalTopups] = useState<number>(0);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [coursesBought, setCoursesBought] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [balanceData, txData] = await Promise.all([
          getWalletBalance(),
          getTransactionHistory(5)
        ]);
        setBalance(balanceData.balance || 0);
        setTotalTopups(balanceData.total_topups || 0);
        setTotalSpent(balanceData.total_spent || 0);
        setCoursesBought(balanceData.courses_bought || 0);
        if (Array.isArray(txData)) {
          setTransactions(txData);
        } else if (txData?.transactions) {
          setTransactions(txData.transactions);
        }
      } catch {
        setError('Failed to load wallet data');
        // Fallback demo data
        setBalance(1451);
        setTotalTopups(3000);
        setTotalSpent(1549);
        setCoursesBought(3);
        setTransactions([
          { id: '1', title: 'Course: Advanced Fractions', type: 'debit', amount: -500, date: 'Feb 12', method: 'Wallet' },
          { id: '2', title: 'M-Pesa Top-up', type: 'credit', amount: 1000, date: 'Feb 10', method: 'M-Pesa' },
          { id: '3', title: 'Course: Coding for Kids', type: 'debit', amount: -750, date: 'Feb 8', method: 'Wallet' },
          { id: '4', title: 'Card Top-up', type: 'credit', amount: 2000, date: 'Feb 5', method: 'Visa' },
          { id: '5', title: 'Monthly Subscription', type: 'debit', amount: -299, date: 'Feb 1', method: 'Auto' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#FF0000] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Wallet</h1>
        <p className="text-gray-600 dark:text-white/70">Manage your learning funds</p>
      </div>

      {error && (
        <div className={`p-3 bg-yellow-500/10 ${borderRadius} border border-yellow-500/20 flex items-center gap-2`}>
          <AlertCircle className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-400 text-sm">{error} - showing sample data</span>
        </div>
      )}

      {/* Balance Card */}
      <div className={`p-8 bg-gradient-to-br from-[#FF0000]/20 to-orange-500/20 ${borderRadius} border border-[#FF0000]/30`}>
        <div className="flex items-center gap-2 mb-2">
          <Wallet className="w-5 h-5 text-gray-500 dark:text-white/60" />
          <span className="text-gray-500 dark:text-white/60 text-sm">Available Balance</span>
        </div>
        <div className="text-4xl font-bold text-gray-900 dark:text-white mb-4">KES {balance.toLocaleString()}</div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/dashboard/student/wallet/add/mpesa')} className={`px-4 py-2 bg-green-500 hover:bg-green-600 text-gray-900 dark:text-white ${borderRadius} flex items-center gap-2`}>
            <Smartphone className="w-4 h-4" /> M-Pesa Top-up
          </button>
          <button onClick={() => navigate('/dashboard/student/wallet/add/card')} className={`px-4 py-2 bg-blue-500 hover:bg-blue-600 text-gray-900 dark:text-white ${borderRadius} flex items-center gap-2`}>
            <CreditCard className="w-4 h-4" /> Card Top-up
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-4 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center`}>
          <div className="text-green-400 font-bold text-lg">KES {totalTopups.toLocaleString()}</div>
          <div className="text-gray-400 dark:text-white/40 text-sm">Total Top-ups</div>
        </div>
        <div className={`p-4 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center`}>
          <div className="text-red-400 font-bold text-lg">KES {totalSpent.toLocaleString()}</div>
          <div className="text-gray-400 dark:text-white/40 text-sm">Total Spent</div>
        </div>
        <div className={`p-4 bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] text-center`}>
          <div className="text-blue-400 font-bold text-lg">{coursesBought}</div>
          <div className="text-gray-400 dark:text-white/40 text-sm">Courses Bought</div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Transactions</h2>
          <button
            onClick={() => navigate('/dashboard/student/wallet/transactions')}
            className="text-sm text-[#FF0000] hover:text-[#FF0000]/80"
          >
            View All →
          </button>
        </div>
        <div className={`bg-white dark:bg-[#181C1F] ${borderRadius} border border-gray-200 dark:border-[#22272B] divide-y divide-white/5`}>
          {transactions.map((tx) => (
            <div key={tx.id} className="p-4 flex items-center gap-4">
              <div className={`w-10 h-10 ${borderRadius} flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                {tx.type === 'credit' ? <ArrowDownLeft className="w-5 h-5 text-green-400" /> : <ArrowUpRight className="w-5 h-5 text-red-400" />}
              </div>
              <div className="flex-1">
                <h3 className="text-gray-900 dark:text-white text-sm font-medium">{tx.title}</h3>
                <p className="text-gray-400 dark:text-white/40 text-xs">{tx.date} · {tx.method}</p>
              </div>
              <span className={`font-bold ${tx.type === 'credit' ? 'text-green-400' : 'text-gray-900 dark:text-white'}`}>
                {tx.type === 'credit' ? '+' : ''}{tx.amount.toLocaleString()} KES
              </span>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="p-8 text-center text-gray-500 dark:text-white/50">No transactions yet</div>
          )}
        </div>
      </div>

      {/* AI Advisor */}
      <button
        onClick={() => navigate('/dashboard/student/wallet/advisor')}
        className={`w-full p-4 bg-purple-500/10 ${borderRadius} border border-purple-500/20 hover:bg-purple-500/20 transition-colors text-left`}
      >
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-gray-900 dark:text-white font-medium text-sm">AI Fund Advisor</p>
            <p className="text-gray-500 dark:text-white/60 text-sm mt-1">Get personalized advice on managing your learning funds →</p>
          </div>
        </div>
      </button>
    </div>
  );
};

export default WalletBalancePage;
