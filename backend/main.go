package main

import (
	"log"
	"os"

	"rustfs-manager/internal/config"
	"rustfs-manager/internal/database"
	"rustfs-manager/internal/handlers"
	"rustfs-manager/internal/middleware"
	"rustfs-manager/internal/repository"
	"rustfs-manager/internal/services"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize database
	db, err := database.Initialize(cfg.Database)
	if err != nil {
		log.Fatal("Failed to initialize database:", err)
	}

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	instanceRepo := repository.NewInstanceRepository(db)
	backupRepo := repository.NewBackupRepository(db)
	dashboardRepo := repository.NewDashboardRepository(db)
	auditRepo := repository.NewAuditRepository(db)
	postgresRepo := repository.NewPostgresRepository(db)
	vpsRepo := repository.NewVPSRepository(db)

	// Initialize services
	rustfsService := services.NewRustFSService()
	userService := services.NewUserService(userRepo)
	auditService := services.NewAuditService(auditRepo)
	backupService := services.NewBackupService(backupRepo, instanceRepo, auditService)
	dashboardService := services.NewDashboardService(dashboardRepo)

	// Get encryption key from environment or use default (should be in config in production)
	encryptionKey := os.Getenv("ENCRYPTION_KEY")
	if encryptionKey == "" {
		encryptionKey = "default-encryption-key-change-in-production"
		log.Println("WARNING: Using default encryption key. Set ENCRYPTION_KEY environment variable in production!")
	}
	postgresService := services.NewPostgresService(postgresRepo, auditService, encryptionKey)
	vpsService := services.NewVPSService(vpsRepo, auditService, encryptionKey)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(userService)
	dashboardHandler := handlers.NewDashboardHandler(dashboardService)
	backupHandler := handlers.NewBackupHandler(backupService)
	rustfsHandler := handlers.NewRustFSHandler(rustfsService, instanceRepo)
	auditHandler := handlers.NewAuditHandler(auditService)
	postgresHandler := handlers.NewPostgresHandler(postgresService)
	vpsHandler := handlers.NewVPSHandler(vpsService)

	// Setup Gin router
	r := gin.Default()

	// CORS middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://frontend", "http://localhost:3001"},
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
		protected.Use(middleware.AuditMiddleware(auditService))
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

			// Audit routes
			audit := protected.Group("/audit")
			{
				audit.GET("/logs", auditHandler.GetLogs)
				audit.GET("/logs/me", auditHandler.GetUserLogs)
				audit.GET("/stats", auditHandler.GetStats)
			}

			// PostgreSQL routes
			postgres := protected.Group("/postgres")
			{
				postgres.GET("/instances", postgresHandler.GetInstances)
				postgres.POST("/instances", postgresHandler.CreateInstance)
				postgres.GET("/instances/:id", postgresHandler.GetInstance)
				postgres.PUT("/instances/:id", postgresHandler.UpdateInstance)
				postgres.DELETE("/instances/:id", postgresHandler.DeleteInstance)
				postgres.POST("/instances/:id/test", postgresHandler.TestConnection)
			}

			// VPS routes
			vps := protected.Group("/vps")
			{
				vps.GET("/instances", vpsHandler.GetInstances)
				vps.POST("/instances", vpsHandler.CreateInstance)
				vps.GET("/instances/:id", vpsHandler.GetInstance)
				vps.PUT("/instances/:id", vpsHandler.UpdateInstance)
				vps.DELETE("/instances/:id", vpsHandler.DeleteInstance)
				vps.POST("/instances/:id/test", vpsHandler.TestConnection)
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
