# RustFS Manager

A comprehensive management dashboard for RustFS with backup, restore, monitoring, and administration features.

## Features

- 📊 **Real-time Dashboard** - Monitor storage usage, performance metrics, and system health
- 💾 **Backup & Restore** - Automated backup scheduling and restore operations with compression
- 📈 **Analytics** - Usage statistics, performance graphs, and storage trends
- 🔧 **Instance Management** - Manage multiple RustFS deployments with connection testing
- 👥 **User Management** - Authentication, authorization, and user roles
- 🚨 **Alerting** - System alerts and notifications for issues
- 📋 **Audit Logs** - Track all operations and changes
- 🔄 **Multi-Instance** - Manage multiple RustFS deployments from one dashboard

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React UI      │◄──►│   Go Backend     │◄──►│   RustFS API    │
│   (Frontend)    │    │   (API Server)   │    │   (Storage)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌────────▼────────┐             │
         │              │   PostgreSQL    │             │
         │              │   (Metadata)    │             │
         │              └─────────────────┘             │
         │                                              │
         └──────────────────────────────────────────────┘
                        Docker Network
```

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd rustfs-manager
   ```

2. **Start the application**
   ```bash
   # Production mode
   make start
   
   # Or manually
   docker-compose up -d
   ```

3. **Access the dashboard**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - Database: localhost:5432

4. **Default Login**
   - Create an account through the registration form
   - First user will have admin privileges

### Development Setup

1. **Start in development mode**
   ```bash
   make dev
   ```

2. **Or manually with hot reload**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
   ```

## Usage

### Managing RustFS Instances

1. **Add Instance**
   - Go to "Instances" page
   - Click "Add Instance"
   - Fill in RustFS connection details:
     - Name: Friendly name for the instance
     - Endpoint: RustFS server URL (e.g., `localhost:9000`)
     - Access Key: S3-compatible access key
     - Secret Key: S3-compatible secret key
     - Region: AWS region (default: us-east-1)
     - SSL: Enable/disable SSL connection

2. **Test Connection**
   - The system automatically tests connections when adding/updating instances
   - Green status indicates successful connection

### Creating Backup Jobs

1. **Navigate to Backups**
   - Go to "Backups" page
   - Click "Create Backup Job"

2. **Configure Backup**
   - Name: Descriptive name for the backup job
   - RustFS Instance: Select target instance
   - Source Bucket: Bucket to backup
   - Destination Path: Local path for backup storage
   - Schedule: Cron expression for automated backups (optional)
   - Retention: Number of days to keep backups
   - Compression: Enable gzip compression

3. **Run Backup**
   - Manual: Click "Run" button on any backup job
   - Automatic: Jobs with schedules run automatically

### Monitoring and Dashboard

- **Storage Usage**: View storage trends over time
- **System Health**: Monitor system status and performance
- **Recent Activity**: See latest backup jobs and their status
- **Alerts**: View system alerts and notifications

## API Documentation

The backend provides a RESTful API with the following endpoints:

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/refresh` - Refresh JWT token

### Dashboard
- `GET /api/v1/dashboard/stats` - Get dashboard statistics
- `GET /api/v1/dashboard/metrics` - Get system metrics
- `GET /api/v1/dashboard/alerts` - Get recent alerts

### RustFS Instances
- `GET /api/v1/rustfs/instances` - List all instances
- `POST /api/v1/rustfs/instances` - Create new instance
- `GET /api/v1/rustfs/instances/:id` - Get instance details
- `PUT /api/v1/rustfs/instances/:id` - Update instance
- `DELETE /api/v1/rustfs/instances/:id` - Delete instance
- `GET /api/v1/rustfs/instances/:id/buckets` - List buckets

### Backup Jobs
- `GET /api/v1/backup/jobs` - List all backup jobs
- `POST /api/v1/backup/jobs` - Create new backup job
- `GET /api/v1/backup/jobs/:id` - Get backup job details
- `PUT /api/v1/backup/jobs/:id` - Update backup job
- `DELETE /api/v1/backup/jobs/:id` - Delete backup job
- `POST /api/v1/backup/jobs/:id/run` - Run backup job
- `POST /api/v1/backup/restore` - Restore backup

