############################
# Makefile for Rukhalt Server
############################

# --------------------------------------------------
# Load environment variables from .env
# --------------------------------------------------
ifneq (,$(wildcard ./.env))
    include .env
    export
endif

# --------------------------------------------------
# Configuration
# --------------------------------------------------
COMPOSE_FILE     = docker-compose.yml
MIGRATIONS_DIR   = migrations

.DEFAULT_GOAL := help

# --------------------------------------------------
# Help
# --------------------------------------------------
.PHONY: help
help: ## Show this help message
	@echo "╔════════════════════════════════════════════════════════════╗"
	@echo "║           Rukhalt Server - Makefile Commands              ║"
	@echo "╚════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@grep -hE '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
	awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# --------------------------------------------------
# Development
# --------------------------------------------------
.PHONY: dev
dev: ## Start development environment
	docker compose -f $(COMPOSE_FILE) up -d --build
	@echo "✅ Development environment started"
	@echo "📝 API: http://localhost:8080"
	@echo "📋 Health: http://localhost:8080/health"
	@echo "📊 Logs: make logs"

.PHONY: logs
logs: ## Follow application logs
	docker compose -f $(COMPOSE_FILE) logs -f server

.PHONY: dev-down
dev-down: ## Stop development environment
	docker compose -f $(COMPOSE_FILE) down
	@echo "✅ Development environment stopped"

.PHONY: dev-clean
dev-clean: ## Stop and remove all volumes
	docker compose -f $(COMPOSE_FILE) down -v
	@echo "✅ Development environment cleaned"

# --------------------------------------------------
# Database Migrations
# --------------------------------------------------
.PHONY: migrate-up
migrate-up: ## Run migrations
	docker compose -f $(COMPOSE_FILE) exec server goose -dir $(MIGRATIONS_DIR) postgres "host=postgres port=5432 user=$(DB_USER) password=$(DB_PASSWORD) dbname=$(DB_NAME) sslmode=disable" up
	@echo "✅ Migrations applied"

.PHONY: migrate-down
migrate-down: ## Roll back last migration
	docker compose -f $(COMPOSE_FILE) exec server goose -dir $(MIGRATIONS_DIR) postgres "host=postgres port=5432 user=$(DB_USER) password=$(DB_PASSWORD) dbname=$(DB_NAME) sslmode=disable" down
	@echo "✅ Migration rolled back"

.PHONY: migrate-status
migrate-status: ## Show migration status
	docker compose -f $(COMPOSE_FILE) exec server goose -dir $(MIGRATIONS_DIR) postgres "host=postgres port=5432 user=$(DB_USER) password=$(DB_PASSWORD) dbname=$(DB_NAME) sslmode=disable" status

.PHONY: migrate-create
migrate-create: ## Create new migration (usage: make migrate-create NAME=add_feature)
	@if [ -z "$(NAME)" ]; then echo "❌ Usage: make migrate-create NAME=add_feature"; exit 1; fi
	docker compose -f $(COMPOSE_FILE) exec server goose -dir $(MIGRATIONS_DIR) create $(NAME) sql
	@echo "✅ Migration created in $(MIGRATIONS_DIR)/"

.PHONY: migrate-reset
migrate-reset: ## Reset all migrations and re-run
	docker compose -f $(COMPOSE_FILE) exec server goose -dir $(MIGRATIONS_DIR) postgres "host=postgres port=5432 user=$(DB_USER) password=$(DB_PASSWORD) dbname=$(DB_NAME) sslmode=disable" reset
	docker compose -f $(COMPOSE_FILE) exec server goose -dir $(MIGRATIONS_DIR) postgres "host=postgres port=5432 user=$(DB_USER) password=$(DB_PASSWORD) dbname=$(DB_NAME) sslmode=disable" up
	@echo "✅ Migrations reset and reapplied"

# --------------------------------------------------
# Local Development (without Docker)
# --------------------------------------------------
.PHONY: run
run: ## Run server locally
	go run ./cmd serve

.PHONY: build
build: ## Build binary
	go build -o bin/rukhalt ./cmd
	@echo "✅ Binary built: bin/rukhalt"

.PHONY: test
test: ## Run tests
	go test -v ./...

.PHONY: lint
lint: ## Run linter
	golangci-lint run

# --------------------------------------------------
# Database (local)
# --------------------------------------------------
.PHONY: db-shell
db-shell: ## Connect to database shell
	docker compose -f $(COMPOSE_FILE) exec postgres psql -U $(DB_USER) -d $(DB_NAME)

# --------------------------------------------------
# Utilities
# --------------------------------------------------
.PHONY: clean
clean: ## Clean build artifacts
	rm -rf tmp/ bin/
	@echo "✅ Build artifacts cleaned"

.PHONY: deps
deps: ## Download dependencies
	go mod download
	go mod tidy
	@echo "✅ Dependencies updated"
