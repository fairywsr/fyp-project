import { apiClient } from '../lib/apiClient';

export const notificationsApi = {
  list: async () => {
    const res = await apiClient.get('/notifications');
    return res.data;
  },
  markRead: async (id) => {
    const res = await apiClient.post(`/notifications/${id}/read`);
    return res.data;
  },
  markAllRead: async () => {
    const res = await apiClient.post('/notifications/read-all');
    return res.data;
  },
};

export const announcementsApi = {
  list: async () => {
    const res = await apiClient.get('/announcements');
    return res.data;
  },
  create: async (data) => {
    const res = await apiClient.post('/announcements', data);
    return res.data;
  },
};

export const adminApi = {
  getHodOverview: async () => {
    const res = await apiClient.get('/hod/overview');
    return res.data;
  },
  getAnalytics: async () => {
    const res = await apiClient.get('/admin/analytics');
    return res.data;
  },
  getAuditLogs: async (params = {}) => {
    const res = await apiClient.get('/admin/logs', { params });
    return res.data;
  },
  listRoutingRules: async () => {
    const res = await apiClient.get('/admin/routing-rules');
    return res.data;
  },
  createRoutingRule: async (data) => {
    const res = await apiClient.post('/admin/routing-rules', data);
    return res.data;
  },
  updateRoutingRule: async (id, data) => {
    const res = await apiClient.patch(`/admin/routing-rules/${id}`, data);
    return res.data;
  },
  deleteRoutingRule: async (id) => {
    const res = await apiClient.delete(`/admin/routing-rules/${id}`);
    return res.data;
  },
};

export const reportsApi = {
  exportReport: async (format = 'csv', params = {}) => {
    const res = await apiClient.get('/reports/export', {
      params: { format, ...params },
      responseType: format === 'csv' ? 'blob' : 'json',
    });
    return res.data;
  },
};
