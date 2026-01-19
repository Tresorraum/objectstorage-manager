package middleware

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"rustfs-manager/internal/services"
	"strings"

	"github.com/gin-gonic/gin"
)

// AuditMiddleware logs all important actions
func AuditMiddleware(auditService *services.AuditService) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Skip audit for GET requests and health checks
		if c.Request.Method == "GET" || c.Request.URL.Path == "/health" {
			c.Next()
			return
		}

		// Read the request body
		var bodyBytes []byte
		if c.Request.Body != nil {
			bodyBytes, _ = io.ReadAll(c.Request.Body)
			c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))
		}

		// Process the request
		c.Next()

		// Only log successful operations (2xx status codes)
		if c.Writer.Status() < 200 || c.Writer.Status() >= 300 {
			return
		}

		// Get user ID from context
		userID, exists := c.Get("user_id")
		var userIDPtr *uint
		if exists {
			uid := userID.(uint)
			userIDPtr = &uid
		}

		// Determine action and resource based on path and method
		action, resource, details := determineAuditInfo(c, bodyBytes)
		if action == "" {
			return // Skip if not an auditable action
		}

		// Get resource ID from URL if available
		var resourceID *uint
		if id := c.Param("id"); id != "" {
			var parsedID uint
			if _, err := fmt.Sscanf(id, "%d", &parsedID); err == nil {
				resourceID = &parsedID
			}
		}

		// Log the action asynchronously
		go func() {
			_ = auditService.LogAction(
				userIDPtr,
				action,
				resource,
				resourceID,
				details,
				c.ClientIP(),
				c.Request.UserAgent(),
			)
		}()
	}
}

func determineAuditInfo(c *gin.Context, bodyBytes []byte) (string, string, map[string]interface{}) {
	path := c.Request.URL.Path
	method := c.Request.Method

	var action, resource string
	details := make(map[string]interface{})

	// Parse request body
	if len(bodyBytes) > 0 {
		json.Unmarshal(bodyBytes, &details)
	}

	// Determine action based on method
	switch method {
	case "POST":
		if c.Param("id") != "" && (c.Request.URL.Path == "/api/v1/backup/jobs/:id/run") {
			action = "backup_run"
		} else {
			action = "create"
		}
	case "PUT":
		action = "update"
	case "DELETE":
		action = "delete"
	default:
		return "", "", nil
	}

	// Determine resource based on path
	switch {
	case contains(path, "/rustfs/instances"):
		resource = "instance"
	case contains(path, "/backup/jobs"):
		resource = "backup_job"
	case contains(path, "/auth/login"):
		action = "login"
		resource = "authentication"
	case contains(path, "/auth/register"):
		action = "register"
		resource = "authentication"
	default:
		return "", "", nil
	}

	return action, resource, details
}

func contains(s, substr string) bool {
	return strings.Contains(s, substr)
}
