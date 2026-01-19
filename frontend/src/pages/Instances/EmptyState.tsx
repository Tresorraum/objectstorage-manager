import React from 'react';
import { PlusIcon, CircleStackIcon } from '@heroicons/react/24/outline';

interface EmptyStateProps {
  onAddInstance: () => void;
}

export default function EmptyState({ onAddInstance }: EmptyStateProps) {
  return (
    <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
        <CircleStackIcon className="h-8 w-8 text-indigo-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No instances yet</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
        Get started by creating your first storage instance to manage your S3-compatible storage.
      </p>
      <button onClick={onAddInstance} className="btn-primary">
        <PlusIcon className="h-5 w-5 mr-2" />
        Add Your First Instance
      </button>
    </div>
  );
}
