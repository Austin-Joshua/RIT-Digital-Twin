import axios from 'axios';

/**
 * API Service Configuration
 * Handles both local development and Vercel production environments
 * 
 * Priority:
 * 1. VITE_API_BASE_URL environment variable (set in .env.local or .env.production)
 * 2. Window location detection for Vercel (*.vercel.app)
 * 3. Default localhost for development
 */
const getAPIBaseURL = () => {
  // Explicit API URL (Vercel env or .env.production)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // Single backend base URL: derive /api and /ws (e.g. VITE_BACKEND_URL for ngrok)
  const base = import.meta.env.VITE_BACKEND_URL;
  if (base) {
    const url = base.replace(/\/$/, '');
    return `${url}/api`;
  }

  // Detect if running on Vercel or localhost
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      return 'http://localhost:8080/api';
    }
    if (host.includes('vercel.app')) {
      console.warn('[API] Set VITE_API_BASE_URL or VITE_BACKEND_URL in Vercel → Settings → Environment Variables');
      return 'http://localhost:8080/api';
    }
  }

  return 'http://localhost:8080/api';
};

/** Backend root URL (no /api) for health checks etc. */
const getBackendRootURL = () => {
  const base = getAPIBaseURL();
  return base.replace(/\/api\/?$/, '') || 'http://localhost:8080';
};

const API_URL = getAPIBaseURL();

console.log(`[API Service] Using API endpoint: ${API_URL}`); // Debug logging

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    'Bypass-Tunnel-Reminder': 'true'
  }
});

// Request interceptor: Add JWT token
api.interceptors.request.use(
  (config) => {
    // Allow skipping the interceptor for health checks or other public pings
    if (config.headers['X-Skip-Interceptor']) {
      delete config.headers['X-Skip-Interceptor']; // Clean up

      // If hitting actuator, we need to bypass the /api prefix from baseURL
      if (config.url && config.url.startsWith('/actuator')) {
        config.url = config.url.replace('/actuator', '/actuator'); // Keep as is, but ensure no /api/actuator
        // Axios uses baseURL + url. If baseURL has /api, we might need a different approach.
        // For simplicity, let's just make it an absolute URL if it starts with /actuator
        const baseURLRoot = config.baseURL.replace('/api', '');
        config.url = baseURLRoot + config.url;
        config.baseURL = ''; // Wipe baseURL for this request to use absolute URL
      }
      return config;
    }

    const token = localStorage.getItem('token') || localStorage.getItem('rit_dt_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle authentication errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Don't intercept 401 on the login endpoint — let AuthContext handle it
    const isLoginRequest = error.config && error.config.url && error.config.url.includes('/auth/login');
    if (error.response && error.response.status === 401 && !isLoginRequest) {
      // Clear tokens and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('rit_dt_token');
      localStorage.removeItem('rit_dt_user');

      // Only redirect if we're in a browser environment
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { getAPIBaseURL, getBackendRootURL };
