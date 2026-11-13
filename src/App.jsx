import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthLandingPage } from './pages/auth/AuthLandingPage';
import { ManagerAuthPage } from './pages/auth/ManagerAuthPage';
import { EmployeeAuthPage } from './pages/auth/EmployeeAuthPage';
import { Layout } from './components/layout/Layout';
import { EmployeeLayout } from './components/layout/EmployeeLayout';

// Manager Pages
import { OverviewPage } from './pages/OverviewPage';
import { SchedulerPage } from './pages/SchedulerPage';
import { AutoSchedulerPage } from './pages/AutoSchedulerPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { ShiftTemplatesPage } from './pages/ShiftTemplatesPage';
import { BreakManagementPage } from './pages/BreakManagementPage';
import { DemandForecastPage } from './pages/DemandForecastPage';
import { ConflictAlertsPage } from './pages/ConflictAlertsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

// Employee Pages
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { MySchedulePage } from './pages/employee/MySchedulePage';
import { MyBreaksPage } from './pages/employee/MyBreaksPage';
import { ShiftSwapsPage } from './pages/employee/ShiftSwapsPage';
import { LeaveManagementPage } from './pages/employee/LeaveManagementPage';
import { AvailabilityPage } from './pages/employee/AvailabilityPage';
import { EmployeeNotificationsPage } from './pages/employee/EmployeeNotificationsPage';
import { EmployeeProfilePage } from './pages/employee/EmployeeProfilePage';

// Root Route Decider:
const RootIndexHandler = () => {
  const { currentUser } = useAuth();
  let user = currentUser;
  if (!user) {
    try {
      const stored = localStorage.getItem('shiftflow_auth_user_v2') || localStorage.getItem('shiftflow_auth_user_v1');
      if (stored) user = JSON.parse(stored);
    } catch (e) {}
  }

  // Not logged in -> Show Authentication Landing Page
  if (!user) {
    return <AuthLandingPage />;
  }

  // Employee logged in -> Go to Employee Dashboard
  const userRole = (user.role || '').toUpperCase();
  if (userRole === 'EMPLOYEE') {
    return <Navigate to="/employee/dashboard" replace />;
  }

  // Manager logged in -> Go to Manager Overview
  return <Navigate to="/overview" replace />;
};

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Root: Authentication Landing Page if not logged in, or redirect if logged in */}
            <Route path="/" element={<RootIndexHandler />} />

            {/* Dedicated Authentication Pages */}
            <Route path="/auth/manager" element={<ManagerAuthPage />} />
            <Route path="/auth/employee" element={<EmployeeAuthPage />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/portal" element={<AuthLandingPage />} />

            {/* Manager Protected Experience */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['Manager', 'MANAGER']}>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/overview" element={<OverviewPage />} />
              <Route path="/scheduler" element={<SchedulerPage />} />
              <Route path="/auto-scheduler" element={<AutoSchedulerPage />} />
              <Route path="/employees" element={<EmployeesPage />} />
              <Route path="/templates" element={<ShiftTemplatesPage />} />
              <Route path="/breaks" element={<BreakManagementPage />} />
              <Route path="/forecast" element={<DemandForecastPage />} />
              <Route path="/conflicts" element={<ConflictAlertsPage />} />
              <Route path="/wallboard" element={<Navigate to="/overview" replace />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Employee Protected Experience */}
            <Route
              path="/employee"
              element={
                <ProtectedRoute allowedRoles={['Employee', 'EMPLOYEE']}>
                  <EmployeeLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/employee/dashboard" replace />} />
              <Route path="dashboard" element={<EmployeeDashboard />} />
              <Route path="schedule" element={<MySchedulePage />} />
              <Route path="breaks" element={<MyBreaksPage />} />
              <Route path="swaps" element={<ShiftSwapsPage />} />
              <Route path="leave" element={<LeaveManagementPage />} />
              <Route path="availability" element={<AvailabilityPage />} />
              <Route path="notifications" element={<EmployeeNotificationsPage />} />
              <Route path="profile" element={<EmployeeProfilePage />} />
              <Route path="*" element={<Navigate to="/employee/dashboard" replace />} />
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
