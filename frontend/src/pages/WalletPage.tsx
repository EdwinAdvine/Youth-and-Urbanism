import React, { useState, useMemo, useEffect } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Smartphone,
  Search,
  Filter,
  Plus,
  X,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  MoreVertical,
  Trash2,
  Star,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Transaction } from '../types/index';
import { getWallet, getTransactionHistory, getPaymentMethods as fetchPaymentMethods } from '../services/paymentService';

// Extended Transaction type for wallet-specific features
interface WalletTransaction extends Transaction {
  gateway?: 'mpesa' | 'paypal' | 'card' | 'bank';
  recipient?: string;
  sender?: string;
}

// Payment method interface
interface PaymentMethod {
  id: string;
  type: 'mpesa' | 'paypal' | 'card' | 'bank';
  name: string;
  details: string;
  isDefault: boolean;
  lastUsed?: Date;
  expiryDate?: string;
}

// Mock wallet data
const generateMockTransactions = (): WalletTransaction[] => {
  const types: Array<'credit' | 'debit'> = ['credit', 'debit'];
  const gateways: Array<'mpesa' | 'paypal' | 'card' | 'bank'> = ['mpesa', 'paypal', 'card', 'bank'];
  const statuses: Array<'pending' | 'completed' | 'failed' | 'refunded'> = ['completed', 'completed', 'completed', 'pending', 'failed'];
  const categories: Array<'course_purchase' | 'subscription' | 'refund' | 'payout' | 'wallet_topup'> = [
    'wallet_topup',
    'course_purchase',
    'subscription',
    'refund',
    'payout'
  ];

  const descriptions = [
    'Course: Advanced Mathematics',
    'Monthly Subscription',
    'Wallet Top-up',
    'Refund: Python Programming',
    'Course: Web Development',
    'Premium Plan Upgrade',
    'Course: Data Science',
    'Wallet Top-up via M-Pesa',
    'Course: Machine Learning',
    'Annual Subscription',
    'Wallet Top-up via Card',
    'Course: UI/UX Design',
    'Refund: Cancelled Course',
    'Course: Digital Marketing',
    'Wallet Top-up via PayPal',
    'Course: Business Analytics',
    'Premium Features',
    'Course: Photography',
    'Wallet Top-up',
    'Course: Graphic Design'
  ];

  const transactions: WalletTransaction[] = [];
  const now = new Date();

  for (let i = 0; i < 20; i++) {
    const createdAt = new Date(now);
    createdAt.setDate(now.getDate() - Math.floor(Math.random() * 60)); // Random date within last 60 days
    createdAt.setHours(Math.floor(Math.random() * 24));
    createdAt.setMinutes(Math.floor(Math.random() * 60));

    const type = types[Math.floor(Math.random() * types.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const gateway = gateways[Math.floor(Math.random() * gateways.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];

    transactions.push({
      id: `TXN${String(i + 1).padStart(6, '0')}`,
      userId: 'user-1',
      type,
      amount: Math.floor(Math.random() * 50000) + 500,
      currency: 'KES',
      description: descriptions[i % descriptions.length],
      category,
      status,
      createdAt,
      referenceId: `REF-${Date.now()}-${i}`,
      gateway,
      recipient: type === 'debit' ? 'Urban Home School' : undefined,
      sender: type === 'credit' ? 'Self' : undefined,
      metadata: {
        gateway,
        paymentMethod: gateway === 'mpesa' ? '+254 7XX XXX XXX' : gateway === 'card' ? '**** **** **** 1234' : undefined
      }
    });
  }

  return transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm-1',
    type: 'mpesa',
    name: 'M-Pesa',
    details: '+254 712 345 678',
    isDefault: true,
    lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'pm-2',
    type: 'card',
    name: 'Visa Card',
    details: '**** **** **** 1234',
    isDefault: false,
    lastUsed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    expiryDate: '12/26'
  },
  {
    id: 'pm-3',
    type: 'paypal',
    name: 'PayPal',
    details: 'user@example.com',
    isDefault: false,
    lastUsed: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
  }
];

const WalletPage: React.FC = () => {
  const [transactions, setTransactions] = useState<WalletTransaction[]>(generateMockTransactions());
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [_walletRes, txRes, methodsRes] = await Promise.allSettled([
          getWallet(),
          getTransactionHistory(50, 0),
          fetchPaymentMethods(),
        ]);

        if (txRes.status === 'fulfilled' && txRes.value.transactions.length > 0) {
          const mapped: WalletTransaction[] = txRes.value.transactions.map((t: any) => ({
            id: t.id,
            userId: t.userId || '',
            type: t.type === 'refund' || t.type === 'wallet_topup' ? 'credit' : 'debit',
            amount: t.amount,
            currency: t.currency || 'KES',
            description: t.description || t.type,
            category: t.type as any,
            status: t.status,
            createdAt: new Date(t.createdAt || t.created_at),
            referenceId: t.transactionRef || t.id,
            gateway: t.gateway as any,
          }));
          setTransactions(mapped);
        }

        if (methodsRes.status === 'fulfilled' && methodsRes.value.length > 0) {
          const mapped: PaymentMethod[] = methodsRes.value.map((m: any) => ({
            id: m.id,
            type: m.gateway as any,
            name: m.gateway === 'mpesa' ? 'M-Pesa' : m.gateway === 'paypal' ? 'PayPal' : 'Card',
            details: m.details?.phoneNumber || m.details?.last4 ? `**** ${m.details.last4}` : m.details?.email || '',
            isDefault: m.isDefault,
            lastUsed: m.updatedAt ? new Date(m.updatedAt) : undefined,
          }));
          setPaymentMethods(mapped);
        }
      } catch {
        // API not available - keep mock data
      }
    };
    fetchData();
  }, []);
  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAddPaymentMethodOpen, setIsAddPaymentMethodOpen] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<'mpesa' | 'paypal' | 'card'>('mpesa');
  const [amount, setAmount] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [methodToDelete, setMethodToDelete] = useState<string | null>(null);

  // Calculate wallet statistics
  const walletStats = useMemo(() => {
    const completedTransactions = transactions.filter(t => t.status === 'completed');
    const totalDeposits = completedTransactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalWithdrawals = completedTransactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);
    const availableBalance = totalDeposits - totalWithdrawals;
    const pendingTransactions = transactions.filter(t => t.status === 'pending').length;

    return {
      totalDeposits,
      totalWithdrawals,
      availableBalance,
      pendingTransactions
    };
  }, [transactions]);

  // Filter and search transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesSearch =
        transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.referenceId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        filterType === 'all' ||
        (filterType === 'credit' && transaction.type === 'credit') ||
        (filterType === 'debit' && transaction.type === 'debit');

      return matchesSearch && matchesFilter;
    });
  }, [transactions, searchQuery, filterType]);

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: WalletTransaction[] } = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: []
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    filteredTransactions.forEach(transaction => {
      const txDate = new Date(transaction.createdAt);
      const txDateOnly = new Date(txDate.getFullYear(), txDate.getMonth(), txDate.getDate());

      if (txDateOnly.getTime() === today.getTime()) {
        groups.today.push(transaction);
      } else if (txDateOnly.getTime() === yesterday.getTime()) {
        groups.yesterday.push(transaction);
      } else if (txDate >= weekAgo) {
        groups.thisWeek.push(transaction);
      } else {
        groups.older.push(transaction);
      }
    });

    return groups;
  }, [filteredTransactions]);

  // Gateway icons
  const getGatewayIcon = (gateway: string) => {
    switch (gateway) {
      case 'mpesa':
        return <Smartphone className="w-5 h-5 text-green-500" />;
      case 'paypal':
        return <CreditCard className="w-5 h-5 text-blue-500" />;
      case 'card':
        return <CreditCard className="w-5 h-5 text-purple-500" />;
      case 'bank':
        return <CreditCard className="w-5 h-5 text-orange-500" />;
      default:
        return <Wallet className="w-5 h-5 text-gray-500" />;
    }
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1 text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 text-xs font-medium text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-full">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'failed':
        return (
          <span className="flex items-center gap-1 text-xs font-medium text-red-400 bg-red-500/10 px-2 py-1 rounded-full">
            <XCircle className="w-3 h-3" />
            Failed
          </span>
        );
      case 'refunded':
        return (
          <span className="flex items-center gap-1 text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">
            <AlertCircle className="w-3 h-3" />
            Refunded
          </span>
        );
      default:
        return null;
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-KE', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  // Format time
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-KE', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  // Handle add funds
  const handleAddFunds = () => {
    if (!amount || parseFloat(amount) <= 0) {
      showToastMessage('Please enter a valid amount', 'error');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsAddFundsModalOpen(false);
      setAmount('');
      showToastMessage(`Successfully added ${formatCurrency(parseFloat(amount))} to your wallet`, 'success');
    }, 2000);
  };

  // Handle withdraw
  const handleWithdraw = () => {
    if (!amount || parseFloat(amount) <= 0) {
      showToastMessage('Please enter a valid amount', 'error');
      return;
    }

    if (parseFloat(amount) > walletStats.availableBalance) {
      showToastMessage('Insufficient balance', 'error');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsWithdrawModalOpen(false);
      setAmount('');
      showToastMessage(`Withdrawal of ${formatCurrency(parseFloat(amount))} initiated`, 'success');
    }, 2000);
  };

  // Handle transfer
  const handleTransfer = () => {
    if (!amount || parseFloat(amount) <= 0) {
      showToastMessage('Please enter a valid amount', 'error');
      return;
    }

    if (parseFloat(amount) > walletStats.availableBalance) {
      showToastMessage('Insufficient balance', 'error');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsTransferModalOpen(false);
      setAmount('');
      showToastMessage(`Transfer of ${formatCurrency(parseFloat(amount))} completed`, 'success');
    }, 2000);
  };

  // Show toast message
  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Handle set default payment method
  const handleSetDefault = (methodId: string) => {
    setPaymentMethods(methods =>
      methods.map(method => ({
        ...method,
        isDefault: method.id === methodId
      }))
    );
    showToastMessage('Default payment method updated', 'success');
  };

  // Handle delete payment method
  const handleDeleteMethod = (methodId: string) => {
    const method = paymentMethods.find(m => m.id === methodId);
    if (method?.isDefault) {
      showToastMessage('Cannot delete default payment method', 'error');
      return;
    }
    setPaymentMethods(methods => methods.filter(m => m.id !== methodId));
    setMethodToDelete(null);
    showToastMessage('Payment method removed', 'success');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Wallet Overview Section */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-white/80 text-sm mb-1">Total Balance</p>
              <div className="flex items-center gap-3">
                <h2 className="text-4xl font-bold">
                  {showBalance ? formatCurrency(walletStats.availableBalance) : '••••••'}
                </h2>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-white/60 text-sm mt-2">
                Last updated: {formatDate(new Date())} at {formatTime(new Date())}
              </p>
            </div>
            <Wallet className="w-12 h-12 text-white/40" />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setIsAddFundsModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-4 py-3 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Add Funds</span>
            </button>
            <button
              onClick={() => setIsWithdrawModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-4 py-3 transition-all"
            >
              <ArrowDownLeft className="w-5 h-5" />
              <span className="font-medium">Withdraw</span>
            </button>
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl px-4 py-3 transition-all"
            >
              <ArrowUpRight className="w-5 h-5" />
              <span className="font-medium">Transfer</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#1a1f26] rounded-xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                +12.5%
              </span>
            </div>
            <p className="text-white/60 text-sm mb-1">Total Deposits</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(walletStats.totalDeposits)}</p>
          </div>

          <div className="bg-[#1a1f26] rounded-xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-500/10 rounded-lg">
                <TrendingDown className="w-6 h-6 text-red-400" />
              </div>
              <span className="text-xs font-medium text-red-400 bg-red-500/10 px-2 py-1 rounded-full">
                -8.3%
              </span>
            </div>
            <p className="text-white/60 text-sm mb-1">Total Withdrawals</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(walletStats.totalWithdrawals)}</p>
          </div>

          <div className="bg-[#1a1f26] rounded-xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Wallet className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <p className="text-white/60 text-sm mb-1">Available Balance</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(walletStats.availableBalance)}</p>
          </div>

          <div className="bg-[#1a1f26] rounded-xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
            <p className="text-white/60 text-sm mb-1">Pending Transactions</p>
            <p className="text-2xl font-bold text-white">{walletStats.pendingTransactions}</p>
          </div>
        </div>

        {/* Transaction Timeline */}
        <div className="bg-[#1a1f26] rounded-xl border border-white/5 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-xl font-bold text-white">Transaction History</h3>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 bg-[#181C1F] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as 'all' | 'credit' | 'debit')}
                  className="w-full sm:w-auto bg-[#181C1F] border border-white/10 rounded-lg pl-10 pr-8 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
                >
                  <option value="all">All Transactions</option>
                  <option value="credit">Deposits Only</option>
                  <option value="debit">Withdrawals Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Transaction Groups */}
          <div className="space-y-6">
            {Object.entries(groupedTransactions).map(([period, txs]) => {
              if (txs.length === 0) return null;

              const periodLabels: { [key: string]: string } = {
                today: 'Today',
                yesterday: 'Yesterday',
                thisWeek: 'This Week',
                older: 'Older'
              };

              return (
                <div key={period}>
                  <h4 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {periodLabels[period]}
                  </h4>
                  <div className="space-y-2">
                    {txs.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="bg-[#181C1F] rounded-lg p-4 border border-white/5 hover:border-white/10 transition-all group"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            {/* Gateway Icon */}
                            <div className="p-2 bg-white/5 rounded-lg shrink-0">
                              {transaction.gateway ? getGatewayIcon(transaction.gateway) : <Wallet className="w-5 h-5 text-gray-500" />}
                            </div>

                            {/* Transaction Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <p className="font-medium text-white truncate">{transaction.description}</p>
                                <p className={`font-bold text-lg shrink-0 ${transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                                  {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                </p>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
                                <span>{transaction.id}</span>
                                <span>•</span>
                                <span>{formatDate(transaction.createdAt)} at {formatTime(transaction.createdAt)}</span>
                                {transaction.metadata?.paymentMethod && (
                                  <>
                                    <span>•</span>
                                    <span>{transaction.metadata.paymentMethod}</span>
                                  </>
                                )}
                              </div>

                              <div className="flex items-center gap-2 mt-2">
                                {getStatusBadge(transaction.status)}
                                <span className="text-xs text-white/40">
                                  Ref: {transaction.referenceId}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <button className="p-2 hover:bg-white/5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 shrink-0">
                            <Download className="w-4 h-4 text-white/60" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Empty State */}
            {filteredTransactions.length === 0 && (
              <div className="text-center py-12">
                <div className="inline-flex p-4 bg-white/5 rounded-full mb-4">
                  <Wallet className="w-8 h-8 text-white/40" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No transactions found</h3>
                <p className="text-white/60 text-sm">
                  {searchQuery ? 'Try adjusting your search or filters' : 'Your transaction history will appear here'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods Section */}
        <div className="bg-[#1a1f26] rounded-xl border border-white/5 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Payment Methods</h3>
            <button
              onClick={() => setIsAddPaymentMethodOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Add Method</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="bg-[#181C1F] rounded-lg p-4 border border-white/5 hover:border-white/10 transition-all group relative"
              >
                {method.isDefault && (
                  <div className="absolute top-3 right-3">
                    <span className="flex items-center gap-1 text-xs font-medium text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-full">
                      <Star className="w-3 h-3 fill-current" />
                      Default
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-3 mb-4">
                  <div className="p-3 bg-white/5 rounded-lg">
                    {getGatewayIcon(method.type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white mb-1">{method.name}</p>
                    <p className="text-sm text-white/60">{method.details}</p>
                    {method.expiryDate && (
                      <p className="text-xs text-white/40 mt-1">Expires: {method.expiryDate}</p>
                    )}
                  </div>
                </div>

                {method.lastUsed && (
                  <p className="text-xs text-white/40 mb-3">
                    Last used: {formatDate(method.lastUsed)}
                  </p>
                )}

                <div className="flex items-center gap-2">
                  {!method.isDefault && (
                    <button
                      onClick={() => handleSetDefault(method.id)}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white text-sm py-2 rounded-lg transition-colors"
                    >
                      Set as Default
                    </button>
                  )}
                  <button
                    onClick={() => setMethodToDelete(method.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Empty State */}
            {paymentMethods.length === 0 && (
              <div className="col-span-full text-center py-12">
                <div className="inline-flex p-4 bg-white/5 rounded-full mb-4">
                  <CreditCard className="w-8 h-8 text-white/40" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No payment methods</h3>
                <p className="text-white/60 text-sm">Add a payment method to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Add Funds Modal */}
        {isAddFundsModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1f26] rounded-2xl max-w-md w-full border border-white/10">
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h3 className="text-xl font-bold text-white">Add Funds</h3>
                <button
                  onClick={() => setIsAddFundsModalOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Gateway Selection */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-3">
                    Select Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setSelectedGateway('mpesa')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedGateway === 'mpesa'
                          ? 'border-green-500 bg-green-500/10'
                          : 'border-white/10 bg-[#181C1F] hover:border-white/20'
                      }`}
                    >
                      <Smartphone className="w-6 h-6 text-green-500 mx-auto mb-2" />
                      <p className="text-xs font-medium text-white">M-Pesa</p>
                    </button>
                    <button
                      onClick={() => setSelectedGateway('card')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedGateway === 'card'
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-white/10 bg-[#181C1F] hover:border-white/20'
                      }`}
                    >
                      <CreditCard className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                      <p className="text-xs font-medium text-white">Card</p>
                    </button>
                    <button
                      onClick={() => setSelectedGateway('paypal')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedGateway === 'paypal'
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-white/10 bg-[#181C1F] hover:border-white/20'
                      }`}
                    >
                      <CreditCard className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                      <p className="text-xs font-medium text-white">PayPal</p>
                    </button>
                  </div>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Amount (KES)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full bg-[#181C1F] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Quick Amount Buttons */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Quick Select
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1000, 2000, 5000, 10000].map((quickAmount) => (
                      <button
                        key={quickAmount}
                        onClick={() => setAmount(quickAmount.toString())}
                        className="bg-[#181C1F] hover:bg-white/5 border border-white/10 rounded-lg py-2 text-sm text-white transition-colors"
                      >
                        {quickAmount}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsAddFundsModalOpen(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddFunds}
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Add Funds'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Withdraw Modal */}
        {isWithdrawModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1f26] rounded-2xl max-w-md w-full border border-white/10">
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h3 className="text-xl font-bold text-white">Withdraw Funds</h3>
                <button
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <p className="text-sm text-blue-300">
                    Available Balance: <span className="font-bold">{formatCurrency(walletStats.availableBalance)}</span>
                  </p>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Amount (KES)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full bg-[#181C1F] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Gateway Selection */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-3">
                    Withdrawal Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSelectedGateway('mpesa')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedGateway === 'mpesa'
                          ? 'border-green-500 bg-green-500/10'
                          : 'border-white/10 bg-[#181C1F] hover:border-white/20'
                      }`}
                    >
                      <Smartphone className="w-6 h-6 text-green-500 mx-auto mb-2" />
                      <p className="text-xs font-medium text-white">M-Pesa</p>
                    </button>
                    <button
                      onClick={() => setSelectedGateway('card')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedGateway === 'card'
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-white/10 bg-[#181C1F] hover:border-white/20'
                      }`}
                    >
                      <CreditCard className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                      <p className="text-xs font-medium text-white">Bank</p>
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsWithdrawModalOpen(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleWithdraw}
                    disabled={isLoading}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Withdraw'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transfer Modal */}
        {isTransferModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1f26] rounded-2xl max-w-md w-full border border-white/10">
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h3 className="text-xl font-bold text-white">Transfer Funds</h3>
                <button
                  onClick={() => setIsTransferModalOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <p className="text-sm text-blue-300">
                    Available Balance: <span className="font-bold">{formatCurrency(walletStats.availableBalance)}</span>
                  </p>
                </div>

                {/* Recipient Input */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Recipient Email or Phone
                  </label>
                  <input
                    type="text"
                    placeholder="email@example.com or +254 7XX XXX XXX"
                    className="w-full bg-[#181C1F] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Amount (KES)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full bg-[#181C1F] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Note Input */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Note (Optional)
                  </label>
                  <textarea
                    placeholder="Add a note..."
                    rows={3}
                    className="w-full bg-[#181C1F] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsTransferModalOpen(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTransfer}
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Transfer'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Payment Method Modal */}
        {isAddPaymentMethodOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1f26] rounded-2xl max-w-md w-full border border-white/10">
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h3 className="text-xl font-bold text-white">Add Payment Method</h3>
                <button
                  onClick={() => setIsAddPaymentMethodOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Method Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-3">
                    Payment Method Type
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setSelectedGateway('mpesa')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedGateway === 'mpesa'
                          ? 'border-green-500 bg-green-500/10'
                          : 'border-white/10 bg-[#181C1F] hover:border-white/20'
                      }`}
                    >
                      <Smartphone className="w-6 h-6 text-green-500 mx-auto mb-2" />
                      <p className="text-xs font-medium text-white">M-Pesa</p>
                    </button>
                    <button
                      onClick={() => setSelectedGateway('card')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedGateway === 'card'
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-white/10 bg-[#181C1F] hover:border-white/20'
                      }`}
                    >
                      <CreditCard className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                      <p className="text-xs font-medium text-white">Card</p>
                    </button>
                    <button
                      onClick={() => setSelectedGateway('paypal')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedGateway === 'paypal'
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-white/10 bg-[#181C1F] hover:border-white/20'
                      }`}
                    >
                      <CreditCard className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                      <p className="text-xs font-medium text-white">PayPal</p>
                    </button>
                  </div>
                </div>

                {/* Dynamic Form Based on Selected Method */}
                {selectedGateway === 'mpesa' && (
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      M-Pesa Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+254 7XX XXX XXX"
                      className="w-full bg-[#181C1F] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-green-500 transition-colors"
                    />
                  </div>
                )}

                {selectedGateway === 'card' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="w-full bg-[#181C1F] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full bg-[#181C1F] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          className="w-full bg-[#181C1F] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
                        />
                      </div>
                    </div>
                  </>
                )}

                {selectedGateway === 'paypal' && (
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      PayPal Email
                    </label>
                    <input
                      type="email"
                      placeholder="user@example.com"
                      className="w-full bg-[#181C1F] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                )}

                {/* Set as Default */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="setDefault"
                    className="w-4 h-4 rounded border-white/10 bg-[#181C1F] text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="setDefault" className="text-sm text-white/80">
                    Set as default payment method
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsAddPaymentMethodOpen(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setIsAddPaymentMethodOpen(false);
                      showToastMessage('Payment method added successfully', 'success');
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors"
                  >
                    Add Method
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {methodToDelete && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1f26] rounded-2xl max-w-md w-full border border-white/10">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 bg-red-500/10 rounded-full mx-auto mb-4">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white text-center mb-2">Delete Payment Method</h3>
                <p className="text-white/60 text-center mb-6">
                  Are you sure you want to remove this payment method? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setMethodToDelete(null)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteMethod(methodToDelete)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
              toastType === 'success'
                ? 'bg-green-500/90 text-white'
                : 'bg-red-500/90 text-white'
            }`}>
              {toastType === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              <p className="font-medium">{toastMessage}</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default WalletPage;
