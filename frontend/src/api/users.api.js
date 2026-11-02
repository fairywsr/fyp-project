import { apiClient } from '../lib/apiClient';

export const usersApi = {
  getProfile: async () => {
    const res = await apiClient.get('/users/me');
    return res.data;
  },
  updateProfile: async (data) => {
    const res = await apiClient.patch('/users/me', data);
    return res.data;
  },
  updateAvailability: async (data) => {
    const res = await apiClient.patch('/users/me/availability', data);
    return res.data;
  },
  listUsers: async (params = {}) => {
    const res = await apiClient.get('/users', { params });
    return res.data;
  },
  createUser: async (data) => {
    const res = await apiClient.post('/users', data);
    return res.data;
  },
  updateUser: async (id, data) => {
    const res = await apiClient.patch(`/users/${id}`, data);
    return res.data;
  },
};
