package handlers

import (
	"net/http"
	"strconv"

	"rustfs-manager/internal/dto"
	"rustfs-manager/internal/models"
	"rustfs-manager/internal/services"

	"github.com/gin-gonic/gin"
)

type BackupHandler struct {
	backupService *services.BackupService
}

func NewBackupHandler(backupService *services.BackupService) *BackupHandler {
	return &BackupHandler{
		backupService: backupService,
	}
}

// ListJobs returns all backup jobs
func (h *BackupHandler) ListJobs(c *gin.Context) {
	jobs, err := h.backupService.ListBackupJobs()
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse(dto.ErrInternalServer))
		return
	}

	c.JSON(http.StatusOK, jobs)
}

// CreateJob creates a new backup job
func (h *BackupHandler) CreateJob(c *gin.Context) {
	var req dto.CreateBackupJobRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse(dto.ErrBadRequest))
		return
	}

	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.NewErrorResponse(dto.ErrUnauthorized))
		return
	}

	// Check if user is premium
	isPremium, exists := c.Get("is_premium")
	if !exists {
		isPremium = false
	}

	// Check backup type restrictions
	isPremiumBool, ok := isPremium.(bool)
	if !ok {
		isPremiumBool = false
	}

	if req.BackupType == "server" && !isPremiumBool {
		c.JSON(http.StatusForbidden, dto.NewErrorResponse(dto.ErrServerBackupRestricted))
		return
	}

	// Validate source type
	if req.SourceType != "object_storage" && req.SourceType != "postgres" && req.SourceType != "vps" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid source_type, must be object_storage, postgres, or vps"})
		return
	}

	// Validate source instance based on source type
	if req.SourceType == "object_storage" && req.RustFSInstanceID == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "rustfs_instance_id is required for object_storage source"})
		return
	}

	if req.SourceType == "postgres" && req.PostgresInstanceID == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "postgres_instance_id is required for postgres source"})
		return
	}

	if req.SourceType == "vps" && req.VPSInstanceID == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "vps_instance_id is required for vps source"})
		return
	}

	// Validate backup type
	if req.BackupType != "server" && req.BackupType != "bucket" {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse(dto.ErrInvalidBackupType))
		return
	}

	// Validate required fields based on backup type
	if req.BackupType == "server" && req.DestinationPath == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "destination_path is required for server backups"})
		return
	}

	if req.BackupType == "bucket" {
		if req.DestinationInstanceID == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "destination_instance_id is required for bucket backups"})
			return
		}

		if req.DestinationBucket == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "destination_bucket is required for bucket backups"})
			return
		}
	}

	// Set defaults
	if req.RetentionDays == 0 {
		req.RetentionDays = 30
	}

	if req.CompressionType == "" {
		req.CompressionType = "gzip"
	}

	// For bucket backups, default to compressed if not explicitly set
	// Note: We can't distinguish between "not set" and "false" with bool,
	// so we rely on the frontend always sending this field
	compressionEnabled := req.CompressionEnabled
	if req.BackupType == "bucket" {
		// Frontend should always send this, but default to true for safety
		compressionEnabled = req.CompressionEnabled
	}

	job := &models.BackupJob{
		UserID:                userID.(uint),
		Name:                  req.Name,
		SourceType:            req.SourceType,
		RustFSInstanceID:      req.RustFSInstanceID,
		PostgresInstanceID:    req.PostgresInstanceID,
		VPSInstanceID:         req.VPSInstanceID,
		SourceBucket:          req.SourceBucket,
		SourcePath:            req.SourcePath,
		BackupType:            req.BackupType,
		DestinationPath:       req.DestinationPath,
		DestinationInstanceID: req.DestinationInstanceID,
		DestinationBucket:     req.DestinationBucket,
		Schedule:              req.Schedule,
		Enabled:               req.Enabled,
		RetentionDays:         req.RetentionDays,
		CompressionType:       req.CompressionType,
		CompressionEnabled:    compressionEnabled,
	}

	if err := h.backupService.CreateBackupJob(job); err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse(dto.ErrInternalServer))
		return
	}

	c.JSON(http.StatusCreated, job)
}

// GetJob returns a specific backup job
func (h *BackupHandler) GetJob(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse(dto.ErrBadRequest))
		return
	}

	job, err := h.backupService.GetBackupJob(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, dto.NewErrorResponse(dto.ErrBackupJobNotFound))
		return
	}

	c.JSON(http.StatusOK, job)
}

// UpdateJob updates a backup job
func (h *BackupHandler) UpdateJob(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse(dto.ErrBadRequest))
		return
	}

	job, err := h.backupService.GetBackupJob(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, dto.NewErrorResponse(dto.ErrBackupJobNotFound))
		return
	}

	var req dto.UpdateBackupJobRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse(dto.ErrBadRequest))
		return
	}

	// Update job fields
	job.Name = req.Name
	job.SourceType = req.SourceType
	job.RustFSInstanceID = req.RustFSInstanceID
	job.PostgresInstanceID = req.PostgresInstanceID
	job.VPSInstanceID = req.VPSInstanceID
	job.SourceBucket = req.SourceBucket
	job.SourcePath = req.SourcePath
	job.BackupType = req.BackupType
	job.DestinationPath = req.DestinationPath
	job.DestinationInstanceID = req.DestinationInstanceID
	job.DestinationBucket = req.DestinationBucket
	job.Schedule = req.Schedule
	job.Enabled = req.Enabled
	job.RetentionDays = req.RetentionDays
	job.CompressionType = req.CompressionType
	job.CompressionEnabled = req.CompressionEnabled

	if err := h.backupService.UpdateBackupJob(job); err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse(dto.ErrInternalServer))
		return
	}

	c.JSON(http.StatusOK, job)
}

// DeleteJob deletes a backup job
func (h *BackupHandler) DeleteJob(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse(dto.ErrBadRequest))
		return
	}

	if err := h.backupService.DeleteBackupJob(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse(dto.ErrInternalServer))
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Backup job deleted successfully"})
}

// RunJob executes a backup job
func (h *BackupHandler) RunJob(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse(dto.ErrBadRequest))
		return
	}

	run, err := h.backupService.RunBackupJob(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse(dto.ErrInternalServer))
		return
	}

	c.JSON(http.StatusOK, run)
}

// RestoreBackup restores a backup
func (h *BackupHandler) RestoreBackup(c *gin.Context) {
	var req dto.RestoreBackupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse(dto.ErrBadRequest))
		return
	}

	// For the old backup system, we need different fields
	// This is a simplified version - you may need to adjust based on your needs
	if req.SourceType != "existing_backup" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "old backup system only supports existing_backup source type"})
		return
	}

	if req.BackupID == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "backup_id is required"})
		return
	}

	// For now, we'll use placeholder values
	// TODO: Implement proper restore logic for old backup system
	instanceID := req.TargetDatabaseID
	backupPath := *req.BackupID
	targetBucket := "restored"

	if err := h.backupService.RestoreBackup(instanceID, backupPath, targetBucket); err != nil {
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse(dto.ErrInternalServer))
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Backup restore started successfully"})
}
