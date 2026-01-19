package handlers

import (
	"net/http"
	"rustfs-manager/internal/dto"
	"rustfs-manager/internal/services"
	"strconv"

	"github.com/gin-gonic/gin"
)

type PostgresHandler struct {
	service *services.PostgresService
}

func NewPostgresHandler(service *services.PostgresService) *PostgresHandler {
	return &PostgresHandler{service: service}
}

// CreateInstance creates a new PostgreSQL instance
// @Summary Create PostgreSQL instance
// @Tags postgres
// @Accept json
// @Produce json
// @Param instance body dto.CreatePostgresInstanceRequest true "Instance details"
// @Success 201 {object} dto.PostgresInstanceResponse
// @Router /postgres/instances [post]
func (h *PostgresHandler) CreateInstance(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req dto.CreatePostgresInstanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create temporary instance for connection testing
	tempInstance, err := h.service.CreateInstance(userID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Test connection before finalizing
	if err := h.service.TestConnection(tempInstance); err != nil {
		// Delete the instance if connection fails
		h.service.DeleteInstance(tempInstance.ID, userID)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Connection test failed: " + err.Error()})
		return
	}

	response := dto.PostgresInstanceResponse{
		ID:          tempInstance.ID,
		UserID:      tempInstance.UserID,
		Name:        tempInstance.Name,
		Host:        tempInstance.Host,
		Port:        tempInstance.Port,
		Database:    tempInstance.Database,
		Username:    tempInstance.Username,
		SSL:         tempInstance.SSL,
		Description: tempInstance.Description,
		Status:      tempInstance.Status,
		CreatedAt:   tempInstance.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:   tempInstance.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	c.JSON(http.StatusCreated, response)
}

// GetInstances retrieves all PostgreSQL instances for the authenticated user
// @Summary Get PostgreSQL instances
// @Tags postgres
// @Produce json
// @Success 200 {array} dto.PostgresInstanceResponse
// @Router /postgres/instances [get]
func (h *PostgresHandler) GetInstances(c *gin.Context) {
	userID := c.GetUint("user_id")

	instances, err := h.service.GetInstances(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var responses []dto.PostgresInstanceResponse
	for _, instance := range instances {
		responses = append(responses, dto.PostgresInstanceResponse{
			ID:          instance.ID,
			UserID:      instance.UserID,
			Name:        instance.Name,
			Host:        instance.Host,
			Port:        instance.Port,
			Database:    instance.Database,
			Username:    instance.Username,
			SSL:         instance.SSL,
			Description: instance.Description,
			Status:      instance.Status,
			CreatedAt:   instance.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
			UpdatedAt:   instance.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
		})
	}

	c.JSON(http.StatusOK, responses)
}

// GetInstance retrieves a PostgreSQL instance by ID
// @Summary Get PostgreSQL instance
// @Tags postgres
// @Produce json
// @Param id path int true "Instance ID"
// @Success 200 {object} dto.PostgresInstanceResponse
// @Router /postgres/instances/{id} [get]
func (h *PostgresHandler) GetInstance(c *gin.Context) {
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

	response := dto.PostgresInstanceResponse{
		ID:          instance.ID,
		UserID:      instance.UserID,
		Name:        instance.Name,
		Host:        instance.Host,
		Port:        instance.Port,
		Database:    instance.Database,
		Username:    instance.Username,
		SSL:         instance.SSL,
		Description: instance.Description,
		Status:      instance.Status,
		CreatedAt:   instance.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:   instance.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	c.JSON(http.StatusOK, response)
}

// UpdateInstance updates a PostgreSQL instance
// @Summary Update PostgreSQL instance
// @Tags postgres
// @Accept json
// @Produce json
// @Param id path int true "Instance ID"
// @Param instance body dto.UpdatePostgresInstanceRequest true "Instance details"
// @Success 200 {object} dto.PostgresInstanceResponse
// @Router /postgres/instances/{id} [put]
func (h *PostgresHandler) UpdateInstance(c *gin.Context) {
	userID := c.GetUint("user_id")
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid instance ID"})
		return
	}

	var req dto.UpdatePostgresInstanceRequest
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

	// Test connection after update if credentials were changed
	if req.Host != "" || req.Port > 0 || req.Database != "" || req.Username != "" || req.Password != "" {
		if err := h.service.TestConnection(instance); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Connection test failed after update: " + err.Error(), "warning": "Instance updated but connection failed"})
			return
		}
	}

	response := dto.PostgresInstanceResponse{
		ID:          instance.ID,
		UserID:      instance.UserID,
		Name:        instance.Name,
		Host:        instance.Host,
		Port:        instance.Port,
		Database:    instance.Database,
		Username:    instance.Username,
		SSL:         instance.SSL,
		Description: instance.Description,
		Status:      instance.Status,
		CreatedAt:   instance.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:   instance.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	c.JSON(http.StatusOK, response)
}

// DeleteInstance deletes a PostgreSQL instance
// @Summary Delete PostgreSQL instance
// @Tags postgres
// @Param id path int true "Instance ID"
// @Success 204
// @Router /postgres/instances/{id} [delete]
func (h *PostgresHandler) DeleteInstance(c *gin.Context) {
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

// TestConnection tests the connection to a PostgreSQL instance
// @Summary Test PostgreSQL connection
// @Tags postgres
// @Param id path int true "Instance ID"
// @Success 200 {object} map[string]string
// @Router /postgres/instances/{id}/test [post]
func (h *PostgresHandler) TestConnection(c *gin.Context) {
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
