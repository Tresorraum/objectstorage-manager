import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  PlusIcon, 
  PlayIcon, 
  TrashIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  CalendarIcon,
  ServerIcon,
  FolderIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import Modal from '../components/Modal';
import { useAuth } from '../contexts/AuthContext';

interface BackupJob {
  id: number;
  name: string;
  rustfs_instance_id: number;
  source_bucket: string;
  backup_type: string;
  destination_path: string;
  destination_instance_id?: number;
  destination_bucket: string;
  schedule: string;
  enabled: boolean;
  retention_days: number;
  compression_type: string;
  compression_enabled: boolean;
  last_run?: string;
  next_run?: string;
  status: string;
  last_error_msg?: string;
  rustfs_instance: {
    name: string;
  };
  destination_instance?: {
    name: string;
  };
  backup_runs?: BackupRun[];
}

interface BackupRun {
  id: number;
  backup_job_id: number;
  status: string;
  started_at: string;
  completed_at?: string;
  files_count: number;
  bytes_count: number;
  backup_path: string;
  error_msg?: string;
}

interface RustFSInstance {
  id: number;
  name: string;
}

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
  const [formData, setFormData] = useState({
    name: '',
    rustfs_instance_id: '',
    source_bucket: '',
    backup_type: 'server',
    destination_path: '/app/backups',
    destination_instance_id: '',
    destination_bucket: '',
    schedule: '',
    enabled: true,
    retention_days: 30,
    compression_type: 'gzip',
    compression_enabled: true, // For bucket backups: true = tar.gz, false = direct copy
  });

  const queryClient = useQueryClient();

  const { data: backupJobs, isLoading } = useQuery<BackupJob[]>({
    queryKey: ['backup-jobs'],
    queryFn: () => api.get('/backup/jobs').then(res => res.data),
    refetchInterval: 5000, // Refresh every 5 seconds to see running jobs
    staleTime: 4000,
  });

  const { data: instances } = useQuery<RustFSInstance[]>({
    queryKey: ['instances'],
    queryFn: () => api.get('/rustfs/instances').then(res => res.data),
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
      rustfs_instance_id: '',
      source_bucket: '',
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

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
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

  // Filter and sort jobs
  const filteredAndSortedJobs = useMemo(() => {
    if (!backupJobs) return [];

    let filtered = backupJobs.filter(job => {
      const matchesSearch = job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           job.source_bucket.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           job.rustfs_instance.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      const matchesType = typeFilter === 'all' || job.backup_type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal: any = a[sortField as keyof BackupJob];
      let bVal: any = b[sortField as keyof BackupJob];

      if (sortField === 'instance') {
        aVal = a.rustfs_instance.name;
        bVal = b.rustfs_instance.name;
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
    
    // Check if server backup type is selected and user is not premium
    if (formData.backup_type === 'server' && !user?.is_premium) {
      setShowEnterpriseModal(true);
      return;
    }

    const payload: any = {
      ...formData,
      rustfs_instance_id: parseInt(formData.rustfs_instance_id),
    };

    // Only include destination_instance_id if backup_type is bucket
    if (formData.backup_type === 'bucket' && formData.destination_instance_id) {
      payload.destination_instance_id = parseInt(formData.destination_instance_id);
    } else {
      delete payload.destination_instance_id;
      delete payload.destination_bucket;
    }

    console.log('Submitting backup job with compression_enabled:', payload.compression_enabled);
    createMutation.mutate(payload);
  };

  const handleEnterpriseConfirm = () => {
    setShowEnterpriseModal(false);
    // Navigate to subscription page
    window.location.href = '/subscribe';
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
            // Check if user is premium or has less than 5 backup jobs. this needs to be handled from backend
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="sm:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, bucket, or instance..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="running">Running</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="server">Server</option>
              <option value="bucket">Bucket</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedJobs.length > 0 && (
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-indigo-50 border border-indigo-200 rounded-lg p-3">
            <span className="text-sm font-medium text-indigo-900">
              {selectedJobs.length} job(s) selected
            </span>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center justify-center px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedJobs([])}
                className="inline-flex items-center justify-center px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <XMarkIcon className="h-4 w-4 mr-1" />
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Jobs</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{backupJobs?.length || 0}</p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-3">
              <ServerIcon className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Running</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {backupJobs?.filter(j => j.status === 'running').length || 0}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <ArrowPathIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {backupJobs?.filter(j => j.status === 'completed').length || 0}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <CheckIcon className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {backupJobs?.filter(j => j.status === 'failed').length || 0}
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>

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
                  <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Create Backup Job
                  </button>
                )}
              </div>
            </div>
          ) : (
            filteredAndSortedJobs.map((job) => (
              <div key={job.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedJobs.includes(job.id)}
                      onChange={() => toggleJobSelection(job.id)}
                      className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{job.name}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          job.status === 'completed' 
                            ? 'bg-green-100 text-green-700'
                            : job.status === 'running'
                            ? 'bg-blue-100 text-blue-700'
                            : job.status === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {job.status === 'running' && (
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2 animate-pulse"></span>
                          )}
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          job.backup_type === 'server'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {job.backup_type === 'server' ? 'Server' : 'Bucket'}
                        </span>
                        {!job.enabled && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            Disabled
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="ml-7 space-y-2 text-xs">
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium w-20">Source:</span>
                    <span className="text-gray-900">{job.rustfs_instance.name} / {job.source_bucket}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium w-20">Schedule:</span>
                    <span className="font-mono text-gray-900">{job.schedule || 'Manual'}</span>
                  </div>
                  {job.last_run && (
                    <div className="flex items-center text-gray-600">
                      <span className="font-medium w-20">Last Run:</span>
                      <span className="text-gray-900">{new Date(job.last_run).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="ml-7 mt-3 flex gap-2">
                  <button
                    onClick={() => handleRun(job.id)}
                    disabled={runMutation.isPending || job.status === 'running'}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <PlayIcon className="h-4 w-4 mr-1" />
                    Run
                  </button>
                  <button
                    onClick={() => viewBackupRuns(job)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <DocumentTextIcon className="h-4 w-4 mr-1" />
                    History
                  </button>
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedJobs.length === filteredAndSortedJobs.length && filteredAndSortedJobs.length > 0}
                    onChange={toggleAllJobs}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Job Name
                    {sortField === 'name' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('instance')}
                >
                  <div className="flex items-center gap-1">
                    Source
                    {sortField === 'instance' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destination
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('backup_type')}
                >
                  <div className="flex items-center gap-1">
                    Type
                    {sortField === 'backup_type' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    Status
                    {sortField === 'status' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Run
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedJobs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <ServerIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No backup jobs found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                        ? 'Try adjusting your filters'
                        : 'Get started by creating a new backup job'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAndSortedJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedJobs.includes(job.id)}
                        onChange={() => toggleJobSelection(job.id)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{job.name}</div>
                          {!job.enabled && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 mt-1">
                              Disabled
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{job.rustfs_instance.name}</div>
                      <div className="text-xs text-gray-500">{job.source_bucket}</div>
                    </td>
                    <td className="px-6 py-4">
                      {job.backup_type === 'server' ? (
                        <div className="text-xs">
                          <div className="text-gray-900 font-mono">{job.destination_path}</div>
                        </div>
                      ) : (
                        <div className="text-xs">
                          <div className="text-gray-900">{job.destination_instance?.name || 'N/A'}</div>
                          <div className="text-gray-500">{job.destination_bucket}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        job.backup_type === 'server'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {job.backup_type === 'server' ? 'Server' : 'Bucket'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-mono text-gray-900">
                        {job.schedule || 'Manual'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        job.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : job.status === 'running'
                          ? 'bg-blue-100 text-blue-800'
                          : job.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {job.status === 'running' && (
                          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2 animate-pulse"></span>
                        )}
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {job.last_run ? new Date(job.last_run).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleRun(job.id)}
                          disabled={runMutation.isPending || job.status === 'running'}
                          className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Run backup"
                        >
                          <PlayIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => viewBackupRuns(job)}
                          className="text-gray-600 hover:text-gray-900"
                          title="View history"
                        >
                          <DocumentTextIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(job.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete job"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setTypeFilter('all');
                  }}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title="Create Backup Job"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="input-label">Job Name</label>
            <input
              type="text"
              required
              placeholder="e.g., Daily Production Backup"
              className="input-field"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="input-label">Source RustFS Instance</label>
            <select
              required
              className="input-field"
              value={formData.rustfs_instance_id}
              onChange={(e) => setFormData({ ...formData, rustfs_instance_id: e.target.value })}
            >
              <option value="">Select source instance</option>
              {instances?.map((instance) => (
                <option key={instance.id} value={instance.id}>
                  {instance.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="input-label">Source Bucket</label>
            <input
              type="text"
              required
              placeholder="my-bucket"
              className="input-field"
              value={formData.source_bucket}
              onChange={(e) => setFormData({ ...formData, source_bucket: e.target.value })}
            />
            <p className="mt-1 text-xs text-gray-500">
              The bucket name from your RustFS instance to backup
            </p>
          </div>

          {/* Backup Type Selection */}
          <div className="border-t border-gray-200 pt-4">
            <label className="input-label">Backup Destination Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, backup_type: 'server' })}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  formData.backup_type === 'server'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <ServerIcon className={`h-6 w-6 mb-2 ${formData.backup_type === 'server' ? 'text-indigo-600' : 'text-gray-400'}`} />
                <div className="font-semibold text-sm">Server Storage</div>
                <div className="text-xs text-gray-500 mt-1">Compressed archives on server</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, backup_type: 'bucket' })}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  formData.backup_type === 'bucket'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <FolderIcon className={`h-6 w-6 mb-2 ${formData.backup_type === 'bucket' ? 'text-indigo-600' : 'text-gray-400'}`} />
                <div className="font-semibold text-sm">Object Storage</div>
                <div className="text-xs text-gray-500 mt-1">Direct copy to another bucket</div>
              </button>
            </div>
          </div>

          {/* Conditional Fields Based on Backup Type */}
          {formData.backup_type === 'server' ? (
            <div>
              <label className="input-label">Backup Storage Path (Server)</label>
              <input
                type="text"
                required
                placeholder="/app/backups/my-bucket"
                className="input-field"
                value={formData.destination_path}
                onChange={(e) => setFormData({ ...formData, destination_path: e.target.value })}
              />
              <p className="mt-1 text-xs text-gray-500">
                Server path where backup archives (.tar.gz) will be stored
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="input-label">Destination RustFS Instance</label>
                <select
                  required
                  className="input-field"
                  value={formData.destination_instance_id}
                  onChange={(e) => setFormData({ ...formData, destination_instance_id: e.target.value })}
                >
                  <option value="">Select destination instance</option>
                  {instances?.map((instance) => (
                    <option key={instance.id} value={instance.id}>
                      {instance.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  The object storage instance where backups will be stored
                </p>
              </div>
              <div>
                <label className="input-label">Destination Bucket</label>
                <input
                  type="text"
                  required
                  placeholder="backup-bucket"
                  className="input-field"
                  value={formData.destination_bucket}
                  onChange={(e) => setFormData({ ...formData, destination_bucket: e.target.value })}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Bucket where backup objects will be copied (will be created if it doesn't exist)
                </p>
              </div>

              {/* Backup Format Selection */}
              <div className="border-t border-gray-200 pt-4">
                <label className="input-label">Backup Format</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, compression_enabled: true })}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      formData.compression_enabled
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <ArrowDownTrayIcon className={`h-6 w-6 mb-2 ${formData.compression_enabled ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <div className="font-semibold text-sm">Compressed Archive</div>
                    <div className="text-xs text-gray-500 mt-1">Single .tar.gz file</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, compression_enabled: false })}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      !formData.compression_enabled
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <FolderIcon className={`h-6 w-6 mb-2 ${!formData.compression_enabled ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <div className="font-semibold text-sm">Direct Copy</div>
                    <div className="text-xs text-gray-500 mt-1">Individual objects</div>
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {formData.compression_enabled 
                    ? 'All objects will be archived into a single compressed file'
                    : 'Objects will be copied individually to the destination bucket'}
                </p>
              </div>

              {/* Destination Path for Bucket Backups */}
              <div>
                <label className="input-label">
                  Destination Path (Optional)
                </label>
                <input
                  type="text"
                  placeholder={formData.compression_enabled ? "backups/production" : "restored"}
                  className="input-field"
                  value={formData.backup_type === 'bucket' ? (formData.destination_path === '/app/backups' ? '' : formData.destination_path) : formData.destination_path}
                  onChange={(e) => setFormData({ ...formData, destination_path: e.target.value })}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.compression_enabled
                    ? 'Path prefix where the archive will be stored (e.g., backups/production/20240119_120000/bucket.tar.gz)'
                    : 'Optional folder path in destination bucket (e.g., "restored" → restored/file.txt). Leave empty to copy to bucket root.'}
                </p>
              </div>

              {/* Compression Type for Compressed Archives */}
              {formData.compression_enabled && (
                <div>
                  <label className="input-label">Compression Algorithm</label>
                  <select
                    className="input-field"
                    value={formData.compression_type}
                    onChange={(e) => setFormData({ ...formData, compression_type: e.target.value })}
                  >
                    <option value="gzip">Gzip (Recommended)</option>
                    <option value="none">None (Tar only)</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Gzip provides good compression with fast performance
                  </p>
                </div>
              )}
            </>
          )}

          <div>
            <label className="input-label">Schedule (Cron Expression)</label>
            <input
              type="text"
              placeholder="0 2 * * *"
              className="input-field"
              value={formData.schedule}
              onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
            />
            <div className="mt-2 bg-indigo-50 border border-indigo-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-indigo-900 mb-1">Common Schedules:</p>
              <ul className="text-xs text-indigo-700 space-y-1">
                <li><code className="bg-white px-1 py-0.5 rounded">0 2 * * *</code> - Daily at 2:00 AM</li>
                <li><code className="bg-white px-1 py-0.5 rounded">0 */6 * * *</code> - Every 6 hours</li>
                <li><code className="bg-white px-1 py-0.5 rounded">0 0 * * 0</code> - Weekly on Sunday</li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">Retention Days</label>
              <input
                type="number"
                min="1"
                className="input-field"
                value={formData.retention_days}
                onChange={(e) => setFormData({ ...formData, retention_days: parseInt(e.target.value) })}
              />
            </div>

            {formData.backup_type === 'server' && (
              <div>
                <label className="input-label">Compression</label>
                <select
                  className="input-field"
                  value={formData.compression_type}
                  onChange={(e) => setFormData({ ...formData, compression_type: e.target.value })}
                >
                  <option value="gzip">Gzip</option>
                  <option value="none">None</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="enabled"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
            />
            <label htmlFor="enabled" className="ml-2 block text-sm font-medium text-gray-900">
              Enable this backup job
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isPending ? 'Creating...' : 'Create Backup Job'}
            </button>
          </div>
        </form>
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
          <div className="space-y-4">
            {/* Job Info */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Instance:</span>
                  <span className="ml-2 font-medium text-gray-900">{selectedJob.rustfs_instance.name}</span>
                </div>
                <div>
                  <span className="text-gray-500">Bucket:</span>
                  <span className="ml-2 font-medium text-gray-900">{selectedJob.source_bucket}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Storage Path:</span>
                  <span className="ml-2 font-mono text-xs text-gray-900">{selectedJob.destination_path}</span>
                </div>
              </div>
            </div>

            {/* Backup Runs List */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Backup Runs</h4>
              {selectedJob.backup_runs && selectedJob.backup_runs.length > 0 ? (
                <div className="space-y-2">
                  {selectedJob.backup_runs.map((run) => (
                    <div key={run.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              run.status === 'completed' 
                                ? 'bg-green-100 text-green-800'
                                : run.status === 'running'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {run.status}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(run.started_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {run.status === 'completed' && (
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="bg-gray-50 rounded p-2">
                            <div className="text-xs text-gray-500">Files</div>
                            <div className="font-semibold text-gray-900">{run.files_count.toLocaleString()}</div>
                          </div>
                          <div className="bg-gray-50 rounded p-2">
                            <div className="text-xs text-gray-500">Size</div>
                            <div className="font-semibold text-gray-900">{formatBytes(run.bytes_count)}</div>
                          </div>
                          <div className="bg-gray-50 rounded p-2">
                            <div className="text-xs text-gray-500">Duration</div>
                            <div className="font-semibold text-gray-900">
                              {run.completed_at 
                                ? `${Math.round((new Date(run.completed_at).getTime() - new Date(run.started_at).getTime()) / 1000)}s`
                                : 'N/A'}
                            </div>
                          </div>
                        </div>
                      )}

                      {run.backup_path && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="text-xs text-gray-500 mb-1">Archive Path:</div>
                          <div className="font-mono text-xs text-gray-900 bg-gray-50 p-2 rounded break-all">
                            {run.backup_path}
                          </div>
                        </div>
                      )}

                      {run.error_msg && (
                        <div className="mt-3 bg-red-50 border border-red-200 rounded p-3">
                          <div className="text-xs font-semibold text-red-800 mb-1">Error:</div>
                          <div className="text-xs text-red-700 break-words">{run.error_msg}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm">No backup runs yet</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowBackupRuns(false);
                  setSelectedJob(null);
                }}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Enterprise Modal */}
      <Modal
        isOpen={showEnterpriseModal}
        onClose={() => setShowEnterpriseModal(false)}
        title="Premium Feature"
        size="md"
      >
        <div className="space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
              <ServerIcon className="h-8 w-8 text-indigo-600" />
            </div>
          </div>

          {/* Message */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Server Storage Backup
            </h3>
            <p className="text-sm text-gray-600">
              Server storage backups are available with our Premium plan. Upgrade now to unlock this feature along with many other benefits.
            </p>
          </div>

          {/* Features */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Premium Features Include:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <CheckIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span>Unlimited server storage backups</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span>Advanced compression options</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span>Priority support</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span>Custom retention policies</span>
              </li>
            </ul>
          </div>

          {/* Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> Bucket-to-bucket backups remain free for all users.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={() => setShowEnterpriseModal(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              onClick={handleEnterpriseConfirm}
              className="btn-primary flex-1"
            >
              View Premium Plans
            </button>
          </div>
        </div>
      </Modal>

      {/* Upgrade Modal for Backup Limit */}
      <Modal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Upgrade to Premium"
      >
        <div className="text-center py-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Backup Job Limit Reached</h3>
          <p className="text-sm text-gray-600 mb-6">
            Free users can only create 5 backup jobs. Upgrade to premium for unlimited backup jobs and more features!
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