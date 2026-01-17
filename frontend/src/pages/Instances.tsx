import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, TrashIcon, PencilIcon, InformationCircleIcon, CheckCircleIcon, ExclamationTriangleIcon, ServerIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import Modal from '../components/Modal';
import { useAuth } from '../contexts/AuthContext';

interface RustFSInstance {
  id: number;
  name: string;
  endpoint: string;
  access_key: string;
  region: string;
  ssl: boolean;
  description: string;
  status: string;
  created_at: string;
}

export default function Instances() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [editingInstance, setEditingInstance] = useState<RustFSInstance | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    endpoint: '',
    access_key: '',
    secret_key: '',
    region: 'us-east-1',
    ssl: true,
    description: '',
  });

  const queryClient = useQueryClient();

  const { data: instances, isLoading } = useQuery<RustFSInstance[]>({
    queryKey: ['instances'],
    queryFn: () => api.get('/rustfs/instances').then(res => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/rustfs/instances', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instances'] });
      setShowModal(false);
      resetForm();
      toast.success('Instance created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create instance');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      api.put(`/rustfs/instances/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instances'] });
      setShowModal(false);
      setEditingInstance(null);
      resetForm();
      toast.success('Instance updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update instance');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/rustfs/instances/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instances'] });
      toast.success('Instance deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete instance');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      endpoint: '',
      access_key: '',
      secret_key: '',
      region: 'us-east-1',
      ssl: true,
      description: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const endpoint = formData.endpoint.trim();
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      toast.error('Please enter only the domain without http:// or https://');
      return;
    }
    
    if (editingInstance) {
      updateMutation.mutate({ id: editingInstance.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (instance: RustFSInstance) => {
    setEditingInstance(instance);
    setFormData({
      name: instance.name,
      endpoint: instance.endpoint,
      access_key: instance.access_key,
      secret_key: '',
      region: instance.region,
      ssl: instance.ssl,
      description: instance.description,
    });
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this instance?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">RustFS Instances</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your S3-compatible storage instances
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => {
              // Check if user is premium or has less than 1 instance
              if (!user?.is_premium && instances && instances.length >= 1) {
                setShowUpgradeModal(true);
                return;
              }
              setEditingInstance(null);
              resetForm();
              setShowModal(true);
            }}
            className="btn-primary w-full sm:w-auto"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Instance
          </button>
        </div>
      </div>

      {/* Empty State */}
      {instances?.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
            <ServerIcon className="h-8 w-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No instances yet</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            Get started by creating your first storage instance to manage your S3-compatible storage.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Your First Instance
          </button>
        </div>
      )}

      {/* Instances Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {instances?.map((instance) => (
          <div key={instance.id} className="card p-6 hover:border-indigo-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate mb-2">{instance.name}</h3>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  instance.status === 'active' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {instance.status === 'active' ? (
                    <CheckCircleIcon className="h-3.5 w-3.5 mr-1.5" />
                  ) : (
                    <ExclamationTriangleIcon className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  {instance.status}
                </span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">
              {instance.description || 'No description provided'}
            </p>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-start">
                <span className="text-xs font-medium text-gray-500 w-20 flex-shrink-0 pt-0.5">Endpoint</span>
                <span className="text-sm text-gray-900 font-mono break-all">{instance.endpoint}</span>
              </div>
              <div className="flex items-center">
                <span className="text-xs font-medium text-gray-500 w-20 flex-shrink-0">Region</span>
                <span className="text-sm text-gray-900">{instance.region}</span>
              </div>
              <div className="flex items-center">
                <span className="text-xs font-medium text-gray-500 w-20 flex-shrink-0">SSL</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  instance.ssl ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {instance.ssl ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(instance)}
                className="flex-1 btn-secondary py-2 text-xs"
              >
                <PencilIcon className="h-4 w-4 mr-1.5" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(instance.id)}
                className="flex-1 btn-danger py-2 text-xs"
              >
                <TrashIcon className="h-4 w-4 mr-1.5" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingInstance(null);
          resetForm();
        }}
        title={editingInstance ? 'Edit Instance' : 'Add New Instance'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
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
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, access_key: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, secret_key: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              />
            </div>

            {/* SSL Toggle */}
            <div className="flex items-center pt-8">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.ssl}
                  onChange={(e) => setFormData({ ...formData, ssl: e.target.checked })}
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
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-5 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingInstance(null);
                resetForm();
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isPending || updateMutation.isPending ? (
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
      </Modal>

      {/* Upgrade Modal */}
      <Modal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Upgrade to Premium"
      >
        <div className="text-center py-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Instance Limit Reached</h3>
          <p className="text-sm text-gray-600 mb-6">
            Free users can only create 1 instance. Upgrade to premium for unlimited instances and more features!
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={() => window.location.href = '/subscribe'}
              className="btn-primary"
            >
              Upgrade to Premium
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
