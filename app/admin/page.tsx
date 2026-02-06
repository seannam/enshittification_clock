'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  researchAndSavePlatform,
  getRecentPlatforms,
  getAIProviders,
  createAIProvider,
  updateAIProvider,
  deleteAIProvider,
  testAIProvider,
  toggleAIProvider,
  type AIProviderDisplay,
  type AIProviderInput,
} from './actions';

interface Platform {
  name: string;
  slug: string;
  eventCount: number;
  updatedAt: string;
}

type Tab = 'research' | 'providers';

const BASE_URL_PRESETS = [
  { label: 'OpenAI', value: 'https://api.openai.com/v1' },
  { label: 'Anthropic', value: 'https://api.anthropic.com' },
  { label: 'Ollama (local)', value: 'http://localhost:11434/v1' },
  { label: 'Custom', value: '' },
];

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('research');

  // Research state
  const [platformName, setPlatformName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [recentPlatforms, setRecentPlatforms] = useState<Platform[]>([]);

  // Provider state
  const [providers, setProviders] = useState<AIProviderDisplay[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const [providerMessage, setProviderMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingProvider, setEditingProvider] = useState<AIProviderDisplay | null>(null);
  const [showProviderForm, setShowProviderForm] = useState(false);
  const [testingProviderId, setTestingProviderId] = useState<string | null>(null);

  const loadRecentPlatforms = useCallback(async () => {
    const result = await getRecentPlatforms(adminKey);
    if (result.success && result.platforms) {
      setRecentPlatforms(result.platforms);
    }
  }, [adminKey]);

  const loadProviders = useCallback(async () => {
    setIsLoadingProviders(true);
    const result = await getAIProviders(adminKey);
    if (result.success && result.providers) {
      setProviders(result.providers);
    }
    setIsLoadingProviders(false);
  }, [adminKey]);

  // Load admin key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('admin_key');
    if (savedKey) {
      setAdminKey(savedKey);
    }
  }, []);

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadRecentPlatforms();
      loadProviders();
    }
  }, [isAuthenticated, loadRecentPlatforms, loadProviders]);

  const handleAuthenticate = async () => {
    if (!adminKey.trim()) {
      setMessage({ type: 'error', text: 'Please enter an admin key' });
      return;
    }

    const result = await getRecentPlatforms(adminKey);
    if (result.success) {
      localStorage.setItem('admin_key', adminKey);
      setIsAuthenticated(true);
      setMessage(null);
      if (result.platforms) {
        setRecentPlatforms(result.platforms);
      }
    } else {
      setMessage({ type: 'error', text: 'Invalid admin key' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!platformName.trim()) {
      setMessage({ type: 'error', text: 'Please enter a platform name' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await researchAndSavePlatform(platformName, adminKey);

      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setPlatformName('');
        loadRecentPlatforms();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_key');
    setIsAuthenticated(false);
    setAdminKey('');
    setRecentPlatforms([]);
    setProviders([]);
  };

  const handleToggleProvider = async (providerId: string, enabled: boolean) => {
    const result = await toggleAIProvider(adminKey, providerId, enabled);
    if (result.success) {
      loadProviders();
    } else {
      setProviderMessage({ type: 'error', text: result.message || 'Failed to toggle provider' });
    }
  };

  const handleDeleteProvider = async (providerId: string) => {
    if (!confirm('Are you sure you want to delete this provider?')) {
      return;
    }

    const result = await deleteAIProvider(adminKey, providerId);
    if (result.success) {
      setProviderMessage({ type: 'success', text: 'Provider deleted' });
      loadProviders();
    } else {
      setProviderMessage({ type: 'error', text: result.message || 'Failed to delete provider' });
    }
  };

  const handleTestProvider = async (providerId: string) => {
    setTestingProviderId(providerId);
    const result = await testAIProvider(adminKey, providerId);
    setTestingProviderId(null);

    if (result.success) {
      setProviderMessage({
        type: 'success',
        text: result.message,
      });
    } else {
      setProviderMessage({ type: 'error', text: result.message });
    }
  };

  const handleSaveProvider = async (input: AIProviderInput) => {
    let result;
    if (editingProvider) {
      result = await updateAIProvider(adminKey, editingProvider.id, input);
    } else {
      result = await createAIProvider(adminKey, input);
    }

    if (result.success) {
      setProviderMessage({
        type: 'success',
        text: editingProvider ? 'Provider updated' : 'Provider created',
      });
      setShowProviderForm(false);
      setEditingProvider(null);
      loadProviders();
    } else {
      setProviderMessage({ type: 'error', text: result.message || 'Failed to save provider' });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-6">Admin Authentication</h1>

          <div className="bg-gray-800 rounded-lg p-6">
            <label className="block mb-2 text-sm font-medium">Admin Key</label>
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAuthenticate()}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter admin key"
            />

            {message && (
              <p className={`mt-3 text-sm ${message.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                {message.text}
              </p>
            )}

            <button
              onClick={handleAuthenticate}
              className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              Authenticate
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('research')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'research'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Research Platforms
          </button>
          <button
            onClick={() => setActiveTab('providers')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'providers'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            AI Providers
          </button>
        </div>

        {activeTab === 'research' && (
          <>
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <form onSubmit={handleSubmit}>
                <label className="block mb-2 text-sm font-medium">Platform Name</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    placeholder="e.g., Twitter, Reddit, Netflix"
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Spinner />
                        Researching...
                      </>
                    ) : (
                      'Research & Save'
                    )}
                  </button>
                </div>

                {message && (
                  <div
                    className={`mt-4 p-3 rounded-lg ${
                      message.type === 'error' ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'
                    }`}
                  >
                    {message.text}
                  </div>
                )}
              </form>
            </div>

            {recentPlatforms.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Recent Platforms</h2>
                <div className="space-y-3">
                  {recentPlatforms.map((platform) => (
                    <div
                      key={platform.slug}
                      className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg"
                    >
                      <div>
                        <span className="font-medium">{platform.name}</span>
                        <span className="text-gray-400 text-sm ml-2">({platform.eventCount} events)</span>
                      </div>
                      <span className="text-gray-500 text-sm">
                        {new Date(platform.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 text-sm text-gray-500">
              <p>
                Enter a platform name to research real enshittification events using AI. Events will be
                automatically saved to the database. Multiple AI providers will cross-verify results.
              </p>
            </div>
          </>
        )}

        {activeTab === 'providers' && (
          <>
            {providerMessage && (
              <div
                className={`mb-4 p-3 rounded-lg ${
                  providerMessage.type === 'error' ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'
                }`}
              >
                {providerMessage.text}
              </div>
            )}

            {showProviderForm ? (
              <ProviderForm
                provider={editingProvider}
                onSave={handleSaveProvider}
                onCancel={() => {
                  setShowProviderForm(false);
                  setEditingProvider(null);
                }}
              />
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">AI Providers</h2>
                  <button
                    onClick={() => setShowProviderForm(true)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
                  >
                    Add Provider
                  </button>
                </div>

                {isLoadingProviders ? (
                  <div className="bg-gray-800 rounded-lg p-6 flex justify-center">
                    <Spinner />
                  </div>
                ) : providers.length === 0 ? (
                  <div className="bg-gray-800 rounded-lg p-6 text-center text-gray-400">
                    <p>No AI providers configured.</p>
                    <p className="text-sm mt-2">
                      Add a provider or set the ANTHROPIC_API_KEY environment variable as a fallback.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {providers.map((provider) => (
                      <div
                        key={provider.id}
                        className="bg-gray-800 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-lg">{provider.name}</span>
                              <span
                                className={`px-2 py-0.5 rounded text-xs ${
                                  provider.enabled
                                    ? 'bg-green-900/50 text-green-300'
                                    : 'bg-gray-700 text-gray-400'
                                }`}
                              >
                                {provider.enabled ? 'Enabled' : 'Disabled'}
                              </span>
                              <span className="text-gray-500 text-sm">Priority: {provider.priority}</span>
                            </div>
                            <div className="text-gray-400 text-sm mt-1">
                              <span>{provider.model}</span>
                              <span className="mx-2">|</span>
                              <span className="text-gray-500">{provider.baseUrl}</span>
                            </div>
                            <div className="text-gray-500 text-xs mt-1">
                              Max tokens: {provider.maxTokens} | Temperature: {provider.temperature}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleTestProvider(provider.id)}
                              disabled={testingProviderId === provider.id}
                              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded text-sm transition-colors flex items-center gap-1"
                            >
                              {testingProviderId === provider.id ? (
                                <>
                                  <Spinner />
                                  Testing...
                                </>
                              ) : (
                                'Test'
                              )}
                            </button>
                            <button
                              onClick={() => handleToggleProvider(provider.id, !provider.enabled)}
                              className={`px-3 py-1 rounded text-sm transition-colors ${
                                provider.enabled
                                  ? 'bg-yellow-900/50 hover:bg-yellow-900 text-yellow-300'
                                  : 'bg-green-900/50 hover:bg-green-900 text-green-300'
                              }`}
                            >
                              {provider.enabled ? 'Disable' : 'Enable'}
                            </button>
                            <button
                              onClick={() => {
                                setEditingProvider(provider);
                                setShowProviderForm(true);
                              }}
                              className="px-3 py-1 bg-blue-900/50 hover:bg-blue-900 text-blue-300 rounded text-sm transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProvider(provider.id)}
                              className="px-3 py-1 bg-red-900/50 hover:bg-red-900 text-red-300 rounded text-sm transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 text-sm text-gray-500">
                  <p>
                    Configure multiple AI providers for cross-verification. When researching platforms,
                    all enabled providers will be queried and results will be compared for accuracy.
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ProviderForm({
  provider,
  onSave,
  onCancel,
}: {
  provider: AIProviderDisplay | null;
  onSave: (input: AIProviderInput) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(provider?.name || '');
  const [baseUrl, setBaseUrl] = useState(provider?.baseUrl || '');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState(provider?.model || '');
  const [priority, setPriority] = useState(provider?.priority || 1);
  const [maxTokens, setMaxTokens] = useState(provider?.maxTokens || 4096);
  const [temperature, setTemperature] = useState(provider?.temperature || 0.7);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const input: AIProviderInput = {
      name,
      baseUrl,
      apiKey: apiKey || (provider ? '' : ''), // Only send apiKey if provided
      model,
      priority,
      maxTokens,
      temperature,
    };

    // Don't include apiKey if editing and not changed
    if (provider && !apiKey) {
      delete (input as Partial<AIProviderInput>).apiKey;
    }

    await onSave(input);
    setIsSaving(false);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">
        {provider ? 'Edit Provider' : 'Add New Provider'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., OpenAI GPT-4"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Base URL</label>
          <div className="flex gap-2 mb-2">
            {BASE_URL_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setBaseUrl(preset.value)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  baseUrl === preset.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            required
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://api.openai.com/v1"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">
            API Key {provider && <span className="text-gray-500">(leave blank to keep current)</span>}
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            required={!provider}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={provider ? '********' : 'sk-...'}
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Model</label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            required
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., gpt-4-turbo, claude-sonnet-4-20250514"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Priority</label>
            <input
              type="number"
              value={priority}
              onChange={(e) => setPriority(parseInt(e.target.value) || 1)}
              min={1}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Lower = higher priority</p>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Max Tokens</label>
            <input
              type="number"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value) || 4096)}
              min={100}
              max={32000}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Temperature</label>
            <input
              type="number"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value) || 0.7)}
              min={0}
              max={2}
              step={0.1}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Spinner />
                Saving...
              </>
            ) : (
              'Save Provider'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
