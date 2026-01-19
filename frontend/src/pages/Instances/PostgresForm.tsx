import React from 'react';
import { PostgresFormData, PostgresInstance } from './types';

interface PostgresFormProps {
  formData: PostgresFormData;
  editingInstance: PostgresInstance | null;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (data: Partial<PostgresFormData>) => void;
  onCancel: () => void;
}

export default function PostgresForm({
  formData,
  editingInstance,
  isSubmitting,
  onSubmit,
  onChange,
  onCancel,
}: PostgresFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>PostgreSQL Connection:</strong> Enter your PostgreSQL database credentials. 
          You'll be able to backup this database to your local machine or to a VPS server.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Instance Name *
          </label>
          <input
            type="text"
            required
            className="input-field"
            placeholder="My Production DB"
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
            placeholder="localhost or 192.168.1.100"
            value={formData.host}
            onChange={(e) => onChange({ host: e.target.value })}
          />
          <p className="mt-1 text-xs text-gray-500">
            Database server hostname or IP address
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Port *
          </label>
          <input
            type="number"
            required
            className="input-field"
            placeholder="5432"
            value={formData.port}
            onChange={(e) => onChange({ port: parseInt(e.target.value) })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Database Name *
          </label>
          <input
            type="text"
            required
            className="input-field"
            placeholder="myapp_production"
            value={formData.database}
            onChange={(e) => onChange({ database: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username *
          </label>
          <input
            type="text"
            required
            className="input-field"
            placeholder="postgres"
            value={formData.username}
            onChange={(e) => onChange({ username: e.target.value })}
          />
        </div>

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

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            className="input-field"
            rows={3}
            placeholder="Production database for main application"
            value={formData.description}
            onChange={(e) => onChange({ description: e.target.value })}
          />
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              checked={formData.ssl}
              onChange={(e) => onChange({ ssl: e.target.checked })}
            />
            <span className="text-sm font-medium text-gray-700">
              Use SSL/TLS Connection
            </span>
          </label>
          <p className="mt-1 ml-6 text-xs text-gray-500">
            Enable for secure encrypted connections
          </p>
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
          {isSubmitting ? 'Saving...' : editingInstance ? 'Update Instance' : 'Add Instance'}
        </button>
      </div>
    </form>
  );
}
