package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"rukhalt/internal/config"

	"github.com/spf13/cobra"
)

var serveCmd = &cobra.Command{
	Use:   "serve",
	Short: "Start the API server",
	Long: `Start the REST API server with all endpoints.
	
This command starts the HTTP server and listens for incoming requests.
The server includes all REST API endpoints for the Rukhalt backup system.`,
	Example: `  # Start server with default settings
  rukhalt serve
  
  # Start server with custom config
  rukhalt serve --config /path/to/.env
  
  # Start server with custom port
  rukhalt serve --port 9090`,
	RunE: runServe,
}

var (
	port string
)

func init() {
	rootCmd.AddCommand(serveCmd)
	serveCmd.Flags().StringVarP(&port, "port", "p", "", "server port (overrides config)")
}

func runServe(cmd *cobra.Command, args []string) error {
	// Load configuration
	cfg := config.Load()

	// Override port if provided via flag
	if port != "" {
		cfg.Server.Port = port
	}

	log.Printf("🚀 Starting Rukhalt Backup Manager API")
	log.Printf("📍 Version: 1.0.0")
	log.Printf("🌐 Port: %s", cfg.Server.Port)
	log.Printf("🗄️  Database: %s@%s:%d/%s", cfg.Database.User, cfg.Database.Host, cfg.Database.Port, cfg.Database.Name)

	// Create context with cancellation
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	// Run server
	if err := run(ctx, cfg); err != nil {
		log.Printf("❌ Server exited with error: %v", err)
		return err
	}

	log.Println("✅ Server shutdown complete")
	return nil
}
