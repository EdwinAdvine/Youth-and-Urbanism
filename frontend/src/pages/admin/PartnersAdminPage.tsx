import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Handshake,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Edit3,
  Users,
  DollarSign,
  FileText,
  Plus,
} from 'lucide-react';
import AdminPageHeader from '../../components/admin/shared/AdminPageHeader';
import AdminStatsCard from '../../components/admin/shared/AdminStatsCard';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type PartnerTab = 'content' | 'business';

interface Partner {
  id: string;
  name: string;
  type: 'content' | 'business';
  contact_email: string;
  status: 'active' | 'pending' | 'suspended' | 'expired';
  revenue_share: number;
  joined_at: string;
  total_revenue: number;
  courses_count?: number;
  contract_end?: string;
}

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

const MOCK_PARTNERS: Partner[] = [
  { id: 'P-001', name: 'EduTech Kenya', type: 'content', contact_email: 'info@edutechke.com', status: 'active', revenue_share: 30, joined_at: '2024-03-15', total_revenue: 450000, courses_count: 24 },
  { id: 'P-002', name: 'LearnAfrica', type: 'content', contact_email: 'partner@learnafrica.co.ke', status: 'active', revenue_share: 25, joined_at: '2024-05-20', total_revenue: 320000, courses_count: 18 },
  { id: 'P-003', name: 'KICD Digital', type: 'content', contact_email: 'digital@kicd.ac.ke', status: 'active', revenue_share: 20, joined_at: '2024-01-10', total_revenue: 680000, courses_count: 42 },
  { id: 'P-004', name: 'Safaricom Foundation', type: 'business', contact_email: 'education@safaricom.co.ke', status: 'active', revenue_share: 0, joined_at: '2024-02-01', total_revenue: 0, contract_end: '2025-12-31' },
  { id: 'P-005', name: 'KCB Group', type: 'business', contact_email: 'csr@kcbgroup.com', status: 'active', revenue_share: 0, joined_at: '2024-06-15', total_revenue: 0, contract_end: '2026-06-30' },
  { id: 'P-006', name: 'Cambridge Press EA', type: 'content', contact_email: 'ea@cambridge.org', status: 'pending', revenue_share: 35, joined_at: '2025-01-05', total_revenue: 0, courses_count: 0 },
  { id: 'P-007', name: 'Equity Foundation', type: 'business', contact_email: 'programs@equityfoundation.co.ke', status: 'suspended', revenue_share: 0, joined_at: '2024-04-10', total_revenue: 0, contract_end: '2025-04-10' },
  { id: 'P-008', name: 'Longhorn Publishers', type: 'content', contact_email: 'digital@longhornpublishers.com', status: 'active', revenue_share: 28, joined_at: '2024-07-01', total_revenue: 195000, courses_count: 12 },
];

/* ------------------------------------------------------------------ */
/* Badge helpers                                                       */
/* ------------------------------------------------------------------ */

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  suspended: 'bg-red-500/20 text-red-400 border-red-500/30',
  expired: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
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

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const formatKES = (amount: number): string =>
  `KES ${amount.toLocaleString()}`;

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const PartnersAdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PartnerTab>('content');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const filteredPartners = MOCK_PARTNERS.filter(
    (p) =>
      p.type === activeTab &&
      (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.contact_email.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPartners = MOCK_PARTNERS.filter((p) => p.status === 'active').length;
  const activeContracts = MOCK_PARTNERS.filter((p) => p.status === 'active').length;
  const totalRevenueShared = MOCK_PARTNERS.reduce((sum, p) => sum + p.total_revenue, 0);

  const tabs: { key: PartnerTab; label: string; count: number }[] = [
    { key: 'content', label: 'Content Partners', count: MOCK_PARTNERS.filter((p) => p.type === 'content').length },
    { key: 'business', label: 'Business Partners', count: MOCK_PARTNERS.filter((p) => p.type === 'business').length },
  ];

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
        title="Partners"
        subtitle="Manage content providers and business partnerships"
        breadcrumbs={[
          { label: 'Finance', path: '/dashboard/admin' },
          { label: 'Partners' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 text-sm bg-[#E40000] rounded-lg text-white hover:bg-[#C00] transition-colors">
              <Plus className="w-4 h-4" />
              Add Partner
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
          title="Total Partners"
          value={totalPartners}
          icon={<Handshake className="w-5 h-5" />}
          trend={{ value: 2, label: 'new this quarter', direction: 'up' }}
        />
        <AdminStatsCard
          title="Active Contracts"
          value={activeContracts}
          icon={<FileText className="w-5 h-5" />}
          trend={{ value: 0, label: 'same as last month', direction: 'neutral' }}
        />
        <AdminStatsCard
          title="Revenue Shared"
          value={formatKES(totalRevenueShared)}
          icon={<DollarSign className="w-5 h-5" />}
          trend={{ value: 12.5, label: 'vs last quarter', direction: 'up' }}
        />
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex gap-1 bg-[#181C1F] border border-[#22272B] rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-[#E40000] text-white'
                : 'text-white/50 hover:text-white hover:bg-[#22272B]'
            }`}
          >
            {tab.label}
            <span
              className={`px-1.5 py-0.5 rounded-full text-xs ${
                activeTab === tab.key ? 'bg-white/20' : 'bg-[#22272B] text-white/40'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search partners..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#181C1F] border border-[#22272B] rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#E40000]/50 transition-colors"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <select className="pl-10 pr-8 py-2.5 bg-[#181C1F] border border-[#22272B] rounded-lg text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-[#E40000]/50 transition-colors min-w-[140px]">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={itemVariants} className="bg-[#181C1F] border border-[#22272B] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#22272B] text-left">
                <th className="px-4 py-3 text-white/60 font-medium">Partner</th>
                <th className="px-4 py-3 text-white/60 font-medium">Type</th>
                <th className="px-4 py-3 text-white/60 font-medium">Status</th>
                <th className="px-4 py-3 text-white/60 font-medium">Revenue Share</th>
                <th className="px-4 py-3 text-white/60 font-medium">
                  {activeTab === 'content' ? 'Courses' : 'Contract End'}
                </th>
                <th className="px-4 py-3 text-white/60 font-medium">Joined</th>
                <th className="px-4 py-3 text-white/60 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPartners.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <Users className="w-12 h-12 text-white/10 mx-auto mb-3" />
                    <p className="text-white/40 text-sm">No partners found</p>
                  </td>
                </tr>
              ) : (
                filteredPartners.map((partner) => (
                  <tr key={partner.id} className="border-b border-[#22272B]/50 hover:bg-[#1E2327] transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <span className="text-white font-medium">{partner.name}</span>
                        <span className="block text-xs text-white/40">{partner.contact_email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize bg-blue-500/20 text-blue-400 border-blue-500/30">
                        {partner.type}
                      </span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={partner.status} /></td>
                    <td className="px-4 py-3 text-white/80">
                      {partner.revenue_share > 0 ? `${partner.revenue_share}%` : '--'}
                    </td>
                    <td className="px-4 py-3 text-white/60">
                      {activeTab === 'content'
                        ? `${partner.courses_count ?? 0} courses`
                        : partner.contract_end
                          ? formatDate(partner.contract_end)
                          : '--'
                      }
                    </td>
                    <td className="px-4 py-3 text-white/40">{formatDate(partner.joined_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="View"
                          className="p-1.5 rounded-lg hover:bg-[#22272B] text-white/50 hover:text-white transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          title="Edit"
                          className="p-1.5 rounded-lg hover:bg-[#22272B] text-white/50 hover:text-white transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PartnersAdminPage;
