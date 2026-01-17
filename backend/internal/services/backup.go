package services

import (
	"archive/tar"
	"compress/gzip"
	"context"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"time"

	"github.com/minio/minio-go/v7"
	"gorm.io/gorm"
	"rustfs-manager/internal/models"
)

type BackupService struct {
	db           *gorm.DB
	rustfsService *RustFSService
}

func NewBackupService(db *gorm.DB) *BackupService {
	return &BackupService{
		db:           db,
		rustfsService: NewRustFSService(),
	}
}

// CreateBackupJob creates a new backup job
func (s *BackupService) CreateBackupJob(job *models.BackupJob) error {
	// Calculate next run time based on schedule
	if job.Schedule != "" {
		nextRun, err := s.calculateNextRun(job.Schedule)
		if err != nil {
			return fmt.Errorf("invalid schedule: %w", err)
		}
		job.NextRun = &nextRun
	}

	return s.db.Create(job).Error
}

// GetBackupJob retrieves a backup job by ID
func (s *BackupService) GetBackupJob(id uint) (*models.BackupJob, error) {
	var job models.BackupJob
	err := s.db.Preload("RustFSInstance").Preload("BackupRuns").First(&job, id).Error
	if err != nil {
		return nil, err
	}
	
	return &job, nil
}

// ListBackupJobs returns all backup jobs with latest backup run info
func (s *BackupService) ListBackupJobs() ([]models.BackupJob, error) {
	var jobs []models.BackupJob
	err := s.db.Preload("RustFSInstance").
		Preload("BackupRuns", func(db *gorm.DB) *gorm.DB {
			return db.Order("started_at DESC").Limit(1)
		}).
		Find(&jobs).Error
	
	if err != nil {
		return nil, err
	}
	
	// Populate computed fields
	for i := range jobs {
		jobs[i].LastErrorMsg = jobs[i].GetLastErrorMsg()
	}
	
	return jobs, nil
}

// UpdateBackupJob updates a backup job
func (s *BackupService) UpdateBackupJob(job *models.BackupJob) error {
	if job.Schedule != "" {
		nextRun, err := s.calculateNextRun(job.Schedule)
		if err != nil {
			return fmt.Errorf("invalid schedule: %w", err)
		}
		job.NextRun = &nextRun
	}

	return s.db.Save(job).Error
}

// DeleteBackupJob deletes a backup job
func (s *BackupService) DeleteBackupJob(id uint) error {
	return s.db.Delete(&models.BackupJob{}, id).Error
}

// RunBackupJob executes a backup job
func (s *BackupService) RunBackupJob(jobID uint) (*models.BackupRun, error) {
	// Get the backup job
	job, err := s.GetBackupJob(jobID)
	if err != nil {
		return nil, fmt.Errorf("failed to get backup job: %w", err)
	}

	// Update backup job status to running
	job.Status = "running"
	if err := s.db.Save(job).Error; err != nil {
		return nil, fmt.Errorf("failed to update backup job status: %w", err)
	}

	// Create backup run record
	run := &models.BackupRun{
		BackupJobID: jobID,
		Status:      "running",
		StartedAt:   time.Now(),
	}

	if err := s.db.Create(run).Error; err != nil {
		return nil, fmt.Errorf("failed to create backup run: %w", err)
	}

	// Run backup in background
	go func() {
		s.executeBackup(job, run)
	}()

	return run, nil
}

