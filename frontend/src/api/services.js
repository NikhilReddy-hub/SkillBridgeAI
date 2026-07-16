import api from './axiosInstance';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  getMe: () => api.get('/auth/me'),
};

// ─── Student ──────────────────────────────────────────────────────────────────
export const studentAPI = {
  getDashboard: () => api.get('/student/dashboard'),
  getProfile: () => api.get('/student/profile'),
  updateProfile: (data) => api.put('/student/profile', data),
  uploadResume: (formData) => api.post('/student/upload-resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getSkills: (params) => api.get('/student/skills', { params }),
  addSkill: (data) => api.post('/student/skills', data),
  bulkAddSkills: (skills) => api.post('/student/skills/bulk', { skills }),
  updateSkill: (id, data) => api.put(`/student/skills/${id}`, data),
  deleteSkill: (id) => api.delete(`/student/skills/${id}`),
  getSkillReport: () => api.get('/student/skill-report'),
  getProgress: () => api.get('/student/progress'),
  updateProgress: (data) => api.put('/student/progress', data),
};

// ─── AI ───────────────────────────────────────────────────────────────────────
export const aiAPI = {
  analyzeSkills: () => api.post('/ai/analyze-skills'),
  generateRoadmap: () => api.post('/ai/generate-roadmap'),
  chat: (message, sessionId) => api.post('/ai/chat', { message, sessionId }),
  getChatSessions: () => api.get('/ai/chat/sessions'),
  getChatSession: (sessionId) => api.get(`/ai/chat/sessions/${sessionId}`),
  getInterviewTips: () => api.get('/ai/interview-tips'),
  reviewResume: () => api.post('/ai/resume-review'),
};

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminAPI = {
  getAnalytics: () => api.get('/admin/analytics'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getSkills: (params) => api.get('/admin/skills', { params }),
  createSkill: (data) => api.post('/admin/skills', data),
  updateSkill: (id, data) => api.put(`/admin/skills/${id}`, data),
  deleteSkill: (id) => api.delete(`/admin/skills/${id}`),
  getJobRoles: () => api.get('/admin/job-roles'),
  createJobRole: (data) => api.post('/admin/job-roles', data),
  updateJobRole: (id, data) => api.put(`/admin/job-roles/${id}`, data),
  deleteJobRole: (id) => api.delete(`/admin/job-roles/${id}`),
  getResources: (params) => api.get('/admin/resources', { params }),
  createResource: (data) => api.post('/admin/resources', data),
  approveResource: (id) => api.put(`/admin/resources/${id}/approve`),
  deleteResource: (id) => api.delete(`/admin/resources/${id}`),
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

// ─── Search ───────────────────────────────────────────────────────────────────
export const searchAPI = {
  search: (q, params) => api.get('/search', { params: { q, ...params } }),
};

export default api;
