import React from 'react';
import {
  ServerIcon,
  CircleStackIcon,
  CloudArrowUpIcon,
  BoltIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { DashboardStats } from './types';

interface PrimaryStatsProps {
  stats: DashboardStats | undefined;
  storageUsedTB: string;
  storageUsedGB: string;
  backupSuccessRate: string;
}

export default function PrimaryStats({ stats, storageUsedTB, storageUsedGB, backupSuccessRate }: PrimaryStatsProps) {
  return (
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
          <p className="text-3xl font-bold text-gray-900">{storageUsedTB} TB</p>
          <p className="text-xs text-gray-500 mt-1">{storageUsedGB} GB total</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-blue-50 p-3 rounded-xl">
            <CloudArrowUpIcon className="h-7 w-7 text-blue-600" />
          </div>
          <span className="text-xs font-medium text-green-600 flex items-center gap-1">
            <CheckCircleIcon className="h-4 w-4" />
            {backupSuccessRate}%
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
            Avg 4.2 min
          </span>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Active Sessions</p>
          <p className="text-3xl font-bold text-gray-900">{stats?.runningBackups || 0}</p>
          <p className="text-xs text-gray-500 mt-1">{stats?.runningBackups || 0} backups running</p>
        </div>
      </div>
    </div>
  );
}
