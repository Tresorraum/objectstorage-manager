# Quick Start Guide - PostgreSQL Backup UI

## 🚀 Getting Started

### 1. View the Components

All UI components are located in:
```
frontend/src/pages/PostgresBackups/
```

### 2. Main Entry Point

Use `EnhancedIndex.tsx` as the main page:

```tsx
// In your routing file (e.g., App.tsx)
import EnhancedPostgresBackups from './pages/PostgresBackups/EnhancedIndex';

<Route path="/postgres-backups" element={<EnhancedPostgresBackups />} />
```

### 3. Required Dependencies

Make sure these are installed:
```bash
npm install @tanstack/react-query @heroicons/react react-hot-toast axios
```

### 4. API Configuration

Update your API base URL in `frontend/src/services/api.ts`:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
```

## 📋 Component Overview

### Core Components

| Component | Purpose | Status |
|-----------|---------|--------|
| **EnhancedIndex.tsx** | Main page with all features | ✅ Ready |
| **DatabaseSelector.tsx** | Select database for backup | ✅ Ready |
| **CreateBackupButton.tsx** | Create new backups | ✅ Ready |
| **BackupsList.tsx** | View and manage backups | ✅ Ready |
| **BackupProgress.tsx** | Track in-progress backups | ✅ Ready |
| **BackupStats.tsx** | View statistics | ✅ Ready |
| **ScheduleBackupModal.tsx** | Schedule automatic backups | ✅ Ready (needs API) |
| **RestorePreviewModal.tsx** | Preview restore options | ✅ Ready (needs API) |

## 🎨 Features at a Glance

### ✅ Working Now (UI Complete)
- Database selection
- Backup creation with configuration
- Real-time progress tracking
- Backup history with pagination
- Download backups
- Delete backups
- Cancel in-progress backups
- View error details
- Statistics dashboard
- Encryption status display

### ⏳ Ready for API Integration
- Scheduled backups
- Backup restoration
- Retention policies
- Email notifications

## 🔌 API Endpoints Needed

### Priority 1 (Core Features)
```
GET    /api/v1/backups?database_id={id}&limit={n}&offset={n}
POST   /api/v1/backups { database_id: string }
DELETE /api/v1/backups/:id
POST   /api/v1/backups/:id/cancel
POST   /api/v1/backups/:id/download-token
GET    /api/v1/backups/:id/file?token={token}
GET    /api/v1/postgres/instances
```

### Priority 2 (Future Features)
```
GET    /api/v1/backup-schedules?database_id={id}
POST   /api/v1/backup-schedules
DELETE /api/v1/backup-schedules/:id
POST   /api/v1/backups/:id/restore
```

## 📊 Data Models

### Backup Object
```typescript
{
  id: string;                    // UUID
  databaseId: string;            // UUID
  storageId: string;             // UUID
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELED';
  failMessage?: string;          // Error message if failed
  backupSizeMb: number;          // Size in MB
  backupDurationMs: number;      // Duration in milliseconds
  encryption: 'NONE' | 'ENCRYPTED';
  encryptionSalt?: string;       // Base64 encoded
  encryptionIV?: string;         // Base64 encoded
  createdAt: string;             // ISO 8601 timestamp
}
```

### PostgreSQL Instance
```typescript
{
  id: number;
  name: string;
  host: string;
  port: number;
  database: string;
  username: string;
  status: 'active' | 'inactive';
}
```

## 🎯 Testing the UI

### 1. Mock Data (Optional)
You can test the UI with mock data before API integration:

```typescript
// In EnhancedIndex.tsx, temporarily replace the query with:
const { data: backupsData } = useQuery({
  queryKey: ['postgres-backups', selectedDatabaseId],
  queryFn: () => Promise.resolve({
    backups: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        databaseId: selectedDatabaseId,
        storageId: 'storage-1',
        status: 'COMPLETED',
        backupSizeMb: 234.5,
        backupDurationMs: 225000,
        encryption: 'ENCRYPTED',
        createdAt: new Date().toISOString(),
      },
    ],
    total: 1,
    limit: 10,
    offset: 0,
  }),
});
```

### 2. Visual Inspection
1. Navigate to `/postgres-backups`
2. Check database selector
3. Select a database
4. Click "Create Backup" to see the modal
5. View the backup list (with mock data)
6. Check statistics display
7. Test responsive design (resize browser)

## 📖 Documentation

### Detailed Guides
- **Component README**: `frontend/src/pages/PostgresBackups/README.md`
- **Visual Showcase**: `frontend/src/pages/PostgresBackups/COMPONENT_SHOWCASE.md`
- **Integration Guide**: `POSTGRES_BACKUP_INTEGRATION.md`
- **Complete Summary**: `POSTGRES_BACKUP_UI_COMPLETE.md`

### Key Features from Open-Source
- pg_dump with custom format (-Fc)
- Zstd compression (PostgreSQL 16+)
- AES-256-GCM encryption
- Direct streaming to storage
- Token-based downloads
- Progress tracking
- Cancellation support

## 🔧 Customization

### Colors
Edit Tailwind classes in components:
- Primary: `bg-blue-600`, `text-blue-600`
- Success: `bg-green-600`, `text-green-600`
- Error: `bg-red-600`, `text-red-600`
- Warning: `bg-yellow-600`, `text-yellow-600`

### Pagination
Change page size in `BackupsList.tsx`:
```typescript
const pageSize = 10; // Change this value
```

### Auto-refresh Interval
Change refresh interval in queries:
```typescript
refetchInterval: 3000, // Change to desired milliseconds
```

## 🐛 Troubleshooting

### Components not rendering?
- Check React Query is properly configured
- Verify API base URL is correct
- Check browser console for errors

### Styles not working?
- Ensure Tailwind CSS is configured
- Check `tailwind.config.js` includes the components path
- Verify PostCSS is set up

### API errors?
- Check CORS configuration
- Verify JWT token is being sent
- Check API endpoint URLs match backend

## 📞 Support

For questions or issues:
1. Check the detailed documentation files
2. Review component source code comments
3. Check browser console for errors
4. Verify API responses match expected format

## ✅ Verification Checklist

Before moving to API integration:

- [ ] All components render without errors
- [ ] Database selector displays instances
- [ ] Create backup modal opens and closes
- [ ] Backup list displays (with mock data)
- [ ] Statistics show correctly
- [ ] Progress indicator animates
- [ ] Modals open and close properly
- [ ] Buttons have proper hover states
- [ ] Responsive design works on mobile
- [ ] No console errors
- [ ] TypeScript compiles without errors

## 🎉 You're Ready!

Once you verify the UI components work correctly, you can proceed with backend API integration. All UI components are production-ready and waiting for the API endpoints!

**Next Step**: Review the components and approve before moving to API integration phase.
