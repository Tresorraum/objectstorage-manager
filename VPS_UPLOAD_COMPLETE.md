# VPS Upload Feature - Complete ✅

## Overview
Implemented full VPS upload functionality for PostgreSQL backups using SSH/SFTP.

## What Was Implemented

### 1. SFTP File Upload
- Uses SSH connection to VPS
- Creates SFTP client for file transfer
- Uploads SQL dump files to VPS backup directory

### 2. Authentication Support
- **Password Authentication** - Uses encrypted password
- **SSH Key Authentication** - Uses encrypted private key
- Automatic method selection based on VPS configuration

### 3. Directory Management
- Automatically creates backup directory on VPS if it doesn't exist
- Uses `MkdirAll` for recursive directory creation
- Respects configured backup path from VPS instance

### 4. File Transfer Process
1. Create PostgreSQL backup dump (SQL file)
2. Write to temporary file on server
3. Establish SSH connection to VPS
4. Create SFTP client
5. Ensure backup directory exists
6. Upload file via SFTP
7. Clean up temporary file
8. Return destination path

## Technical Implementation

### SSH Connection
```go
config := &ssh.ClientConfig{
    User: vpsInstance.Username,
    Auth: []ssh.AuthMethod{authMethod},
    HostKeyCallback: ssh.InsecureIgnoreHostKey(),
    Timeout: 30 * time.Second,
}

client, err := ssh.Dial("tcp", addr, config)
```

### SFTP Upload
```go
sftpClient, err := sftp.NewClient(client)
sftpClient.MkdirAll(vpsInstance.BackupPath)
dstFile, err := sftpClient.Create(destPath)
io.Copy(dstFile, srcFile)
```

### Authentication Methods
```go
// Password
authMethod = ssh.Password(password)

// SSH Key
signer, err := ssh.ParsePrivateKey([]byte(sshKey))
authMethod = ssh.PublicKeys(signer)
```

## Dependencies Added

### Go Packages
- `github.com/pkg/sftp` - SFTP client library
- `golang.org/x/crypto/ssh` - SSH client (already present)

### Installation
```bash
go get github.com/pkg/sftp
go mod tidy
```

## Security Features

1. **Encrypted Credentials**
   - VPS passwords encrypted with AES-256-GCM
   - SSH keys encrypted with AES-256-GCM
   - Decrypted only in memory during upload

2. **Secure File Permissions**
   - Temporary files created with 0600 permissions
   - Only owner can read/write

3. **Automatic Cleanup**
   - Temporary files deleted after upload
   - Uses `defer` for guaranteed cleanup

4. **Connection Timeout**
   - 30-second timeout for SSH connections
   - Prevents hanging connections

## File Naming

**Format:** `{database}_{timestamp}.sql`

**Example:** `rustfs_manager_20260119_201006.sql`

**Timestamp Format:** `YYYYMMDD_HHMMSS`

## Error Handling

Comprehensive error handling for:
- SSH key decryption failures
- Password decryption failures
- SSH key parsing errors
- Connection failures
- SFTP client creation failures
- Directory creation failures
- File upload failures
- Temporary file operations

## Usage Flow

### From UI:
1. User goes to Backups → PostgreSQL tab
2. Clicks "Create Backup" on a database
3. Selects "Upload to VPS"
4. Chooses VPS instance from dropdown
5. Clicks "Create Backup"

### Backend Process:
1. Validates request and permissions
2. Creates SQL dump using pg_dump
3. Writes to temp file
4. Connects to VPS via SSH
5. Creates SFTP client
6. Ensures backup directory exists
7. Uploads file
8. Returns success with backup path

## Response

### Success Response:
```json
{
  "message": "Backup uploaded to VPS successfully",
  "backup_path": "/home/user/backups/rustfs_manager_20260119_201006.sql"
}
```

### Error Response:
```json
{
  "error": "Failed to upload backup to VPS: {error details}"
}
```

## Testing

### Test VPS Upload:
```bash
curl -X POST http://localhost:8080/api/v1/postgres/backup \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "postgres_instance_id": 1,
    "destination_type": "vps",
    "vps_instance_id": 1
  }'
```

### Verify on VPS:
```bash
ssh user@vps-host
ls -lh /path/to/backup/directory/
```

## Files Modified

- `backend/internal/services/postgres.go` - Implemented VPS upload
- `backend/go.mod` - Added sftp dependency
- `backend/go.sum` - Updated checksums

## Known Limitations

1. **Host Key Verification**
   - Currently uses `InsecureIgnoreHostKey()`
   - TODO: Implement proper host key verification
   - Security risk: Vulnerable to MITM attacks

2. **No Progress Tracking**
   - Large files have no progress indicator
   - User doesn't know upload status

3. **No Retry Logic**
   - Single attempt only
   - Network failures cause complete failure

4. **No Bandwidth Limiting**
   - Could saturate network connection
   - No throttling mechanism

## Future Enhancements

1. **Host Key Verification**
   - Store known host keys
   - Verify on each connection
   - Warn on key changes

2. **Progress Tracking**
   - WebSocket for real-time progress
   - Show upload percentage
   - Estimated time remaining

3. **Retry Logic**
   - Automatic retry on failure
   - Exponential backoff
   - Maximum retry attempts

4. **Compression**
   - Gzip compression before upload
   - Reduce transfer time
   - Save bandwidth

5. **Parallel Uploads**
   - Multiple file chunks
   - Faster for large files
   - Resume capability

## Status
✅ VPS upload fully implemented
✅ Password authentication working
✅ SSH key authentication working
✅ Directory creation working
✅ File upload working
✅ Error handling complete
⚠️ Host key verification disabled (security risk)
⏳ Progress tracking (future)
⏳ Retry logic (future)

## Success!
The PostgreSQL backup feature is now fully functional with both local download and VPS upload options! 🎉
