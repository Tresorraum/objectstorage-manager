import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ServerIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { api } from '../../services/api';

interface PostgresInstance {
  id: number;
  name: string;
  host: string;
  port: number;
  database: string;
  username: string;
  status: string;
}

interface DatabaseSelectorProps {
  selectedDatabaseId: string | null;
  onSelectDatabase: (id: string, name: string) => void;
}

export default function DatabaseSelector({
  selectedDatabaseId,
  onSelectDatabase,
}: DatabaseSelectorProps) {
  const { data: instances, isLoading } = useQuery<PostgresInstance[]>({
    queryKey: ['postgres-instances'],
    queryFn: () => api.get('/postgres/instances').then((res) => res.data),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!instances || instances.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <ServerIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No PostgreSQL Databases
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Add a PostgreSQL instance to start creating backups
        </p>
        <a href="/instances" className="btn-primary">
          Add PostgreSQL Instance
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Select Database</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {instances.map((instance) => {
          const isSelected = selectedDatabaseId === instance.id.toString();
          const isActive = instance.status === 'active';

          return (
            <button
              key={instance.id}
              onClick={() => isActive && onSelectDatabase(instance.id.toString(), instance.name)}
              disabled={!isActive}
              className={`
                text-left p-4 rounded-xl border-2 transition-all
                ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }
                ${!isActive && 'opacity-50 cursor-not-allowed'}
              `}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    isSelected ? 'bg-blue-600' : 'bg-gray-100'
                  }`}
                >
                  <ServerIcon
                    className={`h-5 w-5 ${
                      isSelected ? 'text-white' : 'text-gray-600'
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                      {instance.name}
                    </h4>
                    {isActive ? (
                      <CheckCircleIcon className="h-4 w-4 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircleIcon className="h-4 w-4 text-red-600 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 truncate">
                    {instance.database}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {instance.host}:{instance.port}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
