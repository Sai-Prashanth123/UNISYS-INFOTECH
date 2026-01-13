import api from './axiosConfig.js';

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data), // Disabled on backend
  login: (data) => api.post('/auth/login', data), // Now accepts selectedRole
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  // Password Reset
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  verifyResetToken: (token) => api.get(`/auth/verify-reset-token/${token}`),
  resetPassword: (data) => api.post('/auth/reset-password', data)
};

// Admin User Management APIs
export const adminAPI = {
  // Dashboard Stats (Optimized - single endpoint)
  getDashboardStats: () => api.get('/admin/dashboard-stats'),
  
  // User Management
  createUser: (data) => api.post('/admin/users/create', data),
  getUsers: (params) => api.get('/admin/users', { params }),
  getEmployers: () => api.get('/admin/employers'),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  updateUserStatus: (id, isActive) => api.patch(`/admin/users/${id}/status`, { isActive }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  // Supabase Auth sync (for password reset via email)
  syncUserToAuth: (id, data) => api.post(`/admin/users/${id}/sync-auth`, data),
  syncAllUsersToAuth: () => api.post('/admin/users/sync-all-auth')
};

// TimeCard APIs
export const timeCardAPI = {
  // Employee routes
  submitHours: (data) => api.post('/timecards', data),
  getMyEntries: (params) => api.get('/timecards/my-entries', { params }),
  deleteEntry: (id) => api.delete(`/timecards/${id}`),
  
  // Employer routes
  getEmployerEntries: (params) => api.get('/timecards/employer/entries', { params }),
  getEmployees: () => api.get('/timecards/employer/employees'),
  getWeeklySummary: (startDate) => api.get('/timecards/employer/weekly-summary', { params: { startDate } }),
  
  // Admin routes
  getAllEntries: (params) => api.get('/timecards/admin/all-entries', { params }),
  getStats: (params) => api.get('/timecards/admin/stats', { params }),
  getMonthlySummary: (params) => api.get('/timecards/admin/monthly-summary', { params })
};

// Client APIs
export const clientAPI = {
  getAll: (params) => api.get('/clients', { params }),
  getActive: () => api.get('/clients/active'),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`)
};

// Hours APIs
export const hoursAPI = {
  getAll: (params) => api.get('/hours', { params }),
  getByDate: (date) => api.get(`/hours/${date}`),
  create: (data) => api.post('/hours', data),
  update: (id, data) => api.put(`/hours/${id}`, data),
  delete: (id) => api.delete(`/hours/${id}`)
};

// Reports APIs
export const reportsAPI = {
  getHoursSummary: (params) => api.get('/reports/hours-summary', { params }),
  getClientActivity: () => api.get('/reports/client-activity'),
  getWeeklySummary: () => api.get('/reports/my-weekly-summary'),
  getMonthlySummary: (params) => api.get('/reports/my-monthly-summary', { params }),
  getMonthlyEmployeeReport: (params) => api.get('/reports/monthly-employee-report', { params }),
  getMonthlyEmployerReport: (params) => api.get('/reports/monthly-employer-report', { params })
};

// Client Logos APIs
export const clientLogosApi = {
  getAll: () => api.get('/client-logos'),
  getAllAdmin: () => api.get('/client-logos/all'),
  getById: (id) => api.get(`/client-logos/${id}`),
  create: (data) => api.post('/client-logos', data),
  update: (id, data) => api.put(`/client-logos/${id}`, data),
  delete: (id) => api.delete(`/client-logos/${id}`)
};

export const jobsApi = {
  // Public routes
  getAll: () => api.get('/jobs'),
  getById: (id) => api.get(`/jobs/${id}`),
  apply: (id, data) => api.post(`/jobs/${id}/apply`, data),
  
  // Admin routes
  getAllAdmin: () => api.get('/jobs/admin/all'),
  create: (data) => api.post('/jobs/admin/create', data),
  update: (id, data) => api.put(`/jobs/admin/${id}`, data),
  delete: (id) => api.delete(`/jobs/admin/${id}`),
  getApplications: (id) => api.get(`/jobs/admin/${id}/applications`),
  getAllApplications: () => api.get('/jobs/admin/applications/all'),
  updateApplicationStatus: (id, status) => api.put(`/jobs/admin/applications/${id}`, { status })
};

// Contact Message APIs
export const contactMessageApi = {
  // Public route
  submit: (data) => api.post('/contact-messages', data),
  
  // Admin routes
  getAll: (params) => api.get('/contact-messages', { params }),
  getById: (id) => api.get(`/contact-messages/${id}`),
  updateStatus: (id, status) => api.put(`/contact-messages/${id}`, { status }),
  delete: (id) => api.delete(`/contact-messages/${id}`)
};

// Invoice APIs (Admin only)
export const invoiceAPI = {
  getAll: (params) => api.get('/invoices', { params }),
  getById: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  delete: (id) => api.delete(`/invoices/${id}`),
  getPending: () => api.get('/invoices/pending/tracker'),
  updateDeductions: (id, data) => api.put(`/invoices/${id}/deductions`, data)
};

// Password Change APIs
export const passwordChangeAPI = {
  // All users
  requestChange: (data) => api.post('/password-change/request', data),
  getMyRequests: () => api.get('/password-change/my-requests'),
  cancelRequest: (id) => api.delete(`/password-change/cancel/${id}`),
  
  // Admin only
  getAllRequests: (params) => api.get('/password-change/requests', { params }),
  approveRequest: (id) => api.put(`/password-change/approve/${id}`),
  rejectRequest: (id, data) => api.put(`/password-change/reject/${id}`, data)
};
