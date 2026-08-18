import api from './api';

export const workService = {
  getAll:             (params)        => api.get('/works', { params }),
  getBySlug:          (slug)          => api.get(`/works/slug/${slug}`),
  getById:            (id)            => api.get(`/works/id/${id}`),
  create:             (data)          => api.post('/works', data),
  update:             (id, data)      => api.put(`/works/${id}`, data),
  remove:             (id)            => api.delete(`/works/${id}`),
  addVideo:           (id, data)      => api.post(`/works/${id}/videos`, data),
  removeVideo:        (id, videoId)   => api.delete(`/works/${id}/videos/${videoId}`),
  removeGalleryImage: (id, publicId)  => api.delete(`/works/${id}/gallery`, { data: { publicId } }),
  toggleLike:         (id)            => api.post(`/works/${id}/like`),
  addComment:         (id, data)      => api.post(`/works/${id}/comments`, data),
  deleteComment:      (id, commentId) => api.delete(`/works/${id}/comments/${commentId}`),
};
