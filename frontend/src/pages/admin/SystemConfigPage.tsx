import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  RefreshCw,
  Search,
  Save,
  Edit3,
  RotateCcw,
  Shield,
  Bell,
  CreditCard,
  Bot,
  Globe,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import AdminPageHeader from '../../components/admin/shared/AdminPageHeader';
import AdminStatsCard from '../../components/admin/shared/AdminStatsCard';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type ConfigCategory = 'all' | 'general' | 'ai' | 'security' | 'notifications' | 'payments';

interface ConfigEntry {
  id: string;
  key: string;
  value: string;
  category: 'general' | 'ai' | 'security' | 'notifications' | 'payments';
  description: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  options?: string[];
  is_sensitive: boolean;
  modified: boolean;
}

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

const MOCK_CONFIGS: ConfigEntry[] = [
  { id: 'CFG-001', key: 'app.name', value: 'Urban Home School', category: 'general', description: 'Application display name', type: 'string', is_sensitive: false, modified: false },
  { id: 'CFG-002', key: 'app.maintenance_mode', value: 'false', category: 'general', description: 'Enable maintenance mode', type: 'boolean', is_sensitive: false, modified: false },
  { id: 'CFG-003', key: 'app.max_upload_size_mb', value: '50', category: 'general', description: 'Maximum file upload size in MB', type: 'number', is_sensitive: false, modified: false },
  { id: 'CFG-004', key: 'app.default_language', value: 'en', category: 'general', description: 'Default platform language', type: 'select', options: ['en', 'sw', 'fr'], is_sensitive: false, modified: false },
  { id: 'CFG-005', key: 'ai.default_provider', value: 'gemini', category: 'ai', description: 'Default AI provider for tutoring', type: 'select', options: ['gemini', 'claude', 'openai', 'grok'], is_sensitive: false, modified: false },
  { id: 'CFG-006', key: 'ai.max_tokens_per_request', value: '4096', category: 'ai', description: 'Maximum tokens per AI request', type: 'number', is_sensitive: false, modified: false },
  { id: 'CFG-007', key: 'ai.content_filter_level', value: 'strict', category: 'ai', description: 'AI content safety filter level', type: 'select', options: ['relaxed', 'moderate', 'strict'], is_sensitive: false, modified: true },
  { id: 'CFG-008', key: 'ai.monthly_budget_kes', value: '500000', category: 'ai', description: 'Monthly AI spending budget (KES)', type: 'number', is_sensitive: false, modified: false },
  { id: 'CFG-009', key: 'security.session_timeout_minutes', value: '30', category: 'security', description: 'User session timeout in minutes', type: 'number', is_sensitive: false, modified: false },
  { id: 'CFG-010', key: 'security.max_login_attempts', value: '5', category: 'security', description: 'Max failed login attempts before lockout', type: 'number', is_sensitive: false, modified: false },
  { id: 'CFG-011', key: 'security.password_min_length', value: '8', category: 'security', description: 'Minimum password length', type: 'number', is_sensitive: false, modified: true },
  { id: 'CFG-012', key: 'security.two_factor_required', value: 'false', category: 'security', description: 'Require 2FA for admin accounts', type: 'boolean', is_sensitive: false, modified: false },
  { id: 'CFG-013', key: 'notifications.email_enabled', value: 'true', category: 'notifications', description: 'Enable email notifications', type: 'boolean', is_sensitive: false, modified: false },
  { id: 'CFG-014', key: 'notifications.sms_enabled', value: 'true', category: 'notifications', description: 'Enable SMS notifications', type: 'boolean', is_sensitive: false, modified: false },
  { id: 'CFG-015', key: 'notifications.push_enabled', value: 'false', category: 'notifications', description: 'Enable push notifications', type: 'boolean', is_sensitive: false, modified: true },
  { id: 'CFG-016', key: 'payments.mpesa_paybill', value: '******', category: 'payments', description: 'M-Pesa Paybill number', type: 'string', is_sensitive: true, modified: false },
  { id: 'CFG-017', key: 'payments.currency', value: 'KES', category: 'payments', description: 'Default currency', type: 'select', options: ['KES', 'USD', 'EUR'], is_sensitive: false, modified: false },
  { id: 'CFG-018', key: 'payments.tax_rate_percent', value: '16', category: 'payments', description: 'VAT / tax rate percentage', type: 'number', is_sensitive: false, modified: false },
];

/* ------------------------------------------------------------------ */
/* Category icons                                                      */
/* ------------------------------------------------------------------ */

const categoryIcons: Record<string, React.ReactNode> = {
  general: <Globe className="w-4 h-4" />,
  ai: <Bot className="w-4 h-4" />,
  security: <Shield className="w-4 h-4" />,
  notifications: <Bell className="w-4 h-4" />,
  payments: <CreditCard className="w-4 h-4" />,
};

