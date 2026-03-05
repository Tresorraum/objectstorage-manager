package services

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"log"
	"rukhalt/internal/dto"
	"rukhalt/internal/models"
	"rukhalt/internal/repository"
	"time"

	"golang.org/x/crypto/ssh"
)

type VPSService struct {
	repo          *repository.VPSRepository
	auditService  *AuditService
	encryptionKey []byte
}

func NewVPSService(repo *repository.VPSRepository, auditService *AuditService, encryptionKey string) *VPSService {
	// Use first 32 bytes of key for AES-256
	key := []byte(encryptionKey)
	if len(key) > 32 {
		key = key[:32]
	} else if len(key) < 32 {
		// Pad key if too short
		padding := make([]byte, 32-len(key))
		key = append(key, padding...)
	}

	return &VPSService{
		repo:          repo,
		auditService:  auditService,
		encryptionKey: key,
	}
}

// encrypt encrypts plaintext using AES-GCM
func (s *VPSService) encrypt(plaintext string) (string, error) {
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
func (s *VPSService) decrypt(ciphertext string) (string, error) {
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

// CreateInstance creates a new VPS instance
func (s *VPSService) CreateInstance(userID uint, req *dto.CreateVPSInstanceRequest) (*models.VPSInstance, error) {
	// Validate auth type and credentials
	if req.AuthType == "password" && req.Password == "" {
		return nil, errors.New("password is required for password authentication")
	}
	if req.AuthType == "ssh_key" && req.SSHKey == "" {
		return nil, errors.New("ssh_key is required for SSH key authentication")
	}

	instance := &models.VPSInstance{
		UserID:      userID,
		Name:        req.Name,
		Host:        req.Host,
		Port:        req.Port,
		Username:    req.Username,
		AuthType:    req.AuthType,
		BackupPath:  req.BackupPath,
		Description: req.Description,
		Status:      "active",
	}

	// Encrypt credentials
	if req.AuthType == "password" {
		encryptedPassword, err := s.encrypt(req.Password)
		if err != nil {
			return nil, fmt.Errorf("failed to encrypt password: %w", err)
		}
		instance.Password = encryptedPassword
	} else {
		encryptedKey, err := s.encrypt(req.SSHKey)
		if err != nil {
			return nil, fmt.Errorf("failed to encrypt SSH key: %w", err)
		}
		instance.SSHKey = encryptedKey
	}

	if err := s.repo.Create(instance); err != nil {
		return nil, err
	}

	// Log audit
	instanceID := instance.ID
	userIDPtr := &userID
	s.auditService.LogAction(userIDPtr, "create", "vps_instance", &instanceID, fmt.Sprintf(`{"name":"%s","host":"%s"}`, instance.Name, instance.Host), "", "")

	return instance, nil
}

// GetInstances retrieves all VPS instances for a user
func (s *VPSService) GetInstances(userID uint) ([]models.VPSInstance, error) {
	return s.repo.GetByUserID(userID)
}

// GetInstance retrieves a VPS instance by ID
func (s *VPSService) GetInstance(id, userID uint) (*models.VPSInstance, error) {
	instance, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if instance.UserID != userID {
		return nil, errors.New("unauthorized")
	}

	return instance, nil
}

// UpdateInstance updates a VPS instance
func (s *VPSService) UpdateInstance(id, userID uint, req *dto.UpdateVPSInstanceRequest) (*models.VPSInstance, error) {
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
	if req.Username != "" {
		instance.Username = req.Username
	}
	if req.AuthType != "" {
		instance.AuthType = req.AuthType
	}
	if req.Password != "" {
		encryptedPassword, err := s.encrypt(req.Password)
		if err != nil {
			return nil, fmt.Errorf("failed to encrypt password: %w", err)
		}
		instance.Password = encryptedPassword
		instance.SSHKey = "" // Clear SSH key if switching to password
	}
	if req.SSHKey != "" {
		encryptedKey, err := s.encrypt(req.SSHKey)
		if err != nil {
			return nil, fmt.Errorf("failed to encrypt SSH key: %w", err)
		}
		instance.SSHKey = encryptedKey
		instance.Password = "" // Clear password if switching to SSH key
	}
	if req.BackupPath != "" {
		instance.BackupPath = req.BackupPath
	}
	if req.Description != "" {
		instance.Description = req.Description
	}

	if err := s.repo.Update(instance); err != nil {
		return nil, err
	}

	// Log audit
	instanceID := instance.ID
	userIDPtr := &userID
	s.auditService.LogAction(userIDPtr, "update", "vps_instance", &instanceID, fmt.Sprintf(`{"name":"%s"}`, instance.Name), "", "")

	return instance, nil
}

// DeleteInstance deletes a VPS instance
func (s *VPSService) DeleteInstance(id, userID uint) error {
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
	s.auditService.LogAction(userIDPtr, "delete", "vps_instance", &instanceID, fmt.Sprintf(`{"name":"%s"}`, instance.Name), "", "")

	return nil
}

// TestConnection tests the SSH connection to a VPS instance
func (s *VPSService) TestConnection(instance *models.VPSInstance) error {
	var authMethods []ssh.AuthMethod

	if instance.AuthType == "password" {
		if instance.Password == "" {
			return fmt.Errorf("password is empty for password authentication")
		}
		password, err := s.decrypt(instance.Password)
		if err != nil {
			return fmt.Errorf("failed to decrypt password: %w", err)
		}
		if password == "" {
			return fmt.Errorf("decrypted password is empty")
		}

		// Add both password and keyboard-interactive methods
		log.Printf("Testing VPS connection - Host: %s, Port: %d, User: %s, Password length: %d",
			instance.Host, instance.Port, instance.Username, len(password))

		authMethods = []ssh.AuthMethod{
			ssh.Password(password),
			ssh.KeyboardInteractive(func(user, instruction string, questions []string, echos []bool) ([]string, error) {
				log.Printf("Keyboard-interactive auth - User: %s, Questions: %d", user, len(questions))
				answers := make([]string, len(questions))
				for i := range questions {
					answers[i] = password
				}
				return answers, nil
			}),
		}
	} else if instance.AuthType == "ssh_key" {
		if instance.SSHKey == "" {
			return fmt.Errorf("SSH key is empty for key authentication")
		}
		keyData, err := s.decrypt(instance.SSHKey)
		if err != nil {
			return fmt.Errorf("failed to decrypt SSH key: %w", err)
		}
		if keyData == "" {
			return fmt.Errorf("decrypted SSH key is empty")
		}

		signer, err := ssh.ParsePrivateKey([]byte(keyData))
		if err != nil {
			return fmt.Errorf("failed to parse SSH key: %w", err)
		}
		authMethods = []ssh.AuthMethod{ssh.PublicKeys(signer)}
	} else {
		return fmt.Errorf("invalid auth type: %s", instance.AuthType)
	}

	config := &ssh.ClientConfig{
		User:            instance.Username,
		Auth:            authMethods,
		HostKeyCallback: ssh.InsecureIgnoreHostKey(),
		Timeout:         10 * time.Second,
	}

	log.Printf("Attempting SSH connection to %s:%d as user %s with %d auth methods",
		instance.Host, instance.Port, instance.Username, len(authMethods))

	addr := fmt.Sprintf("%s:%d", instance.Host, instance.Port)
	client, err := ssh.Dial("tcp", addr, config)
	if err != nil {
		log.Printf("SSH connection failed: %v", err)
		return fmt.Errorf("failed to connect: %w", err)
	}
	defer client.Close()

	log.Printf("SSH connection successful!")

	// Test if backup path exists or can be created
	session, err := client.NewSession()
	if err != nil {
		return fmt.Errorf("failed to create session: %w", err)
	}
	defer session.Close()

	cmd := fmt.Sprintf("mkdir -p %s && test -d %s", instance.BackupPath, instance.BackupPath)
	if err := session.Run(cmd); err != nil {
		return fmt.Errorf("backup path validation failed: %w", err)
	}

	return nil
}

// GetDecryptedCredentials returns the decrypted credentials (use with caution)
func (s *VPSService) GetDecryptedCredentials(instance *models.VPSInstance) (string, error) {
	if instance.AuthType == "password" {
		return s.decrypt(instance.Password)
	}
	return s.decrypt(instance.SSHKey)
}
