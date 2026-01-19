# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of RustFS Manager
- Multi-source backup management (Object Storage, PostgreSQL, VPS)
- Comprehensive dashboard with real-time statistics
- Instance management for Object Storage, PostgreSQL, and VPS
- Scheduled backup jobs with cron scheduling
- Instant PostgreSQL backups with local download or VPS upload
- Activity logs with advanced filtering
- Analytics and monitoring
- Premium features (server storage, advanced analytics)
- User authentication and authorization
- Credential encryption with AES-256-GCM
- Responsive UI with mobile support
- Docker-based deployment

### Security
- AES-256-GCM encryption for all sensitive credentials
- JWT-based authentication
- Bcrypt password hashing
- Secure SSH/SFTP connections for VPS

## [1.0.0] - 2026-01-20

### Added
- Initial public release
- Complete backup management platform
- Support for Object Storage (S3-compatible)
- Support for PostgreSQL databases
- Support for VPS servers
- Web-based UI built with React and TypeScript
- RESTful API built with Go
- Docker Compose deployment
- Comprehensive documentation

---

## Version History

### Version Format
- **Major.Minor.Patch** (e.g., 1.0.0)
- **Major**: Breaking changes
- **Minor**: New features (backward compatible)
- **Patch**: Bug fixes (backward compatible)

### Change Categories
- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements

---

[Unreleased]: https://github.com/yourusername/rustfs-manager/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/yourusername/rustfs-manager/releases/tag/v1.0.0
