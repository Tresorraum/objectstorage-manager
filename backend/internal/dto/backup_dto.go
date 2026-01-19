package dto

// Request DTOs
type CreateBackupJobRequest struct {
	Name                  string `json:"name" binding:"required"`
	RustFSInstanceID      uint   `json:"rustfs_instance_id" binding:"required"`
	SourceBucket          string `json:"source_bucket" binding:"required"`
	BackupType            string `json:"backup_type" binding:"required"`
	DestinationPath       string `json:"destination_path"`
	DestinationInstanceID *uint  `json:"destination_instance_id"`
	DestinationBucket     string `json:"destination_bucket"`
	Schedule              string `json:"schedule"`
	Enabled               bool   `json:"enabled"`
	RetentionDays         int    `json:"retention_days"`
	CompressionType       string `json:"compression_type"`
	CompressionEnabled    bool   `json:"compression_enabled"` // For bucket backups: true = tar.gz, false = direct copy
}

type UpdateBackupJobRequest struct {
	Name                  string `json:"name" binding:"required"`
	RustFSInstanceID      uint   `json:"rustfs_instance_id" binding:"required"`
	SourceBucket          string `json:"source_bucket" binding:"required"`
	BackupType            string `json:"backup_type" binding:"required"`
	DestinationPath       string `json:"destination_path"`
	DestinationInstanceID *uint  `json:"destination_instance_id"`
	DestinationBucket     string `json:"destination_bucket"`
	Schedule              string `json:"schedule"`
	Enabled               bool   `json:"enabled"`
	RetentionDays         int    `json:"retention_days"`
	CompressionType       string `json:"compression_type"`
	CompressionEnabled    bool   `json:"compression_enabled"` // For bucket backups: true = tar.gz, false = direct copy
}

type RestoreBackupRequest struct {
	InstanceID   uint   `json:"instance_id" binding:"required"`
	BackupPath   string `json:"backup_path" binding:"required"`
	TargetBucket string `json:"target_bucket" binding:"required"`
}
