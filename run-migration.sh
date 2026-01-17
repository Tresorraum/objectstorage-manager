#!/bin/bash

# Run database migration
# This script applies the migration to add user_id fields

echo "Running database migration..."

# Get database connection details from environment or use defaults
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-rustfs_manager}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-postgres}

# Run the migration
docker exec -i rustfs-manager-db psql -U "$DB_USER" -d "$DB_NAME" < database/migrations/001_add_user_fields.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
else
    echo "❌ Migration failed!"
    exit 1
fi
