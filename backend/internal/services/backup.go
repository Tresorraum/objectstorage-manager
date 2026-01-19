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
	"strings"
	"time"

	"rustfs-manager/internal/models"
	"rustfs-manager/internal/repository"

	"github.com/minio/minio-go/v7"
)

type BackupService struct {
	repo          repository.BackupRepository
	instanceRepo  repository.InstanceRepository
	rustfsService *RustFSService
	auditService  *AuditService
}

func NewBackupService(repo repository.BackupRepository, instanceRepo repository.InstanceRepository, auditService *AuditService) *BackupService {
	return &BackupService{
		repo:          repo,
		instanceRepo:  instanceRepo,
		rustfsService: NewRustFSService(),
		auditService:  auditService,
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

	return s.repo.CreateJob(job)
}

// GetBackupJob retrieves a backup job by ID
func (s *BackupService) GetBackupJob(id uint) (*models.BackupJob, error) {
	return s.repo.FindJobByID(id)
}

// ListBackupJobs returns all backup jobs with latest backup run info
func (s *BackupService) ListBackupJobs() ([]models.BackupJob, error) {
	jobs, err := s.repo.ListJobs()
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

	return s.repo.UpdateJob(job)
}

// DeleteBackupJob deletes a backup job
func (s *BackupService) DeleteBackupJob(id uint) error {
	return s.repo.DeleteJob(id)
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
	if err := s.repo.UpdateJob(job); err != nil {
		return nil, fmt.Errorf("failed to update backup job status: %w", err)
	}

	// Create backup run record
	run := &models.BackupRun{
		BackupJobID: jobID,
		Status:      "running",
		StartedAt:   time.Now(),
	}

	if err := s.repo.CreateRun(run); err != nil {
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
			log.Printf("Panic in executeBackup for job %d: %v", job.ID, r)
			s.updateBackupRun(run, "failed", fmt.Sprintf("Panic: %v", r), 0, 0, "")
			s.updateBackupJobStatus(job.ID, "failed")
		}
	}()

	log.Printf("Starting backup job %d (type=%s, compression_enabled=%v, source=%s, dest_bucket=%s)",
		job.ID, job.BackupType, job.CompressionEnabled, job.SourceBucket, job.DestinationBucket)

	// IMPORTANT: Reload the RustFS instance to ensure we get the correct SSL value
	jobWithInstance, err := s.repo.FindJobByID(job.ID)
	if err != nil {
		s.updateBackupRun(run, "failed", fmt.Sprintf("Failed to reload RustFS instance: %v", err), 0, 0, "")
		s.updateBackupJobStatus(job.ID, "failed")
		return
	}

	// Get RustFS client for source
	sourceClient, err := s.rustfsService.GetClient(&jobWithInstance.RustFSInstance)
	if err != nil {
		s.updateBackupRun(run, "failed", fmt.Sprintf("Failed to get source RustFS client: %v", err), 0, 0, "")
		s.updateBackupJobStatus(job.ID, "failed")
		return
	}

	// Route to appropriate backup method based on backup type
	if job.BackupType == "bucket" {
		s.executeBackupToBucket(job, run, sourceClient)
	} else {
		s.executeBackupToServer(job, run, sourceClient)
	}
}

// executeBackupToServer backs up to server storage
func (s *BackupService) executeBackupToServer(job *models.BackupJob, run *models.BackupRun, client *minio.Client) {
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
	s.repo.UpdateJob(job)

	// Update backup run as completed
	s.updateBackupRun(run, "completed", "", filesCount, bytesCount, backupPath)
}

