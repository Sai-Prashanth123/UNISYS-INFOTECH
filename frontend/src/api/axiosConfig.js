import axios from 'axios';
import { useAuthStore } from '../store/index.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

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
    
    if (error.response?.status === 401 && !isAuthEndpoint) {
      // Only logout and redirect for non-auth endpoints (e.g., expired token on protected routes)
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
    return Promise.reject(error);
  }
);

export default api;
