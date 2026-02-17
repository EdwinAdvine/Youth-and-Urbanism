import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, Calendar, Download, Filter } from 'lucide-react';
import { InstructorPageHeader } from '../../components/instructor/shared/InstructorPageHeader';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';
import { format, subMonths } from 'date-fns';


interface EarningsSummary {
  total_lifetime: number;
  total_current_month: number;
  total_last_month: number;
  available_balance: number;
  pending_balance: number;
  total_withdrawn: number;
  growth_percentage: number;
}

interface MonthlyData {
  month: string;
  total: number;
  course_sales: number;
  session_fees: number;
  bonuses: number;
}

export const EarningsDashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const navigate = useNavigate();

  useEffect(() => {
    fetchEarningsData();
  }, [selectedPeriod]);

  const fetchEarningsData = async () => {
    try {
      setLoading(true);

      // Fetch summary
      const summaryResponse = await apiClient.get('/api/v1/instructor/earnings/breakdown');

      // Mock data for development
      if (!summaryResponse.data) {
        setSummary({
          total_lifetime: 487500,
          total_current_month: 125000,
          total_last_month: 98000,
          available_balance: 85000,
          pending_balance: 40000,
          total_withdrawn: 362500,
          growth_percentage: 27.5,
        });

        // Generate mock monthly data
        const months = [];
        for (let i = 5; i >= 0; i--) {
          const date = subMonths(new Date(), i);
          months.push({
            month: format(date, 'MMM yyyy'),
            total: 80000 + Math.random() * 50000,
            course_sales: 50000 + Math.random() * 30000,
            session_fees: 20000 + Math.random() * 15000,
            bonuses: 5000 + Math.random() * 5000,
          });
        }
        setMonthlyData(months);
      } else {
        setSummary(summaryResponse.data.summary);
        setMonthlyData(summaryResponse.data.monthly || []);
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
      setSummary(null);
      setMonthlyData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const response = await apiClient.get('/api/v1/instructor/earnings/export', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `earnings_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export earnings data');
    }
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-white/60">Failed to load earnings data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <InstructorPageHeader
        title="Earnings Dashboard"
        description="Track your income and financial performance"
        icon={<DollarSign className="w-6 h-6 text-green-400" />}
        actions={
          <button
            onClick={handleExportData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-lg transition-colors font-medium"
          >
            <Download className="w-5 h-5" />
            Export Data
          </button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-green-200">This Month</p>
            <DollarSign className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {formatCurrency(summary.total_current_month)}
          </p>
          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-green-300">+{summary.growth_percentage.toFixed(1)}%</span>
            <span className="text-gray-500 dark:text-white/60">vs last month</span>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-white/60">Available Balance</p>
            <DollarSign className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {formatCurrency(summary.available_balance)}
          </p>
          <button
            onClick={() => navigate('/dashboard/instructor/earnings/payouts')}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Request Withdrawal →
          </button>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-white/60">Pending</p>
            <Calendar className="w-5 h-5 text-orange-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {formatCurrency(summary.pending_balance)}
          </p>
          <p className="text-sm text-gray-500 dark:text-white/60">Processing earnings</p>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500 dark:text-white/60">Lifetime Earnings</p>
            <TrendingUp className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {formatCurrency(summary.total_lifetime)}
          </p>
          <p className="text-sm text-gray-500 dark:text-white/60">Total withdrawn: {formatCurrency(summary.total_withdrawn)}</p>
        </div>
      </div>

      {/* Period Filter */}
      <div className="flex items-center gap-3">
        <Filter className="w-4 h-4 text-gray-500 dark:text-white/60" />
        <span className="text-sm text-gray-500 dark:text-white/60">Period:</span>
        <div className="flex gap-2">
          {['3months', '6months', '12months', 'all'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                selectedPeriod === period
                  ? 'bg-purple-500 text-gray-900 dark:text-white'
                  : 'bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10'
              }`}
            >
              {period === 'all' ? 'All Time' : period.replace('months', ' Months')}
            </button>
          ))}
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Monthly Earnings Trend</h3>

        <div className="space-y-4">
          {monthlyData.map((month) => (
            <div key={month.month}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-white/80">{month.month}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(month.total)}</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-3 overflow-hidden">
                <div className="h-full flex">
                  <div
                    className="bg-blue-500"
                    style={{ width: `${(month.course_sales / month.total) * 100}%` }}
                    title={`Course Sales: ${formatCurrency(month.course_sales)}`}
                  />
                  <div
                    className="bg-purple-500"
                    style={{ width: `${(month.session_fees / month.total) * 100}%` }}
                    title={`Session Fees: ${formatCurrency(month.session_fees)}`}
                  />
                  <div
                    className="bg-green-500"
                    style={{ width: `${(month.bonuses / month.total) * 100}%` }}
                    title={`Bonuses: ${formatCurrency(month.bonuses)}`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-xs text-gray-500 dark:text-white/60">Course Sales</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span className="text-xs text-gray-500 dark:text-white/60">Session Fees</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-xs text-gray-500 dark:text-white/60">Bonuses</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/dashboard/instructor/earnings/breakdown')}
          className="bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl p-6 text-left transition-colors group"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-purple-400 transition-colors">
            View Detailed Breakdown
          </h3>
          <p className="text-sm text-gray-500 dark:text-white/60">See earnings by course, session, and bonus type</p>
        </button>

        <button
          onClick={() => navigate('/dashboard/instructor/earnings/payouts')}
          className="bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl p-6 text-left transition-colors group"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-purple-400 transition-colors">
            Request Payout
          </h3>
          <p className="text-sm text-gray-500 dark:text-white/60">Withdraw available balance to M-Pesa, bank, or PayPal</p>
        </button>

        <button
          onClick={() => navigate('/dashboard/instructor/earnings/rates')}
          className="bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl p-6 text-left transition-colors group"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-purple-400 transition-colors">
            Manage Rates
          </h3>
          <p className="text-sm text-gray-500 dark:text-white/60">Update course pricing and session rates</p>
        </button>
      </div>
    </div>
  );
};