// executeBackupToBucket backs up directly to another object storage bucket
func (s *BackupService) executeBackupToBucket(job *models.BackupJob, run *models.BackupRun, sourceClient *minio.Client) {
	ctx := context.Background()

	// Get destination instance
	if job.DestinationInstanceID == nil {
		s.updateBackupRun(run, "failed", "Destination instance ID is required for bucket backups", 0, 0, "")
		s.updateBackupJobStatus(job.ID, "failed")
		return
	}

	// Get destination instance from repository
	jobWithDest, err := s.repo.FindJobByID(job.ID)
	if err != nil || jobWithDest.DestinationInstance == nil {
		s.updateBackupRun(run, "failed", fmt.Sprintf("Failed to get destination instance: %v", err), 0, 0, "")
		s.updateBackupJobStatus(job.ID, "failed")
		return
	}

	// Get destination client
	destClient, err := s.rustfsService.GetClient(jobWithDest.DestinationInstance)
	if err != nil {
		s.updateBackupRun(run, "failed", fmt.Sprintf("Failed to get destination RustFS client: %v", err), 0, 0, "")
		s.updateBackupJobStatus(job.ID, "failed")
		return
	}

	// Ensure destination bucket exists
	exists, err := destClient.BucketExists(ctx, job.DestinationBucket)
	if err != nil {
		s.updateBackupRun(run, "failed", fmt.Sprintf("Failed to check destination bucket: %v", err), 0, 0, "")
		s.updateBackupJobStatus(job.ID, "failed")
		return
	}

	if !exists {
		if err := destClient.MakeBucket(ctx, job.DestinationBucket, minio.MakeBucketOptions{}); err != nil {
			s.updateBackupRun(run, "failed", fmt.Sprintf("Failed to create destination bucket: %v", err), 0, 0, "")
			s.updateBackupJobStatus(job.ID, "failed")
			return
		}
	}

	// Determine backup path prefix
	timestamp := time.Now().Format("20060102_150405")
	var pathPrefix string

	if job.CompressionEnabled {
		// For compressed backups: always use timestamp folder
		if job.DestinationPath != "" && job.DestinationPath != "/app/backups" {
			cleanPath := strings.Trim(job.DestinationPath, "/")
			if cleanPath != "" {
				pathPrefix = fmt.Sprintf("%s/%s", cleanPath, timestamp)
			} else {
				pathPrefix = timestamp
			}
		} else {
			pathPrefix = timestamp
		}
	} else {
		// For uncompressed backups: use custom path or root (no timestamp)
		if job.DestinationPath != "" && job.DestinationPath != "/app/backups" {
			cleanPath := strings.Trim(job.DestinationPath, "/")
			pathPrefix = cleanPath
		} else {
			pathPrefix = "" // Root of bucket
		}
	}

	log.Printf("Backup job %d: Using path prefix '%s' for bucket backup (compressed=%v)", job.ID, pathPrefix, job.CompressionEnabled)

	// Route to appropriate backup method based on compression setting
	if job.CompressionEnabled {
		log.Printf("Backup job %d: Executing COMPRESSED bucket backup", job.ID)
		s.executeCompressedBucketBackup(job, run, sourceClient, destClient, pathPrefix)
	} else {
		log.Printf("Backup job %d: Executing UNCOMPRESSED bucket backup", job.ID)
		s.executeUncompressedBucketBackup(job, run, sourceClient, destClient, pathPrefix)
	}
}

