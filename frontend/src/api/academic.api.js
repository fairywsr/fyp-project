import { apiClient } from '../lib/apiClient';

export const departmentsApi = {
  list: async () => {
    const res = await apiClient.get('/departments');
    return res.data;
  },
  create: async (data) => {
    const res = await apiClient.post('/departments', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await apiClient.patch(`/departments/${id}`, data);
    return res.data;
  },
  getCourses: async (id) => {
    const res = await apiClient.get(`/departments/${id}/courses`);
    return res.data;
  },
  getInstructors: async (id) => {
    const res = await apiClient.get(`/departments/${id}/instructors`);
    return res.data;
  },
};

export const coursesApi = {
  list: async (params = {}) => {
    const res = await apiClient.get('/courses', { params });
    return res.data;
  },
  create: async (data) => {
    const res = await apiClient.post('/courses', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await apiClient.patch(`/courses/${id}`, data);
    return res.data;
  },
  assignInstructor: async (id, instructorId) => {
    const res = await apiClient.post(`/courses/${id}/assign-instructor`, { instructor_id: instructorId });
    return res.data;
  },
};
