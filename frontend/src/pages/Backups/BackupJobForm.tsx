import React from 'react';
import { ServerIcon, FolderIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { BackupFormData, RustFSInstance } from './types';

interface BackupJobFormProps {
  formData: BackupFormData;
  instances: RustFSInstance[] | undefined;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (data: Partial<BackupFormData>) => void;
  onCancel: () => void;
}

export default function BackupJobForm({
  formData,
  instances,
  isSubmitting,
  onSubmit,
  onChange,
  onCancel,
}: BackupJobFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="input-label">Job Name</label>
        <input
          type="text"
          required
          placeholder="e.g., Daily Production Backup"
          className="input-field"
          value={formData.name}
          onChange={(e) => onChange({ name: e.target.value })}
        />
      </div>

      <div>
        <label className="input-label">Source RustFS Instance</label>
        <select
          required
          className="input-field"
          value={formData.rustfs_instance_id}
          onChange={(e) => onChange({ rustfs_instance_id: e.target.value })}
        >
          <option value="">Select source instance</option>
          {instances?.map((instance) => (
            <option key={instance.id} value={instance.id}>
              {instance.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="input-label">Source Bucket</label>
        <input
          type="text"
          required
          placeholder="my-bucket"
          className="input-field"
          value={formData.source_bucket}
          onChange={(e) => onChange({ source_bucket: e.target.value })}
        />
        <p className="mt-1 text-xs text-gray-500">
          The bucket name from your RustFS instance to backup
        </p>
      </div>

      {/* Backup Type Selection */}
      <div className="border-t border-gray-200 pt-4">
        <label className="input-label">Backup Destination Type</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onChange({ backup_type: 'server' })}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              formData.backup_type === 'server'
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <ServerIcon className={`h-6 w-6 mb-2 ${formData.backup_type === 'server' ? 'text-indigo-600' : 'text-gray-400'}`} />
            <div className="font-semibold text-sm">Server Storage</div>
            <div className="text-xs text-gray-500 mt-1">Compressed archives on server</div>
          </button>
          <button
            type="button"
            onClick={() => onChange({ backup_type: 'bucket' })}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              formData.backup_type === 'bucket'
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <FolderIcon className={`h-6 w-6 mb-2 ${formData.backup_type === 'bucket' ? 'text-indigo-600' : 'text-gray-400'}`} />
            <div className="font-semibold text-sm">Object Storage</div>
            <div className="text-xs text-gray-500 mt-1">Direct copy to another bucket</div>
          </button>
        </div>
      </div>

      {/* Conditional Fields Based on Backup Type */}
      {formData.backup_type === 'server' ? (
        <div>
          <label className="input-label">Backup Storage Path (Server)</label>
          <input
            type="text"
            required
            placeholder="/app/backups/my-bucket"
            className="input-field"
            value={formData.destination_path}
            onChange={(e) => onChange({ destination_path: e.target.value })}
          />
          <p className="mt-1 text-xs text-gray-500">
            Server path where backup archives (.tar.gz) will be stored
          </p>
        </div>
      ) : (
        <>
          <div>
            <label className="input-label">Destination RustFS Instance</label>
            <select
              required
              className="input-field"
              value={formData.destination_instance_id}
              onChange={(e) => onChange({ destination_instance_id: e.target.value })}
            >
              <option value="">Select destination instance</option>
              {instances?.map((instance) => (
                <option key={instance.id} value={instance.id}>
                  {instance.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              The object storage instance where backups will be stored
            </p>
          </div>
          <div>
            <label className="input-label">Destination Bucket</label>
            <input
              type="text"
              required
              placeholder="backup-bucket"
              className="input-field"
              value={formData.destination_bucket}
              onChange={(e) => onChange({ destination_bucket: e.target.value })}
            />
            <p className="mt-1 text-xs text-gray-500">
              Bucket where backup objects will be copied (will be created if it doesn't exist)
            </p>
          </div>

          {/* Backup Format Selection */}
          <div className="border-t border-gray-200 pt-4">
            <label className="input-label">Backup Format</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onChange({ compression_enabled: true })}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  formData.compression_enabled
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <ArrowDownTrayIcon className={`h-6 w-6 mb-2 ${formData.compression_enabled ? 'text-indigo-600' : 'text-gray-400'}`} />
                <div className="font-semibold text-sm">Compressed Archive</div>
                <div className="text-xs text-gray-500 mt-1">Single .tar.gz file</div>
              </button>
              <button
                type="button"
                onClick={() => onChange({ compression_enabled: false })}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  !formData.compression_enabled
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <FolderIcon className={`h-6 w-6 mb-2 ${!formData.compression_enabled ? 'text-indigo-600' : 'text-gray-400'}`} />
                <div className="font-semibold text-sm">Direct Copy</div>
                <div className="text-xs text-gray-500 mt-1">Individual objects</div>
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {formData.compression_enabled 
                ? 'All objects will be archived into a single compressed file'
                : 'Objects will be copied individually to the destination bucket'}
            </p>
          </div>

          {/* Destination Path for Bucket Backups */}
          <div>
            <label className="input-label">
              Destination Path (Optional)
            </label>
            <input
              type="text"
              placeholder={formData.compression_enabled ? "backups/production" : "restored"}
              className="input-field"
              value={formData.backup_type === 'bucket' ? (formData.destination_path === '/app/backups' ? '' : formData.destination_path) : formData.destination_path}
              onChange={(e) => onChange({ destination_path: e.target.value })}
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.compression_enabled
                ? 'Path prefix where the archive will be stored (e.g., backups/production/20240119_120000/bucket.tar.gz)'
                : 'Optional folder path in destination bucket (e.g., "restored" → restored/file.txt). Leave empty to copy to bucket root.'}
            </p>
          </div>

          {/* Compression Type for Compressed Archives */}
          {formData.compression_enabled && (
            <div>
              <label className="input-label">Compression Algorithm</label>
              <select
                className="input-field"
                value={formData.compression_type}
                onChange={(e) => onChange({ compression_type: e.target.value })}
              >
                <option value="gzip">Gzip (Recommended)</option>
                <option value="none">None (Tar only)</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Gzip provides good compression with fast performance
              </p>
            </div>
          )}
        </>
      )}

      <div>
        <label className="input-label">Schedule (Cron Expression)</label>
        <input
          type="text"
          placeholder="0 2 * * *"
          className="input-field"
          value={formData.schedule}
          onChange={(e) => onChange({ schedule: e.target.value })}
        />
        <div className="mt-2 bg-indigo-50 border border-indigo-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-indigo-900 mb-1">Common Schedules:</p>
          <ul className="text-xs text-indigo-700 space-y-1">
            <li><code className="bg-white px-1 py-0.5 rounded">0 2 * * *</code> - Daily at 2:00 AM</li>
            <li><code className="bg-white px-1 py-0.5 rounded">0 */6 * * *</code> - Every 6 hours</li>
            <li><code className="bg-white px-1 py-0.5 rounded">0 0 * * 0</code> - Weekly on Sunday</li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="input-label">Retention Days</label>
          <input
            type="number"
            min="1"
            className="input-field"
            value={formData.retention_days}
            onChange={(e) => onChange({ retention_days: parseInt(e.target.value) })}
          />
        </div>

        {formData.backup_type === 'server' && (
          <div>
            <label className="input-label">Compression</label>
            <select
              className="input-field"
              value={formData.compression_type}
              onChange={(e) => onChange({ compression_type: e.target.value })}
            >
              <option value="gzip">Gzip</option>
              <option value="none">None</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="enabled"
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          checked={formData.enabled}
          onChange={(e) => onChange({ enabled: e.target.checked })}
        />
        <label htmlFor="enabled" className="ml-2 block text-sm font-medium text-gray-900">
          Enable this backup job
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating...' : 'Create Backup Job'}
        </button>
      </div>
    </form>
  );
}
