# Supabase MCP Execution Guide

## Migration Ready for Execution

The RLS migration file `001_enable_rls_and_policies.sql` is ready to be executed via your Supabase MCP server.

## SQL Migration Content

The migration file contains:
- ✅ Enables RLS on all 13 tables
- ✅ Creates 5 helper functions for role checking
- ✅ Creates security policies for all tables
- ✅ Secures sensitive columns (password, token)

## How to Execute via Supabase MCP

If your Supabase MCP server has an `execute_sql` tool, you can execute the migration like this:

```javascript
// Example MCP tool call (adjust based on your actual MCP tool schema)
{
  "server": "user-supabase",
  "tool": "execute_sql",
  "parameters": {
    "sql": "<contents of 001_enable_rls_and_policies.sql>",
    "read_only": false
  }
}
```

## Alternative: Manual Execution

If MCP execution is not available, you can:

1. **Via Supabase Dashboard:**
   - Go to https://supabase.com/dashboard
   - Select project: `unisys-infotech`
   - Navigate to SQL Editor
   - Copy and paste the entire migration file
   - Click "Run"

2. **Via Supabase CLI:**
   ```bash
   supabase db push
   ```

## Migration File Location

`unisysinfotech/backend/supabase/migrations/001_enable_rls_and_policies.sql`

## What Gets Fixed

This migration fixes **all 20 security issues**:
- ✅ 13 tables with RLS disabled
- ✅ 2 sensitive columns exposed (password, token)

## Verification

After execution, verify:
- All tables show "RLS Enabled" in Supabase Dashboard
- Backend operations still work (uses service_role key)
- Frontend public endpoints work (job listings, contact form, etc.)
