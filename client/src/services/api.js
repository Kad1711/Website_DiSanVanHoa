import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
});

// Attach JWT token to every request & bỏ timeout nếu là FormData upload file
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (config.data instanceof FormData) {
    config.timeout = 0; // Không giới hạn timeout khi upload tệp
  }
  return config;
});

// Handle auth errors globally & format friendly error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Let the auth context handle redirect
      window.dispatchEvent(new Event('auth:logout'));
    }

    // Format thông báo lỗi chi tiết, rõ ràng nhất
    const resData = error.response?.data;
    if (resData) {
      if (Array.isArray(resData.errors) && resData.errors.length > 0) {
        resData.message = resData.errors.join(' | ');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
