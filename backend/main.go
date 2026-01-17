package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"rustfs-manager/internal/config"
	"rustfs-manager/internal/database"
	"rustfs-manager/internal/handlers"
	"rustfs-manager/internal/middleware"
	"rustfs-manager/internal/services"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize database
	db, err := database.Initialize(cfg.Database)
	if err != nil {
		log.Fatal("Failed to initialize database:", err)
	}

	// Initialize services
	rustfsService := services.NewRustFSService()
	backupService := services.NewBackupService(db)
	dashboardService := services.NewDashboardService(db, rustfsService)
	userService := services.NewUserService(db)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(userService)
	dashboardHandler := handlers.NewDashboardHandler(dashboardService)
	backupHandler := handlers.NewBackupHandler(backupService)
	rustfsHandler := handlers.NewRustFSHandler(rustfsService)
	rustfsHandler.SetDB(db)

	// Setup Gin router
	r := gin.Default()

	// CORS middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://frontend"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "healthy"})
	})

	// API routes
	api := r.Group("/api/v1")
	{
		// Authentication routes
		auth := api.Group("/auth")
		{
			auth.POST("/login", authHandler.Login)
			auth.POST("/register", authHandler.Register)
			auth.POST("/refresh", authHandler.RefreshToken)
		}

		// Protected routes
		protected := api.Group("/")
		protected.Use(middleware.AuthMiddleware())
		{
			// Dashboard routes
			dashboard := protected.Group("/dashboard")
			{
				dashboard.GET("/stats", dashboardHandler.GetStats)
				dashboard.GET("/metrics", dashboardHandler.GetMetrics)
				dashboard.GET("/alerts", dashboardHandler.GetAlerts)
			}

			// RustFS management routes
			rustfs := protected.Group("/rustfs")
			{
				rustfs.GET("/instances", rustfsHandler.ListInstances)
				rustfs.POST("/instances", rustfsHandler.CreateInstance)
				rustfs.GET("/instances/:id", rustfsHandler.GetInstance)
				rustfs.PUT("/instances/:id", rustfsHandler.UpdateInstance)
				rustfs.DELETE("/instances/:id", rustfsHandler.DeleteInstance)
				rustfs.GET("/instances/:id/buckets", rustfsHandler.ListBuckets)
				rustfs.GET("/instances/:id/users", rustfsHandler.ListUsers)
			}

			// Backup routes
			backup := protected.Group("/backup")
			{
				backup.GET("/jobs", backupHandler.ListJobs)
				backup.POST("/jobs", backupHandler.CreateJob)
				backup.GET("/jobs/:id", backupHandler.GetJob)
				backup.PUT("/jobs/:id", backupHandler.UpdateJob)
				backup.DELETE("/jobs/:id", backupHandler.DeleteJob)
				backup.POST("/jobs/:id/run", backupHandler.RunJob)
				backup.POST("/restore", backupHandler.RestoreBackup)
			}
		}
	}

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Starting RustFS Manager API on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}