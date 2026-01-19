package handlers

import (
	"net/http"
	"strconv"

	"rustfs-manager/internal/dto"
	"rustfs-manager/internal/services"

	"github.com/gin-gonic/gin"
)

type AuditHandler struct {
	auditService *services.AuditService
}

func NewAuditHandler(auditService *services.AuditService) *AuditHandler {
	return &AuditHandler{auditService: auditService}
}

func (h *AuditHandler) GetLogs(c *gin.Context) {
	query := c.DefaultQuery("query", "")
	action := c.DefaultQuery("action", "all")
	resource := c.DefaultQuery("resource", "all")
	limitStr := c.DefaultQuery("limit", "50")
	pageStr := c.DefaultQuery("page", "1")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 50
	}
	if limit > 100 {
		limit = 100
	}

	page, err := strconv.Atoi(pageStr)
	if err != nil || page <= 0 {
		page = 1
	}

	offset := (page - 1) * limit

	logs, total, err := h.auditService.GetLogs(query, action, resource, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse(dto.ErrInternalServer))
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"logs":  logs,
		"total": total,
		"page":  page,
		"limit": limit,
		"pages": (total + int64(limit) - 1) / int64(limit),
	})
}

func (h *AuditHandler) GetUserLogs(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.NewErrorResponse(dto.ErrUnauthorized))
		return
	}

	limitStr := c.DefaultQuery("limit", "50")
	pageStr := c.DefaultQuery("page", "1")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 50
	}

	page, err := strconv.Atoi(pageStr)
	if err != nil || page <= 0 {
		page = 1
	}

	offset := (page - 1) * limit

	logs, err := h.auditService.GetUserLogs(userID.(uint), limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse(dto.ErrInternalServer))
		return
	}

	c.JSON(http.StatusOK, logs)
}

func (h *AuditHandler) GetStats(c *gin.Context) {
	total, err := h.auditService.GetTotalCount()
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse(dto.ErrInternalServer))
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"total_logs": total,
	})
}
