export interface BackupJob {
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

export interface BackupRun {
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

export interface BackupFormData {
  name: string;
  rustfs_instance_id: string;
  source_bucket: string;
  backup_type: string;
  destination_path: string;
  destination_instance_id: string;
  destination_bucket: string;
  schedule: string;
  enabled: boolean;
  retention_days: number;
  compression_type: string;
}
