package models

import (
	"time"

	"gorm.io/gorm"
)

// User represents a system user
type User struct {
	ID        uint           `json:"id" gorm:"primarykey"`
	Username  string         `json:"username" gorm:"uniqueIndex;not null"`
	Email     string         `json:"email" gorm:"uniqueIndex;not null"`
	Password  string         `json:"-" gorm:"not null"`
	Role      string         `json:"role" gorm:"default:user"`
	IsPremium bool           `json:"is_premium" gorm:"default:false"`
	Active    bool           `json:"active" gorm:"default:true"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

// RustFSInstance represents a RustFS deployment
type RustFSInstance struct {
	ID          uint           `json:"id" gorm:"primarykey"`
	UserID      uint           `json:"user_id" gorm:"not null"`
	Name        string         `json:"name" gorm:"not null"`
	Endpoint    string         `json:"endpoint" gorm:"not null"`
	AccessKey   string         `json:"access_key" gorm:"not null"`
	SecretKey   string         `json:"-" gorm:"not null"`
	Region      string         `json:"region" gorm:"default:us-east-1"`
	SSL         bool           `json:"ssl" gorm:"default:true"`
	Description string         `json:"description"`
	Status      string         `json:"status" gorm:"default:active"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	BackupJobs []BackupJob `json:"backup_jobs,omitempty"`
	Metrics    []Metric    `json:"metrics,omitempty"`
}

