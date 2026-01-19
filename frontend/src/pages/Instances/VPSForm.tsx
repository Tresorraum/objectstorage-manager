import React from 'react';
import { VPSFormData, VPSInstance } from './types';

interface VPSFormProps {
  formData: VPSFormData;
  editingInstance: VPSInstance | null;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (data: Partial<VPSFormData>) => void;
  onCancel: () => void;
}

export default function VPSForm({
  formData,
  editingInstance,
  isSubmitting,
  onSubmit,
  onChange,
  onCancel,
}: VPSFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-sm text-purple-800">
          <strong>VPS Server:</strong> Add a remote server where you can store database backups. 
          Supports both password and SSH key authentication.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Server Name *
          </label>
          <input
            type="text"
            required
            className="input-field"
            placeholder="My Backup Server"
            value={formData.name}
            onChange={(e) => onChange({ name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Host *
          </label>
          <input
            type="text"
            required
            className="input-field"
            placeholder="backup.example.com or 192.168.1.50"
            value={formData.host}
            onChange={(e) => onChange({ host: e.target.value })}
          />
          <p className="mt-1 text-xs text-gray-500">
            Server hostname or IP address
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SSH Port *
          </label>
          <input
            type="number"
            required
            className="input-field"
            placeholder="22"
            value={formData.port}
            onChange={(e) => onChange({ port: parseInt(e.target.value) })}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username *
          </label>
          <input
            type="text"
            required
            className="input-field"
            placeholder="root or ubuntu"
            value={formData.username}
            onChange={(e) => onChange({ username: e.target.value })}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Authentication Method *
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="auth_type"
                value="password"
                className="text-purple-600 focus:ring-purple-500"
                checked={formData.auth_type === 'password'}
                onChange={(e) => onChange({ auth_type: 'password' })}
              />
              <span className="text-sm font-medium text-gray-700">Password</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="auth_type"
                value="ssh_key"
                className="text-purple-600 focus:ring-purple-500"
                checked={formData.auth_type === 'ssh_key'}
                onChange={(e) => onChange({ auth_type: 'ssh_key' })}
              />
              <span className="text-sm font-medium text-gray-700">SSH Key</span>
            </label>
          </div>
        </div>

        {formData.auth_type === 'password' ? (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <input
              type="password"
              required={!editingInstance}
              className="input-field"
              placeholder={editingInstance ? "Leave blank to keep current password" : "Enter password"}
              value={formData.password}
              onChange={(e) => onChange({ password: e.target.value })}
            />
          </div>
        ) : (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SSH Private Key *
            </label>
            <textarea
              required={!editingInstance}
              className="input-field font-mono text-xs"
              rows={8}
              placeholder="-----BEGIN OPENSSH PRIVATE KEY-----&#10;b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABlwAAAAdzc2gtcn&#10;...&#10;-----END OPENSSH PRIVATE KEY-----"
              value={formData.ssh_key}
              onChange={(e) => onChange({ ssh_key: e.target.value })}
            />
            <p className="mt-1 text-xs text-gray-500">
              Paste your private SSH key (keep this secure!)
            </p>
          </div>
        )}

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Backup Storage Path *
          </label>
          <input
            type="text"
            required
            className="input-field font-mono"
            placeholder="/var/backups/databases"
            value={formData.backup_path}
            onChange={(e) => onChange({ backup_path: e.target.value })}
          />
          <p className="mt-1 text-xs text-gray-500">
            Directory path where backups will be stored on the server
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            className="input-field"
            rows={3}
            placeholder="Backup server in AWS us-east-1"
            value={formData.description}
            onChange={(e) => onChange({ description: e.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : editingInstance ? 'Update Server' : 'Add Server'}
        </button>
      </div>
    </form>
  );
}
