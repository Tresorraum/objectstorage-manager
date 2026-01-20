package dto

// CreateBackupRequest represents a request to create a new backup
type CreateBackupRequest struct {
	DatabaseID              uint   `json:"database_id" binding:"required"`
	DestinationType         string `json:"destination_type" binding:"required,oneof=local vps object_storage"`
	VPSInstanceID           *uint  `json:"vps_instance_id"`
	ObjectStorageInstanceID *uint  `json:"object_storage_instance_id"`
	ObjectStorageBucket     string `json:"object_storage_bucket"`
	Encryption              bool   `json:"encryption"`
	CompressionLevel        int    `json:"compression_level" binding:"min=0,max=9"`
}

// GetBackupsRequest represents a request to list backups
type GetBackupsRequest struct {
	DatabaseID string `form:"database_id" binding:"required"`
	Limit      int    `form:"limit"`
	Offset     int    `form:"offset"`
}

// GetBackupsResponse represents the response for listing backups
type GetBackupsResponse struct {
	Backups []BackupResponse `json:"backups"`
	Total   int64            `json:"total"`
	Limit   int              `json:"limit"`
	Offset  int              `json:"offset"`
}

// BackupResponse represents a single backup in the response
type BackupResponse struct {
	ID               string  `json:"id"`
	DatabaseID       string  `json:"databaseId"`
	StorageID        *string `json:"storageId,omitempty"`
	Status           string  `json:"status"`
	FailMessage      *string `json:"failMessage,omitempty"`
	BackupSizeMb     float64 `json:"backupSizeMb"`
	BackupDurationMs int64   `json:"backupDurationMs"`
	Encryption       string  `json:"encryption"`
	EncryptionSalt   *string `json:"encryptionSalt,omitempty"`
	EncryptionIV     *string `json:"encryptionIV,omitempty"`
	CreatedAt        string  `json:"createdAt"`
}

// GenerateDownloadTokenRequest represents a request to generate a download token
type GenerateDownloadTokenResponse struct {
	Token    string `json:"token"`
	Filename string `json:"filename"`
	BackupID string `json:"backupId"`
}

// RestoreBackupRequest represents a request to restore a backup
type RestoreBackupRequest struct {
	SourceType              string  `json:"source_type" binding:"required,oneof=existing_backup object_storage vps local_file"`
	TargetDatabaseID        uint    `json:"target_database_id" binding:"required"`
	BackupID                *string `json:"backup_id"`
	ObjectStorageInstanceID *uint   `json:"object_storage_instance_id"`
	ObjectStorageBucket     string  `json:"object_storage_bucket"`
	ObjectStorageKey        string  `json:"object_storage_key"`
	VPSInstanceID           *uint   `json:"vps_instance_id"`
	VPSFilePath             string  `json:"vps_file_path"`
	DropExisting            bool    `json:"drop_existing"`
	CreateDatabase          bool    `json:"create_database"`
	NoOwner                 bool    `json:"no_owner"`
	NoPrivileges            bool    `json:"no_privileges"`
}

// CreateBackupJobRequest represents a request to create a scheduled backup job
type CreateBackupJobRequest struct {
	Name                  string `json:"name" binding:"required"`
	SourceType            string `json:"source_type" binding:"required"`
	RustFSInstanceID      *uint  `json:"rustfs_instance_id"`
	PostgresInstanceID    *uint  `json:"postgres_instance_id"`
	VPSInstanceID         *uint  `json:"vps_instance_id"`
	SourceBucket          string `json:"source_bucket"`
	SourcePath            string `json:"source_path"`
	BackupType            string `json:"backup_type" binding:"required"`
	DestinationPath       string `json:"destination_path"`
	DestinationInstanceID *uint  `json:"destination_instance_id"`
	DestinationBucket     string `json:"destination_bucket"`
	Schedule              string `json:"schedule"`
	Enabled               bool   `json:"enabled"`
	RetentionDays         int    `json:"retention_days"`
	CompressionType       string `json:"compression_type"`
	CompressionEnabled    bool   `json:"compression_enabled"`
}

// UpdateBackupJobRequest represents a request to update a scheduled backup job
type UpdateBackupJobRequest struct {
	Name                  string `json:"name" binding:"required"`
	SourceType            string `json:"source_type" binding:"required"`
	RustFSInstanceID      *uint  `json:"rustfs_instance_id"`
	PostgresInstanceID    *uint  `json:"postgres_instance_id"`
	VPSInstanceID         *uint  `json:"vps_instance_id"`
	SourceBucket          string `json:"source_bucket"`
	SourcePath            string `json:"source_path"`
	BackupType            string `json:"backup_type" binding:"required"`
	DestinationPath       string `json:"destination_path"`
	DestinationInstanceID *uint  `json:"destination_instance_id"`
	DestinationBucket     string `json:"destination_bucket"`
	Schedule              string `json:"schedule"`
	Enabled               bool   `json:"enabled"`
	RetentionDays         int    `json:"retention_days"`
	CompressionType       string `json:"compression_type"`
	CompressionEnabled    bool   `json:"compression_enabled"`
}
