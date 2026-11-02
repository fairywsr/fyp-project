import { apiClient } from '../lib/apiClient';

export const repliesApi = {
  sendOrSaveReply: async (queryId, data) => {
    const res = await apiClient.post(`/query/${queryId}/reply`, data);
    return res.data;
  },
};
