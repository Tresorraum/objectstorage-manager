import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowDownTrayIcon,
  TrashIcon,
  XCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ShieldCheckIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import Modal from '../../components/Modal';
import { formatBytes, formatDuration } from '../../utils/formatters';

interface Backup {
  id: string;
  databaseId: string;
  storageId: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELED';
  failMessage?: string;
  backupSizeMb: number;
  backupDurationMs: number;
  encryption: 'NONE' | 'ENCRYPTED';
  createdAt: string;
}

interface BackupsListProps {
  databaseId: string;
  databaseName: string;
}

export default function BackupsList({ databaseId, databaseName }: BackupsListProps) {
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  const queryClient = useQueryClient();

  // Fetch backups
  const { data: backupsData, isLoading } = useQuery<{
    backups: Backup[];
    total: number;
    limit: number;
    offset: number;
  }>({
    queryKey: ['postgres-backups', databaseId, currentPage],
    queryFn: () =>
      api
        .get('/backups', {
          params: {
            database_id: databaseId,
            limit: pageSize,
            offset: currentPage * pageSize,
          },
        })
        .then((res) => res.data),
    refetchInterval: (query) => {
      // Refetch every 3 seconds if there's an in-progress backup
      const hasInProgress = query.state.data?.backups?.some(
        (b: Backup) => b.status === 'IN_PROGRESS'
      );
      return hasInProgress ? 3000 : false;
    },
  });

  // Delete backup mutation
  const deleteMutation = useMutation({
    mutationFn: (backupId: string) => api.delete(`/backups/${backupId}`),
    onSuccess: () => {
      toast.success('Backup deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['postgres-backups', databaseId] });
      setShowDeleteModal(false);
      setSelectedBackup(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete backup');
    },
  });

  // Cancel backup mutation
  const cancelMutation = useMutation({
    mutationFn: (backupId: string) => api.post(`/backups/${backupId}/cancel`),
    onSuccess: () => {
      toast.success('Backup cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['postgres-backups', databaseId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to cancel backup');
    },
  });

  // Generate download token mutation
  const downloadMutation = useMutation({
    mutationFn: (backupId: string) =>
      api.post(`/backups/${backupId}/download-token`).then((res) => res.data),
    onSuccess: (data: { token: string; filename: string; backupId: string }) => {
      // Trigger download using the token
      const downloadUrl = `${api.defaults.baseURL}/backups/${data.backupId}/file?token=${data.token}`;
      window.open(downloadUrl, '_blank');
      toast.success('Download started');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.error || 'Failed to generate download token';
      if (error.response?.status === 409) {
        toast.error('A download is already in progress. Please wait or cancel it.');
      } else {
        toast.error(errorMsg);
      }
    },
  });

  const handleDelete = (backup: Backup) => {
    setSelectedBackup(backup);
    setShowDeleteModal(true);
  };

  const handleShowError = (backup: Backup) => {
    setSelectedBackup(backup);
    setShowErrorModal(true);
  };

  const getStatusIcon = (status: Backup['status']) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'IN_PROGRESS':
        return <ClockIcon className="h-5 w-5 text-blue-600 animate-pulse" />;
      case 'FAILED':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-600" />;
      case 'CANCELED':
        return <XCircleIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: Backup['status']) => {
    const baseClasses = 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium';
    switch (status) {
      case 'COMPLETED':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'IN_PROGRESS':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'FAILED':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'CANCELED':
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const backups = backupsData?.backups || [];
  const total = backupsData?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Backup History</h3>
          <p className="text-sm text-gray-600">
            {total} backup{total !== 1 ? 's' : ''} for {databaseName}
          </p>
        </div>
      </div>

      {/* Backups List */}
      {backups.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <ShieldCheckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No backups yet</h3>
          <p className="text-sm text-gray-600">
            Create your first backup to see it here
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Encryption
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {backups.map((backup: Backup) => (
                  <tr key={backup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(backup.status)}>
                        {getStatusIcon(backup.status)}
                        {backup.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(backup.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {backup.backupSizeMb > 0
                        ? formatBytes(backup.backupSizeMb * 1024 * 1024)
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {backup.backupDurationMs > 0
                        ? formatDuration(backup.backupDurationMs)
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {backup.encryption === 'ENCRYPTED' ? (
                        <span className="inline-flex items-center gap-1 text-sm text-green-700">
                          <LockClosedIcon className="h-4 w-4" />
                          Encrypted
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {backup.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => cancelMutation.mutate(backup.id)}
                            disabled={cancelMutation.isPending}
                            className="text-orange-600 hover:text-orange-900 disabled:opacity-50"
                            title="Cancel backup"
                          >
                            <XCircleIcon className="h-5 w-5" />
                          </button>
                        )}
                        {backup.status === 'COMPLETED' && (
                          <button
                            onClick={() => downloadMutation.mutate(backup.id)}
                            disabled={downloadMutation.isPending}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                            title="Download backup"
                          >
                            <ArrowDownTrayIcon className="h-5 w-5" />
                          </button>
                        )}
                        {backup.status === 'FAILED' && (
                          <button
                            onClick={() => handleShowError(backup)}
                            className="text-red-600 hover:text-red-900"
                            title="View error"
                          >
                            <ExclamationCircleIcon className="h-5 w-5" />
                          </button>
                        )}
                        {backup.status !== 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleDelete(backup)}
                            disabled={deleteMutation.isPending}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            title="Delete backup"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Showing {currentPage * pageSize + 1} to{' '}
                {Math.min((currentPage + 1) * pageSize, total)} of {total} backups
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedBackup(null);
        }}
        title="Delete Backup"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete this backup? This action cannot be undone.
          </p>
          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            <p className="text-gray-700">
              <span className="font-medium">Created:</span>{' '}
              {selectedBackup && new Date(selectedBackup.createdAt).toLocaleString()}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Size:</span>{' '}
              {selectedBackup && selectedBackup.backupSizeMb > 0
                ? formatBytes(selectedBackup.backupSizeMb * 1024 * 1024)
                : 'N/A'}
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedBackup(null);
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={() => selectedBackup && deleteMutation.mutate(selectedBackup.id)}
              disabled={deleteMutation.isPending}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Backup'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Error Details Modal */}
      <Modal
        isOpen={showErrorModal}
        onClose={() => {
          setShowErrorModal(false);
          setSelectedBackup(null);
        }}
        title="Backup Error Details"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <ExclamationCircleIcon className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-red-900 mb-1">Error Message</h4>
                <p className="text-sm text-red-800 whitespace-pre-wrap">
                  {selectedBackup?.failMessage || 'No error message available'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
            <p className="text-gray-700">
              <span className="font-medium">Backup ID:</span> {selectedBackup?.id}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Created:</span>{' '}
              {selectedBackup && new Date(selectedBackup.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => {
                setShowErrorModal(false);
                setSelectedBackup(null);
              }}
              className="btn-primary"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