const categoryColors: Record<string, string> = {
  general: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  ai: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  security: 'bg-red-500/20 text-red-400 border-red-500/30',
  notifications: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  payments: 'bg-green-500/20 text-green-400 border-green-500/30',
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const SystemConfigPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<ConfigCategory>('all');
  const [configs, setConfigs] = useState(MOCK_CONFIGS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const handleEdit = (config: ConfigEntry) => {
    setEditingId(config.id);
    setEditValue(config.value);
  };

  const handleSave = (id: string) => {
    setConfigs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, value: editValue, modified: true } : c))
    );
    setEditingId(null);
    showToast('Configuration updated (pending save)', 'success');
  };

  const handleSaveAll = () => {
    showToast('All changes saved successfully', 'success');
    setConfigs((prev) => prev.map((c) => ({ ...c, modified: false })));
  };

  const handleRevert = () => {
    setConfigs(MOCK_CONFIGS);
    showToast('All changes reverted', 'success');
  };

  const filteredConfigs = configs.filter(
    (c) =>
      (activeCategory === 'all' || c.category === activeCategory) &&
      (!search || c.key.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase()))
  );

  const pendingChanges = configs.filter((c) => c.modified).length;

  const categories: { key: ConfigCategory; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'general', label: 'General' },
    { key: 'ai', label: 'AI' },
    { key: 'security', label: 'Security' },
    { key: 'notifications', label: 'Notifications' },
    { key: 'payments', label: 'Payments' },
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
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
        title="System Configuration"
        subtitle="Manage platform settings and configuration values"
        breadcrumbs={[
          { label: 'Operations', path: '/dashboard/admin' },
          { label: 'System Config' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {pendingChanges > 0 && (
              <>
                <button
                  onClick={handleRevert}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-[#22272B] border border-[#333] rounded-lg text-white/70 hover:text-white hover:border-[#444] transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Revert
                </button>
                <button
                  onClick={handleSaveAll}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-[#E40000] rounded-lg text-white hover:bg-[#C00] transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save All ({pendingChanges})
                </button>
              </>
            )}
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
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AdminStatsCard
          title="Total Configs"
          value={configs.length}
          icon={<Settings className="w-5 h-5" />}
          subtitle={`${categories.length - 1} categories`}
        />
        <AdminStatsCard
          title="Pending Changes"
          value={pendingChanges}
          icon={<Edit3 className="w-5 h-5" />}
          trend={pendingChanges > 0
            ? { value: pendingChanges, label: 'unsaved changes', direction: 'up' }
            : { value: 0, label: 'all saved', direction: 'neutral' }
          }
        />
      </motion.div>

      {/* Category Filter */}
      <motion.div variants={itemVariants} className="flex gap-1 bg-[#181C1F] border border-[#22272B] rounded-lg p-1 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeCategory === cat.key
                ? 'bg-[#E40000] text-white'
                : 'text-white/50 hover:text-white hover:bg-[#22272B]'
            }`}
          >
            {cat.key !== 'all' && categoryIcons[cat.key]}
            {cat.label}
          </button>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          type="text"
          placeholder="Search by key or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#181C1F] border border-[#22272B] rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#E40000]/50 transition-colors"
        />
      </motion.div>

      {/* Pending Changes Banner */}
      {pendingChanges > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 py-3 bg-[#E40000]/10 border border-[#E40000]/20 rounded-lg"
        >
          <AlertCircle className="w-4 h-4 text-[#E40000] flex-shrink-0" />
          <span className="text-sm text-white">
            <strong>{pendingChanges}</strong> unsaved change{pendingChanges !== 1 ? 's' : ''}. Click "Save All" to apply.
          </span>
        </motion.div>
      )}

      {/* Config Table */}
      <motion.div variants={itemVariants} className="bg-[#181C1F] border border-[#22272B] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#22272B] text-left">
                <th className="px-4 py-3 text-white/60 font-medium">Key</th>
                <th className="px-4 py-3 text-white/60 font-medium">Value</th>
                <th className="px-4 py-3 text-white/60 font-medium">Category</th>
                <th className="px-4 py-3 text-white/60 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredConfigs.map((config) => (
                <tr
                  key={config.id}
                  className={`border-b border-[#22272B]/50 hover:bg-[#1E2327] transition-colors ${
                    config.modified ? 'bg-[#E40000]/5' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <div>
                      <span className="text-white font-mono text-xs">{config.key}</span>
                      <span className="block text-xs text-white/40 mt-0.5">{config.description}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {editingId === config.id ? (
                      <div className="flex items-center gap-2">
                        {config.type === 'select' ? (
                          <select
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="px-3 py-1.5 bg-[#0F1112] border border-[#E40000]/50 rounded-lg text-white text-sm focus:outline-none"
                          >
                            {config.options?.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : config.type === 'boolean' ? (
                          <select
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="px-3 py-1.5 bg-[#0F1112] border border-[#E40000]/50 rounded-lg text-white text-sm focus:outline-none"
                          >
                            <option value="true">true</option>
                            <option value="false">false</option>
                          </select>
                        ) : (
                          <input
                            type={config.type === 'number' ? 'number' : 'text'}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="px-3 py-1.5 bg-[#0F1112] border border-[#E40000]/50 rounded-lg text-white text-sm focus:outline-none w-40"
                          />
                        )}
                        <button
                          onClick={() => handleSave(config.id)}
                          className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className={`font-mono text-sm ${config.modified ? 'text-[#E40000]' : 'text-white/80'}`}>
                        {config.is_sensitive ? '******' : config.value}
                        {config.modified && <span className="text-[#E40000] ml-1">*</span>}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${
                      categoryColors[config.category] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                    }`}>
                      {categoryIcons[config.category]}
                      {config.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end">
                      {editingId !== config.id && (
                        <button
                          onClick={() => handleEdit(config)}
                          title="Edit"
                          className="p-1.5 rounded-lg hover:bg-[#22272B] text-white/50 hover:text-white transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-in-bottom">
          <div
            className={`flex items-center gap-3 px-5 py-3 rounded-lg shadow-xl ${
              toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SystemConfigPage;
