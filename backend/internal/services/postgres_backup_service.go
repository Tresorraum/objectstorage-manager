package services

import (
	"context"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"rustfs-manager/internal/dto"
	"rustfs-manager/internal/models"
	"rustfs-manager/internal/repository"

	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
)

type PostgresBackupService struct {
	backupRepo    *repository.BackupRepository
	postgresRepo  *repository.PostgresRepository
	vpsRepo       *repository.VPSRepository
	rustfsRepo    repository.InstanceRepository
	encryptionKey []byte
}

func NewPostgresBackupService(
	backupRepo *repository.BackupRepository,
	postgresRepo *repository.PostgresRepository,
	vpsRepo *repository.VPSRepository,
	rustfsRepo repository.InstanceRepository,
	encryptionKey string,
) *PostgresBackupService {
	return &PostgresBackupService{
		backupRepo:    backupRepo,
		postgresRepo:  postgresRepo,
		vpsRepo:       vpsRepo,
		rustfsRepo:    rustfsRepo,
		encryptionKey: []byte(encryptionKey),
	}
}

// CreateBackup creates a new backup
func (s *PostgresBackupService) CreateBackup(userID uint, req dto.CreateBackupRequest) (*models.Backup, error) {
	// Get the PostgreSQL instance
	pgInstance, err := s.postgresRepo.GetByID(req.DatabaseID)
	if err != nil {
		return nil, fmt.Errorf("database not found: %w", err)
	}

	// Verify ownership
	if pgInstance.UserID != userID {
		return nil, fmt.Errorf("unauthorized access to database")
	}

	// Create backup record
	backup := &models.Backup{
		ID:              uuid.New(),
		UserID:          userID,
		DatabaseID:      req.DatabaseID,
		Status:          models.BackupStatusInProgress,
		DestinationType: req.DestinationType,
		Encryption:      models.BackupEncryptionNone,
	}

	if err := s.backupRepo.Create(backup); err != nil {
		return nil, fmt.Errorf("failed to create backup record: %w", err)
	}

	// Start backup in background
	go s.executeBackup(backup, pgInstance, req)

	return backup, nil
}

// executeBackup performs the actual backup operation
func (s *PostgresBackupService) executeBackup(backup *models.Backup, pgInstance *models.PostgresInstance, req dto.CreateBackupRequest) {
	startTime := time.Now()

	// Decrypt password
	password, err := s.decrypt(pgInstance.Password)
	if err != nil {
		s.updateBackupFailed(backup, fmt.Sprintf("failed to decrypt password: %v", err))
		return
	}

	// Create backup based on destination type
	var backupPath string
	var backupSize int64
	var storageID *uint

	switch req.DestinationType {
	case "local":
		// For local, we'll store temporarily and return as download
		backupPath, backupSize, err = s.createLocalBackup(pgInstance, password, req.CompressionLevel)
	case "vps":
		backupPath, backupSize, err = s.createVPSBackup(pgInstance, password, req.VPSInstanceID, req.CompressionLevel)
		if req.VPSInstanceID != nil {
			storageID = req.VPSInstanceID
		}
	case "object_storage":
		backupPath, backupSize, err = s.createObjectStorageBackup(pgInstance, password, req.ObjectStorageInstanceID, req.ObjectStorageBucket, req.CompressionLevel)
		if req.ObjectStorageInstanceID != nil {
			storageID = req.ObjectStorageInstanceID
		}
	default:
		err = fmt.Errorf("unsupported destination type: %s", req.DestinationType)
	}

	if err != nil {
		s.updateBackupFailed(backup, err.Error())
		return
	}

	// Update backup record with success
	duration := time.Since(startTime).Milliseconds()
	backup.Status = models.BackupStatusCompleted
	backup.BackupSizeMb = float64(backupSize) / (1024 * 1024)
	backup.BackupDurationMs = duration
	backup.DestinationPath = &backupPath
	backup.StorageID = storageID

	if err := s.backupRepo.Update(backup); err != nil {
		fmt.Printf("Failed to update backup record: %v\n", err)
	}
}

