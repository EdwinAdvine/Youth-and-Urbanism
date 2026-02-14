import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  RefreshCw,
  Search,
  Filter,
  Download,
  Eye,
  Send,
  Clock,
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import AdminPageHeader from '../../components/admin/shared/AdminPageHeader';
import AdminStatsCard from '../../components/admin/shared/AdminStatsCard';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface Invoice {
  id: string;
  invoice_number: string;
  recipient: string;
  recipient_email: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'draft' | 'cancelled';
  due_date: string;
  issued_date: string;
  items: string;
}

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

const MOCK_INVOICES: Invoice[] = [
  { id: 'INV-001', invoice_number: 'INV-2025-0001', recipient: 'Jane Wanjiku', recipient_email: 'jane@example.com', amount: 2500, status: 'paid', due_date: '2025-01-15', issued_date: '2025-01-01', items: 'Premium Plan - January 2025' },
  { id: 'INV-002', invoice_number: 'INV-2025-0002', recipient: 'Peter Ochieng', recipient_email: 'peter@example.com', amount: 1500, status: 'paid', due_date: '2025-01-15', issued_date: '2025-01-01', items: 'Standard Plan - January 2025' },
  { id: 'INV-003', invoice_number: 'INV-2025-0003', recipient: 'Mary Akinyi', recipient_email: 'mary@example.com', amount: 4000, status: 'pending', due_date: '2025-01-20', issued_date: '2025-01-05', items: 'Family Plan - January 2025' },
  { id: 'INV-004', invoice_number: 'INV-2025-0004', recipient: 'David Kamau', recipient_email: 'david@example.com', amount: 2500, status: 'overdue', due_date: '2025-01-10', issued_date: '2024-12-27', items: 'Premium Plan - January 2025' },
  { id: 'INV-005', invoice_number: 'INV-2025-0005', recipient: 'Grace Njeri', recipient_email: 'grace@example.com', amount: 500, status: 'paid', due_date: '2025-01-15', issued_date: '2025-01-01', items: 'Basic Plan - January 2025' },
  { id: 'INV-006', invoice_number: 'INV-2025-0006', recipient: 'EduTech Kenya Ltd', recipient_email: 'billing@edutechke.com', amount: 45000, status: 'pending', due_date: '2025-01-25', issued_date: '2025-01-10', items: 'Partner Revenue Share - Q4 2024' },
  { id: 'INV-007', invoice_number: 'INV-2025-0007', recipient: 'John Mwangi', recipient_email: 'john@example.com', amount: 2500, status: 'draft', due_date: '2025-02-01', issued_date: '2025-01-15', items: 'Premium Plan - February 2025' },
  { id: 'INV-008', invoice_number: 'INV-2025-0008', recipient: 'Sarah Wambui', recipient_email: 'sarah@example.com', amount: 1500, status: 'cancelled', due_date: '2025-01-15', issued_date: '2025-01-01', items: 'Standard Plan - January 2025' },
  { id: 'INV-009', invoice_number: 'INV-2025-0009', recipient: 'Brian Otieno', recipient_email: 'brian@example.com', amount: 5000, status: 'paid', due_date: '2025-01-15', issued_date: '2025-01-01', items: 'Yearly Basic Plan' },
  { id: 'INV-010', invoice_number: 'INV-2025-0010', recipient: 'LearnAfrica', recipient_email: 'billing@learnafrica.co.ke', amount: 32000, status: 'overdue', due_date: '2025-01-12', issued_date: '2024-12-28', items: 'Partner Revenue Share - Q4 2024' },
];

/* ------------------------------------------------------------------ */
/* Badge helpers                                                       */
/* ------------------------------------------------------------------ */

