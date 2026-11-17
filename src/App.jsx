import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthLandingPage } from './pages/auth/AuthLandingPage';
import { LoginPage } from './pages/auth/LoginPage';
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

// Dedicated Single-Sign-On Launch Handler
const SsoLaunchHandler = () => {
  const { loginWithSso } = useAuth();
  const [status, setStatus] = React.useState('loading'); // 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = React.useState('');
  const [targetPath, setTargetPath] = React.useState('/overview');

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token') || params.get('sso_token');

    if (!token) {
      setStatus('error');
      setErrorMessage('Missing SSO launch token. Please launch the application from the Insigrow Portal.');
      return;
    }

    try {
      sessionStorage.setItem('insigrow_connected', 'true');
    } catch (e) {}

    loginWithSso(token).then((res) => {
      if (res.success && res.user) {
        setStatus('success');
        const dest = res.targetRoute || (res.user.role === 'EMPLOYEE' ? '/employee/dashboard' : '/overview');
        setTargetPath(dest);
        window.history.replaceState({}, '', dest);
      } else {
        setStatus('error');
        setErrorMessage(res.error || 'Authentication failed. Launch token may have expired or is invalid.');
      }
    });
  }, [loginWithSso]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#F4F8F8] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-[#087F8C] border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-lg font-bold text-[#111827] mb-1">Authenticating Insigrow Session</h2>
        <p className="text-sm text-[#4B5563]">Establishing secure enterprise Single-Sign-On...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-[#F4F8F8] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-red-100 p-8">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-[#111827] mb-2">SSO Authentication Failed</h2>
          <p className="text-sm text-[#6B7280] mb-6">{errorMessage}</p>
          <div className="space-y-3">
            <a
              href="http://localhost:5000/#/industry/shifts"
              className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-[#087F8C] text-white font-medium rounded-lg hover:bg-[#06636D] transition-colors"
            >
              Return to Insigrow Portal ↗
            </a>
            <a
              href="/portal"
              className="inline-flex items-center justify-center w-full px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Go to Standard Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <Navigate to={targetPath} replace />;
};

// Root Route Decider:
const RootIndexHandler = () => {
  const { currentUser } = useAuth();

  const params = new URLSearchParams(window.location.search);
  const token = params.get('token') || params.get('sso_token');
  if (token) {
    return <SsoLaunchHandler />;
  }

  const sourceParam = params.get('source');
  if (sourceParam === 'insigrow') {
    try { sessionStorage.setItem('insigrow_connected', 'true'); } catch (e) {}
  }

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
            <Route path="/sso-launch" element={<SsoLaunchHandler />} />

            {/* Dedicated Authentication Pages */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/manager" element={<ManagerAuthPage />} />
            <Route path="/auth/employee" element={<EmployeeAuthPage />} />
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
