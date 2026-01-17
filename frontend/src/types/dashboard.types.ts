export interface DashboardStats {
  totalInstances: number;
  totalStorage: number;
  totalBackups: number;
  activeAlerts: number;
  storageUsage: StorageUsageMetric[];
  completedBackupsToday: number;
  runningBackups: number;
  failedBackupsToday: number;
  lastBackupTime?: string;
  instancesChange: string;
  storageChange: string;
  backupsChange: string;
  alertsChange: string;
}

export interface StorageUsageMetric {
  date: string;
  usage: number;
}

export interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
}

export interface Alert {
  id: number;
  type: string;
  severity: string;
  title: string;
  message: string;
  source: string;
  source_id?: number;
  resolved: boolean;
  created_at: string;
  updated_at: string;
}
