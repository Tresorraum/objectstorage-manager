# RustFS Manager - Deployment Guide

## Quick Start

### 1. Prerequisites
- Docker and Docker Compose installed
- At least 2GB RAM available
- Ports 3000, 8080, and 5432 available

### 2. Clone and Setup
```bash
git clone <your-repo>
cd rustfs-manager

# Copy environment template
cp .env.example .env

# Edit .env with your settings (optional for testing)
nano .env
```

### 3. Start the Application
```bash
# Using Makefile (recommended)
make start

# Or directly with docker-compose
docker-compose up -d
```

### 4. Access the Application
- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **API Health Check**: http://localhost:8080/health

### 5. First Login
1. Open http://localhost:3000
2. Click "Don't have an account? Sign up"
3. Create your admin account
4. Login with your credentials

## Adding Your First RustFS Instance

1. **Navigate to Instances**
   - Click "Instances" in the sidebar
   - Click "Add Instance"

2. **Configure Connection**
   ```
   Name: My RustFS Server
   Endpoint: your-rustfs-server:9000
   Access Key: your-access-key
   Secret Key: your-secret-key
   Region: us-east-1
   SSL: Enable if using HTTPS
   ```

3. **Test Connection**
   - The system will automatically test the connection
   - Green status means successful connection

## Creating Your First Backup Job

1. **Go to Backups Page**
   - Click "Backups" in the sidebar
   - Click "Create Backup Job"

2. **Configure Backup**
   ```
   Name: Daily Backup
   RustFS Instance: Select your instance
   Source Bucket: bucket-to-backup
   Destination Path: /app/backups/daily
   Schedule: 0 2 * * * (daily at 2 AM)
   Retention Days: 30
   Compression: gzip
   Enabled: ✓
   ```

3. **Run Manual Backup**
   - Click "Run" button to test immediately
   - Check status in the dashboard

## Monitoring

### Dashboard Features
- **Storage Usage Trends**: View storage growth over time
- **System Health**: Monitor application status
- **Recent Backups**: See latest backup job results
- **Active Alerts**: View system notifications

### Logs
```bash
# View all logs
make logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
```

## Development Mode

For development with hot reload:

```bash
# Start development environment
make dev

# Or manually
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

## Production Deployment

### 1. Security Configuration
```bash
# Generate secure JWT secret
openssl rand -base64 32

# Update .env file
JWT_SECRET=your-generated-secret
DB_PASSWORD=secure-database-password
```

### 2. SSL/TLS Setup
```bash
# Option 1: Use reverse proxy (nginx, traefik)
# Option 2: Configure SSL certificates in docker-compose.yml
```

### 3. Backup Strategy
```bash
# Database backups
docker-compose exec postgres pg_dump -U rustfs_user rustfs_manager > backup.sql

# Application backups
docker-compose exec backend ./main backup create
```

## Troubleshooting

### Common Issues

**1. Database Connection Failed**
```bash
# Check database container
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

**2. Frontend Can't Connect to Backend**
```bash
# Check backend is running
curl http://localhost:8080/health

# Check environment variables
docker-compose exec frontend env | grep REACT_APP_API_URL
```

**3. RustFS Connection Failed**
- Verify RustFS server is accessible
- Check firewall rules
- Validate access credentials
- Test with curl or s3cmd

**4. Backup Jobs Failing**
```bash
# Check backup directory permissions
docker-compose exec backend ls -la /app/backups

# Check logs
docker-compose logs backend | grep backup
```

### Health Checks
```bash
# Application health
make health

# Service status
make status

# Database connection
docker-compose exec backend ./main db-check
```

## Scaling

### Horizontal Scaling
```bash
# Scale backend instances
docker-compose up -d --scale backend=3

# Use load balancer (nginx, haproxy)
```

### Database Scaling
- Use PostgreSQL read replicas
- Implement connection pooling
- Consider PostgreSQL clustering

## Backup and Recovery

### Database Backup
```bash
# Create backup
docker-compose exec postgres pg_dump -U rustfs_user rustfs_manager > db_backup.sql

# Restore backup
docker-compose exec -T postgres psql -U rustfs_user rustfs_manager < db_backup.sql
```

### Application Data Backup
```bash
# Backup volumes
docker run --rm -v rustfs-manager_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_data.tar.gz /data
```

## Monitoring and Alerting

### Built-in Monitoring
- Dashboard metrics
- System health checks
- Backup job status
- Storage usage trends

### External Monitoring
- Prometheus metrics (future enhancement)
- Grafana dashboards (future enhancement)
- Log aggregation (ELK stack)

## Support

### Getting Help
1. Check logs: `make logs`
2. Review troubleshooting section
3. Check GitHub issues
4. Create new issue with logs and configuration

### Useful Commands
```bash
# Complete restart
make restart

# Clean rebuild
make clean && make build && make start

# Database reset (development only)
make db-reset

# View configuration
docker-compose config
```

## Next Steps

After successful deployment:

1. **Configure Backup Jobs**: Set up automated backups for your RustFS buckets
2. **Monitor Usage**: Check dashboard regularly for storage trends
3. **Set Up Alerts**: Configure notifications for backup failures
4. **Security Review**: Update default passwords and secrets
5. **Backup Strategy**: Implement regular database and application backups

## Architecture Overview

```
Internet
    │
    ▼
┌─────────────────┐
│   Nginx/LB      │ (Optional)
│   Port 80/443   │
└─────────────────┘
    │
    ▼
┌─────────────────┐    ┌──────────────────┐
│   Frontend      │    │   Backend API    │
│   Port 3000     │◄──►│   Port 8080      │
└─────────────────┘    └──────────────────┘
                              │
                              ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │   PostgreSQL     │    │   RustFS        │
                       │   Port 5432      │    │   Port 9000     │
                       └──────────────────┘    └─────────────────┘
```

The RustFS Manager is now ready for production use!