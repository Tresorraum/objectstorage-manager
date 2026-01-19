import React from 'react';
import { ServerIcon, CheckIcon } from '@heroicons/react/24/outline';

interface EnterpriseModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export default function EnterpriseModal({ onConfirm, onCancel }: EnterpriseModalProps) {
  return (
    <div className="space-y-6">
      {/* Icon */}
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
          <ServerIcon className="h-8 w-8 text-indigo-600" />
        </div>
      </div>

      {/* Message */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Server Storage Backup
        </h3>
        <p className="text-sm text-gray-600">
          Server storage backups are available with our Premium plan. Upgrade now to unlock this feature along with many other benefits.
        </p>
      </div>

      {/* Features */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Premium Features Include:</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <CheckIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
            <span>Unlimited server storage backups</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
            <span>Advanced compression options</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
            <span>Priority support</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
            <span>Custom retention policies</span>
          </li>
        </ul>
      </div>

      {/* Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          <strong>Note:</strong> Bucket-to-bucket backups remain free for all users.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button onClick={onCancel} className="btn-secondary flex-1">
          Cancel
        </button>
        <button onClick={onConfirm} className="btn-primary flex-1">
          View Premium Plans
        </button>
      </div>
    </div>
  );
}
