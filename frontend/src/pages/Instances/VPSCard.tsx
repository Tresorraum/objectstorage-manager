import React from 'react';
import {
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  CloudIcon,
  KeyIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { VPSInstance } from './types';

interface VPSCardProps {
  instance: VPSInstance;
  onEdit: (instance: VPSInstance) => void;
  onDelete: (id: number) => void;
}

export default function VPSCard({ instance, onEdit, onDelete }: VPSCardProps) {
  const isActive = instance.status === 'active';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-50 p-3 rounded-xl">
              <CloudIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{instance.name}</h3>
              <p className="text-sm text-gray-500">VPS Server</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isActive ? (
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
            ) : (
              <XCircleIcon className="h-5 w-5 text-red-500" />
            )}
            <span className={`text-xs font-medium ${isActive ? 'text-green-700' : 'text-red-700'}`}>
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Host:</span>
            <span className="font-mono text-gray-900">{instance.host}:{instance.port}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Username:</span>
            <span className="font-mono text-gray-900">{instance.username}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Auth:</span>
            <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded bg-purple-100 text-purple-700">
              {instance.auth_type === 'ssh_key' ? (
                <>
                  <KeyIcon className="h-3 w-3" />
                  SSH Key
                </>
              ) : (
                <>
                  <LockClosedIcon className="h-3 w-3" />
                  Password
                </>
              )}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Backup Path:</span>
            <span className="font-mono text-xs text-gray-900 truncate max-w-[200px]" title={instance.backup_path}>
              {instance.backup_path}
            </span>
          </div>
        </div>

        {instance.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {instance.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <span className="text-xs text-gray-500">
            Added {new Date(instance.created_at).toLocaleDateString()}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(instance)}
              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="Edit server"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(instance.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete server"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
