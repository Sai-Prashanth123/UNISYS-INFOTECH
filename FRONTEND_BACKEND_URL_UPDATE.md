# Frontend Backend URL Update

## ✅ Changes Made

### 1. Backend URL Tested
- **Backend URL**: `https://unisysinfotech-backend-gtgngeaueme4bhhs.centralus-01.azurewebsites.net`
- **Health Check**: ✅ Working
- **Database Connection**: ✅ Connected

### 2. Frontend Files Updated

#### `src/api/axiosConfig.js`
- Updated to use production backend URL when `VITE_API_URL` is not set and app is in production mode
- Falls back to `localhost:5001` for local development

#### `src/pages/ContactPage.jsx`
- Updated contact form API call to use the same backend URL logic
- Ensures consistency across the application

### 3. Configuration

The frontend now automatically uses:
- **Production**: `https://unisysinfotech-backend-gtgngeaueme4bhhs.centralus-01.azurewebsites.net/api`
- **Development**: `http://localhost:5001/api`

## 🔧 Azure Static Web Apps Configuration

### Option 1: Set Environment Variable in Azure Portal (Recommended)

1. Go to your Azure Static Web App in the Azure Portal
2. Navigate to **Configuration** → **Application settings**
3. Add a new application setting:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://unisysinfotech-backend-gtgngeaueme4bhhs.centralus-01.azurewebsites.net/api`
4. Save and redeploy

### Option 2: Use Default (Already Configured)

The frontend code now defaults to the production backend URL when:
- `VITE_API_URL` is not set
- The app is built in production mode (`import.meta.env.PROD === true`)

## 🧪 Testing

### Backend Health Check
```bash
curl https://unisysinfotech-backend-gtgngeaueme4bhhs.centralus-01.azurewebsites.net/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-20T17:21:29.959Z",
  "uptime": 206.736551015,
  "environment": "production",
  "database": "connected"
}
```

### Frontend Testing

1. **Local Development**:
   - Start backend: `cd backend && npm start` (runs on port 5001)
   - Start frontend: `cd frontend && npm run dev` (uses localhost:5001)

2. **Production**:
   - Frontend will automatically use the Azure backend URL
   - No additional configuration needed if using the default

## 📝 Notes

- The `vite.config.js` proxy configuration is only for local development and remains unchanged
- All API calls now go through `axiosConfig.js` which uses the updated URL logic
- The backend is deployed and running successfully on Azure App Service

## 🚀 Next Steps

1. **Rebuild and redeploy frontend** to Azure Static Web Apps
2. **Test the frontend** to ensure it connects to the new backend
3. **Verify API calls** work correctly (login, data fetching, etc.)

## 🔗 URLs

- **Backend**: https://unisysinfotech-backend-gtgngeaueme4bhhs.centralus-01.azurewebsites.net
- **Backend API**: https://unisysinfotech-backend-gtgngeaueme4bhhs.centralus-01.azurewebsites.net/api
- **Health Check**: https://unisysinfotech-backend-gtgngeaueme4bhhs.centralus-01.azurewebsites.net/api/health

