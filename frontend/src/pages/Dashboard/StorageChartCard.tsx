import React from 'react';
import StorageChart from '../../components/StorageChart';
import { DashboardStats } from './types';

interface StorageChartCardProps {
  stats: DashboardStats | undefined;
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

export default function StorageChartCard({ stats, timeRange, onTimeRangeChange }: StorageChartCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Storage Usage Trend</h3>
            <p className="text-sm text-gray-500 mt-1">Last 7 days performance</p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => onTimeRangeChange(e.target.value)}
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
  );
}
