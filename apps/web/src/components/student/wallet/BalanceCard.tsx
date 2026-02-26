import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgeAdaptiveUI } from '../../../hooks/useAgeAdaptiveUI';
import { Wallet, Smartphone, CreditCard } from 'lucide-react';

interface BalanceCardProps {
  balance: number;
  currency?: string;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ balance, currency = 'KES' }) => {
  const navigate = useNavigate();
  const { borderRadius } = useAgeAdaptiveUI();

  return (
    <div className={`p-8 bg-gradient-to-br from-[#FF0000]/20 to-orange-500/20 ${borderRadius} border border-[#FF0000]/30`}>
      <div className="flex items-center gap-2 mb-2">
        <Wallet className="w-5 h-5 text-gray-500 dark:text-white/60" />
        <span className="text-gray-500 dark:text-white/60 text-sm">Available Balance</span>
      </div>
      <div className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{currency} {balance.toLocaleString()}</div>
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => navigate('/dashboard/student/wallet/topup/mpesa')}
          className={`px-4 py-2 bg-green-500 hover:bg-green-600 text-gray-900 dark:text-white ${borderRadius} flex items-center gap-2`}
        >
          <Smartphone className="w-4 h-4" /> M-Pesa Top-up
        </button>
        <button
          onClick={() => navigate('/dashboard/student/wallet/topup/card')}
          className={`px-4 py-2 bg-blue-500 hover:bg-blue-600 text-gray-900 dark:text-white ${borderRadius} flex items-center gap-2`}
        >
          <CreditCard className="w-4 h-4" /> Card Top-up
        </button>
      </div>
    </div>
  );
};

export default BalanceCard;
