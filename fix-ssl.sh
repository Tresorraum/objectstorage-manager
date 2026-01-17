#!/bin/bash

# Quick fix script to restore SSL configuration
# Run this on your VPS if the site goes down after deployment

set -e

echo "🔧 Fixing SSL configuration..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "❌ Error: .env file not found"
    exit 1
fi

# Check if SSL certificate exists
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    echo "❌ No SSL certificate found for $DOMAIN"
    echo "Please run: ./setup-ssl.sh"
    exit 1
fi

echo "✅ SSL certificate found"

# Restore SSL nginx configuration
echo "📝 Restoring nginx SSL configuration..."
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

echo "🔄 Restarting nginx..."
docker compose -f docker-compose.prod.yml restart nginx

echo "⏳ Waiting for nginx to start..."
sleep 3

echo ""
echo "✅ SSL configuration restored!"
echo ""
echo "Testing connection..."
if curl -I -s https://$DOMAIN | grep -q "200 OK"; then
    echo "✅ Site is UP: https://$DOMAIN"
else
    echo "⚠️  Site may still be starting up. Check logs:"
    echo "   docker logs rustfs-manager-nginx"
fi
echo ""
