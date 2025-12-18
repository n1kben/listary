# LocalStorage to Supabase Migration

## Overview

Your app now automatically migrates existing localStorage data when users create an account or sign in! 🎉

## How It Works

### 1. **Detection**

When a user signs up or signs in, the app checks if there's any existing data in localStorage:
- Lists and items
- User preferences (theme, default list, placement settings)

### 2. **Migration Dialog**

If localStorage data is found, the user sees a friendly dialog:

```
┌─────────────────────────────────────────┐
│ Welcome! Migrate Your Data?             │
│                                         │
│ We found existing data on this device: │
│ • 3 lists                               │
│ • 12 items                              │
│                                         │
│ Would you like to migrate this data to │
│ your new account?                       │
│                                         │
│  [Skip Migration]  [Migrate Data]      │
└─────────────────────────────────────────┘
```

### 3. **Migration Process**

If the user clicks "Migrate Data":

1. **Lists are migrated** - Each list is created in Supabase with the same name, color, and order
2. **Items are migrated** - All items within each list are preserved with their completion status and order
3. **Preferences are migrated** - Theme, default list, and placement settings are transferred
4. **localStorage is cleared** - After successful migration, localStorage data is removed to prevent confusion

If the user clicks "Skip Migration":
- No data is migrated
- localStorage is cleared anyway to prevent the dialog from showing again

## What Gets Migrated

### Lists
- ✅ List name
- ✅ List color
- ✅ List order (position)

### Items
- ✅ Item text
- ✅ Completion status (checked/unchecked)
- ✅ Item order (position within list)

### Preferences
- ✅ Theme (light/dark/system)
- ✅ Default list
- ✅ New list placement (top/bottom)
- ✅ New item placement (top/bottom)

## Technical Details

### Files Created

```
src/
├── utils/
│   └── migrateLocalStorage.ts         # Utilities to detect and read localStorage
├── services/
│   └── migrationService.ts            # Service to migrate data to Supabase
└── components/
    ├── MigrationDialog.tsx            # UI dialog for migration
    └── MigrationHandler.tsx           # Component that orchestrates migration
```

### Migration Flow

```
User signs in/up
    ↓
MigrationHandler checks localStorage
    ↓
Found data? → Show MigrationDialog
    ↓
User chooses:
    ├─ Migrate → migrateDataToSupabase()
    │               ↓
    │           Create lists in Supabase
    │               ↓
    │           Create items for each list
    │               ↓
    │           Create user preferences
    │               ↓
    │           clearLocalStorageData()
    │               ↓
    │           Success! ✅
    │
    └─ Skip → clearLocalStorageData()
                  ↓
              Dialog dismissed
```

### Error Handling

If migration fails:
- User sees an error message
- localStorage data is **NOT** cleared (so they can try again)
- User can retry the migration
- User can skip and manually re-create their data

## User Experience

### First-Time Users
- No migration dialog (nothing in localStorage)
- Clean onboarding experience

### Existing Users
- Migration dialog appears immediately after sign-up/sign-in
- One-time migration process
- Dialog won't appear again after migration or skip

### Returning Users
- No migration dialog (localStorage already cleared)
- Data loads from Supabase

## Testing the Migration

### Setup Test Data

1. Before signing up, open browser console and run:

```javascript
localStorage.setItem('listary-lists', JSON.stringify([
  {
    id: '1',
    name: 'Test List',
    color: '#FF6B6B',
    order: 0,
    items: [
      { id: '1-1', text: 'Test Item', completed: false, order: 0 }
    ]
  }
]));
localStorage.setItem('listary-theme', 'dark');
```

2. Sign up for a new account
3. Migration dialog should appear
4. Click "Migrate Data"
5. Verify data appears in your lists

### Test Scenarios

**Scenario 1: Successful Migration**
- ✅ localStorage has data
- ✅ User signs up
- ✅ Dialog appears
- ✅ User clicks "Migrate Data"
- ✅ Data appears in Supabase
- ✅ localStorage is cleared

**Scenario 2: Skip Migration**
- ✅ localStorage has data
- ✅ User signs up
- ✅ Dialog appears
- ✅ User clicks "Skip Migration"
- ✅ localStorage is cleared
- ✅ User starts fresh

**Scenario 3: No Migration Needed**
- ✅ No localStorage data
- ✅ User signs up
- ✅ No dialog appears
- ✅ User starts fresh

## Troubleshooting

### Migration Dialog Doesn't Appear

Check if localStorage has data:
```javascript
console.log(localStorage.getItem('listary-lists'));
```

If it returns `null` or `[]`, there's no data to migrate.

### Migration Fails

1. Check browser console for errors
2. Verify Supabase connection
3. Check that RLS policies allow inserts
4. Ensure user is authenticated

### Dialog Appears Multiple Times

This shouldn't happen, but if it does:
- localStorage wasn't properly cleared
- Check browser console for errors
- Manually clear localStorage:
  ```javascript
  localStorage.clear();
  ```

## Security

- Migration only happens for authenticated users
- User ID is used to associate migrated data
- Row Level Security (RLS) ensures data isolation
- localStorage is cleared after migration to prevent data leakage

## Future Enhancements

Possible improvements:
- Progress indicator during migration
- Partial migration (let users choose which lists to migrate)
- Migration history/log
- Undo migration option
- Export migration report

---

**Congratulations!** Your users can now seamlessly migrate their local data to the cloud! 🚀
