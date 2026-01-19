import React from 'react';
import { SystemHealthMetric } from './types';
import { getHealthColor } from './utils';

interface SystemHealthProps {
  metrics: SystemHealthMetric[];
}

export default function SystemHealth({ metrics }: SystemHealthProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">System Health</h3>
      <div className="space-y-4">
        {metrics.map((metric) => (
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
  );
}
