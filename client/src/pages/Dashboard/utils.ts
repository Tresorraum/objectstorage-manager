import {
  CloudArrowUpIcon,
  ServerIcon,
  ExclamationTriangleIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';

export const formatLastBackupTime = (lastBackupTime?: string): string => {
  if (!lastBackupTime) return 'No recent backups';
  
  const backupDate = new Date(lastBackupTime);
  const now = new Date();
  const diffMs = now.getTime() - backupDate.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

export const getActivityIcon = (type: string) => {
  switch (type) {
    case 'backup':
      return CloudArrowUpIcon;
    case 'instance':
      return ServerIcon;
    case 'alert':
      return ExclamationTriangleIcon;
    default:
      return BoltIcon;
  }
};

export const getActivityColor = (status: string): string => {
  switch (status) {
    case 'completed':
    case 'success':
      return 'text-green-600 bg-green-50';
    case 'running':
      return 'text-blue-600 bg-blue-50';
    case 'warning':
      return 'text-yellow-600 bg-yellow-50';
    case 'failed':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

export const getHealthColor = (status: string): string => {
  switch (status) {
    case 'excellent':
      return 'bg-green-500';
    case 'good':
      return 'bg-blue-500';
    case 'warning':
      return 'bg-yellow-500';
    case 'critical':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};