// createLocalBackup creates a backup and stores it locally
func (s *PostgresBackupService) createLocalBackup(pgInstance *models.PostgresInstance, password string, compressionLevel int) (string, int64, error) {
	// Create backups directory if it doesn't exist
	backupsDir := "./backups"
	if err := os.MkdirAll(backupsDir, 0755); err != nil {
		return "", 0, fmt.Errorf("failed to create backups directory: %w", err)
	}

	// Generate filename
	timestamp := time.Now().Format("20060102_150405")
	filename := fmt.Sprintf("%s_%s.dump", pgInstance.Database, timestamp)
	backupPath := filepath.Join(backupsDir, filename)

	// Execute pg_dump
	if err := s.executePgDump(pgInstance, password, backupPath, compressionLevel); err != nil {
		return "", 0, err
	}

	// Get file size
	fileInfo, err := os.Stat(backupPath)
	if err != nil {
		return "", 0, fmt.Errorf("failed to get file info: %w", err)
	}

	return backupPath, fileInfo.Size(), nil
}

// createVPSBackup creates a backup and uploads to VPS
func (s *PostgresBackupService) createVPSBackup(pgInstance *models.PostgresInstance, password string, vpsInstanceID *uint, compressionLevel int) (string, int64, error) {
	if vpsInstanceID == nil {
		return "", 0, fmt.Errorf("VPS instance ID is required")
	}

	// Get VPS instance
	vpsInstance, err := s.vpsRepo.GetByID(*vpsInstanceID)
	if err != nil {
		return "", 0, fmt.Errorf("VPS instance not found: %w", err)
	}

	// Create temporary local backup first
	tempPath, size, err := s.createLocalBackup(pgInstance, password, compressionLevel)
	if err != nil {
		return "", 0, err
	}
	defer os.Remove(tempPath) // Clean up temp file

	// Upload to VPS using SCP
	remotePath := filepath.Join(vpsInstance.BackupPath, filepath.Base(tempPath))
	if err := s.uploadToVPS(vpsInstance, tempPath, remotePath); err != nil {
		return "", 0, fmt.Errorf("failed to upload to VPS: %w", err)
	}

	return remotePath, size, nil
}

// createObjectStorageBackup creates a backup and uploads to object storage
func (s *PostgresBackupService) createObjectStorageBackup(pgInstance *models.PostgresInstance, password string, storageInstanceID *uint, bucket string, compressionLevel int) (string, int64, error) {
	if storageInstanceID == nil {
		return "", 0, fmt.Errorf("object storage instance ID is required")
	}

	// Create temporary local backup first
	tempPath, size, err := s.createLocalBackup(pgInstance, password, compressionLevel)
	if err != nil {
		return "", 0, err
	}
	defer os.Remove(tempPath) // Clean up temp file

	// Upload to object storage (S3)
	objectKey := filepath.Base(tempPath)
	if err := s.uploadToObjectStorage(*storageInstanceID, bucket, objectKey, tempPath); err != nil {
		return "", 0, fmt.Errorf("failed to upload to object storage: %w", err)
	}

	return fmt.Sprintf("s3://%s/%s", bucket, objectKey), size, nil
}

// executePgDump executes pg_dump command
func (s *PostgresBackupService) executePgDump(pgInstance *models.PostgresInstance, password, outputPath string, compressionLevel int) error {
	// Build pg_dump command
	args := []string{
		"-Fc", // Custom format
		"--no-password",
		"-h", pgInstance.Host,
		"-p", strconv.Itoa(pgInstance.Port),
		"-U", pgInstance.Username,
		"-d", pgInstance.Database,
		"-f", outputPath,
		"-Z", strconv.Itoa(compressionLevel),
	}

	cmd := exec.Command("pg_dump", args...)

	// Set password via environment variable
	cmd.Env = append(os.Environ(), fmt.Sprintf("PGPASSWORD=%s", password))

	// Execute command
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("pg_dump failed: %w, output: %s", err, string(output))
	}

	return nil
}

