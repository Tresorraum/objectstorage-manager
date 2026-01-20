# PostgreSQL Backup Components - Visual Showcase

## 🎨 Component Gallery

### 1. Main Page (EnhancedIndex.tsx)

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ PostgreSQL Backups                                          │
│ Create and manage database backups with advanced features  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│  │ 🛡️       │  │ 🔄       │  │ ⏰       │                │
│  │Encrypted │  │Streaming │  │Cancellable│                │
│  │AES-256   │  │Direct to │  │Cancel    │                │
│  │          │  │storage   │  │anytime   │                │
│  └──────────┘  └──────────┘  └──────────┘                │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Select Database                                             │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│  │ 💾 DB1   │  │ 💾 DB2   │  │ 💾 DB3   │                │
│  │ myapp    │  │ staging  │  │ prod     │                │
│  │ ✓ Active │  │ ✓ Active │  │ ✓ Active │                │
│  └──────────┘  └──────────┘  └──────────┘                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2. Database Selector (DatabaseSelector.tsx)

**Features:**
- Grid layout (responsive: 1/2/3 columns)
- Visual selection state
- Status indicators
- Connection details
- Disabled state for inactive databases

**Visual States:**
```
┌─────────────────────┐
│ 💾 Production DB    │  ← Selected (blue border)
│ postgres_prod       │
│ db.example.com:5432 │
│ ✓ Active           │
└─────────────────────┘

┌─────────────────────┐
│ 💾 Staging DB       │  ← Unselected (gray border)
│ postgres_staging    │
│ db.example.com:5433 │
│ ✓ Active           │
└─────────────────────┘

┌─────────────────────┐
│ 💾 Old DB           │  ← Inactive (grayed out)
│ postgres_old        │
│ old.example.com:5432│
│ ✗ Inactive         │
└─────────────────────┘
```

### 3. Create Backup Button (CreateBackupButton.tsx)

**Quick Backup:**
```
┌──────────────────────────────┐
│ ▶️ Create Backup    ⚙️      │
└──────────────────────────────┘
```

**Configuration Modal:**
```
┌─────────────────────────────────────────────┐
│ Backup Configuration                    ✕   │
├─────────────────────────────────────────────┤
│                                             │
│ Database: Production DB                     │
│                                             │
│ ☑️ Enable Encryption                        │
│   Encrypt backup data at rest using         │
│   AES-256-GCM encryption                    │
│                                             │
│ Compression Level: 5                        │
│ ├────────●────────┤                        │
│ Faster(0)  Balanced(5)  Smaller(9)         │
│                                             │
│ Backup Features:                            │
│ ✓ Uses pg_dump custom format (-Fc)         │
│ ✓ Supports zstd compression (PG 16+)       │
│ ✓ Streams directly to storage              │
│ ✓ Includes all schemas and data            │
│ ✓ Can be cancelled during execution        │
│                                             │
│ ⚠️ Note: Large databases may take several  │
│    minutes to complete                      │
│                                             │
│         [Cancel]  [▶️ Start Backup]        │
└─────────────────────────────────────────────┘
```

### 4. Backup Progress (BackupProgress.tsx)

```
┌─────────────────────────────────────────────────────────┐
│ 🔄 Backup In Progress                                   │
│                                                         │
│ ⏰ Elapsed time: 2m 34s                                │
│ Current size: 145.3 MB                                  │
│                                                         │
│ ████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│                                                         │
│ The backup is being created and streamed directly to   │
│ storage. This may take several minutes depending on    │
│ database size.                                          │
└─────────────────────────────────────────────────────────┘
```

### 5. Backups List (BackupsList.tsx)

