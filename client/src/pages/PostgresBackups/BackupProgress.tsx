import React from 'react';
import { ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { formatBytes } from '../../utils/formatters';

interface BackupProgressProps {
  backup: {
    id: string;
    status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELED';
    backupSizeMb: number;
    createdAt: string;
  };
}

export default function BackupProgress({ backup }: BackupProgressProps) {
  const getElapsedTime = () => {
    const start = new Date(backup.createdAt).getTime();
    const now = Date.now();
    const elapsed = Math.floor((now - start) / 1000);

    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  if (backup.status !== 'IN_PROGRESS') {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="bg-blue-600 p-3 rounded-lg">
          <ArrowPathIcon className="h-6 w-6 text-white animate-spin" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Backup In Progress
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <ClockIcon className="h-4 w-4" />
              <span>Elapsed time: {getElapsedTime()}</span>
            </div>
            {backup.backupSizeMb > 0 && (
              <div className="text-sm text-blue-800">
                <span className="font-medium">Current size:</span>{' '}
                {formatBytes(backup.backupSizeMb * 1024 * 1024)}
              </div>
            )}
          </div>

          {/* Progress Animation */}
          <div className="mt-4">
            <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full animate-pulse w-full"></div>
            </div>
          </div>

          <p className="text-xs text-blue-700 mt-3">
            The backup is being created and streamed directly to storage. This may take
            several minutes depending on database size.
          </p>
        </div>
      </div>
    </div>
  );
}
