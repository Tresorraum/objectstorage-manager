package services

import (
	"fmt"
	"time"

	"rukhalt/internal/models"
	"rukhalt/internal/repository"
)

type DashboardService struct {
	repo repository.DashboardRepository
}

func NewDashboardService(repo repository.DashboardRepository) *DashboardService {
	return &DashboardService{
		repo: repo,
	}
}

type DashboardStats struct {
	TotalInstances       int                    `json:"totalInstances"`
	TotalStorage         int64                  `json:"totalStorage"`
	TotalBackups         int                    `json:"totalBackups"`
	ActiveAlerts         int                    `json:"activeAlerts"`
	StorageUsage         []StorageUsageMetric   `json:"storageUsage"`
	CompletedBackupsToday int                   `json:"completedBackupsToday"`
	RunningBackups       int                    `json:"runningBackups"`
	FailedBackupsToday   int                    `json:"failedBackupsToday"`
	LastBackupTime       *time.Time             `json:"lastBackupTime"`
	InstancesChange      string                 `json:"instancesChange"`
	StorageChange        string                 `json:"storageChange"`
	BackupsChange        string                 `json:"backupsChange"`
	AlertsChange         string                 `json:"alertsChange"`
}

type StorageUsageMetric struct {
	Date  string `json:"date"`
	Usage int64  `json:"usage"`
}

type SystemMetrics struct {
	CPU    float64 `json:"cpu"`
	Memory float64 `json:"memory"`
	Disk   float64 `json:"disk"`
}

// GetStats returns dashboard statistics
func (s *DashboardService) GetStats() (*DashboardStats, error) {
	stats := &DashboardStats{}

	// Count total instances
	instanceCount, err := s.repo.CountInstances()
	if err != nil {
		return nil, err
	}
	stats.TotalInstances = int(instanceCount)

	// Count total backup jobs
	backupCount, err := s.repo.CountBackupJobs()
	if err != nil {
		return nil, err
	}
	stats.TotalBackups = int(backupCount)

	// Count active alerts
	alertCount, err := s.repo.CountActiveAlerts()
	if err != nil {
		return nil, err
	}
	stats.ActiveAlerts = int(alertCount)

	// Get total storage from backup runs
	totalStorage, err := s.repo.GetTotalStorageFromBackups()
	if err != nil {
		return nil, err
	}
	stats.TotalStorage = totalStorage

	// Get backup statistics for today
	today := time.Now().Truncate(24 * time.Hour)
	
	completedToday, err := s.repo.CountCompletedBackupsAfterDate(today)
	if err != nil {
		return nil, err
	}
	stats.CompletedBackupsToday = int(completedToday)

	runningBackups, err := s.repo.CountRunningBackups()
	if err != nil {
		return nil, err
	}
	stats.RunningBackups = int(runningBackups)

	failedToday, err := s.repo.CountFailedBackupsAfterDate(today)
	if err != nil {
		return nil, err
	}
	stats.FailedBackupsToday = int(failedToday)

	// Get last backup time
	lastBackup, err := s.repo.GetLastCompletedBackup()
	if err == nil && lastBackup != nil {
		stats.LastBackupTime = lastBackup.CompletedAt
	}

	// Calculate changes from last month
	lastMonth := time.Now().AddDate(0, -1, 0)
	
	// Instances change
	instancesLastMonth, err := s.repo.CountInstancesBeforeDate(lastMonth)
	if err != nil {
		return nil, err
	}
	instancesChange := int(instanceCount) - int(instancesLastMonth)
	if instancesChange > 0 {
		stats.InstancesChange = fmt.Sprintf("+%d from last month", instancesChange)
	} else if instancesChange < 0 {
		stats.InstancesChange = fmt.Sprintf("%d from last month", instancesChange)
	} else {
		stats.InstancesChange = "No change from last month"
	}

	// Storage change
	storageLastMonth, err := s.repo.GetStorageBeforeDate(lastMonth)
	if err != nil {
		return nil, err
	}
	
	if storageLastMonth > 0 {
		storageChangePercent := float64(totalStorage-storageLastMonth) / float64(storageLastMonth) * 100
		if storageChangePercent > 0 {
			stats.StorageChange = fmt.Sprintf("+%.1f%% from last month", storageChangePercent)
		} else {
			stats.StorageChange = fmt.Sprintf("%.1f%% from last month", storageChangePercent)
		}
	} else {
		stats.StorageChange = "No data from last month"
	}

	// Backup jobs change
	backupsLastMonth, err := s.repo.CountBackupJobsBeforeDate(lastMonth)
	if err != nil {
		return nil, err
	}
	backupsChange := int(backupCount) - int(backupsLastMonth)
	if backupsChange > 0 {
		stats.BackupsChange = fmt.Sprintf("+%d from last month", backupsChange)
	} else if backupsChange < 0 {
		stats.BackupsChange = fmt.Sprintf("%d from last month", backupsChange)
	} else {
		stats.BackupsChange = "No change from last month"
	}

	// Alerts change
	alertsLastMonth, err := s.repo.CountAlertsBeforeDate(lastMonth, false)
	if err != nil {
		return nil, err
	}
	alertsChange := int(alertCount) - int(alertsLastMonth)
	if alertsChange > 0 {
		stats.AlertsChange = fmt.Sprintf("+%d from last month", alertsChange)
	} else if alertsChange < 0 {
		stats.AlertsChange = fmt.Sprintf("%d resolved from last month", -alertsChange)
	} else {
		stats.AlertsChange = "No change from last month"
	}

	// Get storage usage trend (last 30 days)
	storageUsage, err := s.getStorageUsageTrend(30)
	if err != nil {
		return nil, err
	}
	stats.StorageUsage = storageUsage

	return stats, nil
}

