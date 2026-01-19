package database

import (
	"fmt"

	"rustfs-manager/internal/config"
	"rustfs-manager/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Initialize(cfg config.DatabaseConfig) (*gorm.DB, error) {
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%d sslmode=%s",
		cfg.Host, cfg.User, cfg.Password, cfg.Name, cfg.Port, cfg.SSLMode)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Auto-migrate the schema
	if err := db.AutoMigrate(
		&models.User{},
		&models.RustFSInstance{},
		&models.PostgresInstance{},
		&models.VPSInstance{},
		&models.BackupJob{},
		&models.BackupRun{},
		&models.Metric{},
		&models.Alert{},
		&models.AuditLog{},
		&models.Configuration{},
	); err != nil {
		return nil, fmt.Errorf("failed to migrate database: %w", err)
	}

	return db, nil
}
