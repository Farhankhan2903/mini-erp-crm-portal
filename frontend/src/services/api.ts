import axios from 'axios';

const defaultApiUrl =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? 'https://mini-erp-crm-api.onrender.com/api/v1'
    : 'http://localhost:5001/api/v1');

const api = axios.create({
  baseURL: defaultApiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Bearer token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('minierp_jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 Unauthorized global logout redirect
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('minierp_jwt_token');
      localStorage.removeItem('minierp_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
