# Test PostgreSQL Instance Created Successfully ✅

## Instance Details

### Database Information
- **Instance ID**: 8
- **Name**: Test Database
- **Status**: Active ✅
- **Created**: 2026-01-21T13:48:28Z

### Connection Details
- **Host**: rustfs-manager-test-db (Docker network)
- **Port**: 5432 (internal)
- **Database**: testdb
- **Username**: testuser
- **Password**: testpass123
- **SSL**: Disabled
- **PostgreSQL Version**: 15.15

### External Access (from host machine)
- **Host**: localhost
- **Port**: 5000
- **Connection String**: `postgresql://testuser:testpass123@localhost:5000/testdb`

## Container Status
```
Container: rustfs-manager-test-db
Image: postgres:15-alpine
Status: Running
Ports: 0.0.0.0:5000->5432/tcp
Network: rustfs-manager
```

## Available PostgreSQL Instances

You now have 2 PostgreSQL instances:

1. **Test Database** (ID: 8)
   - Host: rustfs-manager-test-db
   - Database: testdb
   - Purpose: Testing restore functionality

2. **local-db** (ID: 2)
   - Host: 72.62.67.228
   - Database: testdemo
   - Purpose: Source database for backups

## Next Steps: Test Restore Functionality

### Step 1: Create a Backup from local-db
```bash
# Via UI:
1. Go to Backups → Advanced Backups tab
2. Select database: local-db
3. Click "Create Backup"
4. Configure:
   - Destination: Object Storage
   - Storage: rustfs.zendevz.com
   - Bucket: testdemo
   - Compression: 5
5. Click "Review & Confirm"
6. Click "Confirm & Start Backup"
7. Wait for completion (green checkmark)
```

### Step 2: Restore to Test Database
```bash
# Via UI:
1. Click the green checkmark icon on completed backup
2. Click "Restore to Database" button
3. In Restore Modal:
   - Source: Already selected (existing backup)
   - Target Database: Select "Test Database"
   - Restore Options:
     ✓ Skip ownership restoration (recommended)
     ☐ Drop existing objects
     ☐ Create database
     ☐ Skip privileges restoration
4. Click "Restore Database"
5. Wait for success message
```

### Step 3: Verify Restore
```bash
# Connect to test database
docker exec -it rustfs-manager-test-db psql -U testuser -d testdb

# List tables
\dt

# Check data
SELECT * FROM your_table LIMIT 10;

# Check table count
SELECT count(*) FROM information_schema.tables 
WHERE table_schema = 'public';

# Exit
\q
```

## Testing Commands

### Check Container Status
```bash
docker ps | grep test-db
```

### Connect to Database
```bash
# From inside container
docker exec -it rustfs-manager-test-db psql -U testuser -d testdb

# From host (if psql installed)
psql -h localhost -p 5000 -U testuser -d testdb
```

### Check Database Size
```bash
docker exec -it rustfs-manager-test-db psql -U testuser -d testdb -c "
SELECT 
    pg_size_pretty(pg_database_size('testdb')) as size;
"
```

### List All Databases
```bash
docker exec -it rustfs-manager-test-db psql -U testuser -d testdb -c "\l"
```

### Check Tables
```bash
docker exec -it rustfs-manager-test-db psql -U testuser -d testdb -c "\dt"
```

## API Testing

### Get Instance Details
```bash
curl -s http://localhost:8080/api/v1/postgres/instances \
  -H "Authorization: Bearer $(cat .token)" | jq '.[] | select(.id == 8)'
```

### Create Backup (API)
```bash
curl -s -X POST http://localhost:8080/api/v1/backups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(cat .token)" \
  -d '{
    "database_id": 2,
    "destination_type": "object_storage",
    "object_storage_instance_id": 1,
    "object_storage_bucket": "testdemo",
    "compression_level": 5
  }' | jq '.'
```

### Restore Backup (API)
```bash
curl -s -X POST http://localhost:8080/api/v1/backups/restore \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(cat .token)" \
  -d '{
    "source_type": "existing_backup",
    "backup_id": "YOUR_BACKUP_ID_HERE",
    "target_database_id": 8,
    "drop_existing": false,
    "create_database": false,
    "no_owner": true,
    "no_privileges": false
  }' | jq '.'
```

## Troubleshooting

### Cannot connect to test database
```bash
# Check if container is running
docker ps | grep test-db

# Check container logs
docker logs rustfs-manager-test-db

# Restart container
docker compose restart postgres-test
```

### Connection refused from backend
```bash
# Verify both containers are on same network
docker network inspect rustfs-manager

# Check if backend can reach test DB
docker exec -it rustfs-manager-api ping rustfs-manager-test-db
```

### Database not found in UI
```bash
# Refresh the page
# Or check API directly
curl -s http://localhost:8080/api/v1/postgres/instances \
  -H "Authorization: Bearer $(cat .token)" | jq '.'
```

## Clean Up (Optional)

### Remove Test Instance from UI
```bash
curl -s -X DELETE http://localhost:8080/api/v1/postgres/instances/8 \
  -H "Authorization: Bearer $(cat .token)"
```

### Stop Test Container
```bash
docker compose stop postgres-test
```

### Remove Test Container and Data
```bash
docker compose down postgres-test -v
```

## Success Criteria ✅

- [x] Test PostgreSQL container running
- [x] Test database instance created in system (ID: 8)
- [x] Instance status: Active
- [x] Connection verified
- [x] PostgreSQL 15.15 confirmed
- [x] Ready for restore testing

## Current System State

### Containers Running
- ✅ rustfs-manager-db (main database)
- ✅ rustfs-manager-api (backend)
- ✅ rustfs-manager-ui (frontend)
- ✅ rustfs-manager-redis (cache)
- ✅ rustfs-manager-test-db (test database) **NEW**

### PostgreSQL Instances
- ✅ local-db (ID: 2) - Source database
- ✅ Test Database (ID: 8) - Target for restore **NEW**

### Object Storage Instances
- ✅ rustfs.zendevz.com - For backup storage

## Ready for Testing! 🚀

You can now:
1. Open the UI at http://localhost:3000
2. Navigate to Backups → Advanced Backups
3. Create a backup from local-db
4. Restore it to Test Database
5. Verify the data in the test database

The complete backup and restore workflow is ready to test!
