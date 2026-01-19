import React from 'react';
import { CloudIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

export default function VPSBackupTab() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CloudIcon className="h-10 w-10 text-purple-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">VPS File Backups</h3>
        <p className="text-gray-600 mb-6">
          Backup files and folders from your VPS servers. This feature is coming soon!
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-purple-50 text-purple-700 rounded-lg">
          <RocketLaunchIcon className="h-5 w-5 mr-2" />
          <span className="text-sm font-medium">Coming Soon</span>
        </div>
      </div>
    </div>
  );
}