const statusColors: Record<string, string> = {
  paid: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  overdue: 'bg-red-500/20 text-red-400 border-red-500/30',
  draft: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  cancelled: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
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

const InvoicesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const filteredInvoices = MOCK_INVOICES.filter(
    (inv) =>
      (!statusFilter || inv.status === statusFilter) &&
      (!search ||
        inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
        inv.recipient.toLowerCase().includes(search.toLowerCase()))
  );

  const totalInvoices = MOCK_INVOICES.length;
  const paidCount = MOCK_INVOICES.filter((i) => i.status === 'paid').length;
  const pendingCount = MOCK_INVOICES.filter((i) => i.status === 'pending').length;
  const overdueCount = MOCK_INVOICES.filter((i) => i.status === 'overdue').length;
  const totalAmount = MOCK_INVOICES.reduce((sum, i) => sum + i.amount, 0);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
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
        title="Invoices"
        subtitle="Track and manage all platform invoices"
        breadcrumbs={[
          { label: 'Finance', path: '/dashboard/admin' },
          { label: 'Invoices' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 text-sm bg-[#22272B] border border-[#333] rounded-lg text-white/70 hover:text-white hover:border-[#444] transition-colors">
              <Download className="w-4 h-4" />
              Export
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
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatsCard
          title="Total Invoices"
          value={totalInvoices}
          icon={<FileText className="w-5 h-5" />}
          subtitle={formatKES(totalAmount)}
        />
        <AdminStatsCard
          title="Paid"
          value={paidCount}
          icon={<CheckCircle className="w-5 h-5" />}
          trend={{ value: 15, label: 'this month', direction: 'up' }}
        />
        <AdminStatsCard
          title="Pending"
          value={pendingCount}
          icon={<Clock className="w-5 h-5" />}
          trend={{ value: 2, label: 'awaiting payment', direction: 'neutral' }}
        />
        <AdminStatsCard
          title="Overdue"
          value={overdueCount}
          icon={<AlertTriangle className="w-5 h-5" />}
          trend={{ value: 1, label: 'needs attention', direction: 'down' }}
        />
      </motion.div>

      {/* Search / Filters */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search by invoice number or recipient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#181C1F] border border-[#22272B] rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#E40000]/50 transition-colors"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 bg-[#181C1F] border border-[#22272B] rounded-lg text-white text-sm appearance-none cursor-pointer focus:outline-none focus:border-[#E40000]/50 transition-colors min-w-[140px]"
          >
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
            <option value="draft">Draft</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={itemVariants} className="bg-[#181C1F] border border-[#22272B] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#22272B] text-left">
                <th className="px-4 py-3 text-white/60 font-medium">Invoice #</th>
                <th className="px-4 py-3 text-white/60 font-medium">Recipient</th>
                <th className="px-4 py-3 text-white/60 font-medium">Amount</th>
                <th className="px-4 py-3 text-white/60 font-medium">Status</th>
                <th className="px-4 py-3 text-white/60 font-medium">Issued</th>
                <th className="px-4 py-3 text-white/60 font-medium">Due Date</th>
                <th className="px-4 py-3 text-white/60 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <FileText className="w-12 h-12 text-white/10 mx-auto mb-3" />
                    <p className="text-white/40 text-sm">No invoices found</p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-[#22272B]/50 hover:bg-[#1E2327] transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-white font-mono text-xs">{inv.invoice_number}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="text-white font-medium">{inv.recipient}</span>
                        <span className="block text-xs text-white/40">{inv.items}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white font-medium">{formatKES(inv.amount)}</td>
                    <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                    <td className="px-4 py-3 text-white/60">{formatDate(inv.issued_date)}</td>
                    <td className="px-4 py-3">
                      <span className={inv.status === 'overdue' ? 'text-red-400' : 'text-white/60'}>
                        {formatDate(inv.due_date)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="View"
                          className="p-1.5 rounded-lg hover:bg-[#22272B] text-white/50 hover:text-white transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          title="Download PDF"
                          className="p-1.5 rounded-lg hover:bg-[#22272B] text-white/50 hover:text-white transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {(inv.status === 'pending' || inv.status === 'overdue') && (
                          <button
                            title="Send Reminder"
                            className="p-1.5 rounded-lg hover:bg-blue-500/10 text-white/50 hover:text-blue-400 transition-colors"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#22272B]">
          <p className="text-xs text-white/40">
            Showing 1-{filteredInvoices.length} of {filteredInvoices.length} invoices
          </p>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg hover:bg-[#22272B] text-white/50 hover:text-white disabled:opacity-30 transition-colors" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-lg text-xs font-medium bg-[#E40000] text-white">1</button>
            <button className="p-1.5 rounded-lg hover:bg-[#22272B] text-white/50 hover:text-white disabled:opacity-30 transition-colors" disabled>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InvoicesPage;
