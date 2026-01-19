import React from 'react';
import { PencilIcon, TrashIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { RustFSInstance } from './types';

interface InstanceCardProps {
  instance: RustFSInstance;
  onEdit: (instance: RustFSInstance) => void;
  onDelete: (id: number) => void;
}

export default function InstanceCard({ instance, onEdit, onDelete }: InstanceCardProps) {
  return (
    <div className="card p-6 hover:border-indigo-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate mb-2">{instance.name}</h3>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            instance.status === 'active' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {instance.status === 'active' ? (
              <CheckCircleIcon className="h-3.5 w-3.5 mr-1.5" />
            ) : (
              <ExclamationTriangleIcon className="h-3.5 w-3.5 mr-1.5" />
            )}
            {instance.status}
          </span>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">
        {instance.description || 'No description provided'}
      </p>
      
      <div className="space-y-3 mb-6">
        <div className="flex items-start">
          <span className="text-xs font-medium text-gray-500 w-20 flex-shrink-0 pt-0.5">Endpoint</span>
          <span className="text-sm text-gray-900 font-mono break-all">{instance.endpoint}</span>
        </div>
        <div className="flex items-center">
          <span className="text-xs font-medium text-gray-500 w-20 flex-shrink-0">Region</span>
          <span className="text-sm text-gray-900">{instance.region}</span>
        </div>
        <div className="flex items-center">
          <span className="text-xs font-medium text-gray-500 w-20 flex-shrink-0">SSL</span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            instance.ssl ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}>
            {instance.ssl ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(instance)}
          className="flex-1 btn-secondary py-2 text-xs"
        >
          <PencilIcon className="h-4 w-4 mr-1.5" />
          Edit
        </button>
        <button
          onClick={() => onDelete(instance.id)}
          className="flex-1 btn-danger py-2 text-xs"
        >
          <TrashIcon className="h-4 w-4 mr-1.5" />
          Delete
        </button>
      </div>
    </div>
  );
}
