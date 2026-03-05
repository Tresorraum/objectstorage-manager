# Rukhalt Server

Backend API server for Rukhalt Backup Management System.

## Features

- 🔐 JWT-based authentication
- 🗄️ PostgreSQL database with migrations
- 📦 Object storage (S3-compatible) backup management
- 🐘 PostgreSQL database backup and restore
- 🖥️ VPS file system backup via SSH/SFTP
- ⏰ Scheduled backup jobs
- 📊 Dashboard with metrics and alerts
- 🔍 Audit logging
- 🔄 Hot reload in development

## Tech Stack

- **Language**: Go 1.23
- **Framework**: Gin
- **Database**: PostgreSQL 15
- **ORM**: GORM
- **Migrations**: Goose
- **CLI**: Cobra
- **Cache**: Redis

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Go 1.23+ (for local development)
- Make (optional, for convenience)

### Development Setup

1. Clone the repository and navigate to server directory:
```bash
cd rukhalt/server
```

2. Copy environment file:
```bash
cp .env.example .env
```

3. Start development environment:
```bash
make dev
```

This will:
- Start PostgreSQL database
- Run migrations automatically
- Start the API server with hot reload
- Start Redis cache
- Start a test PostgreSQL instance

4. Access the API:
- API: http://localhost:8080
- Health Check: http://localhost:8080/health

### Available Commands

```bash
make help              # Show all available commands
make dev               # Start development environment
make logs              # View server logs
make dev-down          # Stop development environment
make dev-clean         # Stop and remove all volumes

# Database Migrations
make migrate-up        # Run pending migrations
make migrate-down      # Rollback last migration
make migrate-status    # Show migration status
make migrate-create NAME=feature_name  # Create new migration
make migrate-reset     # Reset and rerun all migrations

# Local Development (without Docker)
make run               # Run server locally
make build             # Build binary
make test              # Run tests
make deps              # Update dependencies

# Database
make db-shell          # Connect to database shell
```

## Project Structure

```
server/
├── cmd/                    # CLI commands
│   ├── main.go            # Entry point
│   ├── root.go            # Root command
│   ├── serve.go           # Serve command
│   ├── migrate.go         # Migration commands
│   └── server.go          # Server initialization
├── internal/              # Internal packages
│   ├── config/           # Configuration
│   ├── handlers/         # HTTP handlers
│   ├── middleware/       # HTTP middleware
│   ├── models/           # Database models
│   ├── repository/       # Data access layer
│   └── services/         # Business logic
├── migrations/           # Database migrations
├── Dockerfile           # Multi-stage Docker build
├── docker-compose.yml   # Development environment
├── Makefile            # Build automation
└── go.mod              # Go dependencies
```

## CLI Usage

The server includes a CLI for various operations:

```bash
# Start the server
./rukhalt serve

# Run migrations
./rukhalt migrate up
./rukhalt migrate down
./rukhalt migrate status
./rukhalt migrate create add_feature

# Show version
./rukhalt --version

# Show help
./rukhalt --help
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/refresh` - Refresh token

### Dashboard
- `GET /api/v1/dashboard/stats` - Get statistics
- `GET /api/v1/dashboard/metrics` - Get metrics
- `GET /api/v1/dashboard/alerts` - Get alerts

### Backup Jobs
- `GET /api/v1/backup/jobs` - List backup jobs
- `POST /api/v1/backup/jobs` - Create backup job
- `GET /api/v1/backup/jobs/:id` - Get backup job
- `PUT /api/v1/backup/jobs/:id` - Update backup job
- `DELETE /api/v1/backup/jobs/:id` - Delete backup job
- `POST /api/v1/backup/jobs/:id/run` - Run backup job

### PostgreSQL Backups
- `POST /api/v1/backups` - Create backup
- `GET /api/v1/backups` - List backups
- `DELETE /api/v1/backups/:id` - Delete backup
- `POST /api/v1/backups/:id/cancel` - Cancel backup
- `GET /api/v1/backups/:id/file` - Download backup
- `POST /api/v1/backups/restore` - Restore backup

### Instances
- PostgreSQL: `/api/v1/postgres/instances`
- VPS: `/api/v1/vps/instances`
- Object Storage: `/api/v1/rustfs/instances`

### Audit Logs
- `GET /api/v1/audit/logs` - Get audit logs
- `GET /api/v1/audit/logs/me` - Get user's audit logs
- `GET /api/v1/audit/stats` - Get audit statistics

## Environment Variables

See `.env.example` for all available configuration options.

## Database Migrations

Migrations are managed using Goose. Migration files are in `migrations/` directory.

### Creating a Migration

```bash
make migrate-create NAME=add_users_table
```

This creates two files:
- `migrations/YYYYMMDDHHMMSS_add_users_table.sql`

Edit the file to add your SQL:

```sql
-- +goose Up
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username TEXT NOT NULL
);

-- +goose Down
DROP TABLE users;
```

### Running Migrations

```bash
make migrate-up      # Apply pending migrations
make migrate-status  # Check migration status
make migrate-down    # Rollback last migration
```

## Production Deployment

Build production image:

```bash
docker build --target prod -t rukhalt-server:latest .
```

Run with docker-compose (create a separate prod compose file):

```bash
docker compose -f docker-compose.prod.yml up -d
```

## Development

### Hot Reload

The development environment uses Air for hot reload. Any changes to `.go` files will automatically rebuild and restart the server.

### Adding New Features

1. Create migration if database changes are needed
2. Update models in `internal/models/`
3. Add repository methods in `internal/repository/`
4. Implement business logic in `internal/services/`
5. Create handlers in `internal/handlers/`
6. Register routes in `cmd/server.go`

## License

MIT
