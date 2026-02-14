import React from 'react';
import { DollarSign, TrendingUp, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EarningsSnapshotCardProps {
  thisMonth: number;
  total: number;
  currency?: string;
}

export const EarningsSnapshotCard: React.FC<EarningsSnapshotCardProps> = ({
  thisMonth,
  total,
  currency = 'KES',
}) => {
  const navigate = useNavigate();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm border border-green-500/20 rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-gray-500 dark:text-white/60 text-sm font-medium mb-1">Earnings This Month</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(thisMonth)}</h3>
        </div>
        <div className="p-3 bg-green-500/20 rounded-lg">
          <DollarSign className="w-6 h-6 text-green-400" />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-white/10">
        <div>
          <p className="text-gray-400 dark:text-gray-300 dark:text-white/40 text-xs">Total Earned</p>
          <p className="text-gray-900 dark:text-white font-semibold">{formatCurrency(total)}</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/instructor/earnings')}
          className="flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition-colors"
        >
          View Details
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
