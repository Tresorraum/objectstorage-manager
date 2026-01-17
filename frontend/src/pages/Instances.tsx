import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { api } from '../services/api';

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
  const [showModal, setShowModal] = useState(false);
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
      toast.success('Instance created successfully');
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
      toast.success('Instance updated successfully');
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">RustFS Instances</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your RustFS storage instances
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Instance
        </button>
      </div>

      {/* Instances Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {instances?.map((instance) => (
          <div key={instance.id} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">{instance.name}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  instance.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {instance.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-500">{instance.description}</p>
              <div className="mt-4 space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Endpoint:</span> {instance.endpoint}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Region:</span> {instance.region}
                </p>
                <p className="text-sm">
                  <span className="font-medium">SSL:</span> {instance.ssl ? 'Yes' : 'No'}
                </p>
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={() => handleEdit(instance)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                >
                  <PencilIcon className="h-3 w-3 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(instance.id)}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                >
                  <TrashIcon className="h-3 w-3 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingInstance ? 'Edit Instance' : 'Add New Instance'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Endpoint</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={formData.endpoint}
                    onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Access Key</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={formData.access_key}
                    onChange={(e) => setFormData({ ...formData, access_key: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Secret Key</label>
                  <input
                    type="password"
                    required={!editingInstance}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={formData.secret_key}
                    onChange={(e) => setFormData({ ...formData, secret_key: e.target.value })}
                    placeholder={editingInstance ? 'Leave blank to keep current' : ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Region</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={formData.ssl}
                    onChange={(e) => setFormData({ ...formData, ssl: e.target.checked })}
                  />
                  <label className="ml-2 block text-sm text-gray-900">Use SSL</label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingInstance(null);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}