# Rukhalt Client

Frontend application for Rukhalt Backup Management System.

## Features

- 🎨 Modern React UI with TypeScript
- ⚡ Vite for fast development
- 🎨 Tailwind CSS for styling
- 🔐 JWT authentication
- 📊 Dashboard with real-time metrics
- 📦 Backup management interface
- 🐘 PostgreSQL backup and restore
- 🖥️ VPS instance management
- 📝 Activity logs and audit trail

## Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: React Context
- **Routing**: React Router

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker & Docker Compose (for containerized development)

### Development Setup

1. Navigate to client directory:
```bash
cd rukhalt/client
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment file:
```bash
cp .env.example .env.local
```

4. Start development server:
```bash
npm run dev
```

5. Access the application:
- Frontend: http://localhost:3000

### Docker Development

```bash
docker compose up -d
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## Project Structure

```
client/
├── src/
│   ├── components/        # Reusable components
│   ├── contexts/          # React contexts
│   ├── pages/            # Page components
│   │   ├── Dashboard/    # Dashboard page
│   │   ├── Backups/      # Backups management
│   │   ├── Instances/    # Instance management
│   │   ├── ActivityLogs/ # Audit logs
│   │   └── ...
│   ├── services/         # API services
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── public/               # Static assets
├── Dockerfile            # Production Docker image
├── Dockerfile.dev        # Development Docker image
├── nginx.conf            # Nginx configuration
└── package.json          # Dependencies
```

## Environment Variables

Create a `.env.local` file:

```env
VITE_API_URL=http://localhost:8080/api/v1
```

## Building for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Docker Production Build

```bash
docker build -t rukhalt-client:latest .
```

## API Integration

The client communicates with the Rukhalt server API. Configure the API URL in `.env.local`:

```env
VITE_API_URL=http://localhost:8080/api/v1
```

## Features Overview

### Dashboard
- System health overview
- Storage usage charts
- Recent backup activity
- Quick actions
- Upcoming scheduled backups

### Backup Management
- Create on-demand backups
- Schedule automated backups
- View backup history
- Download backups
- Restore from backups

### Instance Management
- PostgreSQL instances
- VPS instances
- Object storage instances
- Connection testing
- Credential management

### Activity Logs
- Audit trail
- User actions
- System events
- Filtering and search

## Development

### Adding New Pages

1. Create page component in `src/pages/`
2. Add route in `src/App.tsx`
3. Update navigation in `src/components/Layout.tsx`

### API Services

API calls are centralized in `src/services/api.ts`. Add new endpoints there:

```typescript
export const myNewEndpoint = async () => {
  const response = await api.get('/my-endpoint');
  return response.data;
};
```

## License

MIT
