import { useQuery } from '@tanstack/react-query';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { api } from '../services/api';

interface BackupJob {
  id: number;
  name: string;
  status: string;
  last_run?: string;
  rustfs_instance: {
    name: string;
  };
}

const statusIcons = {
  completed: CheckCircleIcon,
  failed: XCircleIcon,
  running: ClockIcon,
  pending: ClockIcon,
};

const statusColors = {
  completed: 'text-green-500',
  failed: 'text-red-500',
  running: 'text-blue-500',
  pending: 'text-gray-500',
};

export default function RecentBackups() {
  const { data: backups, isLoading } = useQuery<BackupJob[]>({
    queryKey: ['recent-backups'],
    queryFn: () => api.get('/backup/jobs?limit=5').then(res => res.data),
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!backups || backups.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">No backup jobs found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {backups.map((backup) => {
        const StatusIcon = statusIcons[backup.status as keyof typeof statusIcons] || ClockIcon;
        const statusColor = statusColors[backup.status as keyof typeof statusColors] || 'text-gray-500';
        
        return (
          <div key={backup.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <StatusIcon className={`h-5 w-5 ${statusColor}`} />
              <div>
                <p className="text-sm font-medium text-gray-900">{backup.name}</p>
                <p className="text-xs text-gray-500">{backup.rustfs_instance?.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-xs font-medium capitalize ${statusColor}`}>
                {backup.status}
              </p>
              {backup.last_run && (
                <p className="text-xs text-gray-500">
                  {new Date(backup.last_run).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}