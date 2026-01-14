# Supabase Email Setup Guide

## ✅ What's Done

1. ✅ Users synced to Supabase Auth (admin, employer, employee)
2. ✅ Backend updated to use Supabase Auth for password reset
3. ✅ Hybrid system: Uses Supabase Auth for synced users, falls back to legacy method

## 🎯 Configure Supabase Email Settings

### Step 1: Access Email Settings

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: **kwqabttdbdslmjzbcppo**
3. Click **Authentication** in the left sidebar
4. Click **Email Templates**

Direct link: https://supabase.com/dashboard/project/kwqabttdbdslmjzbcppo/auth/templates

---

### Step 2: Configure Password Reset Email Template

1. Find **"Reset Password"** template
2. Click **Edit**

**Recommended Settings:**

**Subject:**
```
Reset Your Password - Unisys InfoTech
```

**Email Body (HTML):**
```html
<h2>Reset Your Password</h2>
<p>Hi there,</p>
<p>We received a request to reset your password for your Unisys InfoTech account.</p>
<p>Click the button below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px;">Reset Password</a></p>
<p>Or copy and paste this link:</p>
<p>{{ .ConfirmationURL }}</p>
<p><strong>This link will expire in 1 hour.</strong></p>
<p>If you didn't request this, you can safely ignore this email.</p>
<br>
<p>Thanks,<br>Unisys InfoTech Team</p>
```

3. Click **Save**

---

### Step 3: Configure Redirect URLs

1. Still in **Authentication** section
2. Click **URL Configuration**
3. Add your redirect URL:

**Site URL:**
```
http://localhost:5173
```

**Redirect URLs (for production, add your domain):**
```
http://localhost:5173/**
http://localhost:5173/reset-password
```

For production:
```
https://yourdomain.com/**
https://yourdomain.com/reset-password
```

4. Click **Save**

---

### Step 4: Configure Email Provider (Optional but Recommended)

By default, Supabase uses their email service (limited to development).

**For Production - Use Custom SMTP:**

1. Go to **Settings** → **Authentication**
2. Scroll to **SMTP Settings**
3. Enable **Enable Custom SMTP**
4. Configure your SMTP (e.g., Gmail, SendGrid, Mailgun):

```
Host: smtp.gmail.com
Port: 587
Username: your-email@gmail.com
Password: your-app-password
Sender Email: noreply@yourdomain.com
Sender Name: Unisys InfoTech
```

---

## 🧪 Test the Setup

### Test 1: Password Reset for Synced Users

1. **Go to:** http://localhost:5173
2. **Click:** Forgot Password
3. **Enter:** admin@unisys.com
4. **Check:** Your email inbox

**Expected:** You should receive a password reset email from Supabase

---

### Test 2: Check Supabase Auth Users

View synced users:
```sql
SELECT email, created_at, last_sign_in_at 
FROM auth.users 
ORDER BY created_at DESC;
```

Or via Dashboard:
https://supabase.com/dashboard/project/kwqabttdbdslmjzbcppo/auth/users

---

## 📧 How It Works Now

### For Synced Users (admin, employer, employee):
```
User clicks "Forgot Password"
    ↓
Backend checks if user.supabase_auth_id exists
    ↓
YES → Use Supabase Auth (sends email automatically)
    ↓
User receives email from Supabase
    ↓
User clicks link → Redirected to /reset-password
    ↓
User enters new password
    ↓
Password updated in both Supabase Auth AND custom users table
```

### For Non-Synced Users (fallback):
```
User clicks "Forgot Password"
    ↓
Backend checks if user.supabase_auth_id exists
    ↓
NO → Use legacy method (console logs link)
    ↓
Admin checks backend console for reset link
    ↓
Provides link to user manually
```

---

## 🔧 Troubleshooting

### Issue: Not receiving emails

**Check 1:** Email service enabled
- Go to Settings → Authentication
- Ensure "Enable email confirmations" is ON

**Check 2:** Rate limits
- Supabase free tier: 10,000 emails/month
- Check dashboard for usage

**Check 3:** Spam folder
- Check user's spam/junk folder
- Whitelist Supabase email domain

**Check 4:** Backend logs
```bash
cd backend
# Check terminal for logs like:
# [PASSWORD_RESET] Using Supabase Auth for admin@unisys.com
# ✅ Password reset email sent via Supabase Auth
```

---

## 🚀 Production Checklist

Before going live:

- [ ] Configure custom domain for emails
- [ ] Set up custom SMTP (Gmail, SendGrid, etc.)
- [ ] Update redirect URLs to production domain
- [ ] Customize email templates with branding
- [ ] Test password reset flow end-to-end
- [ ] Monitor email delivery in Supabase dashboard

---

## 📝 Current Status

✅ **Working:** Password reset via Supabase Auth for synced users
✅ **Synced Users:** admin@unisys.com, employer@unisys.com, employee@unisys.com
⚠️ **Note:** Some users may need manual sync if they were created after initial sync

---

## 🔗 Quick Links

- Dashboard: https://supabase.com/dashboard/project/kwqabttdbdslmjzbcppo
- Email Templates: https://supabase.com/dashboard/project/kwqabttdbdslmjzbcppo/auth/templates
- Auth Users: https://supabase.com/dashboard/project/kwqabttdbdslmjzbcppo/auth/users
- Settings: https://supabase.com/dashboard/project/kwqabttdbdslmjzbcppo/settings/auth

---

## 💡 Tips

1. **Test with real email first** (not @example.com)
2. **Check Supabase logs** in dashboard for delivery status
3. **Whitelist Supabase IPs** if using corporate email
4. **Use custom SMTP** for production for better deliverability
