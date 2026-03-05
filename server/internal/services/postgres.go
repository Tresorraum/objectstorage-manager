package services

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"database/sql"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"rukhalt/internal/dto"
	"rukhalt/internal/models"
	"rukhalt/internal/repository"
	"time"

	_ "github.com/lib/pq"
	"github.com/pkg/sftp"
	"golang.org/x/crypto/ssh"
)

type PostgresService struct {
	repo          *repository.PostgresRepository
	auditService  *AuditService
	encryptionKey []byte
}

func NewPostgresService(repo *repository.PostgresRepository, auditService *AuditService, encryptionKey string) *PostgresService {
	// Use first 32 bytes of key for AES-256
	key := []byte(encryptionKey)
	if len(key) > 32 {
		key = key[:32]
	} else if len(key) < 32 {
		// Pad key if too short
		padding := make([]byte, 32-len(key))
		key = append(key, padding...)
	}

	return &PostgresService{
		repo:          repo,
		auditService:  auditService,
		encryptionKey: key,
	}
}

// encrypt encrypts plaintext using AES-GCM
func (s *PostgresService) encrypt(plaintext string) (string, error) {
	block, err := aes.NewCipher(s.encryptionKey)
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}

	ciphertext := gcm.Seal(nonce, nonce, []byte(plaintext), nil)
	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

// decrypt decrypts ciphertext using AES-GCM
func (s *PostgresService) decrypt(ciphertext string) (string, error) {
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

// CreateInstance creates a new PostgreSQL instance
func (s *PostgresService) CreateInstance(userID uint, req *dto.CreatePostgresInstanceRequest) (*models.PostgresInstance, error) {
	// Encrypt password
	encryptedPassword, err := s.encrypt(req.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to encrypt password: %w", err)
	}

	instance := &models.PostgresInstance{
		UserID:      userID,
		Name:        req.Name,
		Host:        req.Host,
		Port:        req.Port,
		Database:    req.Database,
		Username:    req.Username,
		Password:    encryptedPassword,
		SSL:         req.SSL,
		Description: req.Description,
		Status:      "active",
	}

	if err := s.repo.Create(instance); err != nil {
		return nil, err
	}

	// Log audit
	instanceID := instance.ID
	userIDPtr := &userID
	s.auditService.LogAction(userIDPtr, "create", "postgres_instance", &instanceID, fmt.Sprintf(`{"name":"%s","host":"%s","database":"%s"}`, instance.Name, instance.Host, instance.Database), "", "")

	return instance, nil
}

// GetInstances retrieves all PostgreSQL instances for a user
func (s *PostgresService) GetInstances(userID uint) ([]models.PostgresInstance, error) {
	return s.repo.GetByUserID(userID)
}

// GetInstance retrieves a PostgreSQL instance by ID
func (s *PostgresService) GetInstance(id, userID uint) (*models.PostgresInstance, error) {
	instance, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if instance.UserID != userID {
		return nil, errors.New("unauthorized")
	}

	return instance, nil
}

// UpdateInstance updates a PostgreSQL instance
func (s *PostgresService) UpdateInstance(id, userID uint, req *dto.UpdatePostgresInstanceRequest) (*models.PostgresInstance, error) {
	instance, err := s.GetInstance(id, userID)
	if err != nil {
		return nil, err
	}

	// Update fields
	if req.Name != "" {
		instance.Name = req.Name
	}
	if req.Host != "" {
		instance.Host = req.Host
	}
	if req.Port > 0 {
		instance.Port = req.Port
	}
	if req.Database != "" {
		instance.Database = req.Database
	}
	if req.Username != "" {
		instance.Username = req.Username
	}
	if req.Password != "" {
		encryptedPassword, err := s.encrypt(req.Password)
		if err != nil {
			return nil, fmt.Errorf("failed to encrypt password: %w", err)
		}
		instance.Password = encryptedPassword
	}
	instance.SSL = req.SSL
	if req.Description != "" {
		instance.Description = req.Description
	}

	if err := s.repo.Update(instance); err != nil {
		return nil, err
	}

	// Log audit
	instanceID := instance.ID
	userIDPtr := &userID
	s.auditService.LogAction(userIDPtr, "update", "postgres_instance", &instanceID, fmt.Sprintf(`{"name":"%s"}`, instance.Name), "", "")

	return instance, nil
}

// DeleteInstance deletes a PostgreSQL instance
func (s *PostgresService) DeleteInstance(id, userID uint) error {
	instance, err := s.GetInstance(id, userID)
	if err != nil {
		return err
	}

	if err := s.repo.Delete(id); err != nil {
		return err
	}

	// Log audit
	instanceID := instance.ID
	userIDPtr := &userID
	s.auditService.LogAction(userIDPtr, "delete", "postgres_instance", &instanceID, fmt.Sprintf(`{"name":"%s"}`, instance.Name), "", "")

	return nil
}

// TestConnection tests the connection to a PostgreSQL instance
func (s *PostgresService) TestConnection(instance *models.PostgresInstance) error {
	// Decrypt password
	password, err := s.decrypt(instance.Password)
	if err != nil {
		return fmt.Errorf("failed to decrypt password: %w", err)
	}

	// Build connection string
	sslMode := "disable"
	if instance.SSL {
		sslMode = "require"
	}

	connStr := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		instance.Host, instance.Port, instance.Username, password, instance.Database, sslMode)

	// Test connection
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return fmt.Errorf("failed to open connection: %w", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	return nil
}

// GetDecryptedPassword returns the decrypted password (use with caution)
func (s *PostgresService) GetDecryptedPassword(instance *models.PostgresInstance) (string, error) {
	return s.decrypt(instance.Password)
}

// CreateBackupDump creates a PostgreSQL backup using pg_dump and returns the SQL dump
func (s *PostgresService) CreateBackupDump(instance *models.PostgresInstance) ([]byte, string, error) {
	// Decrypt password
	password, err := s.decrypt(instance.Password)
	if err != nil {
		return nil, "", fmt.Errorf("failed to decrypt password: %w", err)
	}

	// Build connection string
	sslMode := "disable"
	if instance.SSL {
		sslMode = "require"
	}

	connStr := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		instance.Host, instance.Port, instance.Username, password, instance.Database, sslMode)

	// Execute pg_dump
	cmd := exec.Command("pg_dump", connStr)

	// Set environment variable for password (alternative method)
	cmd.Env = append(cmd.Env, fmt.Sprintf("PGPASSWORD=%s", password))

	// Capture output
	output, err := cmd.CombinedOutput()
	if err != nil {
		return nil, "", fmt.Errorf("pg_dump failed: %w, output: %s", err, string(output))
	}

	// Generate filename
	timestamp := time.Now().Format("20060102_150405")
	filename := fmt.Sprintf("%s_%s.sql", instance.Database, timestamp)

	return output, filename, nil
}

