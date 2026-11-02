import { apiClient } from '../lib/apiClient';

export const authApi = {
  loginWithGoogle: async (idToken) => {
    const res = await apiClient.post('/auth/login', { id_token: idToken });
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },
};
