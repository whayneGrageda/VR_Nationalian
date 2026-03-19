# Supabase Integration Setup Guide

## Overview
Connect your Unity game to Supabase database for user authentication, chapter progress tracking, and achievements.

---

## Part 1: Create Supabase Config Asset

### Step 1: Create Config Asset
1. In Unity Project panel, right-click in **Assets** folder
2. Select **Create > Config > Supabase Config**
3. Rename to "SupabaseConfig"

### Step 2: Configure Supabase Settings
1. Select **SupabaseConfig** in Project panel
2. In Inspector, fill in your Supabase details:
   - **Supabase Url**: Your project URL (e.g., `https://xxxxx.supabase.co`)
   - **Supabase Anon Key**: Your anon/public API key
3. Leave the endpoint fields as default (they're already set correctly)

### Where to Find Your Supabase Credentials:
1. Go to your Supabase project dashboard
2. Click **Settings** (gear icon) in left sidebar
3. Click **API** section
4. Copy:
   - **Project URL** → paste into Supabase Url
   - **anon public** key → paste into Supabase Anon Key

---

## Part 2: Add Supabase Manager to Loading Scene

### Step 1: Open LoadingScene
1. Double-click **LoadingScene** in Project panel

### Step 2: Create Supabase Manager
1. Right-click in Hierarchy > Create Empty
2. Rename to "SupabaseManager"
3. Add Component > **SupabaseManager** script
4. In Inspector, drag **SupabaseConfig** asset into the **Config** field

### Step 3: Verify DontDestroyOnLoad
- The SupabaseManager will persist across all scenes automatically
- It's a singleton, so only one instance will exist

---

## Part 3: Update Login Scene UI

### Step 1: Open LoginScene
1. Double-click **LoginScene** in Project panel

### Step 2: Add Status Text (Optional but Recommended)
1. Right-click **LoginPanel** > UI > Text - TextMeshPro
2. Rename to "StatusText"
3. Rect Transform:
   - Anchor preset: Hold **Alt** + click **bottom-center**
   - Width: **400**
   - Height: **30**
   - Pos X: **0**
   - Pos Y: **40**
   - Pos Z: **0**
4. TextMeshPro component:
   - Text: "" (leave empty)
   - Font Size: **18**
   - Alignment: **Center**
   - Color: **White**

### Step 3: Update LoginScreen Script References
1. Select the GameObject with **LoginScreen** script
2. In Inspector, assign:
   - Username Input → drag **UsernameInput**
   - Password Input → drag **PasswordInput**
   - Login Button → drag **LoginButton**
   - Error Text → drag **ErrorText**
   - Status Text → drag **StatusText** (if you created it)

---

## Part 4: Testing

### Test with Existing User (if you have one):
1. Click Play
2. Wait for loading screen
3. Enter username and password
4. Click Login
5. Should see "Logging in..." then "Login successful!"
6. Should load LobbyScene

### Test with Wrong Credentials:
1. Enter wrong username/password
2. Should see error message: "Invalid username or password"

### Test with Empty Fields:
1. Leave fields empty
2. Should see: "Please enter username and password"

---

## Part 5: Register New Users (Optional)

If you want to add a registration screen, you can create a new scene or add a register button to LoginScene.

The SupabaseManager already has a `Register()` function ready to use:

```csharp
SupabaseManager.Instance.Register(username, password, email, (success, message) => {
    if (success) {
        // Registration successful
    } else {
        // Show error
    }
});
```

---

## Troubleshooting

### "Supabase Manager not found"
- Make sure SupabaseManager exists in LoadingScene
- Make sure it has DontDestroyOnLoad (it does by default)
- LoadingScene must run first (should be first in Build Settings)

### "Login failed: Could not resolve host"
- Check your Supabase URL is correct
- Make sure you have internet connection
- Verify the URL starts with `https://`

### "Login failed: 401 Unauthorized"
- Check your Supabase Anon Key is correct
- Make sure you copied the full key (it's very long)

### "Invalid username or password"
- User doesn't exist in database
- Password is incorrect
- Check your Supabase database has users (run SQL script first)

### Login button stays disabled
- Check Console for errors
- Make sure SupabaseManager.Instance is not null
- Verify callback is being called

---

## What Happens on Login

1. User enters credentials
2. LoginScreen calls `SupabaseManager.Instance.Login()`
3. SupabaseManager sends POST request to Supabase
4. Supabase runs `fn_login()` function (from SQL script)
5. If valid, returns user data + JWT token
6. SupabaseManager stores:
   - User ID
   - Username
   - Token (for future API calls)
7. Data saved to PlayerPrefs for persistence
8. Loads LobbyScene

---

## Next Steps

After login works:
- Add chapter completion tracking (when all artifacts collected)
- Load user's chapter progress in LobbyScene
- Show locked/unlocked chapters based on database
- Track achievements

---

Created for NU Quest - Supabase Integration