**Table View:**
```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Backup History                                                               │
│ 15 backups for Production DB                                                 │
├──────────────────────────────────────────────────────────────────────────────┤
│ Status      │ Created           │ Size    │ Duration │ Encryption │ Actions │
├──────────────────────────────────────────────────────────────────────────────┤
│ ✓ COMPLETED │ 2024-01-20 14:30 │ 234 MB  │ 3m 45s   │ 🔒 Yes    │ ⬇️ 🗑️  │
│ ⏰ IN_PROG  │ 2024-01-20 14:25 │ 145 MB  │ 2m 34s   │ 🔒 Yes    │ ❌      │
│ ✓ COMPLETED │ 2024-01-20 02:00 │ 230 MB  │ 3m 42s   │ 🔒 Yes    │ ⬇️ 🗑️  │
│ ✗ FAILED    │ 2024-01-19 14:30 │ -       │ -        │ -         │ ⚠️ 🗑️  │
│ ✓ COMPLETED │ 2024-01-19 02:00 │ 228 MB  │ 3m 38s   │ 🔒 Yes    │ ⬇️ 🗑️  │
├──────────────────────────────────────────────────────────────────────────────┤
│ Showing 1 to 5 of 15 backups          [Previous] [Next]                     │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Empty State:**
```
┌─────────────────────────────────────────┐
│                                         │
│              🛡️                         │
│                                         │
│         No backups yet                  │
│                                         │
│  Create your first backup to see it    │
│  here                                   │
│                                         │
└─────────────────────────────────────────┘
```

**Delete Confirmation:**
```
┌─────────────────────────────────────┐
│ Delete Backup                   ✕   │
├─────────────────────────────────────┤
│                                     │
│ Are you sure you want to delete     │
│ this backup? This action cannot be  │
│ undone.                             │
│                                     │
│ Created: 2024-01-20 14:30:00       │
│ Size: 234 MB                        │
│                                     │
│         [Cancel] [Delete Backup]    │
└─────────────────────────────────────┘
```

**Error Details:**
```
┌─────────────────────────────────────────────┐
│ Backup Error Details                    ✕   │
├─────────────────────────────────────────────┤
│                                             │
│ ⚠️ Error Message                            │
│                                             │
│ PostgreSQL connection refused. Check if    │
│ the server is running and accessible from  │
│ your network. stderr: connection to        │
│ server at "db.example.com" (10.0.0.1),     │
│ port 5432 failed: Connection refused      │
│                                             │
│ Backup ID: 123e4567-e89b-12d3-a456-...    │
│ Created: 2024-01-20 14:30:00               │
│                                             │
│                            [Close]          │
└─────────────────────────────────────────────┘
```

### 6. Backup Statistics (BackupStats.tsx)

```
┌─────────────────────────────────────────────────────────────┐
│ 📊 Backup Statistics                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ 📊 Total │  │ ✓ Success│  │ ✗ Failed │  │ 📈 Size  │  │
│  │    15    │  │  93.3%   │  │    1     │  │  3.4 GB  │  │
│  │All backs │  │14 complt │  │failures  │  │Total stor│  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                             │
│  ⏰ Average Duration: 3m 42s                               │
│  ✓ Last Backup: 2024-01-20                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 7. Schedule Backup Modal (ScheduleBackupModal.tsx)

```
┌─────────────────────────────────────────────────────────┐
│ Schedule Automatic Backups                          ✕   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Database: Production DB                                 │
│                                                         │
│ Backup Frequency:                                       │
│ [Daily ▼]                                              │
│                                                         │
│ Backup Time:                                            │
│ ⏰ [02:00]                                             │
│ Time is in your local timezone                          │
│                                                         │
│ Retention Period (days):                                │
│ [7]                                                     │
│ Backups older than this will be automatically deleted   │
│                                                         │
│ ☑️ Enable Encryption                                    │
│   Encrypt backups using AES-256-GCM (recommended)      │
│                                                         │
│ 📅 Schedule Preview                                     │
│ Every day at 02:00                                      │
│ Backups will be retained for 7 days                     │
│                                                         │
│                    [Cancel] [📅 Create Schedule]       │
└─────────────────────────────────────────────────────────┘
```

### 8. Restore Preview Modal (RestorePreviewModal.tsx)

