import React, { useState, useEffect } from 'react';
import { AIProvider, AIProviderCreate, AIProviderUpdate } from '@/services/adminProviderService';

interface AIProviderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AIProviderCreate | AIProviderUpdate) => Promise<void>;
  provider?: AIProvider | null;
  mode: 'create' | 'edit';
}

interface FormData {
  name: string;
  provider_type: 'text' | 'voice' | 'video' | 'multimodal' | '';
  api_endpoint: string;
  api_key: string;
  specialization: 'reasoning' | 'creative' | 'research' | 'general' | '';
  cost_per_request: string;
  is_recommended: boolean;
  configuration: string;
}

interface FormErrors {
  name?: string;
  provider_type?: string;
  api_endpoint?: string;
  api_key?: string;
  specialization?: string;
  cost_per_request?: string;
  configuration?: string;
}

export default function AIProviderForm({
  isOpen,
  onClose,
  onSubmit,
  provider,
  mode
}: AIProviderFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    provider_type: '',
    api_endpoint: '',
    api_key: '',
    specialization: '',
    cost_per_request: '',
    is_recommended: false,
    configuration: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Pre-fill form when editing
  useEffect(() => {
    if (mode === 'edit' && provider) {
      setFormData({
        name: provider.name || '',
        provider_type: provider.provider_type || '',
        api_endpoint: provider.api_endpoint || '',
        api_key: '', // Don't pre-fill API key for security
        specialization: provider.specialization || '',
        cost_per_request: provider.cost_per_request?.toString() || '',
        is_recommended: provider.is_recommended || false,
        configuration: provider.configuration ? JSON.stringify(provider.configuration, null, 2) : '',
      });
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        provider_type: '',
        api_endpoint: '',
        api_key: '',
        specialization: '',
        cost_per_request: '',
        is_recommended: false,
        configuration: '',
      });
    }
    setErrors({});
    setShowSuccess(false);
  }, [mode, provider, isOpen]);

  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        name: '',
        provider_type: '',
        api_endpoint: '',
        api_key: '',
        specialization: '',
        cost_per_request: '',
        is_recommended: false,
        configuration: '',
      });
      setErrors({});
      setShowSuccess(false);
      onClose();
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Provider type validation
    if (!formData.provider_type) {
      newErrors.provider_type = 'Provider type is required';
    }

    // API endpoint validation
    if (!formData.api_endpoint.trim()) {
      newErrors.api_endpoint = 'API endpoint is required';
    } else {
      // URL format validation
      try {
        new URL(formData.api_endpoint);
      } catch {
        newErrors.api_endpoint = 'Please enter a valid URL';
      }
    }

    // API key validation (required only for create mode)
    if (mode === 'create' && !formData.api_key.trim()) {
      newErrors.api_key = 'API key is required';
    }

    // Cost per request validation
    if (formData.cost_per_request && parseFloat(formData.cost_per_request) < 0) {
      newErrors.cost_per_request = 'Cost must be 0 or greater';
    }

    // Configuration JSON validation
    if (formData.configuration.trim()) {
      try {
        JSON.parse(formData.configuration);
      } catch {
        newErrors.configuration = 'Invalid JSON format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData: any = {
        name: formData.name.trim(),
        provider_type: formData.provider_type,
        api_endpoint: formData.api_endpoint.trim(),
        specialization: formData.specialization || undefined,
        cost_per_request: formData.cost_per_request ? parseFloat(formData.cost_per_request) : undefined,
        is_recommended: formData.is_recommended,
        configuration: formData.configuration.trim() ? JSON.parse(formData.configuration) : undefined,
      };

      // Only include API key if provided
      if (formData.api_key.trim()) {
        submitData.api_key = formData.api_key.trim();
      }

      await onSubmit(submitData);

      setShowSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      console.error('Form submission error:', error);
      // Error handling is done by parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={handleClose}
          aria-hidden="true"
        />

        {/* Center modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        {/* Modal panel */}
        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              {mode === 'create' ? 'Add AI Provider' : 'Edit AI Provider'}
            </h3>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Success message */}
          {showSuccess && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium text-green-800">
                  Provider {mode === 'create' ? 'created' : 'updated'} successfully!
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Two-column layout on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-copilot-blue focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Gemini Pro"
                  disabled={isSubmitting}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              {/* Provider Type */}
              <div>
                <label htmlFor="provider_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Provider Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="provider_type"
                  name="provider_type"
                  value={formData.provider_type}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-copilot-blue focus:border-transparent ${
                    errors.provider_type ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                >
                  <option value="">Select type...</option>
                  <option value="text">Text</option>
                  <option value="voice">Voice</option>
                  <option value="video">Video</option>
                  <option value="multimodal">Multimodal</option>
                </select>
                {errors.provider_type && <p className="mt-1 text-sm text-red-600">{errors.provider_type}</p>}
              </div>

              {/* Specialization */}
              <div>
                <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization
                </label>
                <select
                  id="specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-copilot-blue focus:border-transparent"
                  disabled={isSubmitting}
                >
                  <option value="">Select specialization...</option>
                  <option value="reasoning">Reasoning</option>
                  <option value="creative">Creative</option>
                  <option value="research">Research</option>
                  <option value="general">General</option>
                </select>
              </div>

              {/* API Endpoint */}
              <div className="md:col-span-2">
                <label htmlFor="api_endpoint" className="block text-sm font-medium text-gray-700 mb-1">
                  API Endpoint <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="api_endpoint"
                  name="api_endpoint"
                  value={formData.api_endpoint}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-copilot-blue focus:border-transparent ${
                    errors.api_endpoint ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://api.example.com/v1"
                  disabled={isSubmitting}
                />
                {errors.api_endpoint && <p className="mt-1 text-sm text-red-600">{errors.api_endpoint}</p>}
              </div>

              {/* API Key */}
              <div className="md:col-span-2">
                <label htmlFor="api_key" className="block text-sm font-medium text-gray-700 mb-1">
                  API Key {mode === 'create' && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  id="api_key"
                  name="api_key"
                  value={formData.api_key}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-copilot-blue focus:border-transparent ${
                    errors.api_key ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={mode === 'edit' ? 'Leave blank to keep current key' : 'Enter API key'}
                  disabled={isSubmitting}
                />
                {errors.api_key && <p className="mt-1 text-sm text-red-600">{errors.api_key}</p>}
                {mode === 'edit' && (
                  <p className="mt-1 text-xs text-gray-500">Leave blank to keep the existing API key</p>
                )}
              </div>

              {/* Cost per Request */}
              <div>
                <label htmlFor="cost_per_request" className="block text-sm font-medium text-gray-700 mb-1">
                  Cost per Request ($)
                </label>
                <input
                  type="number"
                  id="cost_per_request"
                  name="cost_per_request"
                  value={formData.cost_per_request}
                  onChange={handleChange}
                  min="0"
                  step="0.000001"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-copilot-blue focus:border-transparent ${
                    errors.cost_per_request ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.001"
                  disabled={isSubmitting}
                />
                {errors.cost_per_request && <p className="mt-1 text-sm text-red-600">{errors.cost_per_request}</p>}
              </div>

              {/* Is Recommended */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_recommended"
                  name="is_recommended"
                  checked={formData.is_recommended}
                  onChange={handleChange}
                  className="w-4 h-4 text-copilot-blue border-gray-300 rounded focus:ring-copilot-blue"
                  disabled={isSubmitting}
                />
                <label htmlFor="is_recommended" className="ml-2 block text-sm font-medium text-gray-700">
                  Recommended Provider
                </label>
              </div>

              {/* Configuration (JSON) */}
              <div className="md:col-span-2">
                <label htmlFor="configuration" className="block text-sm font-medium text-gray-700 mb-1">
                  Configuration (JSON)
                </label>
                <textarea
                  id="configuration"
                  name="configuration"
                  value={formData.configuration}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-copilot-blue focus:border-transparent font-mono text-sm ${
                    errors.configuration ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder='{"temperature": 0.7, "max_tokens": 2048}'
                  disabled={isSubmitting}
                />
                {errors.configuration && <p className="mt-1 text-sm text-red-600">{errors.configuration}</p>}
                <p className="mt-1 text-xs text-gray-500">Optional provider-specific configuration in JSON format</p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-copilot-blue disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white bg-copilot-blue rounded-lg hover:bg-copilot-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-copilot-blue disabled:opacity-50 flex items-center"
              >
                {isSubmitting && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-900 dark:text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Provider' : 'Update Provider'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
