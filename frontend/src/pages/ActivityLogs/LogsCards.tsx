import React from 'react';
import { ClockIcon, UserIcon, ServerIcon } from '@heroicons/react/24/outline';
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

interface LogsCardsProps {
  logs: AuditLog[];
  onViewDetails: (log: AuditLog) => void;
}

export default function LogsCards({ logs, onViewDetails }: LogsCardsProps) {
  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {logs.map((log) => {
        const status = getStatusFromAction(log.action, log.details);
        const ActionIcon = getActionIcon(log.action);
        return (
          <div
            key={log.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onViewDetails(log)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <ActionIcon className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{getActionLabel(log.action)}</div>
                  <div className="text-xs text-gray-500">{getResourceLabel(log.resource)}</div>
                </div>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                {status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{getDetailsPreview(log.details, log.action)}</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-1">
                {log.user ? (
                  <>
                    <UserIcon className="h-3.5 w-3.5" />
                    {log.user.username}
                  </>
                ) : (
                  <>
                    <ServerIcon className="h-3.5 w-3.5" />
                    System
                  </>
                )}
              </div>
              <div className="flex items-center gap-1">
                <ClockIcon className="h-3.5 w-3.5" />
                {formatTimestamp(log.created_at)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
