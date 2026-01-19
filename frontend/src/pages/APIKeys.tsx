import React, { useState } from 'react';
import {
  KeyIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface APIKey {
  id: number;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  permissions: string[];
  status: 'active' | 'revoked';
}

export default function APIKeys() {
  const { user } = useAuth();
  const [showKeys, setShowKeys] = useState<{ [key: number]: boolean }>({});
  const [copiedKey, setCopiedKey] = useState<number | null>(null);

  const isPremium = user?.is_premium;

  // Mock data
  const apiKeys: APIKey[] = [
    {
      id: 1,
      name: 'Production API Key',
      key: 'sk_live_51HqJ8KLkdj2k3j4k5j6k7k8k9k0k1k2k3k4k5k6k7k8k9k0',
      created: '2026-01-15',
      lastUsed: '2 hours ago',
      permissions: ['read:instances', 'write:backups', 'read:analytics'],
      status: 'active',
    },
    {
      id: 2,
      name: 'Development API Key',
      key: 'sk_test_51HqJ8KLkdj2k3j4k5j6k7k8k9k0k1k2k3k4k5k6k7k8k9k0',
      created: '2026-01-10',
      lastUsed: '1 day ago',
      permissions: ['read:instances', 'read:backups'],
      status: 'active',
    },
    {
      id: 3,
      name: 'CI/CD Pipeline',
      key: 'sk_live_61HqJ8KLkdj2k3j4k5j6k7k8k9k0k1k2k3k4k5k6k7k8k9k0',
      created: '2026-01-05',
      lastUsed: 'Never',
      permissions: ['read:instances'],
      status: 'revoked',
    },
  ];

  const maskKey = (key: string) => {
    return `${key.substring(0, 12)}${'•'.repeat(32)}${key.substring(key.length - 4)}`;
  };

  const copyToClipboard = (key: string, id: number) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(id);
    toast.success('API key copied to clipboard');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleKeyVisibility = (id: number) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!isPremium) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Keys</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage API keys for programmatic access
          </p>
        </div>

        {/* Premium Upsell */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-start gap-6">
            <div className="bg-white/20 p-4 rounded-xl">
              <KeyIcon className="h-12 w-12" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <LockClosedIcon className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">Premium Feature</span>
              </div>
              <h2 className="text-2xl font-bold mb-3">Unlock API Access</h2>
              <p className="text-green-100 mb-6 max-w-2xl">
                Generate API keys to integrate your storage management into your applications, CI/CD pipelines, and automation workflows.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="bg-white/20 p-2 rounded-lg mt-0.5">
                    <KeyIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">Multiple API Keys</div>
                    <div className="text-sm text-green-100">Create keys for different purposes</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-white/20 p-2 rounded-lg mt-0.5">
                    <ShieldCheckIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">Granular Permissions</div>
                    <div className="text-sm text-green-100">Control access per key</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-white/20 p-2 rounded-lg mt-0.5">
                    <ClockIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">Usage Tracking</div>
                    <div className="text-sm text-green-100">Monitor API key activity</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-white/20 p-2 rounded-lg mt-0.5">
                    <CheckIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">Easy Revocation</div>
                    <div className="text-sm text-green-100">Revoke keys instantly</div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => window.location.href = '/subscribe'}
                className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
              >
                Upgrade to Premium
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Keys</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage API keys for programmatic access to your resources
          </p>
        </div>
        <button
          onClick={() => toast('Coming soon! API key generation under development.', { icon: '🚀' })}
          className="btn-primary w-full sm:w-auto"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create API Key
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <ShieldCheckIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900 mb-1">Keep your API keys secure</h3>
            <p className="text-sm text-blue-700">
              Treat API keys like passwords. Never share them publicly or commit them to version control. 
              Use environment variables to store keys in your applications.
            </p>
          </div>
        </div>
      </div>

      {/* API Keys List */}
      <div className="space-y-4">
        {apiKeys.map((apiKey) => (
          <div key={apiKey.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{apiKey.name}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    apiKey.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {apiKey.status}
                  </span>
                </div>

                {/* API Key Display */}
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm font-mono text-gray-900">
                      {showKeys[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
                    </code>
                    <button
                      onClick={() => toggleKeyVisibility(apiKey.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                      title={showKeys[apiKey.id] ? 'Hide' : 'Show'}
                    >
                      {showKeys[apiKey.id] ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                      title="Copy"
                    >
                      {copiedKey === apiKey.id ? (
                        <CheckIcon className="h-5 w-5 text-green-600" />
                      ) : (
                        <ClipboardDocumentIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Created:</span>
                    <span className="ml-2 text-gray-900">{apiKey.created}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Last Used:</span>
                    <span className="ml-2 text-gray-900">{apiKey.lastUsed}</span>
                  </div>
                </div>

                {/* Permissions */}
                <div className="mt-3">
                  <span className="text-sm text-gray-500 mb-2 block">Permissions:</span>
                  <div className="flex flex-wrap gap-2">
                    {apiKey.permissions.map((permission) => (
                      <span
                        key={permission}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                      >
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex lg:flex-col gap-2">
                <button
                  onClick={() => toast('Coming soon!', { icon: '🚀' })}
                  className="flex-1 lg:flex-none btn-secondary py-2 text-sm"
                  disabled={apiKey.status === 'revoked'}
                >
                  Edit
                </button>
                <button
                  onClick={() => toast('Coming soon!', { icon: '🚀' })}
                  className="flex-1 lg:flex-none btn-danger py-2 text-sm"
                  disabled={apiKey.status === 'revoked'}
                >
                  <TrashIcon className="h-4 w-4 mr-1" />
                  Revoke
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Documentation Link */}
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">API Documentation</h3>
        <p className="text-sm text-gray-600 mb-4">
          Learn how to use our API to integrate storage management into your applications.
        </p>
        <button
          onClick={() => toast('Coming soon! API documentation under development.', { icon: '📚' })}
          className="btn-secondary"
        >
          View API Docs
        </button>
      </div>
    </div>
  );
}