```
┌─────────────────────────────────────────────────────────────┐
│ Restore Backup (Preview)                               ✕   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ⚠️ Restore Feature Coming Soon                             │
│   This is a preview of the restore functionality. The      │
│   actual restore feature will be implemented in the        │
│   backend API integration phase.                           │
│                                                             │
│ Backup Information                                          │
│ Database: Production DB                                     │
│ Created: 2024-01-20 14:30:00                               │
│ Size: 234 MB                                                │
│ Encryption: Yes (AES-256-GCM)                              │
│                                                             │
│ Restore Options                                             │
│ ☑️ Drop existing objects                                   │
│ ☐ Create database                                          │
│ ☑️ Skip ownership restoration                              │
│ ☐ Skip privileges restoration                              │
│                                                             │
│ Command Preview (pg_restore)                                │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ pg_restore \                                        │   │
│ │   --clean \                                         │   │
│ │   --no-owner \                                      │   │
│ │   --verbose \                                       │   │
│ │   -h <host> -p <port> \                            │   │
│ │   -U <username> \                                   │   │
│ │   -d Production_DB \                                │   │
│ │   backup_123e4567.dump                              │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ ⚠️ Warning: Restoring a backup will modify the target     │
│    database. Make sure you have a recent backup before     │
│    proceeding. This operation cannot be undone.            │
│                                                             │
│         [Close Preview] [🔄 Restore (Coming Soon)]        │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 Color Scheme

### Status Colors
- **Success/Completed**: Green (`bg-green-50`, `text-green-800`, `border-green-200`)
- **In Progress**: Blue (`bg-blue-50`, `text-blue-800`, `border-blue-200`)
- **Failed**: Red (`bg-red-50`, `text-red-800`, `border-red-200`)
- **Canceled**: Gray (`bg-gray-50`, `text-gray-800`, `border-gray-200`)
- **Warning**: Yellow (`bg-yellow-50`, `text-yellow-800`, `border-yellow-200`)

### Feature Cards
- **Encryption**: Blue gradient (`from-blue-50 to-blue-100`)
- **Streaming**: Green gradient (`from-green-50 to-green-100`)
- **Cancellable**: Purple gradient (`from-purple-50 to-purple-100`)

### Interactive Elements
- **Primary Button**: Blue (`bg-blue-600`, `hover:bg-blue-700`)
- **Secondary Button**: Gray (`bg-gray-200`, `hover:bg-gray-300`)
- **Danger Button**: Red (`bg-red-600`, `hover:bg-red-700`)

## 📱 Responsive Design

### Desktop (≥1024px)
- 3-column grid for database selector
- 4-column grid for statistics
- Full table view for backups

### Tablet (768px - 1023px)
- 2-column grid for database selector
- 2-column grid for statistics
- Scrollable table view

### Mobile (<768px)
- 1-column grid for all components
- Card view for backups (instead of table)
- Stacked buttons
- Collapsible sections

## ♿ Accessibility Features

- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Focus Indicators**: Clear focus states on all buttons and inputs
- **ARIA Labels**: Proper labels for screen readers
- **Color Contrast**: WCAG AA compliant color contrasts
- **Loading States**: Clear loading indicators
- **Error Messages**: Descriptive error messages
- **Tooltips**: Helpful tooltips on hover

## 🎭 Animations

- **Progress Bar**: Smooth pulse animation
- **Loading Spinner**: Rotating animation
- **Hover Effects**: Smooth transitions on hover
- **Modal**: Fade in/out transitions
- **Status Changes**: Smooth color transitions

## 🔤 Typography

- **Headings**: Bold, clear hierarchy (text-2xl, text-xl, text-lg)
- **Body Text**: Readable sizes (text-sm, text-base)
- **Labels**: Medium weight (font-medium)
- **Code**: Monospace font (font-mono)
- **Numbers**: Tabular numbers for alignment

## 📐 Spacing

- **Component Spacing**: Consistent 6-unit spacing (space-y-6)
- **Card Padding**: 6-unit padding (p-6)
- **Grid Gaps**: 4-unit gaps (gap-4)
- **Button Padding**: Balanced padding (px-4 py-2)
- **Modal Spacing**: 5-unit spacing (space-y-5)

## 🎯 User Experience

### Feedback
- **Success**: Green toast notifications
- **Error**: Red toast notifications
- **Loading**: Spinner with descriptive text
- **Progress**: Real-time updates every 3 seconds

### Confirmation
- **Delete**: Modal confirmation required
- **Cancel**: Immediate action with toast
- **Download**: Opens in new tab

### Information
- **Tooltips**: On hover for additional context
- **Help Text**: Below inputs for guidance
- **Info Boxes**: For important notes and warnings
