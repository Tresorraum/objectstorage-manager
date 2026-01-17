#!/bin/bash

set -e

echo "🚀 Deploying RustFS Manager..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "❌ Error: .env file not found"
    exit 1
fi

# Check if SSL certificates exist
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    echo "⚠️  No SSL certificate found. Please run ./setup-ssl.sh first"
    exit 1
fi

# Ensure nginx config has SSL
if ! grep -q "listen 443 ssl" nginx/nginx.conf; then
    echo "⚠️  Nginx config missing SSL. Restoring SSL configuration..."
    cat > nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:8080;
    }

    upstream frontend {
        server frontend:80;
    }

    # HTTP - redirect to HTTPS
    server {
        listen 80;
        server_name ${DOMAIN};

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 301 https://$host$request_uri;
        }
    }

    # HTTPS
    server {
        listen 443 ssl;
        server_name ${DOMAIN};

        ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;

        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # Backend API
        location /api/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF
fi

echo "📦 Pulling latest images from Docker Hub..."
docker compose -f docker-compose.prod.yml pull

echo "🛑 Stopping containers..."
docker compose -f docker-compose.prod.yml down

echo "🚀 Starting containers..."
docker compose -f docker-compose.prod.yml up -d

echo "⏳ Waiting for services to be ready..."
sleep 5

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your site: https://$DOMAIN"
echo ""
echo "📊 Check status:"
echo "  docker ps"
echo ""
echo "📝 View logs:"
echo "  docker compose -f docker-compose.prod.yml logs -f"
echo ""
