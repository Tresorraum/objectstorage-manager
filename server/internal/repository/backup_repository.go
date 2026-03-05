package repository

import (
	"rukhalt/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type BackupRepository struct {
	db *gorm.DB
}

func NewBackupRepository(db *gorm.DB) *BackupRepository {
	return &BackupRepository{db: db}
}

// Create creates a new backup record
func (r *BackupRepository) Create(backup *models.Backup) error {
	return r.db.Create(backup).Error
}

// FindByID finds a backup by ID
func (r *BackupRepository) FindByID(id uuid.UUID) (*models.Backup, error) {
	var backup models.Backup
	err := r.db.Where("id = ?", id).First(&backup).Error
	if err != nil {
		return nil, err
	}
	return &backup, nil
}

// FindByDatabaseID finds all backups for a database
func (r *BackupRepository) FindByDatabaseID(databaseID uint) ([]models.Backup, error) {
	var backups []models.Backup
	err := r.db.Where("database_id = ?", databaseID).
		Order("created_at DESC").
		Find(&backups).Error
	return backups, err
}

// FindByDatabaseIDWithPagination finds backups with pagination
func (r *BackupRepository) FindByDatabaseIDWithPagination(databaseID uint, limit, offset int) ([]models.Backup, error) {
	var backups []models.Backup
	err := r.db.Where("database_id = ?", databaseID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&backups).Error
	return backups, err
}

// CountByDatabaseID counts backups for a database
func (r *BackupRepository) CountByDatabaseID(databaseID uint) (int64, error) {
	var count int64
	err := r.db.Model(&models.Backup{}).
		Where("database_id = ?", databaseID).
		Count(&count).Error
	return count, err
}

// FindByDatabaseIDAndStatus finds backups by database ID and status
func (r *BackupRepository) FindByDatabaseIDAndStatus(databaseID uint, status models.BackupStatus) ([]models.Backup, error) {
	var backups []models.Backup
	err := r.db.Where("database_id = ? AND status = ?", databaseID, status).
		Find(&backups).Error
	return backups, err
}

// Update updates a backup record
func (r *BackupRepository) Update(backup *models.Backup) error {
	return r.db.Save(backup).Error
}

// Delete deletes a backup record
func (r *BackupRepository) Delete(id uuid.UUID) error {
	return r.db.Where("id = ?", id).Delete(&models.Backup{}).Error
}

// FindByUserID finds all backups for a user
func (r *BackupRepository) FindByUserID(userID uint) ([]models.Backup, error) {
	var backups []models.Backup
	err := r.db.Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&backups).Error
	return backups, err
}

// Backup Job methods (for scheduled backups)

// CreateJob creates a new backup job
func (r *BackupRepository) CreateJob(job *models.BackupJob) error {
	return r.db.Create(job).Error
}

// FindJobByID finds a backup job by ID
func (r *BackupRepository) FindJobByID(id uint) (*models.BackupJob, error) {
	var job models.BackupJob
	err := r.db.Preload("RustFSInstance").
		Preload("PostgresInstance").
		Preload("VPSInstance").
		Preload("DestinationInstance").
		Preload("BackupRuns", func(db *gorm.DB) *gorm.DB {
			return db.Order("started_at DESC").Limit(1)
		}).
		First(&job, id).Error
	if err != nil {
		return nil, err
	}
	return &job, nil
}

// FindJobsByUserID finds all backup jobs for a user
func (r *BackupRepository) FindJobsByUserID(userID uint) ([]models.BackupJob, error) {
	var jobs []models.BackupJob
	err := r.db.Where("user_id = ?", userID).
		Preload("RustFSInstance").
		Preload("PostgresInstance").
		Preload("VPSInstance").
		Preload("DestinationInstance").
		Preload("BackupRuns", func(db *gorm.DB) *gorm.DB {
			return db.Order("started_at DESC").Limit(1)
		}).
		Find(&jobs).Error
	return jobs, err
}

// UpdateJob updates a backup job
func (r *BackupRepository) UpdateJob(job *models.BackupJob) error {
	return r.db.Save(job).Error
}

// DeleteJob deletes a backup job
func (r *BackupRepository) DeleteJob(id uint) error {
	return r.db.Delete(&models.BackupJob{}, id).Error
}

// ListJobs lists all backup jobs
func (r *BackupRepository) ListJobs() ([]models.BackupJob, error) {
	var jobs []models.BackupJob
	err := r.db.Preload("RustFSInstance").
		Preload("PostgresInstance").
		Preload("VPSInstance").
		Preload("DestinationInstance").
		Preload("BackupRuns", func(db *gorm.DB) *gorm.DB {
			return db.Order("started_at DESC").Limit(1)
		}).
		Find(&jobs).Error
	return jobs, err
}

// CountJobsByUserID counts backup jobs for a user
func (r *BackupRepository) CountJobsByUserID(userID uint) (int64, error) {
	var count int64
	err := r.db.Model(&models.BackupJob{}).
		Where("user_id = ?", userID).
		Count(&count).Error
	return count, err
}

// Backup Run methods

// CreateRun creates a new backup run
func (r *BackupRepository) CreateRun(run *models.BackupRun) error {
	return r.db.Create(run).Error
}

// FindRunByID finds a backup run by ID
func (r *BackupRepository) FindRunByID(id uint) (*models.BackupRun, error) {
	var run models.BackupRun
	err := r.db.First(&run, id).Error
	if err != nil {
		return nil, err
	}
	return &run, nil
}

// FindRunsByJobID finds all backup runs for a job
func (r *BackupRepository) FindRunsByJobID(jobID uint) ([]models.BackupRun, error) {
	var runs []models.BackupRun
	err := r.db.Where("backup_job_id = ?", jobID).
		Order("started_at DESC").
		Find(&runs).Error
	return runs, err
}

// UpdateRun updates a backup run
func (r *BackupRepository) UpdateRun(run *models.BackupRun) error {
	return r.db.Save(run).Error
}
