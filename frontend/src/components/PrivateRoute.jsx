import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/index.js';

export const PrivateRoute = ({ children, requiredRole = null }) => {
  const { user, token } = useAuthStore();
  const location = useLocation();

  if (!token || !user) {
    // Redirect to role-specific login if requiredRole is specified
    const loginPath = requiredRole ? `/login/${requiredRole}` : '/login/admin';
    return <Navigate to={loginPath} />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to home if user doesn't have required role
    return <Navigate to="/" />;
  }

  // Force first-login password reset (do not allow navigation elsewhere)
  const isForceResetRoute =
    location.pathname === '/employee/force-reset-password' ||
    location.pathname === '/employer/force-reset-password';

  if (user.mustResetPassword && !isForceResetRoute) {
    if (user.role === 'employee') return <Navigate to="/employee/force-reset-password" />;
    if (user.role === 'employer') return <Navigate to="/employer/force-reset-password" />;
  }

  return children;
};
