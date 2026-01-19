import React from 'react';
import {
  XMarkIcon,
  DocumentTextIcon,
  ServerIcon,
  UserIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { AuditLog } from './types';
import {
  getStatusFromAction,
  getStatusColor,
  getActionIcon,
  getActionLabel,
  getResourceLabel,
} from './utils';
import StatusIcon from './StatusIcon';

interface LogDetailModalProps {
  log: AuditLog;
  onClose: () => void;
}

export default function LogDetailModal({ log, onClose }: LogDetailModalProps) {
  const status = getStatusFromAction(log.action, log.details);
  const ActionIcon = getActionIcon(log.action);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    toast.success('Log details copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white p-3 rounded-xl shadow-sm">
                <ActionIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Activity Log Details</h3>
                <p className="text-sm text-gray-600 mt-0.5">
                  {getActionLabel(log.action)} • {getResourceLabel(log.resource)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-white rounded-lg transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                  Action Type
                </label>
                <div className="flex items-center gap-2">
                  <ActionIcon className="h-5 w-5 text-gray-600" />
                  <p className="text-base font-semibold text-gray-900">{getActionLabel(log.action)}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                  Resource
                </label>
                <div className="flex items-center gap-2">
                  <ServerIcon className="h-5 w-5 text-gray-600" />
                  <p className="text-base font-semibold text-gray-900">
                    {getResourceLabel(log.resource)}
                    {log.resource_id && (
                      <span className="ml-2 text-sm text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                        #{log.resource_id}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                  Status
                </label>
                <div className="flex items-center gap-2">
                  <StatusIcon status={status} />
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(status)}`}>
                    {status}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                  User
                </label>
                {log.user ? (
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 p-2 rounded-full">
                      <UserIcon className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-gray-900">{log.user.username}</p>
                      <p className="text-sm text-gray-600">{log.user.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-200 p-2 rounded-full">
                      <ServerIcon className="h-5 w-5 text-gray-600" />
                    </div>
                    <p className="text-base font-semibold text-gray-900 italic">System</p>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                  Timestamp
                </label>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-base font-semibold text-gray-900">
                      {new Date(log.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(log.created_at).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                  IP Address
                </label>
                <p className="text-base font-mono font-semibold text-gray-900 bg-white px-3 py-2 rounded-lg border border-gray-200">
                  {log.ip_address}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">
                User Agent
              </label>
              <p className="text-sm text-gray-900 bg-white px-3 py-2 rounded-lg border border-gray-200 break-all">
                {log.user_agent}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block flex items-center gap-2">
                <DocumentTextIcon className="h-4 w-4" />
                Event Details (JSON)
              </label>
              <pre className="text-sm text-gray-900 bg-white p-4 rounded-lg overflow-x-auto border border-gray-200 font-mono">
                {JSON.stringify(JSON.parse(log.details), null, 2)}
              </pre>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
          <button onClick={handleCopy} className="btn-primary">
            Copy Details
          </button>
        </div>
      </div>
    </div>
  );
}
