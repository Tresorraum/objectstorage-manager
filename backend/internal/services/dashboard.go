package services

import (
	"fmt"
	"time"

	"gorm.io/gorm"
	"rustfs-manager/internal/models"
)

type DashboardService struct {
	db            *gorm.DB
	rustfsService *RustFSService
}

func NewDashboardService(db *gorm.DB, rustfsService *RustFSService) *DashboardService {
	return &DashboardService{
		db:            db,
		rustfsService: rustfsService,
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
	var instanceCount int64
	if err := s.db.Model(&models.RustFSInstance{}).Count(&instanceCount).Error; err != nil {
		return nil, err
	}
	stats.TotalInstances = int(instanceCount)

	// Count total backup jobs
	var backupCount int64
	if err := s.db.Model(&models.BackupJob{}).Count(&backupCount).Error; err != nil {
		return nil, err
	}
	stats.TotalBackups = int(backupCount)

	// Count active alerts
	var alertCount int64
	if err := s.db.Model(&models.Alert{}).Where("resolved = ?", false).Count(&alertCount).Error; err != nil {
		return nil, err
	}
	stats.ActiveAlerts = int(alertCount)

	// Get total storage from backup runs
	var totalStorage int64
	s.db.Model(&models.BackupRun{}).
		Where("status = ?", "completed").
		Select("COALESCE(SUM(bytes_count), 0)").
		Scan(&totalStorage)
	stats.TotalStorage = totalStorage

	// Get backup statistics for today
	today := time.Now().Truncate(24 * time.Hour)
	
	var completedToday int64
	s.db.Model(&models.BackupRun{}).
		Where("status = ? AND started_at >= ?", "completed", today).
		Count(&completedToday)
	stats.CompletedBackupsToday = int(completedToday)

	var runningBackups int64
	s.db.Model(&models.BackupRun{}).
		Where("status = ?", "running").
		Count(&runningBackups)
	stats.RunningBackups = int(runningBackups)

	var failedToday int64
	s.db.Model(&models.BackupRun{}).
		Where("status = ? AND started_at >= ?", "failed", today).
		Count(&failedToday)
	stats.FailedBackupsToday = int(failedToday)

	// Get last backup time
	var lastBackup models.BackupRun
	if err := s.db.Where("status = ?", "completed").
		Order("completed_at DESC").
		First(&lastBackup).Error; err == nil {
		stats.LastBackupTime = lastBackup.CompletedAt
	}

	// Calculate changes from last month
	lastMonth := time.Now().AddDate(0, -1, 0)
	
	// Instances change
	var instancesLastMonth int64
	s.db.Model(&models.RustFSInstance{}).
		Where("created_at < ?", lastMonth).
		Count(&instancesLastMonth)
	instancesChange := int(instanceCount) - int(instancesLastMonth)
	if instancesChange > 0 {
		stats.InstancesChange = fmt.Sprintf("+%d from last month", instancesChange)
	} else if instancesChange < 0 {
		stats.InstancesChange = fmt.Sprintf("%d from last month", instancesChange)
	} else {
		stats.InstancesChange = "No change from last month"
	}

	// Storage change (calculate from backup runs)
	var storageLastMonth int64
	s.db.Model(&models.BackupRun{}).
		Where("status = ? AND completed_at < ?", "completed", lastMonth).
		Select("COALESCE(SUM(bytes_count), 0)").
		Scan(&storageLastMonth)
	
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
	var backupsLastMonth int64
	s.db.Model(&models.BackupJob{}).
		Where("created_at < ?", lastMonth).
		Count(&backupsLastMonth)
	backupsChange := int(backupCount) - int(backupsLastMonth)
	if backupsChange > 0 {
		stats.BackupsChange = fmt.Sprintf("+%d from last month", backupsChange)
	} else if backupsChange < 0 {
		stats.BackupsChange = fmt.Sprintf("%d from last month", backupsChange)
	} else {
		stats.BackupsChange = "No change from last month"
	}

	// Alerts change
	var alertsLastMonth int64
	s.db.Model(&models.Alert{}).
		Where("created_at < ? AND resolved = ?", lastMonth, false).
		Count(&alertsLastMonth)
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
	var alerts []models.Alert
	err := s.db.Order("created_at DESC").Limit(limit).Find(&alerts).Error
	return alerts, err
}

// getStorageUsageTrend returns storage usage for the last N days
func (s *DashboardService) getStorageUsageTrend(days int) ([]StorageUsageMetric, error) {
	var metrics []StorageUsageMetric
	
	// Get daily storage metrics from backup runs for the last N days
	startDate := time.Now().AddDate(0, 0, -days)
	
	rows, err := s.db.Raw(`
		SELECT 
			DATE(completed_at) as date,
			SUM(bytes_count) as usage
		FROM backup_runs 
		WHERE status = 'completed'
			AND completed_at >= ?
			AND completed_at IS NOT NULL
		GROUP BY DATE(completed_at)
		ORDER BY date
	`, startDate).Rows()
	
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	dailyUsage := make(map[string]int64)
	for rows.Next() {
		var date string
		var usage int64
		if err := rows.Scan(&date, &usage); err != nil {
			continue
		}
		dailyUsage[date] = usage
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

	return s.db.Create(metric).Error
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

	return s.db.Create(alert).Error
}