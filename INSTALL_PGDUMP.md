# Install pg_dump in Docker Container

## Problem
The backend container doesn't have `pg_dump` installed, which is required for PostgreSQL backups.

## Solution
I've updated both Dockerfiles to include `postgresql-client` package which contains `pg_dump`.

## Steps to Fix

### Option 1: Rebuild the Container (Recommended)
```bash
# Stop the containers
docker-compose down

# Rebuild the backend container
docker-compose build backend

# Start everything again
docker-compose up -d
```

### Option 2: Quick Fix (Temporary - until container restarts)
```bash
# Install pg_dump in the running container
docker-compose exec backend apk add --no-cache postgresql-client

# Verify installation
docker-compose exec backend pg_dump --version
```

### Option 3: Rebuild from Scratch
```bash
# Stop and remove everything
docker-compose down -v

# Rebuild all containers
docker-compose build --no-cache

# Start everything
docker-compose up -d
```

## Verify Installation
After rebuilding, verify pg_dump is installed:
```bash
docker-compose exec backend pg_dump --version
```

You should see output like:
```
pg_dump (PostgreSQL) 15.x
```

## Files Updated
- `backend/Dockerfile.dev` - Added `postgresql-client` to dependencies
- `backend/Dockerfile` - Added `postgresql-client` to final stage

## After Installation
Once pg_dump is installed, the PostgreSQL backup feature will work:
1. Go to Backups page
2. Click PostgreSQL tab
3. Click "Create Backup" on any PostgreSQL instance
4. Choose "Local Download"
5. SQL dump will download to your browser

## Note
The container needs to be rebuilt only once. After that, pg_dump will be available in all future container starts.
