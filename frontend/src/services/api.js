import axios from 'axios';

/**
 * API Service Configuration
 * Uses Vercel/env vars first so your backend URL is always from Environment Variables.
 *
 * Priority:
 * 1. VITE_API_BASE_URL (set in Vercel → Settings → Environment Variables)
 * 2. VITE_BACKEND_URL + /api
 * 3. Local dev: localhost:8080
 */
const getAPIBaseURL = () => {
  const fromEnv = import.meta.env.VITE_API_BASE_URL;
  if (fromEnv && typeof fromEnv === 'string' && fromEnv.trim()) {
    const u = fromEnv.trim().replace(/\/+$/, '');
    return u.endsWith('/api') ? u : u + '/api';
  }
  const base = import.meta.env.VITE_BACKEND_URL;
  if (base && typeof base === 'string' && base.trim()) {
    return base.trim().replace(/\/$/, '') + '/api';
  }
  if (typeof window !== 'undefined' && (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1'))) {
    return 'http://localhost:8080/api';
  }
  return 'http://localhost:8080/api';
};

/** Backend root URL (no /api) for health checks etc. */
const getBackendRootURL = () => {
  const base = getAPIBaseURL();
  return base.replace(/\/api\/?$/, '') || 'http://localhost:8080';
};

const API_URL = getAPIBaseURL();

const api = axios.create({
  baseURL: API_URL,
  timeout: 3500, // 3.5s timeout for lightning-fast responsiveness
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    'Bypass-Tunnel-Reminder': 'true'
  }
});

// Institutional Scale Configuration: Prevent duplicate state-changing requests (Throttling)
const pendingRequests = new Map();

api.interceptors.request.use(
  (config) => {
    // 1. Throttling for state-changing requests for institutional scale stability
    const isStateChanging = ['post', 'put', 'delete'].includes(config.method?.toLowerCase());
    if (isStateChanging) {
      const requestKey = `${config.method}:${config.url}:${JSON.stringify(config.data || {})}`;
      if (pendingRequests.has(requestKey)) {
        return Promise.reject(new Error('DUPLICATE_REQUEST_THROTTLED'));
      }
      pendingRequests.set(requestKey, true);
      config.__requestKey = requestKey; // Store for cleanup
    }

    // 2. Auth Interceptor logic
    if (config.headers['X-Skip-Interceptor']) {
      delete config.headers['X-Skip-Interceptor'];
      if (config.url && config.url.startsWith('/actuator')) {
        const baseURLRoot = config.baseURL.replace('/api', '');
        config.url = baseURLRoot + config.url;
        config.baseURL = '';
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

// Simple delay helper for retry backoff
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

api.interceptors.response.use(
  (response) => {
    // Cleanup pending requests on success
    if (response.config.__requestKey) {
      pendingRequests.delete(response.config.__requestKey);
    }
    return response;
  },
  async (error) => {
    // Cleanup pending requests on error
    if (error.config && error.config.__requestKey) {
      pendingRequests.delete(error.config.__requestKey);
    }

    // Handle Throttled requests quietly
    if (error.message === 'DUPLICATE_REQUEST_THROTTLED') {
      console.warn('Network: Double-click detected. Request throttled for institutional stability.');
      return new Promise(() => {}); // Return a 'forever pending' promise to silent the UI failure
    }
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
        window.location.hash = '#/login';
      }
      return Promise.reject(error);
    }

    // Basic retry for transient network/5xx errors
    const status = error.response?.status;
    const shouldRetry = !status || (status >= 500 && status < 600);
    const config = error.config || {};

    if (shouldRetry && !isLoginRequest) {
      config.__retryCount = config.__retryCount || 0;
      if (config.__retryCount < 2) {
        config.__retryCount += 1;
        const backoffMs = 250 * config.__retryCount;
        await sleep(backoffMs);
        return api(config);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
export { getAPIBaseURL, getBackendRootURL };
