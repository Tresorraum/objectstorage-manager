-- RustFS Manager Database Initialization

-- Create database if it doesn't exist
-- (This is handled by the POSTGRES_DB environment variable in docker-compose)

-- Create default admin user (password: admin123)
-- This will be created by the application's auto-migration and seeding

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_backup_jobs_instance_id ON backup_jobs(rustfs_instance_id);
CREATE INDEX IF NOT EXISTS idx_backup_runs_job_id ON backup_runs(backup_job_id);
CREATE INDEX IF NOT EXISTS idx_metrics_instance_id ON metrics(rustfs_instance_id);
CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Insert default configuration values
INSERT INTO configurations (key, value, type, category, created_at, updated_at) VALUES
('backup_retention_default', '30', 'int', 'backup', NOW(), NOW()),
('backup_compression_default', 'gzip', 'string', 'backup', NOW(), NOW()),
('notification_email_enabled', 'false', 'bool', 'notification', NOW(), NOW()),
('system_maintenance_mode', 'false', 'bool', 'system', NOW(), NOW())
ON CONFLICT (key) DO NOTHING;