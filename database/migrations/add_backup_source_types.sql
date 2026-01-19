-- Migration: Add support for PostgreSQL and VPS backup sources
-- Date: 2026-01-20

-- Add new columns to backup_jobs table
ALTER TABLE backup_jobs 
  ADD COLUMN IF NOT EXISTS source_type VARCHAR(50) DEFAULT 'object_storage',
  ADD COLUMN IF NOT EXISTS postgres_instance_id INTEGER REFERENCES postgres_instances(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS vps_instance_id INTEGER REFERENCES vps_instances(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS source_path TEXT;

-- Make rustfs_instance_id nullable since we now have multiple source types
ALTER TABLE backup_jobs 
  ALTER COLUMN rustfs_instance_id DROP NOT NULL;

-- Make source_bucket nullable since VPS and Postgres don't use buckets
ALTER TABLE backup_jobs 
  ALTER COLUMN source_bucket DROP NOT NULL;

-- Update existing records to have source_type = 'object_storage'
UPDATE backup_jobs 
SET source_type = 'object_storage' 
WHERE source_type IS NULL OR source_type = '';

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_backup_jobs_postgres_instance ON backup_jobs(postgres_instance_id);
CREATE INDEX IF NOT EXISTS idx_backup_jobs_vps_instance ON backup_jobs(vps_instance_id);
CREATE INDEX IF NOT EXISTS idx_backup_jobs_source_type ON backup_jobs(source_type);