// uploadToVPS uploads a file to VPS using SCP
func (s *PostgresBackupService) uploadToVPS(vpsInstance *models.VPSInstance, localPath, remotePath string) error {
	// Decrypt VPS password
	password, err := s.decrypt(vpsInstance.Password)
	if err != nil {
		return fmt.Errorf("failed to decrypt VPS password: %w", err)
	}

	// Use scp command (in production, use a proper SSH library)
	cmd := exec.Command("scp",
		"-o", "StrictHostKeyChecking=no",
		localPath,
		fmt.Sprintf("%s@%s:%s", vpsInstance.Username, vpsInstance.Host, remotePath),
	)

	// For password authentication, you'd need to use expect or a proper SSH library
	// This is a simplified version
	cmd.Env = append(os.Environ(), fmt.Sprintf("SSHPASS=%s", password))

	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("scp failed: %w, output: %s", err, string(output))
	}

	return nil
}

// uploadToObjectStorage uploads a file to object storage
func (s *PostgresBackupService) uploadToObjectStorage(storageInstanceID uint, bucket, key, filePath string) error {
	// Get storage instance
	storageInstance, err := s.rustfsRepo.FindByID(storageInstanceID)
	if err != nil {
		return fmt.Errorf("storage instance not found: %w", err)
	}

	// Create RustFS service to get MinIO client
	rustfsService := NewRustFSService()
	client, err := rustfsService.GetClient(storageInstance)
	if err != nil {
		return fmt.Errorf("failed to create S3 client: %w", err)
	}

	// Open the backup file
	file, err := os.Open(filePath)
	if err != nil {
		return fmt.Errorf("failed to open backup file: %w", err)
	}
	defer file.Close()

	// Get file info for size
	fileInfo, err := file.Stat()
	if err != nil {
		return fmt.Errorf("failed to get file info: %w", err)
	}

	// Create bucket if it doesn't exist
	ctx := context.Background()
	exists, err := client.BucketExists(ctx, bucket)
	if err != nil {
		return fmt.Errorf("failed to check bucket existence: %w", err)
	}

	if !exists {
		err = client.MakeBucket(ctx, bucket, minio.MakeBucketOptions{})
		if err != nil {
			return fmt.Errorf("failed to create bucket: %w", err)
		}
	}

	// Upload file to S3
	_, err = client.PutObject(ctx, bucket, key, file, fileInfo.Size(), minio.PutObjectOptions{
		ContentType: "application/octet-stream",
	})
	if err != nil {
		return fmt.Errorf("failed to upload to S3: %w", err)
	}

	return nil
}

// GetBackups retrieves backups for a database
func (s *PostgresBackupService) GetBackups(userID uint, databaseID uint, limit, offset int) (*dto.GetBackupsResponse, error) {
	// Verify database ownership
	pgInstance, err := s.postgresRepo.GetByID(databaseID)
	if err != nil {
		return nil, fmt.Errorf("database not found: %w", err)
	}

	if pgInstance.UserID != userID {
		return nil, fmt.Errorf("unauthorized access to database")
	}

	// Get backups
	backups, err := s.backupRepo.FindByDatabaseIDWithPagination(databaseID, limit, offset)
	if err != nil {
		return nil, err
	}

	// Get total count
	total, err := s.backupRepo.CountByDatabaseID(databaseID)
	if err != nil {
		return nil, err
	}

	// Convert to response
	backupResponses := make([]dto.BackupResponse, len(backups))
	for i, backup := range backups {
		backupResponses[i] = s.toBackupResponse(&backup)
	}

	return &dto.GetBackupsResponse{
		Backups: backupResponses,
		Total:   total,
		Limit:   limit,
		Offset:  offset,
	}, nil
}

