import React, { useState } from 'react';
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
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import Modal from '../components/Modal';

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
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<BackupJob | null>(null);
  const [showBackupRuns, setShowBackupRuns] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

    createMutation.mutate(payload);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Backup Jobs</h1>
          <p className="mt-2 text-sm text-gray-600">
            Automated backup jobs that download and archive RustFS buckets to server storage
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Backup Job
        </button>
      </div>

      {/* Technical Info Banner */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <div className="flex">
          <ServerIcon className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-semibold text-indigo-900">How Backups Work</h3>
            <div className="mt-2 text-xs text-indigo-800 space-y-1">
              <p>• <strong>Server Backup:</strong> Downloads objects from RustFS and creates compressed archives (.tar.gz) on server storage</p>
              <p>• <strong>Bucket Backup:</strong> Copies objects directly from source bucket to another object storage bucket (no compression)</p>
              <p>• Scheduled jobs run automatically based on cron expressions, or run manually anytime</p>
              <p>• Old backups are automatically cleaned up based on retention policy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Backup Jobs Grid */}
      {backupJobs && backupJobs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
          <ServerIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No backup jobs</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new backup job.</p>
          <div className="mt-6">
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Backup Job
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {backupJobs?.map((job) => (
            <div key={job.id} className="card p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{job.name}</h3>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      job.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : job.status === 'running'
                        ? 'bg-blue-100 text-blue-800 animate-pulse'
                        : job.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {job.status === 'running' && (
                        <ArrowPathIcon className="h-3 w-3 mr-1 animate-spin" />
                      )}
                      {job.status}
                    </span>
                    {!job.enabled && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                        Disabled
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Instance & Bucket Info */}
              <div className="space-y-3 pt-3 border-t border-gray-200">
                <div className="flex items-center text-sm">
                  <ServerIcon className="h-5 w-5 text-indigo-600 mr-3 flex-shrink-0" />
                  <div>
                    <span className="text-gray-500">Source Instance:</span>
                    <span className="ml-2 font-medium text-gray-900">{job.rustfs_instance.name}</span>
                  </div>
                </div>
                <div className="flex items-center text-sm">
                  <FolderIcon className="h-5 w-5 text-indigo-600 mr-3 flex-shrink-0" />
                  <div>
                    <span className="text-gray-500">Source Bucket:</span>
                    <span className="ml-2 font-medium text-gray-900">{job.source_bucket}</span>
                  </div>
                </div>
                {job.backup_type === 'server' ? (
                  <div className="flex items-center text-sm">
                    <FolderIcon className="h-5 w-5 text-indigo-600 mr-3 flex-shrink-0" />
                    <div>
                      <span className="text-gray-500">Storage Path:</span>
                      <span className="ml-2 font-mono text-xs text-gray-900 break-all">{job.destination_path}</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center text-sm">
                      <ServerIcon className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                      <div>
                        <span className="text-gray-500">Dest. Instance:</span>
                        <span className="ml-2 font-medium text-gray-900">{job.destination_instance?.name || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-sm">
                      <FolderIcon className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                      <div>
                        <span className="text-gray-500">Dest. Bucket:</span>
                        <span className="ml-2 font-medium text-gray-900">{job.destination_bucket}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Schedule & Retention */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center text-xs text-gray-500 mb-1">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    Schedule
                  </div>
                  <p className="text-sm font-semibold text-gray-900 font-mono">
                    {job.schedule || 'Manual'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center text-xs text-gray-500 mb-1">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    Retention
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {job.retention_days} days
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center text-xs text-gray-500 mb-1">
                    <DocumentTextIcon className="h-4 w-4 mr-1" />
                    Type
                  </div>
                  <p className="text-sm font-semibold text-gray-900 capitalize">
                    {job.backup_type}
                    {job.backup_type === 'server' && ` (${job.compression_type.toUpperCase()})`}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center text-xs text-gray-500 mb-1">
                    <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                    Backups
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {job.backup_runs?.length || 0} runs
                  </p>
                </div>
              </div>

              {/* Last Run Info */}
              {job.last_run && (
                <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                  Last run: {new Date(job.last_run).toLocaleString()}
                </div>
              )}

              {/* Error Message */}
              {job.status === 'failed' && job.last_error_msg && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <div className="ml-3">
                      <h4 className="text-sm font-semibold text-red-800">
                        Backup Failed
                      </h4>
                      <p className="mt-1 text-xs text-red-700 break-words">
                        {job.last_error_msg}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-gray-200">
                <button
                  onClick={() => handleRun(job.id)}
                  disabled={runMutation.isPending || job.status === 'running'}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-indigo-600 text-sm font-medium rounded-lg text-indigo-600 bg-white hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <PlayIcon className="h-4 w-4 mr-2" />
                  Run Backup
                </button>
                <button
                  onClick={() => viewBackupRuns(job)}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
                >
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  History
                </button>
                <button
                  onClick={() => handleDelete(job.id)}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-all duration-200"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
    </div>
  );
}