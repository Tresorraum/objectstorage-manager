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
	"rustfs-manager/internal/dto"
	"rustfs-manager/internal/models"
	"rustfs-manager/internal/repository"

	_ "github.com/lib/pq"
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
