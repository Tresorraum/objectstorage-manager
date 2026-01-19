import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { 
  ArrowDownTrayIcon, 
  CloudArrowUpIcon,
  ServerIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import Modal from '../../components/Modal';

interface PostgresInstance {
  id: number;
  name: string;
  host: string;
  port: number;
  database: string;
  username: string;
  status: string;
}

interface VPSInstance {
  id: number;
  name: string;
  host: string;
  backup_path: string;
  status: string;
}

interface PostgresBackupTabProps {
  postgresInstances: PostgresInstance[] | undefined;
  vpsInstances: VPSInstance[] | undefined;
  isLoading: boolean;
}

export default function PostgresBackupTab({ 
  postgresInstances, 
  vpsInstances,
  isLoading 
}: PostgresBackupTabProps) {
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [selectedPostgres, setSelectedPostgres] = useState<PostgresInstance | null>(null);
  const [backupDestination, setBackupDestination] = useState<'local' | 'vps'>('local');
  const [selectedVPS, setSelectedVPS] = useState<string>('');

  // Backup mutation
  const backupMutation = useMutation({
    mutationFn: (data: any) => api.post('/postgres/backup', data),
    onSuccess: (response) => {
      if (backupDestination === 'local') {
        // Trigger download
        const blob = new Blob([response.data], { type: 'application/sql' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedPostgres?.database}_${new Date().toISOString().split('T')[0]}.sql`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Database backup downloaded successfully');
      } else {
        toast.success('Database backup uploaded to VPS successfully');
      }
      setShowBackupModal(false);
      setSelectedPostgres(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to backup database');
    },
  });

  const handleBackupClick = (instance: PostgresInstance) => {
    setSelectedPostgres(instance);
    setBackupDestination('local');
    setSelectedVPS('');
    setShowBackupModal(true);
  };

  const handleBackupSubmit = () => {
    if (!selectedPostgres) return;

    const payload: any = {
      postgres_instance_id: selectedPostgres.id,
      destination_type: backupDestination,
    };

    if (backupDestination === 'vps' && selectedVPS) {
      payload.vps_instance_id = parseInt(selectedVPS);
    }

    backupMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-600 p-3 rounded-lg">
              <ArrowDownTrayIcon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-blue-900">Local Download</h3>
          </div>
          <p className="text-sm text-blue-800">
            Download database backups directly to your computer as SQL dump files
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-purple-600 p-3 rounded-lg">
              <CloudArrowUpIcon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-purple-900">VPS Upload</h3>
          </div>
          <p className="text-sm text-purple-800">
            Upload database backups directly to your VPS servers for remote storage
          </p>
        </div>
      </div>

      {/* PostgreSQL Instances List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your PostgreSQL Databases</h2>
        </div>

        {!postgresInstances || postgresInstances.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ServerIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No PostgreSQL instances</h3>
              <p className="text-sm text-gray-500 mb-6">
                Add a PostgreSQL instance to start creating backups
              </p>
              <a href="/instances" className="btn-primary">
                Add PostgreSQL Instance
              </a>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {postgresInstances.map((instance) => (
              <div
                key={instance.id}
                className="px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-50 p-3 rounded-xl flex-shrink-0">
                      <ServerIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-gray-900">{instance.name}</h3>
                      <div className="mt-1 space-y-1">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Database:</span> {instance.database}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Host:</span> {instance.host}:{instance.port}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">User:</span> {instance.username}
                        </p>
                      </div>
                      <div className="mt-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            instance.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {instance.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBackupClick(instance)}
                    disabled={instance.status !== 'active'}
                    className="btn-primary w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <PlayIcon className="h-5 w-5 mr-2" />
                    Create Backup
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Backup Modal */}
      <Modal
        isOpen={showBackupModal}
        onClose={() => {
          setShowBackupModal(false);
          setSelectedPostgres(null);
        }}
        title="Create Database Backup"
        size="md"
      >
        <div className="space-y-5">
          {/* Database Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Database Information</h3>
            <div className="space-y-1 text-sm text-blue-800">
              <p><span className="font-medium">Instance:</span> {selectedPostgres?.name}</p>
              <p><span className="font-medium">Database:</span> {selectedPostgres?.database}</p>
              <p><span className="font-medium">Host:</span> {selectedPostgres?.host}:{selectedPostgres?.port}</p>
            </div>
          </div>

          {/* Destination Selection */}
          <div>
            <label className="input-label">Backup Destination</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setBackupDestination('local')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  backupDestination === 'local'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <ArrowDownTrayIcon
                  className={`h-6 w-6 mb-2 ${
                    backupDestination === 'local' ? 'text-blue-600' : 'text-gray-400'
                  }`}
                />
                <div className="font-semibold text-sm">Local Download</div>
                <div className="text-xs text-gray-500 mt-1">Save to your computer</div>
              </button>

              <button
                type="button"
                onClick={() => setBackupDestination('vps')}
                disabled={!vpsInstances || vpsInstances.length === 0}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  backupDestination === 'vps'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-300 hover:border-gray-400'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <CloudArrowUpIcon
                  className={`h-6 w-6 mb-2 ${
                    backupDestination === 'vps' ? 'text-purple-600' : 'text-gray-400'
                  }`}
                />
                <div className="font-semibold text-sm">Upload to VPS</div>
                <div className="text-xs text-gray-500 mt-1">
                  {vpsInstances && vpsInstances.length > 0
                    ? 'Save to remote server'
                    : 'No VPS configured'}
                </div>
              </button>
            </div>
          </div>

          {/* VPS Selection */}
          {backupDestination === 'vps' && vpsInstances && vpsInstances.length > 0 && (
            <div>
              <label className="input-label">Select VPS Instance</label>
              <select
                required
                className="input-field"
                value={selectedVPS}
                onChange={(e) => setSelectedVPS(e.target.value)}
              >
                <option value="">Choose a VPS server</option>
                {vpsInstances.map((vps) => (
                  <option key={vps.id} value={vps.id}>
                    {vps.name} ({vps.host}) - {vps.backup_path}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Backup will be uploaded to the configured backup path on the VPS
              </p>
            </div>
          )}

          {/* Info Message */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-600">
              {backupDestination === 'local' ? (
                <>
                  <strong>Note:</strong> The database will be exported as a SQL dump file and
                  downloaded to your browser's download folder.
                </>
              ) : (
                <>
                  <strong>Note:</strong> The database will be exported and securely uploaded to
                  your VPS server via SSH.
                </>
              )}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setShowBackupModal(false);
                setSelectedPostgres(null);
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleBackupSubmit}
              disabled={
                backupMutation.isPending ||
                (backupDestination === 'vps' && !selectedVPS)
              }
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {backupMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Backup...
                </>
              ) : (
                <>
                  {backupDestination === 'local' ? (
                    <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                  ) : (
                    <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                  )}
                  Create Backup
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
