export interface BackupJob {
  id: number;
  name: string;
  source_type: string; // "object_storage", "postgres", "vps"
  rustfs_instance_id?: number;
  postgres_instance_id?: number;
  vps_instance_id?: number;
  source_bucket: string;
  source_path: string;
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
  rustfs_instance?: {
    name: string;
  };
  postgres_instance?: {
    name: string;
    database: string;
  };
  vps_instance?: {
    name: string;
    host: string;
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

export interface RustFSInstance {
  id: number;
  name: string;
}

export interface PostgresInstance {
  id: number;
  name: string;
  database: string;
}

export interface VPSInstance {
  id: number;
  name: string;
  host: string;
}

export interface BackupFormData {
  name: string;
  source_type: string; // "object_storage", "postgres", "vps"
  rustfs_instance_id: string;
  postgres_instance_id: string;
  vps_instance_id: string;
  source_bucket: string;
  source_path: string;
  backup_type: string;
  destination_path: string;
  destination_instance_id: string;
  destination_bucket: string;
  schedule: string;
  enabled: boolean;
  retention_days: number;
  compression_type: string;
  compression_enabled: boolean;
}
