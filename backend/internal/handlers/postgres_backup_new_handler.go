package handlers

import (
	"fmt"
	"net/http"
	"strconv"

	"rustfs-manager/internal/dto"
	"rustfs-manager/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type PostgresBackupHandlerNew struct {
	backupService *services.PostgresBackupService
}

func NewPostgresBackupHandlerNew(backupService *services.PostgresBackupService) *PostgresBackupHandlerNew {
	return &PostgresBackupHandlerNew{
		backupService: backupService,
	}
}

// CreateBackup creates a new backup
func (h *PostgresBackupHandlerNew) CreateBackup(c *gin.Context) {
	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "unauthorized"})
		return
	}
	userID := userIDVal.(uint)

	var req dto.CreateBackupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
		return
	}

	backup, err := h.backupService.CreateBackup(userID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":   "Backup started successfully",
		"backup_id": backup.ID.String(),
	})
}

// GetBackups retrieves backups for a database
func (h *PostgresBackupHandlerNew) GetBackups(c *gin.Context) {
	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "unauthorized"})
		return
	}
	userID := userIDVal.(uint)

	var req dto.GetBackupsRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
		return
	}

	// Parse database ID
	databaseID, err := strconv.ParseUint(req.DatabaseID, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "invalid database_id"})
		return
	}

	// Set defaults
	if req.Limit <= 0 {
		req.Limit = 10
	}
	if req.Offset < 0 {
		req.Offset = 0
	}

	response, err := h.backupService.GetBackups(userID, uint(databaseID), req.Limit, req.Offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

// DeleteBackup deletes a backup
func (h *PostgresBackupHandlerNew) DeleteBackup(c *gin.Context) {
	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "unauthorized"})
		return
	}
	userID := userIDVal.(uint)

	backupID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "invalid backup ID"})
		return
	}

	if err := h.backupService.DeleteBackup(userID, backupID); err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

// CancelBackup cancels an in-progress backup
func (h *PostgresBackupHandlerNew) CancelBackup(c *gin.Context) {
	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "unauthorized"})
		return
	}
	userID := userIDVal.(uint)

	backupID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "invalid backup ID"})
		return
	}

	if err := h.backupService.CancelBackup(userID, backupID); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

// GenerateDownloadToken generates a short-lived download token
func (h *PostgresBackupHandlerNew) GenerateDownloadToken(c *gin.Context) {
	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "unauthorized"})
		return
	}
	userID := userIDVal.(uint)
	_ = userID // Will be used for token generation

	backupID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "invalid backup ID"})
		return
	}

	// Generate a simple token (in production, use JWT or similar)
	token := uuid.New().String()

	// Store token in cache/redis with 5-minute expiration
	// For now, we'll just return it
	// TODO: Implement proper token storage and validation

	c.JSON(http.StatusOK, dto.GenerateDownloadTokenResponse{
		Token:    token,
		Filename: fmt.Sprintf("backup_%s.dump", backupID.String()[:8]),
		BackupID: backupID.String(),
	})
}

// DownloadBackup downloads a backup file
func (h *PostgresBackupHandlerNew) DownloadBackup(c *gin.Context) {
	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "unauthorized"})
		return
	}
	userID := userIDVal.(uint)

	backupID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "invalid backup ID"})
		return
	}

	// TODO: Validate token
	token := c.Query("token")
	if token == "" {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "download token is required"})
		return
	}

	// Get backup file
	file, filename, err := h.backupService.GetBackupFile(userID, backupID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
		return
	}
	defer file.Close()

	// Set headers for file download
	c.Header("Content-Type", "application/octet-stream")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", filename))

	// Stream file to response
	c.DataFromReader(http.StatusOK, -1, "application/octet-stream", file, nil)
}

// RestoreBackup restores a backup to a target database
func (h *PostgresBackupHandlerNew) RestoreBackup(c *gin.Context) {
	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "unauthorized"})
		return
	}
	userID := userIDVal.(uint)

	var req dto.RestoreBackupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
		return
	}

	if err := h.backupService.RestoreBackup(userID, req); err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Backup restored successfully",
	})
}
