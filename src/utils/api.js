/**
 * ShiftFlow Production REST API Client
 * Centralized fetch wrapper with automatic JWT token attachment and error handling.
 */

const BASE_URL = '/api';

export class ApiError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('shiftflow_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
    credentials: 'include',
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new ApiError(data.error || 'Network request failed', res.status, data.details);
    }

    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(err.message || 'Server connection error', 0);
  }
}

export const api = {
  // Auth
  login: (email, password, rememberMe) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, rememberMe }),
    }),

  registerManager: (data) =>
    request('/auth/register-manager', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  registerEmployee: (data) =>
    request('/auth/register-employee', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => request('/auth/me'),

  logout: () =>
    request('/auth/logout', {
      method: 'POST',
    }),

  // Employees
  getEmployees: () => request('/employees'),
  getEmployee: (id) => request(`/employees/${id}`),
  createEmployee: (data) =>
    request('/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateEmployee: (id, data) =>
    request(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteEmployee: (id) =>
    request(`/employees/${id}`, {
      method: 'DELETE',
    }),

  // Shifts
  getShifts: () => request('/shifts'),
  createShift: (data) =>
    request('/shifts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateShift: (id, data) =>
    request(`/shifts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteShift: (id) =>
    request(`/shifts/${id}`, {
      method: 'DELETE',
    }),
  generateShifts: (options) =>
    request('/shifts/generate', {
      method: 'POST',
      body: JSON.stringify(options || {}),
    }),
  publishShifts: () =>
    request('/shifts/publish', {
      method: 'POST',
    }),

  // Templates
  getTemplates: () => request('/templates'),
  createTemplate: (data) =>
    request('/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateTemplate: (id, data) =>
    request(`/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteTemplate: (id) =>
    request(`/templates/${id}`, {
      method: 'DELETE',
    }),

  // Breaks
  getBreaks: () => request('/breaks'),
  updateBreakStatus: (id, status) =>
    request(`/breaks/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  optimizeBreaks: () =>
    request('/breaks/optimize', {
      method: 'POST',
    }),

  // Leaves
  getLeaves: () => request('/leaves'),
  submitLeave: (data) =>
    request('/leaves', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateLeaveStatus: (id, status, managerComment) =>
    request(`/leaves/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, managerComment }),
    }),

  // Swaps
  getSwaps: () => request('/swaps'),
  submitSwap: (data) =>
    request('/swaps', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateSwapStatus: (id, status) =>
    request(`/swaps/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // Conflicts
  getConflicts: () => request('/conflicts'),
  resolveConflict: (data) =>
    request('/conflicts/resolve', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Analytics & Notifications
  getOverviewStats: () => request('/analytics/overview'),
  getNotifications: () => request('/analytics/notifications'),
  markNotificationRead: (id) =>
    request(`/analytics/notifications/${id}/read`, {
      method: 'PUT',
    }),
  markAllNotificationsRead: () =>
    request('/analytics/notifications/read-all', {
      method: 'PUT',
    }),
};