// CreateBackupToVPS creates a PostgreSQL backup and uploads it to a VPS
func (s *PostgresService) CreateBackupToVPS(postgresInstance *models.PostgresInstance, vpsInstance *models.VPSInstance) (string, error) {
	// Create backup dump
	sqlDump, filename, err := s.CreateBackupDump(postgresInstance)
	if err != nil {
		return "", err
	}

	// Create temp file
	tempFile := filepath.Join(os.TempDir(), filename)
	if err := os.WriteFile(tempFile, sqlDump, 0600); err != nil {
		return "", fmt.Errorf("failed to write temp file: %w", err)
	}
	defer os.Remove(tempFile)

	// Build destination path on VPS
	destPath := filepath.Join(vpsInstance.BackupPath, filename)

	// Get VPS credentials
	var authMethods []ssh.AuthMethod

	if vpsInstance.AuthType == "ssh_key" {
		// Decrypt SSH key
		sshKey, err := s.decrypt(vpsInstance.SSHKey)
		if err != nil {
			return "", fmt.Errorf("failed to decrypt SSH key: %w", err)
		}

		// Parse private key
		signer, err := ssh.ParsePrivateKey([]byte(sshKey))
		if err != nil {
			return "", fmt.Errorf("failed to parse SSH key: %w", err)
		}
		authMethods = append(authMethods, ssh.PublicKeys(signer))
	} else {
		// Decrypt password
		password, err := s.decrypt(vpsInstance.Password)
		if err != nil {
			return "", fmt.Errorf("failed to decrypt password: %w", err)
		}

		// Use both password and keyboard-interactive for compatibility
		authMethods = append(authMethods, ssh.Password(password))
		authMethods = append(authMethods, ssh.KeyboardInteractive(func(user, instruction string, questions []string, echos []bool) ([]string, error) {
			answers := make([]string, len(questions))
			for i := range questions {
				answers[i] = password
			}
			return answers, nil
		}))
	}

	// SSH client configuration
	config := &ssh.ClientConfig{
		User:            vpsInstance.Username,
		Auth:            authMethods,
		HostKeyCallback: ssh.InsecureIgnoreHostKey(), // TODO: Implement proper host key verification
		Timeout:         30 * time.Second,
	}

	// Connect to VPS
	addr := fmt.Sprintf("%s:%d", vpsInstance.Host, vpsInstance.Port)
	client, err := ssh.Dial("tcp", addr, config)
	if err != nil {
		return "", fmt.Errorf("failed to connect to VPS: %w", err)
	}
	defer client.Close()

	// Create SFTP client
	sftpClient, err := sftp.NewClient(client)
	if err != nil {
		return "", fmt.Errorf("failed to create SFTP client: %w", err)
	}
	defer sftpClient.Close()

	// Check if backup directory exists, if not create it
	_, err = sftpClient.Stat(vpsInstance.BackupPath)
	if err != nil {
		// Directory doesn't exist, try to create it
		if err := sftpClient.MkdirAll(vpsInstance.BackupPath); err != nil {
			return "", fmt.Errorf("failed to create backup directory '%s' on VPS (check permissions): %w", vpsInstance.BackupPath, err)
		}
	}

	// Verify we can write to the directory by checking permissions
	testPath := filepath.Join(vpsInstance.BackupPath, ".write_test")
	testFile, err := sftpClient.Create(testPath)
	if err != nil {
		return "", fmt.Errorf("no write permission in backup directory '%s' (user: %s): %w", vpsInstance.BackupPath, vpsInstance.Username, err)
	}
	testFile.Close()
	sftpClient.Remove(testPath) // Clean up test file

	// Open source file
	srcFile, err := os.Open(tempFile)
	if err != nil {
		return "", fmt.Errorf("failed to open source file: %w", err)
	}
	defer srcFile.Close()

	// Create destination file on VPS
	dstFile, err := sftpClient.Create(destPath)
	if err != nil {
		return "", fmt.Errorf("failed to create destination file on VPS: %w", err)
	}
	defer dstFile.Close()

	// Copy file
	_, err = io.Copy(dstFile, srcFile)
	if err != nil {
		return "", fmt.Errorf("failed to upload file to VPS: %w", err)
	}

	return destPath, nil
}
