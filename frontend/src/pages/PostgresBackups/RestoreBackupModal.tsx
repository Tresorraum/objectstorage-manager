import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CloudArrowUpIcon,
  ServerIcon,
  ArrowUpTrayIcon,
  DocumentArrowUpIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import Modal from '../../components/Modal';
import { formatBytes } from '../../utils/formatters';

interface Backup {
  id: string;
  backupSizeMb: number;
  createdAt: string;
  encryption: 'NONE' | 'ENCRYPTED';
}

interface RestoreBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceBackup?: Backup | null;
  sourceDatabaseName?: string;
}

interface RestoreConfig {
  sourceType: 'existing_backup' | 'object_storage' | 'vps' | 'local_file';
  targetDatabaseId: string;
  backupId?: string;
  objectStorageInstanceId?: string;
  objectStorageBucket?: string;
  objectStorageKey?: string;
  vpsInstanceId?: string;
  vpsFilePath?: string;
  localFile?: File;
  dropExisting: boolean;
  createDatabase: boolean;
  noOwner: boolean;
  noPrivileges: boolean;
}

export default function RestoreBackupModal({
  isOpen,
  onClose,
  sourceBackup,
  sourceDatabaseName,
}: RestoreBackupModalProps) {
  const [config, setConfig] = useState<RestoreConfig>({
    sourceType: sourceBackup ? 'existing_backup' : 'object_storage',
    targetDatabaseId: '',
    backupId: sourceBackup?.id,
    dropExisting: false,
    createDatabase: false,
    noOwner: true,
    noPrivileges: false,
  });
  const queryClient = useQueryClient();

  // Fetch PostgreSQL instances for target selection
  const { data: postgresInstances } = useQuery({
    queryKey: ['postgres-instances'],
    queryFn: () => api.get('/postgres/instances').then((res) => res.data),
  });

  // Fetch object storage instances
  const { data: objectStorageInstances } = useQuery({
    queryKey: ['object-storage-instances'],
    queryFn: () => api.get('/rustfs/instances').then((res) => res.data),
    enabled: config.sourceType === 'object_storage',
  });

  // Fetch VPS instances
  const { data: vpsInstances } = useQuery({
    queryKey: ['vps-instances'],
    queryFn: () => api.get('/vps/instances').then((res) => res.data),
    enabled: config.sourceType === 'vps',
  });

  // Restore mutation
  const restoreMutation = useMutation({
    mutationFn: (data: FormData | any) => {
      if (config.sourceType === 'local_file') {
        // For local file upload, use FormData
        return api.post('/backups/restore', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      return api.post('/backups/restore', data);
    },
    onSuccess: () => {
      toast.success('Database restore started successfully');
      queryClient.invalidateQueries({ queryKey: ['postgres-backups'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to start restore');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setConfig({ ...config, localFile: file });
    }
  };

  const handleRestore = () => {
    if (!config.targetDatabaseId) {
      toast.error('Please select a target database');
      return;
    }

    if (config.sourceType === 'local_file') {
      if (!config.localFile) {
        toast.error('Please select a backup file');
        return;
      }

      const formData = new FormData();
      formData.append('file', config.localFile);
      formData.append('target_database_id', config.targetDatabaseId);
      formData.append('drop_existing', config.dropExisting.toString());
      formData.append('create_database', config.createDatabase.toString());
      formData.append('no_owner', config.noOwner.toString());
      formData.append('no_privileges', config.noPrivileges.toString());

      restoreMutation.mutate(formData);
    } else {
      const payload: any = {
        source_type: config.sourceType,
        target_database_id: config.targetDatabaseId,
        drop_existing: config.dropExisting,
        create_database: config.createDatabase,
        no_owner: config.noOwner,
        no_privileges: config.noPrivileges,
      };

      if (config.sourceType === 'existing_backup') {
        payload.backup_id = config.backupId;
      } else if (config.sourceType === 'object_storage') {
        payload.object_storage_instance_id = config.objectStorageInstanceId;
        payload.object_storage_bucket = config.objectStorageBucket;
        payload.object_storage_key = config.objectStorageKey;
      } else if (config.sourceType === 'vps') {
        payload.vps_instance_id = config.vpsInstanceId;
        payload.vps_file_path = config.vpsFilePath;
      }

      restoreMutation.mutate(payload);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Restore Database Backup" size="lg">
      <div className="space-y-5">
        {/* Warning Banner */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-yellow-900 mb-1">
                Important: Backup Before Restore
              </h4>
              <p className="text-sm text-yellow-800">
                Restoring will modify the target database. Make sure you have a recent backup
                before proceeding. This operation cannot be undone.
              </p>
            </div>
          </div>
        </div>

        {/* Source Backup Info (if provided) */}
        {sourceBackup && sourceDatabaseName && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">Source Backup</h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p>
                <span className="font-medium">Database:</span> {sourceDatabaseName}
              </p>
              <p>
                <span className="font-medium">Created:</span>{' '}
                {new Date(sourceBackup.createdAt).toLocaleString()}
              </p>
              <p>
                <span className="font-medium">Size:</span>{' '}
                {formatBytes(sourceBackup.backupSizeMb * 1024 * 1024)}
              </p>
              <p>
                <span className="font-medium">Encryption:</span>{' '}
                {sourceBackup.encryption === 'ENCRYPTED' ? 'Yes (AES-256-GCM)' : 'No'}
              </p>
            </div>
          </div>
        )}

        {/* Source Type Selection */}
        {!sourceBackup && (
          <div className="space-y-3">
            <label className="input-label">Backup Source</label>
            <div className="grid grid-cols-1 gap-3">
              {/* Object Storage */}
              <button
                type="button"
                onClick={() => setConfig({ ...config, sourceType: 'object_storage' })}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  config.sourceType === 'object_storage'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-start gap-3">
                  <CloudArrowUpIcon
                    className={`h-6 w-6 flex-shrink-0 ${
                      config.sourceType === 'object_storage' ? 'text-blue-600' : 'text-gray-400'
                    }`}
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-sm">Object Storage (S3)</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Restore from S3-compatible object storage
                    </div>
                  </div>
                </div>
              </button>

              {/* VPS */}
              <button
                type="button"
                onClick={() => setConfig({ ...config, sourceType: 'vps' })}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  config.sourceType === 'vps'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-start gap-3">
                  <ServerIcon
                    className={`h-6 w-6 flex-shrink-0 ${
                      config.sourceType === 'vps' ? 'text-purple-600' : 'text-gray-400'
                    }`}
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-sm">VPS Server</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Restore from backup file on VPS
                    </div>
                  </div>
                </div>
              </button>

              {/* Local File */}
              <button
                type="button"
                onClick={() => setConfig({ ...config, sourceType: 'local_file' })}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  config.sourceType === 'local_file'
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-start gap-3">
                  <DocumentArrowUpIcon
                    className={`h-6 w-6 flex-shrink-0 ${
                      config.sourceType === 'local_file' ? 'text-green-600' : 'text-gray-400'
                    }`}
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-sm">Local File Upload</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Upload backup file from your computer
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Source Configuration */}
        {config.sourceType === 'object_storage' && !sourceBackup && (
          <>
            <div>
              <label className="input-label">Object Storage Instance</label>
              <select
                value={config.objectStorageInstanceId || ''}
                onChange={(e) =>
                  setConfig({ ...config, objectStorageInstanceId: e.target.value })
                }
                className="input-field"
                required
              >
                <option value="">Choose storage instance</option>
                {objectStorageInstances?.map((instance: any) => (
                  <option key={instance.id} value={instance.id}>
                    {instance.name} ({instance.endpoint})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Bucket Name</label>
              <input
                type="text"
                value={config.objectStorageBucket || ''}
                onChange={(e) => setConfig({ ...config, objectStorageBucket: e.target.value })}
                className="input-field"
                placeholder="my-backups"
                required
              />
            </div>
            <div>
              <label className="input-label">Backup File Key/Path</label>
              <input
                type="text"
                value={config.objectStorageKey || ''}
                onChange={(e) => setConfig({ ...config, objectStorageKey: e.target.value })}
                className="input-field"
                placeholder="backups/mydb_2024-01-20.dump"
                required
              />
            </div>
          </>
        )}

        {config.sourceType === 'vps' && !sourceBackup && (
          <>
            <div>
              <label className="input-label">VPS Server</label>
              <select
                value={config.vpsInstanceId || ''}
                onChange={(e) => setConfig({ ...config, vpsInstanceId: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Choose VPS server</option>
                {vpsInstances?.map((vps: any) => (
                  <option key={vps.id} value={vps.id}>
                    {vps.name} ({vps.host})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Backup File Path on VPS</label>
              <input
                type="text"
                value={config.vpsFilePath || ''}
                onChange={(e) => setConfig({ ...config, vpsFilePath: e.target.value })}
                className="input-field"
                placeholder="/backups/mydb_2024-01-20.dump"
                required
              />
            </div>
          </>
        )}

        {config.sourceType === 'local_file' && !sourceBackup && (
          <div>
            <label className="input-label">Select Backup File</label>
            <input
              type="file"
              accept=".dump,.sql,.backup"
              onChange={handleFileChange}
              className="input-field"
              required
            />
            {config.localFile && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {config.localFile.name} ({formatBytes(config.localFile.size)})
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Supported formats: .dump (pg_dump custom), .sql, .backup
            </p>
          </div>
        )}

        {/* Target Database */}
        <div>
          <label className="input-label">Target Database</label>
          <select
            value={config.targetDatabaseId}
            onChange={(e) => setConfig({ ...config, targetDatabaseId: e.target.value })}
            className="input-field"
            required
          >
            <option value="">Choose target database</option>
            {postgresInstances?.map((instance: any) => (
              <option key={instance.id} value={instance.id}>
                {instance.name} - {instance.database} ({instance.host}:{instance.port})
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            The database where the backup will be restored
          </p>
        </div>

        {/* Restore Options */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Restore Options</h3>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.dropExisting}
              onChange={(e) => setConfig({ ...config, dropExisting: e.target.checked })}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">Drop existing objects</span>
              <p className="text-xs text-gray-600 mt-1">
                Drop database objects before recreating them (--clean)
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.createDatabase}
              onChange={(e) => setConfig({ ...config, createDatabase: e.target.checked })}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">Create database</span>
              <p className="text-xs text-gray-600 mt-1">
                Create the database before restoring (--create)
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.noOwner}
              onChange={(e) => setConfig({ ...config, noOwner: e.target.checked })}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">
                Skip ownership restoration
              </span>
              <p className="text-xs text-gray-600 mt-1">
                Do not restore object ownership (--no-owner, recommended)
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.noPrivileges}
              onChange={(e) => setConfig({ ...config, noPrivileges: e.target.checked })}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">
                Skip privileges restoration
              </span>
              <p className="text-xs text-gray-600 mt-1">
                Do not restore access privileges (--no-privileges)
              </p>
            </div>
          </label>
        </div>

        {/* Info Box */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <InformationCircleIcon className="h-5 w-5 text-blue-600" />
            Restore Process
          </h4>
          <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
            <li>Backup file will be downloaded and decrypted (if encrypted)</li>
            <li>pg_restore will be executed with selected options</li>
            <li>Database objects will be recreated in the target database</li>
            <li>Data will be imported from the backup</li>
            <li>Indexes and constraints will be rebuilt</li>
          </ol>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="btn-secondary"
            disabled={restoreMutation.isPending}
          >
            Cancel
          </button>
          <button
            onClick={handleRestore}
            disabled={restoreMutation.isPending || !config.targetDatabaseId}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {restoreMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Restoring...
              </>
            ) : (
              <>
                <ArrowPathIcon className="h-5 w-5 mr-2" />
                Restore Database
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
