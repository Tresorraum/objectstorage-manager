import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import Modal from '../../components/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { RustFSInstance, InstanceType, InstanceFormData } from './types';
import { instanceTypes } from './constants';
import InstanceTypeTabs from './InstanceTypeTabs';
import InstanceTypeHeader from './InstanceTypeHeader';
import EmptyState from './EmptyState';
import ComingSoonState from './ComingSoonState';
import InstanceCard from './InstanceCard';
import InstanceForm from './InstanceForm';
import UpgradeModal from './UpgradeModal';

export default function Instances() {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<InstanceType>('object-storage');
  const [showModal, setShowModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [editingInstance, setEditingInstance] = useState<RustFSInstance | null>(null);
  const [formData, setFormData] = useState<InstanceFormData>({
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

  const handleTypeClick = (type: InstanceType) => {
    const typeConfig = instanceTypes.find(t => t.id === type);
    if (!typeConfig?.available) {
      toast('Coming soon! This feature is under development.', {
        icon: '🚀',
        duration: 3000,
      });
      return;
    }
    setSelectedType(type);
  };

  const handleAddInstance = () => {
    const typeConfig = instanceTypes.find(t => t.id === selectedType);
    if (!typeConfig?.available) {
      toast('Coming soon! This feature is under development.', {
        icon: '🚀',
        duration: 3000,
      });
      return;
    }

    if (!user?.is_premium && instances && instances.length >= 1) {
      setShowUpgradeModal(true);
      return;
    }
    
    setEditingInstance(null);
    resetForm();
    setShowModal(true);
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

  const handleFormChange = (data: Partial<InstanceFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
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

  const currentTypeConfig = instanceTypes.find(t => t.id === selectedType);

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
          <h1 className="text-3xl font-bold text-gray-900">Instances</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your storage and database instances
          </p>
        </div>
      </div>

      {/* Instance Type Tabs */}
      <InstanceTypeTabs
        types={instanceTypes}
        selectedType={selectedType}
        onTypeClick={handleTypeClick}
      />

      {/* Selected Type Info & Add Button */}
      {currentTypeConfig && (
        <InstanceTypeHeader
          typeConfig={currentTypeConfig}
          onAddInstance={handleAddInstance}
        />
      )}

      {/* Content based on selected type */}
      {selectedType === 'object-storage' ? (
        <>
          {instances?.length === 0 ? (
            <EmptyState onAddInstance={() => setShowModal(true)} />
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {instances?.map((instance: RustFSInstance) => (
                <InstanceCard
                  key={instance.id}
                  instance={instance}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        currentTypeConfig && <ComingSoonState typeConfig={currentTypeConfig} />
      )}

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
        <InstanceForm
          formData={formData}
          editingInstance={editingInstance}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onSubmit={handleSubmit}
          onChange={handleFormChange}
          onCancel={() => {
            setShowModal(false);
            setEditingInstance(null);
            resetForm();
          }}
        />
      </Modal>

      {/* Upgrade Modal */}
      <Modal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Upgrade to Premium"
      >
        <UpgradeModal
          onConfirm={() => window.location.href = '/subscribe'}
          onCancel={() => setShowUpgradeModal(false)}
        />
      </Modal>
    </div>
  );
}
