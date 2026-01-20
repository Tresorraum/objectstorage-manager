# PostgreSQL Backup System - Testing Guide

## Prerequisites

Before testing, ensure:

1. ✅ Backend is running: `cd backend && go run main.go`
2. ✅ Frontend is running: `cd frontend && npm run dev`
3. ✅ Database migration has been run
4. ✅ At least one PostgreSQL instance is configured
5. ✅ ENCRYPTION_KEY is set in .env

## Step-by-Step Testing

### 1. Access the Backup Interface

1. Open browser: http://localhost:3000
2. Login with your credentials
3. Navigate to **Backups** page (sidebar)
4. Click on **"Advanced"** tab
5. You should see the PostgreSQL backup interface

**Expected Result:**
- Feature overview cards displayed
- Database selector visible
- No errors in console

---

### 2. Select a Database

1. Look for the "Select Database" section
2. Click on one of your PostgreSQL databases
3. The database card should highlight in blue

**Expected Result:**
- Selected database highlighted
- "Manage backups for this database" section appears
- "Create Backup" and "Restore" buttons visible
- "Backup History" section appears (empty if no backups)

---

### 3. Create a Quick Backup (Local)

1. With a database selected, click **"Create Backup"** button
2. Wait for the backup to start

**Expected Result:**
- Toast notification: "Backup started successfully"
- Progress indicator appears showing elapsed time
- Status updates every 3 seconds
- Backup appears in history with "IN_PROGRESS" status

**Check Backend Logs:**
```bash
# You should see:
Starting backup job...
Executing pg_dump...
Backup completed successfully
```

**Check Database:**
```sql
SELECT * FROM backups ORDER BY created_at DESC LIMIT 1;
```

---

### 4. Create an Advanced Backup (Object Storage)

1. Click the **gear icon (⚙️)** next to "Create Backup"
2. Advanced configuration modal opens
3. Configure:
   - ✅ Enable Encryption: checked
   - ✅ Backup Destination: Object Storage (S3)
   - ✅ Select Object Storage: Choose an instance
   - ✅ Bucket Name: Enter "test-backups"
   - ✅ Compression Level: 5
4. Click **"Start Backup"**

**Expected Result:**
- Modal closes
- Toast notification: "Backup started successfully"
- Progress indicator appears
- Backup appears in history

**Verify:**
- Check if bucket was created in object storage
- Check if backup file exists in bucket
- Verify encryption metadata in database

---

### 5. Monitor Backup Progress

1. Watch the progress indicator
2. Note the elapsed time counter
3. Observe status updates

**Expected Result:**
- Elapsed time increases (e.g., "5s", "10s", "1m 5s")
- Current size may be displayed
- Progress bar animates
- Status badge shows "IN PROGRESS" with blue color

---

### 6. Cancel a Backup

1. While a backup is in progress, click the **X icon** in the actions column
2. Confirm if prompted

**Expected Result:**
- Toast notification: "Backup cancelled successfully"
- Status changes to "CANCELED"
- Progress indicator disappears
- Backup remains in history with CANCELED status

---

### 7. Download a Completed Backup

1. Wait for a backup to complete (status: COMPLETED)
2. Click the **download icon (⬇️)** in the actions column

**Expected Result:**
- Toast notification: "Download started"
- Browser download begins
- File downloads with .dump extension
- File size matches the backup size shown

**Verify Downloaded File:**
```bash
# Check file size
ls -lh backup_*.dump

# Verify it's a valid pg_dump file
file backup_*.dump
# Should show: PostgreSQL custom database dump
```

---

### 8. Delete a Backup

1. Find a completed or failed backup
2. Click the **trash icon (🗑️)** in the actions column
3. Confirmation modal appears
4. Review backup details
5. Click **"Delete Backup"**

**Expected Result:**
- Toast notification: "Backup deleted successfully"
- Backup removed from list
- File deleted from storage (if local)
- Database record deleted

---

### 9. View Error Details

1. If you have a failed backup, click the **error icon (⚠️)**
2. Error details modal opens

**Expected Result:**
- Modal shows error message
- Backup ID and timestamp displayed
- Error message is readable and helpful

---

### 10. Test Restore (From Existing Backup)

1. Click the **restore icon (↻)** on a completed backup
2. Restore modal opens with source backup info
3. Select a target database
4. Configure restore options:
   - ✅ Drop existing objects: unchecked
   - ✅ Create database: unchecked
   - ✅ Skip ownership restoration: checked
   - ✅ Skip privileges restoration: unchecked
5. Click **"Restore Database"**

**Expected Result:**
- Toast notification: "Database restore started successfully"
- Modal closes
- Restore process begins in background

**Verify:**
```bash
# Check backend logs for pg_restore execution
# Check target database for restored data
psql -U postgres -d target_db -c "\dt"
```

---

### 11. Test Restore (From Object Storage)

1. Click **"Restore"** button at the top
2. Select source type: **Object Storage (S3)**
3. Fill in:
   - Object Storage Instance: Choose instance
   - Bucket Name: "test-backups"
   - Backup File Key/Path: "backup_file.dump"
4. Select target database
5. Configure restore options
6. Click **"Restore Database"**

**Expected Result:**
- Backup downloaded from S3
- Restore process starts
- Toast notification confirms start

---

### 12. Test Restore (From Local File)

1. Click **"Restore"** button at the top
2. Select source type: **Local File Upload**
3. Click **"Select Backup File"**
4. Choose a .dump file from your computer
5. Select target database
6. Configure restore options
7. Click **"Restore Database"**

