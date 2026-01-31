# 🚨 URGENT: Fix Supabase Redirect Issue

## The Problem
Your password reset emails are redirecting to `localhost:3000` instead of your production URL. This is because **Supabase Dashboard Site URL is not configured correctly**.

## ⚠️ CRITICAL: This Must Be Fixed in Supabase Dashboard

The code is correct, but **Supabase uses the Site URL from the dashboard** as the base URL for all email links. The `redirectTo` parameter only works if it matches the Site URL or is in the allowed Redirect URLs list.

## Step-by-Step Fix (DO THIS NOW)

### 1. Go to Supabase Dashboard
Open this URL in your browser:
```
https://supabase.com/dashboard/project/kwqabttdbdslmjzbcppo/settings/auth
```

### 2. Update Site URL
- Find the **"Site URL"** field (usually at the top)
- **Current value**: Probably `http://localhost:3000` or empty
- **Change it to**: `https://happy-ocean-08bd11c10.2.azurestaticapps.net`
- ⚠️ **Remove any localhost URLs from Site URL**

### 3. Update Redirect URLs
- Scroll down to **"Redirect URLs"** section
- **Add these URLs** (one per line or comma-separated):
  ```
  https://happy-ocean-08bd11c10.2.azurestaticapps.net/reset-password
  https://happy-ocean-08bd11c10.2.azurestaticapps.net/*
  ```
- **Remove** any `localhost:3000` entries if they exist

### 4. Save Changes
- Click **"Save"** or **"Update"** button
- Wait for confirmation that settings are saved

### 5. Test Again
- Request a new password reset email
- The link should now redirect to: `https://happy-ocean-08bd11c10.2.azurestaticapps.net/reset-password`

## Why This Happens

Supabase Auth works like this:
1. **Site URL** = Base URL for all email links
2. **Redirect URLs** = Allowed redirect destinations
3. **redirectTo parameter** = Only works if it matches Site URL or is in Redirect URLs

If Site URL is `localhost:3000`, ALL email links will go to `localhost:3000`, regardless of what you pass in `redirectTo`.

## Visual Guide

In Supabase Dashboard → Settings → Auth, you should see:

```
Site URL:
https://happy-ocean-08bd11c10.2.azurestaticapps.net

Redirect URLs:
https://happy-ocean-08bd11c10.2.azurestaticapps.net/reset-password
https://happy-ocean-08bd11c10.2.azurestaticapps.net/*
```

## After Fixing

1. ✅ Request a NEW password reset email (old emails will still have the wrong URL)
2. ✅ Click the link in the NEW email
3. ✅ It should redirect to your production frontend

## Still Not Working?

If it's still redirecting to localhost:3000 after updating the dashboard:

1. **Clear browser cache** - Old redirects might be cached
2. **Request a fresh password reset** - Old emails have old URLs
3. **Check Supabase logs**: https://supabase.com/dashboard/project/kwqabttdbdslmjzbcppo/logs/explorer
4. **Verify the Site URL was saved** - Go back to settings and confirm it shows your production URL

## Quick Checklist

- [ ] Site URL = `https://happy-ocean-08bd11c10.2.azurestaticapps.net`
- [ ] Redirect URLs includes `https://happy-ocean-08bd11c10.2.azurestaticapps.net/reset-password`
- [ ] No `localhost:3000` in Site URL or Redirect URLs
- [ ] Settings are saved
- [ ] Requested a NEW password reset email
- [ ] Clicked the link from the NEW email

---

**This is a Supabase Dashboard configuration issue, not a code issue. The code is already correct.**
