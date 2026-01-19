import React from 'react';
import { ClockIcon, UserIcon, ServerIcon, EyeIcon } from '@heroicons/react/24/outline';
import { AuditLog } from './types';
import {
  getStatusFromAction,
  getStatusColor,
  getActionIcon,
  getActionLabel,
  getResourceLabel,
  formatTimestamp,
  getDetailsPreview,
} from './utils';
import StatusIcon from './StatusIcon';

interface LogsTableProps {
  logs: AuditLog[];
  onViewDetails: (log: AuditLog) => void;
}

export default function LogsTable({ logs, onViewDetails }: LogsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Action
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Resource
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              IP Address
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {logs.map((log) => {
            const status = getStatusFromAction(log.action, log.details);
            const ActionIcon = getActionIcon(log.action);
            return (
              <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <StatusIcon status={status} />
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                      {status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-gray-100 p-2 rounded-lg">
                      <ActionIcon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{getActionLabel(log.action)}</div>
                      <div className="text-xs text-gray-500 max-w-xs truncate">{getDetailsPreview(log.details, log.action)}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{getResourceLabel(log.resource)}</span>
                    {log.resource_id && (
                      <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">#{log.resource_id}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {log.user ? (
                      <>
                        <div className="bg-indigo-100 p-1.5 rounded-full">
                          <UserIcon className="h-3.5 w-3.5 text-indigo-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{log.user.username}</div>
                          <div className="text-xs text-gray-500">{log.user.email}</div>
                        </div>
                      </>
                    ) : (
                      <span className="text-sm text-gray-500 italic flex items-center gap-1">
                        <ServerIcon className="h-4 w-4" />
                        System
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <ClockIcon className="h-4 w-4" />
                    {formatTimestamp(log.created_at)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded">{log.ip_address}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => onViewDetails(log)}
                    className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="View details"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