// executeCompressedBucketBackup creates a tar.gz archive and uploads it to the destination bucket
func (s *BackupService) executeCompressedBucketBackup(job *models.BackupJob, run *models.BackupRun, sourceClient, destClient *minio.Client, pathPrefix string) {
	ctx := context.Background()

	// Create temporary file for the archive
	tempDir := "/tmp"
	archiveName := fmt.Sprintf("%s_%s.tar.gz", job.SourceBucket, time.Now().Format("20060102_150405"))
	tempArchivePath := filepath.Join(tempDir, archiveName)

	archiveFile, err := os.Create(tempArchivePath)
	if err != nil {
		s.updateBackupRun(run, "failed", fmt.Sprintf("Failed to create temporary archive: %v", err), 0, 0, "")
		s.updateBackupJobStatus(job.ID, "failed")
		return
	}

	// Create gzip writer
	var writer io.Writer = archiveFile
	var gzWriter *gzip.Writer
	if job.CompressionType == "gzip" {
		gzWriter = gzip.NewWriter(archiveFile)
		writer = gzWriter
	}

	// Create tar writer
	tarWriter := tar.NewWriter(writer)

	// List and archive objects from source bucket
	objectCh := sourceClient.ListObjects(ctx, job.SourceBucket, minio.ListObjectsOptions{Recursive: true})

	var filesCount int64
	var bytesCount int64
	var errors []string

	for object := range objectCh {
		if object.Err != nil {
			errors = append(errors, fmt.Sprintf("Failed to list object: %v", object.Err))
			continue
		}

		// Get object from source
		srcObject, err := sourceClient.GetObject(ctx, job.SourceBucket, object.Key, minio.GetObjectOptions{})
		if err != nil {
			errors = append(errors, fmt.Sprintf("Failed to get object %s: %v", object.Key, err))
			continue
		}

		// Add to tar archive
		header := &tar.Header{
			Name:    object.Key,
			Size:    object.Size,
			Mode:    0644,
			ModTime: object.LastModified,
		}

		if err := tarWriter.WriteHeader(header); err != nil {
			srcObject.Close()
			errors = append(errors, fmt.Sprintf("Failed to write tar header for %s: %v", object.Key, err))
			continue
		}

		written, err := io.Copy(tarWriter, srcObject)
		srcObject.Close()

		if err != nil {
			errors = append(errors, fmt.Sprintf("Failed to write object %s to archive: %v", object.Key, err))
			continue
		}

		filesCount++
		bytesCount += written
	}

	// Close writers to flush data before uploading
	if err := tarWriter.Close(); err != nil {
		archiveFile.Close()
		os.Remove(tempArchivePath)
		s.updateBackupRun(run, "failed", fmt.Sprintf("Failed to close tar writer: %v", err), filesCount, bytesCount, "")
		s.updateBackupJobStatus(job.ID, "failed")
		return
	}

	if gzWriter != nil {
		if err := gzWriter.Close(); err != nil {
			archiveFile.Close()
			os.Remove(tempArchivePath)
			s.updateBackupRun(run, "failed", fmt.Sprintf("Failed to close gzip writer: %v", err), filesCount, bytesCount, "")
			s.updateBackupJobStatus(job.ID, "failed")
			return
		}
	}

	if err := archiveFile.Close(); err != nil {
		os.Remove(tempArchivePath)
		s.updateBackupRun(run, "failed", fmt.Sprintf("Failed to close archive file: %v", err), filesCount, bytesCount, "")
		s.updateBackupJobStatus(job.ID, "failed")
		return
	}

	// Now reopen the file for uploading
	uploadFile, err := os.Open(tempArchivePath)
	if err != nil {
		os.Remove(tempArchivePath)
		s.updateBackupRun(run, "failed", fmt.Sprintf("Failed to open archive for upload: %v", err), filesCount, bytesCount, "")
		s.updateBackupJobStatus(job.ID, "failed")
		return
	}
	defer func() {
		uploadFile.Close()
		os.Remove(tempArchivePath) // Clean up temp file
	}()

	fileInfo, err := uploadFile.Stat()
	if err != nil {
		s.updateBackupRun(run, "failed", fmt.Sprintf("Failed to stat archive: %v", err), filesCount, bytesCount, "")
		s.updateBackupJobStatus(job.ID, "failed")
		return
	}

	// Destination key with path prefix
	destKey := fmt.Sprintf("%s/%s", pathPrefix, archiveName)

	_, err = destClient.PutObject(ctx, job.DestinationBucket, destKey, uploadFile, fileInfo.Size(), minio.PutObjectOptions{
		ContentType: "application/gzip",
	})

	if err != nil {
		log.Printf("Failed to upload archive to bucket=%s, key=%s, size=%d: %v", job.DestinationBucket, destKey, fileInfo.Size(), err)
		s.updateBackupRun(run, "failed", fmt.Sprintf("Failed to upload archive: %v", err), filesCount, bytesCount, "")
		s.updateBackupJobStatus(job.ID, "failed")
		return
	}

	log.Printf("Successfully uploaded archive to %s/%s (%d files, %d bytes)", job.DestinationBucket, destKey, filesCount, fileInfo.Size())

	// Update backup job status
	now := time.Now()
	job.LastRun = &now
	if len(errors) > 0 {
		job.Status = "failed"
		errorMsg := fmt.Sprintf("Completed with %d errors: %s", len(errors), errors[0])
		if len(errors) > 1 {
			errorMsg += fmt.Sprintf(" (and %d more)", len(errors)-1)
		}
		s.updateBackupRun(run, "failed", errorMsg, filesCount, bytesCount, fmt.Sprintf("%s/%s", job.DestinationBucket, destKey))
	} else {
		job.Status = "completed"
		if job.Schedule != "" {
			nextRun, _ := s.calculateNextRun(job.Schedule)
			job.NextRun = &nextRun
		}
		s.updateBackupRun(run, "completed", "", filesCount, bytesCount, fmt.Sprintf("%s/%s", job.DestinationBucket, destKey))
	}
	s.repo.UpdateJob(job)
}

