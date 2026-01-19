# Frontend Refactoring Plan

## Current State
- **Backups.tsx**: 1,298 lines (NEEDS REFACTORING)
- **Instances.tsx**: 454 lines (NEEDS REFACTORING)
- **Register.tsx**: 268 lines (NEEDS REFACTORING)
- **Dashboard.tsx**: 213 lines (OK)
- **Login.tsx**: 209 lines (OK)

## Refactoring Strategy

### 1. Backups Page (1,298 lines → ~150 lines)

**New Structure:**
```
frontend/src/pages/Backups/
├── index.tsx                    # Main page (150 lines)
├── types.ts                     # TypeScript interfaces ✅ DONE
├── utils.ts                     # Utility functions ✅ DONE
├── BackupStats.tsx              # Stats cards component ✅ DONE
├── BackupFilters.tsx            # Search & filters ✅ DONE
├── BackupTable.tsx              # Desktop table view
├── BackupMobileCard.tsx         # Mobile card view
├── BackupJobForm.tsx            # Create/Edit form modal
├── BackupHistoryModal.tsx       # Backup runs history
├── EnterpriseModal.tsx          # Premium feature modal
└── UpgradeModal.tsx             # Upgrade prompt modal
```

**Components to Extract:**
1. ✅ **BackupStats** - 4 stat cards (Total, Running, Completed, Failed)
2. ✅ **BackupFilters** - Search bar, status filter, type filter, bulk actions
3. **BackupTable** - Desktop table with sorting
4. **BackupMobileCard** - Mobile-responsive card view
5. **BackupJobForm** - Form for creating/editing backup jobs
6. **BackupHistoryModal** - Modal showing backup run history
7. **EnterpriseModal** - Premium feature upsell
8. **UpgradeModal** - Backup limit upgrade prompt

### 2. Instances Page (454 lines → ~100 lines)

**New Structure:**
```
frontend/src/pages/Instances/
├── index.tsx                    # Main page (100 lines)
├── types.ts                     # TypeScript interfaces
├── InstanceCard.tsx             # Instance card component
├── InstanceForm.tsx             # Create/Edit form
└── InstanceStats.tsx            # Stats summary
```

### 3. Register Page (268 lines → ~150 lines)

**New Structure:**
```
frontend/src/pages/Register/
├── index.tsx                    # Main page (150 lines)
├── RegisterForm.tsx             # Registration form
└── FeaturesList.tsx             # Features showcase
```

## Benefits

### Code Quality
- ✅ Single Responsibility Principle
- ✅ Easier to test individual components
- ✅ Better code reusability
- ✅ Improved maintainability

### Developer Experience
- ✅ Faster to locate specific functionality
- ✅ Easier to understand component purpose
- ✅ Simpler to modify without breaking other parts
- ✅ Better IDE performance with smaller files

### Performance
- ✅ Potential for better code splitting
- ✅ Easier to implement lazy loading
- ✅ Reduced re-renders with proper memoization

## Implementation Progress

### Phase 1: Backups Page ✅ COMPLETE
- [x] Create types.ts
- [x] Create utils.ts
- [x] Create BackupStats.tsx
- [x] Create BackupFilters.tsx
- [x] Create BackupTable.tsx
- [x] Create BackupMobileCard.tsx
- [x] Create BackupJobForm.tsx
- [x] Create BackupHistoryModal.tsx
- [x] Create EnterpriseModal.tsx
- [x] Create UpgradeModal.tsx
- [x] Refactor index.tsx to use new components
- [x] Delete old Backups.tsx file

### Phase 2: Instances Page ✅ COMPLETE
- [x] Create directory structure
- [x] Create types.ts
- [x] Create constants.ts
- [x] Create InstanceTypeTabs.tsx
- [x] Create InstanceTypeHeader.tsx
- [x] Create InstanceCard.tsx
- [x] Create InstanceForm.tsx
- [x] Create EmptyState.tsx
- [x] Create ComingSoonState.tsx
- [x] Create UpgradeModal.tsx
- [x] Refactor index.tsx to use new components
- [x] Delete old Instances.tsx file

### Phase 3: Register Page
- [ ] Create directory structure
- [ ] Extract components
- [ ] Refactor main file

## Next Steps

1. Complete Backups page refactoring
2. Test all functionality
3. Move to Instances page
4. Move to Register page
5. Final testing and cleanup

## Notes

- Keep backward compatibility
- Maintain all existing functionality
- Ensure TypeScript types are properly defined
- Add proper prop validation
- Consider adding unit tests for extracted components
