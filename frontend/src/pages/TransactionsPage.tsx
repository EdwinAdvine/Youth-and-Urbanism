import React, { useState, useMemo, useEffect } from 'react';
import {
  Filter,
  Download,
  Search,
  Calendar,
  ChevronDown,
  ChevronUp,
  X,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCcw,
  Eye,
  RotateCcw
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { getTransactionHistory } from '../services/paymentService';

// Types
interface Transaction {
  id: string;
  reference: string;
  date: Date;
  type: 'deposit' | 'withdrawal' | 'payment';
  gateway: 'M-Pesa' | 'PayPal' | 'Stripe';
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  description: string;
  recipientName?: string;
  senderName?: string;
  phoneNumber?: string;
  email?: string;
  metadata?: Record<string, any>;
  timeline: TimelineEvent[];
}

interface TimelineEvent {
  status: string;
  timestamp: Date;
  description: string;
}

interface FilterState {
  dateRange: 'last7days' | 'last30days' | 'last90days' | 'custom';
  customStartDate: string;
  customEndDate: string;
  gateway: 'all' | 'M-Pesa' | 'PayPal' | 'Stripe';
  status: 'all' | 'completed' | 'pending' | 'failed' | 'refunded';
  type: 'all' | 'deposit' | 'withdrawal' | 'payment';
  searchQuery: string;
}

type SortField = 'date' | 'amount' | 'reference' | 'status';
type SortOrder = 'asc' | 'desc';

// Mock data generator
const generateMockTransactions = (): Transaction[] => {
  const types: Transaction['type'][] = ['deposit', 'withdrawal', 'payment'];
  const gateways: Transaction['gateway'][] = ['M-Pesa', 'PayPal', 'Stripe'];
  const statuses: Transaction['status'][] = ['completed', 'pending', 'failed', 'refunded'];
  const descriptions = [
    'Course enrollment payment',
    'Tuition fee payment',
    'Wallet top-up',
    'Refund for cancelled course',
    'Monthly subscription',
    'Assignment submission fee',
    'Certificate purchase',
    'Premium features upgrade',
    'Learning materials purchase',
    'One-on-one tutoring session'
  ];

  const transactions: Transaction[] = [];

  for (let i = 0; i < 40; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const gateway = gateways[Math.floor(Math.random() * gateways.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 90));

    const timeline: TimelineEvent[] = [
      {
        status: 'created',
        timestamp: new Date(date.getTime()),
        description: 'Transaction initiated'
      }
    ];

    if (status === 'pending') {
      timeline.push({
        status: 'processing',
        timestamp: new Date(date.getTime() + 60000),
        description: 'Processing payment'
      });
    } else {
      timeline.push({
        status: 'processing',
        timestamp: new Date(date.getTime() + 60000),
        description: 'Processing payment'
      });
      timeline.push({
        status: status,
        timestamp: new Date(date.getTime() + 120000),
        description: status === 'completed'
          ? 'Payment successful'
          : status === 'failed'
          ? 'Payment failed'
          : 'Payment refunded'
      });
    }

    transactions.push({
      id: `TXN${String(i + 1).padStart(6, '0')}`,
      reference: `REF${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      date,
      type,
      gateway,
      amount: Math.floor(Math.random() * 50000) + 500,
      currency: 'KES',
      status,
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      recipientName: type === 'withdrawal' ? 'John Doe' : undefined,
      senderName: type === 'deposit' ? 'Jane Smith' : undefined,
      phoneNumber: gateway === 'M-Pesa' ? `+2547${Math.floor(Math.random() * 100000000)}` : undefined,
      email: gateway !== 'M-Pesa' ? `user${i}@example.com` : undefined,
      metadata: {
        ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        location: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru'][Math.floor(Math.random() * 4)]
      },
      timeline
    });
  }

  return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
};

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(generateMockTransactions());

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await getTransactionHistory(100, 0);
        if (response.transactions.length > 0) {
          const mapped: Transaction[] = response.transactions.map((t: any) => ({
            id: t.id || t.transactionRef,
            reference: t.transactionRef || t.id,
            date: new Date(t.createdAt || t.created_at),
            type: t.type === 'refund' ? 'withdrawal' : t.type === 'wallet_topup' ? 'deposit' : 'payment',
            gateway: t.gateway === 'mpesa' ? 'M-Pesa' : t.gateway === 'paypal' ? 'PayPal' : 'Stripe',
            amount: t.amount,
            currency: t.currency || 'KES',
            status: t.status,
            description: t.description || t.type,
            phoneNumber: t.metadata?.phoneNumber,
            email: t.metadata?.email,
            timeline: [
              { status: 'created', timestamp: new Date(t.createdAt || t.created_at), description: 'Transaction initiated' },
              ...(t.completedAt ? [{ status: t.status, timestamp: new Date(t.completedAt), description: t.status === 'completed' ? 'Payment successful' : `Payment ${t.status}` }] : []),
            ],
          }));
          setTransactions(mapped);
        }
      } catch {
        // API not available - keep mock data
      }
    };
    fetchTransactions();
  }, []);
  const [filters, setFilters] = useState<FilterState>({
    dateRange: 'last30days',
    customStartDate: '',
    customEndDate: '',
    gateway: 'all',
    status: 'all',
    type: 'all',
    searchQuery: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isExporting, setIsExporting] = useState(false);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Date range filter
    const now = new Date();
    let startDate: Date | null = null;

    switch (filters.dateRange) {
      case 'last7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'last30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'last90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'custom':
        if (filters.customStartDate) {
          startDate = new Date(filters.customStartDate);
        }
        break;
    }

    if (startDate) {
      filtered = filtered.filter(t => t.date >= startDate);
    }

    if (filters.dateRange === 'custom' && filters.customEndDate) {
      const endDate = new Date(filters.customEndDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(t => t.date <= endDate);
    }

    // Gateway filter
    if (filters.gateway !== 'all') {
      filtered = filtered.filter(t => t.gateway === filters.gateway);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(t => t.status === filters.status);
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        t =>
          t.reference.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          t.id.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [transactions, filters]);

  // Sort transactions
  const sortedTransactions = useMemo(() => {
    const sorted = [...filteredTransactions];

    sorted.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'date':
          aValue = a.date.getTime();
          bValue = b.date.getTime();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'reference':
          aValue = a.reference;
          bValue = b.reference;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredTransactions, sortField, sortOrder]);

  // Paginate transactions
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedTransactions.slice(startIndex, endIndex);
  }, [sortedTransactions, currentPage, itemsPerPage]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalTransactions = filteredTransactions.length;
    const deposits = filteredTransactions
      .filter(t => t.type === 'deposit' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    const withdrawals = filteredTransactions
      .filter(t => t.type === 'withdrawal' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalAmount = deposits - withdrawals;

    const completedCount = filteredTransactions.filter(t => t.status === 'completed').length;
    const successRate = totalTransactions > 0 ? (completedCount / totalTransactions) * 100 : 0;

    const gatewayCount: Record<string, number> = {};
    filteredTransactions.forEach(t => {
      gatewayCount[t.gateway] = (gatewayCount[t.gateway] || 0) + 1;
    });
    const mostUsedGateway = Object.entries(gatewayCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return {
      totalTransactions,
      totalAmount,
      successRate,
      mostUsedGateway
    };
  }, [filteredTransactions]);

  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      dateRange: 'last30days',
      customStartDate: '',
      customEndDate: '',
      gateway: 'all',
      status: 'all',
      type: 'all',
      searchQuery: ''
    });
    setCurrentPage(1);
  };

  const handleExportCSV = async () => {
    setIsExporting(true);

    // Simulate export delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const headers = ['Date', 'Reference', 'Type', 'Gateway', 'Amount', 'Status', 'Description'];
    const csvContent = [
      headers.join(','),
      ...sortedTransactions.map(t =>
        [
          t.date.toISOString(),
          t.reference,
          t.type,
          t.gateway,
          `${t.currency} ${t.amount.toLocaleString()}`,
          t.status,
          `"${t.description}"`
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setIsExporting(false);
  };

  const handleDownloadReceipt = (transaction: Transaction) => {
    console.log('Downloading receipt for transaction:', transaction.id);
    // Implement receipt download logic
  };

  const handleRefund = (transaction: Transaction) => {
    console.log('Initiating refund for transaction:', transaction.id);
    // Implement refund logic
  };

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#181C1F] p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Transaction History</h1>
              <p className="text-gray-400 mt-1">View and manage all your transactions</p>
            </div>
            <button
              onClick={handleExportCSV}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <RefreshCcw className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              Export CSV
            </button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#1a1f26] p-6 rounded-lg border border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Transactions</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {stats.totalTransactions}
                  </p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </div>

            <div className="bg-[#1a1f26] p-6 rounded-lg border border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Net Amount</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    KES {stats.totalAmount.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <CreditCard className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </div>

            <div className="bg-[#1a1f26] p-6 rounded-lg border border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Success Rate</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {stats.successRate.toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
            </div>

            <div className="bg-[#1a1f26] p-6 rounded-lg border border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Most Used</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {stats.mostUsedGateway}
                  </p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <CreditCard className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-[#1a1f26] p-4 rounded-lg border border-gray-800">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by reference or description..."
                  value={filters.searchQuery}
                  onChange={e => handleFilterChange('searchQuery', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#181C1F] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-[#181C1F] border border-gray-700 rounded-lg text-white hover:border-gray-600 transition-colors"
              >
                <Filter className="w-5 h-5" />
                Filters
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Date Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Date Range
                    </label>
                    <select
                      value={filters.dateRange}
                      onChange={e => handleFilterChange('dateRange', e.target.value)}
                      className="w-full px-3 py-2 bg-[#181C1F] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="last7days">Last 7 days</option>
                      <option value="last30days">Last 30 days</option>
                      <option value="last90days">Last 90 days</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  {/* Gateway */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Gateway
                    </label>
                    <select
                      value={filters.gateway}
                      onChange={e => handleFilterChange('gateway', e.target.value)}
                      className="w-full px-3 py-2 bg-[#181C1F] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="all">All Gateways</option>
                      <option value="M-Pesa">M-Pesa</option>
                      <option value="PayPal">PayPal</option>
                      <option value="Stripe">Stripe</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={e => handleFilterChange('status', e.target.value)}
                      className="w-full px-3 py-2 bg-[#181C1F] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Transaction Type
                    </label>
                    <select
                      value={filters.type}
                      onChange={e => handleFilterChange('type', e.target.value)}
                      className="w-full px-3 py-2 bg-[#181C1F] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="all">All Types</option>
                      <option value="deposit">Deposits</option>
                      <option value="withdrawal">Withdrawals</option>
                      <option value="payment">Payments</option>
                    </select>
                  </div>

                  {/* Custom Date Range */}
                  {filters.dateRange === 'custom' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={filters.customStartDate}
                          onChange={e => handleFilterChange('customStartDate', e.target.value)}
                          className="w-full px-3 py-2 bg-[#181C1F] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={filters.customEndDate}
                          onChange={e => handleFilterChange('customEndDate', e.target.value)}
                          className="w-full px-3 py-2 bg-[#181C1F] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleResetFilters}
                    className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Transactions Table */}
          <div className="bg-[#1a1f26] rounded-lg border border-gray-800 overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#181C1F] border-b border-gray-800">
                  <tr>
                    <th
                      className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center gap-2">
                        Date
                        {sortField === 'date' && (
                          sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                      onClick={() => handleSort('reference')}
                    >
                      <div className="flex items-center gap-2">
                        Reference
                        {sortField === 'reference' && (
                          sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Gateway
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center gap-2">
                        Amount
                        {sortField === 'amount' && (
                          sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-2">
                        Status
                        {sortField === 'status' && (
                          sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {paginatedTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <FileText className="w-16 h-16 text-gray-600 mb-4" />
                          <h3 className="text-lg font-medium text-white mb-2">No transactions found</h3>
                          <p className="text-gray-400">Try adjusting your filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedTransactions.map(transaction => (
                      <tr
                        key={transaction.id}
                        className="hover:bg-[#181C1F] cursor-pointer transition-colors"
                        onClick={() => setSelectedTransaction(transaction)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <div>
                              <div className="text-sm text-white">
                                {transaction.date.toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {transaction.date.toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-white">{transaction.reference}</div>
                          <div className="text-xs text-gray-500">{transaction.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {transaction.type === 'deposit' && (
                              <ArrowDownRight className="w-4 h-4 text-green-500" />
                            )}
                            {transaction.type === 'withdrawal' && (
                              <ArrowUpRight className="w-4 h-4 text-red-500" />
                            )}
                            {transaction.type === 'payment' && (
                              <CreditCard className="w-4 h-4 text-blue-500" />
                            )}
                            <span className="text-sm text-white capitalize">{transaction.type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-white">{transaction.gateway}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-white">
                            {transaction.currency} {transaction.amount.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={transaction.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedTransaction(transaction);
                            }}
                            className="text-blue-500 hover:text-blue-400 transition-colors"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-gray-800">
              {paginatedTransactions.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <FileText className="w-16 h-16 text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No transactions found</h3>
                    <p className="text-gray-400">Try adjusting your filters</p>
                  </div>
                </div>
              ) : (
                paginatedTransactions.map(transaction => (
                  <div
                    key={transaction.id}
                    className="p-4 hover:bg-[#181C1F] cursor-pointer transition-colors"
                    onClick={() => setSelectedTransaction(transaction)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-sm font-mono text-white">{transaction.reference}</div>
                        <div className="text-xs text-gray-500 mt-1">{transaction.id}</div>
                      </div>
                      <StatusBadge status={transaction.status} />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Date</span>
                        <span className="text-sm text-white">
                          {transaction.date.toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Type</span>
                        <div className="flex items-center gap-2">
                          {transaction.type === 'deposit' && (
                            <ArrowDownRight className="w-4 h-4 text-green-500" />
                          )}
                          {transaction.type === 'withdrawal' && (
                            <ArrowUpRight className="w-4 h-4 text-red-500" />
                          )}
                          {transaction.type === 'payment' && (
                            <CreditCard className="w-4 h-4 text-blue-500" />
                          )}
                          <span className="text-sm text-white capitalize">{transaction.type}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Gateway</span>
                        <span className="text-sm text-white">{transaction.gateway}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Amount</span>
                        <span className="text-sm font-semibold text-white">
                          {transaction.currency} {transaction.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {paginatedTransactions.length > 0 && (
              <div className="px-6 py-4 bg-[#181C1F] border-t border-gray-800">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Show</span>
                    <select
                      value={itemsPerPage}
                      onChange={e => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-3 py-1 bg-[#1a1f26] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                    <span className="text-sm text-gray-400">
                      of {sortedTransactions.length} transactions
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 bg-[#1a1f26] border border-gray-700 rounded-lg text-white text-sm hover:border-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'bg-[#1a1f26] border border-gray-700 text-white hover:border-gray-600'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 bg-[#1a1f26] border border-gray-700 rounded-lg text-white text-sm hover:border-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Transaction Detail Modal */}
        {selectedTransaction && (
          <TransactionDetailModal
            transaction={selectedTransaction}
            onClose={() => setSelectedTransaction(null)}
            onDownloadReceipt={handleDownloadReceipt}
            onRefund={handleRefund}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

// Status Badge Component
const StatusBadge: React.FC<{ status: Transaction['status'] }> = ({ status }) => {
  const statusConfig = {
    completed: {
      bg: 'bg-green-500/10',
      text: 'text-green-500',
      border: 'border-green-500/20',
      icon: CheckCircle
    },
    pending: {
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-500',
      border: 'border-yellow-500/20',
      icon: Clock
    },
    failed: {
      bg: 'bg-red-500/10',
      text: 'text-red-500',
      border: 'border-red-500/20',
      icon: XCircle
    },
    refunded: {
      bg: 'bg-gray-500/10',
      text: 'text-gray-500',
      border: 'border-gray-500/20',
      icon: RotateCcw
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Transaction Detail Modal Component
interface TransactionDetailModalProps {
  transaction: Transaction;
  onClose: () => void;
  onDownloadReceipt: (transaction: Transaction) => void;
  onRefund: (transaction: Transaction) => void;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
  onDownloadReceipt,
  onRefund
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1f26] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-800">
        {/* Header */}
        <div className="sticky top-0 bg-[#1a1f26] border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Transaction Details</h2>
            <p className="text-sm text-gray-400 mt-1">{transaction.reference}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#181C1F] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status and Amount */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Status</p>
              <StatusBadge status={transaction.status} />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400 mb-1">Amount</p>
              <p className="text-2xl font-bold text-white">
                {transaction.currency} {transaction.amount.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-[#181C1F] rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-semibold text-white mb-3">Basic Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Transaction ID</p>
                <p className="text-sm text-white font-mono">{transaction.id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Reference</p>
                <p className="text-sm text-white font-mono">{transaction.reference}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Type</p>
                <p className="text-sm text-white capitalize">{transaction.type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Gateway</p>
                <p className="text-sm text-white">{transaction.gateway}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Date</p>
                <p className="text-sm text-white">{transaction.date.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Description</p>
                <p className="text-sm text-white">{transaction.description}</p>
              </div>
            </div>
          </div>

          {/* Gateway Information */}
          <div className="bg-[#181C1F] rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-semibold text-white mb-3">Gateway Information</h3>

            <div className="space-y-3">
              {transaction.phoneNumber && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Phone Number</p>
                  <p className="text-sm text-white">{transaction.phoneNumber}</p>
                </div>
              )}
              {transaction.email && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Email</p>
                  <p className="text-sm text-white">{transaction.email}</p>
                </div>
              )}
              {transaction.senderName && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Sender</p>
                  <p className="text-sm text-white">{transaction.senderName}</p>
                </div>
              )}
              {transaction.recipientName && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Recipient</p>
                  <p className="text-sm text-white">{transaction.recipientName}</p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-[#181C1F] rounded-lg p-4">
            <h3 className="text-sm font-semibold text-white mb-4">Status Timeline</h3>

            <div className="space-y-4">
              {transaction.timeline.map((event, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        index === transaction.timeline.length - 1
                          ? 'bg-blue-500'
                          : 'bg-gray-600'
                      }`}
                    />
                    {index < transaction.timeline.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-700 mt-1" />
                    )}
                  </div>

                  <div className="flex-1 pb-4">
                    <p className="text-sm font-medium text-white capitalize">
                      {event.status}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{event.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {event.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Metadata */}
          {transaction.metadata && (
            <div className="bg-[#181C1F] rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-semibold text-white mb-3">Additional Information</h3>

              <div className="grid grid-cols-2 gap-4">
                {Object.entries(transaction.metadata).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-xs text-gray-400 mb-1 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="text-sm text-white">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onDownloadReceipt(transaction)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Receipt
            </button>

            {transaction.status === 'completed' && (
              <button
                onClick={() => onRefund(transaction)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Request Refund
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;