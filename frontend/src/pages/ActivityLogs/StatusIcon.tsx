import React from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface StatusIconProps {
  status: string;
}

export default function StatusIcon({ status }: StatusIconProps) {
  switch (status) {
    case 'success':
      return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
    case 'warning':
      return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
    case 'error':
      return <XCircleIcon className="h-5 w-5 text-red-600" />;
    default:
      return <ClockIcon className="h-5 w-5 text-gray-600" />;
  }
}
