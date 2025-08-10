import { getCookie } from '@/helpers/cookie.helper';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BE_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window === 'undefined') return config;
  
  // Get session token from cookie
  const token = getCookie('__session');
  
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
    config.headers['Content-Type'] = 'application/json';
    config.headers['accept'] = '*/*';
  }
  
  // Send timezone to server via header
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  config.headers = config.headers || {};
  config.headers['X-Timezone'] = timezone;
  
  return config;
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.config?.url, error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default api;