// executeBackup performs the actual backup operation
func (s *BackupService) executeBackup(job *models.BackupJob, run *models.BackupRun) {
	defer func() {
		if r := recover(); r != nil {
			log.Printf("Panic in executeBackup: %v", r)
			s.updateBackupRun(run, "failed", fmt.Sprintf("Panic: %v", r), 0, 0, "")
			s.updateBackupJobStatus(job.ID, "failed")
		}
	}()

	// IMPORTANT: Reload the RustFS instance to ensure we get the correct SSL value
	// There's a GORM issue where preloaded relationships don't preserve boolean values correctly
	var rustfsInstance models.RustFSInstance
	if err := s.db.First(&rustfsInstance, job.RustFSInstanceID).Error; err != nil {
		s.updateBackupRun(run, "failed", fmt.Sprintf("Failed to reload RustFS instance: %v", err), 0, 0, "")
		s.updateBackupJobStatus(job.ID, "failed")
		return
	}

	// Get RustFS client with the correctly loaded instance
	client, err := s.rustfsService.GetClient(&rustfsInstance)
	if err != nil {
		s.updateBackupRun(run, "failed", fmt.Sprintf("Failed to get RustFS client: %v", err), 0, 0, "")
		s.updateBackupJobStatus(job.ID, "failed")
		return
	}

	// Create backup directory
	backupDir := filepath.Join("/app/backups", fmt.Sprintf("job_%d", job.ID))
	timestamp := time.Now().Format("20060102_150405")
	backupPath := filepath.Join(backupDir, fmt.Sprintf("%s_%s.tar.gz", job.SourceBucket, timestamp))

	if err := os.MkdirAll(filepath.Dir(backupPath), 0755); err != nil {
		s.updateBackupRun(run, "failed", fmt.Sprintf("Failed to create backup directory: %v", err), 0, 0, "")
		s.updateBackupJobStatus(job.ID, "failed")
		return
	}

	// Test connection first by trying to list objects
	ctx := context.Background()
	objectCh := client.ListObjects(ctx, job.SourceBucket, minio.ListObjectsOptions{Recursive: true})

	// Collect objects first to ensure connection works
	var objects []minio.ObjectInfo
	for object := range objectCh {
		if object.Err != nil {
			s.updateBackupRun(run, "failed", fmt.Sprintf("Failed to list objects: %v", object.Err), 0, 0, "")
			s.updateBackupJobStatus(job.ID, "failed")
			return
		}
		objects = append(objects, object)
	}

	// Only create backup file after successful object listing
	backupFile, err := os.Create(backupPath)
	if err != nil {
		s.updateBackupRun(run, "failed", fmt.Sprintf("Failed to create backup file: %v", err), 0, 0, "")
		s.updateBackupJobStatus(job.ID, "failed")
		return
	}
	defer func() {
		backupFile.Close()
		// Clean up file if backup failed
		if run.Status == "failed" {
			os.Remove(backupPath)
		}
	}()

	// Create gzip writer if compression is enabled
	var writer io.Writer = backupFile
	if job.CompressionType == "gzip" {
		gzWriter := gzip.NewWriter(backupFile)
		defer gzWriter.Close()
		writer = gzWriter
	}

	// Create tar writer
	tarWriter := tar.NewWriter(writer)
	defer tarWriter.Close()

	var filesCount int64
	var bytesCount int64

	// Process the collected objects
	for _, object := range objects {
		// Get object
		obj, err := client.GetObject(ctx, job.SourceBucket, object.Key, minio.GetObjectOptions{})
		if err != nil {
			s.updateBackupRun(run, "failed", fmt.Sprintf("Failed to get object %s: %v", object.Key, err), filesCount, bytesCount, "")
			s.updateBackupJobStatus(job.ID, "failed")
			return
		}

		// Add to tar
		header := &tar.Header{
			Name:    object.Key,
			Size:    object.Size,
			Mode:    0644,
			ModTime: object.LastModified,
		}

		if err := tarWriter.WriteHeader(header); err != nil {
			obj.Close()
			s.updateBackupRun(run, "failed", fmt.Sprintf("Failed to write tar header for %s: %v", object.Key, err), filesCount, bytesCount, "")
			s.updateBackupJobStatus(job.ID, "failed")
			return
		}

		written, err := io.Copy(tarWriter, obj)
		obj.Close()

		if err != nil {
			s.updateBackupRun(run, "failed", fmt.Sprintf("Failed to write object %s: %v", object.Key, err), filesCount, bytesCount, "")
			s.updateBackupJobStatus(job.ID, "failed")
			return
		}

		filesCount++
		bytesCount += written
	}

	// Update backup job last run time and status
	now := time.Now()
	job.LastRun = &now
	job.Status = "completed"
	if job.Schedule != "" {
		nextRun, _ := s.calculateNextRun(job.Schedule)
		job.NextRun = &nextRun
	}
	s.db.Save(job)

	// Update backup run as completed
	s.updateBackupRun(run, "completed", "", filesCount, bytesCount, backupPath)
}

// updateBackupRun updates the backup run status
func (s *BackupService) updateBackupRun(run *models.BackupRun, status, errorMsg string, filesCount, bytesCount int64, backupPath string) {
	now := time.Now()
	run.Status = status
	run.CompletedAt = &now
	run.ErrorMsg = errorMsg
	run.FilesCount = filesCount
	run.BytesCount = bytesCount
	run.BackupPath = backupPath

	s.db.Save(run)
}

// updateBackupJobStatus updates the backup job status
func (s *BackupService) updateBackupJobStatus(jobID uint, status string) {
	s.db.Model(&models.BackupJob{}).Where("id = ?", jobID).Update("status", status)
}

// RestoreBackup restores a backup to a RustFS instance
func (s *BackupService) RestoreBackup(instanceID uint, backupPath, targetBucket string) error {
	// Get RustFS instance
	var instance models.RustFSInstance
	if err := s.db.First(&instance, instanceID).Error; err != nil {
		return fmt.Errorf("failed to get RustFS instance: %w", err)
	}

	// Get RustFS client
	client, err := s.rustfsService.GetClient(&instance)
	if err != nil {
		return fmt.Errorf("failed to get RustFS client: %w", err)
	}

	// Open backup file
	backupFile, err := os.Open(backupPath)
	if err != nil {
		return fmt.Errorf("failed to open backup file: %w", err)
	}
	defer backupFile.Close()

	// Create gzip reader if needed
	var reader io.Reader = backupFile
	if filepath.Ext(backupPath) == ".gz" {
		gzReader, err := gzip.NewReader(backupFile)
		if err != nil {
			return fmt.Errorf("failed to create gzip reader: %w", err)
		}
		defer gzReader.Close()
		reader = gzReader
	}

	// Create tar reader
	tarReader := tar.NewReader(reader)

	// Create target bucket if it doesn't exist
	ctx := context.Background()
	exists, err := client.BucketExists(ctx, targetBucket)
	if err != nil {
		return fmt.Errorf("failed to check bucket existence: %w", err)
	}

	if !exists {
		if err := client.MakeBucket(ctx, targetBucket, minio.MakeBucketOptions{}); err != nil {
			return fmt.Errorf("failed to create target bucket: %w", err)
		}
	}

	// Extract and restore objects
	for {
		header, err := tarReader.Next()
		if err == io.EOF {
			break
		}
		if err != nil {
			return fmt.Errorf("failed to read tar header: %w", err)
		}

		// Upload object to RustFS
		_, err = client.PutObject(ctx, targetBucket, header.Name, tarReader, header.Size, minio.PutObjectOptions{})
		if err != nil {
			return fmt.Errorf("failed to upload object %s: %w", header.Name, err)
		}
	}

	return nil
}

// calculateNextRun calculates the next run time based on cron schedule
func (s *BackupService) calculateNextRun(schedule string) (time.Time, error) {
	// This is a simplified implementation
	// In production, you'd use a proper cron parser like github.com/robfig/cron
	
	// For now, just add 24 hours for daily backups
	return time.Now().Add(24 * time.Hour), nil
}