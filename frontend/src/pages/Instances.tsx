import React, { useState } from 'react';
import { PlusIcon, ServerIcon } from '@heroicons/react/24/outline';
import { useInstances } from '../hooks/useInstances';
import { useModal } from '../hooks/useModal';
import { RustFSInstance, InstanceFormData } from '../types/instance.types';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { InstanceCard } from '../components/instances/InstanceCard';
import { InstanceForm } from '../components/instances/InstanceForm';
import Modal from '../components/Modal';
import { useAuth } from '../contexts/AuthContext';

export default function Instances() {
  const { user } = useAuth();
  const { instances, isLoading, createInstance, updateInstance, deleteInstance, isCreating, isUpdating } = useInstances();
  const modal = useModal();
  const upgradeModal = useModal();

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

  const handleCreateClick = () => {
    if (!user?.is_premium && instances && instances.length >= 1) {
      upgradeModal.open();
      return;
    }
    setEditingInstance(null);
    resetForm();
    modal.open();
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
    modal.open();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const endpoint = formData.endpoint.trim();
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      alert('Please enter only the domain without http:// or https://');
      return;
    }

    if (editingInstance) {
      updateInstance(
        { id: editingInstance.id, data: formData },
        {
          onSuccess: () => {
            modal.close();
            setEditingInstance(null);
            resetForm();
          },
        }
      );
    } else {
      createInstance(formData, {
        onSuccess: () => {
          modal.close();
          resetForm();
        },
      });
    }
  };

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

  if (isLoading) {
    return <LoadingSpinner text="Loading instances..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">RustFS Instances</h1>
          <p className="text-gray-600 mt-1">Manage your RustFS storage instances</p>
        </div>
        <Button icon={<PlusIcon className="h-5 w-5" />} onClick={handleCreateClick}>
          Add Instance
        </Button>
      </div>

      {!instances || instances.length === 0 ? (
        <EmptyState
          icon={<ServerIcon className="h-16 w-16" />}
          title="No instances yet"
          description="Add your first RustFS instance to get started"
          action={
            <Button icon={<PlusIcon className="h-5 w-5" />} onClick={handleCreateClick}>
              Add Instance
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instances.map((instance) => (
            <InstanceCard
              key={instance.id}
              instance={instance}
              onEdit={handleEdit}
              onDelete={deleteInstance}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={modal.isOpen}
        onClose={modal.close}
        title={editingInstance ? 'Edit Instance' : 'Add New Instance'}
      >
        <InstanceForm
          formData={formData}
          isSubmitting={isCreating || isUpdating}
          isEditing={!!editingInstance}
          onChange={(data) => setFormData({ ...formData, ...data })}
          onSubmit={handleSubmit}
          onCancel={modal.close}
        />
      </Modal>

      <Modal isOpen={upgradeModal.isOpen} onClose={upgradeModal.close} title="Upgrade Required">
        <div className="text-center py-6">
          <p className="text-gray-600 mb-6">
            Free users can only create 1 instance. Upgrade to premium for unlimited instances.
          </p>
          <Button onClick={() => (window.location.href = '/subscribe')}>
            Upgrade to Premium
          </Button>
        </div>
      </Modal>
    </div>
  );
}
