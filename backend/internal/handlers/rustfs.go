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

type RustFSHandler struct {
	rustfsService *services.RustFSService
	repo          repository.InstanceRepository
}

func NewRustFSHandler(rustfsService *services.RustFSService, repo repository.InstanceRepository) *RustFSHandler {
	return &RustFSHandler{
		rustfsService: rustfsService,
		repo:          repo,
	}
}

// ListInstances returns all RustFS instances
func (h *RustFSHandler) ListInstances(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.NewErrorResponse(dto.ErrUnauthorized))
		return
	}

	instances, err := h.repo.FindByUserID(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse(dto.ErrInternalServer))
		return
	}

	c.JSON(http.StatusOK, dto.ToInstanceResponseList(instances))
}

// CreateInstance creates a new RustFS instance
func (h *RustFSHandler) CreateInstance(c *gin.Context) {
	var req dto.CreateInstanceRequest
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
	isPremium, _ := c.Get("is_premium")
	if !isPremium.(bool) {
		// Free users can only create 1 instance
		count, err := h.repo.CountByUserID(userID.(uint))
		if err != nil {
			c.JSON(http.StatusInternalServerError, dto.NewErrorResponse(dto.ErrInternalServer))
			return
		}
		if count >= 1 {
			c.JSON(http.StatusForbidden, dto.NewErrorResponse(dto.ErrInstanceLimitReached))
			return
		}
	}

	// Set defaults
	if req.Region == "" {
		req.Region = "us-east-1"
	}

	instance := &models.RustFSInstance{
		UserID:      userID.(uint),
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
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse(dto.ErrConnectionFailed))
		return
	}

	if err := h.repo.Create(instance); err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse(dto.ErrInternalServer))
		return
	}

	c.JSON(http.StatusCreated, dto.ToInstanceResponse(instance))
}

// GetInstance returns a specific RustFS instance
func (h *RustFSHandler) GetInstance(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse(dto.ErrBadRequest))
		return
	}

	instance, err := h.repo.FindByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, dto.NewErrorResponse(dto.ErrInstanceNotFound))
		return
	}

	// Verify user owns this instance
	userID, _ := c.Get("user_id")
	if instance.UserID != userID.(uint) {
		c.JSON(http.StatusForbidden, dto.NewErrorResponse(dto.ErrForbidden))
		return
	}

	c.JSON(http.StatusOK, dto.ToInstanceResponse(instance))
}

// UpdateInstance updates a RustFS instance
func (h *RustFSHandler) UpdateInstance(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse(dto.ErrBadRequest))
		return
	}

	instance, err := h.repo.FindByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, dto.NewErrorResponse(dto.ErrInstanceNotFound))
		return
	}

	// Verify user owns this instance
	userID, _ := c.Get("user_id")
	if instance.UserID != userID.(uint) {
		c.JSON(http.StatusForbidden, dto.NewErrorResponse(dto.ErrForbidden))
		return
	}

	var req dto.UpdateInstanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse(dto.ErrBadRequest))
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
	if err := h.rustfsService.TestConnection(instance); err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse(dto.ErrConnectionFailed))
		return
	}

	if err := h.repo.Update(instance); err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse(dto.ErrInternalServer))
		return
	}

	c.JSON(http.StatusOK, dto.ToInstanceResponse(instance))
}

// DeleteInstance deletes a RustFS instance
func (h *RustFSHandler) DeleteInstance(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse(dto.ErrBadRequest))
		return
	}

	instance, err := h.repo.FindByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, dto.NewErrorResponse(dto.ErrInstanceNotFound))
		return
	}

	// Verify user owns this instance
	userID, _ := c.Get("user_id")
	if instance.UserID != userID.(uint) {
		c.JSON(http.StatusForbidden, dto.NewErrorResponse(dto.ErrForbidden))
		return
	}

	if err := h.repo.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse(dto.ErrInternalServer))
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Instance deleted successfully"})
}

// ListBuckets returns all buckets for an instance
func (h *RustFSHandler) ListBuckets(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.NewErrorResponse(dto.ErrBadRequest))
		return
	}

	instance, err := h.repo.FindByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, dto.NewErrorResponse(dto.ErrInstanceNotFound))
		return
	}

	// Verify user owns this instance
	userID, _ := c.Get("user_id")
	if instance.UserID != userID.(uint) {
		c.JSON(http.StatusForbidden, dto.NewErrorResponse(dto.ErrForbidden))
		return
	}

	buckets, err := h.rustfsService.ListBuckets(instance)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse(dto.ErrInternalServer))
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