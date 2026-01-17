package repository

import (
	"gorm.io/gorm"
	"rustfs-manager/internal/models"
)

type BackupRepository interface {
	CreateJob(job *models.BackupJob) error
	FindJobByID(id uint) (*models.BackupJob, error)
	FindJobsByUserID(userID uint) ([]models.BackupJob, error)
	UpdateJob(job *models.BackupJob) error
	DeleteJob(id uint) error
	ListJobs() ([]models.BackupJob, error)
	CountJobsByUserID(userID uint) (int64, error)
	
	CreateRun(run *models.BackupRun) error
	FindRunByID(id uint) (*models.BackupRun, error)
	FindRunsByJobID(jobID uint) ([]models.BackupRun, error)
	UpdateRun(run *models.BackupRun) error
}

type backupRepository struct {
	db *gorm.DB
}

func NewBackupRepository(db *gorm.DB) BackupRepository {
	return &backupRepository{db: db}
}

// Backup Job methods
func (r *backupRepository) CreateJob(job *models.BackupJob) error {
	return r.db.Create(job).Error
}

func (r *backupRepository) FindJobByID(id uint) (*models.BackupJob, error) {
	var job models.BackupJob
	err := r.db.Preload("RustFSInstance").
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

func (r *backupRepository) FindJobsByUserID(userID uint) ([]models.BackupJob, error) {
	var jobs []models.BackupJob
	err := r.db.Where("user_id = ?", userID).
		Preload("RustFSInstance").
		Preload("DestinationInstance").
		Preload("BackupRuns", func(db *gorm.DB) *gorm.DB {
			return db.Order("started_at DESC").Limit(1)
		}).
		Find(&jobs).Error
	return jobs, err
}

func (r *backupRepository) UpdateJob(job *models.BackupJob) error {
	return r.db.Save(job).Error
}

func (r *backupRepository) DeleteJob(id uint) error {
	return r.db.Delete(&models.BackupJob{}, id).Error
}

func (r *backupRepository) ListJobs() ([]models.BackupJob, error) {
	var jobs []models.BackupJob
	err := r.db.Preload("RustFSInstance").
		Preload("DestinationInstance").
		Preload("BackupRuns", func(db *gorm.DB) *gorm.DB {
			return db.Order("started_at DESC").Limit(1)
		}).
		Find(&jobs).Error
	return jobs, err
}

func (r *backupRepository) CountJobsByUserID(userID uint) (int64, error) {
	var count int64
	err := r.db.Model(&models.BackupJob{}).Where("user_id = ?", userID).Count(&count).Error
	return count, err
}

// Backup Run methods
func (r *backupRepository) CreateRun(run *models.BackupRun) error {
	return r.db.Create(run).Error
}

func (r *backupRepository) FindRunByID(id uint) (*models.BackupRun, error) {
	var run models.BackupRun
	err := r.db.First(&run, id).Error
	if err != nil {
		return nil, err
	}
	return &run, nil
}

func (r *backupRepository) FindRunsByJobID(jobID uint) ([]models.BackupRun, error) {
	var runs []models.BackupRun
	err := r.db.Where("backup_job_id = ?", jobID).
		Order("started_at DESC").
		Find(&runs).Error
	return runs, err
}

func (r *backupRepository) UpdateRun(run *models.BackupRun) error {
	return r.db.Save(run).Error
}
