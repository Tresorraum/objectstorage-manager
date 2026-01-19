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
  XMarkIcon,
  CalendarIcon,
  FunnelIcon as FilterIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
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
  const [limit, setLimit] = useState(20);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [showFilters, setShowFilters] = useState(true);

  const isPremium = user?.is_premium;

  const { data: logsData, isLoading, refetch, isFetching } = useQuery<LogsResponse>({
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
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
    toast.success('Exporting audit logs...');
  };

  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= (logsData?.pages || 1)) {
      setPage(pageNum);
    }
  };

  const renderPagination = () => {
    if (!logsData || logsData.pages <= 1) return null;

    const pages = [];
    const maxVisible = 7;
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = Math.min(logsData.pages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => goToPage(1)}
          disabled={page === 1}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="First page"
        >
          <ChevronDoubleLeftIcon className="h-4 w-4" />
        </button>
        <button
          onClick={() => goToPage(page - 1)}
          disabled={page === 1}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Previous page"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => goToPage(1)}
              className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              1
            </button>
            {startPage > 2 && <span className="text-gray-400">...</span>}
          </>
        )}

        {pages.map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => goToPage(pageNum)}
            className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
              pageNum === page
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            {pageNum}
          </button>
        ))}

        {endPage < logsData.pages && (
          <>
            {endPage < logsData.pages - 1 && <span className="text-gray-400">...</span>}
            <button
              onClick={() => goToPage(logsData.pages)}
              className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              {logsData.pages}
            </button>
          </>
        )}

        <button
          onClick={() => goToPage(page + 1)}
          disabled={page >= logsData.pages}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Next page"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
        <button
          onClick={() => goToPage(logsData.pages)}
          disabled={page >= logsData.pages}
          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Last page"
        >
          <ChevronDoubleRightIcon className="h-4 w-4" />
        </button>
      </div>
    );
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
          <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <DocumentTextIcon className="h-4 w-4" />
              <span>{logsData?.total || 0} total events</span>
            </div>
            {isFetching && (
              <div className="flex items-center gap-1 text-indigo-600">
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                <span>Syncing...</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
              title="Table view"
            >
              <ListBulletIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'cards' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
              title="Card view"
            >
              <Squares2X2Icon className="h-5 w-5" />
            </button>
          </div>
          <button
            onClick={() => refetch()}
            className="btn-secondary flex items-center gap-2"
            disabled={isFetching}
          >
            <ArrowPathIcon className={`h-5 w-5 ${isFetching ? 'animate-spin' : ''}`} />
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <FilterIcon className="h-5 w-5" />
              Filters & Search
            </h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              {showFilters ? 'Hide' : 'Show'}
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by IP, details..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Action</label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
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
                <label className="block text-xs font-medium text-gray-700 mb-1">Resource</label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
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

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Per Page</label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-sm text-gray-600">Loading activity logs...</p>
          </div>
        ) : logsData && logsData.logs.length > 0 ? (
          <>
            {viewMode === 'table' ? (
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
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                                {status}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="bg-gray-100 p-2 rounded-lg">
                                <ActionIcon className="h-4 w-4 text-gray-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{getActionLabel(log.action)}</div>
                                <div className="text-xs text-gray-500 max-w-xs truncate">{getDetailsPreview(log.details, log.action)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <span className="text-sm font-medium text-gray-900">{getResourceLabel(log.resource)}</span>
                              {log.resource_id && (
                                <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">#{log.resource_id}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {log.user ? (
                                <>
                                  <div className="bg-indigo-100 p-1.5 rounded-full">
                                    <UserIcon className="h-3.5 w-3.5 text-indigo-600" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{log.user.username}</div>
                                    <div className="text-xs text-gray-500">{log.user.email}</div>
                                  </div>
                                </>
                              ) : (
                                <span className="text-sm text-gray-500 italic flex items-center gap-1">
                                  <ServerIcon className="h-4 w-4" />
                                  System
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <ClockIcon className="h-4 w-4" />
                              {formatTimestamp(log.created_at)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded">{log.ip_address}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => setSelectedLog(log)}
                              className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="View details"
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
            ) : (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {logsData.logs.map((log) => {
                  const status = getStatusFromAction(log.action, log.details);
                  const ActionIcon = getActionIcon(log.action);
                  return (
                    <div
                      key={log.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="bg-gray-100 p-2 rounded-lg">
                            <ActionIcon className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{getActionLabel(log.action)}</div>
                            <div className="text-xs text-gray-500">{getResourceLabel(log.resource)}</div>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                          {status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{getDetailsPreview(log.details, log.action)}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          {log.user ? (
                            <>
                              <UserIcon className="h-3.5 w-3.5" />
                              {log.user.username}
                            </>
                          ) : (
                            <>
                              <ServerIcon className="h-3.5 w-3.5" />
                              System
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <ClockIcon className="h-3.5 w-3.5" />
                          {formatTimestamp(log.created_at)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-700">
                  Showing <span className="font-semibold">{((page - 1) * limit) + 1}</span> to{' '}
                  <span className="font-semibold">{Math.min(page * limit, logsData.total)}</span> of{' '}
                  <span className="font-semibold">{logsData.total}</span> results
                </p>
                {renderPagination()}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <DocumentTextIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activity logs found</h3>
            <p className="text-sm text-gray-500 mb-6">
              {searchQuery || filterAction !== 'all' || filterResource !== 'all'
                ? 'Try adjusting your filters or search query.'
                : 'Activity logs will appear here as actions are performed.'}
            </p>
            {(searchQuery || filterAction !== 'all' || filterResource !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterAction('all');
                  setFilterResource('all');
                  setPage(1);
                }}
                className="btn-secondary"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-3 rounded-xl shadow-sm">
                    {(() => {
                      const ActionIcon = getActionIcon(selectedLog.action);
                      return <ActionIcon className="h-6 w-6 text-indigo-600" />;
                    })()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Activity Log Details</h3>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {getActionLabel(selectedLog.action)} • {getResourceLabel(selectedLog.resource)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-white rounded-lg transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                      Action Type
                    </label>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const ActionIcon = getActionIcon(selectedLog.action);
                        return <ActionIcon className="h-5 w-5 text-gray-600" />;
                      })()}
                      <p className="text-base font-semibold text-gray-900">{getActionLabel(selectedLog.action)}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                      Resource
                    </label>
                    <div className="flex items-center gap-2">
                      <ServerIcon className="h-5 w-5 text-gray-600" />
                      <p className="text-base font-semibold text-gray-900">
                        {getResourceLabel(selectedLog.resource)}
                        {selectedLog.resource_id && (
                          <span className="ml-2 text-sm text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                            #{selectedLog.resource_id}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                      Status
                    </label>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(getStatusFromAction(selectedLog.action, selectedLog.details))}
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(getStatusFromAction(selectedLog.action, selectedLog.details))}`}>
                        {getStatusFromAction(selectedLog.action, selectedLog.details)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                      User
                    </label>
                    {selectedLog.user ? (
                      <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-full">
                          <UserIcon className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-base font-semibold text-gray-900">{selectedLog.user.username}</p>
                          <p className="text-sm text-gray-600">{selectedLog.user.email}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="bg-gray-200 p-2 rounded-full">
                          <ServerIcon className="h-5 w-5 text-gray-600" />
                        </div>
                        <p className="text-base font-semibold text-gray-900 italic">System</p>
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                      Timestamp
                    </label>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="text-base font-semibold text-gray-900">
                          {new Date(selectedLog.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(selectedLog.created_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                      IP Address
                    </label>
                    <p className="text-base font-mono font-semibold text-gray-900 bg-white px-3 py-2 rounded-lg border border-gray-200">
                      {selectedLog.ip_address}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">
                    User Agent
                  </label>
                  <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded-lg border border-gray-200 break-all">
                    {selectedLog.user_agent}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block flex items-center gap-2">
                    <DocumentTextIcon className="h-4 w-4" />
                    Event Details (JSON)
                  </label>
                  <pre className="text-sm text-gray-900 bg-white p-4 rounded-lg overflow-x-auto border border-gray-200 font-mono">
                    {JSON.stringify(JSON.parse(selectedLog.details), null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setSelectedLog(null)}
                className="btn-secondary"
              >
                Close
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(selectedLog, null, 2));
                  toast.success('Log details copied to clipboard!');
                }}
                className="btn-primary"
              >
                Copy Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
