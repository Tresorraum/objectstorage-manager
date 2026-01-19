import React from 'react';
import {
  DocumentTextIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  ListBulletIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import { ViewMode } from './types';

interface LogsHeaderProps {
  totalLogs: number;
  isFetching: boolean;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onRefresh: () => void;
  onExport: () => void;
}

export default function LogsHeader({
  totalLogs,
  isFetching,
  viewMode,
  onViewModeChange,
  onRefresh,
  onExport,
}: LogsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
        <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <DocumentTextIcon className="h-4 w-4" />
            <span>{totalLogs} total events</span>
          </div>
          {isFetching && (
            <div className="flex items-center gap-1 text-indigo-600">
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
              <span>Syncing...</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onViewModeChange('table')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'table' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
            }`}
            title="Table view"
          >
            <ListBulletIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => onViewModeChange('cards')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'cards' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
            }`}
            title="Card view"
          >
            <Squares2X2Icon className="h-5 w-5" />
          </button>
        </div>
        <button
          onClick={onRefresh}
          className="btn-secondary flex items-center gap-2"
          disabled={isFetching}
        >
          <ArrowPathIcon className={`h-5 w-5 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
        <button
          onClick={onExport}
          className="btn-primary flex items-center gap-2"
        >
          <ArrowDownTrayIcon className="h-5 w-5" />
          Export
        </button>
      </div>
    </div>
  );
}
