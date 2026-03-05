import React from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

interface EmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

export default function EmptyState({ hasFilters, onClearFilters }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
        <DocumentTextIcon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No activity logs found</h3>
      <p className="text-sm text-gray-500 mb-6">
        {hasFilters
          ? 'Try adjusting your filters or search query.'
          : 'Activity logs will appear here as actions are performed.'}
      </p>
      {hasFilters && (
        <button onClick={onClearFilters} className="btn-secondary">
          Clear Filters
        </button>
      )}
    </div>
  );
}
