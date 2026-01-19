import React from 'react';
import { MagnifyingGlassIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface BackupFiltersProps {
  searchQuery: string;
  statusFilter: string;
  typeFilter: string;
  selectedJobs: number[];
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onTypeFilterChange: (value: string) => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
}

export default function BackupFilters({
  searchQuery,
  statusFilter,
  typeFilter,
  selectedJobs,
  onSearchChange,
  onStatusFilterChange,
  onTypeFilterChange,
  onBulkDelete,
  onClearSelection,
}: BackupFiltersProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="sm:col-span-2">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, bucket, or instance..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <select
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <select
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="server">Server</option>
            <option value="bucket">Bucket</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedJobs.length > 0 && (
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-indigo-50 border border-indigo-200 rounded-lg p-3">
          <span className="text-sm font-medium text-indigo-900">
            {selectedJobs.length} job(s) selected
          </span>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={onBulkDelete}
              className="inline-flex items-center justify-center px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              Delete Selected
            </button>
            <button
              onClick={onClearSelection}
              className="inline-flex items-center justify-center px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