// PostgresInstance represents a PostgreSQL database connection
type PostgresInstance struct {
	ID          uint           `json:"id" gorm:"primarykey"`
	UserID      uint           `json:"user_id" gorm:"not null"`
	Name        string         `json:"name" gorm:"not null"`
	Host        string         `json:"host" gorm:"not null"`
	Port        int            `json:"port" gorm:"default:5432"`
	Database    string         `json:"database" gorm:"not null"`
	Username    string         `json:"username" gorm:"not null"`
	Password    string         `json:"-" gorm:"not null"` // Encrypted
	SSL         bool           `json:"ssl" gorm:"default:false"`
	Description string         `json:"description"`
	Status      string         `json:"status" gorm:"default:active"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

// VPSInstance represents a VPS server for remote backups
type VPSInstance struct {
	ID          uint           `json:"id" gorm:"primarykey"`
	UserID      uint           `json:"user_id" gorm:"not null"`
	Name        string         `json:"name" gorm:"not null"`
	Host        string         `json:"host" gorm:"not null"`
	Port        int            `json:"port" gorm:"default:22"`
	Username    string         `json:"username" gorm:"not null"`
	AuthType    string         `json:"auth_type" gorm:"default:password"` // "password" or "ssh_key"
	Password    string         `json:"-"`                                 // Encrypted, for password auth
	SSHKey      string         `json:"-"`                                 // Encrypted, for key auth
	BackupPath  string         `json:"backup_path" gorm:"not null"`
	Description string         `json:"description"`
	Status      string         `json:"status" gorm:"default:active"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

// BackupJob represents a backup configuration
type BackupJob struct {
	ID                    uint           `json:"id" gorm:"primarykey"`
	UserID                uint           `json:"user_id" gorm:"not null"`
	Name                  string         `json:"name" gorm:"not null"`
	SourceType            string         `json:"source_type" gorm:"default:object_storage"` // "object_storage", "postgres", "vps"
	RustFSInstanceID      *uint          `json:"rustfs_instance_id"`                        // For object storage source
	PostgresInstanceID    *uint          `json:"postgres_instance_id"`                      // For postgres source
	VPSInstanceID         *uint          `json:"vps_instance_id"`                           // For vps source
	SourceBucket          string         `json:"source_bucket"`                             // For object storage
	SourcePath            string         `json:"source_path"`                               // For VPS file/folder backups
	BackupType            string         `json:"backup_type" gorm:"default:server"`         // "server" or "bucket"
	DestinationPath       string         `json:"destination_path"`                          // For server backups and bucket path prefix
	DestinationInstanceID *uint          `json:"destination_instance_id"`                   // For bucket backups
	DestinationBucket     string         `json:"destination_bucket"`                        // For bucket backups
	Schedule              string         `json:"schedule"`                                  // Cron expression
	Enabled               bool           `json:"enabled" gorm:"default:true"`
	RetentionDays         int            `json:"retention_days" gorm:"default:30"`
	CompressionType       string         `json:"compression_type" gorm:"default:gzip"` // "gzip", "none"
	CompressionEnabled    bool           `json:"compression_enabled"`                  // For bucket backups: true = tar.gz archive, false = direct copy
	LastRun               *time.Time     `json:"last_run"`
	NextRun               *time.Time     `json:"next_run"`
	Status                string         `json:"status" gorm:"default:pending"`
	CreatedAt             time.Time      `json:"created_at"`
	UpdatedAt             time.Time      `json:"updated_at"`
	DeletedAt             gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	RustFSInstance      *RustFSInstance   `json:"rustfs_instance,omitempty" gorm:"foreignKey:RustFSInstanceID"`
	PostgresInstance    *PostgresInstance `json:"postgres_instance,omitempty" gorm:"foreignKey:PostgresInstanceID"`
	VPSInstance         *VPSInstance      `json:"vps_instance,omitempty" gorm:"foreignKey:VPSInstanceID"`
	DestinationInstance *RustFSInstance   `json:"destination_instance,omitempty" gorm:"foreignKey:DestinationInstanceID"`
	BackupRuns          []BackupRun       `json:"backup_runs,omitempty"`

	// Computed fields
	LastErrorMsg string `json:"last_error_msg" gorm:"-"`
}

// GetLastErrorMsg returns the error message from the most recent backup run
func (bj *BackupJob) GetLastErrorMsg() string {
	if len(bj.BackupRuns) > 0 {
		return bj.BackupRuns[0].ErrorMsg
	}
	return ""
}

// BackupRun represents an execution of a backup job
type BackupRun struct {
	ID          uint           `json:"id" gorm:"primarykey"`
	BackupJobID uint           `json:"backup_job_id" gorm:"not null"`
	Status      string         `json:"status" gorm:"default:running"`
	StartedAt   time.Time      `json:"started_at"`
	CompletedAt *time.Time     `json:"completed_at"`
	FilesCount  int64          `json:"files_count"`
	BytesCount  int64          `json:"bytes_count"`
	ErrorMsg    string         `json:"error_msg"`
	BackupPath  string         `json:"backup_path"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	BackupJob BackupJob `json:"backup_job,omitempty"`
}

// Metric represents performance and usage metrics
type Metric struct {
	ID               uint           `json:"id" gorm:"primarykey"`
	RustFSInstanceID uint           `json:"rustfs_instance_id" gorm:"not null"`
	MetricType       string         `json:"metric_type" gorm:"not null"` // storage, requests, bandwidth
	MetricName       string         `json:"metric_name" gorm:"not null"` // total_size, get_requests, etc.
	Value            float64        `json:"value" gorm:"not null"`
	Unit             string         `json:"unit" gorm:"not null"` // bytes, count, bytes/sec
	Timestamp        time.Time      `json:"timestamp" gorm:"not null"`
	CreatedAt        time.Time      `json:"created_at"`
	DeletedAt        gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	RustFSInstance RustFSInstance `json:"rustfs_instance,omitempty"`
}

// Alert represents system alerts and notifications
type Alert struct {
	ID         uint           `json:"id" gorm:"primarykey"`
	Type       string         `json:"type" gorm:"not null"`     // warning, error, info
	Severity   string         `json:"severity" gorm:"not null"` // low, medium, high, critical
	Title      string         `json:"title" gorm:"not null"`
	Message    string         `json:"message" gorm:"not null"`
	Source     string         `json:"source"`    // backup, storage, system
	SourceID   *uint          `json:"source_id"` // Related entity ID
	Resolved   bool           `json:"resolved" gorm:"default:false"`
	ResolvedAt *time.Time     `json:"resolved_at"`
	ResolvedBy *uint          `json:"resolved_by"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `json:"-" gorm:"index"`
}

// AuditLog represents system audit trail
type AuditLog struct {
	ID         uint           `json:"id" gorm:"primarykey"`
	UserID     *uint          `json:"user_id"`
	Action     string         `json:"action" gorm:"not null"`   // create, update, delete, backup, restore
	Resource   string         `json:"resource" gorm:"not null"` // instance, backup_job, user
	ResourceID *uint          `json:"resource_id"`
	Details    string         `json:"details"` // JSON string with additional details
	IPAddress  string         `json:"ip_address"`
	UserAgent  string         `json:"user_agent"`
	CreatedAt  time.Time      `json:"created_at"`
	DeletedAt  gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	User *User `json:"user,omitempty"`
}

// Configuration represents system configuration
type Configuration struct {
	ID        uint           `json:"id" gorm:"primarykey"`
	Key       string         `json:"key" gorm:"uniqueIndex;not null"`
	Value     string         `json:"value" gorm:"not null"`
	Type      string         `json:"type" gorm:"default:string"` // string, int, bool, json
	Category  string         `json:"category" gorm:"not null"`   // backup, notification, system
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}
