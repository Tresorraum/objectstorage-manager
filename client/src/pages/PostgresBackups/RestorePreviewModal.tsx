import React, { useState } from 'react';
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import Modal from '../../components/Modal';
import { formatBytes } from '../../utils/formatters';

interface Backup {
  id: string;
  backupSizeMb: number;
  createdAt: string;
  encryption: 'NONE' | 'ENCRYPTED';
}

interface RestorePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  backup: Backup | null;
  databaseName: string;
}

export default function RestorePreviewModal({
  isOpen,
  onClose,
  backup,
  databaseName,
}: RestorePreviewModalProps) {
  const [restoreOptions, setRestoreOptions] = useState({
    dropExisting: false,
    createDatabase: false,
    noOwner: true,
    noPrivileges: false,
  });

  if (!backup) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Restore Backup (Preview)" size="lg">
      <div className="space-y-5">
        {/* Warning Banner */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-yellow-900 mb-1">
                Restore Feature Coming Soon
              </h4>
              <p className="text-sm text-yellow-800">
                This is a preview of the restore functionality. The actual restore feature
                will be implemented in the backend API integration phase.
              </p>
            </div>
          </div>
        </div>

        {/* Backup Info */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-3">Backup Information</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>
              <span className="font-medium">Database:</span> {databaseName}
            </p>
            <p>
              <span className="font-medium">Created:</span>{' '}
              {new Date(backup.createdAt).toLocaleString()}
            </p>
            <p>
              <span className="font-medium">Size:</span>{' '}
              {formatBytes(backup.backupSizeMb * 1024 * 1024)}
            </p>
            <p>
              <span className="font-medium">Encryption:</span>{' '}
              {backup.encryption === 'ENCRYPTED' ? 'Yes (AES-256-GCM)' : 'No'}
            </p>
          </div>
        </div>

        {/* Restore Options */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Restore Options</h3>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={restoreOptions.dropExisting}
              onChange={(e) =>
                setRestoreOptions({ ...restoreOptions, dropExisting: e.target.checked })
              }
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">
                Drop existing objects
              </span>
              <p className="text-xs text-gray-600 mt-1">
                Drop database objects before recreating them (--clean)
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={restoreOptions.createDatabase}
              onChange={(e) =>
                setRestoreOptions({ ...restoreOptions, createDatabase: e.target.checked })
              }
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">
                Create database
              </span>
              <p className="text-xs text-gray-600 mt-1">
                Create the database before restoring (--create)
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={restoreOptions.noOwner}
              onChange={(e) =>
                setRestoreOptions({ ...restoreOptions, noOwner: e.target.checked })
              }
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
              checked={restoreOptions.noPrivileges}
              onChange={(e) =>
                setRestoreOptions({ ...restoreOptions, noPrivileges: e.target.checked })
              }
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

        {/* Restore Process Info */}
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

        {/* Command Preview */}
        <div className="bg-gray-900 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-100 mb-2">
            Command Preview (pg_restore)
          </h4>
          <code className="text-xs text-green-400 font-mono block whitespace-pre-wrap">
            {`pg_restore \\
  ${restoreOptions.dropExisting ? '--clean \\\n  ' : ''}${
              restoreOptions.createDatabase ? '--create \\\n  ' : ''
            }${restoreOptions.noOwner ? '--no-owner \\\n  ' : ''}${
              restoreOptions.noPrivileges ? '--no-privileges \\\n  ' : ''
            }--verbose \\
  -h <host> -p <port> \\
  -U <username> \\
  -d ${databaseName} \\
  backup_${backup.id}.dump`}
          </code>
        </div>

        {/* Warning */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">
            <strong>Warning:</strong> Restoring a backup will modify the target database.
            Make sure you have a recent backup before proceeding. This operation cannot be
            undone.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button onClick={onClose} className="btn-secondary">
            Close Preview
          </button>
          <button
            disabled
            className="btn-primary opacity-50 cursor-not-allowed"
            title="Restore feature coming soon"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Restore Backup (Coming Soon)
          </button>
        </div>
      </div>
    </Modal>
  );
}
