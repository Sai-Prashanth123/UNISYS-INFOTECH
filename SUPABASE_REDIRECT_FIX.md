# Supabase Password Reset Redirect Fix

## Problem Fixed
The forgot password flow was redirecting to `localhost:3000` instead of the correct frontend URL (`localhost:5173`), causing connection errors.

## Changes Made

### 1. Frontend Configuration
- **File**: `frontend/.env`
- **Added**: `VITE_FRONTEND_URL=https://happy-ocean-08bd11c10.2.azurestaticapps.net` (production)
- This ensures consistent redirect URLs regardless of which port the app is accessed on

### 2. Frontend Code Fix
- **File**: `frontend/src/pages/ForgotPasswordPage.jsx`
- **Changed**: Now uses `VITE_FRONTEND_URL` environment variable instead of `window.location.origin`
- This prevents the redirect URL from changing based on the access port

### 3. Backend Configuration
- **File**: `backend/.env`
- **Updated**: `FRONTEND_URL=https://happy-ocean-08bd11c10.2.azurestaticapps.net` (production)
- Backend uses this for password reset redirect URLs

## Important: Supabase Dashboard Configuration

You **MUST** configure the Supabase Site URL to match your frontend URL:

1. Go to: https://supabase.com/dashboard/project/kwqabttdbdslmjzbcppo/settings/auth
2. Find the **"Site URL"** field
3. Set it to: `https://happy-ocean-08bd11c10.2.azurestaticapps.net` (production)
4. In **"Redirect URLs"**, add: `https://happy-ocean-08bd11c10.2.azurestaticapps.net/reset-password`
5. Save the changes

**Note**: For local development, you can add both URLs:
- Site URL: `https://happy-ocean-08bd11c10.2.azurestaticapps.net` (primary)
- Redirect URLs: 
  - `https://happy-ocean-08bd11c10.2.azurestaticapps.net/reset-password`
  - `http://localhost:5173/reset-password` (for local testing)

### Why This Matters
Supabase Auth validates that redirect URLs match the configured Site URL and allowed redirect URLs. If they don't match, you'll get connection errors.

## Testing

After making these changes:

1. **Restart your frontend dev server** (to load the new `.env` variable):
   ```bash
   cd frontend
   npm run dev
   ```

2. **Test the forgot password flow**:
   - Go to the forgot password page
   - Enter an email address
   - Check that the redirect URL in the email is `http://localhost:5173/reset-password`
   - Click the link and verify it works

## Production Deployment

When deploying to production:

1. Update `frontend/.env`:
   ```env
   VITE_FRONTEND_URL=https://yourdomain.com
   ```

2. Update `backend/.env`:
   ```env
   FRONTEND_URL=https://yourdomain.com
   ```

3. Update Supabase Dashboard:
   - Site URL: `https://yourdomain.com`
   - Redirect URLs: Add `https://yourdomain.com/reset-password`

## Summary

✅ Fixed frontend to use environment variable for redirect URL
✅ Added `VITE_FRONTEND_URL` to frontend `.env`
✅ Backend was already correctly configured
⚠️ **Action Required**: Update Supabase Dashboard Site URL to `https://happy-ocean-08bd11c10.2.azurestaticapps.net`
