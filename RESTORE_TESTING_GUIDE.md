# PostgreSQL Backup & Restore Testing Guide

## Overview
Complete implementation of PostgreSQL backup and restore functionality with a test database for verification.

## What's Been Implemented

### Backend (Go)
1. **Restore Service** (`postgres_backup_service.go`)
   - `RestoreBackup()` - Main restore function supporting multiple sources
   - `executePgRestore()` - Executes pg_restore command with options
   - `downloadFromObjectStorage()` - Downloads backup from S3/MinIO
   - `downloadFromVPS()` - Downloads backup from VPS server
   - Support for restore options: --clean, --create, --no-owner, --no-privileges

2. **Restore Handler** (`postgres_backup_new_handler.go`)
   - `RestoreBackup()` endpoint at `POST /api/v1/backups/restore`
   - Validates user permissions and request data
   - Returns success/error messages

3. **Restore DTO** (`backup_dto.go`)
   - `RestoreBackupRequest` with all restore options
   - Support for 4 source types:
     - `existing_backup` - From existing backup record
     - `object_storage` - From S3/MinIO
     - `vps` - From VPS server
     - `local_file` - Upload from local computer

### Frontend (React/TypeScript)
1. **RestoreBackupModal Component**
   - Source selection (existing backup, S3, VPS, local file)
   - Target database selection
   - Restore options configuration
   - File upload support for local files
   - Progress indication and error handling

2. **Integration**
   - Restore button in BackupsList component
   - Quick restore action in success modal
   - Full restore workflow with confirmation

## Test PostgreSQL Database

### Connection Details
- **Host**: localhost
- **Port**: 5000 (mapped to container's 5432)
- **Database**: testdb
- **Username**: testuser
- **Password**: testpass123
- **Container**: rustfs-manager-test-db

### Starting the Test Database
```bash
docker compose up -d postgres-test
```

### Stopping the Test Database
```bash
docker compose stop postgres-test
```

### Connecting to Test Database
```bash
# Using psql
docker exec -it rustfs-manager-test-db psql -U testuser -d testdb

# Or from host (if psql installed)
psql -h localhost -p 5000 -U testuser -d testdb
```

## Testing Workflow

### Step 1: Add Test Database to UI
1. Navigate to **Instances** page
2. Click **Add PostgreSQL Instance**
3. Fill in the form:
   - Name: `Test Database`
   - Host: `rustfs-manager-test-db` (or `localhost` if accessing from host)
   - Port: `5432` (internal) or `5000` (from host)
   - Database: `testdb`
   - Username: `testuser`
   - Password: `testpass123`
4. Click **Add Instance**

### Step 2: Create a Backup
1. Navigate to **Backups** → **Advanced Backups** tab
2. Select your source database (e.g., `local-db`)
3. Click **Create Backup**
4. Configure backup:
   - Destination: Object Storage (rustfs.zendevz.com)
   - Bucket: `testdemo` (or your bucket name)
   - Compression Level: 5
5. Click **Review & Confirm**
6. Click **Confirm & Start Backup**
7. Wait for backup to complete (green checkmark)

### Step 3: Restore to Test Database
1. Click the green checkmark icon on completed backup
2. In the success modal, click **Restore to Database**
3. Or click the restore icon (↻) directly in the backup list
4. In the Restore Modal:
   - Source: Already selected (existing backup)
   - Target Database: Select `Test Database`
   - Restore Options:
     - ✓ Skip ownership restoration (recommended)
     - ☐ Drop existing objects (optional)
     - ☐ Create database (optional)
     - ☐ Skip privileges restoration (optional)
5. Click **Restore Database**
6. Wait for success message

### Step 4: Verify Restore
```bash
# Connect to test database
docker exec -it rustfs-manager-test-db psql -U testuser -d testdb

# List tables
\dt

# Check data
SELECT * FROM your_table LIMIT 10;

# Exit
\q
```

## Restore Source Options

### 1. Existing Backup
- Restore from a backup already in the system
- Fastest option (no download needed if local)
- Automatically selected when clicking restore from backup list

### 2. Object Storage (S3/MinIO)
- Restore from S3-compatible storage
- Requires:
  - Storage instance selection
  - Bucket name
  - Object key/path
- Downloads backup file temporarily

### 3. VPS Server
- Restore from backup file on VPS
- Requires:
  - VPS instance selection
  - Full file path on VPS
- Downloads via SCP

### 4. Local File Upload
- Upload backup file from your computer
- Supports .dump, .sql, .backup formats
- Shows file size before upload

## Restore Options Explained

### Drop Existing Objects (--clean)
- Drops database objects before recreating them
- Use when restoring to a database with existing data
- **Warning**: This will delete existing data

### Create Database (--create)
- Creates the database before restoring
- Use when restoring to a non-existent database
- Requires superuser privileges

### Skip Ownership Restoration (--no-owner)
- Does not restore object ownership
- **Recommended**: Prevents permission issues
- Objects will be owned by the restoring user

### Skip Privileges Restoration (--no-privileges)
- Does not restore access privileges (GRANT/REVOKE)
- Use when you want to set permissions manually
- Useful for cross-environment restores

## Troubleshooting

### "Target database not found"
- Ensure the PostgreSQL instance is added in the Instances page
- Verify the instance is active (green checkmark)

### "Failed to decrypt password"
- Check ENCRYPTION_KEY in .env matches the key used to encrypt passwords
- Current key: `default-encryption-key-change-i` (32 chars)

### "pg_restore failed"
- Check PostgreSQL version compatibility
- Verify backup file format (should be custom format from pg_dump -Fc)
- Check target database permissions

### "Failed to download from object storage"
- Verify storage instance credentials
- Check bucket name and object key
- Ensure network connectivity

### Connection refused to test database
- Verify container is running: `docker ps | grep test-db`
- Check port mapping: Should show `0.0.0.0:5000->5432/tcp`
- Try restarting: `docker compose restart postgres-test`

## API Endpoints

### Create Backup
```
POST /api/v1/backups
Content-Type: application/json

{
  "database_id": 1,
  "destination_type": "object_storage",
  "object_storage_instance_id": 1,
  "object_storage_bucket": "testdemo",
  "compression_level": 5
}
```

### Restore Backup
```
POST /api/v1/backups/restore
Content-Type: application/json

{
  "source_type": "existing_backup",
  "backup_id": "uuid-here",
  "target_database_id": 2,
  "drop_existing": false,
  "create_database": false,
  "no_owner": true,
  "no_privileges": false
}
```

### List Backups
```
GET /api/v1/backups?database_id=1&limit=10&offset=0
```

## Next Steps

1. ✅ Backend restore implementation complete
2. ✅ Frontend restore UI complete
3. ✅ Test PostgreSQL container running
4. 🔄 **Current**: Add test database to UI and test restore
5. ⏭️ Add restore progress tracking
6. ⏭️ Add restore history/audit logs
7. ⏭️ Implement scheduled restores
8. ⏭️ Add restore validation/verification

## Notes

- Encryption has been removed from the system as requested
- Backups use pg_dump custom format (-Fc) with gzip compression
- Restore uses pg_restore with configurable options
- All operations are authenticated and user-scoped
- Temporary files are automatically cleaned up after restore
