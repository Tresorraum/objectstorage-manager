.PHONY: dev dev-build dev-stop prod-build prod-push setup-ssl

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

# Production - build and push to Docker Hub
prod-build:
	@echo "Building production images..."
	@. ./.env && \
	docker build -t $$DOCKER_USERNAME/rustfs-manager-backend:latest ./backend && \
	docker build --build-arg VITE_API_URL=https://storage-manager.zendevz.com/api/v1 -t $$DOCKER_USERNAME/rustfs-manager-frontend:latest ./frontend
	@echo "Build complete!"

prod-push:
	@echo "Pushing images to Docker Hub..."
	@. ./.env && \
	docker push $$DOCKER_USERNAME/rustfs-manager-backend:latest && \
	docker push $$DOCKER_USERNAME/rustfs-manager-frontend:latest
	@echo "Push complete!"

# SSL Setup
setup-ssl:
	@echo "Setting up SSL with Let's Encrypt..."
	@./setup-ssl.sh
