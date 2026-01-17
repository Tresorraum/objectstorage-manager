#!/bin/bash

set -e

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "Error: .env file not found"
    exit 1
fi

# Check if domain is set
if [ -z "$DOMAIN" ] || [ "$DOMAIN" = "yourdomain.com" ]; then
    echo "Error: Please set DOMAIN in .env file"
    exit 1
fi

if [ -z "$EMAIL" ] || [ "$EMAIL" = "your-email@example.com" ]; then
    echo "Error: Please set EMAIL in .env file"
    exit 1
fi

echo "Setting up SSL for domain: $DOMAIN"

# Check if SSL certificate already exists
if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    echo "✅ SSL certificate already exists for $DOMAIN"
    echo "Ensuring nginx is configured with SSL..."
    
    # Make sure we have the SSL nginx config
    if ! grep -q "listen 443 ssl" nginx/nginx.conf; then
        echo "Updating nginx config to use SSL..."
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
    
    # Restart nginx to apply config
    echo "Restarting nginx..."
    docker compose -f docker-compose.prod.yml restart nginx
    
    echo ""
    echo "✅ SSL configuration restored!"
    echo "Your site is now available at: https://$DOMAIN"
    exit 0
fi

# If we get here, we need to obtain a new certificate
echo "No existing certificate found. Setting up new SSL certificate..."

# Install certbot if not installed
if ! command -v certbot &> /dev/null; then
    echo "Installing certbot..."
    sudo apt update
    sudo apt install -y certbot
fi

# Create directories
sudo mkdir -p /var/www/certbot
mkdir -p nginx

# Backup current nginx config if it exists
if [ -f nginx/nginx.conf ]; then
    cp nginx/nginx.conf nginx/nginx.conf.backup
fi

# Copy initial nginx config (HTTP only for certbot challenge)
cp nginx/nginx-initial.conf nginx/nginx.conf

# Start services with initial config
echo "Starting services..."
docker compose -f docker-compose.prod.yml up -d backend frontend nginx

# Wait for nginx to be ready
echo "Waiting for nginx to start..."
sleep 5

# Get SSL certificate
echo "Requesting SSL certificate from Let's Encrypt..."
sudo certbot certonly --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN

# Check if certificate was obtained
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    echo "Error: Failed to obtain SSL certificate"
    # Restore backup if it exists
    if [ -f nginx/nginx.conf.backup ]; then
        mv nginx/nginx.conf.backup nginx/nginx.conf
    fi
    exit 1
fi

echo "SSL certificate obtained successfully!"

# Create final nginx config with SSL
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

# Reload nginx with SSL config
echo "Reloading nginx with SSL configuration..."
docker compose -f docker-compose.prod.yml restart nginx

# Setup auto-renewal cron job
echo "Setting up auto-renewal..."
CRON_CMD="0 0,12 * * * certbot renew --quiet --post-hook 'docker restart rustfs-manager-nginx'"
(sudo crontab -l 2>/dev/null | grep -v "certbot renew"; echo "$CRON_CMD") | sudo crontab -

echo ""
echo "✅ SSL setup complete!"
echo "Your site is now available at: https://$DOMAIN"
echo ""
echo "Certificate will auto-renew twice daily via cron"
