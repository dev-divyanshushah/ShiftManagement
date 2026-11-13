import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '../utils/api';

const AuthContext = createContext(null);

export const AUTHORIZED_INVITE_CODES = {
  manager: ['MGR-APEX-2026', 'SHIFTFLOW-MGR', 'APEX-EXEC'],
  employee: ['APEX-STAFF-2026', 'SHIFTFLOW-EMP', 'APEX-CARE'],
};

export const DEMO_ACCOUNTS = {
  manager: {
    email: 'manager@shiftflow.com',
    password: 'Manager@123',
    role: 'Manager',
    name: 'Alexandra Vance',
    title: 'Director of Workforce Operations',
  },
  employee: {
    email: 'employee@shiftflow.com',
    employeeId: 'EMP-1001',
    password: 'Employee@123',
    role: 'Employee',
    name: 'Sarah Jenkins',
    title: 'Senior Support Specialist',
  },
};

const AUTH_STORAGE_KEY = 'shiftflow_auth_user_v2';
const TOKEN_KEY = 'shiftflow_token';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem('shiftflow_auth_user_v1');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  // Sync session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return;

      try {
        const res = await api.getMe();
        if (res.success && res.user) {
          setCurrentUser(res.user);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(res.user));
        }
      } catch (err) {
        // If token is invalid or expired
        if (err.status === 401) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(AUTH_STORAGE_KEY);
          localStorage.removeItem('shiftflow_auth_user_v1');
          setCurrentUser(null);
        }
      }
    };

    initAuth();
  }, []);

  // Sync user state to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to sync auth session', e);
    }
  }, [currentUser]);

  // --- Manager Login ---
  const loginManager = useCallback(async (email, password, rememberMe = false) => {
    setIsLoading(true);
    try {
      const res = await api.login(email.trim(), password, rememberMe);
      if (res.success && res.user) {
        if (res.token) {
          localStorage.setItem(TOKEN_KEY, res.token);
        }
        setCurrentUser(res.user);
        setIsLoading(false);
        return { success: true, user: res.user };
      }
      setIsLoading(false);
      return { success: false, error: 'Authentication failed.' };
    } catch (err) {
      setIsLoading(false);
      return {
        success: false,
        error: err.message || 'Login failed. Please verify credentials.',
      };
    }
  }, []);

  // --- Employee Login (Email or Employee ID) ---
  const loginEmployee = useCallback(async (idOrEmail, password, rememberMe = false) => {
    setIsLoading(true);
    try {
      let resolvedEmail = idOrEmail.trim();
      // If user provided employeeId like EMP-1001, map to standard seed email if needed
      if (resolvedEmail.toUpperCase() === 'EMP-1001') {
        resolvedEmail = 'employee@shiftflow.com';
      }

      const res = await api.login(resolvedEmail, password, rememberMe);
      if (res.success && res.user) {
        if (res.token) {
          localStorage.setItem(TOKEN_KEY, res.token);
        }
        setCurrentUser(res.user);
        setIsLoading(false);
        return { success: true, user: res.user };
      }
      setIsLoading(false);
      return { success: false, error: 'Authentication failed.' };
    } catch (err) {
      setIsLoading(false);
      return {
        success: false,
        error: err.message || 'Login failed. Please verify credentials.',
      };
    }
  }, []);

  // --- Manager Registration ---
  const registerManager = useCallback(async (formData) => {
    setIsLoading(true);
    try {
      const res = await api.registerManager(formData);
      if (res.success && res.user) {
        if (res.token) {
          localStorage.setItem(TOKEN_KEY, res.token);
        }
        setCurrentUser(res.user);
        setIsLoading(false);
        return { success: true, user: res.user };
      }
      setIsLoading(false);
      return { success: false, error: 'Registration failed.' };
    } catch (err) {
      setIsLoading(false);
      return {
        success: false,
        error: err.message || 'Manager registration failed.',
      };
    }
  }, []);

  // --- Employee Registration ---
  const registerEmployee = useCallback(async (formData) => {
    setIsLoading(true);
    try {
      const res = await api.registerEmployee(formData);
      if (res.success && res.user) {
        if (res.token) {
          localStorage.setItem(TOKEN_KEY, res.token);
        }
        setCurrentUser(res.user);
        setIsLoading(false);
        return { success: true, user: res.user };
      }
      setIsLoading(false);
      return { success: false, error: 'Registration failed.' };
    } catch (err) {
      setIsLoading(false);
      return {
        success: false,
        error: err.message || 'Employee registration failed.',
      };
    }
  }, []);

  // --- Logout ---
  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setCurrentUser(null);
    }
  }, []);

  // --- Demo Quick Switcher Helper ---
  const loginAsDemo = useCallback(async (role) => {
    if (role?.toUpperCase() === 'MANAGER') {
      return await loginManager('manager@shiftflow.com', 'Manager@123');
    } else {
      return await loginEmployee('employee@shiftflow.com', 'Employee@123');
    }
  }, [loginManager, loginEmployee]);

  const value = {
    currentUser,
    isLoading,
    loginManager,
    loginEmployee,
    registerManager,
    registerEmployee,
    logout,
    loginAsDemo,
    demoLogin: loginAsDemo,
    DEMO_ACCOUNTS,
    AUTHORIZED_INVITE_CODES,
    isAuthenticated: !!currentUser,
    isManager: currentUser?.role?.toUpperCase() === 'MANAGER',
    isEmployee: currentUser?.role?.toUpperCase() === 'EMPLOYEE',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
