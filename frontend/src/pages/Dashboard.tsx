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
  storageUsage: Array<{
    date: string;
    usage: number;
  }>;
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/dashboard/stats').then(res => res.data),
  });

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
          change="+2 from last month"
        />
        <StatsCard
          title="Total Storage"
          value={`${((stats?.totalStorage || 0) / (1024 ** 3)).toFixed(2)} GB`}
          icon={ChartBarIcon}
          color="green"
          change="+12% from last month"
        />
        <StatsCard
          title="Backup Jobs"
          value={stats?.totalBackups || 0}
          icon={CloudArrowUpIcon}
          color="purple"
          change="3 completed today"
        />
        <StatsCard
          title="Active Alerts"
          value={stats?.activeAlerts || 0}
          icon={ExclamationTriangleIcon}
          color="red"
          change="2 resolved today"
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
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    All Systems Operational
                  </p>
                  <p className="text-sm text-green-600">
                    99.9% uptime this month
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-800">
                    Backup Status
                  </p>
                  <p className="text-sm text-blue-600">
                    Last backup: 2 hours ago
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-800">
                    Performance
                  </p>
                  <p className="text-sm text-purple-600">
                    Avg response: 45ms
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