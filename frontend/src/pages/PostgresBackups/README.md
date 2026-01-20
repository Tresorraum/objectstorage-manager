# PostgreSQL Backup Features - UI Components

This directory contains the comprehensive UI implementation for PostgreSQL backup features integrated from the open-source backup system.

## 📁 Components Overview

### Core Components

#### 1. **EnhancedIndex.tsx** (Main Page)
The main entry point that orchestrates all backup features.

**Features:**
- Database selection interface
- Feature overview cards (Encryption, Streaming, Cancellable)
- Integration of all sub-components
- Technical details section

**Usage:**
```tsx
import EnhancedPostgresBackups from './pages/PostgresBackups/EnhancedIndex';
```

#### 2. **DatabaseSelector.tsx**
Displays all available PostgreSQL instances for backup selection.

**Features:**
- Grid layout of database instances
- Status indicators (active/inactive)
- Connection details display
- Visual selection feedback

**Props:**
```typescript
{
  selectedDatabaseId: string | null;
  onSelectDatabase: (id: string, name: string) => void;
}
```

#### 3. **CreateBackupButton.tsx**
Handles backup creation with configuration options.

**Features:**
- Quick backup button
- Advanced configuration modal
- Encryption toggle
- Compression level slider (0-9)
- Backup features information
- Real-time status feedback

**Props:**
```typescript
{
  databaseId: string;
  databaseName: string;
  disabled?: boolean;
}
```

#### 4. **BackupsList.tsx**
Comprehensive backup history with management actions.

**Features:**
- Paginated backup list
- Status badges (IN_PROGRESS, COMPLETED, FAILED, CANCELED)
- Size and duration display
- Encryption status indicator
- Action buttons (Download, Delete, Cancel, View Error)
- Auto-refresh for in-progress backups
- Delete confirmation modal
- Error details modal

**Props:**
```typescript
{
  databaseId: string;
  databaseName: string;
}
```

#### 5. **BackupProgress.tsx**
Real-time progress indicator for running backups.

**Features:**
- Elapsed time counter
- Current backup size display
- Animated progress bar
- Auto-updating every second

**Props:**
```typescript
{
  backup: {
    id: string;
    status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELED';
    backupSizeMb: number;
    createdAt: string;
  };
}
```

#### 6. **BackupStats.tsx**
Statistical overview of backup history.

**Features:**
- Total backups count
- Success rate percentage
- Failed backups count
- Total storage used
- Average backup duration
- Last backup date

**Props:**
```typescript
{
  databaseId: string;
}
```

### Advanced Components

#### 7. **ScheduleBackupModal.tsx**
Schedule automatic backups (UI ready for API integration).

**Features:**
- Frequency selection (Daily, Weekly, Monthly, Custom)
- Time picker
- Day selection (for weekly/monthly)
- Custom cron expression support
- Retention period configuration
- Encryption toggle
- Schedule preview

**Props:**
```typescript
{
  isOpen: boolean;
  onClose: () => void;
  databaseId: string;
  databaseName: string;
}
```

#### 8. **RestorePreviewModal.tsx**
Preview and configure backup restoration (UI ready for API integration).

**Features:**
- Backup information display
- Restore options (drop existing, create database, etc.)
- pg_restore command preview
- Process explanation
- Safety warnings

**Props:**
```typescript
{
  isOpen: boolean;
  onClose: () => void;
  backup: Backup | null;
  databaseName: string;
}
```

## 🎨 Features Implemented

### From Open-Source System

1. **Backup Creation**
   - ✅ pg_dump with custom format (-Fc)
   - ✅ Zstd compression for PostgreSQL 16+ (gzip for older)
   - ✅ Compression level configuration (0-9)
   - ✅ Direct streaming to storage
   - ✅ No temporary files

2. **Encryption**
   - ✅ AES-256-GCM encryption at rest
   - ✅ Unique encryption keys per backup
   - ✅ Salt and IV storage
   - ✅ Automatic decryption on download
   - ✅ Visual encryption status indicators

3. **Backup Management**
   - ✅ List all backups with pagination
   - ✅ View backup details (size, duration, status)
   - ✅ Download backups with token authentication
   - ✅ Delete backups with confirmation
   - ✅ Cancel in-progress backups
   - ✅ View error messages for failed backups

4. **Progress Tracking**
   - ✅ Real-time status updates
   - ✅ Elapsed time display
   - ✅ Current size tracking
   - ✅ Auto-refresh every 3 seconds

