# Supabase – Password reset redirect (fix "requested path is invalid")

If after password reset users see `{"error":"requested path is invalid"}` and the URL looks like:

`https://kwqabttdbdslmjzbcppo.supabase.co/www.unisysinfotech.com#access_token=...`

the **Site URL** in Supabase is wrong (missing `https://`), so Supabase treats `www.unisysinfotech.com` as a path.

## Fix in Supabase Dashboard

1. Open **Supabase Dashboard** → your project (**kwqabttdbdslmjzbcppo**).
2. Go to **Authentication** → **URL Configuration**.
3. Set:

   | Setting        | Value |
   |----------------|--------|
   | **Site URL**   | `https://www.unisysinfotech.com` |
   | **Redirect URLs** | Add: `https://www.unisysinfotech.com/reset-password` and optionally `https://www.unisysinfotech.com/**` |

4. **Important:** Site URL must be the **full URL** including `https://`.  
   If you use only `www.unisysinfotech.com`, Supabase will redirect to `https://<project>.supabase.co/www.unisysinfotech.com` and you will get "requested path is invalid".

5. Save.

After saving, new password reset emails will redirect users to `https://www.unisysinfotech.com/reset-password` correctly.
