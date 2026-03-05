import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface UpgradeModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function UpgradeModal({ onConfirm, onCancel }: UpgradeModalProps) {
  return (
    <div className="text-center py-6">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
        <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Instance Limit Reached</h3>
      <p className="text-sm text-gray-600 mb-6">
        Free users can only create 1 instance. Upgrade to premium for unlimited instances and more features!
      </p>
      <div className="flex gap-3 justify-center">
        <button onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button onClick={onConfirm} className="btn-primary">
          Upgrade to Premium
        </button>
      </div>
    </div>
  );
}
