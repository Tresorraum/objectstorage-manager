package dto

import "time"

// Response DTOs
type DashboardStatsResponse struct {
	TotalInstances        int                      `json:"totalInstances"`
	TotalStorage          int64                    `json:"totalStorage"`
	TotalBackups          int                      `json:"totalBackups"`
	ActiveAlerts          int                      `json:"activeAlerts"`
	StorageUsage          []StorageUsageMetric     `json:"storageUsage"`
	CompletedBackupsToday int                      `json:"completedBackupsToday"`
	RunningBackups        int                      `json:"runningBackups"`
	FailedBackupsToday    int                      `json:"failedBackupsToday"`
	LastBackupTime        *time.Time               `json:"lastBackupTime"`
	InstancesChange       string                   `json:"instancesChange"`
	StorageChange         string                   `json:"storageChange"`
	BackupsChange         string                   `json:"backupsChange"`
	AlertsChange          string                   `json:"alertsChange"`
}

type StorageUsageMetric struct {
	Date  string `json:"date"`
	Usage int64  `json:"usage"`
}

type SystemMetricsResponse struct {
	CPU    float64 `json:"cpu"`
	Memory float64 `json:"memory"`
	Disk   float64 `json:"disk"`
}

type AlertResponse struct {
	ID        uint       `json:"id"`
	Type      string     `json:"type"`
	Severity  string     `json:"severity"`
	Title     string     `json:"title"`
	Message   string     `json:"message"`
	Source    string     `json:"source"`
	SourceID  *uint      `json:"source_id"`
	Resolved  bool       `json:"resolved"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}
