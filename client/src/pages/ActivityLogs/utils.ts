import {
  CloudArrowUpIcon,
  ServerIcon,
  TrashIcon,
  PencilIcon,
  UserIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { LogStatus } from './types';

export const getStatusFromAction = (action: string, details: string): LogStatus => {
  if (action === 'backup_run') {
    try {
      const parsed = JSON.parse(details);
      if (parsed.status === 'completed') return 'success';
      if (parsed.status === 'failed') return 'error';
      return 'warning';
    } catch {
      return 'success';
    }
  }
  if (action === 'delete') return 'warning';
  if (action === 'login' || action === 'create' || action === 'update') return 'success';
  return 'success';
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'success':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'error':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getActionIcon = (action: string) => {
  if (action === 'backup_run') return CloudArrowUpIcon;
  if (action === 'create') return ServerIcon;
  if (action === 'delete') return TrashIcon;
  if (action === 'update') return PencilIcon;
  if (action === 'login') return UserIcon;
  return DocumentTextIcon;
};

export const getActionLabel = (action: string): string => {
  const labels: Record<string, string> = {
    'login': 'User Login',
    'logout': 'User Logout',
    'create': 'Created',
    'update': 'Updated',
    'delete': 'Deleted',
    'backup_run': 'Backup Run',
    'restore': 'Restore',
  };
  return labels[action] || action;
};

export const getResourceLabel = (resource: string): string => {
  const labels: Record<string, string> = {
    'authentication': 'Authentication',
    'instance': 'Instance',
    'backup_job': 'Backup Job',
    'user': 'User',
    'system': 'System',
  };
  return labels[resource] || resource;
};

export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

export const getDetailsPreview = (details: string, action: string): string => {
  try {
    const parsed = JSON.parse(details);
    if (action === 'backup_run') {
      if (parsed.status === 'completed') {
        return `Completed: ${parsed.files || 0} files, ${formatBytes(parsed.size_bytes || 0)}`;
      }
      if (parsed.status === 'failed') {
        return `Failed: ${parsed.error || 'Unknown error'}`;
      }
    }
    if (action === 'create' && parsed.name) {
      return `Created: ${parsed.name}`;
    }
    if (action === 'update' && parsed.field) {
      return `Updated ${parsed.field}`;
    }
    if (action === 'delete' && parsed.name) {
      return `Deleted: ${parsed.name}`;
    }
    return Object.keys(parsed).slice(0, 2).join(', ');
  } catch {
    return details.substring(0, 50);
  }
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};
