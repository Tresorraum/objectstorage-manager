import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { BackupJob } from '../types/backup.types';

export const useBackups = () => {
  const queryClient = useQueryClient();

  const { data: backupJobs, isLoading } = useQuery<BackupJob[]>({
    queryKey: ['backup-jobs'],
    queryFn: () => api.get('/backup/jobs').then(res => res.data),
    refetchInterval: 5000,
    staleTime: 4000,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/backup/jobs', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backup-jobs'] });
      toast.success('Backup job created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create backup job');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      api.put(`/backup/jobs/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backup-jobs'] });
      toast.success('Backup job updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update backup job');
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

  return {
    backupJobs,
    isLoading,
    createBackup: createMutation.mutate,
    updateBackup: updateMutation.mutate,
    runBackup: runMutation.mutate,
    deleteBackup: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRunning: runMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
