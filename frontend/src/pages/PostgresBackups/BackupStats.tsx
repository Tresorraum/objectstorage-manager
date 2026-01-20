import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { api } from '../../services/api';
import { formatBytes, formatDuration } from '../../utils/formatters';

interface BackupStatsProps {
  databaseId: string;
}

interface Backup {
  id: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELED';
  backupSizeMb: number;
  backupDurationMs: number;
  createdAt: string;
}

export default function BackupStats({ databaseId }: BackupStatsProps) {
  const { data: backupsData, isLoading } = useQuery({
    queryKey: ['postgres-backups-stats', databaseId],
    queryFn: () =>
      api
        .get('/backups', {
          params: {
            database_id: databaseId,
            limit: 100, // Get more for stats
            offset: 0,
          },
        })
        .then((res) => res.data),
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const backups: Backup[] = backupsData?.backups || [];

  // Calculate statistics
  const totalBackups = backups.length;
  const completedBackups = backups.filter((b) => b.status === 'COMPLETED').length;
  const failedBackups = backups.filter((b) => b.status === 'FAILED').length;
  const successRate =
    totalBackups > 0 ? ((completedBackups / totalBackups) * 100).toFixed(1) : '0';

  const totalSize = backups
    .filter((b) => b.status === 'COMPLETED')
    .reduce((sum, b) => sum + b.backupSizeMb, 0);

  const avgDuration =
    completedBackups > 0
      ? backups
          .filter((b) => b.status === 'COMPLETED' && b.backupDurationMs > 0)
          .reduce((sum, b) => sum + b.backupDurationMs, 0) / completedBackups
      : 0;

  const lastBackup = backups.find((b) => b.status === 'COMPLETED');
  const lastBackupDate = lastBackup
    ? new Date(lastBackup.createdAt).toLocaleDateString()
    : 'Never';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <ChartBarIcon className="h-5 w-5 text-blue-600" />
        Backup Statistics
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Backups */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ChartBarIcon className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Total</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">{totalBackups}</p>
          <p className="text-xs text-blue-700 mt-1">All backups</p>
        </div>

        {/* Success Rate */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Success</span>
          </div>
          <p className="text-2xl font-bold text-green-900">{successRate}%</p>
          <p className="text-xs text-green-700 mt-1">
            {completedBackups} completed
          </p>
        </div>

        {/* Failed Backups */}
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircleIcon className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-red-900">Failed</span>
          </div>
          <p className="text-2xl font-bold text-red-900">{failedBackups}</p>
          <p className="text-xs text-red-700 mt-1">Backup failures</p>
        </div>

        {/* Total Size */}
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowTrendingUpIcon className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Size</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">
            {formatBytes(totalSize * 1024 * 1024, 0)}
          </p>
          <p className="text-xs text-purple-700 mt-1">Total storage</p>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <ClockIcon className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">Average Duration</p>
            <p className="text-sm text-gray-600">
              {avgDuration > 0 ? formatDuration(avgDuration) : 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <CheckCircleIcon className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">Last Backup</p>
            <p className="text-sm text-gray-600">{lastBackupDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
