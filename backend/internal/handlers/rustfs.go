package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"rustfs-manager/internal/models"
	"rustfs-manager/internal/services"
)

type RustFSHandler struct {
	rustfsService *services.RustFSService
	db            *gorm.DB
}

func NewRustFSHandler(rustfsService *services.RustFSService) *RustFSHandler {
	return &RustFSHandler{rustfsService: rustfsService}
}

// SetDB sets the database connection
func (h *RustFSHandler) SetDB(db *gorm.DB) {
	h.db = db
}

type CreateInstanceRequest struct {
	Name        string `json:"name" binding:"required"`
	Endpoint    string `json:"endpoint" binding:"required"`
	AccessKey   string `json:"access_key" binding:"required"`
	SecretKey   string `json:"secret_key" binding:"required"`
	Region      string `json:"region"`
	SSL         bool   `json:"ssl"`
	Description string `json:"description"`
}

// ListInstances returns all RustFS instances
func (h *RustFSHandler) ListInstances(c *gin.Context) {
	var instances []models.RustFSInstance
	if err := h.db.Find(&instances).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list instances"})
		return
	}

	c.JSON(http.StatusOK, instances)
}

// CreateInstance creates a new RustFS instance
func (h *RustFSHandler) CreateInstance(c *gin.Context) {
	var req CreateInstanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set defaults
	if req.Region == "" {
		req.Region = "us-east-1"
	}

	instance := &models.RustFSInstance{
		Name:        req.Name,
		Endpoint:    req.Endpoint,
		AccessKey:   req.AccessKey,
		SecretKey:   req.SecretKey,
		Region:      req.Region,
		SSL:         req.SSL,
		Description: req.Description,
		Status:      "active",
	}

	// Test connection before saving
	if err := h.rustfsService.TestConnection(instance); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to connect to RustFS instance"})
		return
	}

	if err := h.db.Create(instance).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create instance"})
		return
	}

	// Remove secret key from response
	instance.SecretKey = ""

	c.JSON(http.StatusCreated, instance)
}

// GetInstance returns a specific RustFS instance
func (h *RustFSHandler) GetInstance(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid instance ID"})
		return
	}

	var instance models.RustFSInstance
	if err := h.db.First(&instance, uint(id)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Instance not found"})
		return
	}

	// Remove secret key from response
	instance.SecretKey = ""

	c.JSON(http.StatusOK, instance)
}

// UpdateInstance updates a RustFS instance
func (h *RustFSHandler) UpdateInstance(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid instance ID"})
		return
	}

	var instance models.RustFSInstance
	if err := h.db.First(&instance, uint(id)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Instance not found"})
		return
	}

	var req CreateInstanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update instance fields
	instance.Name = req.Name
	instance.Endpoint = req.Endpoint
	instance.AccessKey = req.AccessKey
	if req.SecretKey != "" {
		instance.SecretKey = req.SecretKey
	}
	instance.Region = req.Region
	instance.SSL = req.SSL
	instance.Description = req.Description

	// Test connection before saving
	if err := h.rustfsService.TestConnection(&instance); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to connect to RustFS instance"})
		return
	}

	if err := h.db.Save(&instance).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to update instance"})
		return
	}

	// Remove secret key from response
	instance.SecretKey = ""

	c.JSON(http.StatusOK, instance)
}

// DeleteInstance deletes a RustFS instance
func (h *RustFSHandler) DeleteInstance(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid instance ID"})
		return
	}

	if err := h.db.Delete(&models.RustFSInstance{}, uint(id)).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete instance"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Instance deleted successfully"})
}

// ListBuckets returns all buckets for an instance
func (h *RustFSHandler) ListBuckets(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid instance ID"})
		return
	}

	var instance models.RustFSInstance
	if err := h.db.First(&instance, uint(id)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Instance not found"})
		return
	}

	buckets, err := h.rustfsService.ListBuckets(&instance)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list buckets"})
		return
	}

	c.JSON(http.StatusOK, buckets)
}

// ListUsers returns all users for an instance (placeholder)
func (h *RustFSHandler) ListUsers(c *gin.Context) {
	// This would typically integrate with RustFS user management
	// For now, return empty array
	c.JSON(http.StatusOK, []interface{}{})
}