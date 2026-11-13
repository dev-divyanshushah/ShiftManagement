import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  // Robust fallback: check stored session in localStorage if context state is still hydrating
  let activeUser = currentUser;
  if (!activeUser) {
    try {
      const stored = localStorage.getItem('shiftflow_auth_user_v2') || localStorage.getItem('shiftflow_auth_user_v1');
      if (stored) {
        activeUser = JSON.parse(stored);
      }
    } catch (e) {}
  }

  if (!activeUser) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  const userRole = (activeUser.role || '').toUpperCase();
  const normalizedAllowed = allowedRoles?.map((r) => r.toUpperCase());

  if (normalizedAllowed && !normalizedAllowed.includes(userRole)) {
    // If an employee tries to access manager routes, redirect to employee dashboard
    if (userRole === 'EMPLOYEE') {
      return <Navigate to="/employee/dashboard" replace />;
    }
    // If a manager tries to access employee routes, redirect to manager overview
    if (userRole === 'MANAGER') {
      return <Navigate to="/overview" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

