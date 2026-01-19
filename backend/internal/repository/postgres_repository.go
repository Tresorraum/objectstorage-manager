package repository

import (
	"rustfs-manager/internal/models"

	"gorm.io/gorm"
)

type PostgresRepository struct {
	db *gorm.DB
}

func NewPostgresRepository(db *gorm.DB) *PostgresRepository {
	return &PostgresRepository{db: db}
}

// Create creates a new PostgreSQL instance
func (r *PostgresRepository) Create(instance *models.PostgresInstance) error {
	return r.db.Create(instance).Error
}

// GetByID retrieves a PostgreSQL instance by ID
func (r *PostgresRepository) GetByID(id uint) (*models.PostgresInstance, error) {
	var instance models.PostgresInstance
	err := r.db.First(&instance, id).Error
	if err != nil {
		return nil, err
	}
	return &instance, nil
}

// GetByUserID retrieves all PostgreSQL instances for a user
func (r *PostgresRepository) GetByUserID(userID uint) ([]models.PostgresInstance, error) {
	var instances []models.PostgresInstance
	err := r.db.Where("user_id = ?", userID).Order("created_at DESC").Find(&instances).Error
	return instances, err
}

// Update updates a PostgreSQL instance
func (r *PostgresRepository) Update(instance *models.PostgresInstance) error {
	return r.db.Save(instance).Error
}

// Delete soft deletes a PostgreSQL instance
func (r *PostgresRepository) Delete(id uint) error {
	return r.db.Delete(&models.PostgresInstance{}, id).Error
}

// CountByUserID counts PostgreSQL instances for a user
func (r *PostgresRepository) CountByUserID(userID uint) (int64, error) {
	var count int64
	err := r.db.Model(&models.PostgresInstance{}).Where("user_id = ?", userID).Count(&count).Error
	return count, err
}
