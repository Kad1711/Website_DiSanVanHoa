import api from './api';

export const adminService = {
  getUsers: (params) => api.get('/users', { params }),
  deleteUser: (id) => api.delete(`/users/${id}`),
};
