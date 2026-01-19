package handlers

import (
	"net/http"

	"rustfs-manager/internal/dto"
	"rustfs-manager/internal/services"

	"github.com/gin-gonic/gin"
)

type PostgresBackupHandler struct {
	postgresService *services.PostgresService
	vpsService      *services.VPSService
}

func NewPostgresBackupHandler(postgresService *services.PostgresService, vpsService *services.VPSService) *PostgresBackupHandler {
	return &PostgresBackupHandler{
		postgresService: postgresService,
		vpsService:      vpsService,
	}
}

// CreateBackup creates an instant backup of a PostgreSQL database
func (h *PostgresBackupHandler) CreateBackup(c *gin.Context) {
	var req dto.PostgresBackupRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
		return
	}

	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.NewErrorResponse(dto.ErrUnauthorized))
		return
	}

	// Validate destination type
	if req.DestinationType != "local" && req.DestinationType != "vps" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "destination_type must be 'local' or 'vps'"})
		return
	}

	// If VPS destination, validate VPS instance ID
	if req.DestinationType == "vps" && req.VPSInstanceID == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "vps_instance_id is required for VPS destination"})
		return
	}

	// Get PostgreSQL instance
	postgresInstance, err := h.postgresService.GetInstance(req.PostgresInstanceID, userID.(uint))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "PostgreSQL instance not found"})
		return
	}

	// Create backup based on destination type
	if req.DestinationType == "local" {
		// Generate SQL dump and return as download
		sqlDump, filename, err := h.postgresService.CreateBackupDump(postgresInstance)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create backup: " + err.Error()})
			return
		}

		// Set headers for file download
		c.Header("Content-Description", "File Transfer")
		c.Header("Content-Disposition", "attachment; filename="+filename)
		c.Header("Content-Type", "application/sql")
		c.Header("Content-Length", string(rune(len(sqlDump))))

		c.Data(http.StatusOK, "application/sql", sqlDump)
	} else {
		// Upload to VPS
		vpsInstance, err := h.vpsService.GetInstance(*req.VPSInstanceID, userID.(uint))
		if err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "VPS instance not found"})
			return
		}

		// Create backup and upload to VPS
		backupPath, err := h.postgresService.CreateBackupToVPS(postgresInstance, vpsInstance)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upload backup to VPS: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message":     "Backup uploaded to VPS successfully",
			"backup_path": backupPath,
		})
	}
}
