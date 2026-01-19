# PostgreSQL Backup Feature - UI Complete

## Overview
Created a dedicated PostgreSQL backup page that allows users to:
1. **Download backups to local machine** (browser download)
2. **Upload backups to VPS** (if VPS instances are configured)

## What Was Built

### New Page: PostgreSQL Backups (`/postgres-backups`)

**Location:** `frontend/src/pages/PostgresBackups/index.tsx`

#### Features:
1. **Header Section**
   - Title: "PostgreSQL Backups"
   - Description: "Create instant backups of your PostgreSQL databases"

2. **Info Cards** (2 cards explaining the features)
   - **Local Download Card** (Blue gradient)
     - Icon: ArrowDownTrayIcon
     - Description: Download database backups directly to your computer as SQL dump files
   
   - **VPS Upload Card** (Purple gradient)
     - Icon: CloudArrowUpIcon
     - Description: Upload database backups directly to your VPS servers for remote storage

3. **PostgreSQL Instances List**
   - Shows all configured PostgreSQL instances
   - Each instance card displays:
     - Instance name
     - Database name
     - Host and port
     - Username
     - Status badge (Active/Inactive)
     - "Create Backup" button (disabled if instance is inactive)
   
   - Empty state when no instances:
     - Icon placeholder
     - Message: "No PostgreSQL instances"
     - Call-to-action button to add instances

4. **Backup Modal** (Opens when "Create Backup" is clicked)
   - **Database Information Section** (Blue background)
     - Shows selected instance details
     - Database name, host, port
   
   - **Destination Selection** (2 options)
     - **Local Download** (Blue theme)
       - Icon: ArrowDownTrayIcon
       - Label: "Save to your computer"
     
     - **Upload to VPS** (Purple theme)
       - Icon: CloudArrowUpIcon
       - Label: "Save to remote server"
       - Disabled if no VPS instances configured
       - Shows "No VPS configured" when disabled
   
   - **VPS Selection Dropdown** (Only shown when VPS destination is selected)
     - Lists all available VPS instances
     - Shows: Name, Host, and Backup Path
     - Helper text: "Backup will be uploaded to the configured backup path on the VPS"
   
   - **Info Message**
     - For Local: "The database will be exported as a SQL dump file and downloaded to your browser's download folder."
     - For VPS: "The database will be exported and securely uploaded to your VPS server via SSH."
   
   - **Action Buttons**
     - Cancel button
     - Create Backup button (with loading state)
     - Shows appropriate icon based on destination (download or upload)

## UI/UX Features

### Responsive Design
- Mobile-friendly layout
- Stacked cards on mobile, grid on desktop
- Flexible button layouts

### Color Scheme
- **PostgreSQL/Database**: Blue theme (blue-600, blue-50)
- **VPS**: Purple theme (purple-600, purple-50)
- **Success**: Green
- **Inactive**: Red/Gray

### User Experience
- Clear visual distinction between local and VPS backup options
- Disabled states with helpful messages
- Loading states during backup creation
- Toast notifications for success/error
- Automatic file download for local backups
- Validation: VPS destination requires VPS selection

### Accessibility
- Proper button states (disabled, loading)
- Clear labels and descriptions
- Status indicators
- Helper text for all inputs

## Navigation

### Added to Sidebar
- **Name:** "PostgreSQL Backups"
- **Icon:** CircleStackIcon
- **Path:** `/postgres-backups`
- **Badge:** Premium feature

### Added to Routing
- Route: `/postgres-backups`
- Component: `PostgresBackups`
- Protected route (requires authentication)

## API Integration (Frontend Ready)

### Queries
1. **Fetch PostgreSQL Instances**
   - Endpoint: `GET /postgres/instances`
   - Query Key: `['postgres-instances']`

2. **Fetch VPS Instances**
   - Endpoint: `GET /vps/instances`
   - Query Key: `['vps-instances']`

### Mutations
1. **Create Backup**
   - Endpoint: `POST /postgres/backup`
   - Payload:
     ```json
     {
       "postgres_instance_id": 1,
       "destination_type": "local" | "vps",
       "vps_instance_id": 2  // Only if destination_type is "vps"
     }
     ```
   - For local: Expects SQL dump in response body
   - For VPS: Expects success message

## Files Created/Modified

### Created:
- `frontend/src/pages/PostgresBackups/index.tsx` - Main page component

### Modified:
- `frontend/src/App.tsx` - Added route and import
- `frontend/src/components/Layout.tsx` - Added navigation item

## Backend Requirements (To Be Implemented)

### Endpoint: `POST /postgres/backup`

**Request Body:**
```json
{
  "postgres_instance_id": 1,
  "destination_type": "local" | "vps",
  "vps_instance_id": 2  // Optional, required if destination_type is "vps"
}
```

**For Local Download:**
- Use `pg_dump` to create SQL dump
- Return SQL dump as response body
- Content-Type: `application/sql`
- Frontend will trigger browser download

**For VPS Upload:**
- Use `pg_dump` to create SQL dump
- Connect to VPS via SSH
- Upload dump file to VPS backup path
- Return success message

**Error Handling:**
- Invalid instance ID
- Connection failures
- SSH failures (for VPS)
- Insufficient permissions

## Testing Checklist

- [ ] Page loads without errors
- [ ] PostgreSQL instances list displays correctly
- [ ] Empty state shows when no instances
- [ ] "Create Backup" button opens modal
- [ ] Modal shows correct instance information
- [ ] Local download option is selectable
- [ ] VPS upload option is selectable
- [ ] VPS upload is disabled when no VPS instances
- [ ] VPS dropdown shows all VPS instances
- [ ] Cancel button closes modal
- [ ] Create Backup button shows loading state
- [ ] Validation works (VPS destination requires VPS selection)
- [ ] Mobile responsive design works
- [ ] Navigation link works in sidebar
- [ ] Premium badge shows on navigation item

## Next Steps

1. **Backend Implementation**
   - Create `/postgres/backup` endpoint
   - Implement pg_dump functionality
   - Implement SSH upload to VPS
   - Add error handling

2. **Enhancements** (Optional)
   - Backup history/logs
   - Scheduled backups
   - Backup restoration feature
   - Compression options
   - Custom backup naming

## Status
✅ UI Complete and ready for validation
⏳ Backend implementation pending
