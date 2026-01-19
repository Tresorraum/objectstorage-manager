import React, { useState } from 'react';
import {
  PuzzlePieceIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ArrowTopRightOnSquareIcon,
  BoltIcon,
  ShieldCheckIcon,
  CommandLineIcon,
  BellAlertIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  CloudIcon,
  CodeBracketIcon,
  CpuChipIcon,
  DocumentTextIcon,
  ChartBarIcon,
  KeyIcon,
  LockClosedIcon,
  ServerIcon,
  CubeIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  status: 'connected' | 'available' | 'coming-soon';
  featured?: boolean;
  popular?: boolean;
  capabilities: string[];
  setupTime?: string;
}

export default function Integrations() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const integrations: Integration[] = [
    // Featured - Your Products
    {
      id: 'vault-terminal',
      name: 'Vault Terminal',
      description: 'Secure credential management and secrets vault. Store API keys, passwords, and sensitive data with enterprise-grade encryption.',
      category: 'security',
      icon: ShieldCheckIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      status: 'available',
      featured: true,
      popular: true,
      capabilities: ['Secrets Management', 'Auto-rotation', 'Audit Logs', 'Team Sharing'],
      setupTime: '2 min',
    },
    
    // Notifications & Alerts
    {
      id: 'slack',
      name: 'Slack',
      description: 'Get real-time notifications about backup status, storage alerts, and system events directly in your Slack channels.',
      category: 'notifications',
      icon: ChatBubbleLeftRightIcon,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      status: 'available',
      popular: true,
      capabilities: ['Backup Alerts', 'Error Notifications', 'Daily Reports', 'Custom Channels'],
      setupTime: '1 min',
    },
    {
      id: 'discord',
      name: 'Discord',
      description: 'Receive backup notifications and alerts in your Discord server. Perfect for development teams.',
      category: 'notifications',
      icon: ChatBubbleLeftRightIcon,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      status: 'available',
      capabilities: ['Webhook Support', 'Rich Embeds', 'Role Mentions', 'Custom Formatting'],
      setupTime: '1 min',
    },
    {
      id: 'email',
      name: 'Email Notifications',
      description: 'Configure email alerts for backup failures, storage limits, and scheduled reports.',
      category: 'notifications',
      icon: EnvelopeIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      status: 'connected',
      capabilities: ['Failure Alerts', 'Daily Digests', 'Custom Recipients', 'HTML Templates'],
      setupTime: '30 sec',
    },
    {
      id: 'pagerduty',
      name: 'PagerDuty',
      description: 'Create incidents and alerts in PagerDuty for critical backup failures and storage issues.',
      category: 'notifications',
      icon: BellAlertIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      status: 'available',
      capabilities: ['Incident Creation', 'Escalation Policies', 'On-call Routing', 'Auto-resolve'],
      setupTime: '3 min',
    },
    {
      id: 'opsgenie',
      name: 'Opsgenie',
      description: 'Alert your on-call team about critical storage and backup issues through Opsgenie.',
      category: 'notifications',
      icon: BellAlertIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      status: 'coming-soon',
      capabilities: ['Alert Management', 'Team Routing', 'Schedules', 'Escalations'],
      setupTime: '3 min',
    },

    // Monitoring & Analytics
    {
      id: 'datadog',
      name: 'Datadog',
      description: 'Send storage metrics, backup performance data, and custom events to Datadog for monitoring and alerting.',
      category: 'monitoring',
      icon: ChartBarIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      status: 'available',
      popular: true,
      capabilities: ['Metrics Export', 'Custom Dashboards', 'APM Integration', 'Log Forwarding'],
      setupTime: '5 min',
    },
    {
      id: 'prometheus',
      name: 'Prometheus',
      description: 'Export metrics in Prometheus format for monitoring storage usage, backup success rates, and performance.',
      category: 'monitoring',
      icon: ChartBarIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      status: 'available',
      capabilities: ['Metrics Endpoint', 'Custom Labels', 'Grafana Compatible', 'Alertmanager'],
      setupTime: '2 min',
    },
    {
      id: 'grafana',
      name: 'Grafana',
      description: 'Visualize your storage and backup metrics with pre-built Grafana dashboards.',
      category: 'monitoring',
      icon: ChartBarIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      status: 'available',
      capabilities: ['Pre-built Dashboards', 'Custom Queries', 'Alerts', 'Annotations'],
      setupTime: '3 min',
    },
    {
      id: 'newrelic',
      name: 'New Relic',
      description: 'Monitor backup performance and storage infrastructure with New Relic APM and Infrastructure.',
      category: 'monitoring',
      icon: ChartBarIcon,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      status: 'coming-soon',
      capabilities: ['APM', 'Infrastructure', 'Custom Events', 'Dashboards'],
      setupTime: '5 min',
    },

    // Cloud Providers
    {
      id: 'aws',
      name: 'AWS Integration',
      description: 'Enhanced integration with AWS S3, CloudWatch, and SNS for comprehensive cloud backup management.',
      category: 'cloud',
      icon: CloudIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      status: 'available',
      popular: true,
      capabilities: ['S3 Deep Integration', 'CloudWatch Metrics', 'SNS Notifications', 'IAM Roles'],
      setupTime: '5 min',
    },
    {
      id: 'gcp',
      name: 'Google Cloud',
      description: 'Connect with Google Cloud Storage, Cloud Monitoring, and Pub/Sub for seamless GCP integration.',
      category: 'cloud',
      icon: CloudIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      status: 'available',
      capabilities: ['GCS Integration', 'Cloud Monitoring', 'Pub/Sub', 'Service Accounts'],
      setupTime: '5 min',
    },
    {
      id: 'azure',
      name: 'Microsoft Azure',
      description: 'Integrate with Azure Blob Storage, Azure Monitor, and Event Grid for enterprise backup solutions.',
      category: 'cloud',
      icon: CloudIcon,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      status: 'coming-soon',
      capabilities: ['Blob Storage', 'Azure Monitor', 'Event Grid', 'Managed Identity'],
      setupTime: '5 min',
    },

    // Developer Tools
    {
      id: 'github-actions',
      name: 'GitHub Actions',
      description: 'Trigger backups from GitHub workflows and receive status updates in your CI/CD pipeline.',
      category: 'devtools',
      icon: CodeBracketIcon,
      color: 'text-gray-800',
      bgColor: 'bg-gray-50',
      status: 'available',
      capabilities: ['Workflow Triggers', 'Status Checks', 'Artifact Storage', 'Secrets Integration'],
      setupTime: '2 min',
    },
    {
      id: 'gitlab-ci',
      name: 'GitLab CI/CD',
      description: 'Integrate backup operations into your GitLab CI/CD pipelines with custom jobs and triggers.',
      category: 'devtools',
      icon: CodeBracketIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      status: 'available',
      capabilities: ['Pipeline Integration', 'Custom Jobs', 'Variables', 'Artifacts'],
      setupTime: '2 min',
    },
    {
      id: 'jenkins',
      name: 'Jenkins',
      description: 'Add backup steps to your Jenkins pipelines and automate storage management tasks.',
      category: 'devtools',
      icon: CpuChipIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      status: 'coming-soon',
      capabilities: ['Pipeline Plugin', 'Build Triggers', 'Post-build Actions', 'Credentials'],
      setupTime: '3 min',
    },

    // Webhooks & API
    {
      id: 'webhooks',
      name: 'Custom Webhooks',
      description: 'Send HTTP requests to your custom endpoints for backup events, alerts, and status updates.',
      category: 'api',
      icon: BoltIcon,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      status: 'available',
      popular: true,
      capabilities: ['Custom Endpoints', 'Event Filtering', 'Retry Logic', 'Payload Customization'],
      setupTime: '1 min',
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Connect with 5,000+ apps through Zapier. Automate workflows based on backup events.',
      category: 'automation',
      icon: BoltIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      status: 'coming-soon',
      capabilities: ['5000+ Apps', 'Multi-step Zaps', 'Filters', 'Formatters'],
      setupTime: '2 min',
    },
    {
      id: 'make',
      name: 'Make (Integromat)',
      description: 'Build complex automation scenarios with Make\'s visual workflow builder.',
      category: 'automation',
      icon: WrenchScrewdriverIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      status: 'coming-soon',
      capabilities: ['Visual Builder', 'Complex Scenarios', 'Data Transformation', 'Scheduling'],
      setupTime: '3 min',
    },

    // Documentation & Logging
    {
      id: 'notion',
      name: 'Notion',
      description: 'Automatically document backup runs, create incident reports, and maintain backup logs in Notion.',
      category: 'documentation',
      icon: DocumentTextIcon,
      color: 'text-gray-800',
      bgColor: 'bg-gray-50',
      status: 'coming-soon',
      capabilities: ['Auto Documentation', 'Database Sync', 'Templates', 'Team Wikis'],
      setupTime: '2 min',
    },
    {
      id: 'confluence',
      name: 'Confluence',
      description: 'Generate backup reports and documentation pages in Confluence for team collaboration.',
      category: 'documentation',
      icon: DocumentTextIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      status: 'coming-soon',
      capabilities: ['Page Creation', 'Space Integration', 'Templates', 'Attachments'],
      setupTime: '3 min',
    },

    // Security & Compliance
    {
      id: 'vault',
      name: 'HashiCorp Vault',
      description: 'Store and rotate credentials securely using HashiCorp Vault for enhanced security.',
      category: 'security',
      icon: LockClosedIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      status: 'available',
      capabilities: ['Dynamic Secrets', 'Encryption', 'Audit Logs', 'Access Policies'],
      setupTime: '5 min',
    },
    {
      id: 'aws-secrets',
      name: 'AWS Secrets Manager',
      description: 'Retrieve and rotate secrets from AWS Secrets Manager for secure credential management.',
      category: 'security',
      icon: KeyIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      status: 'available',
      capabilities: ['Secret Rotation', 'Encryption', 'IAM Integration', 'Versioning'],
      setupTime: '3 min',
    },

    // Backup Destinations
    {
      id: 'backblaze',
      name: 'Backblaze B2',
      description: 'Use Backblaze B2 as a cost-effective backup destination with S3-compatible API.',
      category: 'storage',
      icon: ServerIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      status: 'available',
      capabilities: ['S3 Compatible', 'Low Cost', 'Lifecycle Rules', 'Encryption'],
      setupTime: '3 min',
    },
    {
      id: 'wasabi',
      name: 'Wasabi',
      description: 'Connect to Wasabi hot cloud storage for fast, affordable backup storage.',
      category: 'storage',
      icon: CubeIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      status: 'available',
      capabilities: ['Hot Storage', 'No Egress Fees', 'Immutability', 'Replication'],
      setupTime: '3 min',
    },
    {
      id: 'digitalocean',
      name: 'DigitalOcean Spaces',
      description: 'Backup to DigitalOcean Spaces with built-in CDN and simple pricing.',
      category: 'storage',
      icon: CloudIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      status: 'available',
      capabilities: ['CDN Included', 'Simple Pricing', 'S3 Compatible', 'Edge Locations'],
      setupTime: '3 min',
    },

    // Terminal & CLI
    {
      id: 'cli-tool',
      name: 'CLI Tool',
      description: 'Command-line interface for managing backups, instances, and automation from your terminal.',
      category: 'devtools',
      icon: CommandLineIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      status: 'available',
      capabilities: ['Full API Access', 'Scripting', 'Automation', 'Interactive Mode'],
      setupTime: '1 min',
    },
  ];

  const categories = [
    { id: 'all', name: 'All Integrations', icon: PuzzlePieceIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'notifications', name: 'Notifications', icon: BellAlertIcon },
    { id: 'monitoring', name: 'Monitoring', icon: ChartBarIcon },
    { id: 'cloud', name: 'Cloud Providers', icon: CloudIcon },
    { id: 'devtools', name: 'Developer Tools', icon: CodeBracketIcon },
    { id: 'automation', name: 'Automation', icon: BoltIcon },
    { id: 'storage', name: 'Storage', icon: ServerIcon },
    { id: 'documentation', name: 'Documentation', icon: DocumentTextIcon },
    { id: 'api', name: 'API & Webhooks', icon: WrenchScrewdriverIcon },
  ];

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredIntegrations = integrations.filter(i => i.featured);
  const popularIntegrations = integrations.filter(i => i.popular && !i.featured);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="h-3.5 w-3.5 mr-1" />
            Connected
          </span>
        );
      case 'available':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Available
          </span>
        );
      case 'coming-soon':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Coming Soon
          </span>
        );
      default:
        return null;
    }
  };

  const handleConnect = (integration: Integration) => {
    if (integration.status === 'coming-soon') {
      toast('Coming soon! This integration is under development.', { icon: '🚀' });
    } else if (integration.status === 'connected') {
      toast('Already connected!', { icon: '✅' });
    } else {
      toast(`Connecting to ${integration.name}...`, { icon: '🔌' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
        <p className="mt-2 text-sm text-gray-600">
          Connect your favorite tools and automate your backup workflows
        </p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search integrations..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="sm:w-64">
            <select
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Featured Integrations */}
      {selectedCategory === 'all' && !searchQuery && featuredIntegrations.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Featured</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featuredIntegrations.map(integration => {
              const Icon = integration.icon;
              return (
                <div key={integration.id} className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 p-6 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className={`${integration.bgColor} p-3 rounded-xl`}>
                        <Icon className={`h-8 w-8 ${integration.color}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{integration.name}</h3>
                        {getStatusBadge(integration.status)}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">{integration.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {integration.capabilities.slice(0, 4).map(cap => (
                      <span key={cap} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-gray-700 border border-gray-200">
                        {cap}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Setup time: {integration.setupTime}</span>
                    <button
                      onClick={() => handleConnect(integration)}
                      className="btn-primary py-2 px-4 text-sm"
                    >
                      {integration.status === 'connected' ? 'Configure' : 'Connect'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Popular Integrations */}
      {selectedCategory === 'all' && !searchQuery && popularIntegrations.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Popular</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularIntegrations.map(integration => {
              const Icon = integration.icon;
              return (
                <div key={integration.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:border-indigo-300 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`${integration.bgColor} p-2.5 rounded-lg`}>
                      <Icon className={`h-6 w-6 ${integration.color}`} />
                    </div>
                    {getStatusBadge(integration.status)}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{integration.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{integration.description}</p>
                  <button
                    onClick={() => handleConnect(integration)}
                    className="w-full btn-secondary py-2 text-sm"
                  >
                    {integration.status === 'connected' ? 'Configure' : 'Connect'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Integrations */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {selectedCategory === 'all' ? 'All Integrations' : categories.find(c => c.id === selectedCategory)?.name}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntegrations.map(integration => {
            const Icon = integration.icon;
            return (
              <div key={integration.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:border-indigo-300 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className={`${integration.bgColor} p-2.5 rounded-lg`}>
                    <Icon className={`h-6 w-6 ${integration.color}`} />
                  </div>
                  {getStatusBadge(integration.status)}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{integration.name}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{integration.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {integration.capabilities.slice(0, 3).map(cap => (
                    <span key={cap} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                      {cap}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="text-xs text-gray-500">{integration.setupTime} setup</span>
                  <button
                    onClick={() => handleConnect(integration)}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    {integration.status === 'connected' ? 'Configure' : 'Connect'}
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredIntegrations.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <PuzzlePieceIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No integrations found</h3>
            <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
