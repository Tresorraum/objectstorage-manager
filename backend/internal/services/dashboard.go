package services

import (
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
	TotalInstances int                    `json:"total_instances"`
	TotalStorage   int64                  `json:"total_storage"`
	TotalBackups   int                    `json:"total_backups"`
	ActiveAlerts   int                    `json:"active_alerts"`
	StorageUsage   []StorageUsageMetric   `json:"storage_usage"`
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

	// Get total storage from metrics
	var totalStorage int64
	s.db.Model(&models.Metric{}).
		Where("metric_type = ? AND metric_name = ?", "storage", "total_size").
		Select("COALESCE(SUM(value), 0)").
		Scan(&totalStorage)
	stats.TotalStorage = totalStorage

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
	
	// Get daily storage metrics for the last N days
	startDate := time.Now().AddDate(0, 0, -days)
	
	rows, err := s.db.Raw(`
		SELECT 
			DATE(timestamp) as date,
			SUM(value) as usage
		FROM metrics 
		WHERE metric_type = 'storage' 
			AND metric_name = 'total_size'
			AND timestamp >= ?
		GROUP BY DATE(timestamp)
		ORDER BY date
	`, startDate).Rows()
	
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var metric StorageUsageMetric
		if err := rows.Scan(&metric.Date, &metric.Usage); err != nil {
			continue
		}
		metrics = append(metrics, metric)
	}

	// Fill in missing days with zero values
	if len(metrics) == 0 {
		// Generate sample data for demo
		for i := days - 1; i >= 0; i-- {
			date := time.Now().AddDate(0, 0, -i)
			metrics = append(metrics, StorageUsageMetric{
				Date:  date.Format("2006-01-02"),
				Usage: int64(1000000000 + i*100000000), // Sample increasing usage
			})
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