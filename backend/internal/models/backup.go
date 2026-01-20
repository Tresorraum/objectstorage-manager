package models

import (
	"time"

	"github.com/google/uuid"
)

type BackupStatus string

const (
	BackupStatusInProgress BackupStatus = "IN_PROGRESS"
	BackupStatusCompleted  BackupStatus = "COMPLETED"
	BackupStatusFailed     BackupStatus = "FAILED"
	BackupStatusCanceled   BackupStatus = "CANCELED"
)

type BackupEncryption string

const (
	BackupEncryptionNone      BackupEncryption = "NONE"
	BackupEncryptionEncrypted BackupEncryption = "ENCRYPTED"
)

type Backup struct {
	ID               uuid.UUID        `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID           uint             `gorm:"not null" json:"user_id"`
	DatabaseID       uint             `gorm:"not null" json:"database_id"`
	StorageID        *uint            `json:"storage_id"`
	Status           BackupStatus     `gorm:"type:varchar(20);not null" json:"status"`
	FailMessage      *string          `gorm:"type:text" json:"fail_message,omitempty"`
	BackupSizeMb     float64          `gorm:"default:0" json:"backup_size_mb"`
	BackupDurationMs int64            `gorm:"default:0" json:"backup_duration_ms"`
	EncryptionSalt   *string          `gorm:"type:text" json:"encryption_salt,omitempty"`
	EncryptionIV     *string          `gorm:"type:text" json:"encryption_iv,omitempty"`
	Encryption       BackupEncryption `gorm:"type:varchar(20);not null;default:'NONE'" json:"encryption"`
	DestinationType  string           `gorm:"type:varchar(50)" json:"destination_type"` // local, vps, object_storage
	DestinationPath  *string          `gorm:"type:text" json:"destination_path,omitempty"`
	CreatedAt        time.Time        `json:"created_at"`
	UpdatedAt        time.Time        `json:"updated_at"`

	// Relations
	User     User             `gorm:"foreignKey:UserID" json:"-"`
	Database PostgresInstance `gorm:"foreignKey:DatabaseID" json:"-"`
}

func (Backup) TableName() string {
	return "backups"
}
