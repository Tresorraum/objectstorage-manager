import React from 'react';
import { ChartPieIcon, CheckCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { DashboardStats } from './types';

interface SecondaryStatsProps {
  stats: DashboardStats | undefined;
  backupSuccessRate: string;
}

export default function SecondaryStats({ stats, backupSuccessRate }: SecondaryStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-3">
          <ChartPieIcon className="h-8 w-8 opacity-80" />
          <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">Today</span>
        </div>
        <p className="text-sm opacity-90 mb-1">Completed Backups</p>
        <p className="text-3xl font-bold">{stats?.completedBackupsToday || 0}</p>
      </div>

      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-3">
          <CheckCircleIcon className="h-8 w-8 opacity-80" />
          <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">Success</span>
        </div>
        <p className="text-sm opacity-90 mb-1">Success Rate</p>
        <p className="text-3xl font-bold">{backupSuccessRate}%</p>
      </div>

      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-3">
          <ShieldCheckIcon className="h-8 w-8 opacity-80" />
          <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded-full">Active</span>
        </div>
        <p className="text-sm opacity-90 mb-1">Running Backups</p>
        <p className="text-3xl font-bold">{stats?.runningBackups || 0}</p>
      </div>
    </div>
  );
}
