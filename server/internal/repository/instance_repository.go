package repository

import (
	"gorm.io/gorm"
	"rukhalt/internal/models"
)

type InstanceRepository interface {
	Create(instance *models.RustFSInstance) error
	FindByID(id uint) (*models.RustFSInstance, error)
	FindByUserID(userID uint) ([]models.RustFSInstance, error)
	Update(instance *models.RustFSInstance) error
	Delete(id uint) error
	List() ([]models.RustFSInstance, error)
	CountByUserID(userID uint) (int64, error)
}

type instanceRepository struct {
	db *gorm.DB
}

func NewInstanceRepository(db *gorm.DB) InstanceRepository {
	return &instanceRepository{db: db}
}

func (r *instanceRepository) Create(instance *models.RustFSInstance) error {
	return r.db.Create(instance).Error
}

func (r *instanceRepository) FindByID(id uint) (*models.RustFSInstance, error) {
	var instance models.RustFSInstance
	err := r.db.First(&instance, id).Error
	if err != nil {
		return nil, err
	}
	return &instance, nil
}

func (r *instanceRepository) FindByUserID(userID uint) ([]models.RustFSInstance, error) {
	var instances []models.RustFSInstance
	err := r.db.Where("user_id = ?", userID).Find(&instances).Error
	return instances, err
}

func (r *instanceRepository) Update(instance *models.RustFSInstance) error {
	return r.db.Save(instance).Error
}

func (r *instanceRepository) Delete(id uint) error {
	return r.db.Delete(&models.RustFSInstance{}, id).Error
}

func (r *instanceRepository) List() ([]models.RustFSInstance, error) {
	var instances []models.RustFSInstance
	err := r.db.Find(&instances).Error
	return instances, err
}

func (r *instanceRepository) CountByUserID(userID uint) (int64, error) {
	var count int64
	err := r.db.Model(&models.RustFSInstance{}).Where("user_id = ?", userID).Count(&count).Error
	return count, err
}
