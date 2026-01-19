import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, ServerIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import Modal from '../../components/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { BackupJob, BackupFormData, RustFSInstance } from './types';
import BackupStats from './BackupStats';
import BackupFilters from './BackupFilters';
import BackupTable from './BackupTable';
import BackupMobileCard from './BackupMobileCard';
import BackupJobForm from './BackupJobForm';
import BackupHistoryModal from './BackupHistoryModal';
import EnterpriseModal from './EnterpriseModal';
import UpgradeModal from './UpgradeModal';

export default function Backups() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<BackupJob | null>(null);
  const [showBackupRuns, setShowBackupRuns] = useState(false);
  const [showEnterpriseModal, setShowEnterpriseModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedJobs, setSelectedJobs] = useState<number[]>([]);
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [formData, setFormData] = useState<BackupFormData>({
    name: '',
    source_type: 'object_storage',
    rustfs_instance_id: '',
    postgres_instance_id: '',
    vps_instance_id: '',
    source_bucket: '',
    source_path: '',
    backup_type: 'server',
    destination_path: '/app/backups',
    destination_instance_id: '',
    destination_bucket: '',
    schedule: '',
    enabled: true,
    retention_days: 30,
    compression_type: 'gzip',
    compression_enabled: true,
  });

  const queryClient = useQueryClient();

  const { data: backupJobs, isLoading } = useQuery<BackupJob[]>({
    queryKey: ['backup-jobs'],
    queryFn: () => api.get('/backup/jobs').then(res => res.data),
    refetchInterval: 5000,
    staleTime: 4000,
  });

  const { data: instances } = useQuery<RustFSInstance[]>({
    queryKey: ['instances'],
    queryFn: () => api.get('/rustfs/instances').then(res => res.data),
  });

  const { data: postgresInstances } = useQuery({
    queryKey: ['postgres-instances'],
    queryFn: () => api.get('/postgres/instances').then(res => res.data),
  });

  const { data: vpsInstances } = useQuery({
    queryKey: ['vps-instances'],
    queryFn: () => api.get('/vps/instances').then(res => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/backup/jobs', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backup-jobs'] });
      setShowModal(false);
      resetForm();
      toast.success('Backup job created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create backup job');
    },
  });

  const runMutation = useMutation({
    mutationFn: (id: number) => api.post(`/backup/jobs/${id}/run`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backup-jobs'] });
      toast.success('Backup job started successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to start backup job');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/backup/jobs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backup-jobs'] });
      toast.success('Backup job deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete backup job');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      source_type: 'object_storage',
      rustfs_instance_id: '',
      postgres_instance_id: '',
      vps_instance_id: '',
      source_bucket: '',
      source_path: '',
      backup_type: 'server',
      destination_path: '/app/backups',
      destination_instance_id: '',
      destination_bucket: '',
      schedule: '',
      enabled: true,
      retention_days: 30,
      compression_type: 'gzip',
      compression_enabled: true,
    });
  };

  const viewBackupRuns = (job: BackupJob) => {
    setSelectedJob(job);
    setShowBackupRuns(true);
  };

  const toggleJobSelection = (jobId: number) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const toggleAllJobs = () => {
    if (selectedJobs.length === filteredAndSortedJobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(filteredAndSortedJobs.map(job => job.id));
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedJobs.length} backup job(s)?`)) {
      selectedJobs.forEach(id => deleteMutation.mutate(id));
      setSelectedJobs([]);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setTypeFilter('all');
  };

  // Filter and sort jobs
  const filteredAndSortedJobs = useMemo(() => {
    if (!backupJobs) return [];

    let filtered = backupJobs.filter(job => {
      const sourceName = job.rustfs_instance?.name || job.postgres_instance?.name || job.vps_instance?.name || '';
      const matchesSearch = job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           job.source_bucket.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           sourceName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      const matchesType = typeFilter === 'all' || job.backup_type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });

    filtered.sort((a, b) => {
      let aVal: any = a[sortField as keyof BackupJob];
      let bVal: any = b[sortField as keyof BackupJob];

      if (sortField === 'instance') {
        aVal = a.rustfs_instance?.name || a.postgres_instance?.name || a.vps_instance?.name || '';
        bVal = b.rustfs_instance?.name || b.postgres_instance?.name || b.vps_instance?.name || '';
      }

      if (typeof aVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return filtered;
  }, [backupJobs, searchQuery, statusFilter, typeFilter, sortField, sortDirection]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.backup_type === 'server' && !user?.is_premium) {
      setShowEnterpriseModal(true);
      return;
    }

    const payload: any = {
      ...formData,
      source_type: formData.source_type,
    };

    // Set the appropriate instance ID based on source type
    if (formData.source_type === 'object_storage' && formData.rustfs_instance_id) {
      payload.rustfs_instance_id = parseInt(formData.rustfs_instance_id);
      payload.postgres_instance_id = null;
      payload.vps_instance_id = null;
    } else if (formData.source_type === 'postgres' && formData.postgres_instance_id) {
      payload.postgres_instance_id = parseInt(formData.postgres_instance_id);
      payload.rustfs_instance_id = null;
      payload.vps_instance_id = null;
    } else if (formData.source_type === 'vps' && formData.vps_instance_id) {
      payload.vps_instance_id = parseInt(formData.vps_instance_id);
      payload.rustfs_instance_id = null;
      payload.postgres_instance_id = null;
    }

    if (formData.backup_type === 'bucket' && formData.destination_instance_id) {
      payload.destination_instance_id = parseInt(formData.destination_instance_id);
    } else {
      delete payload.destination_instance_id;
      delete payload.destination_bucket;
    }

    createMutation.mutate(payload);
  };

  const handleFormChange = (data: Partial<BackupFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleRun = (id: number) => {
    runMutation.mutate(id);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this backup job?')) {
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Backup Jobs</h1>
          <p className="mt-1 sm:mt-2 text-sm text-gray-600">
            Manage automated backup jobs with advanced filtering and bulk actions
          </p>
        </div>
        <button
          onClick={() => {
            if (!user?.is_premium && backupJobs && backupJobs.length >= 2) {
              setShowUpgradeModal(true);
              return;
            }
            setShowModal(true);
          }}
          className="btn-primary w-full sm:w-auto"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Backup Job
        </button>
      </div>

      {/* Filters and Search Bar */}
      <BackupFilters
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        typeFilter={typeFilter}
        selectedJobs={selectedJobs}
        onSearchChange={setSearchQuery}
        onStatusFilterChange={setStatusFilter}
        onTypeFilterChange={setTypeFilter}
        onBulkDelete={handleBulkDelete}
        onClearSelection={() => setSelectedJobs([])}
      />

      {/* Stats Cards */}
      <BackupStats jobs={backupJobs || []} />

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Mobile Card View */}
        <div className="block lg:hidden divide-y divide-gray-200">
          {filteredAndSortedJobs.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ServerIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No backup jobs found</h3>
                <p className="text-sm text-gray-500 mb-6">
                  {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'Try adjusting your search filters'
                    : 'Get started by creating your first backup job'}
                </p>
                {!searchQuery && statusFilter === 'all' && typeFilter === 'all' && (
                  <button onClick={() => setShowModal(true)} className="btn-primary">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Create Backup Job
                  </button>
                )}
              </div>
            </div>
          ) : (
            filteredAndSortedJobs.map((job) => (
              <BackupMobileCard
                key={job.id}
                job={job}
                isSelected={selectedJobs.includes(job.id)}
                onToggleSelection={toggleJobSelection}
                onRun={handleRun}
                onViewHistory={viewBackupRuns}
                onDelete={handleDelete}
                isRunning={runMutation.isPending}
              />
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <BackupTable
          jobs={filteredAndSortedJobs}
          selectedJobs={selectedJobs}
          sortField={sortField}
          sortDirection={sortDirection}
          onToggleSelection={toggleJobSelection}
          onToggleAll={toggleAllJobs}
          onSort={handleSort}
          onRun={handleRun}
          onViewHistory={viewBackupRuns}
          onDelete={handleDelete}
          isRunning={runMutation.isPending}
        />

        {/* Table Footer with Results Count */}
        {filteredAndSortedJobs.length > 0 && (
          <div className="bg-gray-50 px-4 sm:px-6 py-3 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{filteredAndSortedJobs.length}</span> of{' '}
                <span className="font-medium">{backupJobs?.length || 0}</span> backup jobs
              </p>
              {(searchQuery || statusFilter !== 'all' || typeFilter !== 'all') && (
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Backup Job Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title="Create Backup Job"
        size="lg"
      >
        <BackupJobForm
          formData={formData}
          instances={instances}
          postgresInstances={postgresInstances}
          vpsInstances={vpsInstances}
          isSubmitting={createMutation.isPending}
          onSubmit={handleSubmit}
          onChange={handleFormChange}
          onCancel={() => {
            setShowModal(false);
            resetForm();
          }}
        />
      </Modal>

      {/* Backup History Modal */}
      <Modal
        isOpen={showBackupRuns}
        onClose={() => {
          setShowBackupRuns(false);
          setSelectedJob(null);
        }}
        title={`Backup History: ${selectedJob?.name || ''}`}
        size="xl"
      >
        {selectedJob && (
          <BackupHistoryModal
            job={selectedJob}
            onClose={() => {
              setShowBackupRuns(false);
              setSelectedJob(null);
            }}
          />
        )}
      </Modal>

      {/* Enterprise Modal */}
      <Modal
        isOpen={showEnterpriseModal}
        onClose={() => setShowEnterpriseModal(false)}
        title="Premium Feature"
        size="md"
      >
        <EnterpriseModal
          onConfirm={() => {
            setShowEnterpriseModal(false);
            window.location.href = '/subscribe';
          }}
          onCancel={() => setShowEnterpriseModal(false)}
        />
      </Modal>

      {/* Upgrade Modal for Backup Limit */}
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
