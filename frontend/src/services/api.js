import axios from 'axios';

let API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Force production URL if hosted on Vercel to override stale env vars
if (window.location.hostname.includes('vercel.app')) {
  API_URL = 'https://rit-digital-twin.onrender.com/api';
}

const api = axios.create({
  baseURL: API_URL
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // Bypass Ngrok's free-tier interception page
    config.headers['ngrok-skip-browser-warning'] = '69420';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Don't intercept 401 on the login endpoint — let AuthContext handle it
    const isLoginRequest = error.config && error.config.url && error.config.url.includes('/auth/login');
    if (error.response && error.response.status === 401 && !isLoginRequest) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Trigger Vercel redeploy to pick up new env variable
