# Frontend Environment Variables

Create a `.env` file in the frontend directory with the following variables:

```env
# API Configuration
VITE_API_URL=https://unisysinfotech-backend-gtgngeaueme4bhhs.centralus-01.azurewebsites.net/api

# Supabase Configuration (for client-side)
# Use ANON key only (not service role key)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# App Configuration
VITE_APP_NAME=Unisys InfoTech
VITE_APP_VERSION=1.0.0

# Environment
VITE_NODE_ENV=production
```

## Required Variables

The following variables are **optional** but recommended:

- `VITE_API_URL` - Backend API URL (defaults to relative path /api)
- `VITE_SUPABASE_URL` - If using Supabase client-side features
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key for client

## Production Configuration

For production, ensure:
1. `VITE_API_URL` points to your production backend
2. `VITE_NODE_ENV=production`
3. Use production Supabase URL and keys
