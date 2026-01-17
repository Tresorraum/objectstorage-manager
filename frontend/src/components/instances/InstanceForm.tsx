import React from 'react';
import { InstanceFormData } from '../../types/instance.types';
import { Button } from '../ui/Button';

interface InstanceFormProps {
  formData: InstanceFormData;
  isSubmitting: boolean;
  isEditing: boolean;
  onChange: (data: Partial<InstanceFormData>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const InstanceForm: React.FC<InstanceFormProps> = ({
  formData,
  isSubmitting,
  isEditing,
  onChange,
  onSubmit,
  onCancel,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Instance Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="My RustFS Instance"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Endpoint
        </label>
        <input
          type="text"
          value={formData.endpoint}
          onChange={(e) => onChange({ endpoint: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="rustfs.example.com:9000"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter domain without http:// or https://
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Access Key
        </label>
        <input
          type="text"
          value={formData.access_key}
          onChange={(e) => onChange({ access_key: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Secret Key
        </label>
        <input
          type="password"
          value={formData.secret_key}
          onChange={(e) => onChange({ secret_key: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required={!isEditing}
          placeholder={isEditing ? 'Leave empty to keep current' : ''}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Region
        </label>
        <input
          type="text"
          value={formData.region}
          onChange={(e) => onChange({ region: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="us-east-1"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          checked={formData.ssl}
          onChange={(e) => onChange({ ssl: e.target.checked })}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-700">
          Enable SSL/TLS
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (Optional)
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => onChange({ description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          rows={3}
          placeholder="Production instance for..."
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" loading={isSubmitting} className="flex-1">
          {isEditing ? 'Update Instance' : 'Create Instance'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
