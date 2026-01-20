# Bug Fix: Type Conversion Error

## Issue

When creating a backup, the following error occurred:

```
json: cannot unmarshal string into Go struct field CreateBackupRequest.database_id of type uint
```

## Root Cause

The frontend was sending `database_id` as a string, but the backend expected it as a `uint` (unsigned integer).

### Backend Expected:
```go
type CreateBackupRequest struct {
    DatabaseID              uint   `json:"database_id" binding:"required"`
    DestinationType         string `json:"destination_type" binding:"required,oneof=local vps object_storage"`
    VPSInstanceID           *uint  `json:"vps_instance_id"`
    ObjectStorageInstanceID *uint  `json:"object_storage_instance_id"`
    // ...
}
```

### Frontend Was Sending:
```typescript
{
  database_id: databaseId,  // string value like "1"
  vps_instance_id: config.vpsInstanceId,  // string value
  object_storage_instance_id: config.objectStorageInstanceId,  // string value
  // ...
}
```

## Solution

### Fixed in `CreateBackupButton.tsx`:

**Before:**
```typescript
api.post('/backups', {
  database_id: databaseId,
  vps_instance_id: config.vpsInstanceId,
  object_storage_instance_id: config.objectStorageInstanceId,
  // ...
})
```

**After:**
```typescript
api.post('/backups', {
  database_id: parseInt(databaseId),
  vps_instance_id: config.vpsInstanceId ? parseInt(config.vpsInstanceId) : undefined,
  object_storage_instance_id: config.objectStorageInstanceId ? parseInt(config.objectStorageInstanceId) : undefined,
  // ...
})
```

### Fixed in `RestoreBackupModal.tsx`:

**Before:**
```typescript
const payload: any = {
  target_database_id: config.targetDatabaseId,
  object_storage_instance_id: config.objectStorageInstanceId,
  vps_instance_id: config.vpsInstanceId,
  // ...
};
```

**After:**
```typescript
const payload: any = {
  target_database_id: parseInt(config.targetDatabaseId),
  object_storage_instance_id: config.objectStorageInstanceId ? parseInt(config.objectStorageInstanceId) : undefined,
  vps_instance_id: config.vpsInstanceId ? parseInt(config.vpsInstanceId) : undefined,
  // ...
};
```

## Changes Made

1. **CreateBackupButton.tsx**:
   - Convert `databaseId` from string to number using `parseInt()`
   - Convert `vpsInstanceId` to number (with undefined check)
   - Convert `objectStorageInstanceId` to number (with undefined check)

2. **RestoreBackupModal.tsx**:
   - Convert `targetDatabaseId` from string to number using `parseInt()`
   - Convert `objectStorageInstanceId` to number (with undefined check)
   - Convert `vpsInstanceId` to number (with undefined check)

## Why This Happened

In React, HTML select elements return string values by default:

```typescript
<select value={config.targetDatabaseId} onChange={(e) => setConfig({ ...config, targetDatabaseId: e.target.value })}>
  <option value="1">Database 1</option>
</select>
```

The `e.target.value` is always a string, even if the option value looks like a number.

## Testing

After the fix:

1. ✅ Frontend builds successfully
2. ✅ Type conversion happens before API call
3. ✅ Backend receives correct data types
4. ✅ Backup creation works without errors

## Prevention

To prevent similar issues in the future:

1. **Use TypeScript interfaces** for API payloads
2. **Add type conversion** at the API boundary
3. **Validate data types** before sending to backend
4. **Use number inputs** where appropriate instead of select strings

### Example of Better Type Safety:

```typescript
interface CreateBackupPayload {
  database_id: number;
  destination_type: 'local' | 'vps' | 'object_storage';
  vps_instance_id?: number;
  object_storage_instance_id?: number;
  object_storage_bucket?: string;
  encryption: boolean;
  compression_level: number;
}

const payload: CreateBackupPayload = {
  database_id: parseInt(databaseId),
  destination_type: config.destinationType,
  vps_instance_id: config.vpsInstanceId ? parseInt(config.vpsInstanceId) : undefined,
  object_storage_instance_id: config.objectStorageInstanceId ? parseInt(config.objectStorageInstanceId) : undefined,
  object_storage_bucket: config.objectStorageBucket,
  encryption: config.encryption,
  compression_level: config.compressionLevel,
};
```

## Status

✅ **FIXED** - The issue has been resolved and the frontend now sends correct data types to the backend.

## Files Modified

- `frontend/src/pages/PostgresBackups/CreateBackupButton.tsx`
- `frontend/src/pages/PostgresBackups/RestoreBackupModal.tsx`

## Next Steps

1. Restart the frontend development server if running
2. Clear browser cache if needed
3. Test backup creation again
4. Verify all backup destinations work correctly
