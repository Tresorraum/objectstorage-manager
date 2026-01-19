#!/bin/bash

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Run the migration
echo "Running backup source types migration..."
docker-compose exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB < database/migrations/add_backup_source_types.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
else
    echo "❌ Migration failed!"
    exit 1
fi
