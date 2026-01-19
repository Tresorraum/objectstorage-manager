import React from 'react';
import { PlayIcon, TrashIcon, DocumentTextIcon, ServerIcon } from '@heroicons/react/24/outline';
import { BackupJob } from './types';
import { getStatusColor, getTypeColor } from './utils';

interface BackupTableProps {
  jobs: BackupJob[];
  selectedJobs: number[];
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onToggleSelection: (jobId: number) => void;
  onToggleAll: () => void;
  onSort: (field: string) => void;
  onRun: (id: number) => void;
  onViewHistory: (job: BackupJob) => void;
  onDelete: (id: number) => void;
  isRunning: boolean;
}

export default function BackupTable({
  jobs,
  selectedJobs,
  sortField,
  sortDirection,
  onToggleSelection,
  onToggleAll,
  onSort,
  onRun,
  onViewHistory,
  onDelete,
  isRunning,
}: BackupTableProps) {
  const SortableHeader = ({ field, label }: { field: string; label: string }) => (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortField === field && <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
      </div>
    </th>
  );

  return (
    <div className="hidden lg:block overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={selectedJobs.length === jobs.length && jobs.length > 0}
                onChange={onToggleAll}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
            </th>
            <SortableHeader field="name" label="Job Name" />
            <SortableHeader field="instance" label="Source" />
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Destination
            </th>
            <SortableHeader field="backup_type" label="Type" />
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Schedule
            </th>
            <SortableHeader field="status" label="Status" />
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Run
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {jobs.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-6 py-12 text-center">
                <ServerIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No backup jobs found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your filters or create a new backup job
                </p>
              </td>
            </tr>
          ) : (
            jobs.map((job) => (
              <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedJobs.includes(job.id)}
                    onChange={() => onToggleSelection(job.id)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{job.name}</div>
                      {!job.enabled && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 mt-1">
                          Disabled
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{job.rustfs_instance.name}</div>
                  <div className="text-xs text-gray-500">{job.source_bucket}</div>
                </td>
                <td className="px-6 py-4">
                  {job.backup_type === 'server' ? (
                    <div className="text-xs">
                      <div className="text-gray-900 font-mono">{job.destination_path}</div>
                    </div>
                  ) : (
                    <div className="text-xs">
                      <div className="text-gray-900">{job.destination_instance?.name || 'N/A'}</div>
                      <div className="text-gray-500">{job.destination_bucket}</div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(job.backup_type)}`}>
                    {job.backup_type === 'server' ? 'Server' : 'Bucket'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs font-mono text-gray-900">
                    {job.schedule || 'Manual'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(job.status)}`}>
                    {job.status === 'running' && (
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2 animate-pulse"></span>
                    )}
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-gray-500">
                  {job.last_run ? new Date(job.last_run).toLocaleString() : 'Never'}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onRun(job.id)}
                      disabled={isRunning || job.status === 'running'}
                      className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Run backup"
                    >
                      <PlayIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onViewHistory(job)}
                      className="text-gray-600 hover:text-gray-900"
                      title="View history"
                    >
                      <DocumentTextIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onDelete(job.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete job"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
