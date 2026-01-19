import React, { useState } from 'react';
import {
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  UserIcon,
  ServerIcon,
  CloudArrowUpIcon,
  TrashIcon,
  PencilIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

interface ActivityLog {
  id: number;
  action: string;
  resource: string;
  user: string;
  status: 'success' | 'warning' | 'error';
  timestamp: string;
  details: string;
  ip: string;
}

export default function ActivityLogs() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const isPremium = user?.is_premium;

  // Mock data
  const logs: ActivityLog[] = [
    {
      id: 1,
      action: 'Backup Created',
      resource: 'production-bucket',
      user: 'admin@example.com',
      status: 'success',
      timestamp: '2026-01-19 14:32:15',
      details: 'Automated backup job completed successfully',
      ip: '192.168.1.100',
    },
    {
      id: 2,
      action: 'Instance Updated',
      resource: 'aws-s3-prod',
      user: 'admin@example.com',
      status: 'success',
      timestamp: '2026-01-19 13:15:42',
      details: 'Updated SSL configuration',
      ip: '192.168.1.100',
    },
    {
      id: 3,
      action: 'Backup Failed',
      resource: 'staging-bucket',
      user: 'system',
      status: 'error',
      timestamp: '2026-01-19 12:05:33',
      details: 'Connection timeout to destination',
      ip: 'N/A',
    },
    {
      id: 4,
      action: 'User Login',
      resource: 'authentication',
      user: 'admin@example.com',
      status: 'success',
      timestamp: '2026-01-19 09:22:11',
      details: 'Successful login from web interface',
      ip: '192.168.1.100',
    },
    {
      id: 5,
      action: 'Instance Deleted',
      resource: 'old-minio-instance',
      user: 'admin@example.com',
      status: 'warning',
      timestamp: '2026-01-18 16:45:28',
      details: 'Instance removed from system',
      ip: '192.168.1.100',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('Backup')) return CloudArrowUpIcon;
    if (action.includes('Instance') || action.includes('Created')) return ServerIcon;
    if (action.includes('Deleted')) return TrashIcon;
    if (action.includes('Updated')) return PencilIcon;
    if (action.includes('Login')) return UserIcon;
    return DocumentTextIcon;
  };

  if (!isPremium) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
          <p className="mt-2 text-sm text-gray-600">
            Complete audit trail of all system activities
          </p>
        </div>

        {/* Premium Upsell */}
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-start gap-6">
            <div className="bg-white/20 p-4 rounded-xl">
              <DocumentTextIcon className="h-12 w-12" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <LockClosedIcon className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">Premium Feature</span>
              </div>
              <h2 className="text-2xl font-bold mb-3">Unlock Activity Logs & Audit Trail</h2>
              <p className="text-blue-100 mb-6 max-w-2xl">
                Track every action in your system with comprehensive activity logs. Perfect for compliance, security auditing, and troubleshooting issues.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="bg-white/20 p-2 rounded-lg mt-0.5">
                    <ClockIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">Real-time Tracking</div>
                    <div className="text-sm text-blue-100">Monitor all system activities live</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-white/20 p-2 rounded-lg mt-0.5">
                    <MagnifyingGlassIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">Advanced Search</div>
                    <div className="text-sm text-blue-100">Find specific events quickly</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-white/20 p-2 rounded-lg mt-0.5">
                    <FunnelIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">Powerful Filters</div>
                    <div className="text-sm text-blue-100">Filter by user, action, status</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-white/20 p-2 rounded-lg mt-0.5">
                    <DocumentTextIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">Export Reports</div>
                    <div className="text-sm text-blue-100">Download logs for compliance</div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => window.location.href = '/subscribe'}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
        <p className="mt-2 text-sm text-gray-600">
          Complete audit trail of all system activities and changes
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="sm:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <select
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="backup">Backups</option>
              <option value="instance">Instances</option>
              <option value="user">User Actions</option>
              <option value="system">System</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => {
                const ActionIcon = getActionIcon(log.action);
                return (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.status)}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <ActionIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{log.action}</div>
                          <div className="text-xs text-gray-500">{log.details}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-gray-900">{log.resource}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">{log.user}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">{log.timestamp}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-500">{log.ip}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of{' '}
              <span className="font-medium">127</span> results
            </p>
            <div className="flex gap-2">
              <button className="btn-secondary py-2 px-4 text-sm">Previous</button>
              <button className="btn-primary py-2 px-4 text-sm">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
