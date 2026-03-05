package repository

import (
	"rukhalt/internal/models"

	"gorm.io/gorm"
)

type AuditRepository interface {
	Create(log *models.AuditLog) error
	FindAll(limit, offset int) ([]models.AuditLog, error)
	FindByUserID(userID uint, limit, offset int) ([]models.AuditLog, error)
	FindByAction(action string, limit, offset int) ([]models.AuditLog, error)
	FindByResource(resource string, limit, offset int) ([]models.AuditLog, error)
	Search(query string, action string, resource string, limit, offset int) ([]models.AuditLog, int64, error)
	Count() (int64, error)
}

type auditRepository struct {
	db *gorm.DB
}

func NewAuditRepository(db *gorm.DB) AuditRepository {
	return &auditRepository{db: db}
}

func (r *auditRepository) Create(log *models.AuditLog) error {
	return r.db.Create(log).Error
}

func (r *auditRepository) FindAll(limit, offset int) ([]models.AuditLog, error) {
	var logs []models.AuditLog
	err := r.db.Preload("User").
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&logs).Error
	return logs, err
}

func (r *auditRepository) FindByUserID(userID uint, limit, offset int) ([]models.AuditLog, error) {
	var logs []models.AuditLog
	err := r.db.Preload("User").
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&logs).Error
	return logs, err
}

func (r *auditRepository) FindByAction(action string, limit, offset int) ([]models.AuditLog, error) {
	var logs []models.AuditLog
	err := r.db.Preload("User").
		Where("action = ?", action).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&logs).Error
	return logs, err
}

func (r *auditRepository) FindByResource(resource string, limit, offset int) ([]models.AuditLog, error) {
	var logs []models.AuditLog
	err := r.db.Preload("User").
		Where("resource = ?", resource).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&logs).Error
	return logs, err
}

func (r *auditRepository) Search(query string, action string, resource string, limit, offset int) ([]models.AuditLog, int64, error) {
	var logs []models.AuditLog
	var total int64

	db := r.db.Model(&models.AuditLog{})

	if query != "" {
		db = db.Where("details LIKE ? OR ip_address LIKE ?", "%"+query+"%", "%"+query+"%")
	}
	if action != "" && action != "all" {
		db = db.Where("action = ?", action)
	}
	if resource != "" && resource != "all" {
		db = db.Where("resource = ?", resource)
	}

	db.Count(&total)

	err := db.Preload("User").
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&logs).Error

	return logs, total, err
}

func (r *auditRepository) Count() (int64, error) {
	var count int64
	err := r.db.Model(&models.AuditLog{}).Count(&count).Error
	return count, err
}
