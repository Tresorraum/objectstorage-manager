import { useQuery } from '@tanstack/react-query';
import {
  ChartBarIcon,
  ServerIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

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
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/dashboard/stats').then(res => res.data),
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 25000, // Consider data stale after 25 seconds
  });

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your RustFS infrastructure
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Instances"
          value={stats?.totalInstances || 0}
          icon={ServerIcon}
          color="blue"
          change={stats?.instancesChange || "No change"}
        />
        <StatsCard
          title="Total Storage"
          value={`${((stats?.totalStorage || 0) / (1024 ** 3)).toFixed(2)} GB`}
          icon={ChartBarIcon}
          color="green"
          change={stats?.storageChange || "No change"}
        />
        <StatsCard
          title="Backup Jobs"
          value={stats?.totalBackups || 0}
          icon={CloudArrowUpIcon}
          color="purple"
          change={`${stats?.completedBackupsToday || 0} completed today`}
        />
        <StatsCard
          title="Active Alerts"
          value={stats?.activeAlerts || 0}
          icon={ExclamationTriangleIcon}
          color="red"
          change={stats?.alertsChange || "No change"}
        />
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Storage Usage Chart */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Storage Usage Trend
            </h3>
            <StorageChart data={stats?.storageUsage || []} />
          </div>
        </div>

        {/* Recent Backups */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Backup Jobs
            </h3>
            <RecentBackups />
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Alerts
          </h3>
          <AlertsList />
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            System Health
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-3 h-3 rounded-full ${
                    (stats?.runningBackups || 0) > 0 ? 'bg-yellow-400' : 'bg-green-400'
                  }`}></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    {(stats?.runningBackups || 0) > 0 ? 'Backups Running' : 'All Systems Operational'}
                  </p>
                  <p className="text-sm text-green-600">
                    {(stats?.runningBackups || 0) > 0 
                      ? `${stats?.runningBackups} backup${(stats?.runningBackups || 0) > 1 ? 's' : ''} in progress`
                      : 'All services running normally'
                    }
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-3 h-3 rounded-full ${
                    stats?.lastBackupTime ? 'bg-blue-400' : 'bg-gray-400'
                  }`}></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-800">
                    Backup Status
                  </p>
                  <p className="text-sm text-blue-600">
                    Last backup: {formatLastBackupTime(stats?.lastBackupTime)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-3 h-3 rounded-full ${
                    (stats?.failedBackupsToday || 0) > 0 ? 'bg-red-400' : 'bg-purple-400'
                  }`}></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-800">
                    Today's Status
                  </p>
                  <p className="text-sm text-purple-600">
                    {(stats?.failedBackupsToday || 0) > 0 
                      ? `${stats?.failedBackupsToday} failed backup${(stats?.failedBackupsToday || 0) > 1 ? 's' : ''}`
                      : `${stats?.completedBackupsToday || 0} successful backup${(stats?.completedBackupsToday || 0) !== 1 ? 's' : ''}`
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}