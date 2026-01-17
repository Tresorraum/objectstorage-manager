# RustFS Manager Makefile

.PHONY: help build start stop restart logs clean dev test

# Default target
help:
	@echo "RustFS Manager - Available commands:"
	@echo ""
	@echo "  build     - Build all Docker images"
	@echo "  start     - Start all services"
	@echo "  stop      - Stop all services"
	@echo "  restart   - Restart all services"
	@echo "  logs      - View logs from all services"
	@echo "  clean     - Clean up containers and images"
	@echo "  dev       - Start in development mode"
	@echo "  test      - Run tests"
	@echo ""

# Build all images
build:
	@echo "Building RustFS Manager..."
	docker-compose build

# Start all services
start:
	@echo "Starting RustFS Manager..."
	docker-compose up -d
	@echo "Services started!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend API: http://localhost:8080"

# Stop all services
stop:
	@echo "Stopping RustFS Manager..."
	docker-compose down

# Restart all services
restart: stop start

# View logs
logs:
	docker-compose logs -f

# View logs for specific service
logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

logs-db:
	docker-compose logs -f postgres

# Clean up
clean:
	@echo "Cleaning up..."
	docker-compose down -v --rmi all
	docker system prune -f

# Development mode (with hot reload)
dev:
	@echo "Starting in development mode..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Run tests
test:
	@echo "Running backend tests..."
	cd backend && go test ./...
	@echo "Running frontend tests..."
	cd frontend && npm test -- --watchAll=false

# Database operations
db-migrate:
	docker-compose exec backend ./main migrate

db-seed:
	docker-compose exec backend ./main seed

db-reset:
	docker-compose exec postgres psql -U rustfs_user -d rustfs_manager -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
	$(MAKE) db-migrate
	$(MAKE) db-seed

# Backup operations
backup-create:
	@echo "Creating system backup..."
	docker-compose exec backend ./main backup create

backup-restore:
	@echo "Restoring system backup..."
	docker-compose exec backend ./main backup restore $(BACKUP_FILE)

# Health check
health:
	@echo "Checking service health..."
	@curl -s http://localhost:3000/health || echo "Frontend: DOWN"
	@curl -s http://localhost:8080/health || echo "Backend: DOWN"

# Show status
status:
	@echo "Service Status:"
	@docker-compose ps

# Update dependencies
update-deps:
	@echo "Updating backend dependencies..."
	cd backend && go mod tidy && go mod download
	@echo "Updating frontend dependencies..."
	cd frontend && npm update

# Security scan
security-scan:
	@echo "Running security scan..."
	cd backend && go list -json -m all | docker run --rm -i sonatypecommunity/nancy:latest sleuth
	cd frontend && npm audit

# Performance test
perf-test:
	@echo "Running performance tests..."
	# Add your performance testing commands here

# Install development tools
install-tools:
	@echo "Installing development tools..."
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	go install github.com/swaggo/swag/cmd/swag@latest

# Generate API documentation
docs:
	@echo "Generating API documentation..."
	cd backend && swag init

# Lint code
lint:
	@echo "Linting backend code..."
	cd backend && golangci-lint run
	@echo "Linting frontend code..."
	cd frontend && npm run lint

# Format code
format:
	@echo "Formatting backend code..."
	cd backend && go fmt ./...
	@echo "Formatting frontend code..."
	cd frontend && npm run format