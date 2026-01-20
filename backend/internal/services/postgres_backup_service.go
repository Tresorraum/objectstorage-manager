package services

import (
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
	"time"

	"rustfs-manager/internal/dto"
	"rustfs-manager/internal/models"
	"rustfs-manager/internal/repository"

	"github.com/google/uuid"
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

	if req.Encryption {
		backup.Encryption = models.BackupEncryptionEncrypted
		// Generate salt and IV
		salt, iv, err := s.generateEncryptionMetadata()
		if err != nil {
			return nil, fmt.Errorf("failed to generate encryption metadata: %w", err)
		}
		backup.EncryptionSalt = &salt
		backup.EncryptionIV = &iv
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

	switch req.DestinationType {
	case "local":
		// For local, we'll store temporarily and return as download
		backupPath, backupSize, err = s.createLocalBackup(pgInstance, password, req.CompressionLevel)
	case "vps":
		backupPath, backupSize, err = s.createVPSBackup(pgInstance, password, req.VPSInstanceID, req.CompressionLevel)
	case "object_storage":
		backupPath, backupSize, err = s.createObjectStorageBackup(pgInstance, password, req.ObjectStorageInstanceID, req.ObjectStorageBucket, req.CompressionLevel)
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

	// TODO: Implement S3 upload using AWS SDK or MinIO client
	// This is a placeholder
	_ = storageInstance
	_ = bucket
	_ = key
	_ = filePath

	return fmt.Errorf("object storage upload not yet implemented")
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
		Encryption:       string(backup.Encryption),
		EncryptionSalt:   backup.EncryptionSalt,
		EncryptionIV:     backup.EncryptionIV,
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
