import { apiClient } from '../lib/apiClient';

export const queriesApi = {
  submitQuery: async (data) => {
    const res = await apiClient.post('/query', data);
    return res.data;
  },
  getMyQueries: async () => {
    const res = await apiClient.get('/queries/mine');
    return res.data;
  },
  getAssignedQueries: async () => {
    const res = await apiClient.get('/queries/assigned');
    return res.data;
  },
  getAllQueries: async (params = {}) => {
    const res = await apiClient.get('/queries', { params });
    return res.data;
  },
  getQueryDetail: async (id) => {
    const res = await apiClient.get(`/query/${id}`);
    return res.data;
  },
  overrideQuery: async (id, data) => {
    const res = await apiClient.post(`/query/${id}/override`, data);
    return res.data;
  },
  appealQuery: async (id, data) => {
    const res = await apiClient.post(`/query/${id}/appeal`, data);
    return res.data;
  },
  closeQuery: async (id) => {
    const res = await apiClient.post(`/query/${id}/close`);
    return res.data;
  },
};
