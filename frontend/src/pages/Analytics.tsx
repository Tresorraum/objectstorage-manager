import React, { useState } from 'react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CircleStackIcon,
  CloudArrowUpIcon,
  CurrencyDollarIcon,
  ClockIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

export default function Analytics() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('7d');

  const isPremium = user?.is_premium;

  // Mock data
  const stats = [
    {
      name: 'Total Storage Used',
      value: '2.4 TB',
      change: '+12.5%',
      trend: 'up',
      icon: CircleStackIcon,
      color: 'indigo',
    },
    {
      name: 'Backup Success Rate',
      value: '98.2%',
      change: '+2.1%',
      trend: 'up',
      icon: CloudArrowUpIcon,
      color: 'green',
    },
    {
      name: 'Monthly Cost',
      value: '$124.50',
      change: '-5.3%',
      trend: 'down',
      icon: CurrencyDollarIcon,
      color: 'blue',
    },
    {
      name: 'Avg Backup Time',
      value: '4.2 min',
      change: '-8.1%',
      trend: 'down',
      icon: ClockIcon,
      color: 'purple',
    },
  ];

  const storageByInstance = [
    { name: 'Production S3', usage: 1200, percentage: 50 },
    { name: 'Development MinIO', usage: 720, percentage: 30 },
    { name: 'Staging RustFS', usage: 480, percentage: 20 },
  ];

  const backupTrends = [
    { date: 'Mon', backups: 12, size: 145 },
    { date: 'Tue', backups: 15, size: 178 },
    { date: 'Wed', backups: 11, size: 132 },
    { date: 'Thu', backups: 18, size: 210 },
    { date: 'Fri', backups: 14, size: 165 },
    { date: 'Sat', backups: 8, size: 95 },
    { date: 'Sun', backups: 10, size: 118 },
  ];

  if (!isPremium) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-2 text-sm text-gray-600">
            Advanced analytics and insights for your storage infrastructure
          </p>
        </div>

        {/* Premium Upsell */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-start gap-6">
            <div className="bg-white/20 p-4 rounded-xl">
              <ChartBarIcon className="h-12 w-12" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <LockClosedIcon className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">Premium Feature</span>
              </div>
              <h2 className="text-2xl font-bold mb-3">Unlock Advanced Analytics</h2>
              <p className="text-indigo-100 mb-6 max-w-2xl">
                Get detailed insights into your storage usage, backup performance, cost optimization opportunities, and predictive analytics to help you make data-driven decisions.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="bg-white/20 p-2 rounded-lg mt-0.5">
                    <ChartBarIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">Real-time Metrics</div>
                    <div className="text-sm text-indigo-100">Live storage and backup statistics</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-white/20 p-2 rounded-lg mt-0.5">
                    <CurrencyDollarIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">Cost Analysis</div>
                    <div className="text-sm text-indigo-100">Track and optimize spending</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-white/20 p-2 rounded-lg mt-0.5">
                    <ArrowTrendingUpIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">Trend Forecasting</div>
                    <div className="text-sm text-indigo-100">Predict future storage needs</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-white/20 p-2 rounded-lg mt-0.5">
                    <CloudArrowUpIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">Performance Insights</div>
                    <div className="text-sm text-indigo-100">Optimize backup efficiency</div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => window.location.href = '/subscribe'}
                className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-2 text-sm text-gray-600">
            Monitor your storage infrastructure performance and costs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input-field py-2"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.trend === 'up';
          const TrendIcon = isPositive ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
          
          return (
            <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`bg-${stat.color}-50 p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendIcon className="h-4 w-4" />
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Storage by Instance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Storage by Instance</h3>
          <div className="space-y-4">
            {storageByInstance.map((instance) => (
              <div key={instance.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{instance.name}</span>
                  <span className="text-sm text-gray-600">{instance.usage} GB ({instance.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${instance.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Backup Trends */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Backup Activity (Last 7 Days)</h3>
          <div className="space-y-3">
            {backupTrends.map((day) => (
              <div key={day.date} className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-600 w-12">{day.date}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                        style={{ width: `${(day.backups / 20) * 100}%` }}
                      >
                        <span className="text-xs font-semibold text-white">{day.backups}</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 w-16">{day.size} GB</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Cost Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">$89.20</div>
            <div className="text-sm text-gray-600 mt-1">Storage Costs</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">$28.50</div>
            <div className="text-sm text-gray-600 mt-1">Transfer Costs</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">$6.80</div>
            <div className="text-sm text-gray-600 mt-1">API Requests</div>
          </div>
        </div>
      </div>
    </div>
  );
}
