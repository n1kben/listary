# Enable Real-time Updates

If you need to reload the page to see updates, it means Realtime is not yet enabled in your Supabase project.

## Steps to Enable Realtime:

### Method 1: Via SQL (Easiest)

The SQL migration already includes the commands to enable realtime. Just make sure you run the complete `supabase-migration.sql` file, including the last few lines:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE lists;
ALTER PUBLICATION supabase_realtime ADD TABLE list_items;
ALTER PUBLICATION supabase_realtime ADD TABLE user_preferences;
```

### Method 2: Via Supabase Dashboard

1. Go to your Supabase project dashboard: https://supabase.com
2. Navigate to **Database** → **Replication** in the sidebar
3. You should see a list of your tables
4. Find these tables and enable replication for each:
   - ✅ `lists`
   - ✅ `list_items`
   - ✅ `user_preferences`
5. Click the toggle switch next to each table to enable it

## Verify It's Working

After enabling realtime:

1. Open your app in **two different browser windows** (or use incognito)
2. Sign in with the same account in both windows
3. Add a list or item in one window
4. You should see it appear **immediately** in the other window (no refresh needed!)

## Troubleshooting

### Still need to reload?

1. **Check the browser console** for any errors related to realtime subscriptions
2. **Verify tables are enabled** in Database → Replication
3. **Check Supabase status**: Sometimes there are service issues at status.supabase.com
4. **Restart your dev server**: `pnpm dev`

### Realtime quota

Supabase free tier includes:
- 2 GB database space
- 500 MB database storage
- Unlimited realtime connections (but with bandwidth limits)

If you're on the free tier and hitting limits, consider:
- Upgrading to Pro plan
- Reducing frequency of updates
- Using polling instead of realtime (less ideal)

## How It Works

The app uses Supabase Realtime via PostgreSQL's replication feature:

1. When data changes in the database, PostgreSQL triggers a notification
2. Supabase Realtime captures this notification
3. The notification is sent to all subscribed clients via WebSocket
4. Your app receives the notification and refetches the data

This happens in:
- `src/hooks/useSupabaseLists.ts` - Lines 78-103
- `src/hooks/useSupabasePreferences.ts` - Lines 88-103

## Performance Notes

- Realtime subscriptions are efficient (WebSocket-based)
- Only changed data triggers updates
- Multiple users can collaborate in real-time
- Works great for syncing across devices!
