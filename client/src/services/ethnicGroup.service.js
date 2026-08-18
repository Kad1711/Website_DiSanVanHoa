import api from './api';

export const ethnicGroupService = {
  getAll:    (params) => api.get('/ethnic-groups', { params }),
  getBySlug: (slug)   => api.get(`/ethnic-groups/slug/${slug}`),
  getById:   (id)     => api.get(`/ethnic-groups/id/${id}`),
  create:    (data)   => api.post('/ethnic-groups', data),        // FormData
  update:    (id, data) => api.put(`/ethnic-groups/${id}`, data), // FormData
  remove:    (id, params) => api.delete(`/ethnic-groups/${id}`, { params }),
};
