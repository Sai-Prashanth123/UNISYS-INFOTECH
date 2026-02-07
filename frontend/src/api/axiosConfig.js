import axios from 'axios';
import { useAuthStore } from '../store/index.js';

// PRODUCTION: Always use Azure backend URL
// Hardcoded for production builds - no localhost fallback
const API_BASE_URL = 'https://unisysinfotech-backend-gtgngeaueme4bhhs.centralus-01.azurewebsites.net/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  response => response,
  error => {
    // Don't redirect on 401 for login/auth endpoints - let the component handle the error
    const isAuthEndpoint = error.config?.url?.includes('/auth/login') || 
                           error.config?.url?.includes('/auth/forgot-password') ||
                           error.config?.url?.includes('/auth/reset-password');
    
    // Don't auto-redirect for change-password - let the component handle it
    const isChangePassword = error.config?.url?.includes('/auth/change-password');

    const status = error.response?.status;
    const errorCode = error.response?.data?.errorCode;

    if (!isAuthEndpoint && !isChangePassword) {
      // Handle invalid session (401 unauthorized or SESSION_INVALID)
      if (status === 401 || errorCode === 'SESSION_INVALID') {
        useAuthStore.getState().logout();
        // Get the current path to determine which login page to redirect to
        const path = window.location.pathname;
        if (path.includes('/admin')) {
          window.location.href = '/login/admin';
        } else if (path.includes('/employer')) {
          window.location.href = '/login/employer';
        } else if (path.includes('/employee')) {
          window.location.href = '/login/employee';
        } else {
          window.location.href = '/login/employee';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
