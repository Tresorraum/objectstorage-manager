import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface AuditLog {
  id: number;
  user_id?: number;
  action: string;
  resource: string;
  resource_id?: number;
  details: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

interface LogsResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function ActivityLogs() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterResource, setFilterResource] = useState('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const isPremium = user?.is_premium;

  // Fetch audit logs
  const { data: logsData, isLoading, refetch } = useQuery<LogsResponse>({
    queryKey: ['audit-logs', page, limit, searchQuery, filterAction, filterResource],
    queryFn: () => 
      api.get('/audit/logs', {
        params: {
          page,
          limit,
          query: searchQuery,
          action: filterAction,
          resource: filterResource,
        },
      }).then(res => res.data),
    enabled: isPremium,
    refetchInterval: 30000,
  });

  const getStatusFromAction = (action: string, details: string): 'success' | 'warning' | 'error' => {
    if (action === 'backup_run') {
      try {
        const parsed = JSON.parse(details);
        if (parsed.status === 'completed') return 'success';
        if (parsed.status === 'failed') return 'error';
        return 'warning';
      } catch {
        return 'success';
      }
    }
    if (action === 'delete') return 'warning';
    if (action === 'login' || action === 'create' || action === 'update') return 'success';
    return 'success';
  };

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
    if (action === 'backup_run') return CloudArrowUpIcon;
    if (action === 'create') return ServerIcon;
    if (action === 'delete') return TrashIcon;
    if (action === 'update') return PencilIcon;
    if (action === 'login') return UserIcon;
    return DocumentTextIcon;
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'login': 'User Login',
      'logout': 'User Logout',
      'create': 'Created',
      'update': 'Updated',
      'delete': 'Deleted',
      'backup_run': 'Backup Run',
      'restore': 'Restore',
    };
    return labels[action] || action;
  };

  const getResourceLabel = (resource: string) => {
    const labels: Record<string, string> = {
      'authentication': 'Authentication',
      'instance': 'Instance',
      'backup_job': 'Backup Job',
      'user': 'User',
      'system': 'System',
    };
    return labels[resource] || resource;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getDetailsPreview = (details: string, action: string) => {
    try {
      const parsed = JSON.parse(details);
      if (action === 'backup_run') {
        if (parsed.status === 'completed') {
          return `Completed: ${parsed.files || 0} files, ${formatBytes(parsed.size_bytes || 0)}`;
        }
        if (parsed.status === 'failed') {
          return `Failed: ${parsed.error || 'Unknown error'}`;
        }
      }
      if (action === 'create' && parsed.name) {
        return `Created: ${parsed.name}`;
      }
      if (action === 'update' && parsed.field) {
        return `Updated ${parsed.field}`;
      }
      if (action === 'delete' && parsed.name) {
        return `Deleted: ${parsed.name}`;
      }
      return Object.keys(parsed).slice(0, 2).join(', ');
    } catch {
      return details.substring(0, 50);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleExport = () => {
    toast.success('Export functionality coming soon!');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
          <p className="mt-2 text-sm text-gray-600">
            Complete audit trail • {logsData?.total || 0} total events
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => refetch()}
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowPathIcon className="h-5 w-5" />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="btn-primary flex items-center gap-2"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by IP, details..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          <div>
            <select
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={filterAction}
              onChange={(e) => {
                setFilterAction(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Actions</option>
              <option value="login">Login</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="backup_run">Backup Run</option>
            </select>
          </div>

          <div>
            <select
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={filterResource}
              onChange={(e) => {
                setFilterResource(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Resources</option>
              <option value="authentication">Authentication</option>
              <option value="instance">Instances</option>
              <option value="backup_job">Backup Jobs</option>
              <option value="user">Users</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : logsData && logsData.logs.length > 0 ? (
          <>
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
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logsData.logs.map((log) => {
                    const status = getStatusFromAction(log.action, log.details);
                    const ActionIcon = getActionIcon(log.action);
                    return (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(status)}
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                              {status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <ActionIcon className="h-5 w-5 text-gray-400" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{getActionLabel(log.action)}</div>
                              <div className="text-xs text-gray-500">{getDetailsPreview(log.details, log.action)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <span className="text-sm font-medium text-gray-900">{getResourceLabel(log.resource)}</span>
                            {log.resource_id && (
                              <span className="ml-2 text-xs text-gray-500">#{log.resource_id}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {log.user ? (
                              <>
                                <UserIcon className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-900">{log.user.username}</span>
                              </>
                            ) : (
                              <span className="text-sm text-gray-500 italic">System</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-500">{formatTimestamp(log.created_at)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-mono text-gray-500">{log.ip_address}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((page - 1) * limit) + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(page * limit, logsData.total)}</span> of{' '}
                  <span className="font-medium">{logsData.total}</span> results
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-secondary py-2 px-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                    Previous
                  </button>
                  <div className="flex items-center gap-2 px-4">
                    <span className="text-sm text-gray-700">
                      Page {page} of {logsData.pages}
                    </span>
                  </div>
                  <button
                    onClick={() => setPage(p => Math.min(logsData.pages, p + 1))}
                    disabled={page >= logsData.pages}
                    className="btn-primary py-2 px-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Next
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No activity logs</h3>
            <p className="mt-1 text-sm text-gray-500">No logs match your current filters.</p>
          </div>
        )}
      </div>

      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Activity Log Details</h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Action</label>
                <p className="mt-1 text-sm text-gray-900">{getActionLabel(selectedLog.action)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Resource</label>
                <p className="mt-1 text-sm text-gray-900">
                  {getResourceLabel(selectedLog.resource)}
                  {selectedLog.resource_id && ` #${selectedLog.resource_id}`}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">User</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedLog.user ? `${selectedLog.user.username} (${selectedLog.user.email})` : 'System'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Timestamp</label>
                <p className="mt-1 text-sm text-gray-900">{new Date(selectedLog.created_at).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">IP Address</label>
                <p className="mt-1 text-sm font-mono text-gray-900">{selectedLog.ip_address}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">User Agent</label>
                <p className="mt-1 text-sm text-gray-900 break-all">{selectedLog.user_agent}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Details</label>
                <pre className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-lg overflow-x-auto">
                  {JSON.stringify(JSON.parse(selectedLog.details), null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
