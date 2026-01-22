# storage manager

A comprehensive backup management platform for object storage, PostgreSQL databases, and VPS servers. Built with Go, React, and TypeScript.

**Rückhalt** (German for "backup/support") - Your data's backbone.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Go Version](https://img.shields.io/badge/go-1.23-blue.svg)
![Node Version](https://img.shields.io/badge/node-18-green.svg)

## Features

### 🗄️ Multi-Source Backup Management
- **Object Storage (S3-Compatible)** - Automated backups for S3-compatible storage
- **PostgreSQL Databases** - Instant database dumps with local download or VPS upload
- **VPS Servers** - Remote server file backups (coming soon)

### 📊 Comprehensive Dashboard
- Real-time backup statistics
- System health monitoring
- Recent activity tracking
- Upcoming backup schedule
- Storage usage analytics

### 🔐 Instance Management
- **Object Storage Instances** - Connect to S3-compatible storage (MinIO, AWS S3, etc.)
- **PostgreSQL Instances** - Manage database connections with encrypted credentials
- **VPS Instances** - Configure remote servers with SSH/password authentication

### ⚡ Backup Operations
- **Scheduled Backups** - Automated backup jobs with cron scheduling
- **Instant Backups** - On-demand PostgreSQL database dumps
- **Multiple Destinations** - Server storage or object storage
- **Compression Options** - Gzip compression for efficient storage
- **Retention Policies** - Automatic cleanup of old backups

### 📈 Analytics & Monitoring
- Backup success/failure rates
- Storage usage trends
- Performance metrics
- Activity logs with filtering

### 🎯 Premium Features
- Server-side backup storage
- Advanced analytics
- Activity log history
- Unlimited backup jobs
- Priority support

## Tech Stack

### Backend
- **Go 1.23** - High-performance backend API
- **Gin** - HTTP web framework
- **GORM** - ORM for database operations
- **PostgreSQL** - Primary database
- **Redis** - Caching and session management
- **JWT** - Authentication
- **AES-256-GCM** - Credential encryption

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS
- **React Query** - Data fetching and caching
- **React Router** - Client-side routing
- **Heroicons** - Icon library

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy and static file serving

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/ruckhalt.git
cd ruckhalt
```

2. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` and set your configuration:
```env
# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=ruckhalt
DB_USER=postgres
DB_PASSWORD=your_secure_password

# JWT Secret (generate a random string)
JWT_SECRET=your_jwt_secret_key_here

# Encryption Key (32 characters for AES-256)
ENCRYPTION_KEY=your_32_character_encryption_key

# API Port
PORT=8080
```

3. **Start the application**
```bash
docker-compose up -d
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

5. **Create your first user**
Navigate to http://localhost:3000/register and create an account.

## Development Setup

### Backend Development
```bash
cd backend
go mod download
go run main.go
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Database Migrations
```bash
# The application automatically runs migrations on startup
# Manual migration (if needed):
docker-compose exec postgres psql -U $DB_USER -d $DB_NAME < database/init.sql
```

## Configuration

### Object Storage Instance
1. Navigate to **Instances** page
2. Click **Add Object Storage Instance**
3. Configure:
   - Name
   - Endpoint (e.g., `s3.amazonaws.com`)
   - Access Key
   - Secret Key
   - Region
   - SSL enabled/disabled

### PostgreSQL Instance
1. Navigate to **Instances** page
2. Click **Add PostgreSQL Instance**
3. Configure:
   - Name
   - Host and Port
   - Database name
   - Username and Password
   - SSL enabled/disabled

### VPS Instance
1. Navigate to **Instances** page
2. Click **Add VPS Instance**
3. Configure:
   - Name
   - Host and Port
   - Username
   - Authentication (Password or SSH Key)
   - Backup path on server

## Usage

### Creating Scheduled Backups

1. Go to **Backups** → **Scheduled Backups** tab
2. Click **Create Backup Job**
3. Select source type (Object Storage)
4. Choose source instance and bucket
5. Select destination type:
   - **Server Storage** - Compressed archives on server (Premium)
   - **Object Storage** - Copy to another bucket
6. Configure schedule (cron expression)
7. Set retention policy
8. Click **Create Backup Job**

### PostgreSQL Instant Backups

1. Go to **Backups** → **PostgreSQL** tab
2. Click **Create Backup** on any database
3. Choose destination:
   - **Local Download** - Download SQL dump to your computer
   - **Upload to VPS** - Upload to configured VPS server
4. Click **Create Backup**

### Viewing Backup History

1. Go to **Backups** → **Scheduled Backups** tab
2. Click **View History** on any backup job
3. See all backup runs with:
   - Status (completed/failed)
   - Duration
   - File count and size
   - Error messages (if failed)

## API Documentation

### Authentication
All API endpoints (except `/auth/login` and `/auth/register`) require JWT authentication.

**Header:**
```
Authorization: Bearer <your_jwt_token>
```

### Key Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get JWT token
- `GET /api/v1/auth/me` - Get current user info

#### Instances
- `GET /api/v1/rustfs/instances` - List object storage instances
- `POST /api/v1/rustfs/instances` - Create object storage instance
- `GET /api/v1/postgres/instances` - List PostgreSQL instances
- `POST /api/v1/postgres/instances` - Create PostgreSQL instance
- `GET /api/v1/vps/instances` - List VPS instances
- `POST /api/v1/vps/instances` - Create VPS instance

#### Backups
- `GET /api/v1/backup/jobs` - List backup jobs
- `POST /api/v1/backup/jobs` - Create backup job
- `POST /api/v1/backup/jobs/:id/run` - Run backup job manually
- `POST /api/v1/postgres/backup` - Create PostgreSQL backup

#### Analytics
- `GET /api/v1/dashboard/stats` - Dashboard statistics
- `GET /api/v1/analytics/storage` - Storage analytics
- `GET /api/v1/activity-logs` - Activity logs

## Deployment

### Production Deployment

1. **Update environment variables**
```bash
cp .env.example .env.production
# Edit .env.production with production values
```

2. **Build and deploy**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

3. **Configure SSL (recommended)**
```bash
./setup-ssl.sh your-domain.com
```

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

## Security

### Credential Encryption
- All sensitive credentials (passwords, SSH keys, access keys) are encrypted using AES-256-GCM
- Encryption key must be 32 characters for AES-256
- Credentials are only decrypted in memory when needed

### Authentication
- JWT-based authentication
- Secure password hashing with bcrypt
- Token expiration and refresh

### Best Practices
- Use strong passwords
- Rotate encryption keys periodically
- Enable SSL for all connections
- Use SSH keys instead of passwords for VPS
- Regularly update dependencies
- Monitor activity logs

## Troubleshooting

### Backend won't start
```bash
# Check logs
docker-compose logs backend

# Common issues:
# - Database connection failed: Check DB credentials in .env
# - Port already in use: Change PORT in .env
# - Missing encryption key: Set ENCRYPTION_KEY in .env
```

### Frontend won't connect to backend
```bash
# Check frontend environment
cat frontend/.env.production

# Should have:
VITE_API_URL=http://localhost:8080/api/v1

# Restart frontend
docker-compose restart frontend
```

### PostgreSQL backup fails
```bash
# Ensure pg_dump is installed in backend container
docker-compose exec backend pg_dump --version

# If not installed, rebuild:
docker-compose build backend
docker-compose up -d
```

### VPS connection fails
- Verify SSH credentials are correct
- Check firewall allows SSH connections
- Ensure user has write permissions to backup path
- Test SSH connection manually:
```bash
ssh username@vps-host
```

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow Go best practices and conventions
- Use TypeScript for all frontend code
- Write meaningful commit messages
- Add tests for new features
- Update documentation

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: [Full documentation](DEPLOY.md)
- **Issues**: [GitHub Issues](https://github.com/yourusername/ruckhalt/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/ruckhalt/discussions)

## Roadmap

### Upcoming Features
- [ ] VPS file backup implementation
- [ ] MongoDB backup support
- [ ] MySQL backup support
- [ ] Backup restoration interface
- [ ] Email notifications
- [ ] Webhook integrations
- [ ] Multi-user team support
- [ ] Role-based access control
- [ ] Backup encryption at rest
- [ ] Incremental backups
- [ ] Backup verification
- [ ] Mobile app

## Acknowledgments

- Built with [Go](https://golang.org/)
- UI powered by [React](https://reactjs.org/)
- Styled with [TailwindCSS](https://tailwindcss.com/)
- Icons by [Heroicons](https://heroicons.com/)
- Powered by [ZenDevz](https://zendevz.com)
- Built in [NesoHQ](https://nesohq.org)

---

Made with ❤️ by the Rückhalt team
