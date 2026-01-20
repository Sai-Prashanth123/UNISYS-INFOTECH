# Frontend Deployment Fix - CORS Error Resolution

## 🔍 Understanding the Error

**Error Message:**
```
Access to XMLHttpRequest at 'http://localhost:5001/api/client-logos' 
from origin 'https://happy-ocean-08bd11c10.2.azurestaticapps.net' 
has been blocked by CORS policy
```

**Root Cause:**
- The **deployed frontend build** on Azure Static Web Apps is still using the **old build** that has `localhost:5001` hardcoded
- The **source code** has been updated correctly, but Azure is serving the old `index-tcmJtB8H.js` file

## ✅ What Has Been Fixed

### 1. Backend CORS Configuration ✅
- Updated to allow Azure Static Web Apps origin
- Backend Docker image rebuilt and pushed: `prashanth1710/unisys-backend:latest`

### 2. Frontend Source Code ✅
- `src/api/axiosConfig.js` - Uses production backend URL automatically
- `src/pages/ContactPage.jsx` - Updated to use new backend URL
- `vite.config.js` - Updated proxy configuration

### 3. Frontend Build ✅
- **New build created** in `frontend/dist/` folder
- Build contains the correct Azure backend URL

## 🚀 Solution: Deploy the New Build

### Step 1: Verify Backend Environment Variable

**In Azure Portal → Backend App Service → Configuration → Application settings:**

Add/Update:
```
FRONTEND_URL=https://happy-ocean-08bd11c10.2.azurestaticapps.net
```

### Step 2: Deploy New Frontend Build to Azure

You have **3 options**:

#### Option A: GitHub Actions (Recommended if using CI/CD)
1. Commit and push your changes:
   ```bash
   git add .
   git commit -m "Update frontend to use Azure backend URL"
   git push
   ```
2. GitHub Actions will automatically rebuild and deploy

#### Option B: Azure Portal Manual Upload
1. Go to Azure Portal → Static Web App → Deployment Center
2. Upload the `dist` folder contents
3. Or use Azure CLI:
   ```bash
   cd frontend/dist
   az staticwebapp deploy --name your-static-web-app-name --resource-group your-resource-group
   ```

#### Option C: Azure Static Web Apps CLI
```bash
# Install Azure Static Web Apps CLI if not installed
npm install -g @azure/static-web-apps-cli

# Deploy from dist folder
cd frontend
swa deploy dist --deployment-token YOUR_DEPLOYMENT_TOKEN
```

### Step 3: Verify Deployment

After deployment:
1. Clear browser cache or use incognito mode
2. Visit: `https://happy-ocean-08bd11c10.2.azurestaticapps.net`
3. Check browser console - should NOT see CORS errors
4. Client logos should load from backend

## 📋 Quick Checklist

- [x] Backend CORS updated
- [x] Backend Docker image rebuilt and pushed
- [x] Frontend source code updated
- [x] Frontend build created (`frontend/dist/`)
- [ ] Set `FRONTEND_URL` in Azure Backend App Service
- [ ] Deploy new frontend build to Azure Static Web Apps
- [ ] Test frontend-backend connection

## 🔧 Troubleshooting

### If CORS error persists after deployment:

1. **Check browser cache:**
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Or use incognito/private browsing mode

2. **Verify backend CORS:**
   ```bash
   curl -H "Origin: https://happy-ocean-08bd11c10.2.azurestaticapps.net" \
        -H "Access-Control-Request-Method: GET" \
        -X OPTIONS \
        https://unisysinfotech-backend-gtgngeaueme4bhhs.centralus-01.azurewebsites.net/api/client-logos
   ```

3. **Check Azure Static Web Apps logs:**
   - Azure Portal → Static Web App → Monitoring → Log stream

4. **Verify environment variable:**
   - Azure Portal → Static Web App → Configuration
   - Ensure `VITE_API_URL` is set (optional but recommended)

## 📝 Current URLs

- **Frontend**: `https://happy-ocean-08bd11c10.2.azurestaticapps.net`
- **Backend**: `https://unisysinfotech-backend-gtgngeaueme4bhhs.centralus-01.azurewebsites.net`
- **Backend API**: `https://unisysinfotech-backend-gtgngeaueme4bhhs.centralus-01.azurewebsites.net/api`

## 🎯 Next Steps

1. **Deploy the new build** from `frontend/dist/` to Azure Static Web Apps
2. **Set backend environment variable** `FRONTEND_URL` in Azure
3. **Test the connection** - CORS errors should be gone!

The new build is ready in `frontend/dist/` - just needs to be deployed! 🚀

