# Rückhalt - Backup Management System

A comprehensive backup management system for PostgreSQL databases, VPS instances, and object storage with automated scheduling and monitoring.

## 🚀 Features

- **Multi-Source Backups**
  - PostgreSQL database backups
  - VPS file system backups via SSH/SFTP
  - S3-compatible object storage backups

- **Automated Scheduling**
  - Cron-based backup scheduling
  - Retention policies
  - Compression and encryption

- **Monitoring & Alerts**
  - Real-time backup status
  - Storage usage tracking
  - Email/webhook notifications
  - Audit logging

- **User Management**
  - Role-based access control
  - Multi-user support
  - Activity tracking

## 📦 Project Structure

```
rukhalt/
├── server/              # Backend API (Go)
│   ├── cmd/            # CLI commands
│   ├── internal/       # Internal packages
│   ├── migrations/     # Database migrations
│   ├── Dockerfile      # Server Docker image
│   └── docker-compose.yml
│
├── client/             # Frontend UI (React + TypeScript)
│   ├── src/           # Source code
│   ├── public/        # Static assets
│   └── Dockerfile     # Client Docker image
│
├── docker-compose.yml  # Full stack compose
└── README.md          # This file
```

## 🛠️ Tech Stack

### Server
- **Language**: Go 1.23
- **Framework**: Gin
- **Database**: PostgreSQL 15
- **ORM**: GORM
- **Migrations**: Goose
- **CLI**: Cobra
- **Cache**: Redis

### Client
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Go 1.23+ (for local server development)
- Node.js 18+ (for local client development)

### Full Stack Development

1. Clone the repository:
```bash
git clone <repository-url>
cd rukhalt
```

2. Start the full stack:
```bash
docker compose up -d
```

This will start:
- PostgreSQL database (port 5432)
- Redis cache (port 6379)
- Backend API (port 8080)
- Frontend UI (port 3000)

3. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- API Health: http://localhost:8080/health

### Server Development

See [server/README.md](server/README.md) for detailed server setup and development instructions.

```bash
cd server
make dev
```

### Client Development

See [client/README.md](client/README.md) for detailed client setup and development instructions.

```bash
cd client
npm install
npm run dev
```

## 📚 Documentation

- [Server Documentation](server/README.md)
- [Client Documentation](client/README.md)
- [API Documentation](server/docs/API.md) (if available)

## 🔧 Configuration

### Environment Variables

#### Server (.env)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rukhalt_db
DB_USER=rukhalt_user
DB_PASSWORD=rukhalt_password
JWT_SECRET=your-secret-key
ENCRYPTION_KEY=your-encryption-key
PORT=8080
```

#### Client (.env.local)
```env
VITE_API_URL=http://localhost:8080/api/v1
```

## 🐳 Docker Images

### Building Images

```bash
# Build server image
docker build -t rukhalt-server:latest ./server

# Build client image
docker build -t rukhalt-client:latest ./client
```

### Production Deployment

```bash
docker compose -f docker-compose.prod.yml up -d
```

## 📊 Database Migrations

Migrations are managed using Goose:

```bash
cd server

# Run migrations
make migrate-up

# Create new migration
make migrate-create NAME=add_feature

# Check migration status
make migrate-status
```

## 🧪 Testing

### Server Tests
```bash
cd server
make test
```

### Client Tests
```bash
cd client
npm test
```

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- Encrypted storage of sensitive credentials
- HTTPS support
- CORS configuration
- SQL injection protection via ORM

## 📝 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/refresh` - Refresh token

### Backups
- `GET /api/v1/backups` - List backups
- `POST /api/v1/backups` - Create backup
- `DELETE /api/v1/backups/:id` - Delete backup
- `POST /api/v1/backups/restore` - Restore backup

### Instances
- `GET /api/v1/postgres/instances` - List PostgreSQL instances
- `GET /api/v1/vps/instances` - List VPS instances
- `GET /api/v1/rustfs/instances` - List object storage instances

See [API Documentation](server/docs/API.md) for complete endpoint list.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Inspired by modern backup solutions
- Built with best practices from the Go and React communities

## 📞 Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/yourusername/rukhalt/issues)
- Documentation: [Wiki](https://github.com/yourusername/rukhalt/wiki)

## 🗺️ Roadmap

- [ ] Multi-region backup support
- [ ] Backup verification and integrity checks
- [ ] Advanced scheduling options
- [ ] Backup analytics and reporting
- [ ] Mobile app
- [ ] Kubernetes operator
- [ ] Terraform provider
