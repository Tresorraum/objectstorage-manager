# Deployment Guide

## Quick Deploy to VPS

### 1. On VPS, copy these files:
- `docker-compose.yml`
- `.env`
- `setup-ssl.sh`
- `nginx/` folder

### 2. Configure .env
```bash
nano .env
```

Update:
```env
DOCKER_USERNAME=your-dockerhub-username
DOMAIN=yourdomain.com
EMAIL=your-email@example.com
DB_PASSWORD=strong-password
JWT_SECRET=strong-secret
```

### 3. Deploy without SSL (HTTP only)
```bash
# Start services
docker compose up -d
```

Access:
- Frontend: `http://your-vps-ip:3000`
- Backend: `http://your-vps-ip:8080`

### 4. Deploy with SSL (HTTPS + Nginx)
```bash
# Make sure your domain points to your VPS IP first!
# Then run:
chmod +x setup-ssl.sh
./setup-ssl.sh
```

Access: `https://your-domain.com`

## What setup-ssl.sh does:
1. Installs certbot on VPS (if not installed)
2. Starts nginx with HTTP-only config
3. Requests SSL certificate from Let's Encrypt using certbot
4. Updates nginx config to use HTTPS
5. Redirects HTTP to HTTPS
6. Sets up cron job for auto-renewal

## Manual SSL Setup (if script fails)

```bash
# Install certbot
sudo apt update
sudo apt install -y certbot

# Create webroot directory
sudo mkdir -p /var/www/certbot

# Start services
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d backend frontend nginx

# Get certificate
sudo certbot certonly --webroot \
    --webroot-path=/var/www/certbot \
    --email your-email@example.com \
    --agree-tos \
    -d yourdomain.com

# Update nginx config to use SSL (edit nginx/nginx.conf)
# Then restart nginx
docker compose -f docker-compose.yml -f docker-compose.prod.yml restart nginx

# Setup auto-renewal
echo "0 0,12 * * * certbot renew --quiet --post-hook 'docker restart rustfs-manager-nginx'" | sudo crontab -
```

## Update Application

```bash
docker compose pull
docker compose up -d
```

## View Logs

```bash
docker compose logs -f
docker compose logs -f nginx
docker compose logs -f backend
```
