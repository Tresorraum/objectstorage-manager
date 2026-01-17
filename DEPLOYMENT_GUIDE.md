# RustFS Manager - Deployment Guide

## Quick Deployment Workflow

### On Your Local Machine (Development)

1. **Make code changes**
2. **Build and push images to Docker Hub:**
   ```bash
   # Build images
   docker build -t jsiqbal/rustfs-manager-backend:latest ./backend
   docker build -t jsiqbal/rustfs-manager-frontend:latest ./frontend
   
   # Push to Docker Hub
   docker push jsiqbal/rustfs-manager-backend:latest
   docker push jsiqbal/rustfs-manager-frontend:latest
   ```

### On Your VPS (Production)

3. **Deploy the updates:**
   ```bash
   cd ~/deployments/storage-manager
   ./deploy.sh
   ```

That's it! The `deploy.sh` script handles everything automatically.

---

## Initial Setup (First Time Only)

### 1. Prepare Your VPS

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose v2
sudo apt update
sudo apt install docker-compose-plugin
```

### 2. Clone/Upload Your Project

```bash
mkdir -p ~/deployments
cd ~/deployments
# Upload your project files or clone from git
```

### 3. Configure Environment

```bash
cd ~/deployments/storage-manager

# Create .env file
cp .env.example .env

# Edit .env with your settings
nano .env
```

Required variables:
- `DOMAIN=storage-manager.zendevz.com`
- `EMAIL=your-email@example.com`
- `DB_PASSWORD=your-secure-password`
- `JWT_SECRET=your-jwt-secret`
- `DOCKER_USERNAME=jsiqbal`

### 4. Setup SSL Certificate

```bash
./setup-ssl.sh
```

This script will:
- Check if SSL certificate already exists
- If not, obtain a new certificate from Let's Encrypt
- Configure nginx with HTTPS
- Setup auto-renewal

### 5. Deploy

```bash
./deploy.sh
```

---

## Daily Workflow

### Making Updates

**On Local Machine:**
```bash
# 1. Make your code changes
# 2. Build and push
docker build -t jsiqbal/rustfs-manager-backend:latest ./backend
docker build -t jsiqbal/rustfs-manager-frontend:latest ./frontend
docker push jsiqbal/rustfs-manager-backend:latest
docker push jsiqbal/rustfs-manager-frontend:latest
```

**On VPS:**
```bash
cd ~/deployments/storage-manager
./deploy.sh
```

---

## Troubleshooting

### Site Not Loading

```bash
# Check if containers are running
docker ps

# Check nginx logs
docker logs rustfs-manager-nginx --tail 50

# Check if SSL config is correct
grep "listen 443" nginx/nginx.conf

# If SSL config is missing, run:
./setup-ssl.sh
```

### SSL Certificate Issues

```bash
# Check if certificate exists
sudo ls -la /etc/letsencrypt/live/storage-manager.zendevz.com/

# Renew certificate manually
sudo certbot renew

# Restart nginx
docker restart rustfs-manager-nginx
```

### Database Issues

```bash
# Check database logs
docker logs rustfs-manager-db --tail 50

# Reset database (WARNING: deletes all data)
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up -d
```

### View Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker logs rustfs-manager-api -f
docker logs rustfs-manager-ui -f
docker logs rustfs-manager-nginx -f
```

---

## Useful Commands

```bash
# Stop all services
docker compose -f docker-compose.prod.yml down

# Start all services
docker compose -f docker-compose.prod.yml up -d

# Restart a specific service
docker restart rustfs-manager-nginx

# View container status
docker ps

# Check disk usage
docker system df

# Clean up unused images
docker system prune -a
```

---

## Architecture

```
Internet → Nginx (Port 80/443)
           ↓
           ├→ Frontend Container (React/Vite)
           └→ Backend Container (Go/Gin) → PostgreSQL
                                         → Redis
```

---

## Security Checklist

- ✅ SSL/TLS enabled (HTTPS)
- ✅ Auto-renewal configured
- ✅ Database password set
- ✅ JWT secret configured
- ✅ Firewall rules (AWS Security Groups)
  - Port 80 (HTTP)
  - Port 443 (HTTPS)
  - Port 22 (SSH - restrict to your IP)

---

## Backup Strategy

### Database Backup

```bash
# Manual backup
docker exec rustfs-manager-db pg_dump -U rustfs rustfs_manager > backup_$(date +%Y%m%d).sql

# Restore
docker exec -i rustfs-manager-db psql -U rustfs rustfs_manager < backup_20260117.sql
```

### Automated Backups (Cron)

```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * docker exec rustfs-manager-db pg_dump -U rustfs rustfs_manager > ~/backups/db_$(date +\%Y\%m\%d).sql
```

---

## Monitoring

### Health Checks

```bash
# Backend health
curl http://localhost:8080/health

# Frontend (via nginx)
curl -I https://storage-manager.zendevz.com

# Check SSL certificate expiry
sudo certbot certificates
```

### Resource Usage

```bash
# Container stats
docker stats

# Disk usage
df -h
docker system df
```

---

## Support

For issues or questions:
1. Check logs: `docker compose -f docker-compose.prod.yml logs -f`
2. Verify configuration: `cat .env`
3. Check SSL: `./setup-ssl.sh`
4. Redeploy: `./deploy.sh`
