import React, { useState, useEffect } from 'react';
import { RefreshCw, Plus, Cpu, AlertCircle, CheckCircle } from 'lucide-react';
import adminProviderService, {
  AIProvider,
  AIProviderCreate,
  AIProviderUpdate,
  RecommendedProvider
} from '../../services/adminProviderService';
import AIProviderList from '../../components/admin/AIProviderList';
import AIProviderForm from '../../components/admin/AIProviderForm';
import RecommendedProviders from '../../components/admin/RecommendedProviders';

type TabType = 'active' | 'all' | 'recommended';

const AIProvidersPage: React.FC = () => {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [recommendedProviders, setRecommendedProviders] = useState<RecommendedProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [showForm, setShowForm] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Load providers on mount
  useEffect(() => {
    loadProviders();
  }, []);

  // Load recommended providers when tab is selected
  useEffect(() => {
    if (activeTab === 'recommended' && recommendedProviders.length === 0) {
      loadRecommendedProviders();
    }
  }, [activeTab]);

  /**
   * Load all providers from API
   */
  const loadProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminProviderService.listProviders(false);
      setProviders(response.providers);
    } catch (err) {
      setError('Failed to load AI providers. Please try again.');
      console.error('Error loading providers:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load recommended providers from API
   */
  const loadRecommendedProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      const recommended = await adminProviderService.getRecommended();
      setRecommendedProviders(recommended);
    } catch (err) {
      setError('Failed to load recommended providers. Please try again.');
      console.error('Error loading recommended providers:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh provider list
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProviders();
    if (activeTab === 'recommended') {
      await loadRecommendedProviders();
    }
    setRefreshing(false);
    showToast('Provider list refreshed successfully', 'success');
  };

  /**
   * Handle create new provider
   */
  const handleCreate = async (data: AIProviderCreate) => {
    try {
      const newProvider = await adminProviderService.createProvider(data);
      setProviders([newProvider, ...providers]);
      setShowForm(false);
      showToast('AI provider created successfully', 'success');
    } catch (err) {
      showToast('Failed to create AI provider', 'error');
      console.error('Error creating provider:', err);
      throw err;
    }
  };

  /**
   * Handle update existing provider
   */
  const handleUpdate = async (id: string, data: AIProviderUpdate) => {
    try {
      const updatedProvider = await adminProviderService.updateProvider(id, data);
      setProviders(providers.map(p => p.id === id ? updatedProvider : p));
      setShowForm(false);
      setSelectedProvider(null);
      showToast('AI provider updated successfully', 'success');
    } catch (err) {
      showToast('Failed to update AI provider', 'error');
      console.error('Error updating provider:', err);
      throw err;
    }
  };

  /**
   * Handle deactivate provider
   */
  const handleDeactivate = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this provider?')) {
      return;
    }

    try {
      await adminProviderService.deactivateProvider(id);
      setProviders(providers.map(p => p.id === id ? { ...p, is_active: false } : p));
      showToast('AI provider deactivated successfully', 'success');
    } catch (err) {
      showToast('Failed to deactivate AI provider', 'error');
      console.error('Error deactivating provider:', err);
    }
  };

  /**
   * Handle edit provider click
   */
  const handleEdit = (provider: AIProvider) => {
    setSelectedProvider(provider);
    setShowForm(true);
  };

  /**
   * Show toast notification
   */
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  /**
   * Get filtered providers based on active tab
   */
  const filteredProviders = activeTab === 'active'
    ? providers.filter(p => p.is_active)
    : providers;

  /**
   * Render tab button
   */
  const TabButton: React.FC<{ type: TabType; label: string; count?: number }> = ({ type, label, count }) => (
    <button
      onClick={() => setActiveTab(type)}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        activeTab === type
          ? 'bg-blue-500 text-gray-900 dark:text-white'
          : 'bg-gray-100 dark:bg-[#22272B] text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-[#2A3035]'
      }`}
    >
      {label}
      {count !== undefined && (
        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
          activeTab === type ? 'bg-gray-200 dark:bg-white/20' : 'bg-[#2A3035]'
        }`}>
          {count}
        </span>
      )}
    </button>
  );

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              AI Provider Management
            </h1>
            <p className="text-gray-500 dark:text-white/60 text-sm sm:text-base">
              Manage AI providers for the platform's multi-AI orchestration system
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#22272B] hover:bg-[#2A3035] text-gray-900 dark:text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => {
                setSelectedProvider(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-gray-900 dark:text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Provider</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 dark:text-white/60 text-sm">Total Providers</span>
              <Cpu className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{providers.length}</p>
          </div>

          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 dark:text-white/60 text-sm">Active Providers</span>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-green-400">
              {providers.filter(p => p.is_active).length}
            </p>
          </div>

          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 dark:text-white/60 text-sm">Inactive Providers</span>
              <AlertCircle className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-orange-400">
              {providers.filter(p => !p.is_active).length}
            </p>
          </div>

          <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 dark:text-white/60 text-sm">Recommended</span>
              <CheckCircle className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-purple-400">
              {providers.filter(p => p.is_recommended).length}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <TabButton
            type="active"
            label="Active Providers"
            count={providers.filter(p => p.is_active).length}
          />
          <TabButton
            type="all"
            label="All Providers"
            count={providers.length}
          />
          <TabButton
            type="recommended"
            label="Recommended Templates"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="bg-white dark:bg-[#181C1F] border border-gray-200 dark:border-[#22272B] rounded-xl p-6">
          {loading ? (
            // Loading State
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-gray-100 dark:bg-[#22272B] rounded-lg" />
                </div>
              ))}
            </div>
          ) : activeTab === 'recommended' ? (
            // Recommended Providers Tab
            <RecommendedProviders
              onSelectTemplate={(template) => {
                setSelectedProvider({
                  name: template.name,
                  provider_type: template.provider_type as 'text' | 'voice' | 'video' | 'multimodal',
                  specialization: template.specialization,
                  id: '',
                  api_endpoint: template.api_endpoint || '',
                  is_active: true,
                  is_recommended: template.is_recommended || false,
                  configuration: template.configuration || {},
                  created_at: '',
                  updated_at: '',
                } as AIProvider);
                setShowForm(true);
              }}
            />
          ) : (
            // Provider List Tab
            <AIProviderList
              providers={filteredProviders}
              onEdit={handleEdit}
              onDelete={handleDeactivate}
              onToggleActive={(id, isActive) => {
                if (!isActive) {
                  handleDeactivate(id);
                }
              }}
            />
          )}

          {/* Empty State */}
          {!loading && filteredProviders.length === 0 && activeTab !== 'recommended' && (
            <div className="text-center py-12">
              <Cpu className="w-16 h-16 text-gray-400 dark:text-gray-300 dark:text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No {activeTab === 'active' ? 'Active ' : ''}Providers Found
              </h3>
              <p className="text-gray-500 dark:text-white/60 mb-6">
                {activeTab === 'active'
                  ? 'There are currently no active AI providers.'
                  : 'Get started by adding your first AI provider.'}
              </p>
              <button
                onClick={() => {
                  setSelectedProvider(null);
                  setShowForm(true);
                }}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-gray-900 dark:text-white rounded-lg transition-colors"
              >
                Add First Provider
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Provider Form Modal */}
      {showForm && (
        <AIProviderForm
          isOpen={showForm}
          provider={selectedProvider}
          mode={selectedProvider?.id ? 'edit' : 'create'}
          onSubmit={async (data) => {
            if (selectedProvider?.id) {
              await handleUpdate(selectedProvider.id, data as AIProviderUpdate);
            } else {
              await handleCreate(data as AIProviderCreate);
            }
          }}
          onClose={() => {
            setShowForm(false);
            setSelectedProvider(null);
          }}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-in-bottom">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg ${
            toast.type === 'success'
              ? 'bg-green-500 text-gray-900 dark:text-white'
              : 'bg-red-500 text-gray-900 dark:text-white'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <p className="font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default AIProvidersPage;
