package main

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "rukhalt",
	Short: "Rukhalt - Backup Management System",
	Long: `Rukhalt Backup Manager
	
A comprehensive backup management system for PostgreSQL databases, 
VPS instances, and object storage with automated scheduling and monitoring.`,
	Version: "1.0.0",
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

func init() {
	// Global flags
	rootCmd.PersistentFlags().StringP("config", "c", ".env", "config file path")
}
