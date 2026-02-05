'use client';

import { useState, useEffect, useCallback } from 'react';
import { researchAndSavePlatform, getRecentPlatforms } from './actions';

interface Platform {
  name: string;
  slug: string;
  eventCount: number;
  updatedAt: string;
}

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [platformName, setPlatformName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [recentPlatforms, setRecentPlatforms] = useState<Platform[]>([]);

  const loadRecentPlatforms = useCallback(async () => {
    const result = await getRecentPlatforms(adminKey);
    if (result.success && result.platforms) {
      setRecentPlatforms(result.platforms);
    }
  }, [adminKey]);

  // Load admin key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('admin_key');
    if (savedKey) {
      setAdminKey(savedKey);
    }
  }, []);

  // Load recent platforms when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadRecentPlatforms();
    }
  }, [isAuthenticated, loadRecentPlatforms]);

  const handleAuthenticate = async () => {
    if (!adminKey.trim()) {
      setMessage({ type: 'error', text: 'Please enter an admin key' });
      return;
    }

    // Test the key by fetching recent platforms
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
        // Refresh the recent platforms list
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
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin: Research Platforms</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>

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
            automatically saved to the database.
          </p>
        </div>
      </div>
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
