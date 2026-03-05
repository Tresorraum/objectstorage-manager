package main

import (
	"fmt"
	"os"
	"os/exec"

	"rukhalt/internal/config"

	"github.com/spf13/cobra"
)

var migrateCmd = &cobra.Command{
	Use:   "migrate",
	Short: "Database migration commands",
	Long:  `Run database migrations using Goose.`,
}

var migrateUpCmd = &cobra.Command{
	Use:   "up",
	Short: "Run all pending migrations",
	RunE:  runMigrateUp,
}

var migrateDownCmd = &cobra.Command{
	Use:   "down",
	Short: "Roll back the last migration",
	RunE:  runMigrateDown,
}

var migrateStatusCmd = &cobra.Command{
	Use:   "status",
	Short: "Show migration status",
	RunE:  runMigrateStatus,
}

var migrateResetCmd = &cobra.Command{
	Use:   "reset",
	Short: "Reset all migrations",
	RunE:  runMigrateReset,
}

var migrateCreateCmd = &cobra.Command{
	Use:   "create [name]",
	Short: "Create a new migration file",
	Args:  cobra.ExactArgs(1),
	RunE:  runMigrateCreate,
}

func init() {
	rootCmd.AddCommand(migrateCmd)
	migrateCmd.AddCommand(migrateUpCmd)
	migrateCmd.AddCommand(migrateDownCmd)
	migrateCmd.AddCommand(migrateStatusCmd)
	migrateCmd.AddCommand(migrateResetCmd)
	migrateCmd.AddCommand(migrateCreateCmd)
}

func getDatabaseURL() (string, error) {
	cfg := config.Load()
	return cfg.Database.ConnectionString(), nil
}

func runGooseCommand(args ...string) error {
	dbURL, err := getDatabaseURL()
	if err != nil {
		return err
	}

	cmdArgs := []string{"-dir", "migrations", "postgres", dbURL}
	cmdArgs = append(cmdArgs, args...)

	cmd := exec.Command("goose", cmdArgs...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}

func runMigrateUp(cmd *cobra.Command, args []string) error {
	fmt.Println("🔄 Running migrations...")
	if err := runGooseCommand("up"); err != nil {
		return fmt.Errorf("migration failed: %w", err)
	}
	fmt.Println("✅ Migrations complete")
	return nil
}

func runMigrateDown(cmd *cobra.Command, args []string) error {
	fmt.Println("⏪ Rolling back last migration...")
	if err := runGooseCommand("down"); err != nil {
		return fmt.Errorf("rollback failed: %w", err)
	}
	fmt.Println("✅ Rollback complete")
	return nil
}

func runMigrateStatus(cmd *cobra.Command, args []string) error {
	return runGooseCommand("status")
}

func runMigrateReset(cmd *cobra.Command, args []string) error {
	fmt.Println("⚠️  Resetting all migrations...")
	if err := runGooseCommand("reset"); err != nil {
		return fmt.Errorf("reset failed: %w", err)
	}
	fmt.Println("✅ Reset complete")
	return nil
}

func runMigrateCreate(cmd *cobra.Command, args []string) error {
	name := args[0]
	fmt.Printf("📝 Creating migration: %s\n", name)
	if err := runGooseCommand("create", name, "sql"); err != nil {
		return fmt.Errorf("create failed: %w", err)
	}
	fmt.Println("✅ Migration file created in migrations/")
	return nil
}
