import api from './api';

export const locationService = {
  getAll:      (params)       => api.get('/locations', { params }),
  getBySlug:   (slug)         => api.get(`/locations/slug/${slug}`),
  getById:     (id)           => api.get(`/locations/id/${id}`),
  create:      (data)         => api.post('/locations', data),
  update:      (id, data)     => api.put(`/locations/${id}`, data),
  remove:      (id)           => api.delete(`/locations/${id}`),
  removeImage: (id, publicId) => api.delete(`/locations/${id}/images`, { data: { publicId } }),
  addVideo:    (id, data)     => api.post(`/locations/${id}/videos`, data),
  removeVideo: (id, videoId)  => api.delete(`/locations/${id}/videos/${videoId}`),
};
