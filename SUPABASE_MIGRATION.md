# Supabase Migration Guide

## Overview

Your Listary app has been successfully migrated from local storage to Supabase with full user authentication! 🎉

## What Changed

### 1. **Authentication**
- Users must now sign up/sign in to use the app
- Email/password authentication via Supabase Auth
- Session management with automatic token refresh
- Sign out functionality in Settings

### 2. **Data Storage**
- All data now stored in Supabase PostgreSQL database
- Data synced across devices for authenticated users
- Real-time updates when data changes
- Row Level Security (RLS) ensures users can only access their own data

### 3. **Database Schema**

Three tables were created:

#### `lists`
- `id` (UUID, primary key)
- `user_id` (UUID, references auth.users)
- `name` (text)
- `color` (text)
- `order` (integer)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

#### `list_items`
- `id` (UUID, primary key)
- `list_id` (UUID, references lists)
- `text` (text)
- `completed` (boolean)
- `order` (integer)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

#### `user_preferences`
- `user_id` (UUID, primary key, references auth.users)
- `default_list_id` (UUID, references lists)
- `theme` (text: 'light', 'dark', or 'system')
- `new_list_placement` (text: 'top' or 'bottom')
- `new_item_placement` (text: 'top' or 'bottom')
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

## Next Steps

### 1. **Run the SQL Migration** ⚠️ IMPORTANT

You need to run the SQL migration in your Supabase dashboard:

1. Go to https://supabase.com
2. Navigate to your project
3. Click on **SQL Editor** in the sidebar
4. Click **New Query**
5. Copy the **ENTIRE** contents of `supabase-migration.sql` and paste it
6. Click **Run** to execute the migration

This will create all the necessary tables, indexes, RLS policies, triggers, AND enable realtime updates.

**Important:** Make sure you run the ENTIRE file, including the last few lines that enable realtime:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE lists;
ALTER PUBLICATION supabase_realtime ADD TABLE list_items;
ALTER PUBLICATION supabase_realtime ADD TABLE user_preferences;
```

### 1.1 **Enable Realtime (Required for Live Updates)**

After running the SQL migration, you may also need to enable replication in the dashboard:

1. Go to **Database** → **Replication** in Supabase dashboard
2. Enable these tables:
   - ✅ `lists`
   - ✅ `list_items`
   - ✅ `user_preferences`

Without this, you'll need to reload the page to see updates. See `ENABLE_REALTIME.md` for detailed instructions.

### 2. **Test the Application**

```bash
pnpm dev
```

Then:
1. Sign up for a new account
2. Create some lists and items
3. Test the settings (theme, default list, etc.)
4. Sign out and sign back in to verify data persistence
5. Try opening in a different browser/device with the same account

### 3. **Optional: Enable Email Confirmations**

By default, Supabase requires email confirmation. To customize this:

1. Go to **Authentication** → **Providers** in Supabase dashboard
2. Find **Email** provider
3. Configure:
   - **Enable email confirmations** (toggle on/off)
   - **Secure email change** (toggle on/off)

For development, you may want to disable confirmations.

### 4. **Optional: Add OAuth Providers**

Want to add Google/GitHub/etc. sign-in?

1. Go to **Authentication** → **Providers**
2. Enable desired providers (Google, GitHub, etc.)
3. Update `src/components/AuthForm.tsx` to add OAuth buttons

Example:
```tsx
import { supabase } from '@/lib/supabase';

// Add this function
const signInWithGoogle = async () => {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });
};

// Add button to AuthForm
<Button onClick={signInWithGoogle}>
  Sign in with Google
</Button>
```

## File Structure

### New Files Created

```
src/
├── lib/
│   └── supabase.ts                    # Supabase client configuration
├── types/
│   └── database.ts                    # TypeScript types for database
├── contexts/
│   └── AuthContext.tsx                # Authentication context
├── hooks/
│   ├── useSupabaseLists.ts           # Lists & items data hooks
│   └── useSupabasePreferences.ts     # User preferences hooks
├── components/
│   └── AuthForm.tsx                   # Sign in/up form
└── .env.local                         # Supabase credentials (gitignored)

supabase-migration.sql                 # Database migration SQL
```

### Modified Files

- `src/App.tsx` - Added AuthProvider and protected routes
- `src/contexts/ListContext.tsx` - Now uses Supabase hooks
- `src/contexts/ThemeContext.tsx` - Now uses Supabase for theme storage
- `src/pages/ListsPage.tsx` - Added Sign Out button

### Files No Longer Used

- `src/hooks/useLocalStorage.ts` - Can be kept for reference or deleted

## Environment Variables

The `.env.local` file contains your Supabase credentials:

```
VITE_SUPABASE_URL=https://sxqyxrmriyaqirahzcpn.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_Q11XKK_570fbW0G8IJyDYw_5xspEFRF
```

**Important:** This file is gitignored. For deployment:
1. Add these environment variables to your hosting platform (Vercel, Netlify, etc.)
2. Use the exact same variable names prefixed with `VITE_`

## Security Features

### Row Level Security (RLS)

All tables have RLS enabled with policies ensuring:
- Users can only see their own data
- Users can only modify their own data
- Cascading deletes when users delete their account

### Data Isolation

Each user's data is completely isolated through:
- `user_id` foreign key on all tables
- RLS policies checking `auth.uid()`
- Database-level constraints

## Troubleshooting

### "Missing Supabase environment variables" Error

Make sure `.env.local` exists and contains the correct credentials.

### Users Can't Sign Up

Check Supabase dashboard → Authentication → Providers → Email is enabled.

### Data Not Appearing

1. Check browser console for errors
2. Verify SQL migration ran successfully
3. Check Supabase dashboard → Table Editor to see if data exists
4. Verify RLS policies are correct in SQL Editor

### Real-time Updates Not Working

Supabase realtime is enabled by default. If issues occur:
1. Check Supabase dashboard → Database → Replication
2. Ensure tables have replication enabled

## Migration from Local Storage (Optional)

If you have existing users with localStorage data, you can create a migration script:

```tsx
// Add to your app temporarily
import { useEffect } from 'react';
import { useLists } from '@/contexts/ListContext';

function MigrateLocalStorage() {
  const { addList, addItem } = useLists();

  useEffect(() => {
    const oldLists = localStorage.getItem('listary-lists');
    if (oldLists) {
      const lists = JSON.parse(oldLists);
      // Migrate each list...
      lists.forEach(async (list) => {
        await addList(list.name);
        // Add items...
      });
      // Remove old data
      localStorage.removeItem('listary-lists');
    }
  }, []);

  return null;
}
```

## Support

If you encounter any issues:
1. Check the Supabase dashboard for error logs
2. Review the browser console for client-side errors
3. Verify your database schema matches the migration
4. Check that RLS policies are correctly applied

---

**Congratulations!** Your app now has cloud storage, user authentication, and real-time sync! 🚀
