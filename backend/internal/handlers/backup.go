package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"rustfs-manager/internal/dto"
	"rustfs-manager/internal/models"
	"rustfs-manager/internal/repository"
	"rustfs-manager/internal/services"
)

type BackupHandler struct {
	backupService *services.BackupService
	backupRepo    repository.BackupRepository
}

func NewBackupHandler(backupService *services.BackupService) *BackupHandler {
	return &BackupHandler{backupService: backupService}
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
		RustFSInstanceID:      req.RustFSInstanceID,
		SourceBucket:          req.SourceBucket,
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
	job.RustFSInstanceID = req.RustFSInstanceID
	job.SourceBucket = req.SourceBucket
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

	if err := h.backupService.RestoreBackup(req.InstanceID, req.BackupPath, req.TargetBucket); err != nil {
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse(dto.ErrInternalServer))
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Backup restore started successfully"})
}