// DeleteBackup deletes a backup
func (s *PostgresBackupService) DeleteBackup(userID uint, backupID uuid.UUID) error {
	backup, err := s.backupRepo.FindByID(backupID)
	if err != nil {
		return fmt.Errorf("backup not found: %w", err)
	}

	if backup.UserID != userID {
		return fmt.Errorf("unauthorized access to backup")
	}

	if backup.Status == models.BackupStatusInProgress {
		return fmt.Errorf("cannot delete backup in progress")
	}

	// Delete backup file if it exists
	if backup.DestinationPath != nil && backup.DestinationType == "local" {
		os.Remove(*backup.DestinationPath)
	}

	return s.backupRepo.Delete(backupID)
}

// CancelBackup cancels an in-progress backup
func (s *PostgresBackupService) CancelBackup(userID uint, backupID uuid.UUID) error {
	backup, err := s.backupRepo.FindByID(backupID)
	if err != nil {
		return fmt.Errorf("backup not found: %w", err)
	}

	if backup.UserID != userID {
		return fmt.Errorf("unauthorized access to backup")
	}

	if backup.Status != models.BackupStatusInProgress {
		return fmt.Errorf("backup is not in progress")
	}

	// Update status to canceled
	backup.Status = models.BackupStatusCanceled
	return s.backupRepo.Update(backup)
}

// Helper functions

func (s *PostgresBackupService) updateBackupFailed(backup *models.Backup, errorMsg string) {
	backup.Status = models.BackupStatusFailed
	backup.FailMessage = &errorMsg
	if err := s.backupRepo.Update(backup); err != nil {
		fmt.Printf("Failed to update backup status: %v\n", err)
	}
}

func (s *PostgresBackupService) toBackupResponse(backup *models.Backup) dto.BackupResponse {
	response := dto.BackupResponse{
		ID:               backup.ID.String(),
		DatabaseID:       strconv.Itoa(int(backup.DatabaseID)),
		Status:           string(backup.Status),
		FailMessage:      backup.FailMessage,
		BackupSizeMb:     backup.BackupSizeMb,
		BackupDurationMs: backup.BackupDurationMs,
		CreatedAt:        backup.CreatedAt.Format(time.RFC3339),
	}

	if backup.StorageID != nil {
		storageID := strconv.Itoa(int(*backup.StorageID))
		response.StorageID = &storageID
	}

	return response
}

func (s *PostgresBackupService) generateEncryptionMetadata() (string, string, error) {
	// Generate 32-byte salt
	salt := make([]byte, 32)
	if _, err := rand.Read(salt); err != nil {
		return "", "", err
	}

	// Generate 12-byte IV for GCM
	iv := make([]byte, 12)
	if _, err := rand.Read(iv); err != nil {
		return "", "", err
	}

	return base64.StdEncoding.EncodeToString(salt),
		base64.StdEncoding.EncodeToString(iv),
		nil
}

// GetBackupFile returns the backup file for download
func (s *PostgresBackupService) GetBackupFile(userID uint, backupID uuid.UUID) (io.ReadCloser, string, error) {
	backup, err := s.backupRepo.FindByID(backupID)
	if err != nil {
		return nil, "", fmt.Errorf("backup not found: %w", err)
	}

	if backup.UserID != userID {
		return nil, "", fmt.Errorf("unauthorized access to backup")
	}

	if backup.Status != models.BackupStatusCompleted {
		return nil, "", fmt.Errorf("backup is not completed")
	}

	if backup.DestinationPath == nil {
		return nil, "", fmt.Errorf("backup file path not found")
	}

	// Open file
	file, err := os.Open(*backup.DestinationPath)
	if err != nil {
		return nil, "", fmt.Errorf("failed to open backup file: %w", err)
	}

	filename := filepath.Base(*backup.DestinationPath)
	return file, filename, nil
}

