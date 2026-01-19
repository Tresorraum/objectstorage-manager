import React from 'react';
import { PlayIcon, TrashIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { BackupJob } from './types';
import { getStatusColor, getTypeColor } from './utils';

interface BackupMobileCardProps {
  job: BackupJob;
  isSelected: boolean;
  onToggleSelection: (jobId: number) => void;
  onRun: (id: number) => void;
  onViewHistory: (job: BackupJob) => void;
  onDelete: (id: number) => void;
  isRunning: boolean;
}

export default function BackupMobileCard({
  job,
  isSelected,
  onToggleSelection,
  onRun,
  onViewHistory,
  onDelete,
  isRunning,
}: BackupMobileCardProps) {
  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelection(job.id)}
            className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{job.name}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(job.status)}`}>
                {job.status === 'running' && (
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2 animate-pulse"></span>
                )}
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getTypeColor(job.backup_type)}`}>
                {job.backup_type === 'server' ? 'Server' : 'Bucket'}
              </span>
              {!job.enabled && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  Disabled
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="ml-7 space-y-2 text-xs">
        <div className="flex items-center text-gray-600">
          <span className="font-medium w-20">Source:</span>
          <span className="text-gray-900">{job.rustfs_instance.name} / {job.source_bucket}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <span className="font-medium w-20">Schedule:</span>
          <span className="font-mono text-gray-900">{job.schedule || 'Manual'}</span>
        </div>
        {job.last_run && (
          <div className="flex items-center text-gray-600">
            <span className="font-medium w-20">Last Run:</span>
            <span className="text-gray-900">{new Date(job.last_run).toLocaleString()}</span>
          </div>
        )}
      </div>

      <div className="ml-7 mt-3 flex gap-2">
        <button
          onClick={() => onRun(job.id)}
          disabled={isRunning || job.status === 'running'}
          className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <PlayIcon className="h-4 w-4 mr-1" />
          Run
        </button>
        <button
          onClick={() => onViewHistory(job)}
          className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <DocumentTextIcon className="h-4 w-4 mr-1" />
          History
        </button>
        <button
          onClick={() => onDelete(job.id)}
          className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