**Expected Result:**
- File uploads to server
- Restore process starts
- Toast notification confirms start

---

### 13. Test Pagination

1. Create multiple backups (10+)
2. Scroll to bottom of backup list
3. Click **"Next"** button

**Expected Result:**
- Next page of backups loads
- Page counter updates
- "Previous" button becomes enabled
- Showing X to Y of Z backups updates

---

### 14. Test Real-Time Updates

1. Start a backup
2. Open browser DevTools → Network tab
3. Watch for API calls

**Expected Result:**
- API call to `/backups?database_id=X` every 3 seconds
- Status updates automatically
- No manual refresh needed
- Progress indicator updates

---

### 15. Test Error Handling

**Test Invalid Database ID:**
1. Manually modify URL or API call
2. Use invalid database ID

**Expected Result:**
- Error toast notification
- Helpful error message
- No crash or blank screen

**Test Network Error:**
1. Stop backend server
2. Try to create backup

**Expected Result:**
- Error toast notification
- "Failed to start backup" message
- UI remains functional

---

### 16. Test Encryption

1. Create backup with encryption enabled
2. Check database for encryption metadata:
```sql
SELECT id, encryption, encryption_salt, encryption_iv 
FROM backups 
WHERE encryption = 'ENCRYPTED' 
ORDER BY created_at DESC 
LIMIT 1;
```

**Expected Result:**
- encryption = 'ENCRYPTED'
- encryption_salt is not null (base64 string)
- encryption_iv is not null (base64 string)

---

### 17. Test Compression Levels

1. Create 3 backups of the same database:
   - Compression level 0 (no compression)
   - Compression level 5 (balanced)
   - Compression level 9 (maximum)
2. Compare backup sizes

**Expected Result:**
- Level 0: Largest file size, fastest
- Level 5: Medium file size, medium speed
- Level 9: Smallest file size, slowest
- All backups complete successfully

---

### 18. Test VPS Destination

1. Configure a VPS instance first
2. Create backup with VPS destination
3. Select VPS instance
4. Start backup

**Expected Result:**
- Backup uploads to VPS
- File appears in VPS backup path
- Status shows COMPLETED

**Verify on VPS:**
```bash
ssh user@vps-host
ls -lh /path/to/backups/
```

---

### 19. Test Multiple Databases

1. Configure multiple PostgreSQL instances
2. Switch between databases
3. Create backups for each
4. Verify backups are isolated

**Expected Result:**
- Each database has its own backup list
- Backups don't mix between databases
- Pagination works per database

---

### 20. Test UI Responsiveness

1. Resize browser window
2. Test on mobile viewport (DevTools)
3. Check all buttons and modals

**Expected Result:**
- Layout adapts to screen size
- All features accessible on mobile
- No horizontal scrolling
- Buttons remain clickable

---

## Performance Testing

### Test Large Database Backup

1. Create backup of large database (1GB+)
2. Monitor:
   - Memory usage
   - CPU usage
   - Network traffic
   - Backup duration

**Expected Result:**
- No memory leaks
- Reasonable CPU usage
- Streaming works (no temp files)
- Progress updates regularly

---

### Test Concurrent Backups

1. Try to create multiple backups simultaneously
2. Check if system handles it correctly

**Expected Result:**
- Warning shown if backup in progress
- Cannot start new backup until current completes
- Or: Multiple backups queue properly

---

## Security Testing

### Test Authentication

1. Logout
2. Try to access `/backups` API directly
3. Should be rejected

**Expected Result:**
- 401 Unauthorized response
- Redirect to login page

---

### Test Authorization

1. Login as User A
2. Try to access User B's backups
3. Should be rejected

**Expected Result:**
- 403 Forbidden or 404 Not Found
- Cannot see other users' backups

---

### Test Download Token

1. Generate download token
2. Wait 6 minutes (token expires after 5 minutes)
3. Try to download with expired token

**Expected Result:**
- Download fails
- Error message about expired token
- Need to generate new token

---

## Troubleshooting

### Backup Fails Immediately

**Check:**
- PostgreSQL instance credentials
- Network connectivity to database
- pg_dump installed on server
- Sufficient disk space

### Backup Stuck in Progress

**Check:**
- Backend logs for errors
- Database connection
- Process still running
- Cancel and retry

### Download Fails

**Check:**
- Backup file exists
- File permissions
- Token is valid
- Network connection

### Restore Fails

**Check:**
- Target database exists
- Credentials are correct
- Backup file is valid
- pg_restore installed

---

## Success Criteria

✅ All 20 test scenarios pass
✅ No errors in browser console
✅ No errors in backend logs
✅ Database records are correct
✅ Files are created/deleted properly
✅ UI is responsive and intuitive
✅ Performance is acceptable
✅ Security checks pass

---

## Reporting Issues

If you find any issues:

1. Note the exact steps to reproduce
2. Check browser console for errors
3. Check backend logs
4. Check database state
5. Take screenshots if helpful
6. Document expected vs actual behavior

---

## Next Steps After Testing

Once all tests pass:

1. ✅ Mark integration as complete
2. ✅ Deploy to staging environment
3. ✅ Perform user acceptance testing
4. ✅ Document any edge cases found
5. ✅ Create user documentation
6. ✅ Train users on new features
7. ✅ Deploy to production

---

**Happy Testing! 🚀**
