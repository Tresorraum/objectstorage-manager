package repository

import (
	"rustfs-manager/internal/models"

	"gorm.io/gorm"
)

type VPSRepository struct {
	db *gorm.DB
}

func NewVPSRepository(db *gorm.DB) *VPSRepository {
	return &VPSRepository{db: db}
}

// Create creates a new VPS instance
func (r *VPSRepository) Create(instance *models.VPSInstance) error {
	return r.db.Create(instance).Error
}

// GetByID retrieves a VPS instance by ID
func (r *VPSRepository) GetByID(id uint) (*models.VPSInstance, error) {
	var instance models.VPSInstance
	err := r.db.First(&instance, id).Error
	if err != nil {
		return nil, err
	}
	return &instance, nil
}

// GetByUserID retrieves all VPS instances for a user
func (r *VPSRepository) GetByUserID(userID uint) ([]models.VPSInstance, error) {
	var instances []models.VPSInstance
	err := r.db.Where("user_id = ?", userID).Order("created_at DESC").Find(&instances).Error
	return instances, err
}

// Update updates a VPS instance
func (r *VPSRepository) Update(instance *models.VPSInstance) error {
	return r.db.Save(instance).Error
}

// Delete soft deletes a VPS instance
func (r *VPSRepository) Delete(id uint) error {
	return r.db.Delete(&models.VPSInstance{}, id).Error
}

// CountByUserID counts VPS instances for a user
func (r *VPSRepository) CountByUserID(userID uint) (int64, error) {
	var count int64
	err := r.db.Model(&models.VPSInstance{}).Where("user_id = ?", userID).Count(&count).Error
	return count, err
}
