# Where to Find Site URL and Redirect URLs in Supabase

## Current Location (What You're Seeing)
You're currently in: **Authentication → Email Templates**

This is where you edit the email template design, but **NOT** where you set the redirect URLs.

## Where You Need to Go

### Step 1: Look at the Left Sidebar
In the left sidebar, under **"CONFIGURATION"**, you'll see:
- Policies
- Sign In / Providers
- OAuth Server
- Sessions
- Rate Limits
- Multi-Factor
- **URL Configuration** ← **CLICK THIS ONE!**
- Attack Protection
- Auth Hooks
- Audit Logs

### Step 2: Click "URL Configuration"
Click on **"URL Configuration"** in the left sidebar (under CONFIGURATION section).

### Step 3: You'll See These Fields

Once you click "URL Configuration", you'll see:

1. **Site URL** (at the top)
   - This is the main field that controls where all email links redirect
   - **Change this to**: `https://happy-ocean-08bd11c10.2.azurestaticapps.net`

2. **Redirect URLs** (below Site URL)
   - This is a list/textarea where you add allowed redirect destinations
   - **Add these**:
     ```
     https://happy-ocean-08bd11c10.2.azurestaticapps.net/reset-password
     https://happy-ocean-08bd11c10.2.azurestaticapps.net/*
     ```

## Visual Path

```
Supabase Dashboard
└── Authentication (left sidebar)
    └── CONFIGURATION (section)
        └── URL Configuration ← CLICK HERE
            ├── Site URL (field at top)
            └── Redirect URLs (list/textarea below)
```

## Direct Link

Or go directly to:
```
https://supabase.com/dashboard/project/kwqabttdbdslmjzbcppo/settings/auth/url-configuration
```

## Summary

**You're currently in**: Email Templates (for editing email design)
**You need to go to**: URL Configuration (for setting redirect URLs)

Look for **"URL Configuration"** in the left sidebar under the **"CONFIGURATION"** section!
