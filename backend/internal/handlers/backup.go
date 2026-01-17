package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"rustfs-manager/internal/models"
	"rustfs-manager/internal/services"
)

type BackupHandler struct {
	backupService *services.BackupService
}

func NewBackupHandler(backupService *services.BackupService) *BackupHandler {
	return &BackupHandler{backupService: backupService}
}

type CreateBackupJobRequest struct {
	Name             string `json:"name" binding:"required"`
	RustFSInstanceID uint   `json:"rustfs_instance_id" binding:"required"`
	SourceBucket     string `json:"source_bucket" binding:"required"`
	DestinationPath  string `json:"destination_path" binding:"required"`
	Schedule         string `json:"schedule"`
	Enabled          bool   `json:"enabled"`
	RetentionDays    int    `json:"retention_days"`
	CompressionType  string `json:"compression_type"`
}

type RestoreBackupRequest struct {
	InstanceID   uint   `json:"instance_id" binding:"required"`
	BackupPath   string `json:"backup_path" binding:"required"`
	TargetBucket string `json:"target_bucket" binding:"required"`
}

// ListJobs returns all backup jobs
func (h *BackupHandler) ListJobs(c *gin.Context) {
	jobs, err := h.backupService.ListBackupJobs()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list backup jobs"})
		return
	}

	c.JSON(http.StatusOK, jobs)
}

// CreateJob creates a new backup job
func (h *BackupHandler) CreateJob(c *gin.Context) {
	var req CreateBackupJobRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set defaults
	if req.RetentionDays == 0 {
		req.RetentionDays = 30
	}
	if req.CompressionType == "" {
		req.CompressionType = "gzip"
	}

	job := &models.BackupJob{
		Name:             req.Name,
		RustFSInstanceID: req.RustFSInstanceID,
		SourceBucket:     req.SourceBucket,
		DestinationPath:  req.DestinationPath,
		Schedule:         req.Schedule,
		Enabled:          req.Enabled,
		RetentionDays:    req.RetentionDays,
		CompressionType:  req.CompressionType,
	}

	if err := h.backupService.CreateBackupJob(job); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create backup job"})
		return
	}

	c.JSON(http.StatusCreated, job)
}

// GetJob returns a specific backup job
func (h *BackupHandler) GetJob(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid job ID"})
		return
	}

	job, err := h.backupService.GetBackupJob(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Backup job not found"})
		return
	}

	c.JSON(http.StatusOK, job)
}

// UpdateJob updates a backup job
func (h *BackupHandler) UpdateJob(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid job ID"})
		return
	}

	job, err := h.backupService.GetBackupJob(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Backup job not found"})
		return
	}

	var req CreateBackupJobRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update job fields
	job.Name = req.Name
	job.RustFSInstanceID = req.RustFSInstanceID
	job.SourceBucket = req.SourceBucket
	job.DestinationPath = req.DestinationPath
	job.Schedule = req.Schedule
	job.Enabled = req.Enabled
	job.RetentionDays = req.RetentionDays
	job.CompressionType = req.CompressionType

	if err := h.backupService.UpdateBackupJob(job); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to update backup job"})
		return
	}

	c.JSON(http.StatusOK, job)
}

// DeleteJob deletes a backup job
func (h *BackupHandler) DeleteJob(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid job ID"})
		return
	}

	if err := h.backupService.DeleteBackupJob(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete backup job"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Backup job deleted successfully"})
}

// RunJob executes a backup job
func (h *BackupHandler) RunJob(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid job ID"})
		return
	}

	run, err := h.backupService.RunBackupJob(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to run backup job"})
		return
	}

	c.JSON(http.StatusOK, run)
}

// RestoreBackup restores a backup
func (h *BackupHandler) RestoreBackup(c *gin.Context) {
	var req RestoreBackupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.backupService.RestoreBackup(req.InstanceID, req.BackupPath, req.TargetBucket); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to restore backup"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Backup restore started successfully"})
}