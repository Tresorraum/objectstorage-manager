-- Create backups table
CREATE TABLE IF NOT EXISTS backups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    database_id INTEGER NOT NULL REFERENCES postgres_instances(id) ON DELETE CASCADE,
    storage_id INTEGER REFERENCES rustfs_instances(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
    fail_message TEXT,
    backup_size_mb DECIMAL(10,2) DEFAULT 0,
    backup_duration_ms BIGINT DEFAULT 0,
    encryption_salt TEXT,
    encryption_iv TEXT,
    encryption VARCHAR(20) NOT NULL DEFAULT 'NONE',
    destination_type VARCHAR(50),
    destination_path TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_backups_user_id ON backups(user_id);
CREATE INDEX IF NOT EXISTS idx_backups_database_id ON backups(database_id);
CREATE INDEX IF NOT EXISTS idx_backups_status ON backups(status);
CREATE INDEX IF NOT EXISTS idx_backups_created_at ON backups(created_at DESC);

-- Add comments
COMMENT ON TABLE backups IS 'PostgreSQL database backups';
COMMENT ON COLUMN backups.status IS 'Backup status: IN_PROGRESS, COMPLETED, FAILED, CANCELED';
COMMENT ON COLUMN backups.encryption IS 'Encryption status: NONE, ENCRYPTED';
COMMENT ON COLUMN backups.destination_type IS 'Backup destination: local, vps, object_storage';
