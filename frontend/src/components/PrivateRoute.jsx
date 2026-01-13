import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/index.js';

export const PrivateRoute = ({ children, requiredRole = null }) => {
  const { user, token } = useAuthStore();

  if (!token || !user) {
    // Redirect to role-specific login if requiredRole is specified
    const loginPath = requiredRole ? `/login/${requiredRole}` : '/login/admin';
    return <Navigate to={loginPath} />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to home if user doesn't have required role
    return <Navigate to="/" />;
  }

  return children;
};
