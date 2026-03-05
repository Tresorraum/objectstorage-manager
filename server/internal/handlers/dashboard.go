package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"rukhalt/internal/dto"
	"rukhalt/internal/services"
)

type DashboardHandler struct {
	dashboardService *services.DashboardService
}

func NewDashboardHandler(dashboardService *services.DashboardService) *DashboardHandler {
	return &DashboardHandler{dashboardService: dashboardService}
}

// GetStats returns dashboard statistics
func (h *DashboardHandler) GetStats(c *gin.Context) {
	stats, err := h.dashboardService.GetStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse(dto.ErrInternalServer))
		return
	}

	c.JSON(http.StatusOK, stats)
}

// GetMetrics returns system metrics
func (h *DashboardHandler) GetMetrics(c *gin.Context) {
	metrics, err := h.dashboardService.GetMetrics()
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse(dto.ErrInternalServer))
		return
	}

	c.JSON(http.StatusOK, metrics)
}

// GetAlerts returns recent alerts
func (h *DashboardHandler) GetAlerts(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "10")
	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		limit = 10
	}

	alerts, err := h.dashboardService.GetAlerts(limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.NewErrorResponse(dto.ErrInternalServer))
		return
	}

	c.JSON(http.StatusOK, alerts)
}