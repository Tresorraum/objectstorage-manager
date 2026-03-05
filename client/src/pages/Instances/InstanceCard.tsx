import React from 'react';
import {
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  CircleStackIcon,
} from '@heroicons/react/24/outline';
import { RustFSInstance } from './types';

interface InstanceCardProps {
  instance: RustFSInstance;
  onEdit: (instance: RustFSInstance) => void;
  onDelete: (id: number) => void;
}

export default function InstanceCard({ instance, onEdit, onDelete }: InstanceCardProps) {
  const isActive = instance.status === 'active';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-4 sm:p-6">
        {/* Header - Stack on mobile, row on desktop */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0 mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 p-2.5 sm:p-3 rounded-xl flex-shrink-0">
              <CircleStackIcon className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{instance.name}</h3>
              <p className="text-xs sm:text-sm text-gray-500">Object Storage</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:flex-shrink-0">
            {isActive ? (
              <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
            ) : (
              <XCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
            )}
            <span className={`text-xs font-medium ${isActive ? 'text-green-700' : 'text-red-700'}`}>
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Details - Stack on mobile */}
        <div className="space-y-2 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-sm">
            <span className="text-gray-500 text-xs sm:text-sm">Endpoint:</span>
            <span className="font-mono text-gray-900 text-xs break-all sm:truncate sm:max-w-[200px]" title={instance.endpoint}>
              {instance.endpoint}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-sm">
            <span className="text-gray-500 text-xs sm:text-sm">Region:</span>
            <span className="text-gray-900 text-xs sm:text-sm">{instance.region}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-sm">
            <span className="text-gray-500 text-xs sm:text-sm">SSL:</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded self-start sm:self-auto ${
              instance.ssl ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {instance.ssl ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        {/* Description */}
        {instance.description && (
          <p className="text-xs sm:text-sm text-gray-600 mb-4 line-clamp-2">
            {instance.description}
          </p>
        )}

        {/* Footer - Stack on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 pt-4 border-t border-gray-200">
          <span className="text-xs text-gray-500">
            Added {new Date(instance.created_at).toLocaleDateString()}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(instance)}
              className="flex-1 sm:flex-none p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Edit instance"
            >
              <PencilIcon className="h-4 w-4 mx-auto sm:mx-0" />
            </button>
            <button
              onClick={() => onDelete(instance.id)}
              className="flex-1 sm:flex-none p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete instance"
            >
              <TrashIcon className="h-4 w-4 mx-auto sm:mx-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