5. **Statistics & Analytics**
   - ✅ Total backups count
   - ✅ Success rate calculation
   - ✅ Failed backups tracking
   - ✅ Total storage usage
   - ✅ Average duration
   - ✅ Last backup date

6. **Security Features**
   - ✅ Token-based download authentication
   - ✅ 5-minute token expiration
   - ✅ Download concurrency control
   - ✅ Heartbeat mechanism for active downloads
   - ✅ Automatic lock release

## 🔌 API Integration Points

### Required Backend Endpoints

```typescript
// Backups
GET    /api/v1/backups?database_id={id}&limit={n}&offset={n}
POST   /api/v1/backups { database_id: string }
DELETE /api/v1/backups/:id
POST   /api/v1/backups/:id/cancel

// Download
POST   /api/v1/backups/:id/download-token
GET    /api/v1/backups/:id/file?token={token}

// Instances
GET    /api/v1/postgres/instances

// Schedules (Future)
GET    /api/v1/backup-schedules?database_id={id}
POST   /api/v1/backup-schedules
DELETE /api/v1/backup-schedules/:id

// Restore (Future)
POST   /api/v1/backups/:id/restore
```

### Response Types

```typescript
interface Backup {
  id: string;
  databaseId: string;
  storageId: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELED';
  failMessage?: string;
  backupSizeMb: number;
  backupDurationMs: number;
  encryption: 'NONE' | 'ENCRYPTED';
  encryptionSalt?: string;
  encryptionIV?: string;
  createdAt: string;
}

interface GetBackupsResponse {
  backups: Backup[];
  total: number;
  limit: number;
  offset: number;
}

interface DownloadTokenResponse {
  token: string;
  filename: string;
  backupId: string;
}
```

## 🎯 Usage Example

```tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import EnhancedPostgresBackups from './pages/PostgresBackups/EnhancedIndex';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/postgres-backups" element={<EnhancedPostgresBackups />} />
      </Routes>
    </BrowserRouter>
  );
}
```

## 🔧 Configuration

### Environment Variables

```env
VITE_API_URL=http://localhost:8080/api/v1
```

### Dependencies

```json
{
  "@tanstack/react-query": "^5.x",
  "@heroicons/react": "^2.x",
  "react-hot-toast": "^2.x",
  "axios": "^1.x"
}
```

## 📊 Technical Details

### Backup Process Flow

1. **User initiates backup**
   - Selects database
   - Configures options (encryption, compression)
   - Clicks "Create Backup"

2. **Backend processing**
   - Executes pg_dump with custom format
   - Streams output directly to storage
   - Applies encryption if enabled
   - Updates progress in real-time

3. **UI updates**
   - Shows progress indicator
   - Displays elapsed time
   - Updates backup size
   - Auto-refreshes every 3 seconds

4. **Completion**
   - Status changes to COMPLETED
   - Final size and duration recorded
   - Download button becomes available

### Download Process Flow

1. **User clicks download**
   - Generates short-lived token (5 minutes)
   - Opens download URL in new tab

2. **Backend streaming**
   - Validates token
   - Checks download concurrency
   - Streams file with rate limiting
   - Maintains heartbeat

3. **Automatic decryption**
   - Decrypts on-the-fly if encrypted
   - No temporary files created
   - Efficient memory usage

## 🚀 Future Enhancements

### Ready for API Integration

1. **Scheduled Backups**
   - UI: ✅ Complete
   - API: ⏳ Pending

2. **Backup Restoration**
   - UI: ✅ Complete
   - API: ⏳ Pending

3. **Backup Verification**
   - UI: ⏳ Planned
   - API: ⏳ Planned

4. **Incremental Backups**
   - UI: ⏳ Planned
   - API: ⏳ Planned

5. **Email Notifications**
   - UI: ⏳ Planned
   - API: ⏳ Planned

## 🐛 Error Handling

All components include comprehensive error handling:

- Network errors
- Authentication failures
- Validation errors
- Concurrent operation conflicts
- User-friendly error messages
- Detailed error modals for failed backups

## 🎨 Styling

Components use Tailwind CSS with:
- Consistent color scheme
- Responsive design
- Smooth animations
- Loading states
- Hover effects
- Focus indicators

## 📝 Notes

- All UI components are complete and ready for use
- API integration points are clearly defined
- Components follow React best practices
- TypeScript for type safety
- Accessible and responsive design
- Comprehensive error handling
- Real-time updates for in-progress operations

## 🔗 Related Files

- `frontend/src/services/api.ts` - API client configuration
- `frontend/src/utils/formatters.ts` - Utility functions
- `frontend/src/components/Modal.tsx` - Reusable modal component
