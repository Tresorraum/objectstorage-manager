package dto

import "rukhalt/internal/models"

// Request DTOs
type CreateInstanceRequest struct {
	Name        string `json:"name" binding:"required"`
	Endpoint    string `json:"endpoint" binding:"required"`
	AccessKey   string `json:"access_key" binding:"required"`
	SecretKey   string `json:"secret_key" binding:"required"`
	Region      string `json:"region"`
	SSL         bool   `json:"ssl"`
	Description string `json:"description"`
}

type UpdateInstanceRequest struct {
	Name        string `json:"name" binding:"required"`
	Endpoint    string `json:"endpoint" binding:"required"`
	AccessKey   string `json:"access_key" binding:"required"`
	SecretKey   string `json:"secret_key"`
	Region      string `json:"region"`
	SSL         bool   `json:"ssl"`
	Description string `json:"description"`
}

// Response DTOs
type InstanceResponse struct {
	ID          uint   `json:"id"`
	UserID      uint   `json:"user_id"`
	Name        string `json:"name"`
	Endpoint    string `json:"endpoint"`
	AccessKey   string `json:"access_key"`
	Region      string `json:"region"`
	SSL         bool   `json:"ssl"`
	Description string `json:"description"`
	Status      string `json:"status"`
	CreatedAt   string `json:"created_at"`
}

// Mapper functions
func ToInstanceResponse(instance *models.RustFSInstance) *InstanceResponse {
	return &InstanceResponse{
		ID:          instance.ID,
		UserID:      instance.UserID,
		Name:        instance.Name,
		Endpoint:    instance.Endpoint,
		AccessKey:   instance.AccessKey,
		Region:      instance.Region,
		SSL:         instance.SSL,
		Description: instance.Description,
		Status:      instance.Status,
		CreatedAt:   instance.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}

func ToInstanceResponseList(instances []models.RustFSInstance) []*InstanceResponse {
	responses := make([]*InstanceResponse, len(instances))
	for i, instance := range instances {
		responses[i] = ToInstanceResponse(&instance)
	}
	return responses
}
