package services

import (
	"encoding/json"
	"rukhalt/internal/models"
	"rukhalt/internal/repository"
)

type AuditService struct {
	repo repository.AuditRepository
}

func NewAuditService(repo repository.AuditRepository) *AuditService {
	return &AuditService{repo: repo}
}

func (s *AuditService) LogAction(userID *uint, action, resource string, resourceID *uint, details interface{}, ipAddress, userAgent string) error {
	detailsJSON, _ := json.Marshal(details)

	log := &models.AuditLog{
		UserID:     userID,
		Action:     action,
		Resource:   resource,
		ResourceID: resourceID,
		Details:    string(detailsJSON),
		IPAddress:  ipAddress,
		UserAgent:  userAgent,
	}

	return s.repo.Create(log)
}

func (s *AuditService) GetLogs(query string, action string, resource string, limit, offset int) ([]models.AuditLog, int64, error) {
	return s.repo.Search(query, action, resource, limit, offset)
}

func (s *AuditService) GetUserLogs(userID uint, limit, offset int) ([]models.AuditLog, error) {
	return s.repo.FindByUserID(userID, limit, offset)
}

func (s *AuditService) GetTotalCount() (int64, error) {
	return s.repo.Count()
}
