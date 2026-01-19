import React from 'react';
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { UpcomingBackup } from './types';

interface UpcomingBackupsProps {
  backups: UpcomingBackup[];
}

export default function UpcomingBackups({ backups }: UpcomingBackupsProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Upcoming Backups</h3>
        <CalendarIcon className="h-5 w-5 text-gray-400" />
      </div>
      <div className="space-y-3">
        {backups.map((backup) => (
          <div key={backup.id} className="p-3 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors">
            <p className="text-sm font-medium text-gray-900 mb-1">{backup.name}</p>
            <p className="text-xs text-gray-500 mb-2">{backup.instance}</p>
            <div className="flex items-center gap-1 text-xs text-indigo-600">
              <ClockIcon className="h-3.5 w-3.5" />
              {backup.schedule}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
