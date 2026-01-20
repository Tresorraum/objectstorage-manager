# Encryption Key Fix

## Problem

The backup failed with error:
```
failed to decrypt password: crypto/aes: invalid key size 43
```

## Root Cause

AES encryption requires a key that is exactly:
- 16 bytes (AES-128)
- 24 bytes (AES-192)
- 32 bytes (AES-256) ← We use this

The `ENCRYPTION_KEY` environment variable was either:
1. Not set (using default which was wrong size)
2. Set to wrong size

## Solution

### 1. Added Proper Encryption Key

Updated `.env` file with a 32-byte encryption key:

```env
ENCRYPTION_KEY=SYieUxWBYQ7lOVWIyC57G3dA4O4gKl2M
```

### 2. Restart Backend

**If running directly:**
```bash
# Stop backend (Ctrl+C)
cd backend
go run main.go
```

**If using Docker:**
```bash
docker-compose restart backend
```

### 3. Verify Key is Loaded

Check backend logs on startup:
```
Starting RustFS Manager API on port 8080
```

If you see:
```
WARNING: Using default encryption key. Set ENCRYPTION_KEY environment variable in production!
```

Then the key is NOT being loaded. Make sure:
- `.env` file is in the project root
- Backend is reading from `.env`
- Key is exactly 32 characters

## How to Generate a Secure Key

### Option 1: Using OpenSSL
```bash
openssl rand -base64 32 | head -c 32
```

### Option 2: Using Python
```python
import secrets
print(secrets.token_urlsafe(32)[:32])
```

### Option 3: Using Node.js
```javascript
require('crypto').randomBytes(32).toString('base64').slice(0, 32)
```

### Option 4: Online (use with caution)
```bash
# Generate random 32 characters
cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1
```

## Important Notes

1. **Key Length**: Must be exactly 32 bytes (characters) for AES-256
2. **Security**: Use a cryptographically secure random key
3. **Backup**: Save the key securely - if you lose it, you can't decrypt existing data
4. **Production**: Never commit the real key to version control
5. **Rotation**: Consider key rotation strategy for production

## Testing

After restarting the backend:

1. Go to Backups → Advanced tab
2. Select a database
3. Create a new backup
4. Should work without encryption errors

## Troubleshooting

### Still Getting Error?

**Check 1: Key Length**
```bash
echo -n "$ENCRYPTION_KEY" | wc -c
# Should output: 32
```

**Check 2: Backend Loaded Key**
```bash
# Check backend logs
docker-compose logs backend | grep -i encryption
```

**Check 3: Environment Variable**
```bash
# Inside backend container
docker exec rustfs-manager-api env | grep ENCRYPTION_KEY
```

### Key Too Short/Long?

If your key is not 32 bytes:

**Too Short:** Pad with characters
```bash
# If key is 28 bytes, add 4 more characters
ENCRYPTION_KEY=YourKey1234567890123456789012
```

**Too Long:** Truncate to 32
```bash
# Take first 32 characters
ENCRYPTION_KEY=$(echo "YourLongKey..." | head -c 32)
```

## What This Key Encrypts

The `ENCRYPTION_KEY` is used to encrypt:

1. **PostgreSQL passwords** - When storing in database
2. **VPS passwords** - When storing in database
3. **Backup data** - When encryption is enabled for backups
4. **Object storage credentials** - When storing in database

## Migration Note

If you already have encrypted data in the database with the old key:

1. **Option A**: Keep old key (if you know what it was)
2. **Option B**: Re-enter all passwords with new key
3. **Option C**: Decrypt with old key, re-encrypt with new key (requires script)

For new installations, just use the new key from the start.

## Status

✅ **FIXED** - Encryption key is now properly configured with 32 bytes

## Next Steps

1. ✅ Restart backend
2. ✅ Test backup creation
3. ✅ Verify no encryption errors
4. ✅ Test with encryption enabled
5. ✅ Test with encryption disabled

---

**Security Reminder:** Keep your encryption key secure and never share it publicly!
