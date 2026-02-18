import { useState, useEffect } from 'react';
import { Sparkles, MessageSquare, Mic, Video, Brain, Zap, TrendingUp } from 'lucide-react';
import adminProviderService, { RecommendedProvider } from '@/services/adminProviderService';

interface RecommendedProvidersProps {
  onSelectTemplate: (template: RecommendedProviderInfo) => void;
  loading?: boolean;
}

// Extended interface with additional template information
export interface RecommendedProviderInfo extends RecommendedProvider {
  api_endpoint: string;
  cost_per_request: number;
  is_recommended: boolean;
  configuration: Record<string, any>;
}

// Default recommended providers with complete information
const DEFAULT_TEMPLATES: RecommendedProviderInfo[] = [
  {
    name: 'Gemini Pro',
    provider_type: 'multimodal',
    api_endpoint: 'https://generativelanguage.googleapis.com/v1/models/gemini-pro',
    specialization: 'general',
    description: 'Google\'s multimodal AI for reasoning, image analysis, and general education tasks',
    cost_per_request: 0.0001,
    is_recommended: true,
    configuration: {
      model: 'gemini-pro',
      temperature: 0.7,
      max_tokens: 2048,
    },
  },
  {
    name: 'Claude 3.5 Sonnet',
    provider_type: 'text',
    api_endpoint: 'https://api.anthropic.com/v1/messages',
    specialization: 'creative',
    description: 'Anthropic\'s advanced AI for creative writing, detailed explanations, and complex reasoning',
    cost_per_request: 0.0003,
    is_recommended: true,
    configuration: {
      model: 'claude-3-5-sonnet-20241022',
      temperature: 0.8,
      max_tokens: 4096,
    },
  },
  {
    name: 'GPT-4',
    provider_type: 'multimodal',
    api_endpoint: 'https://api.openai.com/v1/chat/completions',
    specialization: 'reasoning',
    description: 'OpenAI\'s flagship model for advanced reasoning, problem-solving, and multimodal tasks',
    cost_per_request: 0.0003,
    is_recommended: true,
    configuration: {
      model: 'gpt-4',
      temperature: 0.7,
      max_tokens: 8192,
    },
  },
  {
    name: 'ElevenLabs',
    provider_type: 'voice',
    api_endpoint: 'https://api.elevenlabs.io/v1/text-to-speech',
    specialization: 'general',
    description: 'Premium text-to-speech AI for natural-sounding voice responses and audio content',
    cost_per_request: 0.0015,
    is_recommended: true,
    configuration: {
      voice_id: 'default',
      model_id: 'eleven_monolingual_v1',
      stability: 0.5,
      similarity_boost: 0.75,
    },
  },
  {
    name: 'Synthesia',
    provider_type: 'video',
    api_endpoint: 'https://api.synthesia.io/v2/videos',
    specialization: 'creative',
    description: 'AI-generated video lessons with avatars for engaging educational content delivery',
    cost_per_request: 0.50,
    is_recommended: true,
    configuration: {
      avatar: 'default',
      background: 'gradient',
      voice: 'en-US',
    },
  },
  {
    name: 'Grok',
    provider_type: 'text',
    api_endpoint: 'https://api.x.ai/v1/chat/completions',
    specialization: 'research',
    description: 'X.AI\'s research-focused model for current events, web search, and real-time information',
    cost_per_request: 0.0002,
    is_recommended: false,
    configuration: {
      model: 'grok-beta',
      temperature: 0.6,
      max_tokens: 2048,
    },
  },
];

// Provider type colors and icons
const PROVIDER_TYPE_CONFIG = {
  text: {
    color: 'blue',
    bgClass: 'bg-blue-50 border-blue-200',
    textClass: 'text-blue-700',
    badgeClass: 'bg-blue-100 text-blue-700',
    icon: MessageSquare,
    hoverClass: 'hover:border-blue-300 hover:shadow-blue-100',
  },
  voice: {
    color: 'purple',
    bgClass: 'bg-purple-50 border-purple-200',
    textClass: 'text-purple-700',
    badgeClass: 'bg-purple-100 text-purple-700',
    icon: Mic,
    hoverClass: 'hover:border-purple-300 hover:shadow-purple-100',
  },
  video: {
    color: 'orange',
    bgClass: 'bg-orange-50 border-orange-200',
    textClass: 'text-orange-700',
    badgeClass: 'bg-orange-100 text-orange-700',
    icon: Video,
    hoverClass: 'hover:border-orange-300 hover:shadow-orange-100',
  },
  multimodal: {
    color: 'green',
    bgClass: 'bg-green-50 border-green-200',
    textClass: 'text-green-700',
    badgeClass: 'bg-green-100 text-green-700',
    icon: Brain,
    hoverClass: 'hover:border-green-300 hover:shadow-green-100',
  },
};

