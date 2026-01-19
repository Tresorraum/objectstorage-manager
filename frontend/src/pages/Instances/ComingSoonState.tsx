import React from 'react';
import { LockClosedIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { InstanceTypeConfig } from './types';

interface ComingSoonStateProps {
  typeConfig: InstanceTypeConfig;
}

export default function ComingSoonState({ typeConfig }: ComingSoonStateProps) {
  return (
    <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4 relative">
        <typeConfig.icon className="h-8 w-8 text-gray-400" />
        <div className="absolute -top-1 -right-1 bg-yellow-100 rounded-full p-1.5">
          <LockClosedIcon className="h-4 w-4 text-yellow-600" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
        {typeConfig.name} instance management is currently under development. Stay tuned for updates!
      </p>
      <div className="inline-flex items-center px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
        <InformationCircleIcon className="h-5 w-5 mr-2" />
        We're working hard to bring this feature to you soon
      </div>
    </div>
  );
}
