.PHONY: dev dev-build dev-stop dev-reset prod-build prod-push setup-ssl

# Development - build and run locally
dev-build:
	@echo "Building for local development..."
	docker compose build

dev:
	@echo "Starting local development..."
	docker compose up -d

dev-stop:
	@echo "Stopping local development..."
	docker compose down

dev-reset:
	@echo "Resetting development environment (removes all data)..."
	docker compose down -v
	docker compose up -d

# Production - build and push to Docker Hub (multi-platform)
prod-build:
	@echo "Building production images for multiple platforms..."
	@. ./.env && \
	docker buildx build --platform linux/amd64,linux/arm64 -t $$DOCKER_USERNAME/rustfs-manager-backend:latest ./backend --push && \
	docker buildx build --platform linux/amd64,linux/arm64 --build-arg VITE_API_URL=https://storage-manager.zendevz.com/api/v1 -t $$DOCKER_USERNAME/rustfs-manager-frontend:latest ./frontend --push
	@echo "Build and push complete!"

prod-push:
	@echo "Images are already pushed during build with buildx"
	@echo "If you need to push again, run 'make prod-build'"

# SSL Setup
setup-ssl:
	@echo "Setting up SSL with Let's Encrypt..."
	@./setup-ssl.sh
