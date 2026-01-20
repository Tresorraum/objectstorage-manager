import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ShieldCheckIcon,
  ClockIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { api } from '../../services/api';
import DatabaseSelector from './DatabaseSelector';
import CreateBackupButton from './CreateBackupButton';
import BackupsList from './BackupsList';
import BackupProgress from './BackupProgress';
import RestoreBackupModal from './RestoreBackupModal';

interface Backup {
  id: string;
  databaseId: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELED';
  backupSizeMb: number;
  createdAt: string;
}

export default function EnhancedPostgresBackups() {
  const [selectedDatabaseId, setSelectedDatabaseId] = useState<string | null>(null);
  const [selectedDatabaseName, setSelectedDatabaseName] = useState<string>('');
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  // Fetch VPS instances
  const { data: vpsInstances } = useQuery({
    queryKey: ['vps-instances'],
    queryFn: () => api.get('/vps/instances').then((res) => res.data),
  });

  // Fetch object storage instances
  const { data: objectStorageInstances } = useQuery({
    queryKey: ['object-storage-instances'],
    queryFn: () => api.get('/rustfs/instances').then((res) => res.data),
  });

  // Fetch backups for selected database to check for in-progress backups
  const { data: backupsData } = useQuery({
    queryKey: ['postgres-backups', selectedDatabaseId],
    queryFn: () =>
      api
        .get('/backups', {
          params: {
            database_id: selectedDatabaseId,
            limit: 1,
            offset: 0,
          },
        })
        .then((res) => res.data),
    enabled: !!selectedDatabaseId,
    refetchInterval: 3000, // Check every 3 seconds
  });

  const handleSelectDatabase = (id: string, name: string) => {
    setSelectedDatabaseId(id);
    setSelectedDatabaseName(name);
  };

  const inProgressBackup = backupsData?.backups?.find(
    (b: Backup) => b.status === 'IN_PROGRESS'
  );

  return (
    <div className="space-y-6">
      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-600 p-3 rounded-lg">
              <ShieldCheckIcon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-blue-900">Encrypted</h3>
          </div>
          <p className="text-sm text-blue-800">
            AES-256-GCM encryption for secure backup storage
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-600 p-3 rounded-lg">
              <ArrowPathIcon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-green-900">Streaming</h3>
          </div>
          <p className="text-sm text-green-800">
            Direct streaming to storage without temporary files
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-purple-600 p-3 rounded-lg">
              <ClockIcon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-purple-900">Cancellable</h3>
          </div>
          <p className="text-sm text-purple-800">
            Cancel long-running backups at any time
          </p>
        </div>
      </div>

      {/* Database Selector */}
      <DatabaseSelector
        selectedDatabaseId={selectedDatabaseId}
        onSelectDatabase={handleSelectDatabase}
      />

      {/* Selected Database Section */}
      {selectedDatabaseId && (
        <div className="space-y-6">
          {/* Database Header with Create Button */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedDatabaseName}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Manage backups for this database
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowRestoreModal(true)}
                  className="btn-secondary"
                >
                  <ArrowPathIcon className="h-5 w-5 mr-2" />
                  Restore
                </button>
                <CreateBackupButton
                  databaseId={selectedDatabaseId}
                  databaseName={selectedDatabaseName}
                  disabled={!!inProgressBackup}
                  vpsInstances={vpsInstances}
                  objectStorageInstances={objectStorageInstances}
                />
              </div>
            </div>

            {/* In-Progress Warning */}
            {inProgressBackup && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> A backup is currently in progress. You cannot
                  start a new backup until the current one completes or is cancelled.
                </p>
              </div>
            )}
          </div>

          {/* Progress Indicator */}
          {inProgressBackup && <BackupProgress backup={inProgressBackup} />}

          {/* Backups List */}
          <BackupsList
            databaseId={selectedDatabaseId}
            databaseName={selectedDatabaseName}
          />
        </div>
      )}

      {/* Standalone Restore Modal */}
      <RestoreBackupModal
        isOpen={showRestoreModal}
        onClose={() => setShowRestoreModal(false)}
      />

      {/* Technical Details */}
      {selectedDatabaseId && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Technical Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700">Backup Method</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Uses pg_dump with custom format (-Fc)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Zstd compression for PostgreSQL 16+ (gzip for older versions)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Compression level 5 for balanced performance</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Includes all schemas, tables, indexes, and data</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700">Security Features</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>AES-256-GCM encryption at rest</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Unique encryption keys per backup</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Token-based download authentication</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Automatic decryption during download</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
