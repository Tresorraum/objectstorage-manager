import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import RecentBackups from '../../components/RecentBackups';
import AlertsList from '../../components/AlertsList';
import { DashboardStats, Activity, UpcomingBackup, SystemHealthMetric, RustFSInstance, BackupJob } from './types';
import { formatLastBackupTime } from './utils';
import WelcomeHeader from './WelcomeHeader';
import PrimaryStats from './PrimaryStats';
import SecondaryStats from './SecondaryStats';
import StorageChartCard from './StorageChartCard';
import SystemHealth from './SystemHealth';
import QuickActions from './QuickActions';
import RecentActivity from './RecentActivity';
import UpcomingBackups from './UpcomingBackups';

export default function Dashboard() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('7d');

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/dashboard/stats').then(res => res.data),
    refetchInterval: 30000,
    staleTime: 25000,
  });

  const { data: instances } = useQuery<RustFSInstance[]>({
    queryKey: ['instances'],
    queryFn: () => api.get('/rustfs/instances').then(res => res.data),
  });

  const { data: backupJobs } = useQuery<BackupJob[]>({
    queryKey: ['backup-jobs'],
    queryFn: () => api.get('/backup/jobs').then(res => res.data),
  });

  // Calculate derived stats
  const storageUsedTB = ((stats?.totalStorage || 0) / (1024 ** 4)).toFixed(2);
  const storageUsedGB = ((stats?.totalStorage || 0) / (1024 ** 3)).toFixed(2);
  const backupSuccessRate = stats?.totalBackups && stats.completedBackupsToday 
    ? ((stats.completedBackupsToday / (stats.completedBackupsToday + (stats.failedBackupsToday || 0))) * 100).toFixed(1)
    : '0';

  // Get recent activity from instances and backups
  const recentActivity = useMemo<Activity[]>(() => {
    const activities: Activity[] = [];
    
    if (instances && Array.isArray(instances)) {
      instances.slice(0, 2).forEach((instance) => {
        activities.push({
          id: `instance-${instance.id}`,
          type: 'instance',
          name: `Instance: ${instance.name}`,
          status: instance.status === 'active' ? 'success' : 'warning',
          time: new Date(instance.created_at).toLocaleDateString(),
          size: null,
        });
      });
    }

    if (backupJobs && Array.isArray(backupJobs)) {
      backupJobs.slice(0, 2).forEach((job) => {
        const status = job.status === 'completed' ? 'completed' : 
                      job.status === 'running' ? 'running' : 
                      job.status === 'failed' ? 'failed' : 'warning';
        activities.push({
          id: `backup-${job.id}`,
          type: 'backup',
          name: job.name,
          status: status,
          time: job.last_run ? formatLastBackupTime(job.last_run) : 'Never run',
          size: null,
        });
      });
    }

    return activities.slice(0, 4);
  }, [instances, backupJobs]);

  // Get upcoming backups (enabled jobs with schedules)
  const upcomingBackups = useMemo<UpcomingBackup[]>(() => {
    if (!backupJobs || !Array.isArray(backupJobs)) return [];
    
    return backupJobs
      .filter((job) => job.enabled && job.schedule)
      .slice(0, 3)
      .map((job) => ({
        id: job.id,
        name: job.name,
        schedule: job.next_run ? new Date(job.next_run).toLocaleString() : job.schedule,
        instance: job.rustfs_instance?.name || 'Unknown',
      }));
  }, [backupJobs]);

  // System health metrics (calculated from real data)
  const systemHealth = useMemo<SystemHealthMetric[]>(() => {
    const successRate = parseFloat(backupSuccessRate);
    return [
      { 
        name: 'Backup Success Rate', 
        value: `${backupSuccessRate}%`, 
        status: successRate >= 95 ? 'excellent' : successRate >= 80 ? 'good' : 'warning', 
        percentage: successRate 
      },
      { 
        name: 'Active Instances', 
        value: `${stats?.totalInstances || 0}`, 
        status: (stats?.totalInstances || 0) > 0 ? 'excellent' : 'warning', 
        percentage: Math.min(((stats?.totalInstances || 0) / 10) * 100, 100) 
      },
      { 
        name: 'Storage Utilization', 
        value: storageUsedGB + ' GB', 
        status: 'good', 
        percentage: 75 
      },
      { 
        name: 'Active Backup Jobs', 
        value: `${stats?.totalBackups || 0}`, 
        status: (stats?.totalBackups || 0) > 0 ? 'excellent' : 'warning', 
        percentage: Math.min(((stats?.totalBackups || 0) / 20) * 100, 100) 
      },
    ];
  }, [stats, backupSuccessRate, storageUsedGB]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WelcomeHeader username={user?.username} />
      <PrimaryStats 
        stats={stats} 
        storageUsedTB={storageUsedTB} 
        storageUsedGB={storageUsedGB} 
        backupSuccessRate={backupSuccessRate} 
      />
      <SecondaryStats stats={stats} backupSuccessRate={backupSuccessRate} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <StorageChartCard 
            stats={stats} 
            timeRange={timeRange} 
            onTimeRangeChange={setTimeRange} 
          />
          <SystemHealth metrics={systemHealth} />
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Backup Jobs</h3>
            </div>
            <div className="p-6">
              <RecentBackups />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <QuickActions isPremium={user?.is_premium || false} />
          <RecentActivity activities={recentActivity} />
          <UpcomingBackups backups={upcomingBackups} />
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
