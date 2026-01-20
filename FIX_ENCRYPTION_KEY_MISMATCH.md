# Fix: Encryption Key Mismatch

## Problem

Error: `failed to decrypt password: cipher: message authentication failed`

This happens when:
1. PostgreSQL password was encrypted with Key A
2. Backend is now using Key B to decrypt
3. Keys don't match → decryption fails

## Quick Fix (Temporary)

I've updated `.env` to use the first 32 characters of the old default key:

```env
ENCRYPTION_KEY=default-encryption-key-change-i
```

**Restart backend:**
```bash
cd backend
go run main.go
```

This should work for now, but it's not secure for production.

## Proper Fix (Recommended)

### Option 1: Re-enter PostgreSQL Password

1. Go to **Instances** page
2. Find your PostgreSQL instance
3. Click **Edit**
4. Re-enter the password
5. Click **Save**

This will re-encrypt the password with the current key.

### Option 2: Update All Instances

If you have multiple PostgreSQL/VPS instances:

1. Go to **Instances** page
2. For each instance:
   - Click **Edit**
   - Re-enter the password
   - Click **Save**

### Option 3: Use SQL to Check Encrypted Data

Check which instances need password re-entry:

```sql
-- Connect to database
docker exec -it rustfs-manager-db psql -U rustfs_user -d rustfs_manager

-- Check PostgreSQL instances
SELECT id, name, host, database FROM postgres_instances;

-- Check VPS instances
SELECT id, name, host FROM vps_instances;
```

Then update each one through the UI.

## Why This Happened

### Timeline:

1. **Initially**: Backend used default key `"default-encryption-key-change-in-production"` (43 chars)
2. **You added**: PostgreSQL instance → password encrypted with 43-char key
3. **We fixed**: Changed to 32-char key for AES-256
4. **Problem**: Old encrypted password can't be decrypted with new key

### The Fix:

- **Temporary**: Use first 32 chars of old key (backward compatible)
- **Permanent**: Re-encrypt all passwords with new secure key

## Step-by-Step: Proper Migration

### Step 1: Use Old Key Temporarily

```env
# .env
ENCRYPTION_KEY=default-encryption-key-change-i
```

Restart backend.

### Step 2: Re-enter All Passwords

For each PostgreSQL instance:
1. Edit instance
2. Re-enter password
3. Save

For each VPS instance:
1. Edit instance
2. Re-enter password
3. Save

### Step 3: Switch to Secure Key

Generate a secure key:
```bash
openssl rand -base64 32 | head -c 32
```

Update `.env`:
```env
ENCRYPTION_KEY=<your-secure-32-char-key>
```

Restart backend.

### Step 4: Verify

1. Test PostgreSQL connection
2. Create a backup
3. Should work without errors

## Alternative: SQL Update Script

If you know the plaintext passwords, you can update them directly:

```sql
-- WARNING: This is for reference only
-- Better to use the UI to re-enter passwords

-- Update PostgreSQL instance password
UPDATE postgres_instances 
SET password = '<new-encrypted-password>' 
WHERE id = 1;

-- Update VPS instance password
UPDATE vps_instances 
SET password = '<new-encrypted-password>' 
WHERE id = 1;
```

But you'd need to encrypt the password first using the new key, which is complex.

## Production Recommendations

### 1. Use Environment-Specific Keys

```env
# Development
ENCRYPTION_KEY=dev-key-32-characters-long-12

# Staging
ENCRYPTION_KEY=staging-key-32-chars-long-123

# Production
ENCRYPTION_KEY=<secure-random-32-char-key>
```

### 2. Key Rotation Strategy

When rotating keys:

1. Keep old key as `OLD_ENCRYPTION_KEY`
2. Add new key as `ENCRYPTION_KEY`
3. Decrypt with old, re-encrypt with new
4. Remove old key after migration

### 3. Key Management

- Store in secrets manager (AWS Secrets Manager, HashiCorp Vault)
- Never commit to version control
- Use different keys per environment
- Document key rotation procedures

## Current Status

✅ **Temporary Fix Applied**: Using first 32 chars of old default key

⚠️ **Action Required**: Re-enter passwords for all instances

🔒 **Security Note**: Current key is not secure for production

## Testing Checklist

After fixing:

- [ ] Backend restarts without errors
- [ ] Can view PostgreSQL instances
- [ ] Can test PostgreSQL connection
- [ ] Can create backup successfully
- [ ] Can download backup
- [ ] No encryption errors in logs

## Troubleshooting

### Still Getting Error?

**Check 1: Verify key length**
```bash
echo -n "default-encryption-key-change-i" | wc -c
# Should output: 32
```

**Check 2: Backend loaded correct key**
```bash
docker-compose logs backend | grep -i encryption
```

**Check 3: Test with a new instance**
- Create a new PostgreSQL instance
- Enter password
- Try to create backup
- Should work (new password encrypted with current key)

### Different Error?

If you get a different error, the password might be:
- Not encrypted at all (stored as plaintext)
- Encrypted with a completely different key
- Corrupted in database

In this case, you MUST re-enter the password through the UI.

## Summary

**Current Solution:**
- Using `ENCRYPTION_KEY=default-encryption-key-change-i` (32 chars)
- This matches the first 32 chars of the old default key
- Allows decryption of existing passwords

**Next Steps:**
1. Restart backend with current key
2. Test backup creation
3. Plan to re-enter passwords with secure key
4. Update to secure key in production

---

**Status**: ⚠️ Temporary fix applied, permanent fix recommended
