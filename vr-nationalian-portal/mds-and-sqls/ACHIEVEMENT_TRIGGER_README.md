# First Login Achievement Trigger

## Overview
This database trigger automatically grants the "Welcome Back" achievement to students when they log in for the first time, regardless of whether they're logging in from the Unity VR game or the web portal.

## How It Works
1. When a user logs in (Unity or web), a new session is created in the `tblsessions` table
2. The trigger `trg_grant_first_login_achievement` fires after the session insert
3. The trigger checks if the user is a student (role_id = 1)
4. If yes, it automatically inserts the "Welcome Back" achievement into `tbluserachievements`
5. Uses `ON CONFLICT DO NOTHING` to prevent duplicate achievements

## Installation

### Step 1: Run the SQL Migration
Execute the SQL file in your Supabase SQL Editor:

```bash
# Copy the contents of GRANT_FIRST_LOGIN_ACHIEVEMENT.sql
# Paste into Supabase Dashboard > SQL Editor > New Query
# Click "Run"
```

Or via command line:
```bash
psql -h your-supabase-host -U postgres -d postgres -f GRANT_FIRST_LOGIN_ACHIEVEMENT.sql
```

### Step 2: Verify Installation
Run this query to confirm the trigger was created:

```sql
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'trg_grant_first_login_achievement';
```

You should see:
- trigger_name: `trg_grant_first_login_achievement`
- event_manipulation: `INSERT`
- event_object_table: `tblsessions`

## Testing

### Test 1: Create a new student and log in
```sql
-- The student should automatically receive the "Welcome Back" achievement
SELECT ua.*, a.achievement_name 
FROM tbluserachievements ua
JOIN tblachievements a ON ua.achievement_id = a.achievement_id
WHERE ua.user_id = 'YOUR_TEST_USER_ID'
AND a.achievement_key = 'first_login';
```

### Test 2: Log in again
The trigger should not create duplicate achievements (handled by UNIQUE constraint).

## Benefits
- ✅ Works for both Unity VR and web portal logins
- ✅ Automatic - no application code needed
- ✅ Prevents duplicates with database constraints
- ✅ Centralized logic at database level
- ✅ Consistent behavior across all platforms

## Troubleshooting

### Achievement not granted?
1. Check if the achievement exists:
```sql
SELECT * FROM tblachievements WHERE achievement_key = 'first_login';
```

2. Check if user is a student:
```sql
SELECT user_id, username, role_id FROM tblusers WHERE user_id = 'YOUR_USER_ID';
```

3. Check trigger logs (if enabled in Supabase)

### Remove the trigger
If you need to remove the trigger:
```sql
DROP TRIGGER IF EXISTS trg_grant_first_login_achievement ON tblsessions;
DROP FUNCTION IF EXISTS fn_grant_first_login_achievement();
```
