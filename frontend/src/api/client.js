import axios from 'axios';

const resolveApiBaseUrl = () => {
  let url = import.meta.env.VITE_API_BASE_URL;
  if (!url) {
    return import.meta.env.PROD ? '/api' : 'http://localhost:8080/api';
  }
  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
    url = `https://${url}`;
  }
  if (!url.endsWith('/api') && !url.endsWith('/api/')) {
    url = `${url.replace(/\/+$/, '')}/api`;
  }
  return url;
};

const API_BASE_URL = resolveApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('campuscash_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('campuscash_token');
      localStorage.removeItem('campuscash_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response?.data?.message || error.message || 'An error occurred');
  }
);

export default api;