// GetMetrics returns system metrics
func (s *DashboardService) GetMetrics() (*SystemMetrics, error) {
	// This would typically collect real system metrics
	// For now, return mock data
	return &SystemMetrics{
		CPU:    45.2,
		Memory: 67.8,
		Disk:   23.4,
	}, nil
}

// GetAlerts returns recent alerts
func (s *DashboardService) GetAlerts(limit int) ([]models.Alert, error) {
	return s.repo.GetRecentAlerts(limit)
}

// getStorageUsageTrend returns storage usage for the last N days
func (s *DashboardService) getStorageUsageTrend(days int) ([]StorageUsageMetric, error) {
	var metrics []StorageUsageMetric
	
	// Get daily storage metrics from repository
	startDate := time.Now().AddDate(0, 0, -days)
	dailyUsage, err := s.repo.GetDailyStorageUsage(startDate)
	if err != nil {
		return nil, err
	}

	// Generate metrics for all days in the range, filling gaps with previous day's data
	var cumulativeUsage int64
	for i := days - 1; i >= 0; i-- {
		date := time.Now().AddDate(0, 0, -i)
		dateStr := date.Format("2006-01-02")
		
		if usage, exists := dailyUsage[dateStr]; exists {
			cumulativeUsage += usage
		}
		
		metrics = append(metrics, StorageUsageMetric{
			Date:  dateStr,
			Usage: cumulativeUsage,
		})
	}

	// If no real data exists, generate minimal sample data
	if cumulativeUsage == 0 {
		for i := range metrics {
			metrics[i].Usage = int64(i * 50000000) // 50MB increments
		}
	}

	return metrics, nil
}

// RecordMetric records a new metric
func (s *DashboardService) RecordMetric(instanceID uint, metricType, metricName string, value float64, unit string) error {
	metric := &models.Metric{
		RustFSInstanceID: instanceID,
		MetricType:       metricType,
		MetricName:       metricName,
		Value:            value,
		Unit:             unit,
		Timestamp:        time.Now(),
	}

	return s.repo.CreateMetric(metric)
}

// CreateAlert creates a new alert
func (s *DashboardService) CreateAlert(alertType, severity, title, message, source string, sourceID *uint) error {
	alert := &models.Alert{
		Type:     alertType,
		Severity: severity,
		Title:    title,
		Message:  message,
		Source:   source,
		SourceID: sourceID,
	}

	return s.repo.CreateAlert(alert)
}