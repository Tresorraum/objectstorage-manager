import React from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { InstanceFormData, RustFSInstance } from './types';

interface InstanceFormProps {
  formData: InstanceFormData;
  editingInstance: RustFSInstance | null;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (data: Partial<InstanceFormData>) => void;
  onCancel: () => void;
}

export default function InstanceForm({
  formData,
  editingInstance,
  isSubmitting,
  onSubmit,
  onChange,
  onCancel,
}: InstanceFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <InformationCircleIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="ml-3">
            <p className="text-sm font-medium text-blue-900">
              Important: Enter domain without protocol
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Example: <code className="bg-blue-100 px-1.5 py-0.5 rounded">storage.example.com</code> or <code className="bg-blue-100 px-1.5 py-0.5 rounded">s3.amazonaws.com</code>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Name */}
        <div className="sm:col-span-2">
          <label className="input-label">
            Instance Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            className="input-field"
            placeholder="My Storage Instance"
            value={formData.name}
            onChange={(e) => onChange({ name: e.target.value })}
          />
        </div>

        {/* Endpoint */}
        <div className="sm:col-span-2">
          <label className="input-label">
            Endpoint <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            className="input-field font-mono text-sm"
            placeholder="storage.example.com"
            value={formData.endpoint}
            onChange={(e) => onChange({ endpoint: e.target.value })}
          />
          <p className="mt-1.5 text-xs text-gray-500">
            Do not include http:// or https:// prefix
          </p>
        </div>

        {/* Access Key */}
        <div className="sm:col-span-2">
          <label className="input-label">
            Access Key <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            className="input-field font-mono text-sm"
            placeholder="AKIAIOSFODNN7EXAMPLE"
            value={formData.access_key}
            onChange={(e) => onChange({ access_key: e.target.value })}
          />
        </div>

        {/* Secret Key */}
        <div className="sm:col-span-2">
          <label className="input-label">
            Secret Key {!editingInstance && <span className="text-red-500">*</span>}
          </label>
          <input
            type="password"
            required={!editingInstance}
            className="input-field font-mono text-sm"
            placeholder={editingInstance ? 'Leave blank to keep current' : 'wJalrXUtnFEMI/K7MDENG/bPxRfiCY'}
            value={formData.secret_key}
            onChange={(e) => onChange({ secret_key: e.target.value })}
          />
          {editingInstance && (
            <p className="mt-1.5 text-xs text-gray-500">
              Leave blank to keep the existing secret key
            </p>
          )}
        </div>

        {/* Region */}
        <div>
          <label className="input-label">Region</label>
          <input
            type="text"
            className="input-field"
            placeholder="us-east-1"
            value={formData.region}
            onChange={(e) => onChange({ region: e.target.value })}
          />
        </div>

        {/* SSL Toggle */}
        <div className="flex items-center pt-8">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={formData.ssl}
              onChange={(e) => onChange({ ssl: e.target.checked })}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            <span className="ml-3 text-sm font-semibold text-gray-700">Use SSL/TLS</span>
          </label>
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label className="input-label">Description</label>
          <textarea
            className="input-field resize-none"
            rows={3}
            placeholder="Optional description for this instance..."
            value={formData.description}
            onChange={(e) => onChange({ description: e.target.value })}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-5 border-t border-gray-200">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            editingInstance ? 'Update Instance' : 'Create Instance'
          )}
        </button>
      </div>
    </form>
  );
}
