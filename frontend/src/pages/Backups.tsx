import React, { useState } from 'react';
import { PlusIcon, FolderIcon } from '@heroicons/react/24/outline';
import { useBackups } from '../hooks/useBackups';
import { useInstances } from '../hooks/useInstances';
import { useModal } from '../hooks/useModal';
import { BackupJob, BackupFormData } from '../types/backup.types';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { BackupJobCard } from '../components/backups/BackupJobCard';
import { BackupRunsModal } from '../components/backups/BackupRunsModal';
import { BackupForm } from '../components/backups/BackupForm';
import Modal from '../components/Modal';
import { useAuth } from '../contexts/AuthContext';

export default function Backups() {
  const { user } = useAuth();
  const { backupJobs, isLoading, createBackup, runBackup, deleteBackup, isCreating } = useBackups();
  const { instances } = useInstances();
  const createModal = useModal();
  const runsModal = useModal();
  const upgradeModal = useModal();

  const [selectedJob, setSelectedJob] = useState<BackupJob | null>(null);
  const [formData, setFormData] = useState<BackupFormData>({
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

  const handleCreateClick = () => {
    if (!user?.is_premium && backupJobs && backupJobs.length >= 5) {
      upgradeModal.open();
      return;
    }
    createModal.open();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.backup_type === 'server' && !user?.is_premium) {
      upgradeModal.open();
      return;
    }

    const payload = {
      ...formData,
      rustfs_instance_id: parseInt(formData.rustfs_instance_id),
      destination_instance_id: formData.destination_instance_id 
        ? parseInt(formData.destination_instance_id) 
        : undefined,
    };

    createBackup(payload, {
      onSuccess: () => {
        createModal.close();
        resetForm();
      },
    });
  };

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

  const handleViewRuns = (job: BackupJob) => {
    setSelectedJob(job);
    runsModal.open();
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading backup jobs..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Backup Jobs</h1>
          <p className="text-gray-600 mt-1">Manage your backup configurations</p>
        </div>
        <Button icon={<PlusIcon className="h-5 w-5" />} onClick={handleCreateClick}>
          Create Backup Job
        </Button>
      </div>

      {!backupJobs || backupJobs.length === 0 ? (
        <EmptyState
          icon={<FolderIcon className="h-16 w-16" />}
          title="No backup jobs yet"
          description="Create your first backup job to start protecting your data"
          action={
            <Button icon={<PlusIcon className="h-5 w-5" />} onClick={handleCreateClick}>
              Create Backup Job
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {backupJobs.map((job) => (
            <BackupJobCard
              key={job.id}
              job={job}
              onRun={runBackup}
              onDelete={deleteBackup}
              onViewRuns={handleViewRuns}
            />
          ))}
        </div>
      )}

      <Modal isOpen={createModal.isOpen} onClose={createModal.close} title="Create Backup Job">
        <BackupForm
          formData={formData}
          instances={instances}
          isSubmitting={isCreating}
          onChange={(data) => setFormData({ ...formData, ...data })}
          onSubmit={handleSubmit}
          onCancel={createModal.close}
        />
      </Modal>

      <BackupRunsModal
        job={selectedJob}
        isOpen={runsModal.isOpen}
        onClose={runsModal.close}
      />

      <Modal isOpen={upgradeModal.isOpen} onClose={upgradeModal.close} title="Upgrade Required">
        <div className="text-center py-6">
          <p className="text-gray-600 mb-6">
            {backupJobs && backupJobs.length >= 5
              ? 'Free users can only create up to 5 backup jobs. Upgrade to premium for unlimited backups.'
              : 'Server backups require a premium subscription. Upgrade now to unlock this feature.'}
          </p>
          <Button onClick={() => window.location.href = '/subscribe'}>
            Upgrade to Premium
          </Button>
        </div>
      </Modal>
    </div>
  );
}
