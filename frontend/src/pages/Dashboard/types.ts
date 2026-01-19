export interface DashboardStats {
  totalInstances: number;
  totalStorage: number;
  totalBackups: number;
  activeAlerts: number;
  completedBackupsToday: number;
  runningBackups: number;
  failedBackupsToday: number;
  lastBackupTime?: string;
  instancesChange: string;
  storageChange: string;
  backupsChange: string;
  alertsChange: string;
  storageUsage: Array<{
    date: string;
    usage: number;
  }>;
}

export interface Activity {
  id: string;
  type: 'backup' | 'instance' | 'alert';
  name: string;
  status: 'completed' | 'success' | 'running' | 'warning' | 'failed';
  time: string;
  size: string | null;
}

export interface UpcomingBackup {
  id: number;
  name: string;
  schedule: string;
  instance: string;
}

export interface SystemHealthMetric {
  name: string;
  value: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  percentage: number;
}

export interface RustFSInstance {
  id: number;
  name: string;
  status: string;
  created_at: string;
}

export interface BackupJob {
  id: number;
  name: string;
  status: string;
  enabled: boolean;
  schedule: string;
  last_run?: string;
  next_run?: string;
  rustfs_instance?: {
    name: string;
  };
}
