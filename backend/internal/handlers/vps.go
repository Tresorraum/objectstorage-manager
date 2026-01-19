package handlers

import (
	"net/http"
	"rustfs-manager/internal/dto"
	"rustfs-manager/internal/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

type VPSHandler struct {
	service *services.VPSService
}

func NewVPSHandler(service *services.VPSService) *VPSHandler {
	return &VPSHandler{service: service}
}

// CreateInstance creates a new VPS instance
// @Summary Create VPS instance
// @Tags vps
// @Accept json
// @Produce json
// @Param instance body dto.CreateVPSInstanceRequest true "Instance details"
// @Success 201 {object} dto.VPSInstanceResponse
// @Router /vps/instances [post]
func (h *VPSHandler) CreateInstance(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req dto.CreateVPSInstanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	instance, err := h.service.CreateInstance(userID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	response := dto.VPSInstanceResponse{
		ID:          instance.ID,
		UserID:      instance.UserID,
		Name:        instance.Name,
		Host:        instance.Host,
		Port:        instance.Port,
		Username:    instance.Username,
		AuthType:    instance.AuthType,
		BackupPath:  instance.BackupPath,
		Description: instance.Description,
		Status:      instance.Status,
		CreatedAt:   instance.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:   instance.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	c.JSON(http.StatusCreated, response)
}

// GetInstances retrieves all VPS instances for the authenticated user
// @Summary Get VPS instances
// @Tags vps
// @Produce json
// @Success 200 {array} dto.VPSInstanceResponse
// @Router /vps/instances [get]
func (h *VPSHandler) GetInstances(c *gin.Context) {
	userID := c.GetUint("user_id")

	instances, err := h.service.GetInstances(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var responses []dto.VPSInstanceResponse
	for _, instance := range instances {
		responses = append(responses, dto.VPSInstanceResponse{
			ID:          instance.ID,
			UserID:      instance.UserID,
			Name:        instance.Name,
			Host:        instance.Host,
			Port:        instance.Port,
			Username:    instance.Username,
			AuthType:    instance.AuthType,
			BackupPath:  instance.BackupPath,
			Description: instance.Description,
			Status:      instance.Status,
			CreatedAt:   instance.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
			UpdatedAt:   instance.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
		})
	}

	c.JSON(http.StatusOK, responses)
}

// GetInstance retrieves a VPS instance by ID
// @Summary Get VPS instance
// @Tags vps
// @Produce json
// @Param id path int true "Instance ID"
// @Success 200 {object} dto.VPSInstanceResponse
// @Router /vps/instances/{id} [get]
func (h *VPSHandler) GetInstance(c *gin.Context) {
	userID := c.GetUint("user_id")
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid instance ID"})
		return
	}

	instance, err := h.service.GetInstance(uint(id), userID)
	if err != nil {
		if err.Error() == "unauthorized" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
			return
		}
		c.JSON(http.StatusNotFound, gin.H{"error": "Instance not found"})
		return
	}

	response := dto.VPSInstanceResponse{
		ID:          instance.ID,
		UserID:      instance.UserID,
		Name:        instance.Name,
		Host:        instance.Host,
		Port:        instance.Port,
		Username:    instance.Username,
		AuthType:    instance.AuthType,
		BackupPath:  instance.BackupPath,
		Description: instance.Description,
		Status:      instance.Status,
		CreatedAt:   instance.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:   instance.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	c.JSON(http.StatusOK, response)
}

// UpdateInstance updates a VPS instance
// @Summary Update VPS instance
// @Tags vps
// @Accept json
// @Produce json
// @Param id path int true "Instance ID"
// @Param instance body dto.UpdateVPSInstanceRequest true "Instance details"
// @Success 200 {object} dto.VPSInstanceResponse
// @Router /vps/instances/{id} [put]
func (h *VPSHandler) UpdateInstance(c *gin.Context) {
	userID := c.GetUint("user_id")
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid instance ID"})
		return
	}

	var req dto.UpdateVPSInstanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	instance, err := h.service.UpdateInstance(uint(id), userID, &req)
	if err != nil {
		if err.Error() == "unauthorized" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	response := dto.VPSInstanceResponse{
		ID:          instance.ID,
		UserID:      instance.UserID,
		Name:        instance.Name,
		Host:        instance.Host,
		Port:        instance.Port,
		Username:    instance.Username,
		AuthType:    instance.AuthType,
		BackupPath:  instance.BackupPath,
		Description: instance.Description,
		Status:      instance.Status,
		CreatedAt:   instance.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:   instance.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	c.JSON(http.StatusOK, response)
}

// DeleteInstance deletes a VPS instance
// @Summary Delete VPS instance
// @Tags vps
// @Param id path int true "Instance ID"
// @Success 204
// @Router /vps/instances/{id} [delete]
func (h *VPSHandler) DeleteInstance(c *gin.Context) {
	userID := c.GetUint("user_id")
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid instance ID"})
		return
	}

	if err := h.service.DeleteInstance(uint(id), userID); err != nil {
		if err.Error() == "unauthorized" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}

// TestConnection tests the SSH connection to a VPS instance
// @Summary Test VPS connection
// @Tags vps
// @Param id path int true "Instance ID"
// @Success 200 {object} map[string]string
// @Router /vps/instances/{id}/test [post]
func (h *VPSHandler) TestConnection(c *gin.Context) {
	userID := c.GetUint("user_id")
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid instance ID"})
		return
	}

	instance, err := h.service.GetInstance(uint(id), userID)
	if err != nil {
		if err.Error() == "unauthorized" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
			return
		}
		c.JSON(http.StatusNotFound, gin.H{"error": "Instance not found"})
		return
	}

	if err := h.service.TestConnection(instance); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Connection failed: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Connection successful"})
}
