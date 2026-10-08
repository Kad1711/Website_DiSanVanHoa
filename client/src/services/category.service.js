import api from './api';

export const categoryService = {
  getAll:    (params) => api.get('/categories', { params }),
  getBySlug: (slug)   => api.get(`/categories/slug/${slug}`),
  getById:   (id)     => api.get(`/categories/id/${id}`),
  create:    (data)   => api.post('/categories', data),
  update:    (id, data) => api.put(`/categories/${id}`, data),
  remove:    (id)     => api.delete(`/categories/${id}`),
};
