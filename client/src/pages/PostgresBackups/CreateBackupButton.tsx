import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PlayIcon, Cog6ToothIcon, CloudArrowUpIcon, ServerIcon, ArrowDownTrayIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import Modal from '../../components/Modal';

interface CreateBackupButtonProps {
  databaseId: string;
  databaseName: string;
  disabled?: boolean;
  vpsInstances?: any[];
  objectStorageInstances?: any[];
}

interface BackupConfig {
  compressionLevel: number;
  destinationType: 'local' | 'vps' | 'object_storage';
  vpsInstanceId?: string;
  objectStorageInstanceId?: string;
  objectStorageBucket?: string;
}

export default function CreateBackupButton({
  databaseId,
  databaseName,
  disabled = false,
  vpsInstances = [],
  objectStorageInstances = [],
}: CreateBackupButtonProps) {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [config, setConfig] = useState<BackupConfig>({
    compressionLevel: 5,
    destinationType: 'object_storage',
  });
  const queryClient = useQueryClient();

  // Create backup mutation
  const createBackupMutation = useMutation({
    mutationFn: () =>
      api.post('/backups', {
        database_id: parseInt(databaseId),
        destination_type: config.destinationType,
        vps_instance_id: config.vpsInstanceId ? parseInt(config.vpsInstanceId) : undefined,
        object_storage_instance_id: config.objectStorageInstanceId ? parseInt(config.objectStorageInstanceId) : undefined,
        object_storage_bucket: config.objectStorageBucket,
        compression_level: config.compressionLevel,
      }),
    onSuccess: () => {
      toast.success('Backup started successfully');
      queryClient.invalidateQueries({ queryKey: ['postgres-backups', databaseId] });
      setShowConfirmModal(false);
      setShowConfigModal(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to start backup');
    },
  });

  const handleQuickBackup = () => {
    // Show confirmation modal with default config
    setShowConfirmModal(true);
  };

  const handleConfiguredBackup = () => {
    setShowConfigModal(true);
  };

  const handleConfigureAndConfirm = () => {
    setShowConfigModal(false);
    setShowConfirmModal(true);
  };

  const handleConfirmBackup = () => {
    createBackupMutation.mutate();
  };

  const handleEditFromConfirm = () => {
    setShowConfirmModal(false);
    setShowConfigModal(true);
  };

  const getDestinationName = () => {
    switch (config.destinationType) {
      case 'local':
        return 'Local Download';
      case 'vps':
        const vps = vpsInstances?.find((v) => v.id.toString() === config.vpsInstanceId);
        return vps ? `VPS: ${vps.name}` : 'VPS Server';
      case 'object_storage':
        const storage = objectStorageInstances?.find(
          (s) => s.id.toString() === config.objectStorageInstanceId
        );
        return storage ? `S3: ${storage.name}` : 'Object Storage';
      default:
        return 'Unknown';
    }
  };

  return (
    <>
      <div className="flex gap-2">
        {/* Quick Backup Button */}
        <button
          onClick={handleQuickBackup}
          disabled={disabled || createBackupMutation.isPending}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createBackupMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Starting...
            </>
          ) : (
            <>
              <PlayIcon className="h-5 w-5 mr-2" />
              Create Backup
            </>
          )}
        </button>

        {/* Advanced Options Button */}
        <button
          onClick={handleConfiguredBackup}
          disabled={disabled || createBackupMutation.isPending}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          title="Advanced backup options"
        >
          <Cog6ToothIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Configuration Modal */}
      <Modal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        title="Backup Configuration"
        size="md"
      >
        <div className="space-y-5">
          {/* Database Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Database</h3>
            <p className="text-sm text-blue-800">{databaseName}</p>
          </div>

          {/* Backup Destination */}
          <div className="space-y-3">
            <label className="input-label">Backup Destination</label>
            <div className="grid grid-cols-1 gap-3">
              {/* Object Storage Option */}
              <button
                type="button"
                onClick={() => setConfig({ ...config, destinationType: 'object_storage' })}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  config.destinationType === 'object_storage'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-start gap-3">
                  <CloudArrowUpIcon
                    className={`h-6 w-6 flex-shrink-0 ${
                      config.destinationType === 'object_storage' ? 'text-blue-600' : 'text-gray-400'
                    }`}
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-sm">Object Storage (S3)</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Store in S3-compatible object storage (recommended)
                    </div>
                  </div>
                </div>
              </button>

              {/* VPS Option */}
              <button
                type="button"
                onClick={() => setConfig({ ...config, destinationType: 'vps' })}
                disabled={!vpsInstances || vpsInstances.length === 0}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  config.destinationType === 'vps'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-300 hover:border-gray-400'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-start gap-3">
                  <ServerIcon
                    className={`h-6 w-6 flex-shrink-0 ${
                      config.destinationType === 'vps' ? 'text-purple-600' : 'text-gray-400'
                    }`}
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-sm">VPS Server</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {vpsInstances && vpsInstances.length > 0
                        ? 'Store on your VPS server'
                        : 'No VPS configured'}
                    </div>
                  </div>
                </div>
              </button>

              {/* Local Download Option */}
              <button
                type="button"
                onClick={() => setConfig({ ...config, destinationType: 'local' })}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  config.destinationType === 'local'
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-start gap-3">
                  <ArrowDownTrayIcon
                    className={`h-6 w-6 flex-shrink-0 ${
                      config.destinationType === 'local' ? 'text-green-600' : 'text-gray-400'
                    }`}
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-sm">Local Download</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Download backup directly to your computer
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Object Storage Selection */}
          {config.destinationType === 'object_storage' && (
            <>
              <div>
                <label className="input-label">Select Object Storage</label>
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
                  onChange={(e) =>
                    setConfig({ ...config, objectStorageBucket: e.target.value })
                  }
                  className="input-field"
                  placeholder="my-backups"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  The bucket will be created if it doesn't exist
                </p>
              </div>
            </>
          )}

          {/* VPS Selection */}
          {config.destinationType === 'vps' && vpsInstances && vpsInstances.length > 0 && (
            <div>
              <label className="input-label">Select VPS Server</label>
              <select
                value={config.vpsInstanceId || ''}
                onChange={(e) => setConfig({ ...config, vpsInstanceId: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Choose VPS server</option>
                {vpsInstances.map((vps: any) => (
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

          {/* Compression Level */}
          <div className="space-y-2">
            <label className="input-label">
              Compression Level: {config.compressionLevel}
            </label>
            <input
              type="range"
              min="0"
              max="9"
              value={config.compressionLevel}
              onChange={(e) =>
                setConfig({ ...config, compressionLevel: parseInt(e.target.value) })
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>Faster (0)</span>
              <span>Balanced (5)</span>
              <span>Smaller (9)</span>
            </div>
            <p className="text-xs text-gray-600">
              Higher compression levels produce smaller backups but take longer to create.
              Level 5 provides a good balance.
            </p>
          </div>

          {/* Backup Features Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-semibold text-gray-900">Backup Features</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Uses pg_dump custom format (-Fc) for optimal compression</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Supports gzip compression for efficient storage</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Streams directly to storage without temporary files</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Includes all schemas, tables, and data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Can be cancelled during execution</span>
              </li>
            </ul>
          </div>

          {/* Info Note */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> The backup will run in the background. You can monitor
              its progress in the backup history below. Large databases may take several
              minutes to complete.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowConfigModal(false)}
              className="btn-secondary"
              disabled={createBackupMutation.isPending}
            >
              Cancel
            </button>
            <button
              onClick={handleConfigureAndConfirm}
              disabled={createBackupMutation.isPending}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              Review & Confirm
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Backup Configuration"
        size="md"
      >
        <div className="space-y-5">
          {/* Summary Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900">Ready to Create Backup</h3>
                <p className="text-sm text-blue-700">Please review your configuration below</p>
              </div>
            </div>
          </div>

          {/* Configuration Summary */}
          <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
            {/* Database */}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Database</span>
                <span className="text-sm font-semibold text-gray-900">{databaseName}</span>
              </div>
            </div>

            {/* Destination */}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Destination</span>
                <span className="text-sm font-semibold text-gray-900">{getDestinationName()}</span>
              </div>
              {config.destinationType === 'object_storage' && config.objectStorageBucket && (
                <div className="mt-2 text-xs text-gray-500">
                  Bucket: <span className="font-mono">{config.objectStorageBucket}</span>
                </div>
              )}
            </div>

            {/* Compression */}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Compression Level</span>
                <span className="text-sm font-semibold text-gray-900">
                  Level {config.compressionLevel}
                  <span className="text-xs text-gray-500 ml-2">
                    ({config.compressionLevel === 0 ? 'None' : config.compressionLevel < 4 ? 'Fast' : config.compressionLevel < 7 ? 'Balanced' : 'Maximum'})
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <PlayIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-900 mb-1">What happens next?</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Backup will start immediately in the background</li>
                  <li>• You can monitor progress in real-time below</li>
                  <li>• You'll be notified when the backup completes</li>
                  <li>• The backup can be cancelled at any time</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleEditFromConfirm}
              className="btn-secondary"
              disabled={createBackupMutation.isPending}
            >
              <Cog6ToothIcon className="h-5 w-5 mr-2" />
              Edit Configuration
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="btn-secondary"
                disabled={createBackupMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBackup}
                disabled={createBackupMutation.isPending}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createBackupMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Starting Backup...
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-5 w-5 mr-2" />
                    Confirm & Start Backup
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
