import React, { useEffect, useState } from 'react';
import { ArrowLeft, Filter, DollarSign, BookOpen, Video, Award } from 'lucide-react';
import { InstructorPageHeader } from '../../components/instructor/shared/InstructorPageHeader';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';
import { format } from 'date-fns';


interface EarningItem {
  id: string;
  earning_type: 'course_sale' | 'session_fee' | 'bonus' | 'referral';
  course_title?: string;
  session_title?: string;
  gross_amount: number;
  platform_fee_pct: number;
  partner_fee_pct: number;
  net_amount: number;
  status: 'pending' | 'confirmed' | 'paid';
  created_at: string;
}

export const EarningsBreakdownPage: React.FC = () => {
  const [earnings, setEarnings] = useState<EarningItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchEarnings();
  }, [typeFilter, statusFilter]);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (typeFilter !== 'all') params.type = typeFilter;
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await apiClient.get('/api/v1/instructor/earnings', {
        params,
      });

      // Mock data for development
      if (!response.data || response.data.length === 0) {
        setEarnings([
          {
            id: '1',
            earning_type: 'course_sale',
            course_title: 'Introduction to Mathematics - Grade 7',
            gross_amount: 3000,
            platform_fee_pct: 30,
            partner_fee_pct: 10,
            net_amount: 1800,
            status: 'confirmed',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '2',
            earning_type: 'session_fee',
            session_title: 'Algebra Review Session',
            gross_amount: 5000,
            platform_fee_pct: 30,
            partner_fee_pct: 10,
            net_amount: 3000,
            status: 'confirmed',
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '3',
            earning_type: 'bonus',
            gross_amount: 2000,
            platform_fee_pct: 0,
            partner_fee_pct: 0,
            net_amount: 2000,
            status: 'paid',
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '4',
            earning_type: 'course_sale',
            course_title: 'English Language & Literature',
            gross_amount: 2500,
            platform_fee_pct: 30,
            partner_fee_pct: 10,
            net_amount: 1500,
            status: 'pending',
            created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '5',
            earning_type: 'referral',
            gross_amount: 1000,
            platform_fee_pct: 10,
            partner_fee_pct: 0,
            net_amount: 900,
            status: 'confirmed',
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ]);
      } else {
        setEarnings(response.data);
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
      setEarnings([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  };

  const typeIcons = {
    course_sale: BookOpen,
    session_fee: Video,
    bonus: Award,
    referral: DollarSign,
  };

  const typeLabels = {
    course_sale: 'Course Sale',
    session_fee: 'Session Fee',
    bonus: 'Bonus',
    referral: 'Referral',
  };

  const typeColors = {
    course_sale: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    session_fee: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    bonus: 'bg-green-500/10 text-green-400 border-green-500/30',
    referral: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  };

  const statusColors = {
    pending: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    paid: 'bg-green-500/10 text-green-400 border-green-500/30',
  };

  const totals = earnings.reduce(
    (acc, e) => ({
      gross: acc.gross + e.gross_amount,
      net: acc.net + e.net_amount,
    }),
    { gross: 0, net: 0 }
  );

  const averageFee =
    earnings.length > 0
      ? earnings.reduce((sum, e) => sum + e.platform_fee_pct + e.partner_fee_pct, 0) /
        earnings.length
      : 0;

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
        title="Earnings Breakdown"
        description="Detailed view of all earnings by type and source"
        icon={
          <button
            onClick={() => navigate('/dashboard/instructor/earnings')}
            className="p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white" />
          </button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-5">
          <p className="text-sm text-gray-500 dark:text-white/60 mb-2">Total Gross Earnings</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(totals.gross)}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-5">
          <p className="text-sm text-green-200 mb-2">Total Net Earnings</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(totals.net)}</p>
        </div>

        <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-5">
          <p className="text-sm text-gray-500 dark:text-white/60 mb-2">Average Fee</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{averageFee.toFixed(1)}%</p>
          <p className="text-xs text-gray-400 dark:text-gray-300 dark:text-white/40 mt-1">Platform + Partner fees</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500 dark:text-white/60" />
          <span className="text-sm text-gray-500 dark:text-white/60">Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
          >
            <option value="all">All Types</option>
            <option value="course_sale">Course Sales</option>
            <option value="session_fee">Session Fees</option>
            <option value="bonus">Bonuses</option>
            <option value="referral">Referrals</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-white/60">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:border-purple-500/50"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>

      {/* Earnings Table */}
      <div className="bg-gray-50 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/10 text-left">
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Date</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Type</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Source</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Gross</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Fees</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Net</th>
                <th className="px-6 py-4 text-sm font-medium text-gray-500 dark:text-white/60">Status</th>
              </tr>
            </thead>
            <tbody>
              {earnings.map((earning) => {
                const TypeIcon = typeIcons[earning.earning_type];
                const totalFee = earning.platform_fee_pct + earning.partner_fee_pct;

                return (
                  <tr key={earning.id} className="border-b border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {format(new Date(earning.created_at), 'MMM d, yyyy')}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-lg border ${
                          typeColors[earning.earning_type]
                        } flex items-center gap-2 w-fit`}
                      >
                        <TypeIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {typeLabels[earning.earning_type]}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 dark:text-white line-clamp-1">
                        {earning.course_title || earning.session_title || '—'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 dark:text-white font-medium">
                        {formatCurrency(earning.gross_amount)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-500 dark:text-white/60">{totalFee}%</p>
                      <p className="text-xs text-gray-400 dark:text-gray-300 dark:text-white/40">
                        {earning.platform_fee_pct}% + {earning.partner_fee_pct}%
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-green-400 font-medium">
                        {formatCurrency(earning.net_amount)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-lg border ${
                          statusColors[earning.status]
                        } text-sm font-medium`}
                      >
                        {earning.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {earnings.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-500 dark:text-white/60">No earnings found</p>
            </div>
          )}
        </div>
      </div>

      {/* Fee Breakdown Info */}
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Revenue Split Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-purple-200 mb-1">Your Share (Default)</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">60%</p>
          </div>
          <div>
            <p className="text-sm text-purple-200 mb-1">Platform Fee (Default)</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">30%</p>
          </div>
          <div>
            <p className="text-sm text-purple-200 mb-1">Partner Fee (Default)</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">10%</p>
          </div>
        </div>
        <p className="text-sm text-purple-200/60 mt-4">
          Note: Revenue splits can be customized per course or session. Visit the{' '}
          <button
            onClick={() => navigate('/dashboard/instructor/earnings/rates')}
            className="text-purple-300 hover:text-purple-200 underline"
          >
            Rates page
          </button>{' '}
          to configure custom splits.
        </p>
      </div>
    </div>
  );
};