// decrypt decrypts ciphertext using AES-GCM
func (s *PostgresBackupService) decrypt(ciphertext string) (string, error) {
	data, err := base64.StdEncoding.DecodeString(ciphertext)
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher(s.encryptionKey)
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonceSize := gcm.NonceSize()
	if len(data) < nonceSize {
		return "", errors.New("ciphertext too short")
	}

	nonce, ciphertextBytes := data[:nonceSize], data[nonceSize:]
	plaintext, err := gcm.Open(nil, nonce, ciphertextBytes, nil)
	if err != nil {
		return "", err
	}

	return string(plaintext), nil
}

// RestoreBackup restores a backup to a target database
func (s *PostgresBackupService) RestoreBackup(userID uint, req dto.RestoreBackupRequest) error {
	// Get target database
	targetDB, err := s.postgresRepo.GetByID(req.TargetDatabaseID)
	if err != nil {
		return fmt.Errorf("target database not found: %w", err)
	}

	// Verify ownership
	if targetDB.UserID != userID {
		return fmt.Errorf("unauthorized access to target database")
	}

	// Decrypt password
	password, err := s.decrypt(targetDB.Password)
	if err != nil {
		return fmt.Errorf("failed to decrypt password: %w", err)
	}

	// Get backup file based on source type
	var backupFilePath string
	var cleanupFile bool

	switch req.SourceType {
	case "existing_backup":
		if req.BackupID == nil {
			return fmt.Errorf("backup_id is required for existing_backup source")
		}
		backupID, err := uuid.Parse(*req.BackupID)
		if err != nil {
			return fmt.Errorf("invalid backup_id: %w", err)
		}
		backup, err := s.backupRepo.FindByID(backupID)
		if err != nil {
			return fmt.Errorf("backup not found: %w", err)
		}
		if backup.UserID != userID {
			return fmt.Errorf("unauthorized access to backup")
		}
		if backup.DestinationPath == nil {
			return fmt.Errorf("backup file path not found")
		}

		// Check if backup is in object storage (S3)
		if strings.HasPrefix(*backup.DestinationPath, "s3://") {
			// Parse S3 path: s3://bucket/key
			s3Path := strings.TrimPrefix(*backup.DestinationPath, "s3://")
			parts := strings.SplitN(s3Path, "/", 2)
			if len(parts) != 2 {
				return fmt.Errorf("invalid S3 path format: %s", *backup.DestinationPath)
			}
			bucket := parts[0]
			key := parts[1]

			// Download from object storage using the backup's storage ID
			if backup.StorageID == nil {
				return fmt.Errorf("backup storage ID not found")
			}
			tempFile, err := s.downloadFromObjectStorage(*backup.StorageID, bucket, key)
			if err != nil {
				return fmt.Errorf("failed to download from object storage: %w", err)
			}
			backupFilePath = tempFile
			cleanupFile = true
		} else {
			// Local file
			backupFilePath = *backup.DestinationPath
			cleanupFile = false
		}

	case "object_storage":
		if req.ObjectStorageInstanceID == nil {
			return fmt.Errorf("object_storage_instance_id is required")
		}
		// Download from object storage
		tempFile, err := s.downloadFromObjectStorage(*req.ObjectStorageInstanceID, req.ObjectStorageBucket, req.ObjectStorageKey)
		if err != nil {
			return fmt.Errorf("failed to download from object storage: %w", err)
		}
		backupFilePath = tempFile
		cleanupFile = true

	case "vps":
		if req.VPSInstanceID == nil {
			return fmt.Errorf("vps_instance_id is required")
		}
		// Download from VPS
		tempFile, err := s.downloadFromVPS(*req.VPSInstanceID, req.VPSFilePath)
		if err != nil {
			return fmt.Errorf("failed to download from VPS: %w", err)
		}
		backupFilePath = tempFile
		cleanupFile = true

	case "local_file":
		return fmt.Errorf("local_file restore not yet implemented")

	default:
		return fmt.Errorf("unsupported source type: %s", req.SourceType)
	}

	// Cleanup temp file if needed
	if cleanupFile {
		defer os.Remove(backupFilePath)
	}

	// Execute pg_restore
	if err := s.executePgRestore(targetDB, password, backupFilePath, req); err != nil {
		return fmt.Errorf("restore failed: %w", err)
	}

	return nil
}