## Configuration

### Environment Variables

**Backend (.env)**
```env
DB_HOST=postgres
DB_PORT=5432
DB_NAME=rustfs_manager
DB_USER=rustfs_user
DB_PASSWORD=rustfs_password
JWT_SECRET=your-jwt-secret-change-this
PORT=8080
```

**Frontend**
```env
REACT_APP_API_URL=http://localhost:8080/api/v1
```

### Database

The application uses PostgreSQL with automatic migrations. Database schema includes:
- Users and authentication
- RustFS instances
- Backup jobs and runs
- Metrics and monitoring data
- Alerts and audit logs
- System configuration

## Development

### Project Structure

```
rustfs-manager/
├── backend/                 # Go backend application
│   ├── internal/
│   │   ├── config/         # Configuration management
│   │   ├── database/       # Database connection and migrations
│   │   ├── handlers/       # HTTP request handlers
│   │   ├── middleware/     # Authentication and other middleware
│   │   ├── models/         # Database models
│   │   └── services/       # Business logic services
│   ├── Dockerfile          # Production Docker image
│   ├── Dockerfile.dev      # Development Docker image
│   └── main.go            # Application entry point
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── contexts/       # React contexts (Auth, etc.)
│   │   ├── pages/          # Page components
│   │   └── services/       # API client and utilities
│   ├── Dockerfile          # Production Docker image
│   └── package.json        # Node.js dependencies
├── database/               # Database initialization
├── docker-compose.yml      # Production deployment
├── docker-compose.dev.yml  # Development overrides
└── Makefile               # Build and deployment commands
```

### Available Commands

```bash
# Start services
make start              # Start all services
make dev               # Start in development mode
make stop              # Stop all services
make restart           # Restart all services

# Development
make build             # Build all Docker images
make logs              # View logs from all services
make logs-backend      # View backend logs only
make logs-frontend     # View frontend logs only

# Database
make db-migrate        # Run database migrations
make db-seed           # Seed database with sample data
make db-reset          # Reset database

# Maintenance
make clean             # Clean up containers and images
make health            # Check service health
make status            # Show service status
```

### Adding New Features

1. **Backend Changes**
   - Add models in `internal/models/`
   - Create services in `internal/services/`
   - Add handlers in `internal/handlers/`
   - Update routes in `main.go`

2. **Frontend Changes**
   - Add components in `src/components/`
   - Create pages in `src/pages/`
   - Update routing in `App.tsx`
   - Add API calls in `src/services/`

## Deployment

### Production Deployment

1. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your production values
   ```

2. **Deploy with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Setup SSL (Optional)**
   ```bash
   # Use nginx proxy or configure SSL certificates
   # Update docker-compose.yml with SSL configuration
   ```

### Scaling

- **Backend**: Scale backend service with `docker-compose up -d --scale backend=3`
- **Database**: Use PostgreSQL clustering for high availability
- **Frontend**: Serve static files through CDN

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL container is running
   - Verify database credentials in environment variables
   - Ensure database is accessible from backend container

2. **Frontend Can't Connect to Backend**
   - Verify `REACT_APP_API_URL` environment variable
   - Check backend is running on correct port
   - Ensure CORS is properly configured

3. **RustFS Connection Failed**
   - Verify RustFS instance is running and accessible
   - Check access key and secret key are correct
   - Ensure network connectivity between containers

4. **Backup Jobs Failing**
   - Check backup destination path exists and is writable
   - Verify source bucket exists and is accessible
   - Review backup job logs in the dashboard

### Logs and Debugging

```bash
# View all logs
make logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Follow logs in real-time
docker-compose logs -f backend
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Components

- **Backend**: Go + Gin + GORM + PostgreSQL
- **Frontend**: React + TypeScript + Tailwind CSS + Vite
- **Database**: PostgreSQL with automatic migrations
- **Deployment**: Docker + Docker Compose
- **Authentication**: JWT-based authentication
- **Storage**: S3-compatible API (RustFS)