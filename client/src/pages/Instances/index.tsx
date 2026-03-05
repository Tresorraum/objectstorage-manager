import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import Modal from '../../components/Modal';
import { useAuth } from '../../contexts/AuthContext';
import {
  RustFSInstance,
  PostgresInstance,
  VPSInstance,
  InstanceType,
  InstanceFormData,
  PostgresFormData,
  VPSFormData,
} from './types';
import { instanceTypes } from './constants';
import InstanceTypeTabs from './InstanceTypeTabs';
import InstanceTypeHeader from './InstanceTypeHeader';
import EmptyState from './EmptyState';
import ComingSoonState from './ComingSoonState';
import InstanceCard from './InstanceCard';
import PostgresCard from './PostgresCard';
import VPSCard from './VPSCard';
import InstanceForm from './InstanceForm';
import PostgresForm from './PostgresForm';
import VPSForm from './VPSForm';
import UpgradeModal from './UpgradeModal';

export default function Instances() {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<InstanceType>('object-storage');
  const [showModal, setShowModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [editingInstance, setEditingInstance] = useState<any | null>(null);

  // Form states for different instance types
  const [objectStorageForm, setObjectStorageForm] = useState<InstanceFormData>({
    name: '',
    endpoint: '',
    access_key: '',
    secret_key: '',
    region: 'us-east-1',
    ssl: true,
    description: '',
  });

  const [postgresForm, setPostgresForm] = useState<PostgresFormData>({
    name: '',
    host: '',
    port: 5432,
    database: '',
    username: '',
    password: '',
    ssl: false,
    description: '',
  });

  const [vpsForm, setVPSForm] = useState<VPSFormData>({
    name: '',
    host: '',
    port: 22,
    username: '',
    auth_type: 'password',
    password: '',
    ssh_key: '',
    backup_path: '/var/backups',
    description: '',
  });

  const queryClient = useQueryClient();

  // Fetch instances based on type
  const { data: objectStorageInstances, isLoading: loadingObjectStorage } = useQuery<RustFSInstance[]>({
    queryKey: ['instances', 'object-storage'],
    queryFn: () => api.get('/rustfs/instances').then(res => res.data),
    enabled: selectedType === 'object-storage',
  });

  const { data: postgresInstances, isLoading: loadingPostgres } = useQuery<PostgresInstance[]>({
    queryKey: ['instances', 'postgres'],
    queryFn: () => api.get('/postgres/instances').then(res => res.data),
    enabled: selectedType === 'postgres',
  });

  const { data: vpsInstances, isLoading: loadingVPS } = useQuery<VPSInstance[]>({
    queryKey: ['instances', 'vps'],
    queryFn: () => api.get('/vps/instances').then(res => res.data),
    enabled: selectedType === 'vps',
  });

  // Create mutations for each type
  const createObjectStorageMutation = useMutation({
    mutationFn: (data: any) => api.post('/rustfs/instances', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instances', 'object-storage'] });
      handleSuccess('Object storage instance created successfully!');
    },
    onError: handleError,
  });

  const createPostgresMutation = useMutation({
    mutationFn: (data: any) => api.post('/postgres/instances', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instances', 'postgres'] });
      handleSuccess('PostgreSQL instance created successfully!');
    },
    onError: handleError,
  });

  const createVPSMutation = useMutation({
    mutationFn: (data: any) => api.post('/vps/instances', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instances', 'vps'] });
      handleSuccess('VPS server added successfully!');
    },
    onError: handleError,
  });

  // Update mutations
  const updateObjectStorageMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      api.put(`/rustfs/instances/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instances', 'object-storage'] });
      handleSuccess('Object storage instance updated successfully!');
    },
    onError: handleError,
  });

  const updatePostgresMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      api.put(`/postgres/instances/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instances', 'postgres'] });
      handleSuccess('PostgreSQL instance updated successfully!');
    },
    onError: handleError,
  });

  const updateVPSMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      api.put(`/vps/instances/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instances', 'vps'] });
      handleSuccess('VPS server updated successfully!');
    },
    onError: handleError,
  });

  // Delete mutations
  const deleteObjectStorageMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/rustfs/instances/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instances', 'object-storage'] });
      toast.success('Instance deleted successfully');
    },
    onError: handleError,
  });

  const deletePostgresMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/postgres/instances/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instances', 'postgres'] });
      toast.success('Instance deleted successfully');
    },
    onError: handleError,
  });

  const deleteVPSMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/vps/instances/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instances', 'vps'] });
      toast.success('Server deleted successfully');
    },
    onError: handleError,
  });

  function handleSuccess(message: string) {
    setShowModal(false);
    setEditingInstance(null);
    resetForms();
    toast.success(message);
  }

  function handleError(error: any) {
    toast.error(error.response?.data?.error || 'Operation failed');
  }

  const resetForms = () => {
    setObjectStorageForm({
      name: '',
      endpoint: '',
      access_key: '',
      secret_key: '',
      region: 'us-east-1',
      ssl: true,
      description: '',
    });
    setPostgresForm({
      name: '',
      host: '',
      port: 5432,
      database: '',
      username: '',
      password: '',
      ssl: false,
      description: '',
    });
    setVPSForm({
      name: '',
      host: '',
      port: 22,
      username: '',
      auth_type: 'password',
      password: '',
      ssh_key: '',
      backup_path: '/var/backups',
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

    const currentInstances = getCurrentInstances();
    if (!user?.is_premium && currentInstances && currentInstances.length >= 1) {
      setShowUpgradeModal(true);
      return;
    }
    
    setEditingInstance(null);
    resetForms();
    setShowModal(true);
  };

  const getCurrentInstances = () => {
    switch (selectedType) {
      case 'object-storage':
        return objectStorageInstances;
      case 'postgres':
        return postgresInstances;
      case 'vps':
        return vpsInstances;
      default:
        return [];
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    switch (selectedType) {
      case 'object-storage':
        handleObjectStorageSubmit();
        break;
      case 'postgres':
        handlePostgresSubmit();
        break;
      case 'vps':
        handleVPSSubmit();
        break;
    }
  };

  const handleObjectStorageSubmit = () => {
    const endpoint = objectStorageForm.endpoint.trim();
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      toast.error('Please enter only the domain without http:// or https://');
      return;
    }
    
    if (editingInstance) {
      updateObjectStorageMutation.mutate({ id: editingInstance.id, data: objectStorageForm });
    } else {
      createObjectStorageMutation.mutate(objectStorageForm);
    }
  };

  const handlePostgresSubmit = () => {
    if (editingInstance) {
      updatePostgresMutation.mutate({ id: editingInstance.id, data: postgresForm });
    } else {
      createPostgresMutation.mutate(postgresForm);
    }
  };

  const handleVPSSubmit = () => {
    if (editingInstance) {
      updateVPSMutation.mutate({ id: editingInstance.id, data: vpsForm });
    } else {
      createVPSMutation.mutate(vpsForm);
    }
  };

  const handleEdit = (instance: any) => {
    setEditingInstance(instance);
    
    switch (selectedType) {
      case 'object-storage':
        setObjectStorageForm({
          name: instance.name,
          endpoint: instance.endpoint,
          access_key: instance.access_key,
          secret_key: '',
          region: instance.region,
          ssl: instance.ssl,
          description: instance.description,
        });
        break;
      case 'postgres':
        setPostgresForm({
          name: instance.name,
          host: instance.host,
          port: instance.port,
          database: instance.database,
          username: instance.username,
          password: '',
          ssl: instance.ssl,
          description: instance.description,
        });
        break;
      case 'vps':
        setVPSForm({
          name: instance.name,
          host: instance.host,
          port: instance.port,
          username: instance.username,
          auth_type: instance.auth_type,
          password: '',
          ssh_key: '',
          backup_path: instance.backup_path,
          description: instance.description,
        });
        break;
    }
    
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (!window.confirm('Are you sure you want to delete this instance?')) return;
    
    switch (selectedType) {
      case 'object-storage':
        deleteObjectStorageMutation.mutate(id);
        break;
      case 'postgres':
        deletePostgresMutation.mutate(id);
        break;
      case 'vps':
        deleteVPSMutation.mutate(id);
        break;
    }
  };

  const currentTypeConfig = instanceTypes.find(t => t.id === selectedType);
  const currentInstances = getCurrentInstances();
  const isLoading = loadingObjectStorage || loadingPostgres || loadingVPS;
  const isSubmitting = 
    createObjectStorageMutation.isPending || 
    createPostgresMutation.isPending || 
    createVPSMutation.isPending ||
    updateObjectStorageMutation.isPending ||
    updatePostgresMutation.isPending ||
    updateVPSMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const renderInstanceCards = () => {
    if (!currentInstances || currentInstances.length === 0) {
      return <EmptyState onAddInstance={() => setShowModal(true)} />;
    }

    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {currentInstances.map((instance: any) => {
          switch (selectedType) {
            case 'object-storage':
              return (
                <InstanceCard
                  key={instance.id}
                  instance={instance}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              );
            case 'postgres':
              return (
                <PostgresCard
                  key={instance.id}
                  instance={instance}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              );
            case 'vps':
              return (
                <VPSCard
                  key={instance.id}
                  instance={instance}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              );
            default:
              return null;
          }
        })}
      </div>
    );
  };

  const renderForm = () => {
    switch (selectedType) {
      case 'object-storage':
        return (
          <InstanceForm
            formData={objectStorageForm}
            editingInstance={editingInstance}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onChange={(data) => setObjectStorageForm(prev => ({ ...prev, ...data }))}
            onCancel={() => {
              setShowModal(false);
              setEditingInstance(null);
              resetForms();
            }}
          />
        );
      case 'postgres':
        return (
          <PostgresForm
            formData={postgresForm}
            editingInstance={editingInstance}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onChange={(data) => setPostgresForm(prev => ({ ...prev, ...data }))}
            onCancel={() => {
              setShowModal(false);
              setEditingInstance(null);
              resetForms();
            }}
          />
        );
      case 'vps':
        return (
          <VPSForm
            formData={vpsForm}
            editingInstance={editingInstance}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onChange={(data) => setVPSForm(prev => ({ ...prev, ...data }))}
            onCancel={() => {
              setShowModal(false);
              setEditingInstance(null);
              resetForms();
            }}
          />
        );
      default:
        return null;
    }
  };

  const getModalTitle = () => {
    const action = editingInstance ? 'Edit' : 'Add';
    switch (selectedType) {
      case 'object-storage':
        return `${action} Object Storage Instance`;
      case 'postgres':
        return `${action} PostgreSQL Instance`;
      case 'vps':
        return `${action} VPS Server`;
      default:
        return `${action} Instance`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Instances</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your storage, database, and server instances
          </p>
        </div>
      </div>

      <InstanceTypeTabs
        types={instanceTypes}
        selectedType={selectedType}
        onTypeClick={handleTypeClick}
      />

      {currentTypeConfig && (
        <InstanceTypeHeader
          typeConfig={currentTypeConfig}
          onAddInstance={handleAddInstance}
        />
      )}

      {currentTypeConfig?.available ? (
        renderInstanceCards()
      ) : (
        currentTypeConfig && <ComingSoonState typeConfig={currentTypeConfig} />
      )}

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingInstance(null);
          resetForms();
        }}
        title={getModalTitle()}
        size="lg"
      >
        {renderForm()}
      </Modal>

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