// executePgRestore executes pg_restore command
func (s *PostgresBackupService) executePgRestore(pgInstance *models.PostgresInstance, password, backupPath string, req dto.RestoreBackupRequest) error {
	// Build pg_restore command
	args := []string{
		"--no-password",
		"-h", pgInstance.Host,
		"-p", strconv.Itoa(pgInstance.Port),
		"-U", pgInstance.Username,
		"-d", pgInstance.Database,
	}

	// Add optional flags
	if req.DropExisting {
		args = append(args, "--clean")
	}
	if req.CreateDatabase {
		args = append(args, "--create")
	}
	if req.NoOwner {
		args = append(args, "--no-owner")
	}
	if req.NoPrivileges {
		args = append(args, "--no-privileges")
	}

	// Add backup file
	args = append(args, backupPath)

	cmd := exec.Command("pg_restore", args...)

	// Set password via environment variable
	cmd.Env = append(os.Environ(), fmt.Sprintf("PGPASSWORD=%s", password))

	// Execute command
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("pg_restore failed: %w, output: %s", err, string(output))
	}

	return nil
}

// downloadFromObjectStorage downloads a file from object storage
func (s *PostgresBackupService) downloadFromObjectStorage(storageInstanceID uint, bucket, key string) (string, error) {
	// Get storage instance
	storageInstance, err := s.rustfsRepo.FindByID(storageInstanceID)
	if err != nil {
		return "", fmt.Errorf("storage instance not found: %w", err)
	}

	// Create RustFS service to get MinIO client
	rustfsService := NewRustFSService()
	client, err := rustfsService.GetClient(storageInstance)
	if err != nil {
		return "", fmt.Errorf("failed to create S3 client: %w", err)
	}

	// Create temp file
	tempFile, err := os.CreateTemp("", "restore-*.dump")
	if err != nil {
		return "", fmt.Errorf("failed to create temp file: %w", err)
	}
	defer tempFile.Close()

	// Download from S3
	ctx := context.Background()
	object, err := client.GetObject(ctx, bucket, key, minio.GetObjectOptions{})
	if err != nil {
		os.Remove(tempFile.Name())
		return "", fmt.Errorf("failed to get object from S3: %w", err)
	}
	defer object.Close()

	// Copy to temp file
	if _, err := io.Copy(tempFile, object); err != nil {
		os.Remove(tempFile.Name())
		return "", fmt.Errorf("failed to download file: %w", err)
	}

	return tempFile.Name(), nil
}

// downloadFromVPS downloads a file from VPS
func (s *PostgresBackupService) downloadFromVPS(vpsInstanceID uint, remotePath string) (string, error) {
	// Get VPS instance
	vpsInstance, err := s.vpsRepo.GetByID(vpsInstanceID)
	if err != nil {
		return "", fmt.Errorf("VPS instance not found: %w", err)
	}

	// Decrypt VPS password
	password, err := s.decrypt(vpsInstance.Password)
	if err != nil {
		return "", fmt.Errorf("failed to decrypt VPS password: %w", err)
	}

	// Create temp file
	tempFile, err := os.CreateTemp("", "restore-*.dump")
	if err != nil {
		return "", fmt.Errorf("failed to create temp file: %w", err)
	}
	tempFile.Close()

	// Use scp command to download
	cmd := exec.Command("scp",
		"-o", "StrictHostKeyChecking=no",
		fmt.Sprintf("%s@%s:%s", vpsInstance.Username, vpsInstance.Host, remotePath),
		tempFile.Name(),
	)

	cmd.Env = append(os.Environ(), fmt.Sprintf("SSHPASS=%s", password))

	output, err := cmd.CombinedOutput()
	if err != nil {
		os.Remove(tempFile.Name())
		return "", fmt.Errorf("scp failed: %w, output: %s", err, string(output))
	}

	return tempFile.Name(), nil
}
