# Backup System User Guide

## Overview
The RustFS Manager backup system now supports flexible bucket-to-bucket backups with compression control and custom path organization.

## Backup Types

### 1. Server Storage Backup (Premium Feature)
- Stores backups as compressed archives on the server filesystem
- Always creates `.tar.gz` files
- Best for: Long-term archival, disaster recovery

### 2. Bucket-to-Bucket Backup (Free & Premium)
- Copies data between object storage instances
- Two modes: Compressed or Uncompressed
- Best for: Replication, cross-region backups, data migration

## Bucket Backup Modes

### Compressed Archive Mode (Recommended)
**What it does:**
- Creates a single `.tar.gz` archive containing all objects from the source bucket
- Uploads the archive to the destination bucket

**Advantages:**
- ✅ Saves storage space (compression)
- ✅ Single file for easy management
- ✅ Faster downloads (one file vs many)
- ✅ Atomic backup (all or nothing)

**Best for:**
- Long-term backups
- Disaster recovery
- Archival purposes
- Bandwidth-limited environments

**Example Result:**
```
Destination Bucket: backups
Path: production/daily
Result: backups/production/daily/20240119_120000/mybucket_20240119_120000.tar.gz
```

### Direct Copy Mode (Uncompressed)
**What it does:**
- Copies each object individually to the destination bucket
- Preserves original file structure

**Advantages:**
- ✅ No decompression needed
- ✅ Faster for selective restores
- ✅ Can access individual files immediately
- ✅ Better for incremental syncing

**Best for:**
- Active replication
- Quick access to specific files
- Cross-region data distribution
- Development/staging environments

**Example Result:**
```
Destination Bucket: backups
Path: production/daily
Result: 
  - backups/production/daily/20240119_120000/file1.txt
  - backups/production/daily/20240119_120000/folder/file2.txt
  - backups/production/daily/20240119_120000/data.json
```

## Creating a Backup Job

### Step 1: Basic Information
1. Navigate to **Backups** page
2. Click **Create Backup Job**
3. Enter:
   - **Job Name**: Descriptive name (e.g., "Production Daily Backup")
   - **Source Instance**: Select your RustFS instance
   - **Source Bucket**: Bucket name to backup

### Step 2: Choose Backup Type
Select between:
- **Server Storage**: Compressed archives on server (Premium only)
- **Object Storage**: Bucket-to-bucket backup (All users)

### Step 3: Configure Destination (for Bucket Backups)

#### Destination Instance & Bucket
- **Destination Instance**: Where to store backups
- **Destination Bucket**: Bucket name (created automatically if doesn't exist)

#### Backup Format
Choose your format:

**Compressed Archive:**
- Single `.tar.gz` file
- Space-efficient
- Best for archival

**Direct Copy:**
- Individual files
- Immediate access
- Best for replication

#### Destination Path (Optional)
Organize your backups with custom paths:

**Examples:**
- `production/daily` → Organized by environment and frequency
- `backups/2024/january` → Organized by date
- `critical-data` → Organized by importance
- Leave empty → Uses timestamp only

**Path Structure:**
```
{destination_bucket}/{your_path}/{timestamp}/{files or archive}
```

#### Compression Algorithm (Compressed Mode Only)
- **Gzip (Recommended)**: Good compression, fast
- **None (Tar only)**: No compression, faster for already-compressed data

### Step 4: Schedule & Retention
- **Schedule**: Cron expression for automatic backups
  - `0 2 * * *` - Daily at 2 AM
  - `0 */6 * * *` - Every 6 hours
  - `0 0 * * 0` - Weekly on Sunday
  - Leave empty for manual-only
- **Retention Days**: How long to keep backups (30 days default)

### Step 5: Enable & Create
- Check **Enable this backup job** to activate
- Click **Create Backup Job**

## Running Backups

### Manual Execution
1. Go to **Backups** page
2. Find your backup job
3. Click the **Play** button
4. Monitor status in real-time

### Automatic Execution
- Backups run automatically based on schedule
- Check **Last Run** column for execution history
- View **Status** for current state

## Monitoring Backups

### Backup Status
- **Pending**: Not yet run
- **Running**: Currently executing (animated indicator)
- **Completed**: Successfully finished
- **Failed**: Error occurred (check error message)

### Viewing History
1. Click **History** button on any backup job
2. See all backup runs with:
   - Execution time
   - Files count
   - Total size
   - Duration
   - Archive path
   - Error messages (if failed)

## Best Practices

### For Production Data
✅ Use **Compressed Archive** mode
✅ Set custom path: `production/daily`
✅ Schedule: Daily at off-peak hours
✅ Retention: 30+ days
✅ Test restores regularly

### For Development/Staging
✅ Use **Direct Copy** mode for quick access
✅ Set custom path: `staging/sync`
✅ Schedule: As needed or manual
✅ Retention: 7-14 days

### For Disaster Recovery
✅ Use **Compressed Archive** mode
✅ Store in different region/instance
✅ Set custom path: `dr/critical`
✅ Schedule: Multiple times daily
✅ Retention: 90+ days
✅ Verify backups regularly

### Path Organization Tips
```
# By Environment
production/daily
staging/weekly
development/manual

# By Date
backups/2024/01
archives/2024-Q1

# By Importance
critical/hourly
important/daily
standard/weekly

# By Application
app1/production
app2/staging
database/daily
```

## Troubleshooting

### Backup Failed
**Check:**
1. Source bucket exists and has objects
2. Credentials are correct
3. Network connectivity between instances
4. Destination bucket permissions
5. Error message in backup history

### Slow Backups
**Solutions:**
- Use **Compressed Archive** for fewer network requests
- Schedule during off-peak hours
- Check network bandwidth
- Consider source bucket size

### Storage Space Issues
**Solutions:**
- Use **Compressed Archive** mode (saves 50-70% space)
- Reduce retention days
- Delete old backups manually
- Use separate destination instance with more storage

## API Examples

### Create Compressed Bucket Backup
```bash
curl -X POST http://localhost:8080/api/v1/backup/jobs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production Compressed Backup",
    "rustfs_instance_id": 1,
    "source_bucket": "production-data",
    "backup_type": "bucket",
    "destination_instance_id": 2,
    "destination_bucket": "backups",
    "destination_path": "prod/daily",
    "compression_enabled": true,
    "compression_type": "gzip",
    "schedule": "0 2 * * *",
    "enabled": true,
    "retention_days": 30
  }'
```

### Create Uncompressed Bucket Backup
```bash
curl -X POST http://localhost:8080/api/v1/backup/jobs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Staging Sync",
    "rustfs_instance_id": 1,
    "source_bucket": "staging-data",
    "backup_type": "bucket",
    "destination_instance_id": 2,
    "destination_bucket": "staging-backup",
    "destination_path": "sync",
    "compression_enabled": false,
    "schedule": "0 */6 * * *",
    "enabled": true,
    "retention_days": 7
  }'
```

### Run Backup Manually
```bash
curl -X POST http://localhost:8080/api/v1/backup/jobs/1/run \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Support

For issues or questions:
1. Check backup history for error messages
2. Review this guide
3. Check system logs
4. Contact support with backup job ID and error details
