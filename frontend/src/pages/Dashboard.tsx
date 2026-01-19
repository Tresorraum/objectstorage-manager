import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ChartBarIcon,
  ServerIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  PauseIcon,
  CircleStackIcon,
  CpuChipIcon,
  BoltIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  CalendarIcon,
  ChartPieIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import StatsCard from '../components/StatsCard';
import StorageChart from '../components/StorageChart';
import RecentBackups from '../components/RecentBackups';
import AlertsList from '../components/AlertsList';

interface DashboardStats {
  totalInstances: number;
  totalStorage: number;
  totalBackups: number;
  activeAlerts: number;
  completedBackupsToday: number;
  runningBackups: number;
  failedBackupsToday: number;
  lastBackupTime?: string;
  instancesChange: string;
  storageChange: string;
  backupsChange: string;
  alertsChange: string;
  storageUsage: Array<{
    date: string;
    usage: number;
  }>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('7d');

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/dashboard/stats').then(res => res.data),
    refetchInterval: 30000,
    staleTime: 25000,
  });

  // Mock data for enhanced features
  const quickStats = {
    storageUsed: 2.4,
    storageTotal: 10,
    backupSuccessRate: 98.2,
    avgBackupTime: 4.2,
    dataTransferred: 145.8,
    activeSessions: 3,
  };

  const recentActivity = [
    { id: 1, type: 'backup', name: 'Production S3 Backup', status: 'completed', time: '5 min ago', size: '2.3 GB' },
    { id: 2, type: 'instance', name: 'New instance added', status: 'success', time: '1 hour ago', size: null },
    { id: 3, type: 'backup', name: 'Staging Backup', status: 'running', time: 'In progress', size: '1.1 GB' },
    { id: 4, type: 'alert', name: 'Storage threshold warning', status: 'warning', time: '2 hours ago', size: null },
  ];

  const upcomingBackups = [
    { id: 1, name: 'Production Daily', schedule: 'Today at 2:00 AM', instance: 'AWS S3 Prod' },
    { id: 2, name: 'Development Weekly', schedule: 'Tomorrow at 3:00 AM', instance: 'MinIO Dev' },
    { id: 3, name: 'Staging Hourly', schedule: 'In 45 minutes', instance: 'RustFS Staging' },
  ];

  const systemHealth = [
    { name: 'API Response Time', value: '45ms', status: 'excellent', percentage: 95 },
    { name: 'Backup Success Rate', value: '98.2%', status: 'good', percentage: 98 },
    { name: 'Storage Efficiency', value: '87%', status: 'good', percentage: 87 },
    { name: 'System Uptime', value: '99.9%', status: 'excellent', percentage: 99 },
  ];

  const formatLastBackupTime = (lastBackupTime?: string) => {
    if (!lastBackupTime) return 'No recent backups';
    
    const backupDate = new Date(lastBackupTime);
    const now = new Date();
    const diffMs = now.getTime() - backupDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'backup':
        return CloudArrowUpIcon;
      case 'instance':
        return ServerIcon;
      case 'alert':
        return ExclamationTriangleIcon;
      default:
        return BoltIcon;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'success':
        return 'text-green-600 bg-green-50';
      case 'running':
        return 'text-blue-600 bg-blue-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-green-500';
      case 'good':
        return 'bg-blue-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header with Gradient */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <SparklesIcon className="h-6 w-6" />
              <span className="text-sm font-semibold uppercase tracking-wide opacity-90">Welcome Back</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {user?.username ? `Hello, ${user.username}!` : 'Dashboard'}
            </h1>
            <p className="text-indigo-100">
              Here's what's happening with your storage infrastructure today
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2">
              <PlayIcon className="h-5 w-5" />
              Run Backup
            </button>
            <button className="bg-white text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2">
              <ServerIcon className="h-5 w-5" />
              Add Instance
            </button>
          </div>
        </div>
      </div>

      {/* Primary Stats - Enhanced */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-indigo-50 p-3 rounded-xl">
              <ServerIcon className="h-7 w-7 text-indigo-600" />
            </div>
            <span className="text-xs font-medium text-green-600 flex items-center gap-1">
              <ArrowTrendingUpIcon className="h-4 w-4" />
              +2 this week
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Instances</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalInstances || 0}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-50 p-3 rounded-xl">
              <CircleStackIcon className="h-7 w-7 text-green-600" />
            </div>
            <span className="text-xs font-medium text-green-600 flex items-center gap-1">
              <ArrowTrendingUpIcon className="h-4 w-4" />
              +12.5%
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Storage Used</p>
            <p className="text-3xl font-bold text-gray-900">{quickStats.storageUsed} TB</p>
            <p className="text-xs text-gray-500 mt-1">of {quickStats.storageTotal} TB total</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-50 p-3 rounded-xl">
              <CloudArrowUpIcon className="h-7 w-7 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-green-600 flex items-center gap-1">
              <CheckCircleIcon className="h-4 w-4" />
              {quickStats.backupSuccessRate}%
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Backup Jobs</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalBackups || 0}</p>
            <p className="text-xs text-gray-500 mt-1">{stats?.completedBackupsToday || 0} completed today</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-50 p-3 rounded-xl">
              <BoltIcon className="h-7 w-7 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
              <ClockIcon className="h-4 w-4" />
              {quickStats.avgBackupTime} min
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Active Sessions</p>
            <p className="text-3xl font-bold text-gray-900">{quickStats.activeSessions}</p>
            <p className="text-xs text-gray-500 mt-1">{stats?.runningBackups || 0} backups running</p>
          </div>
        </div>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <ChartPieIcon className="h-8 w-8 opacity-80" />
            <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">Today</span>
          </div>
          <p className="text-sm opacity-90 mb-1">Data Transferred</p>
          <p className="text-3xl font-bold">{quickStats.dataTransferred} GB</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <CheckCircleIcon className="h-8 w-8 opacity-80" />
            <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">Success</span>
          </div>
          <p className="text-sm opacity-90 mb-1">Success Rate</p>
          <p className="text-3xl font-bold">{quickStats.backupSuccessRate}%</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <ShieldCheckIcon className="h-8 w-8 opacity-80" />
            <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">Protected</span>
          </div>
          <p className="text-sm opacity-90 mb-1">Encrypted Data</p>
          <p className="text-3xl font-bold">100%</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Storage Usage Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Storage Usage Trend</h3>
                  <p className="text-sm text-gray-500 mt-1">Last 7 days performance</p>
                </div>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="24h">24 Hours</option>
                  <option value="7d">7 Days</option>
                  <option value="30d">30 Days</option>
                  <option value="90d">90 Days</option>
                </select>
              </div>
            </div>
            <div className="p-6">
              <StorageChart data={stats?.storageUsage || []} />
            </div>
          </div>

          {/* System Health Metrics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">System Health</h3>
            <div className="space-y-4">
              {systemHealth.map((metric) => (
                <div key={metric.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{metric.name}</span>
                    <span className="text-sm font-bold text-gray-900">{metric.value}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getHealthColor(metric.status)}`}
                      style={{ width: `${metric.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Backups */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Backup Jobs</h3>
            </div>
            <div className="p-6">
              <RecentBackups />
            </div>
          </div>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors text-left">
                <div className="bg-indigo-600 p-2 rounded-lg">
                  <PlayIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Run Backup Now</div>
                  <div className="text-xs text-gray-500">Execute manual backup</div>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left">
                <div className="bg-green-600 p-2 rounded-lg">
                  <ServerIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Add Instance</div>
                  <div className="text-xs text-gray-500">Connect new storage</div>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left">
                <div className="bg-purple-600 p-2 rounded-lg">
                  <ChartBarIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">View Analytics</div>
                  <div className="text-xs text-gray-500">Detailed insights</div>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-lg ${getActivityColor(activity.status)}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{activity.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-500">{activity.time}</p>
                        {activity.size && (
                          <>
                            <span className="text-gray-300">•</span>
                            <p className="text-xs text-gray-500">{activity.size}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Backups */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Backups</h3>
              <CalendarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {upcomingBackups.map((backup) => (
                <div key={backup.id} className="p-3 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors">
                  <p className="text-sm font-medium text-gray-900 mb-1">{backup.name}</p>
                  <p className="text-xs text-gray-500 mb-2">{backup.instance}</p>
                  <div className="flex items-center gap-1 text-xs text-indigo-600">
                    <ClockIcon className="h-3.5 w-3.5" />
                    {backup.schedule}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Active Alerts</h3>
            </div>
            <div className="p-6">
              <AlertsList />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
