############################
# Makefile for Rukhalt Full Stack
############################

.DEFAULT_GOAL := help

# --------------------------------------------------
# Help
# --------------------------------------------------
.PHONY: help
help: ## Show this help message
	@echo "╔════════════════════════════════════════════════════════════╗"
	@echo "║         Rukhalt - Full Stack Makefile Commands            ║"
	@echo "╚════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@grep -hE '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
	awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# --------------------------------------------------
# Full Stack
# --------------------------------------------------
.PHONY: up
up: ## Start full stack (server + client + database)
	docker compose up -d --build
	@echo "✅ Full stack started"
	@echo "🌐 Frontend: http://localhost:3000"
	@echo "📡 Backend: http://localhost:8080"
	@echo "💚 Health: http://localhost:8080/health"

.PHONY: down
down: ## Stop full stack
	docker compose down
	@echo "✅ Full stack stopped"

.PHONY: clean
clean: ## Stop and remove all volumes
	docker compose down -v
	@echo "✅ Full stack cleaned"

.PHONY: logs
logs: ## View all logs
	docker compose logs -f

.PHONY: logs-server
logs-server: ## View server logs
	docker compose logs -f server

.PHONY: logs-client
logs-client: ## View client logs
	docker compose logs -f client

.PHONY: restart
restart: ## Restart full stack
	docker compose restart
	@echo "✅ Full stack restarted"

# --------------------------------------------------
# Server
# --------------------------------------------------
.PHONY: server-build
server-build: ## Build server image
	docker compose build server
	@echo "✅ Server image built"

.PHONY: server-shell
server-shell: ## Open shell in server container
	docker compose exec server sh

# --------------------------------------------------
# Client
# --------------------------------------------------
.PHONY: client-build
client-build: ## Build client image
	docker compose build client
	@echo "✅ Client image built"

.PHONY: client-shell
client-shell: ## Open shell in client container
	docker compose exec client sh

# --------------------------------------------------
# Database
# --------------------------------------------------
.PHONY: db-shell
db-shell: ## Connect to database shell
	docker compose exec postgres psql -U rukhalt_user -d rukhalt_db

.PHONY: migrate-up
migrate-up: ## Run database migrations
	docker compose exec server goose -dir migrations postgres "host=postgres port=5432 user=rukhalt_user password=rukhalt_password dbname=rukhalt_db sslmode=disable" up
	@echo "✅ Migrations applied"

.PHONY: migrate-status
migrate-status: ## Show migration status
	docker compose exec server goose -dir migrations postgres "host=postgres port=5432 user=rukhalt_user password=rukhalt_password dbname=rukhalt_db sslmode=disable" status

# --------------------------------------------------
# Production
# --------------------------------------------------
.PHONY: build-prod
build-prod: ## Build production images
	docker build -t rukhalt-server:latest ./server --target prod
	docker build -t rukhalt-client:latest ./client
	@echo "✅ Production images built"

# --------------------------------------------------
# Development
# --------------------------------------------------
.PHONY: dev-server
dev-server: ## Run server locally (without Docker)
	$(MAKE) -C server run

.PHONY: dev-client
dev-client: ## Run client locally (without Docker)
	cd client && npm run dev