// Specialization icons and colors
const SPECIALIZATION_CONFIG = {
  general: { icon: Sparkles, color: 'gray' },
  creative: { icon: Zap, color: 'pink' },
  reasoning: { icon: Brain, color: 'indigo' },
  research: { icon: TrendingUp, color: 'cyan' },
};

export default function RecommendedProviders({ onSelectTemplate, loading = false }: RecommendedProvidersProps) {
  const [templates, setTemplates] = useState<RecommendedProviderInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecommendedProviders();
  }, []);

  const loadRecommendedProviders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const recommended = await adminProviderService.getRecommended();

      // Merge backend data with default templates
      const mergedTemplates = DEFAULT_TEMPLATES.map(template => {
        const backendData = recommended.find(r => r.name === template.name);
        if (backendData) {
          return { ...template, ...backendData };
        }
        return template;
      });

      setTemplates(mergedTemplates);
    } catch (err) {
      console.error('Failed to load recommended providers:', err);
      // Fallback to default templates
      setTemplates(DEFAULT_TEMPLATES);
      setError('Using default templates');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCost = (cost: number): string => {
    if (cost >= 1) {
      return `$${cost.toFixed(2)}`;
    } else if (cost >= 0.01) {
      return `$${cost.toFixed(4)}`;
    } else {
      return `$${cost.toFixed(6)}`;
    }
  };

  const getProviderConfig = (type: string) => {
    return PROVIDER_TYPE_CONFIG[type as keyof typeof PROVIDER_TYPE_CONFIG] || PROVIDER_TYPE_CONFIG.text;
  };

  const getSpecializationConfig = (specialization: string) => {
    return SPECIALIZATION_CONFIG[specialization as keyof typeof SPECIALIZATION_CONFIG] || SPECIALIZATION_CONFIG.general;
  };

  if (isLoading || loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 w-6 bg-gray-200 rounded"></div>
            </div>
            <div className="flex gap-2 mb-4">
              <div className="h-5 bg-gray-200 rounded w-20"></div>
              <div className="h-5 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <Sparkles className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Recommended Providers</h3>
        <p className="text-gray-600">
          There are currently no recommended AI provider templates available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template, index) => {
          const providerConfig = getProviderConfig(template.provider_type);
          const specializationConfig = getSpecializationConfig(template.specialization);
          const ProviderIcon = providerConfig.icon;
          const SpecializationIcon = specializationConfig.icon;

          return (
            <div
              key={index}
              className={`
                relative bg-white border-2 rounded-xl p-6
                transition-all duration-200 transform
                hover:scale-105 hover:shadow-lg
                ${providerConfig.bgClass}
                ${providerConfig.hoverClass}
              `}
            >
              {/* Recommended Badge */}
              {template.is_recommended && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 dark:text-white shadow-sm">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Recommended
                  </span>
                </div>
              )}

              {/* Header */}
              <div className="flex items-start gap-3 mb-4 pr-20">
                <div className={`p-2 rounded-lg ${providerConfig.badgeClass}`}>
                  <ProviderIcon className={`w-6 h-6 ${providerConfig.textClass}`} />
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${providerConfig.textClass}`}>
                    {template.name}
                  </h3>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`
                  inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${providerConfig.badgeClass}
                `}>
                  {template.provider_type}
                </span>
                <span className={`
                  inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  bg-${specializationConfig.color}-100 text-${specializationConfig.color}-700
                `}>
                  <SpecializationIcon className="w-3 h-3 mr-1" />
                  {template.specialization}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-3 min-h-[3.6rem]">
                {template.description}
              </p>

              {/* Cost */}
              <div className="mb-4">
                <span className="text-xs text-gray-500">Typical cost per request:</span>
                <div className="text-lg font-semibold text-gray-900">
                  {formatCost(template.cost_per_request)}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectTemplate(template)}
                className={`
                  w-full py-2.5 px-4 rounded-lg font-medium text-gray-900 dark:text-white
                  transition-all duration-200
                  bg-gradient-to-r ${
                    providerConfig.color === 'blue' ? 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' :
                    providerConfig.color === 'purple' ? 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700' :
                    providerConfig.color === 'orange' ? 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700' :
                    'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                  }
                  shadow-sm hover:shadow-md
                  active:scale-95
                `}
              >
                Use This Template
              </button>
            </div>
          );
        })}
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              Recommended AI Providers
            </h4>
            <p className="text-sm text-blue-700">
              These are pre-configured AI provider templates optimized for educational use.
              Select a template to automatically fill in the provider details, then add your API key to activate it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