// executeUncompressedBucketBackup copies objects directly to the destination bucket
func (s *BackupService) executeUncompressedBucketBackup(job *models.BackupJob, run *models.BackupRun, sourceClient, destClient *minio.Client, pathPrefix string) {
	ctx := context.Background()

	// List objects from source bucket
	objectCh := sourceClient.ListObjects(ctx, job.SourceBucket, minio.ListObjectsOptions{Recursive: true})

	var filesCount int64
	var bytesCount int64
	var errors []string

	// Copy each object to destination with path prefix
	for object := range objectCh {
		if object.Err != nil {
			errors = append(errors, fmt.Sprintf("Failed to list object: %v", object.Err))
			continue
		}

		// Get object from source
		srcObject, err := sourceClient.GetObject(ctx, job.SourceBucket, object.Key, minio.GetObjectOptions{})
		if err != nil {
			errors = append(errors, fmt.Sprintf("Failed to get object %s: %v", object.Key, err))
			continue
		}

		// Destination key with path prefix (if pathPrefix is empty, use root)
		var destKey string
		if pathPrefix != "" {
			destKey = fmt.Sprintf("%s/%s", pathPrefix, object.Key)
		} else {
			destKey = object.Key // Root of bucket
		}

		_, err = destClient.PutObject(ctx, job.DestinationBucket, destKey, srcObject, object.Size, minio.PutObjectOptions{
			ContentType: "application/octet-stream",
		})
		srcObject.Close()

		if err != nil {
			errors = append(errors, fmt.Sprintf("Failed to copy object %s: %v", object.Key, err))
			continue
		}

		filesCount++
		bytesCount += object.Size
	}

	// Update backup job status
	now := time.Now()
	job.LastRun = &now

	// Determine backup path for display
	var backupPath string
	if pathPrefix != "" {
		backupPath = fmt.Sprintf("%s/%s", job.DestinationBucket, pathPrefix)
	} else {
		backupPath = job.DestinationBucket
	}

	if len(errors) > 0 {
		job.Status = "failed"
		errorMsg := fmt.Sprintf("Completed with %d errors: %s", len(errors), errors[0])
		if len(errors) > 1 {
			errorMsg += fmt.Sprintf(" (and %d more)", len(errors)-1)
		}
		s.updateBackupRun(run, "failed", errorMsg, filesCount, bytesCount, backupPath)
	} else {
		job.Status = "completed"
		if job.Schedule != "" {
			nextRun, _ := s.calculateNextRun(job.Schedule)
			job.NextRun = &nextRun
		}
		s.updateBackupRun(run, "completed", "", filesCount, bytesCount, backupPath)
	}
	s.repo.UpdateJob(job)
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

	s.repo.UpdateRun(run)

	// Log audit entry for backup run completion
	if s.auditService != nil {
		details := map[string]interface{}{
			"status":     status,
			"files":      filesCount,
			"size_bytes": bytesCount,
		}
		if errorMsg != "" {
			details["error"] = errorMsg
		}
		if backupPath != "" {
			details["backup_path"] = backupPath
		}

		jobID := run.BackupJobID
		go s.auditService.LogAction(nil, "backup_run", "backup_job", &jobID, details, "system", "BackupScheduler/1.0")
	}
}

// updateBackupJobStatus updates the backup job status
func (s *BackupService) updateBackupJobStatus(jobID uint, status string) {
	job, err := s.repo.FindJobByID(jobID)
	if err != nil {
		return
	}
	job.Status = status
	s.repo.UpdateJob(job)
}

// RestoreBackup restores a backup to a RustFS instance
func (s *BackupService) RestoreBackup(instanceID uint, backupPath, targetBucket string) error {
	// Get RustFS instance from repository
	instance, err := s.instanceRepo.FindByID(instanceID)
	if err != nil {
		return fmt.Errorf("failed to get RustFS instance: %w", err)
	}

	// Get RustFS client
	client, err := s.rustfsService.GetClient(instance)
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
