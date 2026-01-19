import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import BackupTabs from './BackupTabs';
import ScheduledBackupsTab from './ScheduledBackupsTab';
import PostgresBackupTab from './PostgresBackupTab';
import VPSBackupTab from './VPSBackupTab';

export default function Backups() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('scheduled');

  // Fetch all instance types for different tabs
  const { data: instances } = useQuery({
    queryKey: ['instances'],
    queryFn: () => api.get('/rustfs/instances').then(res => res.data),
  });

  const { data: postgresInstances, isLoading: loadingPostgres } = useQuery({
    queryKey: ['postgres-instances'],
    queryFn: () => api.get('/postgres/instances').then(res => res.data),
  });

  const { data: vpsInstances } = useQuery({
    queryKey: ['vps-instances'],
    queryFn: () => api.get('/vps/instances').then(res => res.data),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Backups</h1>
        <p className="mt-1 sm:mt-2 text-sm text-gray-600">
          Manage all your backup operations in one place
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <BackupTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          isPremium={user?.is_premium || false}
        />

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'scheduled' && (
            <ScheduledBackupsTab 
              instances={instances}
              postgresInstances={postgresInstances}
              vpsInstances={vpsInstances}
            />
          )}

          {activeTab === 'postgres' && (
            <PostgresBackupTab 
              postgresInstances={postgresInstances}
              vpsInstances={vpsInstances}
              isLoading={loadingPostgres}
            />
          )}

          {activeTab === 'vps' && (
            <VPSBackupTab />
          )}
        </div>
      </div>
    </div>
  );
}
