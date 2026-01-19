import React from 'react';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

interface LogsFiltersProps {
  searchQuery: string;
  filterAction: string;
  filterResource: string;
  limit: number;
  showFilters: boolean;
  onSearchChange: (value: string) => void;
  onActionChange: (value: string) => void;
  onResourceChange: (value: string) => void;
  onLimitChange: (value: number) => void;
  onToggleFilters: () => void;
}

export default function LogsFilters({
  searchQuery,
  filterAction,
  filterResource,
  limit,
  showFilters,
  onSearchChange,
  onActionChange,
  onResourceChange,
  onLimitChange,
  onToggleFilters,
}: LogsFiltersProps) {
  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <FunnelIcon className="h-5 w-5" />
          Filters & Search
        </h3>
        <button
          onClick={onToggleFilters}
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          {showFilters ? 'Hide' : 'Show'}
        </button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by IP, details..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Action</label>
            <select
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              value={filterAction}
              onChange={(e) => onActionChange(e.target.value)}
            >
              <option value="all">All Actions</option>
              <option value="login">Login</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="backup_run">Backup Run</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Resource</label>
            <select
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              value={filterResource}
              onChange={(e) => onResourceChange(e.target.value)}
            >
              <option value="all">All Resources</option>
              <option value="authentication">Authentication</option>
              <option value="instance">Instances</option>
              <option value="backup_job">Backup Jobs</option>
              <option value="user">Users</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Per Page</label>
            <select
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
