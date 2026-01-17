import { useQuery } from '@tanstack/react-query';
import { 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  XCircleIcon 
} from '@heroicons/react/24/outline';
import { api } from '../services/api';

interface Alert {
  id: number;
  type: string;
  severity: string;
  title: string;
  message: string;
  created_at: string;
  resolved: boolean;
}

const alertIcons = {
  warning: ExclamationTriangleIcon,
  error: XCircleIcon,
  info: InformationCircleIcon,
};

const alertColors = {
  critical: 'text-red-600 bg-red-50',
  high: 'text-red-500 bg-red-50',
  medium: 'text-yellow-600 bg-yellow-50',
  low: 'text-blue-600 bg-blue-50',
};

export default function AlertsList() {
  const { data: alerts, isLoading } = useQuery<Alert[]>({
    queryKey: ['recent-alerts'],
    queryFn: () => api.get('/dashboard/alerts?limit=5').then(res => res.data),
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <div className="text-center py-6">
        <InformationCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-gray-500">No recent alerts</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const AlertIcon = alertIcons[alert.type as keyof typeof alertIcons] || InformationCircleIcon;
        const alertColor = alertColors[alert.severity as keyof typeof alertColors] || 'text-gray-600 bg-gray-50';
        
        return (
          <div key={alert.id} className={`p-4 rounded-lg border ${alertColor}`}>
            <div className="flex items-start space-x-3">
              <AlertIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{alert.title}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                    alert.resolved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {alert.resolved ? 'Resolved' : alert.severity}
                  </span>
                </div>
                <p className="text-sm mt-1">{alert.message}</p>
                <p className="text-xs mt-2 opacity-75">
                  {new Date(alert.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}