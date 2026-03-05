-- +goose Up
-- Initial database schema for Rukhalt Backup Manager
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    is_premium BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);

-- RustFS (Object Storage) Instances table
CREATE TABLE IF NOT EXISTS rust_fs_instances (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    access_key TEXT NOT NULL,
    secret_key TEXT NOT NULL,
    region TEXT DEFAULT 'us-east-1',
    ssl BOOLEAN DEFAULT true,
    description TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_rust_fs_instances_user_id ON rust_fs_instances(user_id);
CREATE INDEX idx_rust_fs_instances_deleted_at ON rust_fs_instances(deleted_at);

-- PostgreSQL Instances table
CREATE TABLE IF NOT EXISTS postgres_instances (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    host TEXT NOT NULL,
    port BIGINT DEFAULT 5432,
    database TEXT NOT NULL,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    ssl BOOLEAN DEFAULT false,
    description TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_postgres_instances_user_id ON postgres_instances(user_id);
CREATE INDEX idx_postgres_instances_deleted_at ON postgres_instances(deleted_at);

-- VPS Instances table
CREATE TABLE IF NOT EXISTS vps_instances (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    host TEXT NOT NULL,
    port BIGINT DEFAULT 22,
    username TEXT NOT NULL,
    auth_type TEXT DEFAULT 'password',
    password TEXT,
    ssh_key TEXT,
    backup_path TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_vps_instances_user_id ON vps_instances(user_id);
CREATE INDEX idx_vps_instances_deleted_at ON vps_instances(deleted_at);

-- Backup Jobs table (Scheduled backups)
CREATE TABLE IF NOT EXISTS backup_jobs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    source_type TEXT DEFAULT 'object_storage',
    rust_fs_instance_id BIGINT REFERENCES rust_fs_instances(id) ON DELETE SET NULL,
    postgres_instance_id BIGINT REFERENCES postgres_instances(id) ON DELETE SET NULL,
    vps_instance_id BIGINT REFERENCES vps_instances(id) ON DELETE SET NULL,
    source_bucket TEXT,
    source_path TEXT,
    backup_type TEXT DEFAULT 'server',
    destination_path TEXT,
    destination_instance_id BIGINT REFERENCES rust_fs_instances(id) ON DELETE SET NULL,
    destination_bucket TEXT,
    schedule TEXT,
    enabled BOOLEAN DEFAULT true,
    retention_days BIGINT DEFAULT 30,
    compression BOOLEAN DEFAULT true,
    encryption BOOLEAN DEFAULT false,
    last_run_at TIMESTAMP WITH TIME ZONE,
    next_run_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_backup_jobs_user_id ON backup_jobs(user_id);
CREATE INDEX idx_backup_jobs_deleted_at ON backup_jobs(deleted_at);
CREATE INDEX idx_backup_jobs_next_run_at ON backup_jobs(next_run_at);

-- Backup Runs table (Execution history)
CREATE TABLE IF NOT EXISTS backup_runs (
    id BIGSERIAL PRIMARY KEY,
    job_id BIGINT NOT NULL REFERENCES backup_jobs(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration BIGINT,
    size_bytes BIGINT,
    files_count BIGINT,
    error_message TEXT,
    backup_path TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_backup_runs_job_id ON backup_runs(job_id);
CREATE INDEX idx_backup_runs_status ON backup_runs(status);
CREATE INDEX idx_backup_runs_started_at ON backup_runs(started_at);
CREATE INDEX idx_backup_runs_deleted_at ON backup_runs(deleted_at);

-- Metrics table
CREATE TABLE IF NOT EXISTS metrics (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    unit TEXT,
    tags JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_metrics_user_id ON metrics(user_id);
CREATE INDEX idx_metrics_type ON metrics(metric_type);
CREATE INDEX idx_metrics_timestamp ON metrics(timestamp);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    severity TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    alert_type TEXT NOT NULL,
    source TEXT,
    acknowledged BOOLEAN DEFAULT false,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_acknowledged ON alerts(acknowledged);
CREATE INDEX idx_alerts_resolved ON alerts(resolved);
CREATE INDEX idx_alerts_deleted_at ON alerts(deleted_at);

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    status TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Configurations table
CREATE TABLE IF NOT EXISTS configurations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, key)
);

CREATE INDEX idx_configurations_user_id ON configurations(user_id);
CREATE INDEX idx_configurations_key ON configurations(key);
CREATE INDEX idx_configurations_deleted_at ON configurations(deleted_at);

-- +goose Down
DROP TABLE IF EXISTS configurations;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS alerts;
DROP TABLE IF EXISTS metrics;
DROP TABLE IF EXISTS backup_runs;
DROP TABLE IF EXISTS backup_jobs;
DROP TABLE IF EXISTS vps_instances;
DROP TABLE IF EXISTS postgres_instances;
DROP TABLE IF EXISTS rust_fs_instances;
DROP TABLE IF EXISTS users;
DROP EXTENSION IF EXISTS "uuid-ossp";
