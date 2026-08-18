import api from './api';

export const userService = {
  getAll:  (params) => api.get('/users', { params }),
  getById: (id)     => api.get(`/users/${id}`),
  remove:  (id)     => api.delete(`/users/${id}`),
};
