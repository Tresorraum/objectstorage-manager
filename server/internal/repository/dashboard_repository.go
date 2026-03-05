package repository

import (
	"time"

	"gorm.io/gorm"
	"rukhalt/internal/models"
)

type DashboardRepository interface {
	// Counts
	CountInstances() (int64, error)
	CountBackupJobs() (int64, error)
	CountActiveAlerts() (int64, error)
	CountInstancesBeforeDate(date time.Time) (int64, error)
	CountBackupJobsBeforeDate(date time.Time) (int64, error)
	CountAlertsBeforeDate(date time.Time, resolved bool) (int64, error)
	
	// Backup statistics
	GetTotalStorageFromBackups() (int64, error)
	CountCompletedBackupsAfterDate(date time.Time) (int64, error)
	CountRunningBackups() (int64, error)
	CountFailedBackupsAfterDate(date time.Time) (int64, error)
	GetLastCompletedBackup() (*models.BackupRun, error)
	GetStorageBeforeDate(date time.Time) (int64, error)
	GetDailyStorageUsage(startDate time.Time) (map[string]int64, error)
	
	// Alerts
	GetRecentAlerts(limit int) ([]models.Alert, error)
	CreateAlert(alert *models.Alert) error
	
	// Metrics
	CreateMetric(metric *models.Metric) error
}

type dashboardRepository struct {
	db *gorm.DB
}

func NewDashboardRepository(db *gorm.DB) DashboardRepository {
	return &dashboardRepository{db: db}
}

// Counts
func (r *dashboardRepository) CountInstances() (int64, error) {
	var count int64
	err := r.db.Model(&models.RustFSInstance{}).Count(&count).Error
	return count, err
}

func (r *dashboardRepository) CountBackupJobs() (int64, error) {
	var count int64
	err := r.db.Model(&models.BackupJob{}).Count(&count).Error
	return count, err
}

func (r *dashboardRepository) CountActiveAlerts() (int64, error) {
	var count int64
	err := r.db.Model(&models.Alert{}).Where("resolved = ?", false).Count(&count).Error
	return count, err
}

func (r *dashboardRepository) CountInstancesBeforeDate(date time.Time) (int64, error) {
	var count int64
	err := r.db.Model(&models.RustFSInstance{}).Where("created_at < ?", date).Count(&count).Error
	return count, err
}

func (r *dashboardRepository) CountBackupJobsBeforeDate(date time.Time) (int64, error) {
	var count int64
	err := r.db.Model(&models.BackupJob{}).Where("created_at < ?", date).Count(&count).Error
	return count, err
}

func (r *dashboardRepository) CountAlertsBeforeDate(date time.Time, resolved bool) (int64, error) {
	var count int64
	err := r.db.Model(&models.Alert{}).
		Where("created_at < ? AND resolved = ?", date, resolved).
		Count(&count).Error
	return count, err
}

// Backup statistics
func (r *dashboardRepository) GetTotalStorageFromBackups() (int64, error) {
	var total int64
	err := r.db.Model(&models.BackupRun{}).
		Where("status = ?", "completed").
		Select("COALESCE(SUM(bytes_count), 0)").
		Scan(&total).Error
	return total, err
}

func (r *dashboardRepository) CountCompletedBackupsAfterDate(date time.Time) (int64, error) {
	var count int64
	err := r.db.Model(&models.BackupRun{}).
		Where("status = ? AND started_at >= ?", "completed", date).
		Count(&count).Error
	return count, err
}

func (r *dashboardRepository) CountRunningBackups() (int64, error) {
	var count int64
	err := r.db.Model(&models.BackupRun{}).
		Where("status = ?", "running").
		Count(&count).Error
	return count, err
}

func (r *dashboardRepository) CountFailedBackupsAfterDate(date time.Time) (int64, error) {
	var count int64
	err := r.db.Model(&models.BackupRun{}).
		Where("status = ? AND started_at >= ?", "failed", date).
		Count(&count).Error
	return count, err
}

func (r *dashboardRepository) GetLastCompletedBackup() (*models.BackupRun, error) {
	var backup models.BackupRun
	err := r.db.Where("status = ?", "completed").
		Order("completed_at DESC").
		First(&backup).Error
	if err != nil {
		return nil, err
	}
	return &backup, nil
}

func (r *dashboardRepository) GetStorageBeforeDate(date time.Time) (int64, error) {
	var total int64
	err := r.db.Model(&models.BackupRun{}).
		Where("status = ? AND completed_at < ?", "completed", date).
		Select("COALESCE(SUM(bytes_count), 0)").
		Scan(&total).Error
	return total, err
}

func (r *dashboardRepository) GetDailyStorageUsage(startDate time.Time) (map[string]int64, error) {
	rows, err := r.db.Raw(`
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

	return dailyUsage, nil
}

// Alerts
func (r *dashboardRepository) GetRecentAlerts(limit int) ([]models.Alert, error) {
	var alerts []models.Alert
	err := r.db.Order("created_at DESC").Limit(limit).Find(&alerts).Error
	return alerts, err
}

func (r *dashboardRepository) CreateAlert(alert *models.Alert) error {
	return r.db.Create(alert).Error
}

// Metrics
func (r *dashboardRepository) CreateMetric(metric *models.Metric) error {
	return r.db.Create(metric).Error
}
