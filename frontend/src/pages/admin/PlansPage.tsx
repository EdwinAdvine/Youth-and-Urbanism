import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  RefreshCw,
  Plus,
  Edit3,
  Trash2,
  Users,
  DollarSign,
  ToggleLeft,
  ToggleRight,
  X,
  Check,
} from 'lucide-react';
import AdminPageHeader from '../../components/admin/shared/AdminPageHeader';
import AdminStatsCard from '../../components/admin/shared/AdminStatsCard';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  billing_cycle: 'monthly' | 'quarterly' | 'yearly';
  subscriber_count: number;
  status: 'active' | 'inactive' | 'deprecated';
  features: string[];
  created_at: string;
  revenue: number;
}

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

const MOCK_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan-001',
    name: 'Basic',
    price: 500,
    billing_cycle: 'monthly',
    subscriber_count: 1250,
    status: 'active',
    features: ['5 courses', 'Basic AI tutor', 'Email support'],
    created_at: '2024-06-01',
    revenue: 625000,
  },
  {
    id: 'plan-002',
    name: 'Standard',
    price: 1500,
    billing_cycle: 'monthly',
    subscriber_count: 850,
    status: 'active',
    features: ['Unlimited courses', 'Advanced AI tutor', 'Priority support', 'Progress reports'],
    created_at: '2024-06-01',
    revenue: 1275000,
  },
  {
    id: 'plan-003',
    name: 'Premium',
    price: 2500,
    billing_cycle: 'monthly',
    subscriber_count: 420,
    status: 'active',
    features: ['Everything in Standard', 'Voice AI tutor', 'Video lessons', '1-on-1 tutoring', 'Offline access'],
    created_at: '2024-06-01',
    revenue: 1050000,
  },
  {
    id: 'plan-004',
    name: 'Family',
    price: 4000,
    billing_cycle: 'monthly',
    subscriber_count: 180,
    status: 'active',
    features: ['Up to 5 children', 'Premium features', 'Parent dashboard', 'Family reports'],
    created_at: '2024-08-15',
    revenue: 720000,
  },
  {
    id: 'plan-005',
    name: 'Yearly Basic',
    price: 5000,
    billing_cycle: 'yearly',
    subscriber_count: 340,
    status: 'active',
    features: ['Same as Basic', '2 months free'],
    created_at: '2024-09-01',
    revenue: 1700000,
  },
  {
    id: 'plan-006',
    name: 'Trial Plan',
    price: 0,
    billing_cycle: 'monthly',
    subscriber_count: 0,
    status: 'deprecated',
    features: ['3 courses', 'Basic AI tutor', '14 day trial'],
    created_at: '2024-03-01',
    revenue: 0,
  },
];

