import React from 'react';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import type { RevenueSnapshot } from '../../../services/admin/adminDashboardService';

interface RevenueCardProps {
  data: RevenueSnapshot | null;
  isLoading?: boolean;
}

const RevenueCard: React.FC<RevenueCardProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="col-span-1 sm:col-span-2 bg-[#181C1F] border border-[#22272B] rounded-xl p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-32 bg-[#22272B] rounded" />
          <div className="h-10 w-40 bg-[#22272B] rounded" />
          <div className="h-24 bg-[#22272B] rounded-lg" />
        </div>
      </div>
    );
  }

  const trend = data?.trend_percentage ?? 0;
  const isPositive = trend >= 0;

  // Generate sparkline data from recent transactions or mock data
  const sparkData = data?.recent_transactions?.map((tx, i) => ({
    name: `tx${i}`,
    value: tx.amount,
  })) || [
    { name: '1', value: 0 },
    { name: '2', value: 0 },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="col-span-1 sm:col-span-2 bg-[#181C1F] border border-[#22272B] rounded-xl p-5"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Wallet className="w-5 h-5 text-emerald-400" />
          Revenue
        </h3>
        <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {Math.abs(trend).toFixed(1)}% vs yesterday
        </div>
      </div>

      <div className="text-3xl font-bold text-white mb-4">
        {formatCurrency(data?.total_today ?? 0)}
        <span className="text-sm font-normal text-white/40 ml-2">today</span>
      </div>

      {/* Sparkline */}
      <div className="h-16 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparkData}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip
              contentStyle={{
                backgroundColor: '#181C1F',
                border: '1px solid #22272B',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px',
              }}
              formatter={(value: number) => [formatCurrency(value), 'Amount']}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Period breakdowns */}
      <div className="grid grid-cols-3 gap-3 border-t border-[#22272B] pt-3">
        <div>
          <p className="text-xs text-white/40">Yesterday</p>
          <p className="text-sm font-semibold text-white">{formatCurrency(data?.total_yesterday ?? 0)}</p>
        </div>
        <div>
          <p className="text-xs text-white/40">This Week</p>
          <p className="text-sm font-semibold text-white">{formatCurrency(data?.total_week ?? 0)}</p>
        </div>
        <div>
          <p className="text-xs text-white/40">This Month</p>
          <p className="text-sm font-semibold text-white">{formatCurrency(data?.total_month ?? 0)}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default RevenueCard;