/* ------------------------------------------------------------------ */
/* Badge helpers                                                       */
/* ------------------------------------------------------------------ */

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  inactive: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  deprecated: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${
      statusColors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }`}
  >
    {status}
  </span>
);

const CycleBadge: React.FC<{ cycle: string }> = ({ cycle }) => {
  const colors: Record<string, string> = {
    monthly: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    quarterly: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    yearly: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${
        colors[cycle] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      }`}
    >
      {cycle}
    </span>
  );
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const formatKES = (amount: number): string =>
  `KES ${amount.toLocaleString()}`;

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const PlansPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>(MOCK_PLANS);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const handleToggleStatus = (planId: string) => {
    setPlans((prev) =>
      prev.map((p) =>
        p.id === planId
          ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' }
          : p
      )
    );
  };

  const handleDelete = (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    setPlans((prev) => prev.filter((p) => p.id !== planId));
  };

  const totalSubscribers = plans.reduce((sum, p) => sum + p.subscriber_count, 0);
  const totalRevenue = plans.reduce((sum, p) => sum + p.revenue, 0);
  const activePlans = plans.filter((p) => p.status === 'active').length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-16 bg-[#22272B] rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-[#22272B] rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-80 bg-[#22272B] rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <AdminPageHeader
        title="Subscription Plans"
        subtitle="Manage pricing plans and billing cycles"
        breadcrumbs={[
          { label: 'Finance', path: '/dashboard/admin' },
          { label: 'Plans' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setEditingPlan(null); setShowForm(true); }}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-[#E40000] rounded-lg text-white hover:bg-[#C00] transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Plan
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-[#22272B] border border-[#333] rounded-lg text-white/70 hover:text-white hover:border-[#444] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        }
      />

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AdminStatsCard
          title="Active Plans"
          value={activePlans}
          icon={<CreditCard className="w-5 h-5" />}
          trend={{ value: 1, label: 'new this month', direction: 'up' }}
        />
        <AdminStatsCard
          title="Total Subscribers"
          value={totalSubscribers.toLocaleString()}
          icon={<Users className="w-5 h-5" />}
          trend={{ value: 5.4, label: 'vs last month', direction: 'up' }}
        />
        <AdminStatsCard
          title="Revenue / Month"
          value={formatKES(totalRevenue)}
          icon={<DollarSign className="w-5 h-5" />}
          trend={{ value: 8.2, label: 'vs last month', direction: 'up' }}
        />
      </motion.div>

      {/* Plans Table */}
      <motion.div variants={itemVariants} className="bg-[#181C1F] border border-[#22272B] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#22272B] text-left">
                <th className="px-4 py-3 text-white/60 font-medium">Plan Name</th>
                <th className="px-4 py-3 text-white/60 font-medium">Price</th>
                <th className="px-4 py-3 text-white/60 font-medium">Billing Cycle</th>
                <th className="px-4 py-3 text-white/60 font-medium">Subscribers</th>
                <th className="px-4 py-3 text-white/60 font-medium">Revenue</th>
                <th className="px-4 py-3 text-white/60 font-medium">Status</th>
                <th className="px-4 py-3 text-white/60 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id} className="border-b border-[#22272B]/50 hover:bg-[#1E2327] transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <span className="text-white font-medium">{plan.name}</span>
                      <span className="block text-xs text-white/40 mt-0.5">
                        {plan.features.slice(0, 2).join(', ')}
                        {plan.features.length > 2 && ` +${plan.features.length - 2} more`}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white font-medium">{formatKES(plan.price)}</td>
                  <td className="px-4 py-3"><CycleBadge cycle={plan.billing_cycle} /></td>
                  <td className="px-4 py-3 text-white/80">{plan.subscriber_count.toLocaleString()}</td>
                  <td className="px-4 py-3 text-white/80">{formatKES(plan.revenue)}</td>
                  <td className="px-4 py-3"><StatusBadge status={plan.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleToggleStatus(plan.id)}
                        title={plan.status === 'active' ? 'Deactivate' : 'Activate'}
                        className="p-1.5 rounded-lg hover:bg-[#22272B] text-white/50 hover:text-white transition-colors"
                      >
                        {plan.status === 'active' ? (
                          <ToggleRight className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => { setEditingPlan(plan); setShowForm(true); }}
                        title="Edit"
                        className="p-1.5 rounded-lg hover:bg-[#22272B] text-white/50 hover:text-white transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(plan.id)}
                        title="Delete"
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/50 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Plan Editor Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#181C1F] border border-[#22272B] rounded-xl p-6 w-full max-w-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">
                {editingPlan ? 'Edit Plan' : 'Create New Plan'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 rounded-lg hover:bg-[#22272B] text-white/50 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Plan Name</label>
                <input
                  type="text"
                  defaultValue={editingPlan?.name || ''}
                  placeholder="Enter plan name"
                  className="w-full px-4 py-2.5 bg-[#0F1112] border border-[#22272B] rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#E40000]/50 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Price (KES)</label>
                  <input
                    type="number"
                    defaultValue={editingPlan?.price || ''}
                    placeholder="0"
                    className="w-full px-4 py-2.5 bg-[#0F1112] border border-[#22272B] rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#E40000]/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">Billing Cycle</label>
                  <select
                    defaultValue={editingPlan?.billing_cycle || 'monthly'}
                    className="w-full px-4 py-2.5 bg-[#0F1112] border border-[#22272B] rounded-lg text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-[#E40000]/50 transition-colors"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Features (one per line)</label>
                <textarea
                  rows={4}
                  defaultValue={editingPlan?.features.join('\n') || ''}
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  className="w-full px-4 py-2.5 bg-[#0F1112] border border-[#22272B] rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#E40000]/50 transition-colors resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-[#E40000] rounded-lg text-white hover:bg-[#C00] transition-colors"
              >
                <Check className="w-4 h-4" />
                {editingPlan ? 'Save Changes' : 'Create Plan'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default PlansPage;
